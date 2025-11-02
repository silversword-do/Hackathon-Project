/**
 * Firebase service for user schedule storage
 * Handles saving and loading user-specific class schedules from Firestore
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

const USER_SCHEDULES_COLLECTION = "userSchedules";

/**
 * Fetch user's class schedule from Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} Array of class objects
 */
export async function fetchUserSchedule(userId) {
  try {
    if (!userId) {
      console.warn("No userId provided, returning empty schedule");
      return [];
    }

    const scheduleRef = doc(db, USER_SCHEDULES_COLLECTION, userId);
    const scheduleSnap = await getDoc(scheduleRef);
    
    if (scheduleSnap.exists()) {
      const data = scheduleSnap.data();
      const classes = data.classes || [];
      console.log(`Loaded ${classes.length} classes for user ${userId}`);
      return classes;
    } else {
      console.log(`No schedule found for user ${userId}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user schedule from Firebase:", error);
    throw error;
  }
}

/**
 * Save user's class schedule to Firestore
 * @param {string} userId - Firebase user ID
 * @param {Array} classes - Array of class objects to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveUserSchedule(userId, classes) {
  try {
    if (!userId) {
      console.error("No userId provided, cannot save schedule");
      return false;
    }

    const scheduleRef = doc(db, USER_SCHEDULES_COLLECTION, userId);
    
    const scheduleData = {
      classes: classes || [],
      updatedAt: Timestamp.now(),
      userId: userId,
    };
    
    await setDoc(scheduleRef, scheduleData, { merge: true });
    console.log(`Saved ${classes.length} classes for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error saving user schedule to Firebase:", error);
    throw error;
  }
}

