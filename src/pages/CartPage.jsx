import OrderSummaryBox from '../components/CartPage/OrderSummaryBox.jsx';
import UserInfoBox from '../components/CartPage/UserInfoBox.jsx';
import { useCart } from '../context/CartContext.jsx'
import TextAsset from '../assets/TextAssets.json'

function CartPage() {
    const { cart, removeFromCart } = useCart();

    return (
        <div className="flex h-screen flex-col overflow-hidden px-6">
            {/* Header section */}
            <div className="pt-6 pb-4">
                <h1 className="text-2xl font-semibold">{TextAsset.CartPage.title}</h1>
                <p className="mt-2 text-slate-600">{TextAsset.CartPage.subtitle}</p>
            </div>
            
            {/* Two column layout */}
            <div className="flex gap-6 pb-10 flex-1 min-h-0">

                {/* Order Summary box */}
                <OrderSummaryBox cart={cart} removeFromCart={removeFromCart} />

                {/* User Information box */}
                <UserInfoBox />

            </div>
        </div>
    )
}

export default CartPage;