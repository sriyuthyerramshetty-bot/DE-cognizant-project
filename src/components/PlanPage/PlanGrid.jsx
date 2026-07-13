import PlanBox from './PlanBox.jsx';
import TextAsset from '../../assets/TextAssets.json';

function PlanGrid ({ filteredPlans }) {
    if (filteredPlans.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 px-6">
                <p className="text-center text-2xl text-black">{TextAsset.PlanPage.searchError}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-4 px-6 pb-10">
            {filteredPlans.map((plan) => (
                <PlanBox key={plan.id} plan={plan} />
            ))}
        </div>
    )
}

export default PlanGrid;