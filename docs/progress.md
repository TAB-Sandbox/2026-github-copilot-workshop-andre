# Project Progress

Updated: 2026-09-03

## Current State

This repository contains a procurement MVP workshop application built with:

- Fastify 5 and JavaScript for the REST backend
- PostgreSQL 16 in Docker for persistence
- Vue 3, Vite, and Vue Router for the frontend
- Jest for backend and frontend unit tests
- Playwright configuration for end-to-end tests

The database migration and seed data are available under `db/`. The baseline dashboard and Purchase Requisition (PR) module are implemented, including PR list, create, detail, submit, approve, and open-line flows.

The Purchase Order (PO) backend and frontend are implemented. The frontend integrates PO creation with approved PR open-line data and the PO create/submit endpoints, plus API-backed PO list and detail pages.

The Goods Receipt (GR) backend and frontend are also implemented. Users can create and post receipts against submitted POs.

## Implemented PO Backend

PO behavior is owned by `backend/src/services/purchase-order-service.js` and exposed by `backend/src/routes/purchase-order-routes.js`.

### Available Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/purchase-orders` | Return PO headers ordered by newest creation date |
| `POST` | `/api/purchase-orders` | Create a draft PO from one or more approved PR lines |
| `POST` | `/api/purchase-orders/:id/submit` | Submit a draft PO |
| `GET` | `/api/purchase-orders/:id` | Return a PO header, lines, quantities, and PR allocation sources |
| `GET` | `/api/purchase-orders/:id/open-lines` | Return PO lines with quantity still open for receipt |

### PO Create Contract

The request body requires a non-empty `vendorName` and at least one line. Each line requires:

- `prLineId`
- `itemCode`
- `itemName`
- `qtyOrdered` greater than zero
- `uom`
- `siteCode`

`unitPrice` must be zero or greater. `requiredDate` is optional.

The service creates the PO in `DRAFT` status, creates PO lines and PR-to-PO allocation records, and increments the source PR line allocation quantity in one database transaction.

### Business Rules

- A source PR must have status `APPROVED`.
- A requested allocation cannot exceed the PR line's remaining quantity.
- PR line rows are locked during PO creation to protect against concurrent over-allocation.
- Only a `DRAFT` PO can transition to `SUBMITTED`.
- Missing PO and PR line resources return readable `404` or `422` responses from the routes.

## Implemented PO Frontend

- `/purchase-orders/new` is registered in the Vue router.
- `/purchase-orders` and `/purchase-orders/:id` are registered in the Vue router.
- The application navigation includes a Purchase Orders link.
- `PurchaseOrderListPage.vue` loads and displays PO headers with links to detail pages.
- `PurchaseOrderDetailPage.vue` displays PO lines, receipt-open quantities, PR allocations, and draft submission.
- `PurchaseOrderCreatePage.vue` loads approved PR lines, supports selection and quantity limits, and captures vendor, delivery, site, price, and draft details.
- `PurchaseOrderHeaderForm.vue` is a controlled reusable header form.
- `PurchaseOrderLineAllocationTable.vue` is a controlled reusable allocation table using props-down/events-up updates.
- The create page loads open lines from approved requisitions and maps them into the generated allocation table.
- Save As Draft calls `POST /api/purchase-orders` and keeps the created PO in `DRAFT` status.
- Submit PO calls the create endpoint and then `POST /api/purchase-orders/:id/submit`.
- Backend validation errors, including over-allocation 422 responses, are displayed on the page.

## Implemented GR Backend

GR behavior is owned by `backend/src/services/goods-receipt-service.js` and exposed by `backend/src/routes/goods-receipt-routes.js`.

### Available Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/goods-receipts` | Return goods receipt headers |
| `POST` | `/api/goods-receipts` | Create a draft receipt from open lines on a submitted PO |
| `GET` | `/api/goods-receipts/:id` | Return a receipt with its lines and PO information |
| `POST` | `/api/goods-receipts/:id/post` | Post a draft receipt and update received quantities |

### Business Rules

- A receipt can only be created against a `SUBMITTED` PO.
- Receipt quantities must be positive and cannot exceed the PO line's open quantity.
- Each receipt line requires an actual site code.
- Only a `DRAFT` receipt can transition to `POSTED`.
- Posting updates the received quantity on the related PO line.

## Implemented GR Frontend

- `/goods-receipts`, `/goods-receipts/new`, and `/goods-receipts/:id` are registered in the Vue router.
- The application navigation includes a Goods Receipts link.
- `GoodsReceiptListPage.vue` lists receipts and links to detail pages.
- `GoodsReceiptCreatePage.vue` loads open lines from a submitted PO and creates a draft receipt.
- `GoodsReceiptDetailPage.vue` displays receipt lines and posts a draft receipt.
- Purchase order detail provides the entry point to receive goods from open PO lines.

## Documentation and Graph

- `docs/application-overview.md` documents the current architecture, user flow, API sequence, and scope boundaries with Mermaid diagrams.
- `graphify-out/` contains the refreshed repository graph, report, and interactive visualization.

## Verification

The latest unit-test runs completed successfully:

- Backend: 4 suites, 34 tests passed
- Frontend: 3 suites, 14 tests passed
- Frontend Vite production build passed
- Backend coverage: 48.35% statements, 39.83% branches, 51.21% functions, 47.94% lines
- Frontend coverage: 68.08% statements, 41% branches, 47.82% functions, 77.35% lines
- PO backend service coverage: 98.93% statements, 95.74% branches, 100% functions, 98.88% lines

The tests cover PO payload validation, approved-line allocation rules, over-allocation protection, status transitions, list ordering, empty results, and open-line filtering. GR service tests cover receipt validation, submitted-PO requirements, open-quantity protection, posting, and status transitions. Frontend tests cover PO form rendering, approved PR line loading, required vendor behavior, allocation-table rendering, disabled quantities, editable fields, draft creation, submit-after-create, totals, and API error feedback.

Playwright specs are present for the PO creation/submission journey and the GR creation/posting journey. The latest unit-test run passed; E2E execution still depends on the configured application and database environment.

## Remaining Work

1. Run the Playwright PO and GR journeys against a clean database seed and record the result.

## Explicitly Out Of Scope

- PO cancellation, editing, and deletion
- Vendor master data
- Dashboard PO analytics
- Enterprise workflow, notifications, SSO, reporting, and advanced compliance