import PlanRow from './PlanRow.jsx';
import TextAsset from '../../assets/TextAssets.json';

function PlanRowsContainer({ filteredPlans }) {
    if (filteredPlans.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 px-6">
                <p className="text-center text-2xl text-black">{TextAsset.PlanPage.searchError}</p>
            </div>
        )
    }
    
    return (
        <div className="px-6 pb-6">
            {filteredPlans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
            ))}
        </div>
    )
}

export default PlanRowsContainer;