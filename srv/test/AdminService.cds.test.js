const cds = require('@sap/cds')

// Increase timeout (CAP boot can take time)
jest.setTimeout(15000)

// ✅ Correct CAP test initialization
const { GET, POST, PATCH, DELETE } = cds.test()

describe('AdminService Tests', () => {

  /**
   * ---------------------------------------------------------
   * Test 1: Create Customer
   * ---------------------------------------------------------
   */
  it('should create a customer', async () => {
    var res = await POST('/odata/v4/admin/Customers', {
      ID: 'CUST1',
      firstName: 'Sumit',
      lastName: 'Behera',
      email: 'sumit@test.com',
      phone: '1234567890',
      creditCardNo: "1234567812345678"
    })

    expect(res.status).toBe(201)
    expect(res.data.ID).toBe('CUST1')

    res = await GET("/odata/v4/admin/Customers('CUST1')")
    console.log(res.data)
  })

  /**
   * ---------------------------------------------------------
   * Test 2: Read Customer + Computed Name
   * ---------------------------------------------------------
   */
  it('should compute full name correctly', async () => {
    var res = await GET("/odata/v4/admin/Customers('CUST1')")

    expect(res.status).toBe(200)
    expect(res.data.name).toBe('Sumit Behera')
  })

  /**
   * ---------------------------------------------------------
   * Test 3: Validation (Credit Card)
   * ---------------------------------------------------------
   */
  it('should reject invalid credit card', async () => {
    var res = await expect (POST('/odata/v4/admin/Customers', {
      ID: 'CUST2',
      firstName: 'Invalid',
      creditCardNo: '0123'
    })).rejects.toBeDefined()
  })

  /**
   * ---------------------------------------------------------
   * Test 4: Update Customer
   * ---------------------------------------------------------
   */
  it('should update customer details', async () => {
    var res = await PATCH("/odata/v4/admin/Customers('CUST1')", {
      firstName: 'Updated'
    })

    expect(res.status).toBe(200)

    var updated = await GET("/odata/v4/admin/Customers('CUST1')")
    expect(updated.data.firstName).toBe('Updated')
  })
/**
 * ---------------------------------------------------------
 * Test 5: Delete Customer
 * ---------------------------------------------------------
 */
it('should delete a customer', async () => {
  // Delete
  const res = await DELETE("/odata/v4/admin/Customers('CUST1')")

  expect(res.status).toBe(204) // No Content

  // Verify deletion
  try {
    await GET("/odata/v4/admin/Customers('CUST1')")
  } catch (err) {
    expect(err.response.status).toBe(404)
  }
})
   /**
   * ---------------------------------------------------------
   * Test 6: Create Incident (Default Values)
   * ---------------------------------------------------------
   */
  it('should create incident with defaults', async () => {
    var res = await POST('/odata/v4/admin/Incidents', {
      title: 'Server Down',
      customer_ID: 'CUST1'
    })

    expect(res.status).toBe(201)
    expect(res.data.status_code).toBe('N')   // default
    expect(res.data.urgency_code).toBe('M') // default

    res = await GET("/odata/v4/admin/Incidents?$filter=customer_ID eq 'CUST1'")
    expect(res.status).toBe(200)
    expect(res.data.value.length).toBe(1)
    expect(res.data.value[0].customer_ID).toBe('CUST1')
    expect(res.data.value[0].title).toBe('Server Down')
  })


    /**
   * ---------------------------------------------------------
   * Test 7: Add Conversation Entry
   * ---------------------------------------------------------
   */
  it('should add conversation to incident', async () => {
    var incident = await POST('/odata/v4/admin/Incidents', {
      title: 'Login Issue',
      customer_ID: 'CUST1'
    })

    var incidentID = incident.data.ID

    var res = await POST(`/odata/v4/admin/Incidents(${incidentID})/conversation`, {
      ID: cds.utils.uuid(),
      message: 'User cannot login'
    })

    expect(res.status).toBe(201)
    expect(res.data.message).toBeDefined()

    res = await GET("/odata/v4/admin/Incidents?$filter=customer_ID eq 'CUST1' & $expand=conversation")
    expect(res.status).toBe(200)
    expect(res.data.value.length).toBe(2)
    expect(res.data.value[0].customer_ID).toBe('CUST1')
    expect(res.data.value[0].title).toBe('Login Issue')
    expect(res.data.value[0].conversation[0].message).toBe('User cannot login')
  })

  
  /**
   * ---------------------------------------------------------
   * Test 7: Expand Association (Customer → Incidents)
   * ---------------------------------------------------------
   */
  // it('should fetch customer with incidents', async () => {
  //   var res = await GET('/odata/v4/admin/Customers(CUST1)?$expand=incidents')

  //   expect(res.status).toBe(200)
  //   expect(res.data.incidents).toBeDefined()
  // })

})