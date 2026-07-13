import { useContext, useState } from 'react'
import TextAsset from '../../assets/TextAssets.json'
import { TodoContext } from '../../context/TodoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Notification from '../Notification.jsx'

function SaveCheckoutButton({ cart, isFormValid }) {
    const { createTodoFromCheckout } = useContext(TodoContext)
    const { activeCustomer } = useContext(CustomerContext)
    const { isCheckoutSaved, markCheckoutSaved } = useCart()
    const [notice, setNotice] = useState('')

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid || isCheckoutSaved;
    
    const handleSaveCheckout = (e) => {
        e.preventDefault();
        const customerName = activeCustomer
            ? `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim()
            : 'Customer'
        const customerId = activeCustomer?.id ?? null

        createTodoFromCheckout({ customerName, cart, customerId })
        const result = createTodoFromCheckout({ customerName, cart, customerId })
        markCheckoutSaved()
        if (result.found) {
            setNotice('Todo item updated successfully!')
        } else {
            setNotice('Todo item created successfully!')
        }
    };

    return (
        <>
            <button
                onClick={handleSaveCheckout                }
            type="button"
            disabled={isDisabled}
            className={`mt-2 text-white py-2 px-4 rounded-md transition-colors ${
                isDisabled
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            >
                {TextAsset.UserInfoBox.saveCheckoutButton}
            </button>

            <Notification message={notice} onDone={() => setNotice('')} duration={2600} />
        </>
    )
}

export default SaveCheckoutButton;