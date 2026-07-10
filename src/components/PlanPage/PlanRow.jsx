import AddToCartCheck from "./AddToCartCheck";
import { useCart } from "../../context/CartContext";

function PlanRow({ plan }) {

    const { cart, addToCart } = useCart();

    return (
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1fr_1fr] gap-4 items-center border w-full h-12 bg-white rounded-sm shadow-sm px-4 mb-1">
            <AddToCartCheck addToCart={addToCart} cart={cart} plan={plan} />
            <h2 className="text-left text-lg text-black font-semibold truncate">{plan.name}</h2>
            <h2 className="text-center text-md text-black">{plan.type}</h2>
            <h2 className="text-center text-md text-black">{plan.network}</h2>
            <h2 className="text-center text-md text-black">{plan.speed}</h2>
            <h2 className="text-right text-md text-black">{plan.price}</h2>
        </div>
    )
}

export default PlanRow;