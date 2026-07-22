const TODO_STORAGE_KEY = 'todoState'

const initialTasks = [
  {
    id: 1,
    name: 'Jogging',
    isEditing: false,
    isCompleted: false,
    dueAt: '',
    reminderAt: null,
    reminderNotifiedAt: null,
  },
]

export class TodoStorage {
  loadState() {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY)

      if (!stored) {
        return {
          tasks: initialTasks,
          view: 'active',
          nextId: 2,
        }
      }

      const parsed = JSON.parse(stored)

      return {
        tasks: Array.isArray(parsed.tasks)
          ? parsed.tasks
          : initialTasks,
        view: parsed.view === 'completed'
          ? 'completed'
          : 'active',
        nextId: Number.isFinite(parsed.nextId)
          ? parsed.nextId
          : 2,
      }
    } catch {
      return {
        tasks: initialTasks,
        view: 'active',
        nextId: 2,
      }
    }
  }

  saveState({ tasks, view, nextId }) {
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify({
        tasks,
        view,
        nextId,
      }),
    )
  }

  createCheckoutTask({
    tasks,
    customerName,
    cart,
    customerId,
  }) {
    const plans = Array.isArray(cart) ? cart : []

    const planNames = plans
      .map((plan) => plan.name)
      .filter(Boolean)

    const customerLabel =
      customerName?.trim() || 'Customer'

    const planLabel =
      planNames.length > 0
        ? planNames.join(', ')
        : 'saved checkout items'

    const taskName =
      `Complete checkout for ${customerLabel}: ${planLabel}`

    let found = false
    let taskId = null

    const nextTasks = [...tasks]

    const existingIndex = nextTasks.findIndex(
      (task) =>
        task.isCheckoutTask === true &&
        task.checkoutCustomerId === customerId &&
        !task.isCompleted,
    )

    if (existingIndex >= 0) {
      found = true
      taskId = nextTasks[existingIndex].id

      nextTasks[existingIndex] = {
        ...nextTasks[existingIndex],
        name: taskName,
        isEditing: false,
      }
    } else {
      const newTask = {
        id: Date.now(),
        name: taskName,
        isEditing: false,
        isCompleted: false,
        dueAt: '',
        reminderAt: null,
        reminderNotifiedAt: null,
        isCheckoutTask: true,
        checkoutCustomerId: customerId ?? null,
      }

      taskId = newTask.id
      nextTasks.unshift(newTask)
    }

    return {
      tasks: nextTasks,
      found,
      taskId,
    }
  }
}