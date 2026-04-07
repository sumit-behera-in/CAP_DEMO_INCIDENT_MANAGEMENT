
# Database Layer Documentation

This directory contains the core data model for the Incident Management application, built using SAP Cloud Application Programming Model (CAP) and CDS (Core Data Services).

## Overview

The data model defines a comprehensive incident management system with the following components:

- **Domain Model** (`schema.cds`): Entity definitions, relationships, and business rules
- **Sample Data** (`data/`): CSV files with test data for development and testing

## Data Model Architecture

### Core Concepts Used

- **`cuid`**: Standard UUID-based primary keys with automatic generation
- **`managed`**: Auto-managed audit fields (createdAt, createdBy, modifiedAt, modifiedBy)
- **`CodeList`**: Standardized lookup tables for fixed value sets
- **`Association`**: Loose relationships with independent lifecycles
- **`Composition`**: Strong ownership relationships with dependent lifecycles

### Entity Relationships

```
Customers (1) ────→ (many) Incidents
    │                       │
    │                       ├── Status (CodeList)
    └── Addresses (many)     └── Urgency (CodeList)
        (Composition)            (Association)
```

## Entity Definitions

### Incidents Entity

Represents support incidents/tickets created by customers.

**Key Fields:**
- `ID`: UUID primary key (auto-generated)
- `customer`: Association to Customers
- `title`: Incident title/description
- `urgency`: Association to Urgency (defaults to 'M' - Medium)
- `status`: Association to Status (defaults to 'N' - New)
- `conversation`: Composition of message history

**Audit Fields (via managed):**
- `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`

### Customers Entity

Represents customers who can create support incidents.

**Key Fields:**
- `ID`: Business key (customer number)
- `firstName`, `lastName`: Name components
- `name`: Calculated full name (firstName + lastName)
- `email`: Email address (EMailAddress type)
- `phone`: Phone number (PhoneNumber type)
- `creditCardNo`: Validated credit card number (16 digits, no leading zero)
- `incidents`: Association to related Incidents
- `addresses`: Composition of Addresses

### Addresses Entity

Postal addresses associated with customers.

**Key Fields:**
- `ID`: UUID primary key
- `customer`: Owning customer (Association)
- `city`, `postCode`, `streetAddress`: Address components

### Status CodeList

Defines the lifecycle states of incidents.

**Values:**
- `N` (new) - Initial state
- `A` (assigned) - Assigned to processor
- `I` (in_process) - Being worked on
- `H` (on_hold) - Temporarily paused
- `R` (resolved) - Issue resolved
- `C` (closed) - Final state

**Additional Field:**
- `criticality`: Integer for UI color coding (1=Negative/Red, 2=Critical/Yellow, 3=Positive/Green)

### Urgency CodeList

Defines priority levels for incidents.

**Values:**
- `H` (high) - Urgent issues
- `M` (medium) - Standard priority
- `L` (low) - Non-urgent issues

## Custom Data Types

- **`EMailAddress`**: String type for email validation (future enhancement)
- **`PhoneNumber`**: String type for phone number formatting (future enhancement)

## Business Rules & Validations

### Data Validation
- Credit card numbers must be exactly 16 digits and not start with zero
- Email and phone fields use custom types for future validation extensions

### Default Values
- Incident urgency defaults to 'Medium' (M)
- Incident status defaults to 'New' (N)

### Relationship Constraints
- **Association (Incidents ↔ Customers)**: Loose coupling, incidents can exist independently
- **Composition (Customers → Addresses)**: Strong ownership, addresses deleted with customer
- **Composition (Incidents → Conversation)**: Strong ownership, messages deleted with incident

## Sample Data

The `data/` directory contains CSV files with sample data:

- `sap.capire.incidents-Customers.csv`: Sample customer records
- `sap.capire.incidents-Incidents.csv`: Sample incident records
- `sap.capire.incidents-Addresses.csv`: Sample address records
- `sap.capire.incidents-Status.csv`: Status code list data
- `sap.capire.incidents-Status.texts.csv`: Localized status descriptions
- `sap.capire.incidents-Urgency.csv`: Urgency code list data
- `sap.capire.incidents-Urgency.texts.csv`: Localized urgency descriptions
- `sap.capire.incidents-Incidents.conversation.csv`: Sample conversation messages

## Usage in Services

This data model is exposed through two services:

1. **AdminService**: Full CRUD access for administrators
2. **ProcessorService**: Read-write incidents, read-only customers for support staff

