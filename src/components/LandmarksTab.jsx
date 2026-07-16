import { useRef, useState } from 'react'
import { searchDestinations } from '../lib/destinations'

function LandmarksTab({
  plans,
  onAddPlan,
  onRemovePlan,
  onReorderPlans,
  onOptimizeRoute,
  routeDistanceMiles,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState(null)
  const debounceRef = useRef(null)
  const dragIndexRef = useRef(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

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

  const handleAddPlan = (result) => {
    onAddPlan(result)
    setQuery('')
    setResults([])
  }

  const handleDragStart = (index) => {
    dragIndexRef.current = index
  }

  const handleDragOver = (event, index) => {
    event.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index) => {
    const from = dragIndexRef.current
    dragIndexRef.current = null
    setDragOverIndex(null)
    if (from === null || from === index) return
    onReorderPlans(from, index)
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  return (
    <section className="plans-section">
      <h2>Landmarks</h2>

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
              <li key={result.place_id} onClick={() => handleAddPlan(result)}>
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
        <>
          <button
            type="button"
            className="optimize-route-btn"
            onClick={onOptimizeRoute}
            disabled={plans.length < 2}
          >
            🧭 Optimize travel order
          </button>
          {routeDistanceMiles !== null && (
            <p className="hint route-distance">
              Shortest route: ~{routeDistanceMiles.toFixed(1)} mi (straight-line)
            </p>
          )}
          <ul className="marker-list plan-list">
            {plans.map((plan, index) => (
              <li
                key={plan.id}
                className={dragOverIndex === index ? 'drag-over' : ''}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <span className="plan-drag-handle">⠿</span>
                <span className="plan-number">{index + 1}.</span>
                <span className="plan-name">{plan.name}</span>
                <span className="plan-actions">
                  <button type="button" onClick={() => onRemovePlan(plan.id)}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default LandmarksTab
