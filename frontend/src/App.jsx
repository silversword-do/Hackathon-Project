/**
 * Main App component - Root of the React application
 * 
 * This component sets up the entire application structure:
 * - Context providers (Font, Theme, Auth) that wrap the entire app
 * - React Router for navigation between screens
 * - Authentication-based route protection
 * - Main layout with navigation bar
 * 
 * Component Hierarchy:
 * App (root)
 *   └─ FontProvider (font size preferences)
 *       └─ ThemeProvider (dark/light mode)
 *           └─ AuthProvider (authentication state)
 *               └─ Router (URL routing)
 *                   └─ AppRoutes (route definitions)
 *                       └─ LoginScreen OR (Navigation + main content)
 * 
 * Flow:
 * 1. User opens app
 * 2. AuthProvider checks if user is logged in (from Firebase)
 * 3. If not authenticated -> show LoginScreen
 * 4. If authenticated -> show Navigation + main screens (Home, Map, Schedule, Settings)
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FontProvider } from './context/FontContext'
import Navigation from './components/Navigation'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import SettingsScreen from './screens/SettingsScreen'
import ClassScheduleScreen from './screens/ClassScheduleScreen'
import './App.css'

/**
 * AppRoutes component - Defines all routes and handles authentication
 * 
 * This component:
 * - Checks authentication status from AuthContext
 * - Shows loading state while checking auth
 * - Redirects unauthenticated users to login
 * - Shows main app with navigation for authenticated users
 * 
 * Route Structure:
 * - Unauthenticated: Only /login accessible, everything else redirects to /login
 * - Authenticated: All routes accessible, /login redirects to home
 */
function AppRoutes() {
  // Get authentication state from context
  const { isAuthenticated, loading } = useAuth()

  // Show loading screen while checking authentication status
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // If user is not logged in, only show login screen
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        {/* Redirect all other paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // If user is authenticated, show main app with navigation
  return (
    <div className="app">
      {/* Navigation bar appears on all authenticated screens */}
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/schedule" element={<ClassScheduleScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          {/* Redirect login page to home if already authenticated */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

/**
 * Root App component
 * 
 * Sets up all context providers in the correct order. Context providers
 * must be nested in this order because each depends on the outer ones:
 * - FontProvider: Manages font size preferences (no dependencies)
 * - ThemeProvider: Manages dark/light theme (depends on FontProvider for context)
 * - AuthProvider: Manages user authentication (depends on ThemeProvider)
 * - Router: Handles URL routing (depends on all contexts)
 * 
 * This structure allows any component in the app to access:
 * - Font settings via useFont() hook
 * - Theme settings via useTheme() hook
 * - Auth state via useAuth() hook
 */
function App() {
  return (
    <FontProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </FontProvider>
  )
}

export default App

