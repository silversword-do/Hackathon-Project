import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

// Initialize Capacitor plugins for mobile
const initializeApp = async () => {
  // Check if we're running on a native platform
  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#000000' })
      
      // Hide splash screen after app is ready
      await SplashScreen.hide()
    } catch (error) {
      console.log('Capacitor plugins not available:', error)
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize Capacitor after app renders
initializeApp()

