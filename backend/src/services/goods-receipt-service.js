import { v4 as uuidv4 } from 'uuid';

function mapHeader(row) {
  return {
    id: row.id,
    grNumber: row.gr_number,
    status: row.status,
    receiptDate: row.receipt_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    purchaseOrder: row.po_id ? {
      id: row.po_id,
      poNumber: row.po_number,
      vendorName: row.vendor_name,
      status: row.po_status,
    } : null,
  };
}

function mapLine(row) {
  return {
    id: row.id,
    lineNo: row.line_no,
    poLineId: row.po_line_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    qtyReceived: Number(row.qty_received),
    qtyOrdered: Number(row.qty_ordered),
    poQtyReceived: Number(row.po_qty_received),
    qtyOpenForGr: Number(row.qty_ordered) - Number(row.po_qty_received),
    actualSiteCode: row.actual_site_code,
    uom: row.uom,
  };
}

function createGrNumber(count) {
  return `GR-2026-${String(Number(count) + 1).padStart(4, '0')}`;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 422;
  return error;
}

function validateCreatePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Body is required';
  if (!payload.poId) return 'poId is required';
  if (!Array.isArray(payload.lines) || payload.lines.length === 0) {
    return 'lines must contain at least one item';
  }

  for (let index = 0; index < payload.lines.length; index++) {
    const line = payload.lines[index];
    if (!line.poLineId) return `lines[${index}].poLineId is required`;
    if (!Number(line.qtyReceived) || Number(line.qtyReceived) <= 0) {
      return `lines[${index}].qtyReceived must be greater than 0`;
    }
    if (!line.actualSiteCode || typeof line.actualSiteCode !== 'string' || !line.actualSiteCode.trim()) {
      return `lines[${index}].actualSiteCode is required`;
    }
  }

  return null;
}

const detailHeaderQuery = `
  SELECT gr.id, gr.gr_number, gr.status, gr.receipt_date, gr.notes,
         gr.created_at, gr.updated_at, gr.po_id,
         po.po_number, po.vendor_name, po.status AS po_status
  FROM goods_receipts gr
  JOIN purchase_orders po ON po.id = gr.po_id
  WHERE gr.id = $1`;

const detailLinesQuery = `
  SELECT gl.id, gl.line_no, gl.po_line_id, gl.qty_received,
         gl.actual_site_code, pl.item_code, pl.item_name, pl.qty_ordered,
         pl.qty_received AS po_qty_received, pl.uom
  FROM gr_lines gl
  JOIN po_lines pl ON pl.id = gl.po_line_id
  WHERE gl.gr_id = $1
  ORDER BY gl.line_no ASC`;

export async function listGoodsReceipts(db) {
  const { rows } = await db.query(`
    SELECT gr.id, gr.gr_number, gr.status, gr.receipt_date, gr.notes,
           gr.created_at, gr.updated_at, gr.po_id,
           po.po_number, po.vendor_name, po.status AS po_status
    FROM goods_receipts gr
    JOIN purchase_orders po ON po.id = gr.po_id
    ORDER BY gr.created_at DESC
  `);
  return rows.map(mapHeader);
}

export async function getGoodsReceiptById(db, id) {
  const headerResult = await db.query(detailHeaderQuery, [id]);
  if (headerResult.rowCount === 0) return null;

  const linesResult = await db.query(detailLinesQuery, [id]);
  return { ...mapHeader(headerResult.rows[0]), lines: linesResult.rows.map(mapLine) };
}

