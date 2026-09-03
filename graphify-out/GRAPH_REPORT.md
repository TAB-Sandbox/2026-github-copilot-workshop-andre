# Graph Report - 2026-github-copilot-workshop  (2026-09-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 179 nodes · 276 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fda44f22`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api.js
- purchase-order-service.js
- GoodsReceiptCreatePage.vue
- PurchaseOrderCreatePage.vue
- goods-receipt-service.js
- requisition-service.js
- PurchaseOrderDetailPage.vue
- app.js
- RequisitionCreatePage.vue
- RequisitionDetailPage.vue
- PurchaseOrderLineAllocationTable.vue
- po-module.spec.js
- 00-init-mvp-db.sh
- pre-push
- playwright.config.js
- gr-module.spec.js

## God Nodes (most connected - your core abstractions)
1. `api` - 14 edges
2. `createGoodsReceipt()` - 8 edges
3. `requisitionRoutes()` - 8 edges
4. `getRequisitionById()` - 8 edges
5. `buildApp()` - 8 edges
6. `purchaseOrderRoutes()` - 7 edges
7. `createPurchaseOrder()` - 7 edges
8. `getPurchaseOrderById()` - 7 edges
9. `goodsReceiptRoutes()` - 7 edges
10. `getGoodsReceiptById()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `buildApp()` --indirect_call--> `purchaseOrderRoutes()`  [INFERRED]
  backend/src/app.js → backend/src/routes/purchase-order-routes.js
- `buildApp()` --indirect_call--> `goodsReceiptRoutes()`  [INFERRED]
  backend/src/app.js → backend/src/routes/goods-receipt-routes.js
- `buildApp()` --indirect_call--> `requisitionRoutes()`  [INFERRED]
  backend/src/app.js → backend/src/routes/requisition-routes.js
- `buildApp()` --indirect_call--> `dbPlugin()`  [INFERRED]
  backend/src/app.js → backend/src/plugins/db.js
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  backend/src/server.js → backend/src/app.js

## Import Cycles
- None detected.

## Communities (20 total, 5 thin omitted)

### Community 0 - "api.js"
Cohesion: 0.07
Nodes (20): api, stats, errorMessage, isLoading, isPosting, receipt, route, errorMessage (+12 more)

### Community 1 - "purchase-order-service.js"
Cohesion: 0.25
Nodes (10): purchaseOrderRoutes(), createPoNumber(), createPurchaseOrder(), getOpenPoLines(), getPurchaseOrderById(), listPurchaseOrders(), mapHeader(), mapLine() (+2 more)

### Community 2 - "GoodsReceiptCreatePage.vue"
Cohesion: 0.10
Nodes (14): isDashboard, isGoodsReceipts, isPurchaseOrders, isRequisitions, route, errorMessage, form, isLoading (+6 more)

### Community 3 - "PurchaseOrderCreatePage.vue"
Cohesion: 0.13
Nodes (15): emit, props, updateField(), buildPayload(), errorMessage, form, isLoading, isSaving (+7 more)

### Community 4 - "goods-receipt-service.js"
Cohesion: 0.31
Nodes (10): goodsReceiptRoutes(), createGoodsReceipt(), createGrNumber(), getGoodsReceiptById(), listGoodsReceipts(), mapHeader(), mapLine(), postGoodsReceipt() (+2 more)

### Community 5 - "requisition-service.js"
Cohesion: 0.35
Nodes (11): requisitionRoutes(), approveRequisition(), createPrNumber(), createRequisition(), getRequisitionById(), getRequisitionOpenLines(), listRequisitions(), mapHeader() (+3 more)

### Community 6 - "PurchaseOrderDetailPage.vue"
Cohesion: 0.15
Nodes (8): canReceive, errorMessage, isLoading, isSubmitting, purchaseOrder, route, { api: mockApi }, purchaseOrder

### Community 7 - "app.js"
Cohesion: 0.42
Nodes (4): buildApp(), config, dbPlugin(), start()

### Community 8 - "RequisitionCreatePage.vue"
Cohesion: 0.29
Nodes (5): addLine(), emptyLine(), errorMessage, form, router

### Community 9 - "RequisitionDetailPage.vue"
Cohesion: 0.29
Nodes (3): errorMessage, requisition, route

### Community 10 - "PurchaseOrderLineAllocationTable.vue"
Cohesion: 0.40
Nodes (4): emit, props, selectedCount, updateLine()

## Knowledge Gaps
- **61 isolated node(s):** `errorMessage`, `isLoading`, `items`, `errorMessage`, `items` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `api.js` to `GoodsReceiptCreatePage.vue`, `PurchaseOrderCreatePage.vue`, `PurchaseOrderDetailPage.vue`, `RequisitionCreatePage.vue`, `RequisitionDetailPage.vue`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.js` to `purchase-order-service.js`, `goods-receipt-service.js`, `requisition-service.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `goodsReceiptRoutes()` connect `goods-receipt-service.js` to `app.js`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `buildApp()` (e.g. with `dbPlugin()` and `goodsReceiptRoutes()`) actually correct?**
  _`buildApp()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `errorMessage`, `isLoading`, `items` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Should `GoodsReceiptCreatePage.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.10457516339869281 - nodes in this community are weakly interconnected._