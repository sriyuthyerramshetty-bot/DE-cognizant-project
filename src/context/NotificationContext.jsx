import { createContext, useContext, useMemo, useState } from 'react'
import Notification from '../components/Notification.jsx'
import { normalizeNotificationConfig } from './notificationState.js'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(() => normalizeNotificationConfig())

  const showNotification = (config = {}) => {
    setNotification(normalizeNotificationConfig(config))
  }

  const hideNotification = () => {
    setNotification(normalizeNotificationConfig())
  }

  const value = useMemo(() => ({
    notification,
    showNotification,
    hideNotification,
  }), [notification])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Notification
        message={notification.message}
        onDone={hideNotification}
        duration={notification.duration}
        actionLabel={notification.actionLabel}
        onAction={notification.onAction}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }

  return context
}
