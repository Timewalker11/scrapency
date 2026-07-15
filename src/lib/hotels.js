const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const RADIUS_METERS = 16093 // 10 miles
const EARTH_RADIUS_MILES = 3958.8
const MOCK_PRICE_MIN = 79
const MOCK_PRICE_MAX = 449

// No pricing data is available from OpenStreetMap, so this derives a
// placeholder that's stable per hotel id rather than reshuffling on
// every fetch. It is NOT a real price.
function mockPricePerNight(id) {
  const fraction = Math.abs(Math.sin(id * 12.9898))
  return Math.round(MOCK_PRICE_MIN + fraction * (MOCK_PRICE_MAX - MOCK_PRICE_MIN))
}

function haversineMiles(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h))
}

export async function fetchNearbyHotels(position) {
  const query = `[out:json][timeout:25];node(around:${RADIUS_METERS},${position.lat},${position.lng})[tourism=hotel];out body;`
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!response.ok) {
    throw new Error(`Hotel search failed (${response.status})`)
  }

  const data = await response.json()

  return data.elements
    .filter((element) => element.tags?.name)
    .map((element) => {
      const tags = element.tags
      const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
        .filter(Boolean)
        .join(' ')

      return {
        id: element.id,
        name: tags.name,
        address,
        distanceMiles: haversineMiles(position, { lat: element.lat, lng: element.lon }),
        estimatedPricePerNight: mockPricePerNight(element.id),
      }
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
}
