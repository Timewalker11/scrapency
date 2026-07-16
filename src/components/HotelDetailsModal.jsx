import { useEffect } from 'react'
import { ratingColor } from '../lib/hotels'

function HotelDetailsModal({ hotel, onClose }) {
  useEffect(() => {
    if (!hotel) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotel, onClose])

  if (!hotel) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={hotel.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2>{hotel.name}</h2>
        {hotel.stars && (
          <p className="modal-stars" title={`${hotel.stars}-star hotel`}>
            {'★'.repeat(hotel.stars)}
            <span className="hotel-card-stars-empty">
              {'★'.repeat(5 - hotel.stars)}
            </span>
          </p>
        )}
        {typeof hotel.rating === 'number' && (
          <p className="modal-rating">
            <span
              className="rating-score"
              style={{ background: ratingColor(hotel.rating) }}
            >
              {hotel.rating.toFixed(1)}
            </span>
            <span className="rating-label">{hotel.ratingLabel}</span>
            <span className="rating-count">{hotel.reviewCount} reviews</span>
          </p>
        )}
        <p className="modal-price">
          {hotel.originalPricePerNight && (
            <span className="price-original">
              ${hotel.originalPricePerNight}
            </span>
          )}
          <span className="price-current">${hotel.estimatedPricePerNight}</span>
          <span className="price-per-night">/night</span>
        </p>
        {hotel.address && <p className="modal-address">{hotel.address}</p>}
        <p className="modal-distance">{hotel.distanceMiles.toFixed(1)} mi away</p>
        {hotel.amenities?.length > 0 && (
          <div className="hotel-card-amenities modal-amenities">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="amenity-badge">
                {amenity}
              </span>
            ))}
          </div>
        )}
        <p className="hint modal-disclaimer">
          * Price, rating, and amenities are placeholder estimates, not live data.
        </p>
      </div>
    </div>
  )
}

export default HotelDetailsModal
