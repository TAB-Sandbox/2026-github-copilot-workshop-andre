## Purpose

Goods receipts let users record delivered quantities against submitted purchase orders and complete the procurement MVP's receiving step with traceable, validated fulfillment updates.

## ADDED Requirements

### Requirement: Users can list goods receipts

The system SHALL provide a goods receipt list view that shows each receipt number, linked purchase order, receipt date, and status, ordered with the newest receipts first.

#### Scenario: Receipt list contains existing receipts
- **WHEN** a user opens the goods receipt list
- **THEN** the system displays available receipts with their number, linked PO, date, and `DRAFT` or `POSTED` status

#### Scenario: Receipt list has no records
- **WHEN** a user opens the goods receipt list and no receipts exist
- **THEN** the system displays an empty state without an error

### Requirement: Users can create a draft receipt from open purchase order lines

The system SHALL allow a user to create a draft goods receipt for a submitted purchase order using one or more PO lines that still have quantity open for receiving. Each receipt line SHALL include the PO line, a positive received quantity, and the actual site code.

#### Scenario: Create a valid draft receipt
- **WHEN** a user submits a receipt for a submitted PO with valid open-line quantities
- **THEN** the system creates a `DRAFT` receipt, assigns a unique receipt number, stores the receipt date and optional notes, and returns its lines

#### Scenario: Reject a receipt for a non-submitted PO
- **WHEN** a user submits a receipt for a PO that is not `SUBMITTED`
- **THEN** the system rejects the request with a readable validation message and does not create a receipt

#### Scenario: Reject an invalid receipt line
- **WHEN** a user submits a receipt with a missing PO line, a non-positive quantity, or a missing actual site code
- **THEN** the system rejects the request with a readable validation message and does not create a receipt

### Requirement: Receipt quantities cannot exceed open purchase order quantities

The system SHALL reject any receipt line whose quantity exceeds the quantity still open on its PO line, where open quantity is ordered quantity minus previously received quantity.

#### Scenario: Receive within the open quantity
- **WHEN** a user creates or posts a receipt whose line quantities are no greater than the corresponding open quantities
- **THEN** the system accepts the quantities for that operation

#### Scenario: Receive more than the open quantity
- **WHEN** a user creates or posts a receipt with any line quantity greater than its current open quantity
- **THEN** the system rejects the operation with a readable validation message and leaves PO and PR fulfillment quantities unchanged

### Requirement: Users can post a draft receipt once

The system SHALL allow a draft receipt to transition to `POSTED` only when all of its lines remain valid. Posting SHALL atomically increment each PO line's received quantity and each source PR line's received quantity, and SHALL make the updated quantities visible in subsequent detail and open-line responses.

#### Scenario: Post a valid draft receipt
- **WHEN** a user posts a draft receipt whose PO is submitted and whose lines are within current open quantities
- **THEN** the system marks the receipt `POSTED` and atomically updates the linked PO and PR received quantities

#### Scenario: Post an already posted receipt
- **WHEN** a user attempts to post a receipt with status `POSTED`
- **THEN** the system rejects the status transition with a readable validation message and does not increment any quantities again

#### Scenario: Posting loses an open quantity race
- **WHEN** another receipt consumes enough of a referenced PO line before the current receipt is posted
- **THEN** the current post fails validation and none of its quantity updates or status changes are committed

### Requirement: Users can review receipt details and continue the workflow

The system SHALL provide receipt detail data and a detail view showing receipt header, status, linked PO, lines, received quantities, and actual site codes. A draft receipt detail view SHALL offer posting, and a submitted PO detail view SHALL offer creation of a receipt from its open lines.

#### Scenario: View a receipt detail
- **WHEN** a user opens an existing receipt
- **THEN** the system returns and displays its header and all receipt lines with linked PO line information

#### Scenario: Open a missing receipt
- **WHEN** a user requests a receipt identifier that does not exist
- **THEN** the system returns a not-found response and the frontend displays a readable error state

#### Scenario: Start receiving from a purchase order
- **WHEN** a user views a submitted PO with open quantities
- **THEN** the system provides an action that opens receipt creation with the PO's open lines available for selection
