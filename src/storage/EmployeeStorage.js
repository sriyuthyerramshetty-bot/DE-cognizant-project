const EMPLOYEES_CACHE_KEY = 'todo-app.employees-cache'
const CURRENT_EMPLOYEE_KEY = 'todo-app.current-employee'
const EMPLOYEE_CUSTOMER_VIEWS_CACHE_KEY = 'todo-app.employee-customer-views-cache'

const EMPLOYEES_TABLE = 'employees'
const EMPLOYEE_CUSTOMER_VIEWS_TABLE = 'employee_customer_views'

export class EmployeeStorage {
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

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // ============ Cache Methods ============

  loadCachedEmployees() {
    return this.parseStoredJson(EMPLOYEES_CACHE_KEY, [])
  }

  saveCachedEmployees(employees) {
    if (!this.isBrowser()) return
    window.localStorage.setItem(EMPLOYEES_CACHE_KEY, JSON.stringify(employees))
  }

  updateCachedEmployee(employee) {
    if (!this.isBrowser() || !employee) return

    const cached = this.loadCachedEmployees()
    const index = cached.findIndex((e) => e.id === employee.id)

    if (index >= 0) {
      cached[index] = employee
    } else {
      cached.unshift(employee)
    }

    this.saveCachedEmployees(cached)
  }

  loadCurrentEmployee() {
    return this.parseStoredJson(CURRENT_EMPLOYEE_KEY, null)
  }

  saveCurrentEmployee(employee) {
    if (!this.isBrowser()) return

    if (!employee) {
      localStorage.removeItem(CURRENT_EMPLOYEE_KEY)
      return
    }

    localStorage.setItem(CURRENT_EMPLOYEE_KEY, JSON.stringify(employee))
  }

  clearCurrentEmployee() {
    if (!this.isBrowser()) return
    localStorage.removeItem(CURRENT_EMPLOYEE_KEY)
  }

  // ============ Employee Customer Views Cache ============

  loadCachedCustomerViews() {
    return this.parseStoredJson(EMPLOYEE_CUSTOMER_VIEWS_CACHE_KEY, [])
  }

  saveCachedCustomerViews(views) {
    if (!this.isBrowser()) return
    window.localStorage.setItem(EMPLOYEE_CUSTOMER_VIEWS_CACHE_KEY, JSON.stringify(views))
  }

  // ============ Transform Helpers ============

  transformEmployeeFromDb(dbEmployee) {
    if (!dbEmployee) return null

    return {
      id: dbEmployee.id,
      firebaseUid: dbEmployee.firebase_uid ?? '',
      firstName: dbEmployee.first_name ?? '',
      lastName: dbEmployee.last_name ?? '',
      email: dbEmployee.email ?? '',
      role: dbEmployee.role ?? 'employee',
      createdAt: dbEmployee.created_at ?? new Date().toISOString(),
      updatedAt: dbEmployee.updated_at ?? new Date().toISOString(),
    }
  }

  transformEmployeeToDb(employee) {
    const dbEmployee = {}

    if (employee.id !== undefined) dbEmployee.id = employee.id
    if (employee.firebaseUid !== undefined) dbEmployee.firebase_uid = employee.firebaseUid
    if (employee.firstName !== undefined) dbEmployee.first_name = employee.firstName
    if (employee.lastName !== undefined) dbEmployee.last_name = employee.lastName
    if (employee.email !== undefined) dbEmployee.email = employee.email
    if (employee.role !== undefined) dbEmployee.role = employee.role
    if (employee.updatedAt !== undefined) dbEmployee.updated_at = employee.updatedAt

    return dbEmployee
  }

  transformCustomerViewFromDb(dbView) {
    if (!dbView) return null

    return {
      id: dbView.id,
      employeeId: dbView.employee_id,
      customerId: dbView.customer_id,
      lastViewedAt: dbView.last_viewed_at,
      createdAt: dbView.created_at,
    }
  }

  transformCustomerViewToDb(view) {
    const dbView = {}

    if (view.id !== undefined) dbView.id = view.id
    if (view.employeeId !== undefined) dbView.employee_id = view.employeeId
    if (view.customerId !== undefined) dbView.customer_id = view.customerId
    if (view.lastViewedAt !== undefined) dbView.last_viewed_at = view.lastViewedAt

    return dbView
  }

  // ============ Employee Database Methods ============

  async fetchEmployees() {
    const { data, error } = await this.connection.fetchAll(EMPLOYEES_TABLE, {
      orderBy: 'created_at',
      ascending: false,
    })

    if (error) {
      const cached = this.loadCachedEmployees()
      return { data: cached, error, fromCache: true }
    }

    const employees = data.map((row) => this.transformEmployeeFromDb(row))
    this.saveCachedEmployees(employees)
    return { data: employees, error: null, fromCache: false }
  }

  async fetchEmployeeById(employeeId) {
    const cached = this.loadCachedEmployees()
    const cachedEmployee = cached.find((e) => e.id === employeeId)

    const { data, error } = await this.connection.fetchById(EMPLOYEES_TABLE, 'id', employeeId)

    if (error) {
      return { data: cachedEmployee ?? null, error, fromCache: Boolean(cachedEmployee) }
    }

    const employee = this.transformEmployeeFromDb(data)
    this.updateCachedEmployee(employee)
    return { data: employee, error: null }
  }

