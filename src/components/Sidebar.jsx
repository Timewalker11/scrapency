import { useState } from 'react'
import PlansTab from './PlansTab'

const TABS = ['Hotels', 'Markers', 'Plans']

function Sidebar({
  markers,
  onRemove,
  hotels,
  hotelsLoading,
  hotelsError,
  onSelectHotel,
}) {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`sidebar-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Hotels' && (
        <section className="hotels-section">
          <h2>Nearby Hotels (10 mi)</h2>
          {hotelsLoading && <p className="hint">Searching for hotels…</p>}
          {!hotelsLoading && hotelsError && (
            <p className="hint error">{hotelsError}</p>
          )}
          {!hotelsLoading && !hotelsError && hotels.length === 0 && (
            <p className="hint">Drop a marker to see nearby hotels.</p>
          )}
          {!hotelsLoading && !hotelsError && hotels.length > 0 && (
            <>
              <ul className="hotel-list">
                {hotels.map((hotel) => (
                  <li
                    key={hotel.id}
                    className="hotel-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectHotel(hotel)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectHotel(hotel)
                      }
                    }}
                  >
                    <div className="hotel-name">
                      <span>{hotel.name}</span>
                      <span className="hotel-price">
                        ~${hotel.estimatedPricePerNight}/night
                      </span>
                    </div>
                    {hotel.address && (
                      <div className="hotel-address">{hotel.address}</div>
                    )}
                    <div className="hotel-distance">
                      {hotel.distanceMiles.toFixed(1)} mi
                    </div>
                  </li>
                ))}
              </ul>
              <p className="hint hotel-price-disclaimer">
                * Prices are placeholder estimates, not live rates.
              </p>
            </>
          )}
        </section>
      )}

      {activeTab === 'Markers' && (
        <section>
          <h2>Saved Markers</h2>
          {markers.length === 0 ? (
            <p className="hint">
              Click anywhere on the map to drop a marker, or search above.
            </p>
          ) : (
            <ul className="marker-list">
              {markers.map((marker) => (
                <li key={marker.id}>
                  <span>
                    {marker.label ||
                      `${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}`}
                  </span>
                  <button type="button" onClick={() => onRemove(marker.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab === 'Plans' && <PlansTab />}
    </aside>
  )
}

export default Sidebar
