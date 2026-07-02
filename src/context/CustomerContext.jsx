import { createContext, useMemo, useState } from 'react'
import customersData from '../data/customers.json'

export const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(customersData ?? [])      // master list
  const [selectedCustomers, setSelectedCustomers] = useState([])       // added by phone
  const [lookupPhone, setLookupPhone] = useState('')                   // input value
  const [lookupError, setLookupError] = useState('')

  const normalizePhone = (value) => value.replace(/\D/g, '')

  const addCustomerByPhone = (phoneInput) => {
    const normalized = normalizePhone(phoneInput)
    const match = customers.find((c) => normalizePhone(c.phone) === normalized)

    if (!match) {
      setLookupError('No customer found for that phone number.')
      return false
    }

    setSelectedCustomers((prev) =>
      prev.some((c) => c.id === match.id) ? prev : [...prev, match]
    )
    setLookupError('')
    return true
  }

  const value = useMemo(() => ({
    customers,
    setCustomers,
    selectedCustomers,
    setSelectedCustomers,
    lookupPhone,
    setLookupPhone,
    lookupError,
    addCustomerByPhone,
  }), [customers, selectedCustomers, lookupPhone, lookupError])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}