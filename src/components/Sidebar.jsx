import { useState } from 'react'
import LandmarksTab from './LandmarksTab'
import TravelsTab from './TravelsTab'
import StaysTab from './StaysTab'
import SuggestedTab from './SuggestedTab'

const TABS = ['Landmarks', 'Travels', 'Stays', 'Suggested', 'Markers']

function Sidebar({
  width,
  markers,
  onRemove,
  onSelectHotel,
  plans,
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
  travelers,
  onSetTravelers,
  tripPlan,
  tripPlanLoading,
  tripPlanError,
  onCalculateTripPlan,
}) {
  const [activeTab, setActiveTab] = useState(TABS[0])

  return (
    <aside className="sidebar" style={{ '--sidebar-width': `${width}px` }}>
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

      {activeTab === 'Landmarks' && (
        <LandmarksTab
          plans={plans}
          onAddPlan={onAddPlan}
          onRemovePlan={onRemovePlan}
          onReorderPlans={onReorderPlans}
          onOptimizeRoute={onOptimizeRoute}
          routeDistanceMiles={routeDistanceMiles}
        />
      )}

      {activeTab === 'Travels' && (
        <TravelsTab
          plans={plans}
          userPosition={userPosition}
          legModes={legModes}
          onSetLegMode={onSetLegMode}
          tripStart={tripStart}
          tripEnd={tripEnd}
          onSetTripStart={onSetTripStart}
          onSetTripEnd={onSetTripEnd}
          travelers={travelers}
          onSetTravelers={onSetTravelers}
          tripPlan={tripPlan}
          tripPlanLoading={tripPlanLoading}
          tripPlanError={tripPlanError}
          onCalculateTripPlan={onCalculateTripPlan}
        />
      )}

      {activeTab === 'Stays' && (
        <StaysTab plans={plans} onSelectHotel={onSelectHotel} />
      )}

      {activeTab === 'Suggested' && <SuggestedTab />}
    </aside>
  )
}

export default Sidebar
