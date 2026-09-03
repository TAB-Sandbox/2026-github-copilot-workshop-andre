# Graph Report - 2026-github-copilot-workshop  (2026-09-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 131 nodes · 203 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b54ca015`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api.js
- purchase-order-service.js
- PurchaseOrderCreatePage.vue
- index.js
- requisition-service.js
- buildApp
- PurchaseOrderDetailPage.vue
- RequisitionCreatePage.vue
- PurchaseOrderLineAllocationTable.vue
- 00-init-mvp-db.sh
- pre-push
- playwright.config.js

## God Nodes (most connected - your core abstractions)
1. `api` - 11 edges
2. `requisitionRoutes()` - 8 edges
3. `getRequisitionById()` - 8 edges
4. `purchaseOrderRoutes()` - 7 edges
5. `createPurchaseOrder()` - 7 edges
6. `getPurchaseOrderById()` - 7 edges
7. `buildApp()` - 7 edges
8. `createRequisition()` - 6 edges
9. `getOpenPoLines()` - 5 edges
10. `listPurchaseOrders()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `buildApp()` --indirect_call--> `purchaseOrderRoutes()`  [INFERRED]
  backend/src/app.js → backend/src/routes/purchase-order-routes.js
- `buildApp()` --indirect_call--> `requisitionRoutes()`  [INFERRED]
  backend/src/app.js → backend/src/routes/requisition-routes.js
- `buildApp()` --indirect_call--> `dbPlugin()`  [INFERRED]
  backend/src/app.js → backend/src/plugins/db.js
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  backend/src/server.js → backend/src/app.js
- `purchaseOrderRoutes()` --calls--> `createPurchaseOrder()`  [EXTRACTED]
  backend/src/routes/purchase-order-routes.js → backend/src/services/purchase-order-service.js

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "api.js"
Cohesion: 0.12
Nodes (12): api, stats, errorMessage, isLoading, items, errorMessage, items, { api: mockApi } (+4 more)

### Community 1 - "purchase-order-service.js"
Cohesion: 0.25
Nodes (10): purchaseOrderRoutes(), createPoNumber(), createPurchaseOrder(), getOpenPoLines(), getPurchaseOrderById(), listPurchaseOrders(), mapHeader(), mapLine() (+2 more)

### Community 2 - "PurchaseOrderCreatePage.vue"
Cohesion: 0.13
Nodes (15): emit, props, updateField(), buildPayload(), errorMessage, form, isLoading, isSaving (+7 more)

### Community 3 - "index.js"
Cohesion: 0.13
Nodes (9): isDashboard, isPurchaseOrders, isRequisitions, route, errorMessage, requisition, route, router (+1 more)

### Community 4 - "requisition-service.js"
Cohesion: 0.35
Nodes (11): requisitionRoutes(), approveRequisition(), createPrNumber(), createRequisition(), getRequisitionById(), getRequisitionOpenLines(), listRequisitions(), mapHeader() (+3 more)

### Community 5 - "buildApp"
Cohesion: 0.42
Nodes (4): buildApp(), config, dbPlugin(), start()

### Community 6 - "PurchaseOrderDetailPage.vue"
Cohesion: 0.22
Nodes (5): errorMessage, isLoading, isSubmitting, purchaseOrder, route

### Community 7 - "RequisitionCreatePage.vue"
Cohesion: 0.29
Nodes (5): addLine(), emptyLine(), errorMessage, form, router

### Community 8 - "PurchaseOrderLineAllocationTable.vue"
Cohesion: 0.40
Nodes (4): emit, props, selectedCount, updateLine()

## Knowledge Gaps
- **40 isolated node(s):** `stats`, `errorMessage`, `items`, `errorMessage`, `isLoading` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `api.js` to `PurchaseOrderCreatePage.vue`, `index.js`, `PurchaseOrderDetailPage.vue`, `RequisitionCreatePage.vue`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `buildApp` to `purchase-order-service.js`, `requisition-service.js`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `purchaseOrderRoutes()` connect `purchase-order-service.js` to `buildApp`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `stats`, `errorMessage`, `items` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `PurchaseOrderCreatePage.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._