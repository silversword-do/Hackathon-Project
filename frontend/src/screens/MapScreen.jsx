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

// Component to center map on OSU campus
function MapController({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
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
      const [routesData, stopsData] = await Promise.all([
        fetchOSURoutes(),
        fetchOSUStops()
      ])
      
      setRoutes(routesData.routes || [])
      setStops(stopsData.stops || [])
      setError(null)
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
        <p>Track buses and view OSU routes on the interactive map</p>
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
          >
            <MapController center={OSU_CAMPUS_CENTER} zoom={MAP_ZOOM_LEVEL} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render routes */}
            {showRoutes && routes
              .filter(route => route.stops && route.stops.length > 0)
              .map((route) => {
                const routeCoords = route.stops.map(stop => [stop.lat, stop.lon])
                const isSelected = selectedRoute === route.route_id

                return (
                  <Polyline
                    key={route.route_id}
                    positions={routeCoords}
                    color={route.color || '#007bff'}
                    weight={isSelected ? 5 : 3}
                    opacity={isSelected ? 0.8 : 0.5}
                    eventHandlers={{
                      click: () => handleRouteSelect(route.route_id)
                    }}
                  />
                )
              })}

            {/* Render stops */}
            {showStops && stops.map((stop) => (
              <Marker
                key={stop.stop_id}
                position={[stop.lat, stop.lon]}
              >
                <Popup>
                  <div className="stop-popup">
                    <h3>{stop.name}</h3>
                    <p className="stop-id">ID: {stop.stop_id}</p>
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
