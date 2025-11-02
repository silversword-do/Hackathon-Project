/**
 * API service for fetching transit data
 */

import { loadStops, saveStops } from './routeStorage'
import { 
  fetchRoutesFromFirebase, 
  saveRoutesToFirebase, 
  saveRouteToFirebase,
  deleteRouteFromFirebase
} from './firebaseRoutes'

// Backend API URL - update when backend API is implemented
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Oklahoma state boundaries (approximate)
// Latitude: 33.6° to 37.0° N
// Longitude: -103.0° to -94.4° W
const OKLAHOMA_BOUNDS = {
  minLat: 33.6,
  maxLat: 37.0,
  minLon: -103.0,
  maxLon: -94.4
}

/**
 * Check if a coordinate is within Oklahoma state boundaries
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean}
 */
function isInOklahoma(lat, lon) {
  if (lat === undefined || lat === null || lon === undefined || lon === null) {
    return false
  }
  return lat >= OKLAHOMA_BOUNDS.minLat && 
         lat <= OKLAHOMA_BOUNDS.maxLat &&
         lon >= OKLAHOMA_BOUNDS.minLon &&
         lon <= OKLAHOMA_BOUNDS.maxLon
}

/**
 * Filter stops to only include those in Oklahoma
 * @param {Array} stops - Array of stop objects
 * @returns {Array} Filtered stops
 */
function filterOklahomaStops(stops) {
  if (!stops || stops.length === 0) return []
  
  return stops.filter(stop => {
    // Check main stop location
    const stopLon = stop.lon !== undefined ? stop.lon : stop.lng
    if (stop.lat !== undefined && stop.lat !== null && stopLon !== undefined && stopLon !== null) {
      return isInOklahoma(stop.lat, stopLon)
    }
    return false
  })
}

/**
 * Filter routes to only include those with stops in Oklahoma
 * @param {Array} routes - Array of route objects
 * @returns {Array} Filtered routes
 */
function filterOklahomaRoutes(routes) {
  if (!routes || routes.length === 0) return []
  
  return routes.map(route => {
    // Filter stops within route to only Oklahoma stops
    if (route.stops && Array.isArray(route.stops)) {
      const filteredStops = filterOklahomaStops(route.stops)
      // Only include route if it has at least one stop in Oklahoma
      if (filteredStops.length > 0) {
        return {
          ...route,
          stops: filteredStops
        }
      }
      return null // Route has no stops in Oklahoma
    }
    return route // Route has no stops defined, keep it
  }).filter(route => route !== null) // Remove null routes
}

// Default routes if none are saved in Firebase
const DEFAULT_ROUTES = [
  {
    route_id: 'OSU_ORANGE',
    name: 'Orange Route',
    color: '#FF6600', // OSU Orange
    stops: [
      { stop_id: 'OSU001', name: 'Student Union', lat: 36.1197, lon: -97.0661 },
      { stop_id: 'OSU002', name: 'Library', lat: 36.1240, lon: -97.0680 },
      { stop_id: 'OSU003', name: 'Engineering North', lat: 36.1280, lon: -97.0695 },
      { stop_id: 'OSU004', name: 'Life Sciences East', lat: 36.1230, lon: -97.0710 },
      { stop_id: 'OSU005', name: 'Agriculture', lat: 36.1220, lon: -97.0730 },
    ]
  },
  {
    route_id: 'OSU_BLACK',
    name: 'Black Route',
    color: '#000000', // OSU Black
    stops: [
      { stop_id: 'OSU006', name: 'University Village', lat: 36.1200, lon: -97.0750 },
      { stop_id: 'OSU007', name: 'Colvin Center', lat: 36.1260, lon: -97.0670 },
      { stop_id: 'OSU008', name: 'Stillwater Medical Center', lat: 36.1150, lon: -97.0600 },
      { stop_id: 'OSU009', name: 'Downtown Stillwater', lat: 36.1180, lon: -97.0580 },
    ]
  },
  {
    route_id: 'OSU_EXPRESS',
    name: 'Express Route',
    color: '#FF8C42', // OSU Orange Light
    stops: [
      { stop_id: 'OSU010', name: 'Residence Halls', lat: 36.1250, lon: -97.0700 },
      { stop_id: 'OSU011', name: 'Galloway Hall', lat: 36.1225, lon: -97.0690 },
      { stop_id: 'OSU012', name: 'Business Building', lat: 36.1210, lon: -97.0680 },
      { stop_id: 'OSU001', name: 'Student Union', lat: 36.1197, lon: -97.0661 },
    ]
  }
]

/**
 * Fetch OSU bus routes from Firebase
 * @returns {Promise<{routes: Array}>}
 */
