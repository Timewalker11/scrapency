// Public Overpass mirrors, tried in order. The primary (overpass-api.de) is
// the most commonly used and therefore the most likely to be temporarily
// rate-limited/IP-banned under heavy use; the others are independently run
// mirrors of the same API used as a fallback when that happens.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

// A rate-limited/banned mirror tends to refuse the connection outright
// rather than return a clean HTTP error, so both a thrown fetch() and a
// non-OK response fall through to the next endpoint before giving up.
export async function queryOverpass(query, label) {
  let lastError = null

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
      })
      if (!response.ok) {
        lastError = new Error(`${label} failed (${response.status})`)
        continue
      }
      return await response.json()
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error(`${label} failed`)
}
