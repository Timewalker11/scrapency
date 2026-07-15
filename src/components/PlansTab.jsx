import { useRef, useState } from 'react'
import { searchDestinations } from '../lib/destinations'

function PlansTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState(null)
  const [plans, setPlans] = useState([])
  const debounceRef = useRef(null)

  const search = async (value) => {
    if (!value.trim()) {
      setResults([])
      setSearchError(null)
      return
    }

    try {
      setResults(await searchDestinations(value))
      setSearchError(null)
    } catch (error) {
      setSearchError(error.message)
      setResults([])
    }
  }

  const handleChange = (event) => {
    const value = event.target.value
    setQuery(value)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  const addPlan = (result) => {
    setPlans((prev) =>
      prev.some((plan) => plan.id === result.place_id)
        ? prev
        : [
            ...prev,
            {
              id: result.place_id,
              name: result.display_name,
              position: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
            },
          ],
    )
    setQuery('')
    setResults([])
  }

  const removePlan = (id) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
  }

  return (
    <section className="plans-section">
      <h2>Plans</h2>

      <div className="search-wrapper plans-search">
        <input
          className="search-input"
          type="text"
          placeholder="Search parks, landmarks, museums…"
          value={query}
          onChange={handleChange}
        />
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((result) => (
              <li key={result.place_id} onClick={() => addPlan(result)}>
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {searchError && <p className="hint error">{searchError}</p>}

      {plans.length === 0 ? (
        <p className="hint">
          Search above to add a park, landmark, or popular attraction.
        </p>
      ) : (
        <ul className="marker-list">
          {plans.map((plan) => (
            <li key={plan.id}>
              <span>{plan.name}</span>
              <button type="button" onClick={() => removePlan(plan.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PlansTab
