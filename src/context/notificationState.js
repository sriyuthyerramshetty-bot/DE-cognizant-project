export function normalizeNotificationConfig({
  message = '',
  duration = 8000,
  actionLabel = '',
  onAction,
} = {}) {
  return {
    message,
    duration,
    actionLabel,
    onAction,
  }
}
