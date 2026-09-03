## 1. Backend Goods Receipt API

- [x] 1.1 Add goods receipt service mappers, list/detail queries, and number generation using the existing `goods_receipts` and `gr_lines` tables; verify returned payloads include receipt header, linked PO, lines, and open quantities.
- [x] 1.2 Implement draft receipt creation with payload validation, submitted-PO validation, PO-line ownership checks, positive quantities, actual site codes, and open-quantity checks; verify invalid requests return readable 422 responses and create no rows.
- [x] 1.3 Implement receipt posting in one transaction with row locks, revalidation of receipt/PO status and current open quantities, PO and source PR received-quantity updates, and idempotent status transition; verify a failed post changes neither quantities nor receipt status.
- [x] 1.4 Add goods receipt routes for list, create, detail, and post endpoints and register them in the Fastify app; verify route tests cover 201, 200, 404, and 422 responses.
- [x] 1.5 Add goods receipt methods to `frontend/src/api.js`; verify the API wrapper sends the expected HTTP methods, paths, and JSON payloads.

## 2. Frontend Receiving Workflow

- [x] 2.1 Add goods receipt list, create, and detail Vue pages following existing PR/PO layout and CSS variable conventions; verify loading, empty, success, and readable error states render without stuck actions.
- [x] 2.2 Add `/goods-receipts`, `/goods-receipts/new`, and `/goods-receipts/:id` routes and dashboard/navigation links; verify each route resolves and the list can open a receipt detail.
- [x] 2.3 Implement PO-to-GR handoff using submitted PO open lines, line selection, receipt quantities, receipt date, notes, and actual site code; verify a valid draft can be created and its detail page opens.
- [x] 2.4 Add draft receipt posting from the detail page and refresh displayed quantities/status after success; verify posted receipts no longer offer the post action and open PO quantities decrease.
- [x] 2.5 Add the PO detail action to start receiving only when the PO is submitted and has open lines; verify the action is unavailable for draft or fully received POs.

## 3. Automated Verification

- [x] 3.1 Add Jest service tests for submitted-PO enforcement, missing/invalid lines, over-receiving, successful posting, atomic rollback, and repeated-post rejection; verify the focused backend test command passes.
- [x] 3.2 Add Playwright coverage for opening a submitted seeded PO, creating a draft receipt, posting it, and observing updated open quantities; verify the focused GR E2E test passes against the local database.
- [x] 3.3 Run the existing backend and frontend test suites plus OpenSpec validation; verify no existing PR/PO tests regress and `openspec validate --change goods-receipts-module --strict` passes.
