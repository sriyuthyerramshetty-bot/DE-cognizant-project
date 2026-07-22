import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { customerStorage } from '../storage/storageProvider'

export const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [activeCustomerId, setActiveCustomerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load customers from database on mount
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true)

      const { data: dbCustomers, error } = await customerStorage.fetchCustomers()

      if (error) {
        console.error('Failed to load customers from database:', error)
        setCustomers([])
      } else {
        setCustomers(dbCustomers ?? [])
      }

      // Load selected/active state from localStorage
      const selectedIds = customerStorage.loadSelectedCustomerIds()
      if (selectedIds.length > 0 && dbCustomers) {
        const selected = selectedIds
          .map((id) => dbCustomers.find((c) => c.id === id))
          .filter(Boolean)
        setSelectedCustomers(selected)

        const activeId = customerStorage.loadActiveCustomerId(selected)
        setActiveCustomerId(activeId)
      }

      setIsLoading(false)
    }

    loadCustomers()
  }, [])

  // Persist selected customer IDs to localStorage
  useEffect(() => {
    customerStorage.saveSelectedCustomerIds(selectedCustomers)
  }, [selectedCustomers])

  // Persist active customer ID to localStorage
  useEffect(() => {
    customerStorage.saveActiveCustomerId(activeCustomerId)
  }, [activeCustomerId])

  const normalizePhone = useCallback((value) => String(value ?? '').replace(/\D/g, ''), [])

  const addCustomerByPhone = useCallback(async (phoneInput) => {
    const normalized = normalizePhone(phoneInput)

    // First check local state
    let match = customers.find((c) => normalizePhone(c.phone) === normalized)

    // If not found locally, try database
    if (!match) {
      const { data: dbCustomer } = await customerStorage.fetchCustomerByPhone(normalized)
      if (dbCustomer) {
        match = dbCustomer
        // Add to local state if found in DB
        setCustomers((prev) => {
          if (prev.some((c) => c.id === dbCustomer.id)) return prev
          return [...prev, dbCustomer]
        })
      }
    }

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

  const addCustomer = useCallback(async (payload) => {
    const result = await customerStorage.createCustomer(payload)

    if (!result.success) {
      setLookupError(result.error)
      return false
    }

    const customer = result.customer

    if (result.isExisting) {
      // Customer already exists, just select them
      setCustomers((prev) => {
        if (prev.some((c) => c.id === customer.id)) return prev
        return [...prev, customer]
      })
    } else {
      // New customer was created in DB, add to local state
      setCustomers((prev) => [...prev, customer])
    }

    setSelectedCustomers((prev) => {
      if (prev.some((c) => c.id === customer.id)) return prev
      return [...prev, customer]
    })
    setActiveCustomerId(customer.id)
    setLookupError('')
    return true
  }, [])

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

  const updateActiveCustomerField = useCallback(async (fieldName, fieldValue) => {
    if (!activeCustomerId) {
      return
    }

    const currentCustomer = customers.find((c) => c.id === activeCustomerId)
    if (!currentCustomer) {
      return
    }

    const updates = customerStorage.buildCustomerFieldUpdate(currentCustomer, fieldName, fieldValue)

    // Update in database
    const { data: updatedCustomer, error } = await customerStorage.updateCustomer(activeCustomerId, updates)

    if (error) {
      console.error('Failed to update customer:', error)
      return
    }

    // Update local state
    const applyUpdate = (customer) => {
      if (customer.id !== activeCustomerId) {
        return customer
      }
      return updatedCustomer
    }

    setCustomers((prev) => prev.map(applyUpdate))
    setSelectedCustomers((prev) => prev.map(applyUpdate))
  }, [activeCustomerId, customers])

  const clearCustomerHistory = useCallback(() => {
    setSelectedCustomers([])
    setActiveCustomerId(null)
    setLookupError('')
  }, [])

  const refreshCustomers = useCallback(async () => {
    const { data: dbCustomers, error } = await customerStorage.fetchCustomers()

    if (error) {
      console.error('Failed to refresh customers:', error)
      return
    }

    setCustomers(dbCustomers ?? [])

    // Update selected customers with fresh data
    setSelectedCustomers((prev) => {
      return prev
        .map((selected) => dbCustomers.find((c) => c.id === selected.id))
        .filter(Boolean)
    })
  }, [])

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
    isLoading,
    refreshCustomers,
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
    isLoading,
    refreshCustomers,
  ])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}