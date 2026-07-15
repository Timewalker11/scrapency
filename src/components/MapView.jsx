import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

// L.Icon.Default always prepends its auto-detected imagePath even when
// iconUrl/shadowUrl are overridden, which breaks under Vite's bundled
// asset URLs. Building a plain L.icon() instead sidesteps that path
// auto-detection and uses the bundled URLs as-is.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const defaultCenter = [40.7128, -74.006] // New York City

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function FlyTo({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15)
    }
  }, [position, map])

  return null
}

function MapView({ markers, focusPosition, onMapClick, onMarkerRemove }) {
  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      <FlyTo position={focusPosition} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.position.lat, marker.position.lng]}
          icon={pinIcon}
          eventHandlers={{
            contextmenu: () => onMarkerRemove(marker.id),
          }}
        >
          <Popup>{marker.label || 'Dropped pin'}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapView
