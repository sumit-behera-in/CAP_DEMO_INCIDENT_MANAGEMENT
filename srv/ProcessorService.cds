using { sap.capire.incidents as my } from '../db/schema';

/**
 * ============================================================================
 * SAP CAP – Service Definitions
 * ============================================================================
 *
 * This file defines the service layer for the Incident Management application.
 * Services expose selected entities from the data model as OData APIs.
 *
 * Design Goals:
 * - Separate responsibilities by user role
 * - Apply least-privilege access principle
 * - Expose only what each user group needs
 *
 * Two services are defined:
 * 1. ProcessorService – For support personnel handling incidents
 * 2. AdminService     – For administrators managing master data
 * ============================================================================
 *

/**
 * ---------------------------------------------------------------------------
 * Service: ProcessorService
 * ---------------------------------------------------------------------------
 * This service is intended for support personnel (incident processors).
 *
 * Supported use cases:
 * - View and process customer incidents
 * - Read customer information related to incidents
 *
 * Restrictions:
 * - Customer data is exposed as read-only
 * - Prevents accidental modification of master data
 */
service ProcessorService {

  /**
   * Incidents managed by support personnel.
   * Full CRUD access is allowed so support staff can:
   * - Update status and urgency
   * - Add conversation entries
   * - Track incident lifecycle
   */
  entity Incidents
    as projection on my.Incidents;

  /**
   * Customer information related to incidents.
   * Annotated as @readonly to ensure:
   * - No creation, update, or deletion of customers
   * - Safe reference access for processors
   */
  @readonly
  entity Customers
    as projection on my.Customers;
}

