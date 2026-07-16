import { Fragment, useState } from 'react'
import { fetchNearbyAirports } from '../lib/airports'
import { TRAVEL_MODES, buildLegs, formatDuration } from '../lib/travelModes'
import TripPlanSummary from './TripPlanSummary'

function shortLabel(name) {
  return name.split(',')[0]
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

function TravelsTab({
  plans,
  userPosition,
  legModes,
  onSetLegMode,
  tripStart,
  tripEnd,
  onSetTripStart,
  onSetTripEnd,
  travelers,
  onSetTravelers,
  tripPlan,
  tripPlanLoading,
  tripPlanError,
  onCalculateTripPlan,
}) {
  const [expandedLegKey, setExpandedLegKey] = useState(null)
  const [airportPanels, setAirportPanels] = useState({})

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
    ? [{ id: '__user__', name: '📍 Current location', position: userPosition }, ...plans]
    : plans
  const legs = buildLegs(waypoints, legModes)
  const totalHours = legs.reduce((sum, leg) => sum + leg.hours, 0)
  const totalRealisticMiles = legs.reduce((sum, leg) => sum + leg.distanceMiles, 0)
  const dateRangeError =
    tripStart && tripEnd && tripEnd < tripStart
      ? 'End date must be on or after the start date.'
      : null
  const canCalculate =
    plans.length > 0 &&
    Boolean(tripStart) &&
    Boolean(tripEnd) &&
    !dateRangeError &&
    travelers >= 1

  return (
    <section className="plans-section">
      <h2>Travels</h2>

      {plans.length === 0 ? (
        <p className="hint">
          Add landmarks first to plan travel between stops.
        </p>
      ) : (
        <>
          {legs.length > 0 && (
            <p className="hint trip-summary">
              Trip estimate: ~{totalRealisticMiles.toFixed(1)} mi,{' '}
              {formatDuration(totalHours)} across {legs.length} leg
              {legs.length === 1 ? '' : 's'}
            </p>
          )}
          <ul className="marker-list plan-list">
            {legs.map((leg) => (
              <Fragment key={leg.key}>
                <li className="plan-leg">
                  <LegRow
                    leg={leg}
                    onChangeMode={onSetLegMode}
                    airportsExpanded={expandedLegKey === leg.key}
                    onToggleAirports={() => toggleAirports(leg)}
                  />
                </li>
                {expandedLegKey === leg.key && (
                  <li className="leg-airports">
                    <AirportPanel
                      panel={airportPanels[leg.key]}
                      fromLabel={shortLabel(leg.from.name)}
                      toLabel={shortLabel(leg.to.name)}
                    />
                  </li>
                )}
              </Fragment>
            ))}
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

          <div className="trip-travelers-row">
            <label>
              Travelers
              <input
                type="number"
                min="1"
                step="1"
                value={travelers}
                onChange={(event) => {
                  const value = parseInt(event.target.value, 10)
                  onSetTravelers(Number.isNaN(value) ? 1 : Math.max(1, value))
                }}
              />
            </label>
            <p className="hint trip-travelers-hint">
              Hotel rooms and ticket costs scale with travelers.
            </p>
          </div>

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

export default TravelsTab
