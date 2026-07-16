const MS_PER_DAY = 24 * 60 * 60 * 1000

// Dates come from <input type="date"> as "yyyy-mm-dd"; parsing with an
// explicit local-midnight time avoids the UTC-vs-local off-by-one day that
// `new Date("yyyy-mm-dd")` alone is prone to.
function parseDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`)
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// Turns a start/end date range into how many nights each stop gets: an even
// split of the range's days, with any remainder going to the earlier stops,
// and a minimum of 1 night per stop. If the range is too short to give every
// stop at least 1 night, this still returns a best-effort 1-night-each split
// and flags `feasible: false` with how many extra days would be needed.
export function buildItinerary({ startDate, endDate, stopCount }) {
  if (!startDate || !endDate || stopCount <= 0) {
    return { totalDays: 0, nightsPerStop: [], feasible: true, shortfallDays: 0 }
  }

  const totalDays =
    Math.round((parseDate(endDate) - parseDate(startDate)) / MS_PER_DAY) + 1

  if (totalDays < stopCount) {
    return {
      totalDays,
      nightsPerStop: Array(stopCount).fill(1),
      feasible: false,
      shortfallDays: stopCount - totalDays,
    }
  }

  const base = Math.floor(totalDays / stopCount)
  const remainder = totalDays % stopCount
  const nightsPerStop = Array.from({ length: stopCount }, (_, i) =>
    i < remainder ? base + 1 : base,
  )

  return { totalDays, nightsPerStop, feasible: true, shortfallDays: 0 }
}

// Walks sequentially from startDate assigning each stop an arrival/departure
// Date based on its night count (departure of one stop = arrival at the next).
export function buildStopDates(startDate, nightsPerStop) {
  let current = parseDate(startDate)
  return nightsPerStop.map((nights) => {
    const arrival = current
    const departure = addDays(current, nights)
    current = departure
    return { arrival, departure, nights }
  })
}
