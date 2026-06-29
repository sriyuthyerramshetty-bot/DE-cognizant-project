import TextAsset from '../assets/TextAssets.json'

function SearchBar ({ searchInput, setSearchInput }) {

    return (
        <input
            type="text"
            placeholder={TextAsset.PlanPage.searchPlaceholder}
            className="border p-2 rounded-lg"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
        />
    )
}

export default SearchBar;