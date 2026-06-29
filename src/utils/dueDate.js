const pad2 = (value) => String(value).padStart(2, '0')

export const formatDateOnly = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const formatDateTime = (date) =>
  `${formatDateOnly(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`

export const parseDueInput = (value) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  let year
  let month
  let day
  let hour = 0
  let minute = 0
  let hasTime = false

  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (match) {
    year = Number(match[1])
    month = Number(match[2])
    day = Number(match[3])
  } else {
    match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(trimmed)
    if (match) {
      year = Number(match[1])
      month = Number(match[2])
      day = Number(match[3])
      hour = Number(match[4])
      minute = Number(match[5])
      hasTime = true
    } else {
      match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed)
      if (match) {
        month = Number(match[1])
        day = Number(match[2])
        year = Number(match[3])
      } else {
        match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(trimmed)
        if (!match) {
          return null
        }
        month = Number(match[1])
        day = Number(match[2])
        year = Number(match[3])
        hour = Number(match[4])
        minute = Number(match[5])
        hasTime = true
      }
    }
  }

  if (
    year < 1000 ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return null
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null
  }

  return {
    date: parsed,
    hasTime,
    normalizedDisplay: hasTime ? formatDateTime(parsed) : formatDateOnly(parsed),
  }
}

export const isNowOrFuture = (date) => {
  const now = new Date()
  now.setSeconds(0, 0)
  return date.getTime() >= now.getTime()
}

export const getNotificationBody = (task) => {
  if (!task.dueAt) {
    return 'A task is due now.'
  }

  return `${task.name || 'Task'} is due at ${task.dueAt}`
}
