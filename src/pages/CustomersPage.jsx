import { useContext, useState } from 'react'
import { CustomerContext } from '../context/CustomerContext'
import { Info, Trash2 } from 'lucide-react'

function CustomersPage() {
  const {
    selectedCustomers,
    addCustomerByPhone,
    lookupError,
    activeCustomerId,
    selectActiveCustomer,
    removeSelectedCustomer,
  } = useContext(CustomerContext)
  const [phoneInput, setPhoneInput] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [infoCustomerId, setInfoCustomerId] = useState(null)

  const handleAdd = (event) => {
    setShowPopup(false)
    event.preventDefault()
    const ok = addCustomerByPhone(phoneInput)
    if (ok) setPhoneInput('')
  }

  const handlePopup = () => {
    setShowPopup(!showPopup)
  }

  const handlePhoneInputChange = (event) => {
    setPhoneInput(event.target.value)
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

  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">View Customers</h1>
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
            <h2 className="text-lg font-semibold">New Customer</h2>

            <form className="mt-3 space-y-3" onSubmit={handleAdd}>
              <input className="w-full rounded border p-2" placeholder="Phone number" value={phoneInput} onChange={handlePhoneInputChange} />
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