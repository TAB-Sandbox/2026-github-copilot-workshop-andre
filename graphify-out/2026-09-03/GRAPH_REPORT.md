# Graph Report - 2026-github-copilot-workshop  (2026-09-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 162 nodes · 217 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19a616fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RequisitionCreatePage.vue
- purchase-order-service.js
- frontend/package.json
- requisition-service.js
- package.json
- scripts
- backend/package.json
- dependencies
- devDependencies
- app.js
- 00-init-mvp-db.sh
- playwright.config.js

## God Nodes (most connected - your core abstractions)
1. `scripts` - 14 edges
2. `requisitionRoutes()` - 9 edges
3. `purchaseOrderRoutes()` - 8 edges
4. `getRequisitionById()` - 8 edges
5. `createPurchaseOrder()` - 7 edges
6. `getPurchaseOrderById()` - 7 edges
7. `scripts` - 7 edges
8. `createRequisition()` - 6 edges
9. `buildApp()` - 6 edges
10. `getOpenPoLines()` - 5 edges

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

## Communities (14 total, 2 thin omitted)

### Community 0 - "RequisitionCreatePage.vue"
Cohesion: 0.08
Nodes (17): api, isDashboard, isRequisitions, route, stats, addLine(), emptyLine(), errorMessage (+9 more)

### Community 1 - "purchase-order-service.js"
Cohesion: 0.25
Nodes (10): purchaseOrderRoutes(), createPoNumber(), createPurchaseOrder(), getOpenPoLines(), getPurchaseOrderById(), listPurchaseOrders(), mapHeader(), mapLine() (+2 more)

### Community 2 - "frontend/package.json"
Cohesion: 0.12
Nodes (16): dependencies, vue, vue-router, name, private, scripts, build, dev (+8 more)

### Community 3 - "requisition-service.js"
Cohesion: 0.35
Nodes (11): requisitionRoutes(), approveRequisition(), createPrNumber(), createRequisition(), getRequisitionById(), getRequisitionOpenLines(), listRequisitions(), mapHeader() (+3 more)

### Community 4 - "package.json"
Cohesion: 0.14
Nodes (13): concurrently, author, description, devDependencies, concurrently, @playwright/test, directories, doc (+5 more)

### Community 5 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, dev, dev:backend, dev:frontend, test, test:backend, test:coverage, test:coverage:backend (+6 more)

### Community 6 - "backend/package.json"
Cohesion: 0.15
Nodes (12): devDependencies, jest, name, private, scripts, dev, start, test (+4 more)

### Community 7 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, dotenv, fastify, @fastify/cors, fastify-plugin, pg, uuid, dotenv (+5 more)

### Community 8 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, happy-dom, vite, @vitejs/plugin-vue, vitest, @vitest/coverage-v8, @vue/test-utils, happy-dom (+5 more)

### Community 9 - "app.js"
Cohesion: 0.46
Nodes (4): buildApp(), config, dbPlugin(), start()

## Knowledge Gaps
- **70 isolated node(s):** `isDashboard`, `isRequisitions`, `route`, `stats`, `errorMessage` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `isDashboard`, `isRequisitions`, `route` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RequisitionCreatePage.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._