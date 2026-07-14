import { useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [markers, setMarkers] = useState([])

  const addMarker = (position, label) => {
    setMarkers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), position, label },
    ])
  }

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Scrapency</h1>
        <SearchBar onPlaceSelected={addMarker} />
      </header>

      <main className="app-main">
        <MapView
          markers={markers}
          onMapClick={(position) => addMarker(position)}
          onMarkerRemove={removeMarker}
        />
        <Sidebar markers={markers} onRemove={removeMarker} />
      </main>
    </div>
  )
}

export default App
