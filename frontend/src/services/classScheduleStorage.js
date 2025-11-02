/**
 * Class schedule storage service
 * Handles saving and loading class schedules from localStorage
 */

const CLASS_SCHEDULE_STORAGE_KEY = 'osu_class_schedule'

/**
 * Save class schedule to localStorage
 * @param {Array} classes - Array of class objects
 */
export function saveClassSchedule(classes) {
  try {
    localStorage.setItem(CLASS_SCHEDULE_STORAGE_KEY, JSON.stringify(classes))
    console.log(`Saved ${classes.length} classes to storage`)
    return true
  } catch (error) {
    console.error('Error saving class schedule:', error)
    return false
  }
}

/**
 * Load class schedule from localStorage
 * @returns {Array} Array of class objects or empty array
 */
export function loadClassSchedule() {
  try {
    const saved = localStorage.getItem(CLASS_SCHEDULE_STORAGE_KEY)
    if (saved) {
      const classes = JSON.parse(saved)
      console.log(`Loaded ${classes.length} classes from storage`)
      return classes
    }
    return []
  } catch (error) {
    console.error('Error loading class schedule:', error)
    return []
  }
}

/**
 * Clear class schedule
 */
export function clearClassSchedule() {
  try {
    localStorage.removeItem(CLASS_SCHEDULE_STORAGE_KEY)
    console.log('Cleared class schedule storage')
    return true
  } catch (error) {
    console.error('Error clearing class schedule:', error)
    return false
  }
}

