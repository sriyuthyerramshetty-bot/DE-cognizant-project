import { createContext, useCallback, useMemo, useState } from 'react'
import customersData from '../../server/data/customers.json'

export const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(customersData ?? [])      
  const [selectedCustomers, setSelectedCustomers] = useState([])       
  const [lookupPhone, setLookupPhone] = useState('')                   
  const [lookupError, setLookupError] = useState('')
  const [activeCustomerId, setActiveCustomerId] = useState(null)

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

  const value = useMemo(() => ({
    customers,
    setCustomers,
    selectedCustomers,
    setSelectedCustomers,
    lookupPhone,
    setLookupPhone,
    lookupError,
    addCustomerByPhone,
    activeCustomerId,
    activeCustomer,
    selectActiveCustomer,
    removeSelectedCustomer,
  }), [
    customers,
    selectedCustomers,
    lookupPhone,
    lookupError,
    addCustomerByPhone,
    activeCustomerId,
    activeCustomer,
    selectActiveCustomer,
    removeSelectedCustomer,
  ])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}