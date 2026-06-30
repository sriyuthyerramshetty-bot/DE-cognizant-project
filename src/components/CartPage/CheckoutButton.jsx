import TextAsset from '../../assets/TextAssets.json'

function CheckoutButton ({ cart }) {

    const isEmpty = cart.length === 0;



    return (
        <button
            onClick={() => (console.log("hello"))} 
            type="submit" 
            disabled={isEmpty}
            className={`mt-2 text-white py-2 px-4 rounded-md transition-colors ${
                isEmpty 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
            {TextAsset.UserInfoBox.submitButton}
        </button>
    )
}

export default CheckoutButton;