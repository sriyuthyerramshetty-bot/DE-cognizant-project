import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import customersData from '../../server/data/customers.json'

export const CustomerContext = createContext(null)

const CUSTOMERS_STORAGE_KEY = 'todo-app.customers'
const SELECTED_CUSTOMER_IDS_STORAGE_KEY = 'todo-app.selected-customer-ids'
const ACTIVE_CUSTOMER_ID_STORAGE_KEY = 'todo-app.active-customer-id'
const CUSTOMERS_STORAGE_VERSION_KEY = 'todo-app.customers-storage-version'
const CURRENT_CUSTOMERS_STORAGE_VERSION = '2'

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const parseStoredJson = (key, fallbackValue) => {
  if (!isBrowser()) {
    return fallbackValue
  }

  try {
    const raw = window.localStorage.getItem(key)

    if (!raw) {
      return fallbackValue
    }

    const parsed = JSON.parse(raw)
    return parsed ?? fallbackValue
  } catch {
    return fallbackValue
  }
}

const shouldHydrateFromStorage = () => {
  if (!isBrowser()) {
    return false
  }

  const storedVersion = window.localStorage.getItem(CUSTOMERS_STORAGE_VERSION_KEY)
  return storedVersion === CURRENT_CUSTOMERS_STORAGE_VERSION
}

const getInitialCustomers = () => {
  if (!shouldHydrateFromStorage()) {
    return customersData ?? []
  }

  const storedCustomers = parseStoredJson(CUSTOMERS_STORAGE_KEY, null)

  if (Array.isArray(storedCustomers) && storedCustomers.length > 0) {
    return storedCustomers
  }

  return customersData ?? []
}

const getInitialSelectedCustomers = (customers) => {
  if (!shouldHydrateFromStorage()) {
    return []
  }

  const selectedCustomerIds = parseStoredJson(SELECTED_CUSTOMER_IDS_STORAGE_KEY, [])

  if (!Array.isArray(selectedCustomerIds) || selectedCustomerIds.length === 0) {
    return []
  }

  return selectedCustomerIds
    .map((customerId) => customers.find((customer) => customer.id === customerId))
    .filter(Boolean)
}

const getInitialActiveCustomerId = (selectedCustomers) => {
  if (!shouldHydrateFromStorage()) {
    return null
  }

  const activeCustomerId = parseStoredJson(ACTIVE_CUSTOMER_ID_STORAGE_KEY, null)

  if (!activeCustomerId) {
    return null
  }

  const isSelected = selectedCustomers.some((customer) => customer.id === activeCustomerId)
  return isSelected ? activeCustomerId : null
}

const buildCustomerId = (customers) => {
  const maxId = customers.reduce((currentMaxId, customer) => {
    const match = String(customer.id ?? '').match(/^CUST-(\d+)$/)

    if (!match) {
      return currentMaxId
    }

    return Math.max(currentMaxId, Number(match[1]))
  }, 1000)

  return `CUST-${String(maxId + 1).padStart(4, '0')}`
}

