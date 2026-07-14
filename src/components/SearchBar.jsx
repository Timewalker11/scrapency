import { useRef } from 'react'
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api'

const libraries = ['places']

function SearchBar({ onPlaceSelected }) {
  const autocompleteRef = useRef(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) return

    onPlaceSelected(
      {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      place.name,
    )
  }

  if (!isLoaded) {
    return (
      <input
        className="search-input"
        placeholder="Loading search…"
        disabled
      />
    )
  }

  return (
    <Autocomplete
      onLoad={(autocomplete) => {
        autocompleteRef.current = autocomplete
      }}
      onPlaceChanged={handlePlaceChanged}
    >
      <input
        className="search-input"
        type="text"
        placeholder="Search for a place or address…"
      />
    </Autocomplete>
  )
}

export default SearchBar
