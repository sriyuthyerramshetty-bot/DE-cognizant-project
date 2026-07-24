function AddToCartCheck({ addToCart, removeFromCart, cart, plan }) {

    const isInCart = cart.some((p) => p.id === plan.id);

    return (
        <input
            type="checkbox"
            checked={isInCart}
            onChange={() => (isInCart ? removeFromCart(plan.id) : addToCart(plan))}
            className="w-4 h-4 accent-red-400 cursor-pointer hover:accent-red-500"
        />
    )
}

export default AddToCartCheck;