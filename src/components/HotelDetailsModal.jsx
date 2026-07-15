import { useEffect } from 'react'

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
        <p className="modal-price">~${hotel.estimatedPricePerNight}/night</p>
        {hotel.address && <p className="modal-address">{hotel.address}</p>}
        <p className="modal-distance">{hotel.distanceMiles.toFixed(1)} mi away</p>
        <p className="modal-description">
          Placeholder description for {hotel.name}. Details like amenities,
          guest ratings, and photos will go here once connected to a live
          hotel data source.
        </p>
        <p className="hint modal-disclaimer">
          * Price is a placeholder estimate, not a live rate.
        </p>
      </div>
    </div>
  )
}

export default HotelDetailsModal
