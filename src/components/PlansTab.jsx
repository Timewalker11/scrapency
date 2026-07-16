import { Fragment, useRef, useState } from 'react'
import { searchDestinations } from '../lib/destinations'
import { fetchNearbyHotels, ratingColor } from '../lib/hotels'
import { fetchNearbyAirports } from '../lib/airports'
import { TRAVEL_MODES, buildLegs, formatDuration } from '../lib/travelModes'
import TripPlanSummary from './TripPlanSummary'

function shortLabel(name) {
  return name.split(',')[0]
}

function HotelCard({ hotel, onSelectHotel }) {
  const select = () => onSelectHotel(hotel)

  return (
    <li
      className="hotel-card"
      role="button"
      tabIndex={0}
      onClick={select}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          select()
        }
      }}
    >
      <div
        className="hotel-thumb"
        style={{ background: hotel.thumbnailColor }}
        aria-hidden="true"
      >
        🏨
      </div>

      <div className="hotel-card-main">
        <div className="hotel-card-header">
          <span className="hotel-card-name">{hotel.name}</span>
          <span className="hotel-card-stars" title={`${hotel.stars}-star hotel`}>
            {'★'.repeat(hotel.stars)}
            <span className="hotel-card-stars-empty">
              {'★'.repeat(5 - hotel.stars)}
            </span>
          </span>
        </div>
        {hotel.address && (
          <div className="hotel-card-address">{hotel.address}</div>
        )}
        <div className="hotel-card-distance">
          {hotel.distanceMiles.toFixed(1)} mi from here
        </div>
        {hotel.amenities.length > 0 && (
          <div className="hotel-card-amenities">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="amenity-badge">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="hotel-card-side">
        <div className="hotel-card-rating">
          <span
            className="rating-score"
            style={{ background: ratingColor(hotel.rating) }}
          >
            {hotel.rating.toFixed(1)}
          </span>
          <span className="rating-text">
            <span className="rating-label">{hotel.ratingLabel}</span>
            <span className="rating-count">{hotel.reviewCount} reviews</span>
          </span>
        </div>
        <div className="hotel-card-price">
          {hotel.originalPricePerNight && (
            <span className="price-original">
              ${hotel.originalPricePerNight}
            </span>
          )}
          <span className="price-current">${hotel.estimatedPricePerNight}</span>
          <span className="price-per-night">per night</span>
        </div>
        <button type="button" className="view-deal-btn" onClick={select}>
          View deal
        </button>
      </div>
    </li>
  )
}

function HotelPanel({ panel, onSelectHotel }) {
  if (!panel || panel.loading) {
    return <p className="hint">Searching for hotels…</p>
  }
  if (panel.error) {
    return <p className="hint error">{panel.error}</p>
  }
  if (panel.hotels.length === 0) {
    return <p className="hint">No hotels found nearby.</p>
  }

  return (
    <>
      <ul className="hotel-list">
        {panel.hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onSelectHotel={onSelectHotel} />
        ))}
      </ul>
      <p className="hint hotel-price-disclaimer">
        * Prices, ratings, and reviews are placeholder estimates, not live data.
      </p>
    </>
  )
}

