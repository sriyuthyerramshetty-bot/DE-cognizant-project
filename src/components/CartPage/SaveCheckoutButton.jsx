import { useContext } from 'react'
import TextAsset from '../../assets/TextAssets.json'
import { TodoContext } from '../../context/TodoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import { useCart } from '../../context/CartContext.jsx'

function SaveCheckoutButton({ cart, isFormValid }) {
    const { createTodoFromCheckout } = useContext(TodoContext)
    const { activeCustomer } = useContext(CustomerContext)
    const { isCheckoutSaved, markCheckoutSaved } = useCart()

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid || isCheckoutSaved;
    
    const handleSaveCheckout = (e) => {
        e.preventDefault();
        const customerName = activeCustomer
            ? `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim()
            : 'Customer'

        createTodoFromCheckout({ customerName, cart })
        console.log("Checkout saved:", cart);
        markCheckoutSaved()
    };

    return (
        <button
            onClick={handleSaveCheckout}
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
    )
}

export default SaveCheckoutButton;