/**
 * Admin Helper Utilities
 * Helper functions for managing admin roles
 */

import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Promote a user to admin by email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function promoteUserToAdmin(email) {
  try {
    // Find user by email in users collection
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        message: `No user found with email: ${email}`
      };
    }
    
    // Update all matching users (should only be one)
    const updatePromises = [];
    querySnapshot.forEach((userDoc) => {
      updatePromises.push(
        updateDoc(userDoc.ref, { role: "admin" })
      );
    });
    
    await Promise.all(updatePromises);
    
    return {
      success: true,
      message: `Successfully promoted ${email} to admin`
    };
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Promote a user to admin by user ID
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function promoteUserToAdminById(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return {
        success: false,
        message: `No user found with ID: ${userId}`
      };
    }
    
    await updateDoc(userDocRef, { role: "admin" });
    
    return {
      success: true,
      message: "Successfully promoted user to admin"
    };
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Get list of all users
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllUsers() {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

