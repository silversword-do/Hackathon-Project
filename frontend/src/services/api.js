/**
 * API service for fetching transit data
 */

// Backend API URL - update when backend API is implemented
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Fetch OSU bus routes
 * @returns {Promise<{routes: Array}>}
 */
export async function fetchOSURoutes() {
  try {
    // TODO: Replace with actual API call when backend is available
    // const response = await fetch(`${API_BASE_URL}/routes`)
    // return await response.json()
    
    // Mock OSU route data for now
    return {
      routes: [
        {
          route_id: 'OSU_RED',
          name: 'Red Route',
          color: '#FF0000',
          stops: [
            { stop_id: 'OSU001', name: 'Student Union', lat: 36.1197, lon: -97.0661 },
            { stop_id: 'OSU002', name: 'Library', lat: 36.1240, lon: -97.0680 },
            { stop_id: 'OSU003', name: 'Engineering North', lat: 36.1280, lon: -97.0695 },
          ]
        },
        {
          route_id: 'OSU_BLUE',
          name: 'Blue Route',
          color: '#0000FF',
          stops: [
            { stop_id: 'OSU004', name: 'Life Sciences East', lat: 36.1230, lon: -97.0710 },
            { stop_id: 'OSU005', name: 'Agriculture', lat: 36.1220, lon: -97.0730 },
          ]
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching routes:', error);
    return { routes: [] };
  }
}

/**
 * Fetch OSU bus stops
 * @returns {Promise<{stops: Array}>}
 */
export async function fetchOSUStops() {
  try {
    // TODO: Replace with actual API call when backend is available
    // const response = await fetch(`${API_BASE_URL}/stops`)
    // return await response.json()
    
    // Mock OSU stops data for now
    return {
      stops: [
        { stop_id: 'OSU001', name: 'Student Union', lat: 36.1197, lon: -97.0661, address: 'Student Union, OSU Campus' },
        { stop_id: 'OSU002', name: 'Library', lat: 36.1240, lon: -97.0680, address: 'Edmon Low Library' },
        { stop_id: 'OSU003', name: 'Engineering North', lat: 36.1280, lon: -97.0695, address: 'Engineering Building' },
        { stop_id: 'OSU004', name: 'Life Sciences East', lat: 36.1230, lon: -97.0710, address: 'Life Sciences Building' },
        { stop_id: 'OSU005', name: 'Agriculture', lat: 36.1220, lon: -97.0730, address: 'Agriculture Building' },
        { stop_id: 'OSU006', name: 'University Village', lat: 36.1200, lon: -97.0750, address: 'University Village' },
      ]
    };
  } catch (error) {
    console.error('Error fetching stops:', error);
    return { stops: [] };
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

