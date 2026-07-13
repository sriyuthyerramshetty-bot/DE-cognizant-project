import TextAsset from '../../assets/TextAssets.json'

function OrderByButton({ sortOrder, setSortOrder, disabled }) {
    // Flip between ascending and descending each press.
    const toggle = () => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            title={disabled ? 'Select Price or Speed to sort' : (sortOrder === 'asc' ? 'Ascending' : 'Descending')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
        >
            {sortOrder === 'asc' ? TextAsset.PlanPage.sort.asc : TextAsset.PlanPage.sort.desc}
        </button>
    )
}

export default OrderByButton;