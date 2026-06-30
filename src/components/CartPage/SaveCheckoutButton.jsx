import TextAsset from '../../assets/TextAssets.json'

function SaveCheckoutButton({ cart, isFormValid }) {

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid;

    const handleSaveCheckout = (e) => {
        e.preventDefault();
        console.log("Checkout saved:", cart);
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