export async function createGoodsReceipt(db, payload) {
  const message = validateCreatePayload(payload);
  if (message) throw validationError(message);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const poResult = await client.query(
      `SELECT id, status FROM purchase_orders WHERE id = $1 FOR UPDATE`,
      [payload.poId]
    );
    if (poResult.rowCount === 0) throw validationError('Purchase order not found');
    if (poResult.rows[0].status !== 'SUBMITTED') {
      throw validationError('Purchase order must be SUBMITTED before receiving');
    }

    const seenLines = new Set();
    for (let index = 0; index < payload.lines.length; index++) {
      const line = payload.lines[index];
      if (seenLines.has(line.poLineId)) {
        throw validationError(`lines[${index}]: duplicate PO line`);
      }
      seenLines.add(line.poLineId);

      const lineResult = await client.query(
        `SELECT id, qty_ordered, qty_received FROM po_lines
         WHERE id = $1 AND po_id = $2 FOR UPDATE`,
        [line.poLineId, payload.poId]
      );
      if (lineResult.rowCount === 0) throw validationError(`lines[${index}]: PO line not found for purchase order`);

      const row = lineResult.rows[0];
      const openQuantity = Number(row.qty_ordered) - Number(row.qty_received);
      if (Number(line.qtyReceived) > openQuantity) {
        throw validationError(`lines[${index}]: receipt qty ${line.qtyReceived} exceeds open qty ${openQuantity}`);
      }
    }

    const countResult = await client.query(`SELECT COUNT(*)::int AS total FROM goods_receipts`);
    const grId = uuidv4();
    await client.query(
      `INSERT INTO goods_receipts (id, gr_number, po_id, status, receipt_date, notes)
       VALUES ($1, $2, $3, 'DRAFT', $4, $5)`,
      [grId, createGrNumber(countResult.rows[0].total), payload.poId, payload.receiptDate || null, payload.notes || null]
    );

    for (let index = 0; index < payload.lines.length; index++) {
      const line = payload.lines[index];
      await client.query(
        `INSERT INTO gr_lines (id, gr_id, po_line_id, line_no, qty_received, actual_site_code)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), grId, line.poLineId, index + 1, Number(line.qtyReceived), line.actualSiteCode.trim()]
      );
    }

    await client.query('COMMIT');
    return getGoodsReceiptById(db, grId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function postGoodsReceipt(db, id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const receiptResult = await client.query(
      `SELECT gr.id, gr.status, gr.po_id, po.status AS po_status
       FROM goods_receipts gr
       JOIN purchase_orders po ON po.id = gr.po_id
       WHERE gr.id = $1 FOR UPDATE`,
      [id]
    );
    if (receiptResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const receipt = receiptResult.rows[0];
    if (receipt.status !== 'DRAFT') throw validationError('Only DRAFT goods receipt can be posted');
    if (receipt.po_status !== 'SUBMITTED') throw validationError('Purchase order must be SUBMITTED before posting receipt');

    const linesResult = await client.query(
      `SELECT gl.id, gl.po_line_id, gl.qty_received, pl.qty_ordered, pl.qty_received AS po_qty_received
       FROM gr_lines gl
       JOIN po_lines pl ON pl.id = gl.po_line_id
       WHERE gl.gr_id = $1
       FOR UPDATE OF pl`,
      [id]
    );

    for (const line of linesResult.rows) {
      const openQuantity = Number(line.qty_ordered) - Number(line.po_qty_received);
      if (Number(line.qty_received) > openQuantity) {
        throw validationError(`PO line ${line.po_line_id}: receipt qty ${line.qty_received} exceeds open qty ${openQuantity}`);
      }

      const allocationResult = await client.query(
        `SELECT pr_line_id, allocated_qty FROM pr_line_allocations
         WHERE po_line_id = $1 FOR UPDATE`,
        [line.po_line_id]
      );
      if (allocationResult.rowCount !== 1) {
        throw validationError(`PO line ${line.po_line_id}: receipt source allocation is ambiguous or missing`);
      }

      await client.query(
        `UPDATE po_lines SET qty_received = qty_received + $1, updated_at = NOW() WHERE id = $2`,
        [line.qty_received, line.po_line_id]
      );
      await client.query(
        `UPDATE pr_lines SET qty_received = qty_received + $1, updated_at = NOW() WHERE id = $2`,
        [line.qty_received, allocationResult.rows[0].pr_line_id]
      );
    }

    await client.query(
      `UPDATE goods_receipts SET status = 'POSTED', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query('COMMIT');
    return getGoodsReceiptById(db, id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
