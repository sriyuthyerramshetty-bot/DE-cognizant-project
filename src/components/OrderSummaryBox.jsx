import TextAsset from '../assets/TextAssets.json'

function OrderSummaryBox ({ cart, removeFromCart }) {

    const total = cart.reduce((sum, plan) => {
        return sum + parseFloat(plan.price.replace(/[^0-9.]/g, ''));
    }, 0);
    
    return (
        <div className="flex-1 border rounded-lg shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">{TextAsset.CartPage.orderSummary}</h2>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 pr-3">
                {cart.length === 0 ? (
                    <p className="text-gray-500">{TextAsset.CartPage.emptyMessage}</p>
                ) : (
                    cart.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-gray-500">{plan.type} · {plan.speed}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">{plan.price}</span>
                                <button
                                    onClick={() => removeFromCart(plan.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl">${total.toFixed(2)}/mo</span>
                </div>
            )}
        </div>
    )
}

export default OrderSummaryBox;