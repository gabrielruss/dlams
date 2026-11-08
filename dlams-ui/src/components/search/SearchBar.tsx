import SearchField from "./SearchField"
import useSearchMode from "./hooks/useSearchMode"

function SearchBar() {
  const { query, setQuery, close } = useSearchMode()

  return (
    <div role="search" className="border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-6">
        <SearchField
          label="Search all collections"
          value={query}
          onChange={setQuery}
          onEscape={() => (query ? setQuery("") : close())}
        />
      </div>
    </div>
  )
}

export default SearchBar
