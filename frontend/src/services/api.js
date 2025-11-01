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
    
    // OSU Bus Routes - Based on thebus.okstate.edu/routes
    // Using OSU Orange and Black color scheme
    return {
      routes: [
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
    
    // OSU Bus Stops - Based on thebus.okstate.edu/routes
    return {
      stops: [
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

