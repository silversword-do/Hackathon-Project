/**
 * Bus Simulation Service
 * Manages simulated buses moving along routes
 */

// Bus movement speed (meters per second)
// Typical bus speed: ~15-20 mph = ~6.7-8.9 m/s
// For simulation, using ~7 m/s = ~420 m/min
const BUS_SPEED_METERS_PER_SECOND = 7

// Update interval in milliseconds (how often to update bus positions)
const UPDATE_INTERVAL_MS = 1000 // 1 second

/**
 * Calculate position along a path based on distance traveled
 * @param {Array<[lat, lng]>} path - Array of coordinates
 * @param {number} distanceMeters - Distance traveled along path
 * @returns {{lat: number, lng: number, segmentIndex: number, progress: number}} Current position
 */
export function getPositionAlongPath(path, distanceMeters) {
  if (!path || path.length < 2) {
    return { lat: 0, lng: 0, segmentIndex: 0, progress: 0 }
  }

  let remainingDistance = distanceMeters
  let segmentIndex = 0

  // Calculate distance between consecutive points
  for (let i = 0; i < path.length - 1; i++) {
    const [lat1, lng1] = path[i]
    const [lat2, lng2] = path[i + 1]
    
    const segmentDistance = calculateDistance(lat1, lng1, lat2, lng2)
    
    if (remainingDistance <= segmentDistance) {
      // Position is on this segment
      const progress = remainingDistance / segmentDistance
      const lat = lat1 + (lat2 - lat1) * progress
      const lng = lng1 + (lng2 - lng1) * progress
      
      return {
        lat,
        lng,
        segmentIndex: i,
        progress,
        distanceTraveled: distanceMeters
      }
    }
    
    remainingDistance -= segmentDistance
    segmentIndex = i + 1
  }
  
  // If we've passed the end, return the last point
  const [lastLat, lastLng] = path[path.length - 1]
  return {
    lat: lastLat,
    lng: lastLng,
    segmentIndex: path.length - 2,
    progress: 1,
    distanceTraveled: distanceMeters
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate total path distance
 */
export function calculatePathDistance(path) {
  if (!path || path.length < 2) return 0
  
  let totalDistance = 0
  for (let i = 0; i < path.length - 1; i++) {
    const [lat1, lng1] = path[i]
    const [lat2, lng2] = path[i + 1]
    totalDistance += calculateDistance(lat1, lng1, lat2, lng2)
  }
  return totalDistance
}

/**
 * Initialize buses for a route
 * @param {Object} route - Route object with busConfig
 * @param {Array<[lat, lng]>} path - Route path coordinates
 * @returns {Array<Object>} Array of bus objects
 */
export function initializeBuses(route, path) {
  if (!route.busConfig || !route.busConfig.count || route.busConfig.count <= 0) {
    return []
  }

  if (!path || path.length < 2) {
    return []
  }

  const totalDistance = calculatePathDistance(path)
  if (totalDistance === 0) {
    return []
  }

  const buses = []
  const busCount = Math.min(route.busConfig.count, 10) // Max 10 buses per route
  const direction = route.busConfig.direction || 'forward' // 'forward' or 'reverse'
  const startPosition = route.busConfig.startPosition || 0 // 0-1, position along path

  // Calculate spacing between buses (if multiple buses)
  const spacingDistance = totalDistance / busCount

  for (let i = 0; i < busCount; i++) {
    // Calculate starting distance for this bus
    let startDistance = startPosition * totalDistance
    
    if (busCount > 1) {
      // Space buses evenly along the route
      startDistance = (startPosition * totalDistance + (i * spacingDistance)) % totalDistance
    }

    buses.push({
      id: `${route.route_id}_bus_${i}`,
      routeId: route.route_id,
      distanceTraveled: startDistance,
      direction: direction,
      speed: BUS_SPEED_METERS_PER_SECOND,
      lastUpdateTime: Date.now()
    })
  }

  return buses
}

/**
 * Update bus positions based on time elapsed
 * @param {Array<Object>} buses - Array of bus objects
 * @param {Array<[lat, lng]>} path - Route path coordinates
 * @returns {Array<Object>} Updated buses with current positions
 */
export function updateBusPositions(buses, path) {
  if (!buses || buses.length === 0 || !path || path.length < 2) {
    return buses
  }

  const totalDistance = calculatePathDistance(path)
  const now = Date.now()

  return buses.map(bus => {
    const timeElapsed = (now - bus.lastUpdateTime) / 1000 // seconds
    const distanceToMove = bus.speed * timeElapsed
    
    let newDistance = bus.distanceTraveled
    
    if (bus.direction === 'forward') {
      newDistance += distanceToMove
      // Loop back to start if past the end
      if (newDistance >= totalDistance) {
        newDistance = newDistance % totalDistance
      }
    } else {
      // Reverse direction
      newDistance -= distanceToMove
      // Loop back to end if past the start
      if (newDistance < 0) {
        newDistance = totalDistance + (newDistance % totalDistance)
      }
    }

    const position = getPositionAlongPath(path, newDistance)
    
    return {
      ...bus,
      ...position,
      distanceTraveled: newDistance,
      lastUpdateTime: now
    }
  })
}

/**
 * Get bus icon rotation angle based on direction of travel
 * @param {Object} bus - Bus object with segmentIndex and path
 * @param {Array<[lat, lng]>} path - Route path coordinates
 * @returns {number} Rotation angle in degrees
 */
export function getBusRotation(bus, path) {
  if (!path || path.length < 2 || bus.segmentIndex === undefined) {
    return 0
  }

  const segmentIdx = Math.min(bus.segmentIndex, path.length - 2)
  const [lat1, lng1] = path[segmentIdx]
  const [lat2, lng2] = path[segmentIdx + 1]
  
  // Calculate bearing (direction) from point 1 to point 2
  const dLng = (lng2 - lng1) * Math.PI / 180
  const lat1Rad = lat1 * Math.PI / 180
  const lat2Rad = lat2 * Math.PI / 180
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI
  bearing = (bearing + 360) % 360
  
  // Reverse direction if bus is going backwards
  if (bus.direction === 'reverse') {
    bearing = (bearing + 180) % 360
  }
  
  return bearing
}

