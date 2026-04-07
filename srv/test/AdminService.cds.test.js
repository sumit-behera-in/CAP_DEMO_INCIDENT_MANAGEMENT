const cds = require('@sap/cds')

jest.setTimeout(15000)

const { GET, POST, PATCH, DELETE } = cds.test()

const Incidents = []

describe('AdminService Tests', () => {


  /**
  * ---------------------------------------------------------
  * Test 1: Create Customer
  * ---------------------------------------------------------
  */

  beforeAll(async () => {
    // Create base customer for incidents
    var res = await POST('/odata/v4/admin/Customers', {
      ID: 'CUST_INC',
      firstName: 'Incident',
      lastName: 'User',
      creditCardNo: '1234567812345678'
    })

    expect(res.status).toBe(201)
    expect(res.data.ID).toBe('CUST_INC')

    res = await POST('/odata/v4/admin/Customers', {
      ID: 'CUST1',
      firstName: 'Sumit',
      lastName: 'Behera',
      email: 'sumit@test.com',
      phone: '1234567890',
      creditCardNo: '1234567812345678'
    })

    expect(res.status).toBe(201)
    expect(res.data.ID).toBe('CUST1')
  })


  /**
   * ---------------------------------------------------------
   * Test 2: Read + Computed Name
   * ---------------------------------------------------------
   */
  it('should compute full name correctly', async () => {
    const res = await GET("/odata/v4/admin/Customers('CUST1')")

    expect(res.status).toBe(200)
    expect(res.data.name).toBe('Sumit Behera')
  })

  /**
   * ---------------------------------------------------------
   * Test 3: Validation
   * ---------------------------------------------------------
   */
  it('should reject invalid credit card', async () => {
    await expect(
      POST('/odata/v4/admin/Customers', {
        ID: 'CUST2',
        firstName: 'Invalid',
        creditCardNo: '0123'
      })
    ).rejects.toMatchObject({
      response: {
        status: 400
      }
    })
  })

  /**
   * ---------------------------------------------------------
   * Test 4: Update Customer
   * ---------------------------------------------------------
   */
  it('should update customer details', async () => {
    const res = await PATCH("/odata/v4/admin/Customers('CUST1')", {
      firstName: 'Updated'
    })

    expect(res.status).toBe(200)

    const updated = await GET("/odata/v4/admin/Customers('CUST1')")
    expect(updated.data.firstName).toBe('Updated')
  })



  /**
   * ---------------------------------------------------------
   * Test 5: Create Incident + Defaults
   * ---------------------------------------------------------
   */
  it('should create incident with defaults', async () => {
    const res = await POST('/odata/v4/admin/Incidents', {
      title: 'Server Down',
      customer_ID: 'CUST_INC'
    })

    expect(res.status).toBe(201)
    expect(res.data.status_code).toBe('N')
    expect(res.data.urgency_code).toBe('M')

    const list = await GET(
      "/odata/v4/admin/Incidents?$filter=customer_ID eq 'CUST_INC'"
    )

    expect(list.data.value.length).toBeGreaterThan(0)
  })

  /**
   * ---------------------------------------------------------
   * Test 6: Conversation
   * ---------------------------------------------------------
   */
  it('should add conversation to incident', async () => {
    const incident = await POST('/odata/v4/admin/Incidents', {
      title: 'Login Issue',
      customer_ID: 'CUST_INC'
    })

    const incidentID = incident.data.ID

    Incidents.push(incident.data.ID)

    const res = await POST(
      `/odata/v4/admin/Incidents(${incidentID})/conversation`,
      {
        ID: cds.utils.uuid(),
        message: 'User cannot login'
      }
    )

    expect(res.status).toBe(201)

    const expanded = await GET(
      `/odata/v4/admin/Incidents(${incidentID})?$expand=conversation`
    )

    expect(expanded.data.conversation.length).toBe(1)
    expect(expanded.data.conversation[0].message).toBe(
      'User cannot login'
    )
  })

  /**
   * ---------------------------------------------------------
   * Test 7: Expand incidents
   * ---------------------------------------------------------
   */
  it('should fetch customer with incidents', async () => {
    const res = await GET(
      "/odata/v4/admin/Customers('CUST_INC')?$expand=incidents"
    )

    expect(res.status).toBe(200)
    expect(Array.isArray(res.data.incidents)).toBe(true)
  })


  /**
   * ---------------------------------------------------------
   * CLEAN UP: Delete Multiple Customers
   * ---------------------------------------------------------
   */
  afterAll(async () => {
    const customers = ['CUST1', 'CUST_INC']
    console.log("incidents are " + Incidents)
    for (const id of Incidents) {
      const res = await DELETE(`/odata/v4/admin/Incidents('${id}')`)
      expect(res.status).toBe(204)

      await expect(
        GET(`/odata/v4/admin/Incidents('${id}')`)
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    }


    for (const id of customers) {
      const res = await DELETE(`/odata/v4/admin/Customers('${id}')`)
      expect(res.status).toBe(204)

      await expect(
        GET(`/odata/v4/admin/Customers('${id}')`)
      ).rejects.toMatchObject({
        response: { status: 404 }
      })
    }
  })
})