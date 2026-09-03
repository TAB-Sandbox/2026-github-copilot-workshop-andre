# Procurement MVP Application Overview

## Purpose

The application is a small procurement management system. It gives users a single place to create and review purchase requisitions (PRs), then create and submit purchase orders (POs) from approved PR lines.

The current implementation covers:

- Home dashboard with PR status counts
- Purchase requisition list, create, and detail pages
- Purchase order list, create, detail, and submit pages
- REST APIs backed by PostgreSQL

Goods receipt (GR) pages and APIs are not implemented in the current application. PO detail can show received and open quantities because those fields exist in the data model, but receiving is outside the current workflow.

## Application Structure

The browser runs a Vue 3 application. Vue pages call the API wrapper in `frontend/src/api.js`, which sends JSON requests to the Fastify backend. Fastify registers requisition and purchase-order routes, and the route handlers delegate business rules to service functions. The services read and write PostgreSQL through the database plugin.

```mermaid
flowchart LR
    User[Procurement user] --> Browser[Vue 3 browser application]
    Browser --> ApiWrapper[frontend/src/api.js]
    ApiWrapper -->|HTTP JSON| Fastify[Fastify REST API]
    Fastify --> Routes[Requisition and purchase-order routes]
    Routes --> Services[Business services]
    Services --> PostgreSQL[(PostgreSQL database)]
```

## Main User Flow

An approved PR is the starting point for PO creation. The create page loads open lines from approved requisitions, copies the selected line details into the PO payload, and lets the user save a draft or submit immediately.

```mermaid
flowchart TD
    Start([Open dashboard]) --> PRList[Open PR list]
    PRList --> PRDetail[Open a PR]
    PRDetail --> Status{Is the PR approved?}
    Status -->|No| Wait[Submit and approve the PR first]
    Status -->|Yes| NewPO[Open New PO]
    NewPO --> LoadLines[Load approved PR lines with remaining quantities]
    LoadLines --> Select[Select one or more lines]
    Select --> Enter[Enter vendor and confirm quantities]
    Enter --> Validate{Payload valid and allocation available?}
    Validate -->|No| Error[Show validation or allocation error]
    Error --> Enter
    Validate -->|Yes| Save{Choose an action}
    Save -->|Save As Draft| Draft[Create PO with DRAFT status]
    Save -->|Submit PO| Submitted[Create PO, then change status to SUBMITTED]
    Draft --> POList[Open PO list]
    Submitted --> POList
    POList --> PODetail[Open PO detail]
    PODetail --> Review[Review vendor, status, lines, quantities, and PR allocation]
    Review --> Submit{Is the PO still a draft?}
    Submit -->|Yes| SubmitPO[Submit PO]
    Submit -->|No| Complete([Workflow complete])
    SubmitPO --> Complete
```

## PO Creation and Submission Sequence

The frontend performs basic checks for a vendor and selected lines, but the backend remains authoritative. During PO creation, the service locks each referenced PR line, confirms that its PR is `APPROVED`, and rejects quantities greater than the remaining amount before committing the PO and allocation records.

