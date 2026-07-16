import { haversineMiles } from './geo'
import { queryOverpass } from './overpass'

const RADIUS_METERS = 80467 // 50 miles — airports are far sparser than hotels
const MAX_RESULTS = 5

// Major airports are commonly mapped as ways or multi-polygon relations
// (runway/terminal outlines) rather than a single node, so all three element
// types are queried and `out center` gives ways/relations a representative
// point to measure distance from.
export async function fetchNearbyAirports(position) {
  const query = `[out:json][timeout:25];(node(around:${RADIUS_METERS},${position.lat},${position.lng})[aeroway=aerodrome];way(around:${RADIUS_METERS},${position.lat},${position.lng})[aeroway=aerodrome];relation(around:${RADIUS_METERS},${position.lat},${position.lng})[aeroway=aerodrome];);out center;`
  const data = await queryOverpass(query, 'Airport search')

  const airports = data.elements
    .filter((element) => element.tags?.name)
    .map((element) => {
      const tags = element.tags
      const point = element.type === 'node' ? element : element.center

      return {
        id: element.id,
        name: tags.name,
        iata: tags.iata || null,
        distanceMiles: haversineMiles(position, { lat: point.lat, lng: point.lon }),
      }
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)

  // Small private airfields are often mapped closer to a city center than
  // its actual commercial airport, so IATA-coded (i.e. passenger) airports
  // are preferred whenever the search radius has any, falling back to
  // whatever aerodrome is nearest when it doesn't.
  const commercial = airports.filter((airport) => airport.iata)
  return (commercial.length > 0 ? commercial : airports).slice(0, MAX_RESULTS)
}
