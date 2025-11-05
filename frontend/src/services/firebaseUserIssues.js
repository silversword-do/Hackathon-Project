/**
 * Firebase service for user issues/help requests
 * Stores user issues under their user document
 */

import { 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  getDocs,
  collection,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const USERS_COLLECTION = "users";

/**
 * Submit a user issue/help request
 * @param {string} userId - User ID
 * @param {string} issue - Issue description
 * @param {string} category - Issue category (optional)
 * @returns {Promise<boolean>} Success status
 */
export async function submitUserIssue(userId, issue, category = 'general') {
  try {
    if (!userId || !issue || issue.trim().length === 0) {
      throw new Error("User ID and issue description are required");
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    const issueData = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issue: issue.trim(),
      category: category,
      status: 'open', // 'open', 'in_progress', 'resolved', 'closed'
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Add issue to user's issues array
    await updateDoc(userRef, {
      issues: arrayUnion(issueData),
      updatedAt: Timestamp.now()
    });

    console.log(`Saved issue for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error submitting user issue:", error);
    throw error;
  }
}

/**
 * Get all issues for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of issue objects
 */
export async function getUserIssues(userId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const issues = userData.issues || [];
    
    // Convert Firestore Timestamps
    return issues.map(issue => ({
      ...issue,
      createdAt: issue.createdAt?.toDate ? issue.createdAt.toDate() : issue.createdAt,
      updatedAt: issue.updatedAt?.toDate ? issue.updatedAt.toDate() : issue.updatedAt
    }));
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return [];
  }
}

/**
 * Update issue status (admin only)
 * @param {string} userId - User ID
 * @param {string} issueId - Issue ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} Success status
 */
export async function updateIssueStatus(userId, issueId, status) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();
    const issues = userData.issues || [];
    
    const updatedIssues = issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: status,
          updatedAt: Timestamp.now()
        };
      }
      return issue;
    });

    await updateDoc(userRef, {
      issues: updatedIssues,
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    console.error("Error updating issue status:", error);
    throw error;
  }
}

/**
 * Get all issues from all users (admin only)
 * @returns {Promise<Array>} Array of issues with user info
 */
export async function getAllIssues() {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    const allIssues = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const issues = userData.issues || [];
      
      issues.forEach(issue => {
        allIssues.push({
          ...issue,
          userId: doc.id,
          userEmail: userData.email || 'Unknown',
          createdAt: issue.createdAt?.toDate ? issue.createdAt.toDate() : issue.createdAt,
          updatedAt: issue.updatedAt?.toDate ? issue.updatedAt.toDate() : issue.updatedAt
        });
      });
    });
    
    // Sort by creation date (newest first)
    allIssues.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    return allIssues;
  } catch (error) {
    console.error("Error fetching all issues:", error);
    return [];
  }
}

