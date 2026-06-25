import { useState } from 'react';
import { Wifi, Zap, Smartphone, Gauge, ShoppingCart } from 'lucide-react'

function PlanPage({ plans }) {
    
    // State to hold the search input value
    const [searchInput, setSearchInput] = useState("");
    const [filter, setFilter] = useState("all");

    // First apply dropdown filter
    const typeFilters = ['5G', 'Broadband', 'Mobile'];
    const dropdownFiltered = plans.filter(plan => {
        if (filter === 'Best Value') return plan.bestValue;
        if (typeFilters.includes(filter)) return plan.type === filter;
        return true; // 'all', 'Price', 'Speed' show everything
    });

    // Then sort if needed
    const sortedPlans = [...dropdownFiltered].sort((a, b) => {
        if (filter === 'Speed') {
            const toMbps = (s) => {
                const val = parseFloat(s);
                return s.toLowerCase().includes('gbps') ? val * 1000 : val;
            };
            return toMbps(a.speed) - toMbps(b.speed);
        }
        if (filter === 'Price') return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
        return 0;
    });

    // Finally filter by search input
    const query = searchInput.toLowerCase().trim();
    const filteredPlans = sortedPlans.filter(plan =>
        !query ||
        plan.name.toLowerCase().includes(query) ||
        plan.type.toLowerCase().includes(query) ||
        plan.speed.toLowerCase().includes(query) ||
        plan.price.toLowerCase().includes(query) ||
        (plan.bestValue && "best value".includes(query))
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
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
                        aria-label="Task category"
                    >
                        <option value="all">All</option>
                        <option value="5G">5G</option>
                        <option value="Broadband">Broadband</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Price">Price</option>
                        <option value="Speed">Speed</option>
                        <option value="Best Value">Best Value</option>
                    </select>
                </div>
            </div>

            {/* Display the plans in a grid layout */}
            <div className={filteredPlans.length === 0 ? "flex items-center justify-center h-64 px-6" : "grid grid-cols-3 gap-4 px-6"}>
                {filteredPlans.length === 0 ? (
                    <p className="text-center text-2xl text-black-600">No plans found. Try adjusting your search.</p>
                ) : (
                    filteredPlans.map((plan) => (
                        <div key={plan.id} className="relative border p-4 rounded-lg shadow-md flex flex-col h-48 w-full overflow-hidden">
                            {plan.bestValue && (
                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-l-[64px] border-t-green-500 border-l-transparent" />
                                    <span className="absolute top-2 right-0.5 text-white text-[12px] font-bold text-center leading-tight w-8 rotate-45 block">Best Value</span>
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
                                    <span className="text-4xl text-red-500 font-bold">{plan.price.split('/')[0]}</span>
                                    <span className="text-sm">/{plan.price.split('/')[1]}</span>
                                </div>
                                <button className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors flex items-center gap-1 text-sm">
                                    Add to Cart <ShoppingCart size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default PlanPage;