## Extending the Model

When adding new entities or fields:

1. Update `schema.cds` with new definitions
2. Add sample data in appropriate CSV files
3. Update service projections if needed
4. Run `cds deploy` to update the database schema
5. Update tests and documentation

## Best Practices

- Use `cuid` for technical primary keys
- Use `managed` for audit trail requirements
- Prefer `Association` over `Composition` unless strong ownership is required
- Use `CodeList` for fixed value sets
- Define custom types for semantic clarity and future validation
- Include comprehensive comments in CDS files


Criticality
{{18-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}

Used by UI to show colors: Red, Yellow, Green
Common in SAP Fiori apps


7. Urgency Code List
{{19-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Urgency levels:
{{20-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Used to prioritize incidents.


8. Custom Data Types
{{21-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Why use custom types?

Better readability
Future validation possibility
Reusable everywhere
✅ Best practice in CDS modeling


9. How CAP Uses This File
From this CDS model, CAP automatically generates:

Database tables
OData services
$metadata document
CRUD APIs
UI semantics
✅ No manual API coding needed


10. Real‑World Meaning (Simple Summary)
This CDS file models:

Customers
Their addresses
Support incidents
Incident status & urgency
Conversation history
All relationships, defaults, and rules are: ✅ Declarative
✅ Standardized
✅ Enterprise‑ready


11. One‑Line Summary

This CDS file is the complete data and service blueprint for a customer support incident management application built using SAP CAP, defining entities, relationships, validations, and defaults in a clean, SAP‑recommended way.




If you want next, I can: ✅ Explain how this becomes an OData service
✅ Show expected OData endpoints
✅ Explain Association vs Composition visually
✅ Map this to a Fiori UI
Just tell me 👍

Below is a clear, beginner‑friendly explanation of the CDS file, explained line by line, with business meaning, CAP concepts, and real‑world analogies.
This is written assuming the reader is new to CDS / CAP.


Explanation of the CDS File (SAP CAP)
This CDS file defines the data model for a Customer Incident Management System (support ticket system).
It tells CAP:

What data exists
How entities are related
What default values and rules apply
Think of this file as the blueprint (schema) of your application.


1. Import Section
using {
  cuid,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';

What this means
You are importing ready‑made SAP building blocks.
Explanation of each:

cuidAdds a standard unique ID (UUID)
Automatically generated
Used for primary keys
managedAutomatically adds audit fields: createdAt
createdBy
modifiedAt
modifiedBy
CodeListUsed for fixed value lists
Example: status, priority, urgency
✅ These save a lot of boilerplate work.


2. Namespace Declaration
namespace sap.capire.incidents;

What this means

Organizes all entities under a logical package
Prevents naming conflicts
Used in exposed OData services
📦 Think of this as a folder or package name.


3. Incidents Entity (Main Business Object)
entity Incidents : cuid, managed {

Meaning

This defines an Incident (Support Ticket)
It: Has a unique ID (cuid)
Has audit fields (managed)


3.1 Customer Association
customer : Association to Customers;


Links an incident to one customer
One customer → many incidents
📌 Association = reference (like foreign key, but smarter)


3.2 Title Field
title : String @title: 'Title';


Short description of the issue
@title is UI metadata (used by Fiori/UI tools)


3.3 Urgency and Status
urgency : Association to Urgency default 'M';
status  : Association to Status default 'N';


Linked to code lists
Default values: Urgency = Medium
Status = New
✅ Enforces consistency
✅ Prevents invalid values


3.4 Conversation (Composition)
conversation : Composition of many {
   key ID        : UUID;
       timestamp : type of managed : createdAt;
       author    : type of managed : createdBy;
       message   : String;
};

What this represents

Chat‑like conversation history for the incident
Composition means: Messages belong to the incident
If the incident is deleted → messages are deleted
Fields

ID: Unique ID per message
timestamp: Auto‑created time
author: Who wrote the message
message: Actual text
📌 Composition = strong ownership relationship


4. Customers Entity
entity Customers : managed {

Meaning

Represents customers who can raise incidents
Uses managed → audit fields included


4.1 Customer ID
key ID : String;


Primary key
Business key (not UUID)
Example: Customer Number


4.2 Name Fields
firstName : String;
lastName  : String;
name      : String = trim(firstName || ' ' || lastName);


name is calculated
Combines first & last name
Stored virtually (derived)
✅ Good example of CDS expressions


4.3 Contact Information
email : EMailAddress;
phone : PhoneNumber;


Custom types (defined later)
Improves readability and reuse


4.4 Customer–Incident Relationship
incidents : Association to many Incidents
              on incidents.customer = $self;


One customer → many incidents
$self means “this customer”
📌 This is the inverse of the Incidents → Customer relationship


4.5 Credit Card Validation
creditCardNo : String(16) @assert.format: '^[1-9]\d{15}What this does
Allows exactly 16 digits
No leading zero
Enforces format at model level
✅ Data validation without coding

4.6 Addresses (Composition)
addresses : Composition of many Addresses
              on addresses.customer = $self;Strong ownership
Address belongs only to customer
Deleted automatically with customer

5. Addresses Entity
entity Addresses : cuid, managed {Stores customer addresses
Uses:
cuid → unique ID
managed → audit fields
Fields
customer      : Association to Customers;
city          : String;
postCode      : String;
streetAddress : String;📌 One customer → many addresses

6. Status Code List
entity Status : CodeList {
``What is a CodeList?
Fixed set of allowed values
Centralized & reusable
UI‑friendly

Status Values
key code : String enum {
  new        = 'N';
  assigned   = 'A';
  in_process = 'I';
  on_hold    = 'H';
  resolved   = 'R';
  closed     = 'C';
};Defines lifecycle of an incident
Prevents invalid status values

Criticality
criticality : Integer;Used by UI to show colors:
Red, Yellow, Green
Common in SAP Fiori apps

7. Urgency Code List
entity Urgency : CodeList {Urgency levels:
high   = 'H';
medium = 'M';
low    = 'L';Used to prioritize incidents.

8. Custom Data Types
type EMailAddress : String;
type PhoneNumber  : String;Why use custom types?
Better readability
Future validation possibility
Reusable everywhere
✅ Best practice in CDS modeling

9. How CAP Uses This File
From this CDS model, CAP automatically generates:
Database tables
OData services
$metadata document
CRUD APIs
UI semantics
✅ No manual API coding needed

10. Real‑World Meaning (Simple Summary)
This CDS file models:
Customers
Their addresses
Support incidents
Incident status & urgency
Conversation history
All relationships, defaults, and rules are:
✅ Declarative

✅ Standardized

✅ Enterprise‑ready

11. One‑Line Summary
This CDS file is the complete data and service blueprint for a customer support incident management application built using SAP CAP, defining entities, relationships, validations, and defaults in a clean, SAP‑recommended way.

If you want next, I can:
✅ Explain how this becomes an OData service

✅ Show expected OData endpoints

✅ Explain Association vs Composition visually

✅ Map this to a Fiori UI
Just tell me 👍;

What this does

Allows exactly 16 digits
No leading zero
Enforces format at model level
✅ Data validation without coding


4.6 Addresses (Composition)
{{13-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}

Strong ownership
Address belongs only to customer
Deleted automatically with customer


5. Addresses Entity
{{14-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}

Stores customer addresses
Uses: cuid → unique ID
managed → audit fields
Fields
{{15-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}📌 One customer → many addresses


6. Status Code List
{{16-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}What is a CodeList?

Fixed set of allowed values
Centralized & reusable
UI‑friendly


Status Values
{{17-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}

Defines lifecycle of an incident
Prevents invalid status values


Criticality
{{18-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}

Used by UI to show colors: Red, Yellow, Green
Common in SAP Fiori apps


7. Urgency Code List
{{19-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Urgency levels:
{{20-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Used to prioritize incidents.


8. Custom Data Types
{{21-raw-markdown-652acbe1-b433-f502-3b74-e38b5286f452}}Why use custom types?

Better readability
Future validation possibility
Reusable everywhere
✅ Best practice in CDS modeling


9. How CAP Uses This File
From this CDS model, CAP automatically generates:

Database tables
OData services
$metadata document
CRUD APIs
UI semantics
✅ No manual API coding needed


10. Real‑World Meaning (Simple Summary)
This CDS file models:

Customers
Their addresses
Support incidents
Incident status & urgency
Conversation history
All relationships, defaults, and rules are: ✅ Declarative
✅ Standardized
✅ Enterprise‑ready


11. One‑Line Summary

This CDS file is the complete data and service blueprint for a customer support incident management application built using SAP CAP, defining entities, relationships, validations, and defaults in a clean, SAP‑recommended way.


