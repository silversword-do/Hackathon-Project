/**
 * Main entry point for the React frontend application
 * 
 * This file is the starting point when the web app loads. It:
 * 1. Renders the root React component (App) into the DOM
 * 2. Initializes Capacitor plugins for mobile (iOS/Android) if running natively
 * 3. Sets up mobile-specific features (status bar, splash screen)
 * 
 * Flow:
 * - Browser loads index.html
 * - This script executes and renders <App />
 * - App component sets up routing, authentication, and context providers
 * - User sees the LoginScreen or HomeScreen based on auth state
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

/**
 * Initialize Capacitor plugins for mobile platforms
 * 
 * Capacitor is a framework that allows this React web app to run as a native
 * iOS or Android app. This function initializes mobile-specific features:
 * - Status bar styling (colors, transparency)
 * - Splash screen management (hide when app is ready)
 * 
 * Only runs on native platforms (iOS/Android), not in web browser
 */
const initializeApp = async () => {
  // Check if we're running on a native platform (not web browser)
  if (Capacitor.isNativePlatform()) {
    try {
      // Configure status bar appearance (the bar at top of phone screen)
      await StatusBar.setStyle({ style: Style.Dark })  // Dark text on light background
      await StatusBar.setBackgroundColor({ color: '#000000' })  // Black background
      
      // Hide the splash screen that shows when app first launches
      // This should be called after the app UI is ready to display
      await SplashScreen.hide()
    } catch (error) {
      // Some plugins might not be available in all environments
      console.log('Capacitor plugins not available:', error)
    }
  }
  // If running in web browser, Capacitor plugins are not needed
}

/**
 * Render the React application
 * 
 * ReactDOM.createRoot creates the root of the React component tree.
 * React.StrictMode enables additional development checks and warnings.
 * The App component contains all routing, authentication, and UI logic.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize mobile-specific features after the app renders
// This ensures the app UI is ready before hiding the splash screen
initializeApp()

