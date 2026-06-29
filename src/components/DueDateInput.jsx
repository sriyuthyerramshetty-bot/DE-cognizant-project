import { useEffect, useState } from 'react'
import { formatDateOnly, formatDateTime, isNowOrFuture } from '../utils/dueDate'

const maybeRequestNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

function DueDateInput({
  taskId,
  taskName,
  value,
  onCommit,
  onClear,
  isCompleted = false,
  isEditable = false,
  onRequestExitEdit,
}) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [meridiem, setMeridiem] = useState('AM')
  const [containerElement, setContainerElement] = useState(null)
  const isInputDisabled = isCompleted || !isEditable
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, index) => String(currentYear + index))
  const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
  const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'))
  const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
  const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

  const hydrateFromValue = (nextValue) => {
    if (!nextValue) {
      setMonth('')
      setDay('')
      setYear('')
      setHour('')
      setMinute('')
      setMeridiem('AM')
      return
    }

    const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/.exec(nextValue)
    if (dateTimeMatch) {
      const hour24 = Number(dateTimeMatch[4])
      const minute = dateTimeMatch[5]
      const nextMeridiem = hour24 >= 12 ? 'PM' : 'AM'
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

      setYear(dateTimeMatch[1])
      setMonth(dateTimeMatch[2])
      setDay(dateTimeMatch[3])
      setHour(String(hour12).padStart(2, '0'))
      setMinute(minute)
      setMeridiem(nextMeridiem)
      return
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nextValue)
    if (dateOnlyMatch) {
      setYear(dateOnlyMatch[1])
      setMonth(dateOnlyMatch[2])
      setDay(dateOnlyMatch[3])
      setHour('')
      setMinute('')
      setMeridiem('AM')
      return
    }

    setMonth('')
    setDay('')
    setYear('')
    setHour('')
    setMinute('')
    setMeridiem('AM')
  }

  useEffect(() => {
    hydrateFromValue(value || '')
  }, [taskId, value])

  const clearAllFields = () => {
    setMonth('')
    setDay('')
    setYear('')
    setHour('')
    setMinute('')
    setMeridiem('AM')
    onClear(taskId)
  }

  const buildParsedDue = () => {
    const monthNumber = Number(month)
    const dayNumber = Number(day)
    const yearNumber = Number(year)

    if (!month || !day || !year) {
      return null
    }

    if (
      Number.isNaN(monthNumber) ||
      Number.isNaN(dayNumber) ||
      Number.isNaN(yearNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      dayNumber < 1 ||
      dayNumber > 31 ||
      yearNumber < 1000
    ) {
      return null
    }

    let hourNumber = 0
    let minuteNumber = 0
    let hasTime = false

    if ((hour && !minute) || (!hour && minute)) {
      return null
    }

    if (hour && minute) {
      const hour12 = Number(hour)
      minuteNumber = Number(minute)
      hasTime = true

      if (
        Number.isNaN(hour12) ||
        Number.isNaN(minuteNumber) ||
        hour12 < 1 ||
        hour12 > 12 ||
        minuteNumber < 0 ||
        minuteNumber > 59
      ) {
        return null
      }

      if (meridiem === 'AM') {
        hourNumber = hour12 === 12 ? 0 : hour12
      } else {
        hourNumber = hour12 === 12 ? 12 : hour12 + 12
      }
    }

    const parsed = new Date(
      yearNumber,
      monthNumber - 1,
      dayNumber,
      hourNumber,
      minuteNumber,
      0,
      0,
    )

    if (
      parsed.getFullYear() !== yearNumber ||
      parsed.getMonth() !== monthNumber - 1 ||
      parsed.getDate() !== dayNumber ||
      parsed.getHours() !== hourNumber ||
      parsed.getMinutes() !== minuteNumber
    ) {
      return null
    }

    return {
      date: parsed,
      hasTime,
      normalizedDisplay: hasTime ? formatDateTime(parsed) : formatDateOnly(parsed),
    }
  }

  const commitValue = () => {
    if (isInputDisabled) {
      return
    }

    const parsedDue = buildParsedDue()

    if (!parsedDue || !isNowOrFuture(parsedDue.date)) {
      clearAllFields()
      return
    }

    maybeRequestNotificationPermission()
    hydrateFromValue(parsedDue.normalizedDisplay)
    onCommit(taskId, parsedDue)
  }

  const commitIfLeavingControl = () => {
    if (isInputDisabled) {
      return
    }

    setTimeout(() => {
      if (!containerElement) {
        return
      }

      if (!containerElement.contains(document.activeElement)) {
        commitValue()
      }
    }, 0)
  }

  const handleEnterCommit = (event) => {
    if (isInputDisabled) {
      return
    }

    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    commitValue()
    onRequestExitEdit?.()
    event.currentTarget.blur()
  }

  return (
    <div
      ref={setContainerElement}
      className="flex items-center gap-1"
      onBlur={commitIfLeavingControl}
      aria-label={`Due date inputs for ${taskName || 'task'}`}
    >
      <select
        value={month}
        disabled={isInputDisabled}
        onChange={(event) => setMonth(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-[50px] rounded-md border px-1 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`Month for ${taskName || 'task'}`}
      >
        <option value="">MM</option>
        {monthOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-gray-400">/</span>
      <select
        value={day}
        disabled={isInputDisabled}
        onChange={(event) => setDay(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-12 rounded-md border px-1 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`Day for ${taskName || 'task'}`}
      >
        <option value="">DD</option>
        {dayOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-gray-400">/</span>
      <select
        value={year}
        disabled={isInputDisabled}
        onChange={(event) => setYear(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-16 rounded-md border px-2 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`Year for ${taskName || 'task'}`}
      >
        <option value="">YYYY</option>
        {yearOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        value={hour}
        disabled={isInputDisabled}
        onChange={(event) => setHour(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-14 rounded-md border px-2 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`Hour for ${taskName || 'task'} (optional)`}
      >
        <option value="">hh</option>
        {hourOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-gray-400">:</span>
      <select
        value={minute}
        disabled={isInputDisabled}
        onChange={(event) => setMinute(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-14 rounded-md border px-2 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`Minute for ${taskName || 'task'} (optional)`}
      >
        <option value="">mm</option>
        {minuteOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        value={meridiem}
        disabled={isInputDisabled}
        onChange={(event) => setMeridiem(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-14 rounded-md border px-2 py-1 text-xs outline-none ${
          isInputDisabled
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
        }`}
        aria-label={`AM or PM for ${taskName || 'task'}`}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

export default DueDateInput
