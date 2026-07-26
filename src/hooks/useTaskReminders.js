import { useEffect } from 'react'
import { getNotificationBody } from '../utils/dueDate'

const NOTIFICATION_CHECK_INTERVAL_MS = 15000

const canSendNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'

function useTaskReminders(setTasks) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return undefined
    }


    const intervalId = window.setInterval(() => {
      if (!canSendNotifications()) {
        return
      }

      setTasks((currentTasks) => {
        const now = Date.now()
        let changed = false

        const updated = currentTasks.map((task) => {
          if (task.isCompleted || task.isEditing || !task.reminderAt || task.reminderNotifiedAt) {
            return task
          }

          const reminderTimestamp = new Date(task.reminderAt).getTime()
          if (Number.isNaN(reminderTimestamp) || reminderTimestamp > now) {
            return task
          }

          changed = true
          try {
            new Notification('Task Reminder', {
              body: getNotificationBody(task),
            })
          } catch (err) {
          }

          return {
            ...task,
            reminderNotifiedAt: new Date(now).toISOString(),
          }
        })

        return changed ? updated : currentTasks
      })
    }, NOTIFICATION_CHECK_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [setTasks])
}

export default useTaskReminders
