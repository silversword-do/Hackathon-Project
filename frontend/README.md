# Transit App Frontend

React frontend application for the Transit App with authentication and three main screens: Home, Map, and Settings.

**Now Available as a Mobile App!** This app has been converted to a mobile application using Capacitor. It can be built for both iOS and Android devices.

## Features

- **Login Screen**: Secure authentication with demo credentials
- **Home Screen**: Welcome page with feature overview and quick actions
- **Map Screen**: Interactive map view for tracking buses and viewing routes
- **Settings Screen**: Configuration for API settings, app preferences, and logout

## Setup

### Prerequisites

- Node.js 16+ and npm (or yarn/pnpm)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/   # Reusable components
│   │   └── Navigation.jsx
│   ├── context/      # Context providers
│   │   └── AuthContext.jsx
│   ├── screens/     # Main screen components
│   │   ├── LoginScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── MapScreen.jsx
│   │   └── SettingsScreen.jsx
│   ├── App.jsx      # Main app component with routing
│   ├── main.jsx     # React entry point
│   └── index.css    # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Mobile App Setup

This app uses **Capacitor** to run as a native mobile application on iOS and Android.

### Building for Mobile

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Add mobile platforms (first time only):**
   ```bash
   npm run cap:add:ios      # For iOS
   npm run cap:add:android  # For Android
   ```

3. **Sync Capacitor (after building):**
   ```bash
   npm run cap:sync
   ```

   Or use the combined command:
   ```bash
   npm run cap:build
   ```

4. **Open in native IDE:**
   ```bash
   npm run cap:open:ios      # Opens in Xcode
   npm run cap:open:android  # Opens in Android Studio
   ```

### Mobile Features

- ✅ **Bottom Tab Navigation** - Mobile-friendly navigation bar
- ✅ **Native Status Bar** - Configured for mobile devices
- ✅ **Splash Screen** - Native splash screen support
- ✅ **Safe Area Support** - Respects iOS notch and Android navigation bars
- ✅ **Touch Optimizations** - Optimized for mobile touch interactions
- ✅ **Responsive Design** - Adapts between desktop and mobile layouts

### Mobile Requirements

#### iOS
- macOS with Xcode installed
- CocoaPods (installed automatically)
- iOS 13+ target

#### Android
- Android Studio installed
- Android SDK configured
- Minimum SDK version: 21 (Android 5.0)

## Technologies

- **React 18** - UI library
- **React Router DOM** - Navigation and routing
- **Vite** - Build tool and dev server
- **Capacitor** - Native mobile framework
- **CSS** - Styling with CSS variables for theming

## Authentication

The app uses a simple authentication system with demo credentials:
- **Username**: `dummy`
- **Password**: `123`

Authentication state is persisted in localStorage.

## Notes

- The Map screen currently shows a placeholder. Consider integrating with:
  - Leaflet.js
  - Google Maps API
  - Mapbox
  
- Settings are currently stored in component state. Consider connecting to:
  - Backend API
  - LocalStorage
  - State management library (Redux, Zustand, etc.)

