using { sap.capire.incidents as my } from '../db/schema';

/**
 * ---------------------------------------------------------------------------
 * Service: AdminService
 * ---------------------------------------------------------------------------
 * This service is intended for system administrators.
 *
 * Supported use cases:
 * - Maintain customer master data
 * - Create, update, or delete incidents
 *
 * Administrators have full control over both
 * customers and incidents.
 */
service AdminService {

  /**
   * Customer master data.
   * Full CRUD access for:
   * - Creating new customers
   * - Updating customer details
   * - Managing addresses and related data
   */
  entity Customers
    as projection on my.Customers;

  /**
   * Incident data.
   * Full CRUD enables administrators to:
   * - Oversee incident lifecycle
   * - Perform corrections or clean-up
   * - Support operational processes
   */
  entity Incidents
    as projection on my.Incidents;
}