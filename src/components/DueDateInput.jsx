import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
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
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeText, setTimeText] = useState('')
  const [meridiem, setMeridiem] = useState('AM')
  const [containerElement, setContainerElement] = useState(null)
  const [isAnyCalendarOpen, setIsAnyCalendarOpen] = useState(false)
  const isInputDisabled = isCompleted || !isEditable
  const currentYear = new Date().getFullYear()

  const hydrateFromValue = (nextValue) => {
    if (!nextValue) {
      setSelectedDate(null)
      setTimeText('')
      setMeridiem('AM')
      return
    }

    const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/.exec(nextValue)
    if (dateTimeMatch) {
      const year = Number(dateTimeMatch[1])
      const month = Number(dateTimeMatch[2])
      const day = Number(dateTimeMatch[3])
      const hour = Number(dateTimeMatch[4])
      const minute = Number(dateTimeMatch[5])
      const dateValue = new Date(year, month - 1, day, 0, 0, 0, 0)
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      const nextMeridiem = hour >= 12 ? 'PM' : 'AM'

      setSelectedDate(Number.isNaN(dateValue.getTime()) ? null : dateValue)
      setTimeText(`${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
      setMeridiem(nextMeridiem)
      return
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nextValue)
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1])
      const month = Number(dateOnlyMatch[2])
      const day = Number(dateOnlyMatch[3])
      const dateValue = new Date(year, month - 1, day, 0, 0, 0, 0)
      setSelectedDate(Number.isNaN(dateValue.getTime()) ? null : dateValue)
      setTimeText('')
      setMeridiem('AM')
      return
    }

    setSelectedDate(null)
    setTimeText('')
    setMeridiem('AM')
  }

  useEffect(() => {
    hydrateFromValue(value || '')
  }, [taskId, value])

  const clearAllFields = () => {
    setSelectedDate(null)
    setTimeText('')
    setMeridiem('AM')
    onClear(taskId)
  }

  const isTodayOrFutureDate = (date) => {
    const selectedDay = new Date(date)
    selectedDay.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return selectedDay.getTime() >= today.getTime()
  }

  const buildParsedDue = () => {
    const hasTypedTime = Boolean(timeText.trim())

    if (!selectedDate && !hasTypedTime) {
      return null
    }

    if (!selectedDate && hasTypedTime) {
      return null
    }

    if (!selectedDate) {
      return null
    }

    const yearNumber = selectedDate.getFullYear()
    const monthNumber = selectedDate.getMonth() + 1
    const dayNumber = selectedDate.getDate()

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

    if (hasTypedTime) {
      const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeText.trim())
      if (!timeMatch) {
        return null
      }

      const hour12 = Number(timeMatch[1])
      minuteNumber = Number(timeMatch[2])
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
    const isValidDueValue = parsedDue
      ? (parsedDue.hasTime ? isNowOrFuture(parsedDue.date) : isTodayOrFutureDate(parsedDue.date))
      : false

    if (!isValidDueValue) {
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

    if (isAnyCalendarOpen) {
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

  const handleCalendarClose = () => {
    setIsAnyCalendarOpen(false)
    commitValue()
  }

  const formatTimeInput = (rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 4)

    if (digits.length <= 2) {
      return digits
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }

  const sharedInputClasses = `rounded-md border px-2 py-1 text-xs outline-none ${
    isInputDisabled
      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'
  }`

  return (
    <div
      ref={setContainerElement}
      className="flex items-center gap-1"
      onBlur={commitIfLeavingControl}
      aria-label={`Due date inputs for ${taskName || 'task'}`}
    >
      <DatePicker
        selected={selectedDate}
        onChange={(nextValue) => setSelectedDate(nextValue)}
        onKeyDown={handleEnterCommit}
        onCalendarOpen={() => setIsAnyCalendarOpen(true)}
        onCalendarClose={handleCalendarClose}
        disabled={isInputDisabled}
        dateFormat="MM/dd/yyyy"
        placeholderText="Date"
        todayButton="Today"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={11}
        minDate={new Date(currentYear, 0, 1)}
        maxDate={new Date(currentYear + 10, 11, 31)}
        popperClassName="z-50"
        className={`w-28 ${sharedInputClasses}`}
        ariaLabelledBy={`Due date for ${taskName || 'task'}`}
      />
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={timeText}
        disabled={isInputDisabled}
        onChange={(event) => {
          setTimeText(formatTimeInput(event.target.value))
        }}
        onKeyDown={handleEnterCommit}
        placeholder="hh:mm"
        className={`w-24 ${sharedInputClasses}`}
        aria-label={`Due time for ${taskName || 'task'} (optional)`}
      />
      <select
        value={meridiem}
        disabled={isInputDisabled}
        onChange={(event) => setMeridiem(event.target.value)}
        onKeyDown={handleEnterCommit}
        className={`w-16 ${sharedInputClasses}`}
        aria-label={`AM or PM for ${taskName || 'task'} (optional)`}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

export default DueDateInput
