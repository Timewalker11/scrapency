import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = { lat: 40.7128, lng: -74.006 } // New York City

const libraries = ['places']

function MapView({ markers, onMapClick, onMarkerRemove }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const handleClick = (event) => {
    onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() })
  }

  if (loadError) {
    return (
      <div className="map-message map-error">
        Failed to load Google Maps. Check your API key and enabled APIs.
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="map-message">Loading map…</div>
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onClick={handleClick}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.label || ''}
          onRightClick={() => onMarkerRemove(marker.id)}
        />
      ))}
    </GoogleMap>
  )
}

export default MapView
