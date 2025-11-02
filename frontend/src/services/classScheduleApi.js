/**
 * Class schedule API service
 */

import { loadClassSchedule, saveClassSchedule } from './classScheduleStorage'

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find the closest marker (stop) to a building location
 * @param {number} buildingLat 
 * @param {number} buildingLon 
 * @param {Array} stops - Array of stop objects with lat/lon
 * @returns {Object|null} Closest stop or null
 */
export function findClosestMarker(buildingLat, buildingLon, stops) {
  if (!stops || stops.length === 0 || !buildingLat || !buildingLon) {
    return null
  }

  let closestStop = null
  let minDistance = Infinity

  stops.forEach(stop => {
    if (stop.lat && stop.lon) {
      const distance = calculateDistance(buildingLat, buildingLon, stop.lat, stop.lon)
      if (distance < minDistance) {
        minDistance = distance
        closestStop = stop
      }
    }
  })

  return closestStop ? { ...closestStop, distance: minDistance } : null
}

/**
 * Fetch class schedule
 * @returns {Promise<{classes: Array}>}
 */
export async function fetchClassSchedule() {
  try {
    const classes = loadClassSchedule()
    return { classes }
  } catch (error) {
    console.error('Error fetching class schedule:', error)
    return { classes: [] }
  }
}

/**
 * Save class schedule
 * @param {Array} classes - Classes to save
 * @returns {Promise<boolean>}
 */
export async function saveClassScheduleData(classes) {
  try {
    return saveClassSchedule(classes)
  } catch (error) {
    console.error('Error saving class schedule:', error)
    return false
  }
}

/**
 * Match classes to closest markers
 * @param {Array} classes - Array of class objects with building coordinates
 * @param {Array} stops - Array of stop objects
 * @returns {Array} Classes with closest marker information
 */
export function matchClassesToMarkers(classes, stops) {
  if (!classes || !stops) {
    return []
  }

  return classes.map(cls => {
    if (cls.buildingLat && cls.buildingLon) {
      const closestMarker = findClosestMarker(cls.buildingLat, cls.buildingLon, stops)
      return {
        ...cls,
        closestMarker: closestMarker ? {
          stop_id: closestMarker.stop_id,
          name: closestMarker.name,
          distance: closestMarker.distance
        } : null
      }
    }
    return { ...cls, closestMarker: null }
  })
}

