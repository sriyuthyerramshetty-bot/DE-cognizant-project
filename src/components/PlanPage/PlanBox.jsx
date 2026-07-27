import AddToCartButton from './AddToCartButton.jsx'
import LineCounter from './LineCounter.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { Wifi, Zap, Smartphone, Gauge } from 'lucide-react'
import TextAsset from '../../assets/TextAssets.json'

function PlanBox({ plan }) {

    const { cart, addToCart, addLine, removeLine } = useCart();

    const normalizePlanName = (value) => (value ?? '').toString().trim().toLowerCase();
    const isInCart = cart.some((p) => normalizePlanName(p?.name || p?.planName) === normalizePlanName(plan?.name));

    return (
        <div className="relative border p-4 pb-3 rounded-lg shadow-md flex flex-col h-53 w-full overflow-hidden">
            {/* {plan.bestValue && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-l-[64px] border-t-red-500 border-l-transparent" />
                    <span className="absolute top-2 right-0.5 text-white text-[12px] font-bold text-center leading-tight w-8 rotate-45 block">{TextAsset.PlanBox.bestValue}</span>
                </div>
            )} */}
            <h2 className="text-4xl text-red-500 font-semibold mb-4">{plan.name}</h2>
            <div className="flex items-center gap-2">
                {plan.type === 'Mobile' && <Smartphone size={14} />}
                {plan.type === 'Home Internet' && <Wifi size={14} />}
                <p>{plan.type}</p>
            </div>
            <div className="flex items-center gap-2">
                {plan.network === '5G' && <Zap size={14} />}
                {plan.network === 'Fiber' && <Wifi size={14} />}
                <p>{plan.network}</p>
            </div>
            <div className="flex items-center gap-2">
                <Gauge size={14} />
                <p>{plan.speed}</p>
            </div>
            <div className="flex items-baseline justify-between gap-1 mt-auto pt-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl text-black font-bold">{plan.price.split('/')[0]}</span>
                    <span className="text-sm">/{plan.price.split('/')[1]}</span>
                </div>
                <div className="relative grid items-end justify-items-end">
                    <div
                        className={`col-start-1 row-start-1 transition-all duration-100 ease-in-out ${
                            isInCart
                                ? 'opacity-100 scale-100'
                                : 'pointer-events-none opacity-0 scale-95'
                        }`}
                    >
                        <LineCounter cart={cart} plan={plan} addLine={addLine} removeLine={removeLine} />
                    </div>
                    <div
                        className={`col-start-1 row-start-1 transition-all duration-100 ease-in-out ${
                            isInCart
                                ? 'pointer-events-none opacity-0 scale-95'
                                : 'opacity-100 scale-100'
                        }`}
                    >
                        <AddToCartButton addToCart={addToCart} cart={cart} plan={plan} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlanBox;