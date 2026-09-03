# PO Backlog MVP Runbook

## Scope

Implement and verify the Purchase Order backlog only:

- PO list page
- PO creation from approved PR lines
- PO detail page
- PO API integration
- PO submission flow
- Allocation and status-transition tests

The PO backend and database schema are already implemented. The frontend is the primary implementation backlog.

Explicitly out of scope for this sprint:

- Goods Receipt pages or APIs
- Dashboard PO analytics
- PR linked-PO/GR fulfillment tracking
- Draft PO edit/delete
- PO cancellation
- Vendor master data
- Enterprise workflow, notifications, or compliance features

## API Contract

The existing backend provides:

- `GET /api/purchase-orders`
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/submit`
- `GET /api/purchase-orders/:id`
- `GET /api/purchase-orders/:id/open-lines`

PO creation accepts a free-text `vendorName` and one or more lines containing:

- `prLineId`
- `itemCode`
- `itemName`
- `qtyOrdered`
- `unitPrice`
- `uom`
- `siteCode`
- optional `requiredDate`

The backend remains authoritative for:

- PR status must be `APPROVED`
- allocation quantity must not exceed PR line remaining quantity
- PO status transition must be `DRAFT -> SUBMITTED`
- concurrent allocation protection through row locking

## Strict Task Sequence

### 0. Baseline Gate

1. Start PostgreSQL and initialize the supplied migration and seed data.
2. Confirm the seeded approved PR and submitted PO are available through the API.
3. Run the backend unit tests:

   ```bash
   npm run test:backend
   ```

4. Verify the PO API response and error shapes for list, create, detail, open-lines, submit, over-allocation, and non-approved PR allocation.

**Checkpoint 0:** The database is reachable, baseline backend tests pass, and the PO API contract is known. If this fails, repair the backend or environment before starting UI work.

### 1. Frontend API and Routing

5. Add these methods to `frontend/src/api.js`:
   - `listPurchaseOrders`
   - `createPurchaseOrder`
   - `getPurchaseOrder`
   - `submitPurchaseOrder`
   - `getOpenPoLines`
6. Add these routes to `frontend/src/router/index.js`:
   - `/purchase-orders`
   - `/purchase-orders/new`
   - `/purchase-orders/:id`
7. Add the Purchase Orders navigation link and active state to `frontend/src/App.vue`.

**Checkpoint 1:** Build the frontend:

```bash
npm --prefix frontend run build
```

The build passes and all three PO paths resolve without module or router errors.

### 2. PO List and Detail Read Flows

8. Create `frontend/src/pages/PurchaseOrderListPage.vue` using the requisition list page as the template.
   - Load POs on mount.
   - Display PO number, vendor, status, and creation date.
   - Link each row to detail.
   - Include a New PO action.
   - Display an empty state and API errors.
9. Create `frontend/src/pages/PurchaseOrderDetailPage.vue` using the requisition detail page as the template.
   - Display PO header, vendor, status, and lines.
   - Display ordered, received, and open quantities.
   - Display unit price and PR allocation sources.
   - Show Submit PO only when status is `DRAFT`.
   - Refresh the detail after submission.
   - Handle not-found and API errors.

**Checkpoint 2:** Build and smoke-test the running app:

```bash
npm --prefix frontend run build
```

The seeded PO appears in the list and detail pages. A submitted PO does not show an enabled submit action.

### 3. PO Creation from Approved PR Lines

10. Create `frontend/src/pages/PurchaseOrderCreatePage.vue` using the existing form and table conventions.
11. Require a vendor name.
12. Load available approved PR open lines.
13. Allow one or more PR lines to be selected.
14. Default each selected allocation to its displayed open quantity.
15. Allow only positive quantities no greater than the displayed remaining quantity.
16. Submit the required PO payload, including the PR line id and copied item fields.
17. Treat the backend as the validation authority for stale quantities and concurrency conflicts.
18. On success, navigate to the new PO detail page.
19. Show backend validation errors and allow the user to retry.

**Checkpoint 3:** Complete this journey manually:

```text
Approved PR -> New PO -> select PR line -> create PO -> PO detail
```

Verify that non-approved or unavailable lines cannot be selected, invalid quantities are blocked, and an API over-allocation error is visible.

### 4. Focused Tests and Integration Proof

20. Extend `backend/tests/services/purchase-order-service.test.js` only for uncovered behavior:
   - `DRAFT -> SUBMITTED`
   - reject resubmission of a `SUBMITTED` PO
   - not-found submit behavior
   - route response/error mapping if needed
21. Preserve existing tests for payload validation, over-allocation, exact remaining quantity, missing PR lines, and PR status rejection.
22. Add a Playwright test under `tests/e2e/` covering:
   - PO creation from approved PR data
   - PO detail showing `DRAFT`
   - PO submission
   - PO detail showing `SUBMITTED`
   - submit control absent or disabled afterward
23. Add a narrow frontend unit test only if it fits the existing Vitest setup; do not add another test framework.

**Checkpoint 4:** Run all project checks:

```bash
npm run test:backend
npm run test:frontend
npm --prefix frontend run build
npm run test:e2e
```

Run E2E against a clean database seed when tests depend on mutable PO data.

### 5. Final Scope Review

24. Confirm list, create, and detail navigation works from the navbar and page actions.
25. Confirm API errors are readable and do not leave stale loading states.
26. Check table and form layout at desktop and mobile widths.
27. Update `docs/plan.md` to include the PO list endpoint and the explicit sprint exclusions.
28. Confirm no GR or unrelated workflow code was added.

**Checkpoint 5:** PO list, create, detail, submit, and open-lines behavior are verified; allocation and status rules are tested; all required checks pass; scope remains limited to the PO backlog.

## Relevant Files

- `backend/src/services/purchase-order-service.js` - existing PO business rules and response mapping
- `backend/src/routes/purchase-order-routes.js` - existing PO REST endpoints
- `backend/tests/services/purchase-order-service.test.js` - existing PO service tests
- `frontend/src/api.js` - PO API wrappers
- `frontend/src/router/index.js` - PO routes
- `frontend/src/App.vue` - navigation and active state
- `frontend/src/pages/PurchaseOrderListPage.vue` - new PO list page
- `frontend/src/pages/PurchaseOrderCreatePage.vue` - new PO creation page
- `frontend/src/pages/PurchaseOrderDetailPage.vue` - new PO detail page
- `frontend/src/pages/RequisitionListPage.vue` - list page implementation pattern
- `frontend/src/pages/RequisitionDetailPage.vue` - detail page implementation pattern
- `tests/e2e/` - PO journey coverage
- `docs/plan.md` - corrected scope and API inventory

## MVP Decisions

- Vendor remains free text.
- PO creation starts from approved PR open lines.
- The backend owns allocation and concurrency validation.
- `requiredDate` is optional and may be null.
- Draft PO editing and deletion are not required for this sprint.
