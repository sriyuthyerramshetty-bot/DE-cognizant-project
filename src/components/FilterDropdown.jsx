import TextAsset from '../assets/TextAssets.json'

function FilterDropdown ({ filter, setFilter }) {

    return (
        <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-400"
            aria-label="Filter and sort plans"
        >
            <option value="all">{TextAsset.PlanPage.options.all}</option>
            <option value="5G">{TextAsset.PlanPage.options['5G']}</option>
            <option value="Broadband">{TextAsset.PlanPage.options.Broadband}</option>
            <option value="Mobile">{TextAsset.PlanPage.options.Mobile}</option>
            <option value="Price">{TextAsset.PlanPage.options.Price}</option>
            <option value="Speed">{TextAsset.PlanPage.options.Speed}</option>
            <option value="Best Value">{TextAsset.PlanPage.options['Best Value']}</option>
        </select>
    )
}

export default FilterDropdown;