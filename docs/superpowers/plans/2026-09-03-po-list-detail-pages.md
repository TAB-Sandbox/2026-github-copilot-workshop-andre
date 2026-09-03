# PO List And Detail Pages Implementation Plan

> **For agentic workers:** Execute this plan inline with focused validation after each implementation slice.

**Goal:** Complete the Vue PO module list and detail pages using the existing REST API and design patterns.

**Architecture:** Add two route-level Vue pages that own loading, error, and submission state while reusing the existing app shell, card, table, status badge, button, and router-link patterns. The API wrapper already exposes PO list, detail, submit, and open-line methods.

**Tech Stack:** Vue 3 Composition API, Vue Router, Jest, Vue Test Utils, Vite.

---

### Task 1: Add focused page tests

**Files:**
- Create: `frontend/tests/PurchaseOrderListPage.test.js`
- Create: `frontend/tests/PurchaseOrderDetailPage.test.js`

- [x] Test list rendering, empty state, and API error display.
- [x] Test detail rendering, line quantities and allocation sources, draft submit action, and API error display.
- [x] Run both focused test files and confirm failures identify the missing pages.

### Task 2: Implement PO list page

**Files:**
- Create: `frontend/src/pages/PurchaseOrderListPage.vue`

- [x] Load `api.listPurchaseOrders()` in `onMounted`.
- [x] Render PO number links, vendor, status, and creation date.
- [x] Render loading, empty, and error states using existing classes.
- [x] Add a `New PO` link to `/purchase-orders/new`.

### Task 3: Implement PO detail page

**Files:**
- Create: `frontend/src/pages/PurchaseOrderDetailPage.vue`

- [x] Load `api.getPurchaseOrder(route.params.id)` in `onMounted`.
- [x] Render header, vendor, status, lines, ordered/received/open quantities, prices, and PR allocation sources.
- [x] Show submit only for `DRAFT`, call `api.submitPurchaseOrder`, and refresh the displayed PO.
- [x] Render loading and readable API errors.

### Task 4: Wire routes and navigation

**Files:**
- Modify: `frontend/src/router/index.js`
- Modify: `frontend/src/App.vue`

- [x] Register `/purchase-orders`, `/purchase-orders/new`, and `/purchase-orders/:id`.
- [x] Point the Purchase Orders navigation link at `/purchase-orders`.

### Task 5: Validate

- [x] Run `npm run test:backend -- --runInBand`.
- [x] Run `npm run test:frontend -- --runInBand`.
- [x] Run `npm --prefix frontend run build`.
- [x] Run `git diff --check`.
