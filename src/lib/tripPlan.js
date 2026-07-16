import { buildLegs } from './travelModes'
import { buildItinerary, buildStopDates } from './itinerary'
import { fetchNearbyHotels } from './hotels'

function cheapestHotel(hotels) {
  if (!hotels || hotels.length === 0) return null
  return [...hotels].sort(
    (a, b) => a.estimatedPricePerNight - b.estimatedPricePerNight,
  )[0]
}

// Combines the ordered Plans list, per-leg travel mode/cost estimates, a
// nights-per-stop split of the trip's date range, and a cheapest-hotel pick
// per stop into one submitted trip plan.
const TRAVELERS_PER_ROOM = 2

export async function buildTripPlan({
  plans,
  legModes,
  userPosition,
  startDate,
  endDate,
  travelers = 1,
}) {
  if (plans.length === 0) {
    throw new Error('Add at least one destination to calculate a trip plan.')
  }
  if (!startDate || !endDate) {
    throw new Error('Pick a start and end date for the trip.')
  }
  if (endDate < startDate) {
    throw new Error('End date must be on or after the start date.')
  }
  if (!travelers || travelers < 1) {
    throw new Error('Enter at least 1 traveler.')
  }

  const waypoints = userPosition
    ? [
        { id: '__user__', name: '📍 Current location', position: userPosition },
        ...plans,
      ]
    : plans
  const legs = buildLegs(waypoints, legModes)

  const { totalDays, nightsPerStop, feasible, shortfallDays } = buildItinerary({
    startDate,
    endDate,
    stopCount: plans.length,
  })
  const stopDates = buildStopDates(startDate, nightsPerStop)

  const hotelResults = await Promise.all(
    plans.map((plan) => fetchNearbyHotels(plan.position).catch(() => [])),
  )

  const rooms = Math.ceil(travelers / TRAVELERS_PER_ROOM)

  const stops = plans.map((plan, index) => {
    const hotel = cheapestHotel(hotelResults[index])
    const { arrival, departure, nights } = stopDates[index]
    const hotelSubtotal = hotel ? hotel.estimatedPricePerNight * nights * rooms : 0
    return { plan, arrival, departure, nights, hotel, rooms, hotelSubtotal }
  })

  const totalTravelCost =
    legs.reduce((sum, leg) => sum + leg.costUsd, 0) * travelers
  const totalHotelCost = stops.reduce((sum, stop) => sum + stop.hotelSubtotal, 0)

  return {
    stops,
    legs,
    travelers,
    rooms,
    totalTravelCost,
    totalHotelCost,
    totalCost: totalTravelCost + totalHotelCost,
    totalDays,
    feasible,
    shortfallDays,
  }
}
