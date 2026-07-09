import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const TodoContext = createContext(null)

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

const TODO_STORAGE_KEY = 'todoState'

function loadTodoState() {
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
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : initialTasks,
      view: parsed.view === 'completed' ? 'completed' : 'active',
      nextId: Number.isFinite(parsed.nextId) ? parsed.nextId : 2,
    }
  } catch {
    return {
      tasks: initialTasks,
      view: 'active',
      nextId: 2,
    }
  }
}

const loadedTodoState = loadTodoState()

export function TodoProvider({ children }) {
  const [tasks, setTasks] = useState(loadedTodoState.tasks)
  const [view, setView] = useState(loadedTodoState.view)
  const [nextId, setNextId] = useState(loadedTodoState.nextId)

  useEffect(() => {
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify({ tasks, view, nextId }),
    )
  }, [tasks, view, nextId])

  const createTodoFromCheckout = useCallback(({ customerName, cart }) => {
    const plans = Array.isArray(cart) ? cart : []
    const planNames = plans.map((plan) => plan.name).filter(Boolean)
    const customerLabel = customerName?.trim() || 'Customer'
    const planLabel = planNames.length > 0 ? planNames.join(', ') : 'saved checkout items'

    setTasks((currentTasks) => [
      {
        id: Date.now(),
        name: `Complete checkout for ${customerLabel}: ${planLabel}`,
        isEditing: false,
        isCompleted: false,
        dueAt: '',
        reminderAt: null,
        reminderNotifiedAt: null,
      },
      ...currentTasks,
    ])

    setView('active')
  }, [])

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      view,
      setView,
      nextId,
      setNextId,
      createTodoFromCheckout,
    }),
    [tasks, view, nextId, createTodoFromCheckout],
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}
