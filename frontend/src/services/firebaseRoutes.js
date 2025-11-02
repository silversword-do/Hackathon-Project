/**
 * Firebase service for routes storage
 * Handles saving and loading routes from Firestore
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

const ROUTES_COLLECTION = "routes";

/**
 * Fetch all routes from Firestore
 * @returns {Promise<Array>} Array of route objects
 */
export async function fetchRoutesFromFirebase() {
  try {
    const routesRef = collection(db, ROUTES_COLLECTION);
    // Try to order by createdAt, but if it doesn't exist, just get all routes
    let querySnapshot;
    try {
      const q = query(routesRef, orderBy("createdAt", "desc"));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      // If ordering fails (e.g., no createdAt field or index missing), get all without ordering
      console.warn("Could not order by createdAt, fetching all routes:", orderError);
      querySnapshot = await getDocs(routesRef);
    }
    
    const routes = [];
    querySnapshot.forEach((doc) => {
      const routeData = doc.data();
      routes.push({
        id: doc.id,
        route_id: routeData.route_id || doc.id,
        ...routeData,
        // Convert Firestore Timestamps to regular objects if needed
        createdAt: routeData.createdAt?.toDate ? routeData.createdAt.toDate() : routeData.createdAt,
        updatedAt: routeData.updatedAt?.toDate ? routeData.updatedAt.toDate() : routeData.updatedAt,
      });
    });
    
    console.log(`Loaded ${routes.length} routes from Firebase`);
    return routes;
  } catch (error) {
    console.error("Error fetching routes from Firebase:", error);
    throw error;
  }
}

/**
 * Save a route to Firestore
 * @param {Object} routeData - Route object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveRouteToFirebase(routeData) {
  try {
    // Use route_id as document ID for easier updates
    const routeId = routeData.route_id || `ROUTE_${Date.now()}`;
    const routeRef = doc(db, ROUTES_COLLECTION, routeId);
    
    const routeToSave = {
      ...routeData,
      route_id: routeId,
      updatedAt: Timestamp.now(),
      ...(routeData.createdAt ? {} : { createdAt: Timestamp.now() }),
    };
    
    await setDoc(routeRef, routeToSave, { merge: true });
    console.log(`Saved route ${routeId} to Firebase`);
    return true;
  } catch (error) {
    console.error("Error saving route to Firebase:", error);
    throw error;
  }
}

/**
 * Save multiple routes to Firestore
 * @param {Array} routes - Array of route objects
 * @returns {Promise<boolean>} Success status
 */
export async function saveRoutesToFirebase(routes) {
  try {
    const savePromises = routes.map((route) => saveRouteToFirebase(route));
    await Promise.all(savePromises);
    console.log(`Saved ${routes.length} routes to Firebase`);
    return true;
  } catch (error) {
    console.error("Error saving routes to Firebase:", error);
    throw error;
  }
}

/**
 * Delete a route from Firestore
 * @param {string} routeId - Route ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteRouteFromFirebase(routeId) {
  try {
    const routeRef = doc(db, ROUTES_COLLECTION, routeId);
    await deleteDoc(routeRef);
    console.log(`Deleted route ${routeId} from Firebase`);
    return true;
  } catch (error) {
    console.error("Error deleting route from Firebase:", error);
    throw error;
  }
}

