import AddToCartButton from './AddToCartButton.jsx'
import { useCart } from '../context/CartContext.jsx'
import { Wifi, Zap, Smartphone, Gauge } from 'lucide-react'
import TextAsset from '../assets/TextAssets.json'

function PlanBox({ plan }) {

    const { cart, addToCart } = useCart();

    return (
        <div className="relative border p-4 rounded-lg shadow-md flex flex-col h-48 w-full overflow-hidden">
            {plan.bestValue && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-l-[64px] border-t-red-500 border-l-transparent" />
                    <span className="absolute top-2 right-0.5 text-white text-[12px] font-bold text-center leading-tight w-8 rotate-45 block">{TextAsset.PlanBox.bestValue}</span>
                </div>
            )}
            <h2 className="text-4xl text-red-500 font-semibold mb-4">{plan.name}</h2>
            <div className="flex items-center gap-2">
                {plan.type === '5G' && <Zap size={14} />}
                {plan.type === 'Broadband' && <Wifi size={14} />}
                {plan.type === 'Mobile' && <Smartphone size={14} />}
                <p>{plan.type}</p>
            </div>
            <div className="flex items-center gap-2">
                <Gauge size={14} />
                <p>{plan.speed}</p>
            </div>
            <div className="flex items-baseline justify-between gap-1 mt-auto">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl text-black font-bold">{plan.price.split('/')[0]}</span>
                    <span className="text-sm">/{plan.price.split('/')[1]}</span>
                </div>
                <AddToCartButton addToCart={addToCart} cart={cart} plan={plan} />
            </div>
        </div>
    )
}

export default PlanBox;