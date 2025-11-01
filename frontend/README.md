# Transit App Frontend

React frontend application for the Transit App with authentication and three main screens: Home, Map, and Settings.

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

## Technologies

- **React 18** - UI library
- **React Router DOM** - Navigation and routing
- **Vite** - Build tool and dev server
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

