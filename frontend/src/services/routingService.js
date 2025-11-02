/**
 * Routing service to get actual road paths between coordinates
 * Uses OSRM (Open Source Routing Machine) for free, open-source routing
 */

// OSRM public demo server (free, no API key required)
// For production, consider using your own OSRM instance or OpenRouteService
const OSRM_BASE_URL = 'https://router.project-osrm.org'

// Cache for route paths to avoid repeated API calls
const routeCache = new Map()

/**
 * Generate a cache key for a route segment
 */
function getCacheKey(start, end) {
  return `${start.lat.toFixed(5)},${start.lng.toFixed(5)}-${end.lat.toFixed(5)},${end.lng.toFixed(5)}`
}

/**
 * Get route path between two points using OSRM
 * @param {Object} start - {lat, lng} or {lat, lon}
 * @param {Object} end - {lat, lng} or {lat, lon}
 * @returns {Promise<Array<[lat, lng]>>} Array of coordinates following roads
 */
export async function getRoutePath(start, end) {
  // Support both 'lon' and 'lng' property names
  const startLng = start.lon !== undefined ? start.lon : start.lng
  const endLng = end.lon !== undefined ? end.lon : end.lng
  
  // Validate coordinates
  if (!start.lat || startLng === undefined || !end.lat || endLng === undefined) {
    console.error('Invalid coordinates for routing', { start, end })
    // Return empty array or valid fallback
    const fallbackPath = [
      ...(start.lat && startLng !== undefined ? [[start.lat, startLng]] : []),
      ...(end.lat && endLng !== undefined ? [[end.lat, endLng]] : [])
    ]
    return fallbackPath.length > 0 ? fallbackPath : [[start.lat || 0, startLng || 0], [end.lat || 0, endLng || 0]]
  }
  
  const cacheKey = getCacheKey({ lat: start.lat, lng: startLng }, { lat: end.lat, lng: endLng })
  
  // Check cache first
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)
  }

  try {
    // OSRM route API format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
    // Note: OSRM uses lon,lat order (not lat,lon)
    const url = `${OSRM_BASE_URL}/route/v1/driving/${startLng},${start.lat};${endLng},${end.lat}?overview=full&geometries=geojson`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      // If routing fails, fall back to straight line
      console.warn('Routing failed, using straight line', { start, end })
      const fallbackPath = [[start.lat, startLng], [end.lat, endLng]]
      routeCache.set(cacheKey, fallbackPath)
      return fallbackPath
    }

    // Extract coordinates from GeoJSON geometry
    // OSRM returns coordinates as [lon, lat] arrays
    const geometry = data.routes[0].geometry.coordinates
    const path = geometry.map(coord => [coord[1], coord[0]]) // Convert to [lat, lng]
    
    // Cache the result
    routeCache.set(cacheKey, path)
    
    return path
  } catch (error) {
    console.error('Error getting route path:', error)
    // Fall back to straight line on error
    const fallbackPath = [[start.lat, startLng], [end.lat, endLng]]
    routeCache.set(cacheKey, fallbackPath)
    return fallbackPath
  }
}

/**
 * Get route path for an entire route with multiple stops
 * @param {Array<Object>} stops - Array of {lat, lon/lng} objects
 * @returns {Promise<Array<[lat, lng]>>} Combined path following roads
 */
export async function getRoutePathForStops(stops) {
  if (!stops || stops.length < 2) {
    // Handle empty or single stop
    if (!stops || stops.length === 0) return []
    return stops.map(stop => [stop.lat, stop.lon || stop.lng])
  }

  try {
    const fullPath = []
    
    // Get route path for each segment between consecutive stops
    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i]
      const end = stops[i + 1]
      
      // Support both 'lon' and 'lng' property names for compatibility
      const startLng = start.lon || start.lng
      const endLng = end.lon || end.lng
      
      // Validate coordinates
      if (!start.lat || startLng === undefined || !end.lat || endLng === undefined) {
        console.warn('Invalid stop coordinates, skipping segment', { start, end })
        continue
      }
      
      // Add a small delay to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      const segmentPath = await getRoutePath(
        { lat: start.lat, lng: startLng },
        { lat: end.lat, lng: endLng }
      )
      
      // Add segment to full path (avoid duplicate point at junction)
      if (fullPath.length === 0) {
        fullPath.push(...segmentPath)
      } else {
        // Skip first point of segment (it's the same as last point of previous segment)
        fullPath.push(...segmentPath.slice(1))
      }
    }
    
    return fullPath.length > 0 ? fullPath : stops.map(stop => [stop.lat, stop.lon || stop.lng])
  } catch (error) {
    console.error('Error getting route path for stops:', error)
    // Fall back to straight lines
    return stops.map(stop => [stop.lat, stop.lon || stop.lng])
  }
}

/**
 * Clear the route cache (useful for testing or forcing recalculation)
 */
export function clearRouteCache() {
  routeCache.clear()
}

/**
 * Get cache size (useful for debugging)
 */
export function getCacheSize() {
  return routeCache.size
}

