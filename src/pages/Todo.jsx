import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import DueDateInput from '../components/DueDateInput'
import useTaskReminders from '../hooks/useTaskReminders'
import { useTodo } from '../context/TodoContext'
import { useCart } from '../context/CartContext'

function Todo() {
  const { tasks, filteredTasks, view, setView, loading, addTask, updateTask, toggleTask, deleteTask } = useTodo()
  const { clearCheckoutSavedForCustomer } = useCart()
  const [removingTaskIds, setRemovingTaskIds] = useState(new Set())
  const [restoringTaskIds, setRestoringTaskIds] = useState(new Set())
  const [pendingNewTask, setPendingNewTask] = useState(null) // Local state for new task being created
  const inputRef = useRef(null)
  const dueDateInputRefs = useRef(new Map())
  const editingTaskId = pendingNewTask?.id || tasks.find((task) => task.isEditing)?.id
  const hasPendingUnnamedTask = pendingNewTask && !pendingNewTask.name.trim()
  const isAddTaskDisabled = view !== 'active' || hasPendingUnnamedTask

  useEffect(() => {
    if (editingTaskId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingTaskId])

  // For reminders - we need setTasks but now we use updateTask
  const handleSetTasks = useCallback((updater) => {
    // This is for the reminder hook - it needs to update tasks
    // We'll handle this differently since tasks come from the server now
  }, [])

  useTaskReminders(handleSetTasks)

  const handleAddTask = () => {
    if (hasPendingUnnamedTask) {
      return
    }

    // Create a temporary local task for editing
    setPendingNewTask({
      id: 'pending-new',
      name: '',
      isEditing: true,
      isCompleted: false,
      dueAt: '',
      reminderAt: null,
      reminderNotifiedAt: null,
    })
  }

  const handleTaskNameChange = (taskId, value) => {
    if (taskId === 'pending-new') {
      setPendingNewTask((prev) => prev ? { ...prev, name: value } : null)
    }
    // For existing tasks, we don't update name until save
  }

  const handleTaskDueDateClear = async (taskId) => {
    if (taskId === 'pending-new') {
      setPendingNewTask((prev) => prev ? { ...prev, dueAt: '', reminderAt: null, reminderNotifiedAt: null } : null)
      return
    }
    await updateTask(taskId, { dueAt: '', reminderAt: null, reminderNotifiedAt: null })
  }

  const handleTaskDueDateCommit = async (taskId, parsedDue) => {
    if (taskId === 'pending-new') {
      setPendingNewTask((prev) => prev ? {
        ...prev,
        dueAt: parsedDue.normalizedDisplay,
        reminderAt: parsedDue.date.toISOString(),
        reminderNotifiedAt: null,
      } : null)
      return
    }
    await updateTask(taskId, {
      dueAt: parsedDue.normalizedDisplay,
      reminderAt: parsedDue.date.toISOString(),
      reminderNotifiedAt: null,
    })
  }

  const saveTaskEditing = async (task) => {
    const trimmedName = (task.name ?? '').trim()
    if (!trimmedName) {
      if (inputRef.current) {
        inputRef.current.focus()
      }
      return
    }

    const dueDateSaveResult = dueDateInputRefs.current.get(task.id)?.commitNow?.()
    if (dueDateSaveResult?.ok === false) {
      return
    }

    if (task.id === 'pending-new') {
      // Save new task to database
      const payload = {
        name: trimmedName,
        dueAt: task.dueAt || null,
        reminderAt: task.reminderAt || null,
      }
      await addTask(payload)
      setPendingNewTask(null)
    } else {
      // Update existing task
      await updateTask(task.id, { name: trimmedName, isEditing: false })
    }
  }

  const startTaskEditing = (taskId) => {
    // For now, we don't support inline editing of existing tasks the same way
    // We'd need to track local editing state separately
  }

  const handleCompleteTask = async (taskId) => {
    setRemovingTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.add(taskId)
      return nextSet
    })

    setTimeout(async () => {
      await toggleTask(taskId)

      setRemovingTaskIds((currentSet) => {
        const nextSet = new Set(currentSet)
        nextSet.delete(taskId)
        return nextSet
      })
    }, 280)
  }

  const handleRestoreTask = async (taskId) => {
    setRestoringTaskIds((currentSet) => {
      const nextSet = new Set(currentSet)
      nextSet.add(taskId)
      return nextSet
    })

    setTimeout(async () => {
      await toggleTask(taskId)

      setRestoringTaskIds((currentSet) => {
        const nextSet = new Set(currentSet)
        nextSet.delete(taskId)
        return nextSet
      })
    }, 280)
  }

  // Combine pending new task with tasks from database for display
  const displayTasks = pendingNewTask ? [pendingNewTask, ...filteredTasks] : filteredTasks

  const handleToggleTaskComplete = (task) => {
    if (task.id === 'pending-new') return
    
    if (task.isCompleted) {
      handleRestoreTask(task.id)
      return
    }

    handleCompleteTask(task.id)
  }

  const handleDeleteTask = async (taskId) => {
    if (taskId === 'pending-new') {
      setPendingNewTask(null)
      return
    }

    const taskToDelete = tasks.find((task) => task.id === taskId)
    if (taskToDelete?.checkoutCustomerId) {
      clearCheckoutSavedForCustomer(taskToDelete.checkoutCustomerId)
    }

    await deleteTask(taskId)

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-8">
      <div className="relative mb-6">
        <h1 className="text-2xl font-semibold">Good Morning, Sriyuth!</h1>
        <p className="mt-2 text-slate-600">Where would you like to start today?</p>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="absolute right-0 top-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-400"
          aria-label="Task category"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <main className="relative z-0 min-h-0 flex-1 overflow-y-auto pr-1 pb-24">
        {displayTasks.map((task) => {
          const isRemoving = removingTaskIds.has(task.id)
          const isRestoring = restoringTaskIds.has(task.id)
          const isAnimatingOut = isRemoving || isRestoring
          const isNewTask = task.id === 'pending-new'

          return (
            <div
              key={task.id}
              className={`transition-all duration-300 ease-in-out ${
                isAnimatingOut
                  ? 'overflow-hidden max-h-0 opacity-0 -translate-y-2 mb-0'
                  : 'overflow-visible max-h-28 opacity-100 translate-y-0 mb-3'
              }`}
            >
              <div
                data-task-row-id={task.id}
                className="group flex items-center gap-4 rounded-lg border border-gray-300 p-2 hover:border-gray-400"
              >
                <div className="flex w-full items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTaskComplete(task)}
                    disabled={isAnimatingOut || task.isCheckoutTask || isNewTask}
                    className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
                    aria-label={`Complete ${task.name || 'task'}`}
                    title={task.isCheckoutTask ? 'Completed checkout tasks cannot be altered' : null}
                  >
                    {isAnimatingOut || (task.isCompleted) ? <Check size={14} strokeWidth={3} /> : null}
                  </button>
                    
                  {isNewTask || task.isEditing ? (
                    <input
                      ref={isNewTask ? inputRef : null}
                      data-task-name-input="true"
                      type="text"
                      value={isNewTask ? pendingNewTask.name : task.name}
                      onChange={(event) => handleTaskNameChange(task.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          saveTaskEditing(isNewTask ? pendingNewTask : task)
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
                      ref={(element) => {
                        if (element) {
                          dueDateInputRefs.current.set(task.id, element)
                        } else {
                          dueDateInputRefs.current.delete(task.id)
                        }
                      }}
                      taskId={task.id}
                      taskName={task.name}
                      value={task.dueAt}
                      reminderAt={task.reminderAt}
                      onCommit={handleTaskDueDateCommit}
                      onClear={handleTaskDueDateClear}
                      isCompleted={task.isCompleted}
                      isEditable={task.isEditing}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (isNewTask || task.isEditing) {
                          saveTaskEditing(isNewTask ? pendingNewTask : task)
                          return
                        }

                        if (task.isCompleted) {
                          return
                        }

                        startTaskEditing(task.id)
                      }}
                      className={`rounded-md p-1.5 text-gray-600 transition-all duration-200 hover:text-black ${
                        task.isCompleted
                          ? 'opacity-0 pointer-events-none'
                          : isNewTask || task.isEditing
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={isNewTask || task.isEditing ? `Save ${task.name || 'task'}` : `Edit ${task.name || 'task'}`}
                    >
                      {isNewTask || task.isEditing ? <Check size={17} /> : <Pencil size={17} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className={`rounded-md p-1.5 text-gray-600 transition-all duration-200 hover:text-black ${
                        isNewTask || task.isEditing
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
        + Add Task
      </button>
    </div>
  )
}

export default Todo