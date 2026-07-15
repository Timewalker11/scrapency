const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Large protected land areas (national/state parks) are always relevant
// regardless of their popularity score.
const BIG_PARK_TYPES = new Set(['national_park', 'protected_area', 'nature_reserve'])

// Nominatim's `importance` is derived largely from Wikipedia/Wikidata
// notability, so it works as a general "is this actually popular" signal
// across the wildly inconsistent tagging of landmarks, museums, and other
// attractions (e.g. the Eiffel Tower is tagged `man_made=tower`, the
// Empire State Building is tagged `office`, the Louvre is `tourism=museum`).
const MIN_IMPORTANCE = 0.45

export async function searchDestinations(query) {
  if (!query.trim()) return []

  const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=15`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Destination search failed (${response.status})`)
  }

  const data = await response.json()
  return data.filter(
    (result) => BIG_PARK_TYPES.has(result.type) || result.importance >= MIN_IMPORTANCE,
  )
}
