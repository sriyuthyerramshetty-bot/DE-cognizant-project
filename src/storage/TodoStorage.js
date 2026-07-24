const TODOS_CACHE_KEY = 'todo-app.todos-cache'

const TODOS_TABLE = 'todos'

export class TodoStorage {
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

  loadCachedTodos() {
    return this.parseStoredJson(TODOS_CACHE_KEY, [])
  }

  saveCachedTodos(todos) {
    if (!this.isBrowser()) return
    window.localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(todos))
  }

  updateCachedTodo(todo) {
    if (!this.isBrowser() || !todo) return

    const cached = this.loadCachedTodos()
    const index = cached.findIndex((t) => t.id === todo.id)

    if (index >= 0) {
      cached[index] = todo
    } else {
      cached.unshift(todo)
    }

    this.saveCachedTodos(cached)
  }

  removeCachedTodo(todoId) {
    if (!this.isBrowser()) return

    const cached = this.loadCachedTodos()
    const filtered = cached.filter((t) => t.id !== todoId)
    this.saveCachedTodos(filtered)
  }

  // ============ Transform Helpers ============

  transformFromDb(dbTodo) {
    if (!dbTodo) return null

    return {
      id: dbTodo.id,
      employeeId: dbTodo.employee_id,
      customerId: dbTodo.customer_id ?? null,
      cartId: dbTodo.cart_id ?? null,
      name: dbTodo.name ?? '',
      isCompleted: dbTodo.is_completed ?? false,
      dueAt: dbTodo.due_at ?? '',
      reminderAt: dbTodo.reminder_at ?? null,
      reminderNotifiedAt: dbTodo.reminder_notified_at ?? null,
      createdAt: dbTodo.created_at,
      updatedAt: dbTodo.updated_at,
      // Computed for backwards compatibility
      isEditing: false,
      isCheckoutTask: Boolean(dbTodo.cart_id),
      checkoutCustomerId: dbTodo.customer_id ?? null,
    }
  }

  transformToDb(todo) {
    const dbTodo = {}

    if (todo.id !== undefined) dbTodo.id = todo.id
    if (todo.employeeId !== undefined) dbTodo.employee_id = todo.employeeId
    if (todo.customerId !== undefined) dbTodo.customer_id = todo.customerId
    if (todo.cartId !== undefined) dbTodo.cart_id = todo.cartId
    if (todo.name !== undefined) dbTodo.name = todo.name
    if (todo.isCompleted !== undefined) dbTodo.is_completed = todo.isCompleted
    if (todo.dueAt !== undefined) dbTodo.due_at = todo.dueAt || null
    if (todo.reminderAt !== undefined) dbTodo.reminder_at = todo.reminderAt
    if (todo.reminderNotifiedAt !== undefined) dbTodo.reminder_notified_at = todo.reminderNotifiedAt
    if (todo.updatedAt !== undefined) dbTodo.updated_at = todo.updatedAt

    return dbTodo
  }

  // ============ Database Methods ============

  async fetchTodosForEmployee(employeeId) {
    const { data, error } = await this.connection.fetchAll(TODOS_TABLE, {
      orderBy: 'created_at',
      ascending: false,
    })

    if (error) {
      const cached = this.loadCachedTodos().filter((t) => t.employeeId === employeeId)
      return { data: cached, error, fromCache: true }
    }

    const todos = data
      .filter((row) => row.employee_id === employeeId)
      .map((row) => this.transformFromDb(row))

    // Update cache with employee's todos
    const otherTodos = this.loadCachedTodos().filter((t) => t.employeeId !== employeeId)
    this.saveCachedTodos([...todos, ...otherTodos])

    return { data: todos, error: null, fromCache: false }
  }

  async fetchTodoById(todoId) {
    const cached = this.loadCachedTodos()
    const cachedTodo = cached.find((t) => t.id === todoId)

    const { data, error } = await this.connection.fetchById(TODOS_TABLE, 'id', todoId)

    if (error) {
      return { data: cachedTodo ?? null, error, fromCache: Boolean(cachedTodo) }
    }

    const todo = this.transformFromDb(data)
    this.updateCachedTodo(todo)
    return { data: todo, error: null }
  }

  async insertTodo(todo) {
    const dbTodo = this.transformToDb(todo)
    const { data, error } = await this.connection.insert(TODOS_TABLE, dbTodo)

    if (error) {
      return { data: null, error }
    }

    const insertedTodo = this.transformFromDb(data)
    this.updateCachedTodo(insertedTodo)
    return { data: insertedTodo, error: null }
  }

  async updateTodo(todoId, updates) {
    const dbUpdates = this.transformToDb({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    const { data, error } = await this.connection.update(TODOS_TABLE, 'id', todoId, dbUpdates)

    if (error) {
      return { data: null, error }
    }

    const updatedTodo = this.transformFromDb(data)
    this.updateCachedTodo(updatedTodo)
    return { data: updatedTodo, error: null }
  }

  async deleteTodo(todoId) {
    const result = await this.connection.delete(TODOS_TABLE, 'id', todoId)

    if (result.success) {
      this.removeCachedTodo(todoId)
    }

    return result
  }

  // ============ High-Level Methods ============

  async createTodo(employeeId, payload) {
    const name = String(payload?.name ?? '').trim()

    if (!name) {
      return { success: false, error: 'Task name is required.', todo: null }
    }

    const newTodo = {
      id: this.generateUUID(),
      employeeId,
      customerId: payload.customerId ?? null,
      cartId: payload.cartId ?? null,
      name,
      isCompleted: false,
      dueAt: payload.dueAt ?? null,
      reminderAt: payload.reminderAt ?? null,
      reminderNotifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: insertedTodo, error } = await this.insertTodo(newTodo)

    if (error) {
      return { success: false, error: 'Failed to create task.', todo: null }
    }

    return { success: true, error: '', todo: insertedTodo }
  }

  async toggleTodoComplete(todoId) {
    const { data: todo } = await this.fetchTodoById(todoId)

    if (!todo) {
      return { success: false, error: 'Task not found.' }
    }

    const { data: updatedTodo, error } = await this.updateTodo(todoId, {
      isCompleted: !todo.isCompleted,
    })

    if (error) {
      return { success: false, error: 'Failed to update task.' }
    }

    return { success: true, error: '', todo: updatedTodo }
  }

  async createCheckoutTask(employeeId, customerId, cartId, customerName, planNames) {
    const customerLabel = customerName?.trim() || 'Customer'
    const planLabel = planNames?.length > 0
      ? planNames.join(', ')
      : 'saved checkout items'

    const taskName = `Complete checkout for ${customerLabel}: ${planLabel}`

    // Check if checkout task already exists for this customer/cart
    const { data: existingTodos } = await this.fetchTodosForEmployee(employeeId)
    const existingTask = existingTodos.find(
      (t) => t.cartId === cartId && !t.isCompleted
    )

    if (existingTask) {
      // Update existing task
      const { data: updatedTodo, error } = await this.updateTodo(existingTask.id, {
        name: taskName,
      })

      if (error) {
        return { success: false, error: 'Failed to update task.', todo: null, found: true }
      }

      return { success: true, error: '', todo: updatedTodo, found: true, taskId: existingTask.id }
    }

    // Create new checkout task
    const { success, error, todo } = await this.createTodo(employeeId, {
      name: taskName,
      customerId,
      cartId,
    })

    if (!success) {
      return { success: false, error, todo: null, found: false }
    }

    return { success: true, error: '', todo, found: false, taskId: todo.id }
  }

  // ============ Legacy Compatibility Methods ============
  // These maintain backwards compatibility with the old localStorage-based TodoContext

  loadState(employeeId) {
    const cached = this.loadCachedTodos().filter((t) => t.employeeId === employeeId)

    return {
      tasks: cached,
      view: 'active',
      nextId: cached.length + 1,
    }
  }

  saveState({ tasks, employeeId }) {
    // Filter to only this employee's tasks when saving
    const otherTodos = this.loadCachedTodos().filter((t) => t.employeeId !== employeeId)
    this.saveCachedTodos([...tasks, ...otherTodos])
  }
}