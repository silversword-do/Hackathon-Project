import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { fetchOSURoutes, fetchOSUStops } from '../services/api'
import './MapScreen.css'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon


// OSU Campus center coordinates (Stillwater, OK)
const OSU_CAMPUS_CENTER = [36.1230, -97.0710]
const MAP_ZOOM_LEVEL = 14
const MAX_SIDEBAR_STOPS = 10

// Map bounds to keep map within OSU campus area (Stillwater, OK)
const MAP_BOUNDS = [
  [36.0950, -97.0900], // Southwest corner
  [36.1510, -97.0520]  // Northeast corner
]

// Component to center map on OSU campus and set bounds
function MapController({ center, zoom, bounds }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
    if (bounds) {
      map.setMaxBounds(bounds)
      map.options.maxBoundsViscosity = 1.0 // Prevents dragging outside bounds
    }
  }, [center, zoom, bounds, map])
  
  // Handle window resize to prevent map issues
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [map])
  
  return null
}

function MapScreen() {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showStops, setShowStops] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMapData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [routesData, stopsData] = await Promise.all([
        fetchOSURoutes(),
        fetchOSUStops()
      ])
      
      setRoutes(routesData.routes || [])
      setStops(stopsData.stops || [])
    } catch (err) {
      console.error('Error loading map data:', err)
      setError('Failed to load map data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleRouteSelect = (routeId) => {
    setSelectedRoute(selectedRoute === routeId ? null : routeId)
  }


  if (loading) {
    return (
      <div className="map-screen">
        <div className="map-header">
          <h1>Map View</h1>
          <p>Loading OSU bus routes and stops...</p>
        </div>
        <div className="map-container">
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading map data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="map-screen">
        <div className="map-header">
          <h1>Map View</h1>
        </div>
        <div className="map-container">
          <div className="map-error">
            <p>{error}</p>
            <button onClick={loadMapData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="map-screen">
      <div className="map-header">
        <h1>OSU Bus Map</h1>
        <p>Track buses and view OSU routes</p>
      </div>

      <div className="map-controls-bar">
        <button
          className={`control-button ${showRoutes ? 'active' : ''}`}
          onClick={() => setShowRoutes(!showRoutes)}
        >
          {showRoutes ? 'Hide' : 'Show'} Routes
        </button>
        <button
          className={`control-button ${showStops ? 'active' : ''}`}
          onClick={() => setShowStops(!showStops)}
        >
          {showStops ? 'Hide' : 'Show'} Stops
        </button>
        <button
          className="control-button"
          onClick={loadMapData}
        >
          Refresh Data
        </button>
      </div>

      <div className="map-layout">
        <div className="map-container">
          <MapContainer
            center={OSU_CAMPUS_CENTER}
            zoom={MAP_ZOOM_LEVEL}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            maxBounds={MAP_BOUNDS}
            maxBoundsViscosity={1.0}
          >
            <MapController center={OSU_CAMPUS_CENTER} zoom={MAP_ZOOM_LEVEL} bounds={MAP_BOUNDS} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render routes with waypoints to follow streets */}
            {showRoutes && routes
              .filter(route => route.stops && route.stops.length > 0)
              .map((route) => {
                // Create route path with waypoints between stops to follow streets
                const routePath = []
                for (let i = 0; i < route.stops.length; i++) {
                  const stop = route.stops[i]
                  routePath.push([stop.lat, stop.lon])
                  
                  // Add intermediate waypoints between stops to follow street patterns
                  if (i < route.stops.length - 1) {
                    const nextStop = route.stops[i + 1]
                    // Calculate midpoint
                    const midLat = (stop.lat + nextStop.lat) / 2
                    const midLon = (stop.lon + nextStop.lon) / 2
                    
                    // Add deterministic offset based on route direction to simulate street routing
                    const latDiff = nextStop.lat - stop.lat
                    const lonDiff = nextStop.lon - stop.lon
                    // Perpendicular offset to simulate street grid
                    const offsetLat = lonDiff * 0.3
                    const offsetLon = -latDiff * 0.3
                    
                    const waypoint1 = [
                      midLat + offsetLat,
                      midLon + offsetLon
                    ]
                    routePath.push(waypoint1)
                  }
                }
                
                const isSelected = selectedRoute === route.route_id

                return (
                  <Polyline
                    key={route.route_id}
                    positions={routePath}
                    color={route.color || '#FF6600'}
                    weight={isSelected ? 5 : 3}
                    opacity={isSelected ? 0.8 : 0.6}
                    eventHandlers={{
                      click: () => handleRouteSelect(route.route_id)
                    }}
                  />
                )
              })}

            {/* Render stops with default markers */}
            {showStops && stops.map((stop) => (
              <Marker
                key={stop.stop_id}
                position={[stop.lat, stop.lon]}
              >
                <Popup>
                  <div className="stop-popup">
                    <h3>{stop.name}</h3>
                    <p className="stop-id">Stop ID: {stop.stop_id}</p>
                    {stop.address && <p className="stop-address">{stop.address}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-sidebar">
          <div className="sidebar-section">
            <h3>Bus Routes ({routes.length})</h3>
            <div className="route-list">
              {routes.map((route) => (
                <div
                  key={route.route_id}
                  className={`route-item ${selectedRoute === route.route_id ? 'selected' : ''}`}
                  onClick={() => handleRouteSelect(route.route_id)}
                >
                  <div className="route-header">
                    <span
                      className="route-color-dot"
                      style={{ backgroundColor: route.color || '#007bff' }}
                    ></span>
                    <span className="route-name">{route.name}</span>
                  </div>
                  <span className="route-stops-count">
                    {route.stops?.length || 0} stops
                  </span>
                </div>
              ))}
              {routes.length === 0 && (
                <p className="no-data">No routes available</p>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Bus Stops ({stops.length})</h3>
            <div className="stop-list">
              {stops.slice(0, MAX_SIDEBAR_STOPS).map((stop) => (
                <div key={stop.stop_id} className="stop-item">
                  <div>
                    <span className="stop-name">{stop.name}</span>
                    <p className="stop-address-text">{stop.address || stop.stop_id}</p>
                  </div>
                </div>
              ))}
              {stops.length === 0 && (
                <p className="no-data">No stops available</p>
              )}
              {stops.length > MAX_SIDEBAR_STOPS && (
                <p className="more-stops">+ {stops.length - MAX_SIDEBAR_STOPS} more stops</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapScreen
