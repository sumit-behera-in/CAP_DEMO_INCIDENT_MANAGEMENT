# Service Layer Documentation

This directory contains the service definitions and business logic for the Incident Management application, built using SAP Cloud Application Programming Model (CAP).

## Overview

The service layer exposes the data model as OData V4 APIs with role-based access control:

- **AdminService** (`AdminService.cds`): Administrative service for managing customers and incidents
- **ProcessorService** (`ProcessorService.cds`): Support processor service for handling incidents
- **Tests** (`test/`): Unit tests for service validation

## Service Architecture

### Design Principles

- **Role-Based Access**: Different services for different user roles
- **Least Privilege**: Services expose only what each role needs
- **OData V4**: Standard REST APIs with rich query capabilities
- **Convention over Configuration**: Automatic API generation from CDS models

## Service Definitions

### AdminService

**Purpose**: Administrative operations for system administrators.

**Base URL**: `http://localhost:4004/odata/v4/admin/`

**Exposed Entities**:
- `Customers`: Full CRUD access
- `Incidents`: Full CRUD access

**Use Cases**:
- Create and manage customer master data
- Oversee incident lifecycle
- Perform data corrections and cleanup
- Generate reports and analytics

### ProcessorService

**Purpose**: Day-to-day incident processing for support staff.

**Base URL**: `http://localhost:4004/odata/v4/processor/`

**Exposed Entities**:
- `Incidents`: Full CRUD access
- `Customers`: Read-only access (`@readonly` annotation)

**Use Cases**:
- View and process assigned incidents
- Update incident status and urgency
- Add conversation messages
- Access customer information for context

## OData API Reference

### Common OData Operations

All entities support standard OData operations:

- `GET /{Entity}` - List entities
- `GET /{Entity}({ID})` - Get specific entity
- `POST /{Entity}` - Create new entity
- `PUT /{Entity}({ID})` - Update entity
- `DELETE /{Entity}({ID})` - Delete entity

### Query Options

- `$filter`: Filter results (e.g., `?$filter=status_code eq 'N'`)
- `$orderby`: Sort results (e.g., `?$orderby=createdAt desc`)
- `$top`/`$skip`: Pagination
- `$expand`: Include related entities
- `$select`: Select specific fields

### Navigation Properties

#### ProcessorService Examples

**Get all customers with their incidents:**
```
GET /odata/v4/processor/Customers?$expand=incidents
```

**Get incidents with customer information:**
```
GET /odata/v4/processor/Incidents?$expand=customer
```

**Get incidents by status:**
```
GET /odata/v4/processor/Incidents?$filter=status_code eq 'N'
```

**Get high-priority incidents:**
```
GET /odata/v4/processor/Incidents?$filter=urgency_code eq 'H'
```

### URL Structure Breakdown

Taking `/odata/v4/processor/Customers?$expand=incidents` as an example:

| Component | Source | Description |
|-----------|--------|-------------|
| `/odata/v4` | CAP Runtime | Standard OData V4 protocol |
| `/processor` | Service Name | `ProcessorService` → lowercase + remove "Service" |
| `/Customers` | Entity Exposure | `entity Customers as projection on my.Customers` |
| `?$expand=incidents` | CDS Association | `incidents : Association to many Incidents` |

## Service-Specific Features

### Read-Only Entities

In ProcessorService, Customers are marked `@readonly` to prevent accidental modification:

```cds
@readonly
entity Customers as projection on my.Customers;
```

This ensures support staff can view customer data but cannot create, update, or delete customers.

### Automatic API Generation

CAP automatically generates:
- OData `$metadata` document
- CRUD endpoints for all exposed entities
- Navigation property support
- Query capabilities
- Data validation
- Audit trails

## Testing

The `test/` directory contains unit tests for both services:

- `AdminService.cds.test.js`: Tests for administrative operations
- `ProcessorService.cds.test.js`: Tests for processor operations

Run tests with:
```bash
npm test
```

## Development Guidelines

### Adding New Services

1. Create new `.cds` file in `srv/` directory
2. Define service with appropriate entity projections
3. Apply access controls using annotations
4. Add unit tests
5. Update documentation

### Modifying Existing Services

1. Update service definitions in `.cds` files
2. Ensure backward compatibility
3. Update tests
4. Test all endpoints
5. Update API documentation

### Security Considerations

- Use `@readonly` for entities that should not be modified
- Apply role-based access through separate services
- Validate all inputs at the model level
- Use managed fields for audit trails

## API Examples

### Creating a New Incident (ProcessorService)

```http
POST /odata/v4/processor/Incidents
Content-Type: application/json

{
  "title": "Unable to login to portal",
  "customer_ID": "CUST001",
  "urgency_code": "H"
}
```

### Updating Incident Status

```http
PUT /odata/v4/processor/Incidents(uuid'123e4567-e89b-12d3-a456-426614174000')
Content-Type: application/json

{
  "status_code": "I"
}
```

### Adding Conversation Message

```http
POST /odata/v4/processor/Incidents(uuid'123e4567-e89b-12d3-a456-426614174000')/conversation
Content-Type: application/json

{
  "message": "Issue has been escalated to senior support"
}
```

## Error Handling

Common HTTP status codes:
- `200 OK`: Successful operation
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Performance Considerations

- Use `$select` to retrieve only needed fields
- Use `$filter` to limit result sets
- Use `$expand` judiciously to avoid N+1 queries
- Consider pagination for large datasets
- Use appropriate indexes in production databases


