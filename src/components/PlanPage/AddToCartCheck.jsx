function AddToCartCheck({ addToCart, removeFromCart, cart, plan }) {

    const normalizePlanName = (value) => (value ?? '').toString().trim().toLowerCase();
    const isInCart = cart.some((p) => normalizePlanName(p?.name || p?.planName) === normalizePlanName(plan?.name));

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