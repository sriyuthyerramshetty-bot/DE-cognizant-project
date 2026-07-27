import { ShoppingCart } from 'lucide-react'
import TextAsset from "../../assets/TextAssets.json"

function AddToCartButton({ addToCart, cart, plan }) {
    const normalizePlanName = (value) => (value ?? '').toString().trim().toLowerCase();
    const isInCart = cart.some((p) => normalizePlanName(p?.name || p?.planName) === normalizePlanName(plan?.name));

    return (
        <button
            onClick={() => addToCart(plan)}
            disabled={isInCart}
            className={`py-1 px-3 rounded transition-colors flex items-center gap-1 text-sm text-white ${
                isInCart
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
            }`}
        >
            {isInCart ? TextAsset.AddToCartButton.added : TextAsset.AddToCartButton.addToCart} <ShoppingCart size={14} />
        </button>
    )
}

export default AddToCartButton;