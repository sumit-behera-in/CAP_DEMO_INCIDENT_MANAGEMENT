# Incident Management Demo Application

A comprehensive incident management system built using SAP Cloud Application Programming Model (CAP) that demonstrates enterprise-grade application development with CDS, OData services, and role-based access control.

## Overview

This application manages customer support incidents with the following key features:
- **Customer Management**: Maintain customer master data with addresses and contact information
- **Incident Tracking**: Create, update, and track support incidents with conversation history
- **Status Management**: Track incident lifecycle from creation to resolution
- **Role-Based Access**: Separate services for administrators and support processors
- **Data Validation**: Built-in validation rules and format checks

## Project Structure

| File/Folder | Purpose |
|-------------|---------|
| `db/` | Domain models, data definitions, and sample data |
| `srv/` | Service definitions and business logic |
| `test/` | Unit tests for services |
| `package.json` | Project metadata and dependencies |
| `eslint.config.mjs` | ESLint configuration |
| `Makefile` | Build automation scripts |
| `.github/workflows/` | CI/CD pipelines for automated releases |

### Database Layer (`db/`)

- **`schema.cds`**: Core data model defining entities, relationships, and validations
- **`data/`**: CSV files with sample data for testing and development
- **`README.md`**: Detailed explanation of the CDS data model

### Service Layer (`srv/`)

- **`AdminService.cds`**: Administrative service for managing customers and incidents
- **`ProcessorService.cds`**: Support processor service for handling incidents
- **`test/`**: Service unit tests
- **`Readme.md`**: OData API documentation and URL structure explanation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (included via @cap-js/sqlite)

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode (with auto-reload)
```bash
npm run watch
# or
cds watch
```

#### Production Mode
```bash
npm start
# or
cds serve --with-mocks --in-memory
```

The application will start on `http://localhost:4004` with the following endpoints:
- OData API: `http://localhost:4004/odata/v4/`
- Admin Service: `http://localhost:4004/odata/v4/admin/`
- Processor Service: `http://localhost:4004/odata/v4/processor/`

### Testing

Run the test suite:
```bash
npm test
```

## Development Workflow

This project includes comprehensive automation tools to streamline development, testing, and deployment.

### Makefile Commands

The `Makefile` provides convenient commands for common development tasks:

#### Development & Running
```bash
make dev              # Full dev setup (install + deploy + run)
make watch            # Start CAP in watch mode
make debug            # Run with debug logs
make start            # Start CAP server
```

#### Database Operations
```bash
make deploy           # Deploy to SQLite database
make deploy-memory    # Deploy to in-memory SQLite
make reset-db         # Reset database (removes sqlite.db and redeploys)
```

#### Testing & Quality
```bash
make test             # Run test suite
make test-watch       # Run tests in watch mode
make test-coverage    # Run tests with coverage report
make lint             # Run ESLint
make format           # Format code with Prettier
```

#### Git Operations
```bash
make push MSG="commit message"     # Test + commit + push (requires MSG)
make push-safe MSG="commit message" # Pull + test + commit + push
make push-feat MSG="feature desc"   # Commit with "feat:" prefix
make push-fix MSG="fix desc"        # Commit with "fix:" prefix
make push-refactor MSG="refactor desc" # Commit with "refactor:" prefix
```

#### Maintenance
```bash
make clean            # Clean node_modules, gen/, sqlite.db
make deep-clean       # Deep clean including npm cache
make kill             # Kill process on port 4004
make fresh            # Clean + install + deploy + watch
make rebuild          # Clean + install + build
```

### CI/CD Pipeline

The project includes automated release management via GitHub Actions:

- **Trigger**: Automatic release on push to `main` branch
- **Process**:
  1. Runs test suite
  2. Bumps minor version in `package.json`
  3. Commits version change
  4. Creates Git tag
  5. Pushes changes and tag
  6. Creates GitHub release with auto-generated notes

**Workflow File**: `.github/workflows/release.yml`

## API Documentation

### Admin Service (`/odata/v4/admin`)
Full CRUD access to all entities for system administrators.

**Endpoints:**
- `GET /odata/v4/admin/Customers` - List all customers
- `GET /odata/v4/admin/Incidents` - List all incidents
- `POST /odata/v4/admin/Customers` - Create new customer
- `PUT /odata/v4/admin/Customers/{ID}` - Update customer
- `DELETE /odata/v4/admin/Customers/{ID}` - Delete customer

### Processor Service (`/odata/v4/processor`)
Read-write access to incidents, read-only access to customers for support staff.

**Endpoints:**
- `GET /odata/v4/processor/Incidents` - List incidents
- `GET /odata/v4/processor/Customers` - List customers (read-only)
- `GET /odata/v4/processor/Customers?$expand=incidents` - Customers with their incidents
- `POST /odata/v4/processor/Incidents` - Create incident
- `PUT /odata/v4/processor/Incidents/{ID}` - Update incident

## Data Model

### Core Entities

- **Customers**: Customer master data with contact information and addresses
- **Incidents**: Support tickets with status, urgency, and conversation history
- **Addresses**: Customer postal addresses
- **Status**: Incident status codes (New, Assigned, In Process, etc.)
- **Urgency**: Incident priority levels (High, Medium, Low)

### Key Relationships

- Customer → Incidents (1:many, association)
- Customer → Addresses (1:many, composition)
- Incident → Customer (many:1, association)
- Incident → Conversation (1:many, composition)

## Development

### Adding New Features

1. Update the data model in `db/schema.cds`
2. Add service projections in appropriate service files
3. Update sample data in `db/data/`
4. Add unit tests in `srv/test/`

### Database Schema Updates

When modifying the CDS model:
```bash
cds deploy --to sqlite
```

### Code Quality

The project uses ESLint for code quality. Run linting:
```bash
npx eslint .
```

## Learn More

- [SAP CAP Documentation](https://cap.cloud.sap/docs/)
- [CDS Language Reference](https://cap.cloud.sap/docs/cds/)
- [OData V4 Specification](https://www.odata.org/documentation/)

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting changes
