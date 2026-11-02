import SearchField from "./SearchField"
import useSearchMode from "./useSearchMode"

function SearchBar() {
  const { query, open, setQuery, close } = useSearchMode()

  return (
    <div role="search" className="border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-6">
        <SearchField
          label="Search all collections"
          value={query}
          onFocus={open}
          onChange={setQuery}
          onEscape={() => (query ? setQuery("") : close())}
        />
      </div>
    </div>
  )
}

export default SearchBar
