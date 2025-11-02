import { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

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
            setUserRole(userData.role || "user");
          } else {
            // Create user document if it doesn't exist
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              role: "user",
              createdAt: new Date(),
            });
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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

  const signup = async (email, password, role = "user") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,
        createdAt: new Date(),
      });
      
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

  const value = {
    isAuthenticated,
    userRole,
    isAdmin: userRole === "admin",
    user,
    loading,
    login,
    signup,
    logout,
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