export async function fetchOSURoutes() {
  try {
    // Try to fetch routes from Firebase
    const firebaseRoutes = await fetchRoutesFromFirebase()
    
    let routes = []
    if (firebaseRoutes && firebaseRoutes.length > 0) {
      // Remove the 'id' field that Firestore adds and use route_id instead
      routes = firebaseRoutes.map(route => {
        const { id, ...routeData } = route
        return routeData
      })
    } else {
      // Fallback to default routes if Firebase is empty
      routes = DEFAULT_ROUTES
    }
    
    // Filter to only include routes/stops within Oklahoma
    const filteredRoutes = filterOklahomaRoutes(routes)
    console.log(`Filtered routes: ${routes.length} -> ${filteredRoutes.length} (Oklahoma only)`)
    
    return { routes: filteredRoutes }
  } catch (error) {
    console.error('Error fetching routes from Firebase:', error)
    // Fallback to default routes on error, still filter them
    const filteredRoutes = filterOklahomaRoutes(DEFAULT_ROUTES)
    return { routes: filteredRoutes }
  }
}

/**
 * Save OSU bus routes to Firebase (admin only)
 * @param {Array} routes - Routes to save
 * @returns {Promise<boolean>}
 */
export async function saveOSURoutes(routes) {
  try {
    await saveRoutesToFirebase(routes)
    return true
  } catch (error) {
    console.error('Error saving routes to Firebase:', error)
    return false
  }
}

/**
 * Save a single route to Firebase (admin only)
 * @param {Object} route - Route to save
 * @returns {Promise<boolean>}
 */
export async function saveRoute(route) {
  try {
    await saveRouteToFirebase(route)
    return true
  } catch (error) {
    console.error('Error saving route to Firebase:', error)
    return false
  }
}

/**
 * Delete a route from Firebase (admin only)
 * @param {string} routeId - Route ID to delete
 * @returns {Promise<boolean>}
 */
export async function deleteRoute(routeId) {
  try {
    await deleteRouteFromFirebase(routeId)
    return true
  } catch (error) {
    console.error('Error deleting route from Firebase:', error)
    return false
  }
}

// Default stops if none are saved
const DEFAULT_STOPS = [
  { stop_id: 'OSU001', name: 'Student Union', lat: 36.1197, lon: -97.0661, address: 'Student Union, OSU Campus' },
  { stop_id: 'OSU002', name: 'Library', lat: 36.1240, lon: -97.0680, address: 'Edmon Low Library' },
  { stop_id: 'OSU003', name: 'Engineering North', lat: 36.1280, lon: -97.0695, address: 'Engineering Building' },
  { stop_id: 'OSU004', name: 'Life Sciences East', lat: 36.1230, lon: -97.0710, address: 'Life Sciences Building' },
  { stop_id: 'OSU005', name: 'Agriculture', lat: 36.1220, lon: -97.0730, address: 'Agriculture Building' },
  { stop_id: 'OSU006', name: 'University Village', lat: 36.1200, lon: -97.0750, address: 'University Village' },
  { stop_id: 'OSU007', name: 'Colvin Center', lat: 36.1260, lon: -97.0670, address: 'Colvin Recreation Center' },
  { stop_id: 'OSU008', name: 'Stillwater Medical Center', lat: 36.1150, lon: -97.0600, address: 'Stillwater Medical Center' },
  { stop_id: 'OSU009', name: 'Downtown Stillwater', lat: 36.1180, lon: -97.0580, address: 'Downtown Stillwater' },
  { stop_id: 'OSU010', name: 'Residence Halls', lat: 36.1250, lon: -97.0700, address: 'Residence Halls Complex' },
  { stop_id: 'OSU011', name: 'Galloway Hall', lat: 36.1225, lon: -97.0690, address: 'Galloway Hall' },
  { stop_id: 'OSU012', name: 'Business Building', lat: 36.1210, lon: -97.0680, address: 'Spears School of Business' },
]

/**
 * Fetch OSU bus stops
 * @returns {Promise<{stops: Array}>}
 */
export async function fetchOSUStops() {
  try {
    // Try to load saved stops first
    let stops = []
    const savedStops = loadStops()
    if (savedStops && savedStops.length > 0) {
      stops = savedStops
    } else {
      // Fallback to default stops
      stops = DEFAULT_STOPS
    }
    
    // Filter to only include stops within Oklahoma
    const filteredStops = filterOklahomaStops(stops)
    console.log(`Filtered stops: ${stops.length} -> ${filteredStops.length} (Oklahoma only)`)
    
    return { stops: filteredStops }
  } catch (error) {
    console.error('Error fetching stops:', error)
    // Still filter default stops
    const filteredStops = filterOklahomaStops(DEFAULT_STOPS)
    return { stops: filteredStops }
  }
}

/**
 * Save OSU bus stops (admin only)
 * @param {Array} stops - Stops to save
 * @returns {Promise<boolean>}
 */
export async function saveOSUStops(stops) {
  try {
    return saveStops(stops)
  } catch (error) {
    console.error('Error saving stops:', error)
    return false
  }
}

/**
 * Search stops by query
 * @param {string} query - Search query
 * @returns {Promise<Array>}
 */
export async function searchStops(query) {
  const { stops } = await fetchOSUStops()
  
  if (!query || !query.trim()) {
    return stops
  }
  
  const queryLower = query.toLowerCase().trim()
  return stops.filter(stop =>
    stop.name.toLowerCase().includes(queryLower) ||
    (stop.address && stop.address.toLowerCase().includes(queryLower))
  )
}

