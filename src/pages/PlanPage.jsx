import FilterDropdown from '../components/PlanPage/FilterDropdown.jsx'
import SearchBar from '../components/PlanPage/SearchBar.jsx'
import OrderByButton from '../components/PlanPage/OrderByButton.jsx';
import CardViewButton from '../components/PlanPage/CardViewButton.jsx';
import PlanGrid from '../components/PlanPage/PlanGrid.jsx';
import PlanRowsContainer from '../components/PlanPage/PlanRowsContainer.jsx';
import PlanRowHeader from '../components/PlanPage/PlanRowHeader.jsx';
import { useState } from 'react';
import TextAsset from '../assets/TextAssets.json'

function PlanPage({ plans, cardView, setCardView }) {

    // State to hold the search input value
    const [searchInput, setSearchInput] = useState("");
    const [filter, setFilter] = useState("all");
    // Sort direction for the Price/Speed sort, toggled by the OrderByButton.
    const [sortOrder, setSortOrder] = useState("asc");
    // Card view vs. List view toggle is lifted to <App> so it persists across
    // navigation within a session (received here as props).

    // First apply dropdown filter
    const typeFilters = ['Home Internet', 'Mobile'];
    const networkFilters = ['5G', 'Fiber'];
    const dropdownFiltered = plans.filter(plan => {
        if (filter === 'Best Value') return plan.bestValue;
        if (typeFilters.includes(filter)) return plan.type === filter;
        if (networkFilters.includes(filter)) return plan.network === filter;
        return true; // 'all', 'Price', 'Speed' show everything
    });

    // Then sort if needed. `direction` flips the comparison for descending.
    const direction = sortOrder === 'asc' ? 1 : -1;
    const sortedPlans = [...dropdownFiltered].sort((a, b) => {
        if (filter === 'Speed') {
            const toMbps = (s) => {
                const val = parseFloat(s);
                return s.toLowerCase().includes('gbps') ? val * 1000 : val;
            };
            return (toMbps(a.speed) - toMbps(b.speed)) * direction;
        }
        if (filter === 'Price') return (parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''))) * direction;
        return 0;
    });

    // Finally filter by search input
    const query = searchInput.toLowerCase().trim();
    const filteredPlans = sortedPlans.filter(plan =>
        !query ||
        plan.name.toLowerCase().includes(query) ||
        plan.type.toLowerCase().includes(query) ||
        plan.network.toLowerCase().includes(query) ||
        plan.speed.toLowerCase().includes(query) ||
        plan.price.toLowerCase().includes(query) ||
        (plan.bestValue && "best value".includes(query))
    );

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Fixed header. Deliberately kept OUT of any overflow/scroll
                container: a native <select> popup can be dismissed by an
                ancestor scroll container, which was swallowing the first filter
                selection after a search. Only the column-header row below needs
                to reserve the scrollbar gutter to stay aligned with the rows. */}
            <div className="shrink-0">
                {/* Header section */}
                <div className="pt-6 pl-6 pr-6">
                    <h1 className="text-2xl font-semibold">{TextAsset.PlanPage.title}</h1>
                </div>

                {/* Search and filter section */}
                <div className="flex items-center justify-between px-6 mb-4">
                    <p className="text-gray-600">{TextAsset.PlanPage.subtitle}</p>
                    <div className="flex items-center gap-2">
                        <CardViewButton cardView={cardView} setCardView={setCardView} />
                        <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} />
                        <FilterDropdown filter={filter} setFilter={setFilter} />
                        <OrderByButton
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            disabled={filter !== 'Price' && filter !== 'Speed'}
                        />
                    </div>
                </div>

                {/* Plan Rows Header. Wrapped in a gutter-reserving container (it
                    never actually scrolls) so its Name/Type/Speed/Price columns
                    line up with the scrollable rows below, which reserve the
                    same `scrollbar-gutter: stable` space. */}
                {!cardView && (
                    <div className="overflow-y-auto [scrollbar-gutter:stable] px-6 mb-2">
                        <PlanRowHeader />
                    </div>)
                }
            </div>

            {/* Display the plans in a grid layout. `scrollbar-gutter: stable`
                keeps the gutter reserved at all times so the rows don't shift
                horizontally when the scrollbar appears/disappears. */}
            {!cardView ? (
                    <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
                        <PlanRowsContainer filteredPlans={filteredPlans} />
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
                        <PlanGrid filteredPlans={filteredPlans} />
                    </div>
                )
            }
        </div>
    )
}

export default PlanPage;