export function isCheckoutFormReady({ activeCustomerId, name, phone }) {
  const normalizedName = String(name ?? '').trim()
  const phoneDigits = String(phone ?? '').replace(/\D/g, '')

  return Boolean(activeCustomerId) && normalizedName !== '' && phoneDigits.length > 0
}

function normalizeCheckoutPlanSummary(entry) {
  const name = String(entry?.name ?? entry?.planName ?? '').trim()
  if (!name) {
    return ''
  }

  const lines = Number(entry?.lines ?? entry?.lineCount ?? 1) || 1
  return lines > 1 ? `${name} x${lines}` : name
}

function parseCheckoutTaskPlanSummary(task) {
  if (!task) {
    return []
  }

  const taskName = String(task.name ?? '')
  const separatorIndex = taskName.lastIndexOf(':')
  const summaryText = separatorIndex >= 0 ? taskName.slice(separatorIndex + 1).trim() : ''

  if (!summaryText || summaryText.toLowerCase() === 'saved checkout items') {
    return []
  }

  return summaryText
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .sort()
}

function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}

export function isCheckoutTodoMatchingCart({ tasks, activeCustomerId, cart }) {
  const checkoutTask = tasks?.find(
    (task) =>
      task.customerId === activeCustomerId &&
      !task.isCompleted &&
      String(task.name ?? '').startsWith('Complete checkout for')
  )

  if (!checkoutTask) {
    return false
  }

  const currentSummary = (cart ?? [])
    .map(normalizeCheckoutPlanSummary)
    .filter(Boolean)
    .sort()

  const taskSummary = parseCheckoutTaskPlanSummary(checkoutTask)

  return arraysEqual(currentSummary, taskSummary)
}

export function isSaveCheckoutButtonDisabled({ isEmpty, isFormValid, isSaving, tasks, activeCustomerId, cart }) {
  if (isEmpty || !isFormValid || isSaving) {
    return true
  }

  return isCheckoutTodoMatchingCart({ tasks, activeCustomerId, cart })
}
