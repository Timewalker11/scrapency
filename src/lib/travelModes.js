import { haversineMiles } from './geo'

export const DEFAULT_MODE_ID = 'flight'

// speedMph/overheadHours/detourFactor are rough real-world stand-ins so a
// straight-line distance turns into a plausible travel time: overheadHours
// covers boarding/security/etc., detourFactor accounts for routes that
// aren't a straight line (roads, rail lines, ferry crossings).
// baseCostUsd/costPerMile are similarly a placeholder cost model (no live
// fare data), same spirit as the mock hotel pricing in lib/hotels.js.
export const TRAVEL_MODES = [
  {
    id: 'flight',
    label: '✈️ Flight',
    speedMph: 500,
    overheadHours: 2,
    detourFactor: 1,
    baseCostUsd: 120,
    costPerMile: 0.18,
    color: '#e8711a',
    dashArray: '2 10',
  },
  {
    id: 'car',
    label: '🚗 Car',
    speedMph: 60,
    overheadHours: 0,
    detourFactor: 1.3,
    baseCostUsd: 0,
    costPerMile: 0.15,
    color: '#1a73e8',
    dashArray: null,
  },
  {
    id: 'train',
    label: '🚆 Train',
    speedMph: 80,
    overheadHours: 0.5,
    detourFactor: 1.15,
    baseCostUsd: 20,
    costPerMile: 0.2,
    color: '#6a1b9a',
    dashArray: '1 6',
  },
  {
    id: 'boat',
    label: '⛴️ Boat',
    speedMph: 20,
    overheadHours: 0.25,
    detourFactor: 1.1,
    baseCostUsd: 30,
    costPerMile: 0.25,
    color: '#0097a7',
    dashArray: '6 4',
  },
  {
    id: 'walking',
    label: '🚶 Walking',
    speedMph: 3,
    overheadHours: 0,
    detourFactor: 1.2,
    baseCostUsd: 0,
    costPerMile: 0,
    color: '#616161',
    dashArray: '1 4',
  },
]

export function getTravelMode(id) {
  return TRAVEL_MODES.find((mode) => mode.id === id) ?? TRAVEL_MODES[0]
}

export function legKey(fromId, toId) {
  return `${fromId}:${toId}`
}

// Turns a straight-line distance into a rough real-world distance/time/cost
// for the given mode. This is still an estimate, not a routed path or a live fare.
export function estimateLeg(straightLineMiles, modeId) {
  const mode = getTravelMode(modeId)
  const distanceMiles = straightLineMiles * mode.detourFactor
  const hours = distanceMiles / mode.speedMph + mode.overheadHours
  const costUsd = mode.baseCostUsd + distanceMiles * mode.costPerMile
  return { distanceMiles, hours, costUsd }
}

// Shared by PlansTab (leg breakdown), MapView (route line coloring), and
// tripPlan.js (cost/time totals) so all three read the same leg data.
export function buildLegs(waypoints, legModes) {
  return waypoints.slice(0, -1).map((from, index) => {
    const to = waypoints[index + 1]
    const key = legKey(from.id, to.id)
    const modeId = legModes[key] || DEFAULT_MODE_ID
    const straightLineMiles = haversineMiles(from.position, to.position)
    const { distanceMiles, hours, costUsd } = estimateLeg(straightLineMiles, modeId)
    return { key, from, to, modeId, distanceMiles, hours, costUsd }
  })
}

export function formatDuration(hours) {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
