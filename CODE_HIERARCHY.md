# Code Hierarchy and Flow Documentation

This document explains how the Bus Transit App codebase is organized and how data flows through the application.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Python Backend Architecture](#python-backend-architecture)
3. [React Frontend Architecture](#react-frontend-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Key Design Patterns](#key-design-patterns)
6. [Component Interactions](#component-interactions)

---

## Project Structure

```
Hackathone-Project/
├── transit_app/              # Python desktop application
│   ├── main.py               # Entry point - starts Tkinter GUI
│   ├── models/               # Data models (Route, Stop, Schedule, Bus)
│   ├── api/                  # API communication layer
│   ├── gui/                  # Tkinter GUI components
│   └── utils/               # Utilities (GTFS parser, helpers)
│
└── frontend/                 # React web/mobile application
    └── src/
        ├── main.jsx          # Entry point - renders React app
        ├── App.jsx           # Root component - routing & providers
        ├── components/       # Reusable UI components
        ├── screens/          # Full-page screen components
        ├── context/          # React context providers
        ├── services/         # API services (Firebase, routing)
        └── utils/            # Helper functions
```

---

## Python Backend Architecture

### High-Level Flow

```
User launches app
    ↓
main.py: main()
    ↓
Creates Tkinter root window
    ↓
MainWindow.__init__()
    ├─→ Loads APIConfig from config.ini
    ├─→ Creates TransitClient with config
    ├─→ Creates tabbed interface (Notebook)
    └─→ Initializes 3 tabs:
        ├─→ RoutePlanner (plan trips)
        ├─→ BusTracker (track buses)
        └─→ ScheduleViewer (view schedules)
    ↓
root.mainloop() - GUI event loop starts
```

### Component Hierarchy

```
MainWindow (gui/main_window.py)
│
├─→ APIConfig (api/config.py)
│   └─→ Loads/Saves config.ini
│   └─→ Manages API key & URL
│
├─→ TransitClient (api/transit_client.py)
│   └─→ Inherits from APIAdapter (abstract interface)
│   └─→ Makes HTTP requests to transit API
│   └─→ Parses JSON responses → Model objects
│   └─→ Falls back to mock_data if API not configured
│
└─→ Tab Components:
    │
    ├─→ RoutePlanner (gui/route_planner.py)
    │   ├─→ User enters origin & destination
    │   ├─→ Calls transit_client.get_routes()
    │   ├─→ Displays routes in Treeview
    │   └─→ Shows route details on selection
    │
    ├─→ BusTracker (gui/tracker.py)
    │   ├─→ User enters stop_id or route_id
    │   ├─→ Calls transit_client.get_bus_locations()
    │   ├─→ Displays buses in Treeview
    │   └─→ Auto-refresh every 30s (optional)
    │
    └─→ ScheduleViewer (gui/schedule_viewer.py)
        ├─→ User enters route_id (and optional stop_id)
        ├─→ Calls transit_client.get_schedules()
        ├─→ Displays schedules in Treeview
        └─→ Shows departure/arrival times
```

### Data Models

```
Models (models/)
│
├─→ Route
│   ├─→ route_id: str
│   ├─→ origin: str
│   ├─→ destination: str
│   ├─→ stops: List[Stop]
│   ├─→ duration: timedelta
│   ├─→ cost: float
│   └─→ transfers: int
│
├─→ Stop
│   ├─→ stop_id: str
│   ├─→ name: str
│   ├─→ latitude: float
│   ├─→ longitude: float
│   └─→ address: str
│
├─→ Schedule
│   ├─→ route: Route
│   ├─→ stop: Stop
│   ├─→ departure_times: List[time]
│   ├─→ arrival_times: List[time]
│   └─→ frequency: int
│
└─→ Bus
    ├─→ bus_id: str
    ├─→ route: Route
    ├─→ latitude: float
    ├─→ longitude: float
    ├─→ status: str (on-time, delayed, etc.)
    ├─→ estimated_arrival: datetime
    ├─→ current_stop: str
    └─→ next_stop: str
```

### API Communication Flow

```
GUI Component
    ↓ (calls method)
TransitClient
    ↓ (checks)
Is API configured?
    ├─→ NO → mock_data.py → Return sample data
    └─→ YES → Continue
        ↓
    _make_request(endpoint, params)
        ↓
    HTTP GET request with Bearer token
        ↓
    Parse JSON response
        ↓
    _parse_route() / _parse_stop() / etc.
        ↓
    Return List[Model] objects
        ↓
GUI Component receives models
        ↓
    Display in Treeview widgets
```

### Adapter Pattern

The API uses the **Adapter Design Pattern**:

```
APIAdapter (abstract interface)
    ├─→ get_routes()
    ├─→ get_bus_locations()
    ├─→ get_schedules()
    └─→ search_stops()

TransitClient (concrete implementation)
    └─→ Implements all abstract methods
    └─→ Makes actual HTTP requests
    └─→ Parses API responses
```

**Benefits:**
- Easy to swap API providers
- GUI code doesn't depend on specific API
- Can support multiple APIs simultaneously
- Easy to test with mock implementations

---

## React Frontend Architecture

### High-Level Flow

```
User opens web app
    ↓
main.jsx executes
    ↓
ReactDOM.render(<App />)
    ↓
App.jsx renders
    ├─→ FontProvider (context)
    ├─→ ThemeProvider (context)
    ├─→ AuthProvider (context)
    │   └─→ Checks Firebase auth state
    └─→ Router
        └─→ AppRoutes
            ├─→ If not authenticated → LoginScreen
            └─→ If authenticated → Navigation + Screens
                ├─→ HomeScreen (/)
                ├─→ MapScreen (/map)
                ├─→ ClassScheduleScreen (/schedule)
                └─→ SettingsScreen (/settings)
```

### Component Hierarchy

```
App (App.jsx)
│
├─→ FontProvider (context/FontContext.jsx)
│   └─→ Manages font size preferences
│
├─→ ThemeProvider (context/ThemeContext.jsx)
│   └─→ Manages dark/light theme
│
├─→ AuthProvider (context/AuthContext.jsx)
│   └─→ Manages Firebase authentication
│   └─→ Provides: isAuthenticated, user, login(), logout()
│
└─→ Router (React Router)
    └─→ AppRoutes
        ├─→ LoginScreen (if !authenticated)
        └─→ Navigation + Main Content (if authenticated)
            │
            ├─→ Navigation (components/Navigation.jsx)
            │   └─→ Navbar with links to all screens
            │
            └─→ Screen Components:
                ├─→ HomeScreen (screens/HomeScreen.jsx)
                ├─→ MapScreen (screens/MapScreen.jsx)
                ├─→ ClassScheduleScreen (screens/ClassScheduleScreen.jsx)
                └─→ SettingsScreen (screens/SettingsScreen.jsx)
```

### Service Layer

```
Services (services/)
│
├─→ firebase.js
│   └─→ Firebase initialization
│   └─→ Exports: auth, db (Firestore)
│
├─→ firebaseRoutes.js
│   └─→ CRUD operations for saved routes
│   └─→ Uses Firestore
│
├─→ firebaseUserSchedules.js
│   └─→ CRUD operations for user class schedules
│   └─→ Uses Firestore
│
└─→ routingService.js
    └─→ OSRM integration for map routes
    └─→ getRoutePath() - gets road paths between coordinates
```

### Context Flow

```
Context Providers (context/)
│
├─→ AuthContext
│   ├─→ State: { user, isAuthenticated, loading }
│   ├─→ Methods: login(), logout(), signup()
│   └─→ Uses: Firebase Auth
│
├─→ ThemeContext
│   ├─→ State: { theme: 'light' | 'dark' }
│   ├─→ Methods: toggleTheme()
│   └─→ Persists to localStorage
│
└─→ FontContext
    ├─→ State: { fontSize: number }
    ├─→ Methods: setFontSize()
    └─→ Persists to localStorage
```

### Authentication Flow

```
User opens app
    ↓
AuthProvider initializes
    ↓
onAuthStateChanged() listener
    ↓
Checks Firebase Auth state
    ├─→ User logged in?
    │   ├─→ YES → isAuthenticated = true, user = userData
    │   └─→ NO → isAuthenticated = false, user = null
    ↓
loading = false
    ↓
AppRoutes checks isAuthenticated
    ├─→ true → Show Navigation + Screens
    └─→ false → Show LoginScreen
```

### Route Planning Flow (MapScreen)

```
User on MapScreen
    ↓
Selects origin & destination
    ↓
MapScreen component
    ├─→ Calls firebaseRoutes service
    ├─→ Gets routes from Firestore
    └─→ Displays routes on map
        ↓
    For each route segment:
        ├─→ Calls routingService.getRoutePath()
        ├─→ OSRM API returns road coordinates
        └─→ Draws polyline on map
```

---

## Data Flow Diagrams

### Python: Route Planning

```
User enters origin/destination
    ↓
RoutePlanner._search_routes()
    ↓
transit_client.get_routes(origin, destination)
    ├─→ If API configured:
    │   ├─→ HTTP GET /routes?origin=X&destination=Y
    │   ├─→ Receive JSON response
    │   └─→ _parse_route() → Route objects
    └─→ If API not configured:
        └─→ mock_data.get_sample_routes() → Route objects
    ↓
Route objects returned
    ↓
Display in Treeview
    ↓
User selects route
    ↓
Show route details (stops, duration, cost)
```

### Python: Bus Tracking

```
User enters stop_id or route_id
    ↓
BusTracker._refresh_buses()
    ↓
transit_client.get_bus_locations(stop_id, route_id)
    ├─→ If API configured:
    │   ├─→ HTTP GET /buses?stop_id=X&route_id=Y
    │   ├─→ Receive JSON response
    │   └─→ _parse_bus() → Bus objects
    └─→ If API not configured:
        └─→ mock_data.get_sample_buses() → Bus objects
    ↓
Bus objects returned
    ↓
Display in Treeview
    ↓
If auto-refresh enabled:
    └─→ Repeat every 30 seconds
```

### React: User Login

```
User enters email/password
    ↓
LoginScreen calls login()
    ↓
AuthContext.login(email, password)
    ↓
Firebase Auth signInWithEmailAndPassword()
    ↓
onAuthStateChanged() fires
    ↓
AuthProvider updates state:
    ├─→ isAuthenticated = true
    ├─→ user = userData
    └─→ loading = false
    ↓
AppRoutes re-renders
    ↓
Navigates to HomeScreen (/)
```

### React: Saving Routes

```
User creates route on MapScreen
    ↓
Calls firebaseRoutes service
    ├─→ addRoute(routeData)
    ↓
Firestore: collection('routes').add(routeData)
    ↓
Route saved to database
    ↓
Component re-fetches routes
    ↓
Updated route list displayed
```

---

## Key Design Patterns

### 1. Adapter Pattern (Python API)

**Purpose:** Standardize interface for different transit APIs

```
APIAdapter (interface)
    └─→ TransitClient (implementation)
        └─→ Can swap with other implementations
```

**Benefits:**
- GUI code independent of API details
- Easy to add new API providers
- Simple mocking for testing

### 2. Context Pattern (React)

**Purpose:** Share state across components without prop drilling

```
Context Provider (AuthProvider)
    └─→ All child components
        └─→ Access via useAuth() hook
```

**Benefits:**
- Avoid passing props through many levels
- Centralized state management
- Easy to update state from anywhere

### 3. Service Layer Pattern

**Purpose:** Separate business logic from UI components

```
Component → Service → External API/Database
```

**Benefits:**
- Reusable business logic
- Easier testing
- Clear separation of concerns

### 4. Model-View Separation

**Python:**
- Models: `models/` - Data structures
- Views: `gui/` - UI components
- Controller: `api/` - Business logic

**React:**
- Models: Firestore documents
- Views: `screens/` - UI components
- Controllers: `services/` - Business logic

---

## Component Interactions

### Python: MainWindow ↔ TransitClient ↔ API

```
MainWindow
    ├─→ Creates TransitClient
    └─→ Passes TransitClient to tabs
    
RoutePlanner
    ├─→ Receives TransitClient in __init__
    ├─→ Calls transit_client.get_routes()
    └─→ Receives List[Route]
        └─→ Displays in GUI
    
TransitClient
    ├─→ Implements APIAdapter interface
    ├─→ Makes HTTP requests
    └─→ Returns model objects
```

### React: App ↔ AuthProvider ↔ Firebase

```
App
    └─→ Wraps with <AuthProvider>
    
AuthProvider
    ├─→ Listens to Firebase auth state
    ├─→ Updates context state
    └─→ Provides login/logout methods
    
AppRoutes
    ├─→ Uses useAuth() hook
    ├─→ Reads isAuthenticated
    └─→ Conditionally renders routes
    
LoginScreen
    ├─→ Uses useAuth() hook
    └─→ Calls login() method
```

### React: MapScreen ↔ Services ↔ Firebase/OSRM

```
MapScreen
    ├─→ Uses firebaseRoutes service
    │   └─→ CRUD operations on Firestore
    ├─→ Uses routingService
    │   └─→ Calls OSRM API for road paths
    └─→ Displays routes on Leaflet map
```

---

## File Responsibilities

### Python Backend

| File | Responsibility |
|------|---------------|
| `main.py` | Application entry point, creates GUI |
| `gui/main_window.py` | Main window, menu, tabs, status bar |
| `gui/route_planner.py` | Route search UI and results display |
| `gui/tracker.py` | Bus tracking UI with auto-refresh |
| `gui/schedule_viewer.py` | Schedule viewing UI |
| `api/transit_client.py` | HTTP communication, response parsing |
| `api/api_adapter.py` | Abstract interface definition |
| `api/config.py` | Configuration file management |
| `api/mock_data.py` | Sample data for testing |
| `models/route.py` | Route data model |
| `models/stop.py` | Stop data model |
| `models/schedule.py` | Schedule data model |
| `models/bus.py` | Bus tracking data model |

### React Frontend

| File | Responsibility |
|------|---------------|
| `main.jsx` | React app entry point, renders App |
| `App.jsx` | Root component, context providers, routing |
| `screens/HomeScreen.jsx` | Home/dashboard screen |
| `screens/MapScreen.jsx` | Interactive map with routes |
| `screens/LoginScreen.jsx` | User authentication UI |
| `screens/SettingsScreen.jsx` | App settings UI |
| `screens/ClassScheduleScreen.jsx` | Class schedule management |
| `components/Navigation.jsx` | Navigation bar component |
| `context/AuthContext.jsx` | Authentication state management |
| `context/ThemeContext.jsx` | Theme state management |
| `context/FontContext.jsx` | Font size state management |
| `services/firebase.js` | Firebase initialization |
| `services/firebaseRoutes.js` | Route CRUD operations |
| `services/routingService.js` | OSRM routing integration |

---

## Summary

### Python Desktop App Flow
1. User launches → `main.py` creates Tkinter window
2. `MainWindow` initializes → Loads config, creates API client
3. User interacts with tabs → Tab calls API client
4. API client → Makes HTTP request or uses mock data
5. Response parsed → Returns model objects
6. GUI displays → Shows results in Treeview widgets

### React Web/Mobile App Flow
1. Browser loads → `main.jsx` renders App
2. App initializes → Sets up context providers
3. AuthProvider checks → Firebase authentication state
4. Router decides → LoginScreen or authenticated screens
5. User interacts → Components call services
6. Services execute → Firebase/OSRM operations
7. State updates → Components re-render with new data

### Key Connections
- **Python**: GUI → API Client → HTTP → Transit API
- **React**: Components → Services → Firebase/OSRM
- **Both**: Models represent data, Services handle logic, UI displays results

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Reusable components and services
- ✅ Easy testing and mocking
- ✅ Scalable structure for adding features
- ✅ Cross-platform support (desktop + web + mobile)

