/**
 * Firebase service for bus data storage
 * Handles saving and loading bus positions and real-time location data
 *
 * Database Structure:
 * - Collection: "buses"
 *   - Document ID: bus ID (e.g., "OSU_ORANGE_bus_1234567890")
 *   - Fields:
 *     - id: Bus ID
 *     - routeId: Route ID this bus belongs to
 *     - lat, lng: Current position
 *     - distanceTraveled: Distance along route path (meters)
 *     - direction: 'forward' or 'reverse'
 *     - speed: Speed in meters per second
 *     - location: {lat, lng, accuracy, timestamp} - For real-time location data
 *     - realTimeLocation: {enabled, lastUpdate, source} - Tracks if using real GPS data
 *     - createdAt, updatedAt: Timestamps
 *
 * This structure supports:
 * - Simulated buses (current implementation)
 * - Real-time GPS location data (future implementation)
 * - API-based location updates (future implementation)
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const BUSES_COLLECTION = "buses";

/**
 * Save bus data to Firebase
 * Stores buses in the 'buses' collection
 * @param {Object} busData - Bus object with routeId, position, etc.
 * @returns {Promise<boolean>} Success status
 */
export async function saveBusToFirebase(busData) {
  try {
    const busId = busData.id || `${busData.routeId}_bus_${Date.now()}`;
    // Store buses in the buses collection
    const busRef = doc(db, BUSES_COLLECTION, busId);

    const busToSave = {
      ...busData,
      id: busId,
      updatedAt: Timestamp.now(),
      location: {
        lat: busData.lat,
        lng: busData.lng,
        accuracy: busData.accuracy || null,
        timestamp: Timestamp.now(),
      },
      // Support for real-time location data in the future
      realTimeLocation: {
        enabled: busData.realTimeLocation?.enabled || false,
        lastUpdate: Timestamp.now(),
        source: busData.realTimeLocation?.source || "simulated", // 'simulated', 'gps', 'api'
      },
      ...(busData.createdAt ? {} : { createdAt: Timestamp.now() }),
    };

    await setDoc(busRef, busToSave, { merge: true });
    console.log(`Saved bus ${busId} to Firebase`);
    return true;
  } catch (error) {
    console.error("Error saving bus to Firebase:", error);
    throw error;
  }
}

/**
 * Save multiple buses for a route
 * @param {string} routeId - Route ID
 * @param {Array} buses - Array of bus objects
 * @returns {Promise<boolean>} Success status
 */
export async function saveBusesForRoute(routeId, buses) {
  try {
    const savePromises = buses.map((bus) =>
      saveBusToFirebase({
        ...bus,
        routeId,
      })
    );
    await Promise.all(savePromises);
    console.log(`Saved ${buses.length} buses for route ${routeId} to Firebase`);
    return true;
  } catch (error) {
    console.error("Error saving buses for route:", error);
    throw error;
  }
}

/**
 * Fetch all buses from Firebase
 * @returns {Promise<Array>} Array of bus objects
 */
export async function fetchBusesFromFirebase() {
  try {
    // Fetch all buses from the buses collection
    const busesRef = collection(db, BUSES_COLLECTION);
    const querySnapshot = await getDocs(busesRef);

    const buses = [];
    querySnapshot.forEach((doc) => {
      const busData = doc.data();
      buses.push({
        id: doc.id,
        ...busData,
        // Convert Firestore Timestamps
        createdAt: busData.createdAt?.toDate
          ? busData.createdAt.toDate()
          : busData.createdAt,
        updatedAt: busData.updatedAt?.toDate
          ? busData.updatedAt.toDate()
          : busData.updatedAt,
        location: busData.location
          ? {
              ...busData.location,
              timestamp: busData.location.timestamp?.toDate
                ? busData.location.timestamp.toDate()
                : busData.location.timestamp,
            }
          : null,
        realTimeLocation: busData.realTimeLocation
          ? {
              ...busData.realTimeLocation,
              lastUpdate: busData.realTimeLocation.lastUpdate?.toDate
                ? busData.realTimeLocation.lastUpdate.toDate()
                : busData.realTimeLocation.lastUpdate,
            }
          : null,
      });
    });

    console.log(`Loaded ${buses.length} buses from Firebase`);
    return buses;
  } catch (error) {
    console.error("Error fetching buses from Firebase:", error);
    throw error;
  }
}

/**
 * Fetch buses for a specific route
 * @param {string} routeId - Route ID
 * @returns {Promise<Array>} Array of bus objects for the route
 */
export async function fetchBusesForRoute(routeId) {
  try {
    const busesRef = collection(db, BUSES_COLLECTION);
    const q = query(busesRef, where("routeId", "==", routeId));
    const querySnapshot = await getDocs(q);

    const buses = [];
    querySnapshot.forEach((doc) => {
      const busData = doc.data();
      buses.push({
        id: doc.id,
        ...busData,
        createdAt: busData.createdAt?.toDate
          ? busData.createdAt.toDate()
          : busData.createdAt,
        updatedAt: busData.updatedAt?.toDate
          ? busData.updatedAt.toDate()
          : busData.updatedAt,
      });
    });

    return buses;
  } catch (error) {
    console.error("Error fetching buses for route:", error);
    throw error;
  }
}

/**
 * Update bus position (for real-time location updates)
 * @param {string} busId - Bus ID
 * @param {Object} location - {lat, lng, accuracy}
 * @param {string} source - Location source ('gps', 'api', 'simulated')
 * @returns {Promise<boolean>} Success status
 */
export async function updateBusLocation(busId, location, source = "simulated") {
  try {
    const busRef = doc(db, BUSES_COLLECTION, busId);

    await updateDoc(busRef, {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy || null,
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || null,
        timestamp: Timestamp.now(),
      },
      realTimeLocation: {
        enabled: true,
        lastUpdate: Timestamp.now(),
        source: source,
      },
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error("Error updating bus location:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time bus location updates
 * @param {string} routeId - Route ID (optional, if null, subscribes to all buses)
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToBusUpdates(routeId, callback) {
  try {
    const busesRef = collection(db, BUSES_COLLECTION);
    let q = busesRef;

    if (routeId) {
      q = query(busesRef, where("routeId", "==", routeId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const buses = [];
      snapshot.forEach((doc) => {
        const busData = doc.data();
        buses.push({
          id: doc.id,
          ...busData,
          location: busData.location
            ? {
                ...busData.location,
                timestamp: busData.location.timestamp?.toDate
                  ? busData.location.timestamp.toDate()
                  : busData.location.timestamp,
              }
            : null,
        });
      });
      callback(buses);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to bus updates:", error);
    return () => {}; // Return empty unsubscribe function on error
  }
}

/**
 * Delete a bus from Firebase
 * @param {string} busId - Bus ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBusFromFirebase(busId) {
  try {
    const busRef = doc(db, BUSES_COLLECTION, busId);
    await deleteDoc(busRef);
    console.log(`Deleted bus ${busId} from Firebase`);
    return true;
  } catch (error) {
    console.error("Error deleting bus from Firebase:", error);
    throw error;
  }
}
