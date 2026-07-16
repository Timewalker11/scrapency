import { haversineMiles } from './geo'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const RADIUS_METERS = 16093 // 10 miles
const MAX_RESULTS = 20
const MOCK_PRICE_MIN = 79
const MOCK_PRICE_MAX = 449

const THUMBNAIL_COLORS = ['#f4a261', '#2a9d8f', '#e76f51', '#457b9d', '#8e44ad', '#e9c46a']
const AMENITY_POOL = [
  'Free WiFi',
  'Free cancellation',
  'Breakfast included',
  'Pool',
  'Parking',
  'Air conditioning',
  'Pet friendly',
  'Gym',
]

// No pricing/rating/amenity data is available from OpenStreetMap, so all of
// this is a placeholder derived deterministically from the hotel's id (so it
// stays stable across fetches instead of reshuffling). None of it is real.
function seededFraction(id, salt) {
  return Math.abs(Math.sin(id * salt))
}

function mockPricePerNight(id) {
  const fraction = seededFraction(id, 12.9898)
  return Math.round(MOCK_PRICE_MIN + fraction * (MOCK_PRICE_MAX - MOCK_PRICE_MIN))
}

// About half of listings show a "deal" with a struck-through original price,
// matching the OTA convention of surfacing a discount on the list view.
function mockOriginalPricePerNight(id, price) {
  const fraction = seededFraction(id, 2.221)
  if (fraction < 0.5) return null
  return Math.round(price * (1.15 + fraction * 0.35))
}

function mockStars(id) {
  const fraction = seededFraction(id, 3.7321)
  return 3 + Math.floor(fraction * 3) // 3-5 stars
}

function mockRating(id) {
  const fraction = seededFraction(id, 7.9531)
  return Math.round((6.5 + fraction * 3.3) * 10) / 10 // 6.5-9.8
}

function ratingLabel(rating) {
  if (rating >= 9) return 'Exceptional'
  if (rating >= 8) return 'Very good'
  if (rating >= 7) return 'Good'
  return 'Pleasant'
}

function mockReviewCount(id) {
  const fraction = seededFraction(id, 5.1179)
  return Math.round(50 + fraction * 1950)
}

function mockAmenities(id) {
  const count = 2 + (id % 2)
  const start = id % AMENITY_POOL.length
  const picked = new Set()
  for (let i = 0; picked.size < count && i < AMENITY_POOL.length; i++) {
    picked.add(AMENITY_POOL[(start + i * 3) % AMENITY_POOL.length])
  }
  return [...picked]
}

function mockThumbnailColor(id) {
  return THUMBNAIL_COLORS[id % THUMBNAIL_COLORS.length]
}

export function ratingColor(rating) {
  if (rating >= 9) return '#0a5c36'
  if (rating >= 8) return '#1a7a4c'
  if (rating >= 7) return '#c07a00'
  return '#b00020'
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
      const id = element.id
      const estimatedPricePerNight = mockPricePerNight(id)
      const rating = mockRating(id)

      return {
        id,
        name: tags.name,
        address,
        distanceMiles: haversineMiles(position, { lat: element.lat, lng: element.lon }),
        estimatedPricePerNight,
        originalPricePerNight: mockOriginalPricePerNight(id, estimatedPricePerNight),
        stars: mockStars(id),
        rating,
        ratingLabel: ratingLabel(rating),
        reviewCount: mockReviewCount(id),
        amenities: mockAmenities(id),
        thumbnailColor: mockThumbnailColor(id),
      }
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, MAX_RESULTS)
}
