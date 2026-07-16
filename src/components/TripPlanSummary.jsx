import { formatDuration } from '../lib/travelModes'

function shortLabel(name) {
  return name.split(',')[0]
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function TripPlanSummary({ plan }) {
  if (!plan) return null

  const {
    stops,
    legs,
    totalTravelCost,
    totalHotelCost,
    totalCost,
    totalDays,
    feasible,
    shortfallDays,
  } = plan

  return (
    <div className="trip-plan-summary">
      {!feasible && (
        <p className="hint error trip-plan-warning">
          ⚠️ Your timeframe is tight for {stops.length} stop
          {stops.length === 1 ? '' : 's'} — add {shortfallDays} more day
          {shortfallDays === 1 ? '' : 's'} for a full night at each stop.
          Showing a best-effort 1-night-per-stop split below.
        </p>
      )}

      <ul className="trip-plan-stops">
        {stops.map((stop, index) => (
          <li key={stop.plan.id} className="trip-plan-stop">
            <div className="trip-plan-stop-header">
              <span className="plan-number">{index + 1}.</span>
              <span className="plan-name">{shortLabel(stop.plan.name)}</span>
            </div>
            <div className="trip-plan-stop-dates">
              {formatDate(stop.arrival)} → {formatDate(stop.departure)} (
              {stop.nights} night{stop.nights === 1 ? '' : 's'})
            </div>
            {stop.hotel ? (
              <div className="trip-plan-stop-hotel">
                🏨 {stop.hotel.name} · ~${stop.hotel.estimatedPricePerNight}
                /night · ${stop.hotelSubtotal.toFixed(0)} total
              </div>
            ) : (
              <div className="trip-plan-stop-hotel hint">
                No hotel data available nearby.
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="trip-plan-legs">
        {legs.map((leg) => (
          <div key={leg.key} className="leg-row trip-plan-leg-row">
            <span className="leg-label">
              {shortLabel(leg.from.name)} → {shortLabel(leg.to.name)}
            </span>
            <span className="leg-estimate">
              {leg.distanceMiles.toFixed(1)} mi · {formatDuration(leg.hours)} ·
              ~${leg.costUsd.toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      <div className="trip-plan-totals">
        <div>Travel: ~${totalTravelCost.toFixed(0)}</div>
        <div>Hotels: ~${totalHotelCost.toFixed(0)}</div>
        <div className="trip-plan-grand-total">
          Total: ~${totalCost.toFixed(0)} over {totalDays} day
          {totalDays === 1 ? '' : 's'}
        </div>
      </div>

      <p className="hint trip-plan-disclaimer">
        * Travel and hotel costs are placeholder estimates, not live prices.
      </p>
    </div>
  )
}

export default TripPlanSummary
