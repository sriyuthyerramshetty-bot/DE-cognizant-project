import CheckoutButton from './CheckoutButton.jsx'
import SaveCheckoutButton from './SaveCheckoutButton.jsx';
import { useCart } from '../../context/CartContext.jsx'
import TextAsset from '../../assets/TextAssets.json'
import { Save } from 'lucide-react';

function UserInfoBox () {

    const { cart } = useCart();

    return (
        <div className="flex-1 border rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{TextAsset.UserInfoBox.title}</h2>
            <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.name}</label>
                    <input type="text" placeholder="John Doe" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.email}</label>
                    <input type="email" placeholder="john@example.com" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.phone}</label>
                    <input type="tel" placeholder="xxx-xxx-xxxx" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.address}</label>
                    <input type="text" placeholder="123 Main St" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-0.1">
                    <CheckoutButton cart={cart} />
                    <SaveCheckoutButton cart={cart} />
                </div>
            </form>
        </div>
    )
}

export default UserInfoBox;