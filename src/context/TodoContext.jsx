import { createContext, useMemo, useState } from 'react'

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

export function TodoProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState('active')
  const [nextId, setNextId] = useState(2)

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      view,
      setView,
      nextId,
      setNextId,
    }),
    [tasks, view, nextId],
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}
