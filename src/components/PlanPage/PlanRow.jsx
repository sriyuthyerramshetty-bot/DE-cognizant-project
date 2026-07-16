import AddToCartCheck from "./AddToCartCheck";
import LineCounter from "./LineCounter";
import { useCart } from "../../context/CartContext";

function PlanRow({ plan }) {

    const { cart, addToCart, removeFromCart, addLine, removeLine } = useCart();

    return (
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center border w-full h-12 bg-white rounded-sm shadow-sm px-4 mb-1">
            <AddToCartCheck addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} plan={plan} />
            <h2 className="text-left text-lg text-black font-semibold truncate">{plan.name}</h2>
            <h2 className="text-center text-md text-black">{plan.type}</h2>
            <h2 className="text-center text-md text-black">{plan.network}</h2>
            <h2 className="text-center text-md text-black">{plan.speed}</h2>
            <h2 className="text-center text-md text-black">{plan.price}</h2>
            <div className="flex justify-center">
                <LineCounter cart={cart} plan={plan} addLine={addLine} removeLine={removeLine} />
            </div>
        </div>
    )
}

export default PlanRow;