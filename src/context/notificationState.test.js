import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeNotificationConfig } from './notificationState.js'

test('normalizes notification config with defaults', () => {
  assert.deepEqual(normalizeNotificationConfig(), {
    message: '',
    duration: 8000,
    actionLabel: '',
    onAction: undefined,
  })
})

test('preserves notification message and action details', () => {
  const action = () => {}

  assert.deepEqual(
    normalizeNotificationConfig({
      message: 'Checkout saved!',
      duration: 5000,
      actionLabel: 'Set due date?',
      onAction: action,
    }),
    {
      message: 'Checkout saved!',
      duration: 5000,
      actionLabel: 'Set due date?',
      onAction: action,
    }
  )
})
