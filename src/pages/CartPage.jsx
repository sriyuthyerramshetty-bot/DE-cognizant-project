import { useCart } from '../context/CartContext.jsx'
import TextAsset from '../assets/TextAssets.json'

function CartPage() {
    const { cart, removeFromCart } = useCart();
    const total = cart.reduce((sum, plan) => {
        return sum + parseFloat(plan.price.replace(/[^0-9.]/g, ''));
    }, 0);

    return (
        <div className="px-6">
            {/* Header section */}
            <div className="pt-6 pb-4">
                <h1 className="text-2xl font-semibold">{TextAsset.CartPage.title}</h1>
                <p className="mt-2 text-slate-600">{TextAsset.CartPage.subtitle}</p>
            </div>

            {/* Two column layout */}
            <div className="flex gap-6">

                {/* Order Summary box */}
                <div className="flex-1 border rounded-lg shadow-md p-6 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">{TextAsset.CartPage.orderSummary}</h2>
                    <div className="flex flex-col gap-3 flex-1">
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

                {/* User Information box */}
                <div className="flex-1 border rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Full Name</label>
                            <input type="text" placeholder="John Doe" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Email</label>
                            <input type="email" placeholder="john@example.com" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Phone Number</label>
                            <input type="" placeholder="xxx-xxx-xxxx" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Address</label>
                            <input type="text" placeholder="123 Main St" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                        </div>
                        <button type="submit" className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                            Place Order
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default CartPage;