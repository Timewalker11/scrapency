import { haversineMiles } from './geo'

// Beyond this many stops, exact permutation search becomes too slow
// (9! = 362,880+), so a nearest-neighbor + 2-opt heuristic takes over.
const EXACT_SOLVE_LIMIT = 8

function pathDistance(order, start) {
  const positions = start
    ? [start, ...order.map((stop) => stop.position)]
    : order.map((stop) => stop.position)

  let total = 0
  for (let i = 0; i < positions.length - 1; i++) {
    total += haversineMiles(positions[i], positions[i + 1])
  }
  return total
}

function permutations(items) {
  if (items.length <= 1) return [items]

  const result = []
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([item, ...perm])
    }
  })
  return result
}

function solveExact(stops, start) {
  let bestOrder = stops
  let bestDistance = Infinity

  for (const perm of permutations(stops)) {
    const distance = pathDistance(perm, start)
    if (distance < bestDistance) {
      bestDistance = distance
      bestOrder = perm
    }
  }

  return { order: bestOrder, distanceMiles: bestDistance }
}

function nearestNeighborOrder(stops, fixedStartIndex, start) {
  const remaining = [...stops]
  const order = []
  let current = start

  if (fixedStartIndex !== null) {
    const [first] = remaining.splice(fixedStartIndex, 1)
    order.push(first)
    current = first.position
  }

  while (remaining.length > 0) {
    let bestIndex = 0
    let bestDistance = Infinity
    remaining.forEach((stop, index) => {
      const distance = haversineMiles(current, stop.position)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    })
    const [next] = remaining.splice(bestIndex, 1)
    order.push(next)
    current = next.position
  }

  return order
}

function twoOptImprove(initialOrder, start) {
  let order = initialOrder
  let distance = pathDistance(order, start)
  let improved = true

  while (improved) {
    improved = false
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const candidate = [
          ...order.slice(0, i),
          ...order.slice(i, j + 1).reverse(),
          ...order.slice(j + 1),
        ]
        const candidateDistance = pathDistance(candidate, start)
        if (candidateDistance < distance - 1e-9) {
          order = candidate
          distance = candidateDistance
          improved = true
        }
      }
    }
  }

  return { order, distanceMiles: distance }
}

function solveHeuristic(stops, start) {
  // With no fixed starting point, try every stop as the seed for the
  // nearest-neighbor pass, since the best tour isn't necessarily the
  // one that begins with stop 0.
  const candidateStartIndices = start ? [null] : stops.map((_, i) => i)

  let best = null
  for (const startIndex of candidateStartIndices) {
    const seeded = nearestNeighborOrder(stops, startIndex, start)
    const improved = twoOptImprove(seeded, start)
    if (!best || improved.distanceMiles < best.distanceMiles) {
      best = improved
    }
  }
  return best
}

// Solves the "shortest path visiting every stop" problem (not a round
// trip back to the start) using straight-line distance, which stands
// in for travel time when any mode of transport is available.
export function optimizeRoute(stops, start = null) {
  if (stops.length === 0) {
    return { order: [], distanceMiles: 0 }
  }
  if (stops.length === 1) {
    return {
      order: stops,
      distanceMiles: start ? haversineMiles(start, stops[0].position) : 0,
    }
  }

  return stops.length <= EXACT_SOLVE_LIMIT
    ? solveExact(stops, start)
    : solveHeuristic(stops, start)
}
