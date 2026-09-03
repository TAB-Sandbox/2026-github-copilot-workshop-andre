import { describe, expect, jest, test } from '@jest/globals';
import {
  createGoodsReceipt,
  postGoodsReceipt,
} from '../../src/services/goods-receipt-service.js';

function payload(overrides = {}) {
  return {
    poId: 'po-1',
    receiptDate: '2026-09-03',
    lines: [{ poLineId: 'po-line-1', qtyReceived: 2, actualSiteCode: 'WH-JKT' }],
    ...overrides,
  };
}

function mockDb(clientQuery, detailQuery = () => ({ rows: [], rowCount: 0 })) {
  const client = { query: jest.fn(clientQuery), release: jest.fn() };
  return {
    pool: { connect: jest.fn(() => Promise.resolve(client)) },
    query: jest.fn(detailQuery),
    client,
  };
}

test('rejects invalid receipt payload before opening a transaction', async () => {
  const db = mockDb(() => ({ rows: [], rowCount: 0 }));
  await expect(createGoodsReceipt(db, payload({ lines: [{ poLineId: 'po-line-1', qtyReceived: 0 }] })))
    .rejects.toMatchObject({ statusCode: 422, message: 'lines[0].qtyReceived must be greater than 0' });
  expect(db.pool.connect).not.toHaveBeenCalled();
});

test('rejects receipt creation for a non-submitted PO and rolls back', async () => {
  const db = mockDb((sql) => {
    if (sql === 'BEGIN' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
    return { rows: [{ id: 'po-1', status: 'DRAFT' }], rowCount: 1 };
  });
  await expect(createGoodsReceipt(db, payload()))
    .rejects.toMatchObject({ statusCode: 422, message: 'Purchase order must be SUBMITTED before receiving' });
  expect(db.client.query).toHaveBeenCalledWith('ROLLBACK');
});

test('rejects a line that exceeds current open quantity without inserts', async () => {
  const db = mockDb((sql) => {
    if (sql === 'BEGIN' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
    if (sql.includes('purchase_orders')) return { rows: [{ id: 'po-1', status: 'SUBMITTED' }], rowCount: 1 };
    return { rows: [{ id: 'po-line-1', qty_ordered: 5, qty_received: 4 }], rowCount: 1 };
  });
  await expect(createGoodsReceipt(db, payload()))
    .rejects.toMatchObject({ statusCode: 422, message: 'lines[0]: receipt qty 2 exceeds open qty 1' });
  expect(db.client.query.mock.calls.some(([sql]) => sql.startsWith('INSERT'))).toBe(false);
});

test('posts a draft receipt and updates PO and source PR quantities', async () => {
  const db = mockDb((sql) => {
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
    if (sql.includes('goods_receipts gr')) return { rows: [{ id: 'gr-1', status: 'DRAFT', po_id: 'po-1', po_status: 'SUBMITTED' }], rowCount: 1 };
    if (sql.includes('FROM gr_lines')) return { rows: [{ po_line_id: 'po-line-1', qty_received: 2, qty_ordered: 5, po_qty_received: 1 }], rowCount: 1 };
    if (sql.includes('pr_line_allocations')) return { rows: [{ pr_line_id: 'pr-line-1', allocated_qty: 5 }], rowCount: 1 };
    return { rows: [], rowCount: 1 };
  }, (sql) => {
    if (sql.includes('goods_receipts gr')) return { rows: [{ id: 'gr-1', gr_number: 'GR-2026-0001', status: 'POSTED', po_id: 'po-1', po_number: 'PO-2026-0001', vendor_name: 'Vendor', po_status: 'SUBMITTED' }], rowCount: 1 };
    if (sql.includes('FROM gr_lines')) return { rows: [], rowCount: 0 };
    return { rows: [], rowCount: 0 };
  });

  const result = await postGoodsReceipt(db, 'gr-1');
  expect(result.status).toBe('POSTED');
  expect(db.client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE po_lines'), [2, 'po-line-1']);
  expect(db.client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE pr_lines'), [2, 'pr-line-1']);
  expect(db.client.query).toHaveBeenCalledWith('COMMIT');
});

test('rejects repeated posting without quantity updates', async () => {
  const db = mockDb((sql) => {
    if (sql === 'BEGIN' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
    if (sql.includes('goods_receipts gr')) return { rows: [{ id: 'gr-1', status: 'POSTED', po_id: 'po-1', po_status: 'SUBMITTED' }], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  });
  await expect(postGoodsReceipt(db, 'gr-1'))
    .rejects.toMatchObject({ statusCode: 422, message: 'Only DRAFT goods receipt can be posted' });
  expect(db.client.query.mock.calls.some(([sql]) => sql.includes('UPDATE po_lines'))).toBe(false);
});
