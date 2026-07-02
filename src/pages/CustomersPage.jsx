import { useContext, useState } from 'react'
import { CustomerContext } from '../context/CustomerContext'

function CustomersPage() {
  const { selectedCustomers, addCustomerByPhone, lookupError } = useContext(CustomerContext)
  const [phoneInput, setPhoneInput] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  const handleAdd = (event) => {
    event.preventDefault()
    const ok = addCustomerByPhone(phoneInput)
    if (ok) setPhoneInput('')
  }

  const handlePopup = () => {
    setShowPopup(!showPopup)
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden p-8">
        <h1 className="text-2xl font-semibold">View Customers</h1>

        <main className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1 pb-24">
          {lookupError ? <p className="mb-3 text-sm text-red-600">{lookupError}</p> : null}

          {selectedCustomers.map((customer) => (
            <div key={customer.id} className="mb-3">
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-2 hover:border-gray-400">
                <p className="ml-1 flex-1 text-lg text-gray-900">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="mr-2 text-sm text-gray-600">{customer.phone}</p>
              </div>
            </div>
          ))}
        </main>

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
              <input className="w-full rounded border p-2" placeholder="Phone number" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
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