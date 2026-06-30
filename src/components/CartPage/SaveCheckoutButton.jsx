import TextAsset from '../../assets/TextAssets.json'

function SaveCheckoutButton({ cart }) {

    const isEmpty = cart.length === 0;

    return (
        <button
            onClick={() => (console.log("save checkout clicked"))}
            type="submit"
            disabled={isEmpty}
            className={`mt-2 text-white py-2 px-4 rounded-md transition-colors ${
                isEmpty
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
        >
            {TextAsset.UserInfoBox.saveCheckoutButton}
        </button>
    )
}

export default SaveCheckoutButton;