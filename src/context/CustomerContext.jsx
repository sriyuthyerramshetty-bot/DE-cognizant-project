import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { customerStorage, employeeStorage } from '../storage/storageProvider'
import { useAuth } from './AuthContext'

export const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const { employee } = useAuth()
  const employeeId = employee?.id

  const [customers, setCustomers] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [activeCustomerId, setActiveCustomerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const lastEmployeeIdRef = useRef(null)

  // Load customers and employee's customer views when employee changes
  useEffect(() => {
    if (!employeeId) {
      setSelectedCustomers([])
      setActiveCustomerId(null)
      setIsLoading(false)
      return
    }

    // Skip if same employee
    if (lastEmployeeIdRef.current === employeeId) {
      return
    }
    lastEmployeeIdRef.current = employeeId

    const loadData = async () => {
      setIsLoading(true)

      // Fetch all customers
      const { data: dbCustomers } = await customerStorage.fetchCustomers()
      setCustomers(dbCustomers ?? [])

      // Fetch this employee's customer views
      const { data: views } = await employeeStorage.fetchCustomerViewsForEmployee(employeeId)

      if (views && views.length > 0 && dbCustomers) {
        // Map view customer IDs to actual customer objects
        const viewedCustomerIds = views.map((v) => v.customerId)
        const viewedCustomers = viewedCustomerIds
          .map((id) => dbCustomers.find((c) => c.id === id))
          .filter(Boolean)

        setSelectedCustomers(viewedCustomers)

        // Set most recently viewed as active
        if (viewedCustomers.length > 0) {
          setActiveCustomerId(viewedCustomers[0].id)
        }
      } else {
        setSelectedCustomers([])
        setActiveCustomerId(null)
      }

      setIsLoading(false)
    }

    loadData()
  }, [employeeId])

  const normalizePhone = useCallback((value) => String(value ?? '').replace(/\D/g, ''), [])

  // Save customer view to database when adding a customer
  const saveCustomerView = useCallback(async (customerId) => {
    if (!employeeId) return
    await employeeStorage.upsertCustomerView(employeeId, customerId)
  }, [employeeId])

  const addCustomerByPhone = useCallback(async (phoneInput) => {
    const normalized = normalizePhone(phoneInput)

    // First check local state
    let match = customers.find((c) => normalizePhone(c.phone) === normalized)

    // If not found locally, try database
    if (!match) {
      const { data: dbCustomer } = await customerStorage.fetchCustomerByPhone(normalized)
      if (dbCustomer) {
        match = dbCustomer
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

    // Save to employee's customer views in database
    await saveCustomerView(match.id)

    setSelectedCustomers((prev) => {
      if (prev.some((customer) => customer.id === match.id)) {
        return prev
      }
      return [...prev, match]
    })
    setActiveCustomerId(match.id)
    setLookupError('')
    return true
  }, [customers, normalizePhone, saveCustomerView])

  const addCustomer = useCallback(async (payload) => {
    const result = await customerStorage.createCustomer(payload)

    if (!result.success) {
      setLookupError(result.error)
      return false
    }

    const customer = result.customer

    if (result.isExisting) {
      setCustomers((prev) => {
        if (prev.some((c) => c.id === customer.id)) return prev
        return [...prev, customer]
      })
    } else {
      setCustomers((prev) => [...prev, customer])
    }

    // Save to employee's customer views in database
    await saveCustomerView(customer.id)

    setSelectedCustomers((prev) => {
      if (prev.some((c) => c.id === customer.id)) return prev
      return [...prev, customer]
    })
    setActiveCustomerId(customer.id)
    setLookupError('')
    return true
  }, [saveCustomerView])

  const activeCustomer = selectedCustomers.find(
    (customer) => customer.id === activeCustomerId,
  ) ?? null

  const selectActiveCustomer = useCallback(async (customerId) => {
    const isCustomerAvailable = selectedCustomers.some(
      (customer) => customer.id === customerId,
    )

    if (!isCustomerAvailable) {
      return
    }

    // Update last_viewed_at in database
    await saveCustomerView(customerId)

    setActiveCustomerId(customerId)
  }, [selectedCustomers, saveCustomerView])

  const removeSelectedCustomer = useCallback(async (customerId) => {
    // Remove from database
    if (employeeId) {
      const { data: views } = await employeeStorage.fetchCustomerViewsForEmployee(employeeId)
      const viewToDelete = views?.find((v) => v.customerId === customerId)
      if (viewToDelete) {
        await employeeStorage.deleteCustomerView(viewToDelete.id)
      }
    }

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
  }, [employeeId])

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

  const clearCustomerHistory = useCallback(async () => {
    // Remove all views from database for this employee
    if (employeeId) {
      const { data: views } = await employeeStorage.fetchCustomerViewsForEmployee(employeeId)
      if (views) {
        for (const view of views) {
          await employeeStorage.deleteCustomerView(view.id)
        }
      }
    }

    setSelectedCustomers([])
    setActiveCustomerId(null)
    setLookupError('')
  }, [employeeId])

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