import { Plus, Minus } from 'lucide-react'

// Plus/minus control for adjusting the number of lines a customer wants for a
// given plan. The current count is derived from the cart so the control stays
// in sync whether the plan is shown in the list view or the card view.
function LineCounter({ cart, plan, addLine, removeLine }) {
    const cartPlan = cart.find((p) => p.id === plan.id);
    const lines = cartPlan?.lines ?? 0;

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => removeLine(plan.id)}
                disabled={lines === 0}
                aria-label="Remove a line"
                className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                    lines === 0
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-500 hover:text-black'
                }`}
            >
                <Minus size={18} />
            </button>
            <span className="border relative rounded-md border-gray-300 w-6 text-center text-md text-black tabular-nums">{lines}</span>
            <button
                type="button"
                onClick={() => addLine(plan)}
                aria-label="Add a line"
                className="flex h-6 w-6 items-center justify-center rounded text-gray-500 transition-colors hover:text-black"
            >
                <Plus size={18} />
            </button>
        </div>
    )
}

export default LineCounter;