import TextAsset from '../../assets/TextAssets.json'

function CheckoutButton ({ cart, isFormValid }) {

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid;

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        console.log("Order placed:", cart);
    };

    return (
        <button
            onClick={handlePlaceOrder} 
            type="button" 
            disabled={isDisabled}
            className={`mt-2 text-white py-2 px-4 rounded-md transition-colors ${
                isDisabled 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
            {TextAsset.UserInfoBox.submitButton}
        </button>
    )
}

export default CheckoutButton;