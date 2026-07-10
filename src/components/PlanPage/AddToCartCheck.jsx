function AddToCartCheck({ addToCart, cart, plan }) {

    const isInCart = cart.some((p) => p.id === plan.id);

    return (
        <input
            type="checkbox"
            checked={isInCart}
            onChange={() => addToCart(plan)}
            disabled={isInCart}
            className={`w-4 h-4 accent-red-400 ${
                isInCart
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:accent-red-500'
            }`}
        />
    )
}

export default AddToCartCheck;