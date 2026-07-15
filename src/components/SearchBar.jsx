import { useRef, useState } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

function SearchBar({ onPlaceSelected }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const debounceRef = useRef(null)

  const search = async (value) => {
    if (!value.trim()) {
      setResults([])
      return
    }

    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(value)}&limit=5`
    const response = await fetch(url)
    const data = await response.json()
    setResults(data)
  }

  const handleChange = (event) => {
    const value = event.target.value
    setQuery(value)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  const handleSelect = (result) => {
    onPlaceSelected(
      { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      result.display_name,
    )
    setQuery(result.display_name)
    setResults([])
  }

  return (
    <div className="search-wrapper">
      <input
        className="search-input"
        type="text"
        placeholder="Search for a place or address…"
        value={query}
        onChange={handleChange}
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li key={result.place_id} onClick={() => handleSelect(result)}>
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
