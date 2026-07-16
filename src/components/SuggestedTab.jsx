import { Fragment, useState } from 'react'
import { fetchNearbySuggestions } from '../lib/suggestions'

function shortLabel(name) {
  return name.split(',')[0]
}

function SuggestionCard({ suggestion, onAdd }) {
  return (
    <li>
      <div className="suggestion-main">
        <span className="plan-name">{suggestion.name}</span>
        <span className="suggestion-meta">
          {suggestion.category} · {suggestion.distanceMiles.toFixed(1)} mi from here
        </span>
      </div>
      <button type="button" className="suggestion-add-btn" onClick={onAdd}>
        + Add
      </button>
    </li>
  )
}

function SuggestionPanel({ panel, existingNames, onAdd }) {
  if (!panel || panel.loading) {
    return <p className="hint">Searching for nearby landmarks…</p>
  }
  if (panel.error) {
    return <p className="hint error">{panel.error}</p>
  }

  // Filtered at render time (not cached) so a suggestion that gets added
  // drops out of every panel immediately, without needing to refetch.
  const suggestions = panel.suggestions.filter(
    (suggestion) => !existingNames.has(suggestion.name.trim().toLowerCase()),
  )

  if (suggestions.length === 0) {
    return <p className="hint">No additional landmarks found nearby.</p>
  }

  return (
    <>
      <ul className="marker-list suggestion-list">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAdd={() => onAdd(suggestion)}
          />
        ))}
      </ul>
      <p className="hint suggestion-disclaimer">
        * Nearby points of interest from OpenStreetMap; may be incomplete.
      </p>
    </>
  )
}

function SuggestedTab({ plans, onAddPlan }) {
  const [expandedPlanId, setExpandedPlanId] = useState(null)
  const [suggestionPanels, setSuggestionPanels] = useState({})

  const toggleSuggestions = async (plan) => {
    if (expandedPlanId === plan.id) {
      setExpandedPlanId(null)
      return
    }
    setExpandedPlanId(plan.id)
    if (suggestionPanels[plan.id]) return

    setSuggestionPanels((prev) => ({
      ...prev,
      [plan.id]: { loading: true, error: null, suggestions: [] },
    }))
    try {
      const suggestions = await fetchNearbySuggestions(plan.position)
      setSuggestionPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: null, suggestions },
      }))
    } catch (error) {
      setSuggestionPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: error.message, suggestions: [] },
      }))
    }
  }

  const handleAdd = (suggestion) => {
    onAddPlan({
      place_id: `suggestion-${suggestion.id}`,
      display_name: suggestion.name,
      lat: String(suggestion.position.lat),
      lon: String(suggestion.position.lng),
    })
  }

  const existingNames = new Set(
    plans.map((plan) => shortLabel(plan.name).trim().toLowerCase()),
  )

  return (
    <section className="plans-section">
      <h2>Suggested</h2>

      {plans.length === 0 ? (
        <p className="hint">
          Add landmarks first to see suggestions near them.
        </p>
      ) : (
        <ul className="marker-list plan-list">
          {plans.map((plan) => (
            <Fragment key={plan.id}>
              <li
                className="plan-expand-row"
                role="button"
                tabIndex={0}
                aria-expanded={expandedPlanId === plan.id}
                onClick={() => toggleSuggestions(plan)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleSuggestions(plan)
                  }
                }}
              >
                <span className="plan-name">{plan.name}</span>
                <span className="plan-expand-chevron">
                  {expandedPlanId === plan.id ? '▲' : '▼'}
                </span>
              </li>
              {expandedPlanId === plan.id && (
                <li className="plan-expand-panel">
                  <SuggestionPanel
                    panel={suggestionPanels[plan.id]}
                    existingNames={existingNames}
                    onAdd={handleAdd}
                  />
                </li>
              )}
            </Fragment>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SuggestedTab