```mermaid
sequenceDiagram
    actor User as Procurement user
    participant Vue as Vue PO pages
    participant API as api.js
    participant Fastify as Fastify routes
    participant Service as PO service
    participant DB as PostgreSQL

    User->>Vue: Open New PO
    Vue->>API: listRequisitions()
    API->>Fastify: GET /api/requisitions
    Fastify->>DB: Read requisitions
    DB-->>Fastify: Requisition headers
    Fastify-->>API: Approved PRs
    API-->>Vue: Approved PR list

    loop For each approved PR
        Vue->>API: getRequisitionOpenLines(prId)
        API->>Fastify: GET /api/requisitions/:id/open-lines
        Fastify->>DB: Read remaining PR line quantities
        DB-->>Fastify: Open PR lines
        Fastify-->>API: Open line payload
        API-->>Vue: Display selectable lines
    end

    User->>Vue: Enter vendor and select quantities
    Vue->>Vue: Check vendor and selected lines
    Vue->>API: createPurchaseOrder(payload)
    API->>Fastify: POST /api/purchase-orders
    Fastify->>Service: createPurchaseOrder(db, payload)
    Service->>DB: BEGIN transaction

    loop For each selected PR line
        Service->>DB: Lock PR line and read PR status
        DB-->>Service: Status and requested/allocation quantities
        alt PR is not APPROVED
            Service-->>Fastify: 422 validation error
            Fastify-->>API: Error message
            API-->>Vue: Show error and keep form data
        else Quantity exceeds remaining amount
            Service-->>Fastify: 422 allocation error
            Fastify-->>API: Error message
            API-->>Vue: Show error and keep form data
        else Allocation is valid
            Service->>DB: Insert PO header and PO lines
            Service->>DB: Insert allocations and update PR quantities
        end
    end

    Service->>DB: COMMIT transaction
    Service->>DB: Read created PO detail
    DB-->>Service: PO with lines and allocations
    Service-->>Fastify: PO detail
    Fastify-->>API: 201 PO response
    API-->>Vue: Show draft feedback

    opt User chose Submit PO
        Vue->>API: submitPurchaseOrder(poId)
        API->>Fastify: POST /api/purchase-orders/:id/submit
        Fastify->>Service: submitPurchaseOrder(db, poId)
        Service->>DB: Read current PO status
        alt PO is DRAFT
            Service->>DB: Update status to SUBMITTED
            Service->>DB: Read updated PO detail
            DB-->>Service: Submitted PO
            Service-->>Fastify: Submitted PO
            Fastify-->>API: 200 PO response
            API-->>Vue: Show submitted feedback
        else PO is already submitted
            Service-->>Fastify: 422 status-transition error
            Fastify-->>API: Error message
            API-->>Vue: Show error
        end
    end
```

## Routes and Pages

### Frontend routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Dashboard | Summarize requisition status and recent PRs |
| `/requisitions` | PR list | Browse requisitions |
| `/requisitions/new` | PR create | Enter a new requisition |
| `/requisitions/:id` | PR detail | Review, submit, and approve a requisition |
| `/purchase-orders` | PO list | Browse purchase orders |
| `/purchase-orders/new` | PO create | Allocate approved PR lines to a new PO |
| `/purchase-orders/:id` | PO detail | Review or submit a PO |

### Purchase order API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/purchase-orders` | Return PO headers ordered by creation date |
| `POST` | `/api/purchase-orders` | Validate allocations and create a draft PO |
| `POST` | `/api/purchase-orders/:id/submit` | Move a draft PO to `SUBMITTED` |
| `GET` | `/api/purchase-orders/:id` | Return a PO with lines and PR allocation sources |
| `GET` | `/api/purchase-orders/:id/open-lines` | Return PO lines with quantity still open for receiving |

## Business Rules

- A PO can only allocate lines from a PR whose status is `APPROVED`.
- A PO allocation cannot exceed the PR line's remaining quantity.
- PO creation validates all referenced lines inside a database transaction.
- PR line rows are locked during allocation to protect against concurrent over-allocation.
- A PO starts in `DRAFT` status.
- Only a `DRAFT` PO can transition to `SUBMITTED`.
- The submit action is available on the detail page only while the PO is a draft.
- Invalid requests return a JSON error with a readable `message`; the frontend displays that message without leaving the loading state active.

## Data Relationships

The important records for the current workflow are connected as follows:

```mermaid
flowchart LR
    PR[Purchase requisition] --> PRLine[PR line]
    PRLine --> Allocation[PR line allocation]
    Allocation --> POLine[PO line]
    POLine --> PO[Purchase order]
    PRLine -->|qty_allocated increases| Remaining[Remaining PR quantity decreases]
```

The allocation bridge preserves the source PR line for each PO line, so PO detail can show which PR number supplied the ordered quantity.

## Current Scope Boundary

The implemented application ends after PO review and submission. Goods receipt is the next business step, but it is intentionally left for further exploration in this workshop. The planned future flow is `SUBMITTED PO -> goods receipt -> posted receipt -> updated fulfillment quantities`.