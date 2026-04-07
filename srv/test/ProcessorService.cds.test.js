const cds = require('@sap/cds')
const { DELETE: CDS_DELETE } = cds.ql

jest.setTimeout(15000)

const { GET, POST, PATCH, DELETE } = cds.test()

describe('ProcessorService Tests', () => {

  let custId

  /**
   * ---------------------------------------------------------
   * Setup: Create Customer (required for incidents)
   * ---------------------------------------------------------
   */
  beforeAll(async () => {
    custId = `CUST_${Date.now()}`

    // Direct DB insert (bypass readonly restriction)
    const db = await cds.connect.to('db')

    await db.run(
      INSERT.into('sap.capire.incidents.Customers').entries({
        ID: custId,
        firstName: 'Processor',
        lastName: 'User',
        creditCardNo: '1234567812345678'
      })
    )
  })

  /**
   * ---------------------------------------------------------
   * Test 1: Read Customers (Allowed)
   * ---------------------------------------------------------
   */
  it('should read customers (readonly)', async () => {
    const res = await GET(`/odata/v4/processor/Customers('${custId}')`)

    expect(res.status).toBe(200)
    expect(res.data.ID).toBe(custId)
  })

  /**
   * ---------------------------------------------------------
   * Test 2: Create Incident
   * ---------------------------------------------------------
   */
  it('should create incident', async () => {
    const res = await POST('/odata/v4/processor/Incidents', {
      title: 'Processor Issue',
      customer_ID: custId
    })

    expect(res.status).toBe(201)
    expect(res.data.title).toBe('Processor Issue')
  })

  /**
   * ---------------------------------------------------------
   * Test 3: Update Incident
   * ---------------------------------------------------------
   */
  it('should update incident status', async () => {
    const incident = await POST('/odata/v4/processor/Incidents', {
      title: 'Update Test',
      customer_ID: custId
    })

    const id = incident.data.ID

    const res = await PATCH(`/odata/v4/processor/Incidents(${id})`, {
      status_code: 'I'
    })

    expect(res.status).toBe(200)

    const updated = await GET(`/odata/v4/processor/Incidents(${id})`)
    expect(updated.data.status_code).toBe('I')
  })

  /**
   * ---------------------------------------------------------
   * Test 4: Add Conversation
   * ---------------------------------------------------------
   */
  it('should add conversation entry', async () => {
    const incident = await POST('/odata/v4/processor/Incidents', {
      title: 'Conversation Test',
      customer_ID: custId
    })

    const id = incident.data.ID

    const res = await POST(
      `/odata/v4/processor/Incidents(${id})/conversation`,
      {
        ID: cds.utils.uuid(),
        message: 'Processing started'
      }
    )

    expect(res.status).toBe(201)

    const expanded = await GET(
      `/odata/v4/processor/Incidents(${id})?$expand=conversation`
    )

    expect(expanded.data.conversation.length).toBe(1)
  })

  /**
   * ---------------------------------------------------------
   * Test 5: Delete Incident
   * ---------------------------------------------------------
   */
  it('should delete incident', async () => {
    const incident = await POST('/odata/v4/processor/Incidents', {
      title: 'Delete Test',
      customer_ID: custId
    })

    const id = incident.data.ID

    const res = await DELETE(`/odata/v4/processor/Incidents(${id})`)
    expect(res.status).toBe(204)

    await expect(
      GET(`/odata/v4/processor/Incidents(${id})`)
    ).rejects.toMatchObject({
      response: { status: 404 }
    })
  })

  /**
   * ---------------------------------------------------------
   * Test 6: Reject Customer Write (Readonly)
   * ---------------------------------------------------------
   */
  it('should NOT allow creating customer (readonly)', async () => {
    await expect(
      POST('/odata/v4/processor/Customers', {
        ID: 'FAIL',
        firstName: 'Should Fail'
      })
    ).rejects.toMatchObject({
      response: { status: 405 } // Method Not Allowed
    })
  })

  /**
   * ---------------------------------------------------------
   * Cleanup
   * ---------------------------------------------------------
   */
  afterAll(async () => {
    const db = await cds.connect.to('db')

    await db.run(
      CDS_DELETE.from('sap.capire.incidents.Customers').where({ ID: custId })
    )
  })
})