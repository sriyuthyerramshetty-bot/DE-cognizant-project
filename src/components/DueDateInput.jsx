import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
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

const isTodayOrFutureDate = (date) => {
  const selectedDay = new Date(date)
  selectedDay.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return selectedDay.getTime() >= today.getTime()
}

// Convert the saved task value (+ reminder) into the editing field state.
const hydrateStateFromValue = (value, reminderAt) => {
  const empty = { date: null, timeText: '', meridiem: 'AM' }
  if (!value) {
    return empty
  }

  const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/.exec(value)
  if (dateTimeMatch) {
    const year = Number(dateTimeMatch[1])
    const month = Number(dateTimeMatch[2])
    const day = Number(dateTimeMatch[3])
    const hour = Number(dateTimeMatch[4])
    const minute = Number(dateTimeMatch[5])
    const date = new Date(year, month - 1, day, 0, 0, 0, 0)
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return {
      date: Number.isNaN(date.getTime()) ? null : date,
      timeText: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      meridiem: hour >= 12 ? 'PM' : 'AM',
    }
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const month = Number(dateOnlyMatch[2])
    const day = Number(dateOnlyMatch[3])
    const date = new Date(year, month - 1, day, 0, 0, 0, 0)
    const reminderDate = reminderAt ? new Date(reminderAt) : null
    const hasTime =
      reminderDate instanceof Date &&
      !Number.isNaN(reminderDate.getTime()) &&
      (reminderDate.getHours() !== 0 || reminderDate.getMinutes() !== 0)

    if (hasTime) {
      const hour = reminderDate.getHours()
      const minute = reminderDate.getMinutes()
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      return {
        date: Number.isNaN(date.getTime()) ? null : date,
        timeText: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        meridiem: hour >= 12 ? 'PM' : 'AM',
      }
    }

    return {
      date: Number.isNaN(date.getTime()) ? null : date,
      timeText: '',
      meridiem: 'AM',
    }
  }

  return empty
}

// Build a normalized due object from the current editing fields, or null if incomplete/invalid.
const buildParsedDue = (selectedDate, timeText, meridiem) => {
  if (!selectedDate) {
    return null
  }

  const yearNumber = selectedDate.getFullYear()
  const monthNumber = selectedDate.getMonth() + 1
  const dayNumber = selectedDate.getDate()
  const hasTypedTime = Boolean(timeText.trim())

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

  const parsed = new Date(yearNumber, monthNumber - 1, dayNumber, hourNumber, minuteNumber, 0, 0)

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

const DueDateInput = forwardRef(function DueDateInput({
  taskId,
  taskName,
  value,
  reminderAt = null,
  onCommit,
  onClear,
  isCompleted = false,
  isEditable = false,
}, ref) {
  const [draft, setDraft] = useState({ selectedDate: null, timeText: '', meridiem: 'AM' })
  const draftRef = useRef(draft)
  const isInputDisabled = isCompleted || !isEditable
  const currentYear = new Date().getFullYear()
  const today = new Date()
  const minSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const updateDraft = (nextDraft) => {
    draftRef.current = nextDraft
    setDraft(nextDraft)
  }

  // Detect the exact transition into edit mode.
  const wasEditableRef = useRef(isEditable)

  // Hydrate the editing fields from the saved value when NOT editing, or at the
  // moment we ENTER edit mode. While actively editing we never re-hydrate, so
  // local state (including AM/PM) is the single source of truth and can't be
  // clobbered.
  useEffect(() => {
    const justEnteredEdit = isEditable && !wasEditableRef.current
    wasEditableRef.current = isEditable

    if (isEditable && !justEnteredEdit) {
      return
    }

    const hydrated = hydrateStateFromValue(value, reminderAt)
    updateDraft({
      selectedDate: hydrated.date,
      timeText: hydrated.timeText,
      meridiem: hydrated.meridiem,
    })
  }, [taskId, value, reminderAt, isEditable])

  useImperativeHandle(ref, () => ({
    commitNow: () => {
      const { selectedDate: latestDate, timeText: latestTime, meridiem: latestMeridiem } =
        draftRef.current
      const latestParsed = buildParsedDue(latestDate, latestTime, latestMeridiem)

      if (isCompleted) {
        return { ok: true, reason: 'completed' }
      }

      if (!latestParsed) {
        if (!latestDate && !latestTime.trim() && value) {
          onClear(taskId)
          return { ok: true, reason: 'cleared' }
        }

        if (!latestDate && !latestTime.trim()) {
          return { ok: true, reason: 'empty' }
        }

        return { ok: false, reason: 'invalid' }
      }

      const isValid = latestParsed.hasTime
        ? isNowOrFuture(latestParsed.date)
        : isTodayOrFutureDate(latestParsed.date)

      if (isValid) {
        maybeRequestNotificationPermission()
        onCommit(taskId, latestParsed)
        return { ok: true, reason: 'saved' }
      }

      return { ok: false, reason: 'past' }
    },
  }), [isCompleted, onClear, onCommit, taskId, value])

  const handleDateChange = (nextValue) => {
    if (!(nextValue instanceof Date) || Number.isNaN(nextValue.getTime())) {
      updateDraft({ ...draftRef.current, selectedDate: null })
      return
    }

    const normalizedDate = new Date(
      nextValue.getFullYear(),
      nextValue.getMonth(),
      nextValue.getDate(),
      0,
      0,
      0,
      0,
    )
    updateDraft({ ...draftRef.current, selectedDate: normalizedDate })
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
      className="flex items-center gap-1"
      aria-label={`Due date inputs for ${taskName || 'task'}`}
    >
      <DatePicker
        selected={draft.selectedDate}
        onChange={handleDateChange}
        onSelect={handleDateChange}
        disabled={isInputDisabled}
        dateFormat="MM/dd/yyyy"
        placeholderText="Date"
        todayButton="Today"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={11}
        minDate={minSelectableDate}
        maxDate={new Date(currentYear + 10, 11, 31)}
        portalId='root'
        popperClassName="!z-[9999]"
        className={`w-28 ${sharedInputClasses}`}
        ariaLabelledBy={`Due date for ${taskName || 'task'}`}
      />
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={draft.timeText}
        disabled={isInputDisabled}
        onChange={(event) => {
          const nextTimeText = formatTimeInput(event.target.value)
          updateDraft({ ...draftRef.current, timeText: nextTimeText })
        }}
        placeholder="hh:mm"
        className={`w-24 ${sharedInputClasses}`}
        aria-label={`Due time for ${taskName || 'task'} (optional)`}
      />
      <select
        value={draft.meridiem}
        disabled={isInputDisabled}
        onChange={(event) => {
          updateDraft({ ...draftRef.current, meridiem: event.target.value })
        }}
        className={`w-16 ${sharedInputClasses}`}
        aria-label={`AM or PM for ${taskName || 'task'} (optional)`}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

)

export default DueDateInput
