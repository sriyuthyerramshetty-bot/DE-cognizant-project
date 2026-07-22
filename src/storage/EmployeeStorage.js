import employeeData from '../../server/data/employee_data.json'

const EMPLOYEE_STORAGE_KEY = 'todo-app.employees'
const CURRENT_EMPLOYEE_KEY = 'todo-app.current-employee'

export class EmployeeStorage {
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

  loadEmployees() {
    const storedEmployees = this.parseStoredJson(EMPLOYEE_STORAGE_KEY, null)

    if (storedEmployees && typeof storedEmployees === 'object' && Object.keys(storedEmployees).length > 0) {
      return storedEmployees
    }

    return employeeData ?? {}
  }

  saveEmployees(employees) {
    if (!this.isBrowser()) {
      return
    }

    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees))
  }

  loadCurrentEmployee() {
    return this.parseStoredJson(CURRENT_EMPLOYEE_KEY, null)
  }

  saveCurrentEmployee(employee) {
    if (!this.isBrowser()) {
      return
    }

    if (!employee) {
      localStorage.removeItem(CURRENT_EMPLOYEE_KEY)
      return
    }

    localStorage.setItem(CURRENT_EMPLOYEE_KEY, JSON.stringify(employee))
  }

  clearCurrentEmployee() {
    if (!this.isBrowser()) {
      return
    }

    localStorage.removeItem(CURRENT_EMPLOYEE_KEY)
  }

  getEmployeeList() {
    const employees = this.loadEmployees()
    return Object.entries(employees).map(([key, employee]) => ({
      id: key,
      ...employee,
    }))
  }

  findEmployeeByEmail(email) {
    const employees = this.loadEmployees()
    const normalizedEmail = String(email ?? '').toLowerCase().trim()

    for (const [key, employee] of Object.entries(employees)) {
      if (String(employee.email ?? '').toLowerCase().trim() === normalizedEmail) {
        return { id: key, ...employee }
      }
    }

    return null
  }

  findEmployeeById(employeeId) {
    const employees = this.loadEmployees()
    const employee = employees[employeeId]

    if (!employee) {
      return null
    }

    return { id: employeeId, ...employee }
  }

  validateCredentials(email, password) {
    const employee = this.findEmployeeByEmail(email)

    if (!employee) {
      return { success: false, error: 'Employee not found.', employee: null }
    }

    if (employee.password !== password) {
      return { success: false, error: 'Invalid password.', employee: null }
    }

    return { success: true, error: '', employee }
  }

  createEmployee(employees, payload) {
    const nameInput = String(payload?.name ?? '').trim()
    const emailInput = String(payload?.email ?? '').trim()
    const passwordInput = String(payload?.password ?? '').trim()

    if (!nameInput) {
      return { success: false, error: 'Name is required.', employee: null }
    }

    if (!emailInput) {
      return { success: false, error: 'Email is required.', employee: null }
    }

    if (!passwordInput) {
      return { success: false, error: 'Password is required.', employee: null }
    }

    const normalizedEmail = emailInput.toLowerCase()
    const existingEmployee = Object.values(employees).find(
      (emp) => String(emp.email ?? '').toLowerCase() === normalizedEmail,
    )

    if (existingEmployee) {
      return { success: false, error: 'An employee with this email already exists.', employee: null }
    }

    const employeeNumber = Object.keys(employees).length + 1
    const employeeId = `employee${employeeNumber}`

    const newEmployee = {
      name: nameInput,
      email: normalizedEmail,
      password: passwordInput,
    }

    return {
      success: true,
      error: '',
      employee: { id: employeeId, ...newEmployee },
      employeeId,
      employeeData: newEmployee,
    }
  }

  updateEmployee(employees, employeeId, updates) {
    const employee = employees[employeeId]

    if (!employee) {
      return { success: false, error: 'Employee not found.', employees }
    }

    const updatedEmployee = {
      ...employee,
      ...updates,
    }

    return {
      success: true,
      error: '',
      employees: {
        ...employees,
        [employeeId]: updatedEmployee,
      },
    }
  }

  deleteEmployee(employees, employeeId) {
    if (!employees[employeeId]) {
      return { success: false, error: 'Employee not found.', employees }
    }

    const nextEmployees = { ...employees }
    delete nextEmployees[employeeId]

    return {
      success: true,
      error: '',
      employees: nextEmployees,
    }
  }

  getDefaultEmployees() {
    return employeeData ?? {}
  }
}
