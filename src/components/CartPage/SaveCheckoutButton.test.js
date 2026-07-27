import test from 'node:test'
import assert from 'node:assert/strict'

import { isCheckoutFormReady, isSaveCheckoutButtonDisabled } from './SaveCheckoutButton.logic.js'

test('treats a selected customer with a name and phone as ready for checkout', () => {
  assert.equal(
    isCheckoutFormReady({
      activeCustomerId: 'cust-1',
      name: 'Jane Doe',
      phone: '(555) 123-4567',
    }),
    true
  )

  assert.equal(
    isCheckoutFormReady({
      activeCustomerId: null,
      name: 'Jane Doe',
      phone: '(555) 123-4567',
    }),
    false
  )

  assert.equal(
    isCheckoutFormReady({
      activeCustomerId: 'cust-1',
      name: 'Jane Doe',
      phone: '',
    }),
    false
  )
})

test('keeps checkout save disabled when the cart still matches an existing checkout task', () => {
  const tasks = [
    {
      id: 'task-1',
      customerId: 'cust-1',
      isCompleted: false,
      name: 'Complete checkout for Jane Doe: Fiber 100',
    },
  ]

  assert.equal(
    isSaveCheckoutButtonDisabled({
      isEmpty: false,
      isFormValid: true,
      isSaving: false,
      tasks,
      activeCustomerId: 'cust-1',
      cart: [{ name: 'Fiber 100', lines: 1 }],
    }),
    true
  )
})

test('re-enables checkout save when the cart differs from the existing checkout task', () => {
  const tasks = [
    {
      id: 'task-1',
      customerId: 'cust-1',
      isCompleted: false,
      name: 'Complete checkout for Jane Doe: Fiber 100',
    },
  ]

  assert.equal(
    isSaveCheckoutButtonDisabled({
      isEmpty: false,
      isFormValid: true,
      isSaving: false,
      tasks,
      activeCustomerId: 'cust-1',
      cart: [{ name: 'Fiber 100', lines: 2 }, { name: 'Wireless 200', lines: 1 }],
    }),
    false
  )
})

test('keeps the button disabled for empty, invalid, or already-saving checkouts', () => {
  assert.equal(
    isSaveCheckoutButtonDisabled({
      isEmpty: true,
      isFormValid: true,
      isSaving: false,
      tasks: [],
      activeCustomerId: 'cust-1',
      cart: [{ name: 'Fiber 100', lines: 1 }],
    }),
    true
  )

  assert.equal(
    isSaveCheckoutButtonDisabled({
      isEmpty: false,
      isFormValid: false,
      isSaving: false,
      tasks: [],
      activeCustomerId: 'cust-1',
      cart: [{ name: 'Fiber 100', lines: 1 }],
    }),
    true
  )

  assert.equal(
    isSaveCheckoutButtonDisabled({
      isEmpty: false,
      isFormValid: true,
      isSaving: true,
      tasks: [],
      activeCustomerId: 'cust-1',
      cart: [{ name: 'Fiber 100', lines: 1 }],
    }),
    true
  )
})