function AirportList({ title, airports }) {
  return (
    <div className="airport-group">
      <h3 className="airport-group-title">{title}</h3>
      {airports.length === 0 ? (
        <p className="hint">No airports found nearby.</p>
      ) : (
        <ul className="airport-list">
          {airports.map((airport) => (
            <li key={airport.id} className="airport-item">
              <span className="airport-name">
                {airport.name}
                {airport.iata ? ` (${airport.iata})` : ''}
              </span>
              <span className="airport-distance">
                {airport.distanceMiles.toFixed(1)} mi
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AirportPanel({ panel, fromLabel, toLabel }) {
  if (!panel || panel.loading) {
    return <p className="hint">Searching for airports…</p>
  }
  if (panel.error) {
    return <p className="hint error">{panel.error}</p>
  }

  return (
    <>
      <AirportList title={`🛫 Go to, near ${fromLabel}`} airports={panel.fromAirports} />
      <AirportList
        title={`🛬 Get dropped off at, near ${toLabel}`}
        airports={panel.toAirports}
      />
      <p className="hint airport-disclaimer">
        * Nearest airports from OpenStreetMap; may be incomplete.
      </p>
    </>
  )
}

function LegRow({ leg, onChangeMode, airportsExpanded, onToggleAirports }) {
  return (
    <div className="leg-row-wrapper">
      <div className="leg-row">
        <span className="leg-label">
          {shortLabel(leg.from.name)} → {shortLabel(leg.to.name)}
        </span>
        <select
          className="leg-mode-select"
          value={leg.modeId}
          onChange={(event) => onChangeMode(leg.from.id, leg.to.id, event.target.value)}
        >
          {TRAVEL_MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
        <span className="leg-estimate">
          {leg.distanceMiles.toFixed(1)} mi · {formatDuration(leg.hours)} · ~$
          {leg.costUsd.toFixed(0)}
        </span>
      </div>
      <button
        type="button"
        className="airport-toggle-btn"
        onClick={onToggleAirports}
      >
        {airportsExpanded ? 'Hide airports' : '✈️ Nearby airports'}
      </button>
    </div>
  )
}

function PlansTab({
  plans,
  onSelectHotel,
  onAddPlan,
  onRemovePlan,
  onReorderPlans,
  onOptimizeRoute,
  routeDistanceMiles,
  userPosition,
  legModes,
  onSetLegMode,
  tripStart,
  tripEnd,
  onSetTripStart,
  onSetTripEnd,
  tripPlan,
  tripPlanLoading,
  tripPlanError,
  onCalculateTripPlan,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState(null)
  const debounceRef = useRef(null)
  const dragIndexRef = useRef(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [expandedPlanId, setExpandedPlanId] = useState(null)
  const [hotelPanels, setHotelPanels] = useState({})
  const [expandedLegKey, setExpandedLegKey] = useState(null)
  const [airportPanels, setAirportPanels] = useState({})

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

  const toggleHotels = async (plan) => {
    if (expandedPlanId === plan.id) {
      setExpandedPlanId(null)
      return
    }
    setExpandedPlanId(plan.id)
    if (hotelPanels[plan.id]) return

    setHotelPanels((prev) => ({
      ...prev,
      [plan.id]: { loading: true, error: null, hotels: [] },
    }))
    try {
      const hotels = await fetchNearbyHotels(plan.position)
      setHotelPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: null, hotels },
      }))
    } catch (error) {
      setHotelPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: error.message, hotels: [] },
      }))
    }
  }

  const toggleAirports = async (leg) => {
    if (expandedLegKey === leg.key) {
      setExpandedLegKey(null)
      return
    }
    setExpandedLegKey(leg.key)
    if (airportPanels[leg.key]) return

    setAirportPanels((prev) => ({
      ...prev,
      [leg.key]: { loading: true, error: null, fromAirports: [], toAirports: [] },
    }))
    try {
      const [fromAirports, toAirports] = await Promise.all([
        fetchNearbyAirports(leg.from.position),
        fetchNearbyAirports(leg.to.position),
      ])
      setAirportPanels((prev) => ({
        ...prev,
        [leg.key]: { loading: false, error: null, fromAirports, toAirports },
      }))
    } catch (error) {
      setAirportPanels((prev) => ({
        ...prev,
        [leg.key]: { loading: false, error: error.message, fromAirports: [], toAirports: [] },
      }))
    }
  }

  const waypoints = userPosition
    ? [
        { id: '__user__', name: '📍 Current location', position: userPosition },
        ...plans,
      ]
    : plans
  const legs = buildLegs(waypoints, legModes)
  const leadingLeg = userPosition && plans.length > 0 ? legs[0] : null
  const legOffset = userPosition ? 1 : 0
  const totalHours = legs.reduce((sum, leg) => sum + leg.hours, 0)
  const totalRealisticMiles = legs.reduce((sum, leg) => sum + leg.distanceMiles, 0)
  const dateRangeError =
    tripStart && tripEnd && tripEnd < tripStart
      ? 'End date must be on or after the start date.'
      : null
  const canCalculate =
    plans.length > 0 && Boolean(tripStart) && Boolean(tripEnd) && !dateRangeError

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
          {legs.length > 0 && (
            <p className="hint trip-summary">
              Trip estimate: ~{totalRealisticMiles.toFixed(1)} mi,{' '}
              {formatDuration(totalHours)} across {legs.length} leg
              {legs.length === 1 ? '' : 's'}
            </p>
          )}
          <ul className="marker-list plan-list">
            {leadingLeg && (
              <li className="plan-leg">
                <LegRow
                  leg={leadingLeg}
                  onChangeMode={onSetLegMode}
                  airportsExpanded={expandedLegKey === leadingLeg.key}
                  onToggleAirports={() => toggleAirports(leadingLeg)}
                />
              </li>
            )}
            {leadingLeg && expandedLegKey === leadingLeg.key && (
              <li className="leg-airports">
                <AirportPanel
                  panel={airportPanels[leadingLeg.key]}
                  fromLabel={shortLabel(leadingLeg.from.name)}
                  toLabel={shortLabel(leadingLeg.to.name)}
                />
              </li>
            )}
            {plans.map((plan, index) => {
              const nextLeg = legs[legOffset + index]
              return (
                <Fragment key={plan.id}>
                  <li
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
                      <button
                        type="button"
                        className="hotel-toggle-btn"
                        onClick={() => toggleHotels(plan)}
                      >
                        {expandedPlanId === plan.id ? 'Hide hotels' : '🏨 Hotels'}
                      </button>
                      <button type="button" onClick={() => onRemovePlan(plan.id)}>
                        Remove
                      </button>
                    </span>
                  </li>
                  {expandedPlanId === plan.id && (
                    <li className="plan-hotels">
                      <HotelPanel
                        panel={hotelPanels[plan.id]}
                        onSelectHotel={onSelectHotel}
                      />
                    </li>
                  )}
                  {nextLeg && (
                    <li className="plan-leg">
                      <LegRow
                        leg={nextLeg}
                        onChangeMode={onSetLegMode}
                        airportsExpanded={expandedLegKey === nextLeg.key}
                        onToggleAirports={() => toggleAirports(nextLeg)}
                      />
                    </li>
                  )}
                  {nextLeg && expandedLegKey === nextLeg.key && (
                    <li className="leg-airports">
                      <AirportPanel
                        panel={airportPanels[nextLeg.key]}
                        fromLabel={shortLabel(nextLeg.from.name)}
                        toLabel={shortLabel(nextLeg.to.name)}
                      />
                    </li>
                  )}
                </Fragment>
              )
            })}
          </ul>

          <div className="trip-dates-row">
            <label>
              Start
              <input
                type="date"
                value={tripStart}
                onChange={(event) => onSetTripStart(event.target.value)}
              />
            </label>
            <label>
              End
              <input
                type="date"
                value={tripEnd}
                onChange={(event) => onSetTripEnd(event.target.value)}
              />
            </label>
          </div>
          {dateRangeError && <p className="hint error">{dateRangeError}</p>}

          <button
            type="button"
            className="calculate-trip-btn"
            onClick={onCalculateTripPlan}
            disabled={!canCalculate || tripPlanLoading}
          >
            {tripPlanLoading ? 'Calculating…' : '📋 Calculate trip plan'}
          </button>
          {tripPlanError && <p className="hint error">{tripPlanError}</p>}

          <TripPlanSummary plan={tripPlan} />
        </>
      )}
    </section>
  )
}

export default PlansTab
