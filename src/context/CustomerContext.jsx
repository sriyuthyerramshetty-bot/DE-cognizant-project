import { createContext, useCallback, useMemo, useState } from 'react'
import customersData from '../data/customers.json'

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
  }), [
    customers,
    selectedCustomers,
    lookupPhone,
    lookupError,
    addCustomerByPhone,
    activeCustomerId,
    activeCustomer,
    selectActiveCustomer,
  ])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}