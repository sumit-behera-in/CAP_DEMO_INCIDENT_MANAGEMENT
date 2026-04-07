/**
 * ============================================================================
 * SAP CAP – Incident Management Data Model
 * ----------------------------------------------------------------------------
 * This CDS file defines the core data model for a Customer Incident
 * Management application built using the SAP Cloud Application
 * Programming Model (CAP).
 *
 * Key Concepts Used:
 * - cuid      : Standard UUID-based primary key
 * - managed   : Auto-managed audit fields (createdAt, createdBy, etc.)
 * - CodeList  : Standardized lookup/value lists
 * - Association : Loose relationship (independent lifecycle)
 * - Composition : Strong ownership (shared lifecycle)
 * ============================================================================
 */

using {
  cuid,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';


/**
 * Namespace for all incident-related entities.
 * Helps organize the model and avoid naming collisions.
 */
namespace sap.capire.incidents;


/**
 * ---------------------------------------------------------------------------
 * Entity: Incidents
 * ---------------------------------------------------------------------------
 * Represents support incidents created by customers.
 * Each incident:
 * - Belongs to a customer (association)
 * - Has urgency and status (code lists)
 * - Contains a conversation history (composition)
 */
entity Incidents : cuid, managed {

  /**
   * Customer who created the incident.
   * Association is used because incidents are independent
   * business objects and may exist beyond customer lifecycle.
   */
  customer     : Association to Customers;

  /** Short description of the incident */
  title        : String @title: 'Title';

  /**
   * Urgency of the incident.
   * Defaults to 'Medium'.
   */
  urgency      : Association to Urgency default 'M';

  /**
   * Current status of the incident.
   * Defaults to 'New'.
   */
  status       : Association to Status default 'N';

  /**
   * Conversation history for the incident.
   * Composition indicates strong ownership:
   * - Messages exist only within an incident
   * - Deleting the incident deletes all messages
   */
  conversation : Composition of many {

    /** Unique identifier for a message */
    key ID        : UUID;

    /** Timestamp when message was created */
    timestamp     : type of managed : createdAt;

    /** Author of the message */
    author        : type of managed : createdBy;

    /** Message content */
    message       : String;
  };
}


/**
 * ---------------------------------------------------------------------------
 * Entity: Customers
 * ---------------------------------------------------------------------------
 * Represents customers who are entitled to create incidents.
 *
 * Relationship design:
 * - incidents  : Association (loose link, independent lifecycle)
 * - addresses  : Composition (strong ownership, dependent lifecycle)
 */
entity Customers : managed {

  /** Business key for the customer */
  key ID           : String;

  /** Customer first name */
  firstName        : String;

  /** Customer last name */
  lastName         : String;

  /**
   * Full name derived from first and last name.
   * Calculated field – no storage required.
   */
  name             : String = trim(firstName || ' ' || lastName);

  /** Customer email address */
  email            : EMailAddress;

  /** Customer phone number */
  phone            : PhoneNumber;

  /**
   * Incidents created by the customer.
   * Association = loose relationship:
   * - Incidents can exist independently
   * - No cascade delete
   */
  incidents        : Association to many Incidents
                       on incidents.customer = $self;

  /**
   * Credit card number with format validation.
   * Must be exactly 16 digits and not start with zero.
   */
  creditCardNo     : String(16)     @assert.format: '^[1-9][0-9]{15}$';

  /**
   * Customer addresses.
   * Composition = strong ownership:
   * - Addresses belong only to the customer
   * - Cascade delete is enforced
   */
  addresses        : Composition of many Addresses
                       on addresses.customer = $self;
}


/**
 * ---------------------------------------------------------------------------
 * Entity: Addresses
 * ---------------------------------------------------------------------------
 * Represents postal addresses for customers.
 * This entity has a strong lifecycle dependency on Customers.
 */
entity Addresses : cuid, managed {

  /** Owning customer */
  customer      : Association to Customers;

  /** City name */
  city          : String;

  /** Postal / ZIP code */
  postCode      : String;

  /** Street and house number */
  streetAddress : String;
}


/**
 * ---------------------------------------------------------------------------
 * Entity: Status
 * ---------------------------------------------------------------------------
 * Code list defining the lifecycle status of an incident.
 * Uses standard SAP CodeList pattern.
 */
entity Status : CodeList {

  /** Status code */
  key code : String enum {
    new         = 'N';
    assigned    = 'A';
    in_process  = 'I';
    on_hold     = 'H';
    resolved    = 'R';
    closed      = 'C';
  };

  /**
   * Criticality indicator used by UI (e.g. colors in Fiori).
   * Typical values: 1 = Negative, 2 = Critical, 3 = Positive
   */
  criticality : Integer;
}


/**
 * ---------------------------------------------------------------------------
 * Entity: Urgency
 * ---------------------------------------------------------------------------
 * Code list defining the urgency level of an incident.
 */
entity Urgency : CodeList {

  /** Urgency code */
  key code : String enum {
    high   = 'H';
    medium = 'M';
    low    = 'L';
  };
}


/**
 * ---------------------------------------------------------------------------
 * Custom Data Types
 * ---------------------------------------------------------------------------
 * Improves readability and allows future validation enhancements.

Email address data type */
type EMailAddress : String;

/** Phone number data type */
type PhoneNumber  : String;