import { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

// Admin email patterns - users with these emails will automatically get admin role
const ADMIN_EMAILS = [
  "admin",
  "admin@",
  "@admin",
  "nic.cooper.999@gmail.com" // Add specific admin emails here
];

// Check if an email should be admin
function isAdminEmail(email) {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  
  // Check exact matches
  if (ADMIN_EMAILS.some(pattern => emailLower.includes(pattern.toLowerCase()))) {
    return true;
  }
  
  // Check if email contains "admin" as a word
  if (emailLower.includes("admin") || emailLower.startsWith("admin")) {
    return true;
  }
  
  return false;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Get user role from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let role = userData.role || "user";
            
            console.log(`User ${firebaseUser.email} current role: ${role}`);
            
            // Auto-promote to admin if email matches admin pattern and not already admin
            if (!role || role === "user") {
              if (isAdminEmail(firebaseUser.email)) {
                console.log(`Auto-promoting ${firebaseUser.email} to admin`);
                role = "admin";
                try {
                  // Update the role in Firestore
                  await updateDoc(userDocRef, { role: "admin" });
                  console.log(`Successfully updated role to admin for ${firebaseUser.email}`);
                } catch (updateError) {
                  console.error("Error updating role to admin:", updateError);
                  console.error("Error code:", updateError.code);
                  console.error("Error message:", updateError.message);
                }
              }
            }
            
            console.log(`Final role for ${firebaseUser.email}: ${role}, isAdmin: ${role === "admin"}`);
            setUserRole(role);
          } else {
            // Create user document if it doesn't exist
            const defaultRole = isAdminEmail(firebaseUser.email) ? "admin" : "user";
            try {
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                role: defaultRole,
                createdAt: Timestamp.now(),
              });
              console.log(`Created user document for ${firebaseUser.email} with role: ${defaultRole}`);
              setUserRole(defaultRole);
            } catch (createError) {
              console.error("Error creating user document:", createError);
              console.error("Error code:", createError.code);
              console.error("Error message:", createError.message);
              // Still set the role locally even if Firestore write fails
              setUserRole(defaultRole);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole("user");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by onAuthStateChanged listener
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || "Failed to sign in. Please check your credentials." 
      };
    }
  };

  const signup = async (email, password, role = null) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Determine role: use provided role, or check if admin email, or default to user
      const finalRole = role || (isAdminEmail(email) ? "admin" : "user");
      
      // Create user document in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      try {
        await setDoc(userDocRef, {
          email: email,
          role: finalRole,
          createdAt: Timestamp.now(),
        });
        console.log(`Created user document for ${email} with role: ${finalRole}`);
      } catch (docError) {
        console.error("Error creating user document during signup:", docError);
        console.error("Error code:", docError.code);
        console.error("Error message:", docError.message);
        // Re-throw to let the caller handle it
        throw docError;
      }
      
      // Auth state will be updated by onAuthStateChanged listener
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Function to update user role (admin only function, can be called from admin panel)
  const updateUserRole = async (userId, newRole) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: newRole });
      
      // If updating current user's role, update local state
      if (user && user.uid === userId) {
        setUserRole(newRole);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    isAdmin: userRole === "admin",
    user,
    loading,
    login,
    signup,
    logout,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
