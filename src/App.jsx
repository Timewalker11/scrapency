import { useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import ResizeHandle from './components/ResizeHandle'
import HotelDetailsModal from './components/HotelDetailsModal'
import { optimizeRoute } from './lib/routing'
import { legKey } from './lib/travelModes'
import { buildTripPlan } from './lib/tripPlan'
import './App.css'

const DEFAULT_SIDEBAR_WIDTH = 280
const MIN_SIDEBAR_WIDTH = 220
const MAX_SIDEBAR_WIDTH = 640

function App() {
  const [markers, setMarkers] = useState([])
  const [focusPosition, setFocusPosition] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [userPosition, setUserPosition] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState(null)
  const [plans, setPlans] = useState([])
  const [routeDistanceMiles, setRouteDistanceMiles] = useState(null)
  const [legModes, setLegModes] = useState({})
  const [tripStart, setTripStart] = useState('')
  const [tripEnd, setTripEnd] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [tripPlan, setTripPlan] = useState(null)
  const [tripPlanLoading, setTripPlanLoading] = useState(false)
  const [tripPlanError, setTripPlanError] = useState(null)

  const setLegMode = (fromId, toId, modeId) => {
    setLegModes((prev) => ({ ...prev, [legKey(fromId, toId)]: modeId }))
    setTripPlan(null)
  }

  const updateTripStart = (value) => {
    setTripStart(value)
    setTripPlan(null)
  }

  const updateTripEnd = (value) => {
    setTripEnd(value)
    setTripPlan(null)
  }

  const updateTravelers = (value) => {
    setTravelers(value)
    setTripPlan(null)
  }

  const calculateTripPlan = async () => {
    setTripPlanLoading(true)
    setTripPlanError(null)
    try {
      setTripPlan(
        await buildTripPlan({
          plans,
          legModes,
          userPosition,
          startDate: tripStart,
          endDate: tripEnd,
          travelers,
        }),
      )
    } catch (error) {
      setTripPlanError(error.message)
      setTripPlan(null)
    } finally {
      setTripPlanLoading(false)
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by this browser.')
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const position = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.coords.accuracy,
        }
        setUserPosition(position)
        setFocusPosition(position)
        setLocating(false)
      },
      (error) => {
        setLocateError(error.message)
        setLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const addMarker = (position, label) => {
    setMarkers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), position, label },
    ])
  }

  const handlePlaceSelected = (position, label) => {
    addMarker(position, label)
    setFocusPosition(position)
  }

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id))
  }

  const addPlan = (result) => {
    setPlans((prev) =>
      prev.some((plan) => plan.id === result.place_id)
        ? prev
        : [
            ...prev,
            {
              id: result.place_id,
              name: result.display_name,
              position: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
              },
            },
          ],
    )
    setRouteDistanceMiles(null)
    setTripPlan(null)
  }

  const removePlan = (id) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
    setRouteDistanceMiles(null)
    setTripPlan(null)
  }

  const reorderPlans = (fromIndex, toIndex) => {
    setPlans((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setRouteDistanceMiles(null)
    setTripPlan(null)
  }

  const optimizeTravelPlan = () => {
    const { order, distanceMiles } = optimizeRoute(plans, userPosition)
    setPlans(order)
    setRouteDistanceMiles(distanceMiles)
  }

  const resizeSidebar = (nextWidth) => {
    setSidebarWidth(
      Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, nextWidth)),
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Scrapency</h1>
        <SearchBar onPlaceSelected={handlePlaceSelected} />
        <button
          type="button"
          className="locate-btn"
          onClick={locateMe}
          disabled={locating}
        >
          {locating ? 'Locating…' : '📍 Locate me'}
        </button>
        {locateError && <span className="locate-error">{locateError}</span>}
      </header>

      <main className="app-main">
        <MapView
          markers={markers}
          focusPosition={focusPosition}
          onMapClick={(position) => addMarker(position)}
          onMarkerRemove={removeMarker}
          userPosition={userPosition}
          plans={plans}
          legModes={legModes}
        />
        <ResizeHandle onResize={resizeSidebar} />
        <Sidebar
          width={sidebarWidth}
          onSelectHotel={setSelectedHotel}
          plans={plans}
          onAddPlan={addPlan}
          onRemovePlan={removePlan}
          onReorderPlans={reorderPlans}
          onOptimizeRoute={optimizeTravelPlan}
          routeDistanceMiles={routeDistanceMiles}
          userPosition={userPosition}
          legModes={legModes}
          onSetLegMode={setLegMode}
          tripStart={tripStart}
          tripEnd={tripEnd}
          onSetTripStart={updateTripStart}
          onSetTripEnd={updateTripEnd}
          travelers={travelers}
          onSetTravelers={updateTravelers}
          tripPlan={tripPlan}
          tripPlanLoading={tripPlanLoading}
          tripPlanError={tripPlanError}
          onCalculateTripPlan={calculateTripPlan}
        />
      </main>

      <HotelDetailsModal
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
      />
    </div>
  )
}

export default App
