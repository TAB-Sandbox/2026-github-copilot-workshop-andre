## Why

The application currently ends after purchase order submission, leaving delivered goods outside the procurement workflow even though the database already models goods receipts. Adding the GR step now completes the MVP flow from approved requisition through receiving and makes PO open quantities actionable.

## What Changes

- Add a goods receipt capability for receiving items against submitted purchase orders.
- Add GR list, create, and detail pages, with navigation from the existing PO workflow.
- Add REST endpoints to create a draft receipt, post it, retrieve its details, and expose receipt records for the list page.
- Validate that receipts reference eligible PO lines and do not exceed quantities still open for receiving.
- On posting, update PO and PR fulfillment quantities atomically and prevent a receipt from being posted more than once.
- Add focused Jest service tests and Playwright coverage for the receipt flow and validation errors.

## Capabilities

### New Capabilities

- `goods-receipts`: Create and post goods receipts from submitted purchase order lines, track received quantities, and expose receipt details.

### Modified Capabilities

None.

## Impact

- Backend: add goods receipt service and routes, register them in the Fastify app, and extend the API wrapper.
- Frontend: add GR list/create/detail pages and routes, and link receiving from PO detail and dashboard navigation while preserving existing UI variables and patterns.
- Database: use the existing `goods_receipts` and `gr_lines` tables; no schema migration is expected for the MVP behavior.
- Tests: add backend validation tests and end-to-end coverage using the existing PostgreSQL seed and PO flow.
