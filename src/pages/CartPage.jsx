import OrderSummaryBox from '../components/CartPage/OrderSummaryBox.jsx';
import UserInfoBox from '../components/CartPage/UserInfoBox.jsx';
import { useCart } from '../context/CartContext.jsx'
import TextAsset from '../assets/TextAssets.json'
import { CustomerContext } from '../context/CustomerContext.jsx';
import { useContext } from 'react';

function CartPage() {
    const { cart, removeFromCart } = useCart();
    const { selectedCustomers } = useContext(CustomerContext);

    return (
        <div className="flex h-screen flex-col overflow-hidden px-6">
            {/* Header section */}
            <div className="pt-6 pb-4">
                <h1 className="text-2xl font-semibold">
                    {selectedCustomers.length > 0
                        ? selectedCustomers.map((customer) => (
                            <p key={customer.id}>
                                {customer.firstName} {customer.lastName}'s Cart
                            </p>
                            ))
                        : TextAsset.CartPage.title}
                </h1>
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