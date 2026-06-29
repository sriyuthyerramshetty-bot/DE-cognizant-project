import { useEffect, useRef, useState } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import DueDateInput from '../components/DueDateInput'
import useTaskReminders from '../hooks/useTaskReminders'

function Todo() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Jogging',
      isEditing: false,
      isCompleted: false,
      dueAt: '',
      reminderAt: null,
      reminderNotifiedAt: null,
    },
  ])
  const [view, setView] = useState('active')
  const [removingTaskIds, setRemovingTaskIds] = useState(new Set())
  const [restoringTaskIds, setRestoringTaskIds] = useState(new Set())
  const [nextId, setNextId] = useState(2)
  const inputRef = useRef(null)
  const editingTaskId = tasks.find((task) => task.isEditing)?.id
  const hasPendingUnnamedTask = tasks.some(
    (task) => task.isEditing && !task.name.trim(),
  )
  const isAddTaskDisabled = view !== 'active' || hasPendingUnnamedTask

  useEffect(() => {
    if (editingTaskId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingTaskId])

  useTaskReminders(setTasks)

  const handleAddTask = () => {
    if (hasPendingUnnamedTask) {
      return
    }

    setTasks((currentTasks) => [
      {
        id: nextId,
        name: '',
        isEditing: true,
        isCompleted: false,
        dueAt: '',
        reminderAt: null,
        reminderNotifiedAt: null,
      },
      ...currentTasks,
    ])
    setNextId((currentId) => currentId + 1)
  }

  const handleTaskNameChange = (taskId, value) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, name: value } : task,
      ),
    )
  }

  const handleTaskDueDateClear = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              dueAt: '',
              reminderAt: null,
              reminderNotifiedAt: null,
            }
          : task,
      ),
    )
  }

  const handleTaskDueDateCommit = (taskId, parsedDue) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              dueAt: parsedDue.normalizedDisplay,
              reminderAt: parsedDue.date.toISOString(),
              reminderNotifiedAt: null,
            }
          : task,
      ),
    )
  }

  const finishTaskEditing = (taskId, nextName) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              name: (nextName ?? task.name).trim(),
              isEditing: false,
            }
          : task,
      ),
    )
  }

  const commitTaskEditing = (taskId, nextName) => {
    const trimmedName = (nextName ?? '').trim()
    if (!trimmedName) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
      return false
    }

    finishTaskEditing(taskId, trimmedName)
    return true
  }

  const startTaskEditing = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => ({
        ...task,
        isEditing: task.id === taskId,
      })),
    )
  }

  const handleCompleteTask = (taskId) => {
    setRemovingTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.add(taskId)
      return nextSet
    })

    setTimeout(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: true, isEditing: false }
            : task,
        ),
      )

      setRemovingTaskIds((currentSet) => {
        const nextSet = new Set(currentSet)
        nextSet.delete(taskId)
        return nextSet
      })
    }, 280)
  }

  const handleRestoreTask = (taskId) => {
    setRestoringTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.add(taskId)
      return nextSet
    })

    setTimeout(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: false, isEditing: false }
            : task,
        ),
      )

      setRestoringTaskIds((currentSet) => {
        const nextSet = new Set(currentSet)
        nextSet.delete(taskId)
        return nextSet
      })
    }, 280)
  }

  const visibleTasks = tasks.filter((task) => 
    view === 'active' ? !task.isCompleted : task.isCompleted,
  )

  const handleToggleTaskComplete = (task) => {
    if (task.isCompleted) {
      handleRestoreTask(task.id)
      return
    }

    handleCompleteTask(task.id)
  }

  const handleDeleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )

    setRemovingTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.delete(taskId)
      return nextSet
    })

    setRestoringTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.delete(taskId)
      return nextSet
    })
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-8">
      <h1 className="text-2xl font-semibold">Good Morning, Sriyuth!</h1>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-slate-600">Where would you like to start today?</p>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-400"
          aria-label="Task category"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <main className="relative z-0 mt-6 min-h-0 flex-1 overflow-y-auto pr-1 pb-24">
        {visibleTasks.map((task) => {
          const isRemoving = removingTaskIds.has(task.id)
          const isRestoring = restoringTaskIds.has(task.id)
          const isAnimatingOut = isRemoving || isRestoring

          return (
            <div
              key={task.id}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isAnimatingOut
                  ? 'max-h-0 opacity-0 -translate-y-2 mb-0'
                  : 'max-h-28 opacity-100 translate-y-0 mb-3'
              }`}
            >
              <div
                data-task-row-id={task.id}
                className="group flex items-center gap-4 rounded-lg border border-gray-300 p-2 hover:border-gray-400"
                onBlurCapture={() => {
                  if (!task.isEditing) {
                    return
                  }

                  setTimeout(() => {
                    const rowElement = document.querySelector(
                      `[data-task-row-id="${task.id}"]`,
                    )
                    if (!(rowElement instanceof HTMLElement)) {
                      return
                    }

                    const activeElement = document.activeElement
                    if (
                      activeElement instanceof HTMLElement &&
                      rowElement.contains(activeElement)
                    ) {
                      return
                    }

                    commitTaskEditing(task.id, task.name)
                  }, 10)
                }}
              >
                <div className="flex w-full items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTaskComplete(task)}
                    disabled={isAnimatingOut}
                    className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
                    aria-label={`Complete ${task.name || 'task'}`}
                  >
                    {isAnimatingOut || task.isCompleted ? <Check size={14} strokeWidth={3} /> : null}
                  </button>
                    
                  {task.isEditing ? (
                    <input
                      ref={task.isEditing ? inputRef : null}
                      data-task-name-input="true"
                      type="text"
                      value={task.name}
                      onChange={(event) => handleTaskNameChange(task.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          commitTaskEditing(task.id, event.currentTarget.value)
                        }
                      }}
                      placeholder="Enter task name"
                      className="ml-1 flex-1 bg-transparent text-lg outline-none"
                    />
                  ) : (
                    <p
                      className={`ml-1 flex-1 text-lg ${
                        task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {task.name}
                    </p>
                  )}

                  <div className="ml-auto mr-2 flex items-center gap-1">
                    <DueDateInput
                      taskId={task.id}
                      taskName={task.name}
                      value={task.dueAt}
                      onCommit={handleTaskDueDateCommit}
                      onClear={handleTaskDueDateClear}
                      isCompleted={task.isCompleted}
                      isEditable={task.isEditing}
                      onRequestExitEdit={() => commitTaskEditing(task.id, task.name)}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (task.isCompleted || task.isEditing) {
                          return
                        }

                        startTaskEditing(task.id)
                      }}
                      className={`rounded-md p-1.5 text-gray-600 transition-all duration-200 hover:text-black ${
                        task.isCompleted
                          ? 'opacity-0 pointer-events-none'
                          : task.isEditing
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={`Edit ${task.name || 'task'}`}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className={`rounded-md p-1.5 text-gray-600 transition-all duration-200 hover:text-black ${
                        task.isEditing
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={`Delete ${task.name || 'task'}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </main>
      <button
        type="button"
        className={isAddTaskDisabled ? 'absolute bottom-6 left-1/2 -translate-x-1/2 right-6 z-20 rounded-lg w-[720px] bg-gray-200 p-3 text-black outline outline-2 outline-gray-300 cursor-not-allowed transition-colors duration-200 ease-out' : 'absolute bottom-6 left-1/2 -translate-x-1/2 right-6 z-20 rounded-lg w-[720px] bg-white p-3 text-black outline outline-2 outline-gray-300 transition-colors duration-200 ease-out hover:bg-black hover:text-white'}
        onClick={handleAddTask}
        disabled={isAddTaskDisabled}
      >
        + Add New Task
      </button>
    </div>
  )
}

export default Todo