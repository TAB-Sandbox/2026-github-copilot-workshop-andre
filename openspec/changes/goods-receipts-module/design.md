## Context

The current application has Vue pages and a Fastify API for requisitions and purchase orders. The PostgreSQL schema already contains `goods_receipts` and `gr_lines`, plus denormalized `qty_received` fields on PO and PR lines. The existing PO service owns transaction-scoped validation and quantity allocation, so receiving should follow that boundary. See proposal.md and `specs/goods-receipts/spec.md` for motivation and behavior.

## Goals / Non-Goals

**Goals:**

- Add the smallest complete GR workflow: list, create draft, detail, and post.
- Preserve backend authority for PO status, open quantities, and posting concurrency.
- Reuse existing Vue page layout, API wrapper, route registration, and test conventions.
- Keep PO and PR received quantities consistent through one database transaction.

**Non-Goals:**

- Inventory movements, accounting, payment, warehouse management, attachments, or approval workflows.
- Changes to the existing database schema or replacement of the current PO/PR modules.
- Editing or deleting receipts after creation.

## Decisions

- **Add a dedicated goods receipt service and route module.** This matches the existing thin-route/service structure and keeps receiving rules readable for workshop participants. An all-in-one route implementation was rejected because it would duplicate transaction and validation logic across endpoints.
- **Use the existing tables and denormalized received quantities.** The migration already models receipt headers, lines, and the PO/PR quantity fields required by the contract. A new receipt-allocation table is unnecessary for the MVP because each GR line references a PO line, and the existing PR allocation bridge identifies its source PR line.
- **Create receipts only from submitted POs and validate again on post.** Create-time validation gives immediate feedback and prevents obviously invalid drafts; post-time validation is required because open quantities can change while a draft exists. Restricting creation to submitted POs avoids receiving against an unissued order.
- **Lock PO lines and source PR lines while posting.** The post transaction will lock the receipt, PO header/lines, and source PR lines before checking status and remaining quantities. It will increment `po_lines.qty_received`, increment the corresponding `pr_lines.qty_received` through the allocation source, update the receipt status, and commit together. Separate updates or an application-only check could permit duplicate or over-receiving under concurrent requests.
- **Expose explicit GR endpoints.** Add `GET /api/goods-receipts`, `POST /api/goods-receipts`, `GET /api/goods-receipts/:id`, and `POST /api/goods-receipts/:id/post`. The list endpoint is needed by the new page even though the original plan only named the create, post, and detail endpoints.
- **Use dedicated Vue pages with PO handoff.** Add `/goods-receipts`, `/goods-receipts/new`, and `/goods-receipts/:id`; the create page accepts a `poId` query or route context, loads PO open lines, and the PO detail page links to it. Reusing the PO allocation table was rejected because receipt lines have different quantity semantics and actual-site input.
- **Test at the service and browser-flow boundaries.** Jest tests will cover submitted-PO checks, over-receiving, atomic posting, and idempotent status transitions. Playwright will cover selecting open PO lines, creating/posting a receipt, and seeing quantities close, using the seeded procurement chain.

## Risks / Trade-offs

- **[Risk]** A PO line may have multiple PR allocation sources, making PR received-quantity updates ambiguous. **Mitigation:** require the service to resolve and update every allocation source proportionally or reject ambiguous data; the seeded MVP data uses one source per PO line, which is the supported workshop shape.
- **[Risk]** Receipt numbering by row count can collide after deletions or concurrent creation. **Mitigation:** generate the number inside the transaction and rely on the database unique constraint; surface a readable conflict if the MVP's simple numbering strategy collides.
- **[Risk]** Existing Fastify error handling may hide expected 404/422 responses. **Mitigation:** follow the current route error conventions and add route tests for validation and not-found responses before wiring the frontend.

## Migration Plan

1. Confirm the existing schema is present; no migration is required.
2. Deploy the backend service/routes and frontend pages together.
3. Run Jest tests, then the Playwright GR flow against the seeded database.
4. Roll back by removing the new route registration and frontend routes/pages if necessary; existing PR and PO data remains untouched. Any created GR rows can be ignored or removed in local workshop environments because no existing workflow depends on them.

## Open Questions

None. The MVP contract intentionally leaves inventory, accounting, and advanced receiving behavior out of scope.
