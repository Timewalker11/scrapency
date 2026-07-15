import { useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import HotelDetailsModal from './components/HotelDetailsModal'
import { fetchNearbyHotels } from './lib/hotels'
import './App.css'

function App() {
  const [markers, setMarkers] = useState([])
  const [focusPosition, setFocusPosition] = useState(null)
  const [hotels, setHotels] = useState([])
  const [hotelsLoading, setHotelsLoading] = useState(false)
  const [hotelsError, setHotelsError] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)

  const loadHotels = async (position) => {
    setHotelsLoading(true)
    setHotelsError(null)
    try {
      setHotels(await fetchNearbyHotels(position))
    } catch (error) {
      setHotelsError(error.message)
      setHotels([])
    } finally {
      setHotelsLoading(false)
    }
  }

  const addMarker = (position, label) => {
    setMarkers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), position, label },
    ])
    loadHotels(position)
  }

  const handlePlaceSelected = (position, label) => {
    addMarker(position, label)
    setFocusPosition(position)
  }

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Scrapency</h1>
        <SearchBar onPlaceSelected={handlePlaceSelected} />
      </header>

      <main className="app-main">
        <MapView
          markers={markers}
          focusPosition={focusPosition}
          onMapClick={(position) => addMarker(position)}
          onMarkerRemove={removeMarker}
        />
        <Sidebar
          markers={markers}
          onRemove={removeMarker}
          hotels={hotels}
          hotelsLoading={hotelsLoading}
          hotelsError={hotelsError}
          onSelectHotel={setSelectedHotel}
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
