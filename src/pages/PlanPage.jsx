function PlanPage({ plans }) {
    return (
        <>
            {/* Header section */}
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Plans</h1>
            </div>

            {/* Search and filter section */}
            <div className="">
                <input
                    type="text" 
                    placeholder="Search plans..." 
                    className="border p-2 rounded-lg mb-4" 
                />
                <select
                    value={"all"}
                    onChange={() => (console.log("filter changed"))}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-400"
                    aria-label="Task category"
                >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Display the plans in a grid layout */}
            <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="border p-4 mb-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        <p>Type: {plan.type}</p>
                        <p>Speed: {plan.speed}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">{plan.price.split('/')[0]}</span>
                            <span className="text-sm">/{plan.price.split('/')[1]}</span>
                        </div>
                        {plan.bestValue && <p className="text-green-500 font-bold">Best Value</p>}
                    </div>
                ))}
            </div>
        </>
    )
}

export default PlanPage;