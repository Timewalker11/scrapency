import { Fragment, useState } from 'react'
import { fetchNearbyHotels, ratingColor, selectFeaturedHotels } from '../lib/hotels'

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

function HotelGroup({ title, hotels, onSelectHotel }) {
  if (hotels.length === 0) return null

  return (
    <div className="hotel-group">
      <h3 className="hotel-group-title">{title}</h3>
      <ul className="hotel-list">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onSelectHotel={onSelectHotel} />
        ))}
      </ul>
    </div>
  )
}

function HotelPanel({ panel, onSelectHotel }) {
  if (!panel || panel.loading) {
    return <p className="hint">Searching for hotels…</p>
  }
  if (panel.error) {
    return <p className="hint error">{panel.error}</p>
  }
  if (panel.topRated.length === 0 && panel.cheapest.length === 0) {
    return <p className="hint">No hotels found nearby.</p>
  }

  return (
    <>
      <HotelGroup
        title="⭐ Top rated"
        hotels={panel.topRated}
        onSelectHotel={onSelectHotel}
      />
      <HotelGroup
        title="💰 Best price"
        hotels={panel.cheapest}
        onSelectHotel={onSelectHotel}
      />
      <p className="hint hotel-price-disclaimer">
        * Prices, ratings, and reviews are placeholder estimates, not live data.
      </p>
    </>
  )
}

function StaysTab({ plans, onSelectHotel }) {
  const [expandedPlanId, setExpandedPlanId] = useState(null)
  const [hotelPanels, setHotelPanels] = useState({})

  const toggleHotels = async (plan) => {
    if (expandedPlanId === plan.id) {
      setExpandedPlanId(null)
      return
    }
    setExpandedPlanId(plan.id)
    if (hotelPanels[plan.id]) return

    setHotelPanels((prev) => ({
      ...prev,
      [plan.id]: { loading: true, error: null, topRated: [], cheapest: [] },
    }))
    try {
      const hotels = await fetchNearbyHotels(plan.position)
      const { topRated, cheapest } = selectFeaturedHotels(hotels)
      setHotelPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: null, topRated, cheapest },
      }))
    } catch (error) {
      setHotelPanels((prev) => ({
        ...prev,
        [plan.id]: { loading: false, error: error.message, topRated: [], cheapest: [] },
      }))
    }
  }

  return (
    <section className="plans-section">
      <h2>Stays</h2>

      {plans.length === 0 ? (
        <p className="hint">
          Add landmarks first to see nearby stays.
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
                onClick={() => toggleHotels(plan)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleHotels(plan)
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
                  <HotelPanel
                    panel={hotelPanels[plan.id]}
                    onSelectHotel={onSelectHotel}
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

export default StaysTab