  async fetchEmployeeByFirebaseUid(firebaseUid) {
    const cached = this.loadCachedEmployees()
    const cachedEmployee = cached.find((e) => e.firebaseUid === firebaseUid)

    const { data, error } = await this.connection.fetchByField(EMPLOYEES_TABLE, 'firebase_uid', firebaseUid)

    if (error) {
      return { data: cachedEmployee ?? null, error, fromCache: Boolean(cachedEmployee) }
    }

    if (!data) {
      return { data: null, error: null }
    }

    const employee = this.transformEmployeeFromDb(data)
    this.updateCachedEmployee(employee)
    return { data: employee, error: null }
  }

  async fetchEmployeeByEmail(email) {
    const normalizedEmail = String(email ?? '').toLowerCase().trim()
    
    const cached = this.loadCachedEmployees()
    const cachedEmployee = cached.find((e) => e.email?.toLowerCase() === normalizedEmail)

    const { data, error } = await this.connection.fetchByField(EMPLOYEES_TABLE, 'email', normalizedEmail)

    if (error) {
      return { data: cachedEmployee ?? null, error, fromCache: Boolean(cachedEmployee) }
    }

    if (!data) {
      return { data: null, error: null }
    }

    const employee = this.transformEmployeeFromDb(data)
    this.updateCachedEmployee(employee)
    return { data: employee, error: null }
  }

  async insertEmployee(employee) {
    const dbEmployee = this.transformEmployeeToDb(employee)
    const { data, error } = await this.connection.insert(EMPLOYEES_TABLE, dbEmployee)

    if (error) {
      return { data: null, error }
    }

    const insertedEmployee = this.transformEmployeeFromDb(data)
    this.updateCachedEmployee(insertedEmployee)
    return { data: insertedEmployee, error: null }
  }

  async updateEmployee(employeeId, updates) {
    const dbUpdates = this.transformEmployeeToDb({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    const { data, error } = await this.connection.update(EMPLOYEES_TABLE, 'id', employeeId, dbUpdates)

    if (error) {
      return { data: null, error }
    }

    const updatedEmployee = this.transformEmployeeFromDb(data)
    this.updateCachedEmployee(updatedEmployee)
    return { data: updatedEmployee, error: null }
  }

  // ============ Employee Customer Views Database Methods ============

  async fetchCustomerViewsForEmployee(employeeId) {
    const { data, error } = await this.connection.fetchAll(EMPLOYEE_CUSTOMER_VIEWS_TABLE, {
      orderBy: 'last_viewed_at',
      ascending: false,
    })

    if (error) {
      return { data: [], error }
    }

    // Filter by employee ID
    const views = data
      .filter((row) => row.employee_id === employeeId)
      .map((row) => this.transformCustomerViewFromDb(row))

    return { data: views, error: null }
  }

  async upsertCustomerView(employeeId, customerId) {
    // Get all views to check for existing
    const { data: allViews } = await this.connection.fetchAll(EMPLOYEE_CUSTOMER_VIEWS_TABLE)
    const existingView = allViews?.find(
      (v) => v.employee_id === employeeId && v.customer_id === customerId
    )

    if (existingView) {
      // Update last_viewed_at
      const { data, error } = await this.connection.update(
        EMPLOYEE_CUSTOMER_VIEWS_TABLE,
        'id',
        existingView.id,
        { last_viewed_at: new Date().toISOString() }
      )
      return { data: this.transformCustomerViewFromDb(data), error }
    }

    // Insert new view
    const newView = {
      id: this.generateUUID(),
      employee_id: employeeId,
      customer_id: customerId,
      last_viewed_at: new Date().toISOString(),
    }

    const { data, error } = await this.connection.insert(EMPLOYEE_CUSTOMER_VIEWS_TABLE, newView)
    return { data: this.transformCustomerViewFromDb(data), error }
  }

  async deleteCustomerView(viewId) {
    return await this.connection.delete(EMPLOYEE_CUSTOMER_VIEWS_TABLE, 'id', viewId)
  }

  // ============ High-Level Methods ============

  async createEmployee(payload) {
    const firstNameInput = String(payload?.firstName ?? '').trim()
    const lastNameInput = String(payload?.lastName ?? '').trim()
    const emailInput = String(payload?.email ?? '').trim().toLowerCase()
    const firebaseUid = String(payload?.firebaseUid ?? '').trim()
    const role = String(payload?.role ?? 'employee').trim()

    if (!firstNameInput) {
      return { success: false, error: 'First name is required.', employee: null }
    }

    if (!emailInput) {
      return { success: false, error: 'Email is required.', employee: null }
    }

    if (!firebaseUid) {
      return { success: false, error: 'Firebase UID is required.', employee: null }
    }

    // Check if employee exists by email
    const { data: existingEmployee } = await this.fetchEmployeeByEmail(emailInput)

    if (existingEmployee) {
      return { success: true, error: '', employee: existingEmployee, isExisting: true }
    }

    const newEmployee = {
      id: this.generateUUID(),
      firebaseUid,
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: insertedEmployee, error } = await this.insertEmployee(newEmployee)

    if (error) {
      return { success: false, error: 'Failed to create employee.', employee: null }
    }

    return { success: true, error: '', employee: insertedEmployee, isExisting: false }
  }
}
