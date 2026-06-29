import FilterDropdown from '../components/FilterDropdown.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useState } from 'react';
import TextAsset from '../assets/TextAssets.json'
import PlanGrid from '../components/PlanGrid.jsx';

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
                <h1 className="text-2xl font-semibold">{TextAsset.PlanPage.title}</h1>
            </div>

            {/* Search and filter section */}
            <div className="flex items-center justify-between px-6 mb-4">
                <p className="text-gray-600">{TextAsset.PlanPage.subtitle}</p>
                <div className="flex items-center gap-2">
                    <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} />
                    <FilterDropdown filter={filter} setFilter={setFilter} />
                </div>
            </div>

            {/* Display the plans in a grid layout */}
            <PlanGrid filteredPlans={filteredPlans} />
        </>
    )
}

export default PlanPage;