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
    const q = query(routesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const routes = [];
    querySnapshot.forEach((doc) => {
      routes.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamps to regular objects if needed
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
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

