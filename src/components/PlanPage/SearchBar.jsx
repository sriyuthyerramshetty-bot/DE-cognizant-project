import TextAsset from '../../assets/TextAssets.json'

function SearchBar ({ searchInput, setSearchInput }) {

    return (
        <input
            type="text"
            placeholder={TextAsset.PlanPage.searchPlaceholder}
            className="border border-gray-300 p-1.5 rounded-lg outline-none hover:border-gray-400 focus:border-gray-400"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
        />
    )
}

export default SearchBar;