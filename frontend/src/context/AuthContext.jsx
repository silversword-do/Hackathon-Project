import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem("isAuthenticated");
    return saved === "true";
  });

  const [userRole, setUserRole] = useState(() => {
    // Check localStorage for user role
    return localStorage.getItem("userRole") || "user";
  });

  useEffect(() => {
    // Persist authentication state
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
    localStorage.setItem("userRole", userRole);
  }, [isAuthenticated, userRole]);

  const login = (role = "user") => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole("user");
  };

  const value = {
    isAuthenticated,
    userRole,
    isAdmin: userRole === "admin",
    login,
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
