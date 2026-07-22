import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { todoStorage } from '../storage/storageProvider'

export const TodoContext = createContext(null)

const loadedTodoState = todoStorage.loadState()

export function TodoProvider({ children }) {
  const [tasks, setTasks] = useState(loadedTodoState.tasks)
  const [view, setView] = useState(loadedTodoState.view)
  const [nextId, setNextId] = useState(loadedTodoState.nextId)

  useEffect(() => {
    todoStorage.saveState({
      tasks,
      view,
      nextId,
    })
  }, [tasks, view, nextId])

  const createTodoFromCheckout = useCallback(
    ({ customerName, cart, customerId }) => {
      const result = todoStorage.createCheckoutTask({
        tasks,
        customerName,
        cart,
        customerId,
      })

      setTasks(result.tasks)
      setView('active')

      return {
        found: result.found,
        taskId: result.taskId,
      }
    },
    [tasks],
  )

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

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}