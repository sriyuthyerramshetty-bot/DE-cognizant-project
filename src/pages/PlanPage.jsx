import { useState } from 'react';

function PlanPage({ plans }) {
    
    // State to hold the search input value
    const [searchInput, setSearchInput] = useState("");

    // Filter plans based on the search input, matching any property
    const query = searchInput.toLowerCase().trim();
    const filteredPlans = plans.filter(plan =>
        !query ||
        plan.name.toLowerCase().includes(query) ||
        plan.type.toLowerCase().includes(query) ||
        plan.speed.toLowerCase().includes(query) ||
        plan.price.toLowerCase().includes(query)
    );

    return (
        <>
            {/* Header section */}
            <div className="pt-6 pl-6 pr-6">
                <h1 className="text-2xl font-semibold">Plans</h1>
            </div>

            {/* Search and filter section */}
            <div className="flex items-center justify-between px-6 mb-4">
                <p className="text-gray-600">Find the plan you are looking for</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search plans..."
                        className="border p-2 rounded-lg"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <select
                        value={"all"}
                        onChange={() => (console.log("filter changed"))}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
                        aria-label="Task category"
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Display the plans in a grid layout */}
            <div className="grid grid-cols-3 gap-4 px-6">
                {filteredPlans.length === 0 ? (
                    <p className="text-gray-600">No plans found.</p>
                ) : (
                    filteredPlans.map((plan) => (
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
                    ))
                )}
            </div>
        </>
    )
}

export default PlanPage;