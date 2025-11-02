/**
 * Route storage service
 * Handles saving and loading routes from localStorage
 */

const ROUTES_STORAGE_KEY = 'osu_bus_routes'
const STOPS_STORAGE_KEY = 'osu_bus_stops'

/**
 * Save routes to localStorage
 * @param {Array} routes - Array of route objects
 */
export function saveRoutes(routes) {
  try {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes))
    console.log(`Saved ${routes.length} routes to storage`)
    return true
  } catch (error) {
    console.error('Error saving routes:', error)
    return false
  }
}

/**
 * Load routes from localStorage
 * @returns {Array} Array of route objects or empty array
 */
export function loadRoutes() {
  try {
    const saved = localStorage.getItem(ROUTES_STORAGE_KEY)
    if (saved) {
      const routes = JSON.parse(saved)
      console.log(`Loaded ${routes.length} routes from storage`)
      return routes
    }
    return []
  } catch (error) {
    console.error('Error loading routes:', error)
    return []
  }
}

/**
 * Save stops to localStorage
 * @param {Array} stops - Array of stop objects
 */
export function saveStops(stops) {
  try {
    localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify(stops))
    console.log(`Saved ${stops.length} stops to storage`)
    return true
  } catch (error) {
    console.error('Error saving stops:', error)
    return false
  }
}

/**
 * Load stops from localStorage
 * @returns {Array} Array of stop objects or empty array
 */
export function loadStops() {
  try {
    const saved = localStorage.getItem(STOPS_STORAGE_KEY)
    if (saved) {
      const stops = JSON.parse(saved)
      console.log(`Loaded ${stops.length} stops from storage`)
      return stops
    }
    return []
  } catch (error) {
    console.error('Error loading stops:', error)
    return []
  }
}

/**
 * Clear all saved routes and stops
 */
export function clearStorage() {
  try {
    localStorage.removeItem(ROUTES_STORAGE_KEY)
    localStorage.removeItem(STOPS_STORAGE_KEY)
    console.log('Cleared route storage')
    return true
  } catch (error) {
    console.error('Error clearing storage:', error)
    return false
  }
}

