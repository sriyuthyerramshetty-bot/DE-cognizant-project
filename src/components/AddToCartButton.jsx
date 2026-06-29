import { ShoppingCart } from 'lucide-react'

function AddToCartButton({ addToCart, cart, plan }) {
    const isInCart = cart.some((p) => p.id === plan.id);

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
            {isInCart ? 'Added' : 'Add to Cart'} <ShoppingCart size={14} />
        </button>
    )
}

export default AddToCartButton;