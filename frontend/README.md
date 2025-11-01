# Transit App Frontend

React frontend application for the Transit App with three main screens: Home, Map, and Settings.

## Features

- **Home Screen**: Welcome page with feature overview and quick actions
- **Map Screen**: Interactive map view for tracking buses and viewing routes
- **Settings Screen**: Configuration for API settings and app preferences

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
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable components
│   │   └── Navigation.jsx
│   ├── screens/     # Main screen components
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

## Notes

- The Map screen currently shows a placeholder. Consider integrating with:
  - Leaflet.js
  - Google Maps API
  - Mapbox
  
- Settings are currently stored in component state. Consider connecting to:
  - Backend API
  - LocalStorage
  - State management library (Redux, Zustand, etc.)

