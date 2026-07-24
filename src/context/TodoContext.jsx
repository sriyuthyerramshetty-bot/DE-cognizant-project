import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { todoStorage } from '../storage/storageProvider'
import { useAuth } from './AuthContext'

export const TodoContext = createContext(null)

export function TodoProvider({ children }) {
  const { employee } = useAuth()
  const employeeId = employee?.id

  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('active')
  const [loading, setLoading] = useState(true)

  // Load todos from Supabase when employee changes
  useEffect(() => {
    const loadTodos = async () => {
      if (!employeeId) {
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data, error } = await todoStorage.fetchTodosForEmployee(employeeId)

      if (error) {
        console.error('[TodoContext] Failed to load todos:', error)
      }

      setTasks(data || [])
      setLoading(false)
    }

    loadTodos()
  }, [employeeId])

  // Add a new task
  const addTask = useCallback(
    async (payload) => {
      if (!employeeId) {
        console.error('[TodoContext] No employee ID - cannot create task')
        return { success: false, error: 'Not logged in' }
      }

      const { success, error, todo } = await todoStorage.createTodo(employeeId, payload)

      if (success && todo) {
        setTasks((prev) => [todo, ...prev])
      }

      return { success, error, todo }
    },
    [employeeId]
  )

  // Update a task
  const updateTask = useCallback(async (taskId, updates) => {
    const { data: updatedTodo, error } = await todoStorage.updateTodo(taskId, updates)

    if (error) {
      console.error('[TodoContext] Failed to update task:', error)
      return { success: false, error }
    }

    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? updatedTodo : task))
    )

    return { success: true, todo: updatedTodo }
  }, [])

  // Toggle task completion
  const toggleTask = useCallback(async (taskId) => {
    const { success, todo } = await todoStorage.toggleTodoComplete(taskId)

    if (success && todo) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? todo : task))
      )
    }

    return { success, todo }
  }, [])

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    const result = await todoStorage.deleteTodo(taskId)

    if (result.success) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    }

    return result
  }, [])

  // Create checkout task (from cart page)
  const createTodoFromCheckout = useCallback(
    async ({ customerName, cart, customerId, planNames }) => {
      if (!employeeId) {
        console.error('[TodoContext] No employee ID - cannot create checkout task')
        return { success: false, found: false }
      }

      const { success, found, taskId, todo } = await todoStorage.createCheckoutTask(
        employeeId,
        customerId,
        cart?.id,
        customerName,
        planNames
      )

      if (success && todo) {
        if (found) {
          // Updated existing task
          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? todo : task))
          )
        } else {
          // Created new task
          setTasks((prev) => [todo, ...prev])
        }
        setView('active')
      }

      return { success, found, taskId }
    },
    [employeeId]
  )

  // Filtered tasks based on current view
  const filteredTasks = useMemo(() => {
    switch (view) {
      case 'active':
        return tasks.filter((t) => !t.isCompleted)
      case 'completed':
        return tasks.filter((t) => t.isCompleted)
      default:
        return tasks
    }
  }, [tasks, view])

  const value = useMemo(
    () => ({
      tasks,
      filteredTasks,
      view,
      setView,
      loading,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      createTodoFromCheckout,
      // Legacy compatibility
      setTasks,
    }),
    [tasks, filteredTasks, view, loading, addTask, updateTask, toggleTask, deleteTask, createTodoFromCheckout]
  )

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodo() {
  return useContext(TodoContext)
}