export function CustomerProvider({ children }) {
  const initialCustomers = getInitialCustomers()
  const initialSelectedCustomers = getInitialSelectedCustomers(initialCustomers)
  const initialActiveCustomerId = getInitialActiveCustomerId(initialSelectedCustomers)

  const [customers, setCustomers] = useState(() => initialCustomers)
  const [selectedCustomers, setSelectedCustomers] = useState(() => initialSelectedCustomers)
  const [lookupPhone, setLookupPhone] = useState('')                   
  const [lookupError, setLookupError] = useState('')
  const [activeCustomerId, setActiveCustomerId] = useState(() => initialActiveCustomerId)

  const normalizePhone = useCallback((value) => value.replace(/\D/g, ''), [])

  const addCustomerByPhone = useCallback((phoneInput) => {
    const normalized = normalizePhone(phoneInput)
    const match = customers.find((c) => normalizePhone(c.phone) === normalized)

    if (!match) {
      setLookupError('No customer found for that phone number.')
      return false
    }

    setSelectedCustomers((prev) => {
      if (prev.some((customer) => customer.id === match.id)) {
        return prev
      }

      return [...prev, match]
    })
    setActiveCustomerId(match.id)
    setLookupError('')
    return true
  }, [customers, normalizePhone])

  const addCustomer = useCallback((payload) => {
    const nameInput = String(payload?.name ?? '').trim()
    const phoneInput = String(payload?.phone ?? '').trim()
    const emailInput = String(payload?.email ?? '').trim()
    const addressInput = String(payload?.address ?? '').trim()

    if (!phoneInput) {
      setLookupError('Phone is required.')
      return false
    }

    const normalizedPhone = normalizePhone(phoneInput)

    if (!normalizedPhone) {
      setLookupError('Please enter a valid phone number.')
      return false
    }

    const existingCustomer = customers.find(
      (customer) => normalizePhone(customer.phone) === normalizedPhone,
    )

    if (existingCustomer) {
      setSelectedCustomers((previousCustomers) => {
        const alreadySelected = previousCustomers.some(
          (customer) => customer.id === existingCustomer.id,
        )

        if (alreadySelected) {
          return previousCustomers
        }

        return [...previousCustomers, existingCustomer]
      })
      setActiveCustomerId(existingCustomer.id)
      setLookupError('')
      return true
    }

    if (!nameInput) {
      setLookupError('Name is required for a new customer.')
      return false
    }

    const nameParts = nameInput.split(/\s+/).filter(Boolean)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ')
    const nextCustomerId = buildCustomerId(customers)

    const newCustomer = {
      id: nextCustomerId,
      firstName,
      lastName,
      phone: normalizedPhone,
      email: emailInput,
      address: {
        line1: addressInput,
        city: '',
        state: '',
        postalCode: '',
      },
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    }

    setCustomers((previousCustomers) => [...previousCustomers, newCustomer])
    setSelectedCustomers((previousCustomers) => [...previousCustomers, newCustomer])
    setActiveCustomerId(newCustomer.id)
    setLookupError('')
    return true
  }, [customers, normalizePhone])

  const activeCustomer = selectedCustomers.find(
    (customer) => customer.id === activeCustomerId,
  ) ?? null

  const selectActiveCustomer = useCallback((customerId) => {
    const isCustomerAvailable = selectedCustomers.some(
      (customer) => customer.id === customerId,
    )

    if (!isCustomerAvailable) {
      return
    }

    setActiveCustomerId(customerId)
  }, [selectedCustomers])

  const removeSelectedCustomer = useCallback((customerId) => {
    setSelectedCustomers((previousCustomers) => {
      const removedIndex = previousCustomers.findIndex(
        (customer) => customer.id === customerId,
      )

      if (removedIndex === -1) {
        return previousCustomers
      }

      const nextCustomers = previousCustomers.filter(
        (customer) => customer.id !== customerId,
      )

      setActiveCustomerId((currentActiveId) => {
        if (currentActiveId !== customerId) {
          return currentActiveId
        }

        if (nextCustomers.length === 0) {
          return null
        }

        const fallbackIndex = removedIndex < nextCustomers.length
          ? removedIndex
          : nextCustomers.length - 1

        return nextCustomers[fallbackIndex].id
      })

      return nextCustomers
    })
  }, [])

  const updateActiveCustomerField = useCallback((fieldName, fieldValue) => {
    setActiveCustomerId((currentActiveId) => {
      if (!currentActiveId) {
        return currentActiveId
      }

      const nextName = String(fieldValue ?? '')

      const applyFieldUpdate = (customer) => {
        if (customer.id !== currentActiveId) {
          return customer
        }

        if (fieldName === 'name') {
          const nameParts = nextName.trim().split(/\s+/).filter(Boolean)
          const firstName = nameParts[0] ?? ''
          const lastName = nameParts.slice(1).join(' ')

          return {
            ...customer,
            firstName,
            lastName,
          }
        }

        if (fieldName === 'email') {
          return {
            ...customer,
            email: nextName,
          }
        }

        if (fieldName === 'phone') {
          return {
            ...customer,
            phone: nextName,
          }
        }

        if (fieldName === 'address') {
          return {
            ...customer,
            address: {
              ...(customer.address ?? {}),
              line1: nextName,
            },
          }
        }

        return customer
      }

      setCustomers((previousCustomers) => previousCustomers.map(applyFieldUpdate))
      setSelectedCustomers((previousCustomers) => previousCustomers.map(applyFieldUpdate))

      return currentActiveId
    })
  }, [])

  const clearCustomerHistory = useCallback(() => {
    setCustomers(customersData ?? [])
    setSelectedCustomers([])
    setActiveCustomerId(null)
    setLookupError('')
  }, [])

  useEffect(() => {
    if (!isBrowser()) {
      return
    }

    window.localStorage.setItem(CUSTOMERS_STORAGE_VERSION_KEY, CURRENT_CUSTOMERS_STORAGE_VERSION)
    window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))
  }, [customers])

  useEffect(() => {
    if (!isBrowser()) {
      return
    }

    const selectedCustomerIds = selectedCustomers.map((customer) => customer.id)
    window.localStorage.setItem(SELECTED_CUSTOMER_IDS_STORAGE_KEY, JSON.stringify(selectedCustomerIds))
  }, [selectedCustomers])

  useEffect(() => {
    if (!isBrowser()) {
      return
    }

    if (!activeCustomerId) {
      window.localStorage.removeItem(ACTIVE_CUSTOMER_ID_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(ACTIVE_CUSTOMER_ID_STORAGE_KEY, JSON.stringify(activeCustomerId))
  }, [activeCustomerId])

  const value = useMemo(() => ({
    customers,
    setCustomers,
    selectedCustomers,
    setSelectedCustomers,
    lookupPhone,
    setLookupPhone,
    lookupError,
    clearCustomerHistory,
    addCustomer,
    addCustomerByPhone,
    activeCustomerId,
    activeCustomer,
    selectActiveCustomer,
    removeSelectedCustomer,
    updateActiveCustomerField,
  }), [
    customers,
    selectedCustomers,
    lookupPhone,
    lookupError,
    clearCustomerHistory,
    addCustomer,
    addCustomerByPhone,
    activeCustomerId,
    activeCustomer,
    selectActiveCustomer,
    removeSelectedCustomer,
    updateActiveCustomerField,
  ])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}