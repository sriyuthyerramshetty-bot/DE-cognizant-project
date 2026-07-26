const CUSTOMERS_CACHE_KEY = 'todo-app.customers-cache'
const SELECTED_CUSTOMER_IDS_STORAGE_KEY = 'todo-app.selected-customer-ids'
const ACTIVE_CUSTOMER_ID_STORAGE_KEY = 'todo-app.active-customer-id'

const TABLE_NAME = 'customers'

export class CustomerStorage {
  constructor(connection) {
    this.connection = connection
  }

  isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  parseStoredJson(key, fallbackValue) {
    if (!this.isBrowser()) {
      return fallbackValue
    }

    try {
      const raw = window.localStorage.getItem(key)

      if (!raw) {
        return fallbackValue
      }

      const parsed = JSON.parse(raw)
      return parsed ?? fallbackValue
    } catch {
      return fallbackValue
    }
  }

  // ============ Cache Methods ============

  loadCachedCustomers() {
    return this.parseStoredJson(CUSTOMERS_CACHE_KEY, [])
  }

  saveCachedCustomers(customers) {
    if (!this.isBrowser()) {
      return
    }
    window.localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(customers))
  }

  updateCachedCustomer(customer) {
    if (!this.isBrowser() || !customer) {
      return
    }

    const cached = this.loadCachedCustomers()
    const index = cached.findIndex((c) => c.id === customer.id)

    if (index >= 0) {
      cached[index] = customer
    } else {
      cached.unshift(customer)
    }

    this.saveCachedCustomers(cached)
  }

  removeCachedCustomer(customerId) {
    if (!this.isBrowser()) {
      return
    }

    const cached = this.loadCachedCustomers()
    const filtered = cached.filter((c) => c.id !== customerId)
    this.saveCachedCustomers(filtered)
  }

  // ============ Database Methods ============

  async fetchCustomers() {
    const { data, error } = await this.connection.fetchAll(TABLE_NAME, {
      orderBy: 'created_at',
      ascending: false,
    })

    if (error) {
      // Return cached data on error
      const cached = this.loadCachedCustomers()
      return { data: cached, error, fromCache: true }
    }

    const customers = data.map((row) => this.transformFromDb(row))
    
    // Update cache with fresh data
    this.saveCachedCustomers(customers)
    
    return { data: customers, error: null, fromCache: false }
  }

  async fetchCustomerById(customerId) {
    // Check cache first
    const cached = this.loadCachedCustomers()
    const cachedCustomer = cached.find((c) => c.id === customerId)

    const { data, error } = await this.connection.fetchById(TABLE_NAME, 'id', customerId)

    if (error) {
      // Return cached if available
      return { data: cachedCustomer ?? null, error, fromCache: Boolean(cachedCustomer) }
    }

    const customer = this.transformFromDb(data)
    this.updateCachedCustomer(customer)
    return { data: customer, error: null }
  }

  async fetchCustomerByPhone(phone) {
    const normalizedPhone = this.normalizePhone(phone)
    
    // Check cache first
    const cached = this.loadCachedCustomers()
    const cachedCustomer = cached.find((c) => this.normalizePhone(c.phone) === normalizedPhone)

    const { data, error } = await this.connection.fetchByField(TABLE_NAME, 'phone', normalizedPhone)

    if (error) {
      // Return cached if available
      return { data: cachedCustomer ?? null, error, fromCache: Boolean(cachedCustomer) }
    }

    if (!data) {
      return { data: null, error: null }
    }

    const customer = this.transformFromDb(data)
    this.updateCachedCustomer(customer)
    return { data: customer, error: null }
  }

  async insertCustomer(customer) {
    const dbCustomer = this.transformToDb(customer)
    const { data, error } = await this.connection.insert(TABLE_NAME, dbCustomer)

    if (error) {
      return { data: null, error }
    }

    const insertedCustomer = this.transformFromDb(data)
    this.updateCachedCustomer(insertedCustomer)
    return { data: insertedCustomer, error: null }
  }

  async updateCustomer(customerId, updates) {
    const dbUpdates = this.transformToDb(updates)
    const { data, error } = await this.connection.update(TABLE_NAME, 'id', customerId, dbUpdates)

    if (error) {
      return { data: null, error }
    }

    const updatedCustomer = this.transformFromDb(data)
    this.updateCachedCustomer(updatedCustomer)
    return { data: updatedCustomer, error: null }
  }

  async deleteCustomer(customerId) {
    const result = await this.connection.delete(TABLE_NAME, 'id', customerId)
    
    if (result.success) {
      this.removeCachedCustomer(customerId)
    }
    
    return result
  }

  // ============ Transform Helpers ============
  // Transform between DB snake_case and app camelCase

  transformFromDb(dbCustomer) {
    if (!dbCustomer) return null

    // Address is stored as JSONB in Supabase
    const address = dbCustomer.address ?? {}

    return {
      id: dbCustomer.id,
      firstName: dbCustomer.first_name ?? '',
      lastName: dbCustomer.last_name ?? '',
      phone: dbCustomer.phone ?? '',
      email: dbCustomer.email ?? '',
      address: {
        line1: address.line1 ?? '',
        city: address.city ?? '',
        state: address.state ?? '',
        postalCode: address.postalCode ?? '',
      },
      createdAt: dbCustomer.created_at ?? new Date().toISOString(),
    }
  }

  transformToDb(customer) {
    const dbCustomer = {}

    if (customer.id !== undefined) dbCustomer.id = customer.id
    if (customer.firstName !== undefined) dbCustomer.first_name = customer.firstName
    if (customer.lastName !== undefined) dbCustomer.last_name = customer.lastName
    if (customer.phone !== undefined) dbCustomer.phone = customer.phone
    if (customer.email !== undefined) dbCustomer.email = customer.email

    // Address is stored as JSONB in Supabase
    if (customer.address !== undefined) {
      dbCustomer.address = customer.address
    }

    return dbCustomer
  }

  // ============ Local Storage Methods (for selected/active state) ============

  loadSelectedCustomerIds() {
    return this.parseStoredJson(SELECTED_CUSTOMER_IDS_STORAGE_KEY, [])
  }

  saveSelectedCustomerIds(selectedCustomers) {
    if (!this.isBrowser()) {
      return
    }

    const selectedCustomerIds = selectedCustomers.map((customer) => customer.id)
    window.localStorage.setItem(SELECTED_CUSTOMER_IDS_STORAGE_KEY, JSON.stringify(selectedCustomerIds))
  }

  loadActiveCustomerId(selectedCustomers) {
    const activeCustomerId = this.parseStoredJson(ACTIVE_CUSTOMER_ID_STORAGE_KEY, null)

    if (!activeCustomerId) {
      return null
    }

    const isSelected = selectedCustomers.some((customer) => customer.id === activeCustomerId)
    return isSelected ? activeCustomerId : null
  }

  saveActiveCustomerId(activeCustomerId) {
    if (!this.isBrowser()) {
      return
    }

    if (!activeCustomerId) {
      window.localStorage.removeItem(ACTIVE_CUSTOMER_ID_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(ACTIVE_CUSTOMER_ID_STORAGE_KEY, JSON.stringify(activeCustomerId))
  }

  // ============ Utility Methods ============

  normalizePhone(value) {
    return String(value ?? '').replace(/\D/g, '')
  }

  generateUUID() {
    // Generate a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async createCustomer(payload) {
    const nameInput = String(payload?.name ?? '').trim()
    const phoneInput = String(payload?.phone ?? '').trim()
    const emailInput = String(payload?.email ?? '').trim()
    const addressInput = String(payload?.address ?? '').trim()

    if (!phoneInput) {
      return { success: false, error: 'Phone is required.', customer: null }
    }

    const normalizedPhone = this.normalizePhone(phoneInput)

    if (!normalizedPhone) {
      return { success: false, error: 'Please enter a valid phone number.', customer: null }
    }

    // Check if customer exists by phone
    const { data: existingCustomer } = await this.fetchCustomerByPhone(normalizedPhone)

    if (existingCustomer) {
      return { success: true, error: '', customer: existingCustomer, isExisting: true }
    }

    if (!nameInput) {
      return { success: false, error: 'Name is required for a new customer.', customer: null }
    }

    const nameParts = nameInput.split(/\s+/).filter(Boolean)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ')

    const newCustomer = {
      id: this.generateUUID(),
      firstName,
      lastName,
      phone: normalizedPhone,
      email: emailInput || null,
      address: {
        line1: addressInput,
        city: '',
        state: '',
        postalCode: '',
      },
      createdAt: new Date().toISOString(),
    }

    // Insert to database
    const { data: insertedCustomer, error } = await this.insertCustomer(newCustomer)

    if (error) {
      return { success: false, error: 'Failed to create customer.', customer: null }
    }

    return { success: true, error: '', customer: insertedCustomer, isExisting: false }
  }

  buildCustomerFieldUpdate(customer, fieldName, fieldValue) {
    const nextValue = String(fieldValue ?? '')

    if (fieldName === 'name') {
      const nameParts = nextValue.trim().split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] ?? ''
      const lastName = nameParts.slice(1).join(' ')

      return { firstName, lastName }
    }

    if (fieldName === 'email') {
      return { email: nextValue }
    }

    if (fieldName === 'phone') {
      return { phone: nextValue }
    }

    if (fieldName === 'address') {
      return {
        address: {
          ...(customer.address ?? {}),
          line1: nextValue,
        },
      }
    }

    return {}
  }
}
