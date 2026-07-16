import { haversineMiles } from './geo'
import { queryOverpass } from './overpass'

const RADIUS_METERS = 16093 // 10 miles, matching lib/hotels.js
const MAX_RESULTS = 10

const CATEGORY_LABELS = {
  attraction: 'Attraction',
  museum: 'Museum',
  viewpoint: 'Viewpoint',
  artwork: 'Artwork',
  gallery: 'Gallery',
  zoo: 'Zoo',
  theme_park: 'Theme park',
  monument: 'Monument',
  memorial: 'Memorial',
  castle: 'Castle',
  ruins: 'Ruins',
  fort: 'Fort',
}

function categoryLabel(tags) {
  return CATEGORY_LABELS[tags.tourism] || CATEGORY_LABELS[tags.historic] || 'Landmark'
}

// Same "near a point" idea as fetchNearbyHotels/fetchNearbyAirports, but for
// other points of interest, so a trip's existing stops can suggest more
// stops nearby instead of requiring another manual search.
export async function fetchNearbySuggestions(position) {
  const query = `[out:json][timeout:25];(node(around:${RADIUS_METERS},${position.lat},${position.lng})[tourism~"^(attraction|museum|viewpoint|artwork|gallery|zoo|theme_park)$"];node(around:${RADIUS_METERS},${position.lat},${position.lng})[historic~"^(monument|memorial|castle|ruins|fort)$"];);out body;`
  const data = await queryOverpass(query, 'Suggestion search')

  return data.elements
    .filter((element) => element.tags?.name)
    .map((element) => ({
      id: element.id,
      name: element.tags.name,
      category: categoryLabel(element.tags),
      position: { lat: element.lat, lng: element.lon },
      distanceMiles: haversineMiles(position, { lat: element.lat, lng: element.lon }),
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, MAX_RESULTS)
}
