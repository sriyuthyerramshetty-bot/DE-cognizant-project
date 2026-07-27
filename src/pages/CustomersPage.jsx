import { useContext, useState } from 'react'
import { CustomerContext } from '../context/CustomerContext'
import { Info, Trash2 } from 'lucide-react'

function CustomersPage() {
  const {
    customers,
    selectedCustomers,
    addCustomer,
    clearCustomerHistory,
    lookupError,
    activeCustomerId,
    selectActiveCustomer,
    removeSelectedCustomer,
  } = useContext(CustomerContext)
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [showPopup, setShowPopup] = useState(false)
  const [infoCustomerId, setInfoCustomerId] = useState(null)
  const [formError, setFormError] = useState('')

  const normalizePhone = (value) => String(value ?? '').replace(/\D/g, '')

  const getDuplicatePhoneError = (form) => {
    const normalizedPhone = normalizePhone(form.phone)
    if (!normalizedPhone) {
      return ''
    }

    const matchingCustomer = customers.find(
      (customer) => normalizePhone(customer.phone) === normalizedPhone,
    )

    if (!matchingCustomer) {
      return ''
    }

    const enteredName = (form.name ?? '').trim().toLowerCase()
    const existingName = `${matchingCustomer.firstName ?? ''} ${matchingCustomer.lastName ?? ''}`.trim().toLowerCase()
    const hasNameInput = Boolean((form.name ?? '').trim())

    const enteredEmail = (form.email ?? '').trim().toLowerCase()
    const existingEmail = String(matchingCustomer.email ?? '').trim().toLowerCase()
    const hasEmailInput = Boolean((form.email ?? '').trim())

    const enteredAddress = (form.address ?? '').trim().toLowerCase()
    const existingAddress = String(matchingCustomer.address?.line1 ?? '').trim().toLowerCase()
    const hasAddressInput = Boolean((form.address ?? '').trim())

    const hasConflict =
      (hasNameInput && enteredName !== existingName) ||
      (hasEmailInput && (existingEmail ? enteredEmail !== existingEmail : true)) ||
      (hasAddressInput && (existingAddress ? enteredAddress !== existingAddress : true))

    return hasConflict ? 'A customer with that phone number already exists.' : ''
  }

  const handleAdd = async (event) => {
    event.preventDefault()

    const duplicateError = getDuplicatePhoneError(newCustomerForm)
    if (duplicateError) {
      setFormError(duplicateError)
      return
    }

    const ok = await addCustomer(newCustomerForm)

    if (!ok) {
      setFormError(lookupError || 'Unable to add customer.')
      return
    }

    setFormError('')
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
    })
    setShowPopup(false)
  }

  const handlePopup = () => {
    setShowPopup(!showPopup)
    setFormError('')
  }

  const handleInputChange = (field) => (event) => {
    const value = event.target.value

    setFormError('')
    setNewCustomerForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }))
  }

  const formatPhoneNumber = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '')

    if (digits.length === 9) {
      return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 9)}`
    }

    if (digits.length === 10) {
      return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }

    return value
  }

  const formatAddress = (address) => {
    if (!address || typeof address !== 'object') {
      return 'N/A'
    }

    const parts = [address.line1, address.city, address.state, address.postalCode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  const infoCustomer = selectedCustomers.find((customer) => customer.id === infoCustomerId) ?? null

  const handleSelectCustomer = (customerId) => {
    if (customerId === activeCustomerId) {
      return
    }

    selectActiveCustomer(customerId)
  }

  const handleRemoveCustomer = (customerId) => {
    if (infoCustomerId === customerId) {
      setInfoCustomerId(null)
    }

    removeSelectedCustomer(customerId)
  }

  const handleClearSavedCustomers = () => {
    clearCustomerHistory()
    setInfoCustomerId(null)
    setShowPopup(false)
    setFormError('')
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
    })
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">View Customers</h1>
          <button
            type="button"
            onClick={handleClearSavedCustomers}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            Reset Saved Customers
          </button>
        </div>
        <p className="mt-2 text-slate-600">Add or select a customer to get started.</p>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto pr-1 pb-24">
          {lookupError ? <p className="mb-3 text-sm text-red-600">{lookupError}</p> : null}

          {selectedCustomers.map((customer) => {
            const isSelected = customer.id === activeCustomerId

            return (
              <div key={customer.id} className="mb-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-2 hover:border-gray-400">
                  <button
                      type="button"
                      onClick={() => handleSelectCustomer(customer.id)}
                      className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
                      aria-pressed={isSelected}
                      aria-label={`Select ${customer.firstName} ${customer.lastName}`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full border transition-colors ${
                          isSelected
                            ? 'border-black bg-black'
                            : 'border-gray-400 bg-transparent'
                        }`}
                      />
                    </button>
                  <p className="ml-1 flex-1 text-lg text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="mr-2 text-sm text-gray-600">{formatPhoneNumber(customer.phone)}</p>
                  <button
                    type="button"
                    onClick={() => setInfoCustomerId(customer.id)}
                  >
                    <Info size={17} className="text-gray-400 mr-1 transition-all duration-200 hover:text-gray-600 " />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomer(customer.id)}
                    aria-label={`Remove ${customer.firstName} ${customer.lastName}`}
                  >
                    <Trash2 size={17} className="text-gray-400 mr-2 transition-all duration-200 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            )
          })}
      </main>

      {infoCustomer ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setInfoCustomerId(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">
              {infoCustomer.firstName} {infoCustomer.lastName}
            </h2>
            <div className="mt-2 text-sm text-gray-600">
              <strong>Customer ID:</strong> {infoCustomer.id}
              <br />
              <strong>Phone:</strong> {formatPhoneNumber(infoCustomer.phone)}
              <br />
              <strong>Email:</strong> {infoCustomer.email || 'N/A'}
              <br />
              <strong>Address:</strong> {formatAddress(infoCustomer.address)}
              <br />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setInfoCustomerId(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button onClick={handlePopup} className="absolute bottom-6 left-1/2 -translate-x-1/2 right-6 z-20 rounded-lg w-[720px] bg-white p-3 text-black outline outline-2 outline-gray-300 transition-colors duration-200 ease-out hover:bg-black hover:text-white">
        + Add Customer
      </button>

        {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Add New or Existing Customer</h2>

            <form className="mt-3 space-y-3" onSubmit={handleAdd}>
              <input
                className="w-full rounded border p-2"
                placeholder="Full name"
                value={newCustomerForm.name}
                onChange={handleInputChange('name')}
              />
              <input
                className="w-full rounded border p-2"
                placeholder="Phone number"
                value={newCustomerForm.phone}
                onChange={handleInputChange('phone')}
              />
              {formError ? (
                <p className="text-sm text-red-600">{formError}</p>
              ) : null}
              <input
                className="w-full rounded border p-2"
                placeholder="Email (optional)"
                value={newCustomerForm.email}
                onChange={handleInputChange('email')}
              />
              <input
                className="w-full rounded border p-2"
                placeholder="Address (optional)"
                value={newCustomerForm.address}
                onChange={handleInputChange('address')}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomersPage;