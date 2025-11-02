import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet'
import { useAuth } from '../context/AuthContext'
import { fetchOSURoutes, fetchOSUStops, saveOSURoutes } from '../services/api'
import RouteEditor from '../components/RouteEditor'
import './MapScreen.css'
import 'leaflet/dist/leaflet.css'
import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

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

// Custom icon for user location (blue circle)
const UserLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="user-location-pulse"></div><div class="user-location-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})


// OSU Campus center coordinates (Stillwater, OK)
const OSU_CAMPUS_CENTER = [36.1230, -97.0710]
const MAP_ZOOM_LEVEL = 14
const MAX_SIDEBAR_STOPS = 10

// Map bounds to keep map within OSU campus area (Stillwater, OK)
const MAP_BOUNDS = [
  [36.0950, -97.0900], // Southwest corner
  [36.1510, -97.0520]  // Northeast corner
]

// Component to center map on location and set bounds
function MapController({ center, zoom, bounds, userLocation }) {
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
  
  // Center map on user location when it's enabled and available
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      map.setView([userLocation.lat, userLocation.lng], Math.max(zoom, 16))
    }
  }, [userLocation, map, zoom])
  
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
  const { isAdmin } = useAuth()
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showStops, setShowStops] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingRoute, setEditingRoute] = useState(null)
  const [showRouteEditor, setShowRouteEditor] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  
  // Location tracking state
  const [userLocation, setUserLocation] = useState(null)
  const [isTrackingLocation, setIsTrackingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const locationWatchId = useRef(null)

  useEffect(() => {
    loadMapData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clean up location watching on unmount
  useEffect(() => {
    return () => {
      if (locationWatchId.current) {
        if (Capacitor.isNativePlatform()) {
          try {
            Geolocation.clearWatch({ id: locationWatchId.current })
          } catch (error) {
            clearInterval(locationWatchId.current)
          }
        } else {
          if (typeof locationWatchId.current === 'number' && navigator.geolocation?.clearWatch) {
            navigator.geolocation.clearWatch(locationWatchId.current)
          } else {
            clearInterval(locationWatchId.current)
          }
        }
      }
    }
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

  const handleEditRoute = (routeId) => {
    const route = routes.find(r => r.route_id === routeId)
    setEditingRoute(route || null)
    setShowRouteEditor(true)
  }

  const handleAddRoute = () => {
    setEditingRoute(null)
    setShowRouteEditor(true)
  }

  const handleSaveRoute = async (routeData) => {
    try {
      let updatedRoutes
      if (editingRoute) {
        // Update existing route
        updatedRoutes = routes.map(r =>
          r.route_id === editingRoute.route_id ? routeData : r
        )
      } else {
        // Add new route
        updatedRoutes = [...routes, routeData]
      }

      setRoutes(updatedRoutes)
      const success = await saveOSURoutes(updatedRoutes)
      
      if (success) {
        setSaveMessage('Routes saved successfully!')
        setShowRouteEditor(false)
        setEditingRoute(null)
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage('Failed to save routes')
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving route:', error)
      setSaveMessage('Error saving route')
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        const updatedRoutes = routes.filter(r => r.route_id !== routeId)
        setRoutes(updatedRoutes)
        const success = await saveOSURoutes(updatedRoutes)
        
        if (success) {
          setSaveMessage('Route deleted successfully!')
          setShowRouteEditor(false)
          setEditingRoute(null)
          setTimeout(() => setSaveMessage(null), 3000)
        } else {
          setSaveMessage('Failed to delete route')
          setTimeout(() => setSaveMessage(null), 3000)
        }
      } catch (error) {
        console.error('Error deleting route:', error)
        setSaveMessage('Error deleting route')
        setTimeout(() => setSaveMessage(null), 3000)
      }
    }
  }

  const handleSaveAll = async () => {
    try {
      const success = await saveOSURoutes(routes)
      if (success) {
        setSaveMessage('All routes saved successfully!')
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage('Failed to save routes')
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving routes:', error)
      setSaveMessage('Error saving routes')
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  // Request location permissions
  const requestLocationPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native platforms, request permissions
        const permission = await Geolocation.requestPermissions()
        if (permission.location !== 'granted') {
          setLocationError('Location permission denied. Please enable location permissions in settings.')
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Error requesting location permissions:', error)
      setLocationError('Failed to request location permissions')
      return false
    }
  }

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setLocationError(null)
      const hasPermission = await requestLocationPermissions()
      if (!hasPermission) return null

      let position
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Geolocation on native platforms
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        })
      } else {
        // Use browser geolocation on web
        position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'))
            return
          }
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          )
        })
      }

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      }

      setUserLocation(location)
      return location
    } catch (error) {
      console.error('Error getting location:', error)
      setLocationError('Unable to get your location. Please check your GPS settings.')
      setUserLocation(null)
      return null
    }
  }

  // Watch location updates
  const watchLocation = async () => {
    try {
      setLocationError(null)
      const hasPermission = await requestLocationPermissions()
      if (!hasPermission) {
        setIsTrackingLocation(false)
        return
      }

      if (Capacitor.isNativePlatform()) {
        // Use native watchPosition for continuous updates
        try {
          locationWatchId.current = await Geolocation.watchPosition(
            {
              enableHighAccuracy: true,
              timeout: 5000
            },
            (position, err) => {
              if (err) {
                console.error('Location watch error:', err)
                setLocationError('Error tracking location')
                setIsTrackingLocation(false)
                return
              }
              if (position && position.coords) {
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy
                })
              }
            }
          )
        } catch (watchError) {
          // Fallback to polling if watchPosition fails
          console.warn('watchPosition not available, using polling:', watchError)
          const intervalId = setInterval(async () => {
            await getCurrentLocation()
          }, 5000)
          locationWatchId.current = intervalId
        }
      } else {
        // For web, use browser geolocation watchPosition or poll
        if (navigator.geolocation && navigator.geolocation.watchPosition) {
          try {
            locationWatchId.current = navigator.geolocation.watchPosition(
              (position) => {
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy
                })
              },
              (err) => {
                console.error('Location watch error:', err)
                setLocationError('Error tracking location')
                setIsTrackingLocation(false)
              },
              {
                enableHighAccuracy: true,
                timeout: 5000
              }
            )
          } catch (webError) {
            // Fallback to polling
            console.warn('watchPosition not available, using polling:', webError)
            const intervalId = setInterval(async () => {
              await getCurrentLocation()
            }, 5000)
            locationWatchId.current = intervalId
          }
        } else {
          // Poll location periodically as fallback
          const intervalId = setInterval(async () => {
            await getCurrentLocation()
          }, 5000) // Update every 5 seconds on web

          locationWatchId.current = intervalId
        }
      }
    } catch (error) {
      console.error('Error watching location:', error)
      setLocationError('Failed to track location')
      setIsTrackingLocation(false)
    }
  }

  // Stop watching location
  const stopWatchingLocation = () => {
    if (locationWatchId.current) {
      if (Capacitor.isNativePlatform()) {
        try {
          Geolocation.clearWatch({ id: locationWatchId.current })
        } catch (error) {
          // If it's not a watch ID, it might be an interval
          clearInterval(locationWatchId.current)
        }
      } else {
        // Check if it's a geolocation watch ID or interval
        if (typeof locationWatchId.current === 'number' && navigator.geolocation?.clearWatch) {
          navigator.geolocation.clearWatch(locationWatchId.current)
        } else {
          clearInterval(locationWatchId.current)
        }
      }
      locationWatchId.current = null
    }
    setIsTrackingLocation(false)
    // Keep the last known location visible, just stop updating
  }

  // Toggle location tracking
  const toggleLocationTracking = async () => {
    if (isTrackingLocation) {
      stopWatchingLocation()
    } else {
      // First get current location
      const location = await getCurrentLocation()
      if (location) {
        setIsTrackingLocation(true)
        await watchLocation()
      }
    }
  }

  // Center map on user location
  const centerOnLocation = async () => {
    if (userLocation) {
      // Location already available, map controller will handle centering
      return
    }
    // Get location if not available
    await getCurrentLocation()
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
        <h1>OSU Bus Map {isAdmin && <span className="admin-badge">Admin</span>}</h1>
        <p>Track buses and view OSU routes</p>
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
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
          className={`control-button location-button ${isTrackingLocation ? 'active' : ''}`}
          onClick={toggleLocationTracking}
          title={isTrackingLocation ? 'Stop tracking location' : 'Track my location'}
        >
          📍 {isTrackingLocation ? 'Stop Tracking' : 'My Location'}
        </button>
        {userLocation && !isTrackingLocation && (
          <button
            className="control-button location-button"
            onClick={centerOnLocation}
            title="Center map on my location"
          >
            🎯 Center on Me
          </button>
        )}
        <button
          className="control-button"
          onClick={loadMapData}
        >
          Refresh Data
        </button>
        {isAdmin && (
          <>
            <button
              className="control-button admin-button"
              onClick={handleAddRoute}
            >
              Add Route
            </button>
            <button
              className="control-button admin-button save-all-button"
              onClick={handleSaveAll}
            >
              Save All
            </button>
          </>
        )}
      </div>
      
      {locationError && (
        <div className="location-error">
          <p>{locationError}</p>
          <button onClick={() => setLocationError(null)}>×</button>
        </div>
      )}

      <div className="map-layout">
        <div className="map-container">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : OSU_CAMPUS_CENTER}
            zoom={MAP_ZOOM_LEVEL}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            maxBounds={MAP_BOUNDS}
            maxBoundsViscosity={1.0}
          >
            <MapController 
              center={userLocation ? [userLocation.lat, userLocation.lng] : OSU_CAMPUS_CENTER} 
              zoom={MAP_ZOOM_LEVEL} 
              bounds={MAP_BOUNDS}
              userLocation={userLocation}
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={UserLocationIcon}
              >
                <Popup>
                  <div className="user-location-popup">
                    <h3>📍 Your Location</h3>
                    <p>Latitude: {userLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {userLocation.lng.toFixed(6)}</p>
                    {userLocation.accuracy && (
                      <p>Accuracy: {userLocation.accuracy.toFixed(0)} meters</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Accuracy circle for user location */}
            {userLocation && userLocation.accuracy && userLocation.accuracy < 100 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={Math.min(userLocation.accuracy, 50)} // Cap at 50 meters for visibility
                pathOptions={{
                  color: '#4285F4',
                  fillColor: '#4285F4',
                  fillOpacity: 0.1,
                  weight: 2,
                  opacity: 0.5
                }}
              />
            )}

            {/* Render routes connecting markers only (no intermediate waypoints through buildings) */}
            {showRoutes && routes
              .filter(route => route.stops && route.stops.length > 0)
              .map((route) => {
                // Create route path connecting only markers (stops) - no intermediate waypoints
                // Routes only follow streets connecting markers, not through buildings
                const routePath = route.stops.map(stop => [stop.lat, stop.lon])
                
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
          {isAdmin && showRouteEditor && (
            <RouteEditor
              route={editingRoute}
              allStops={stops}
              onSave={handleSaveRoute}
              onCancel={() => {
                setShowRouteEditor(false)
                setEditingRoute(null)
              }}
              onDelete={handleDeleteRoute}
            />
          )}
          
          <div className="sidebar-section">
            <h3>Bus Routes ({routes.length})</h3>
            <div className="route-list">
              {routes.map((route) => (
                <div
                  key={route.route_id}
                  className={`route-item ${selectedRoute === route.route_id ? 'selected' : ''}`}
                  onClick={() => !isAdmin && handleRouteSelect(route.route_id)}
                >
                  <div className="route-header">
                    <span
                      className="route-color-dot"
                      style={{ backgroundColor: route.color || '#007bff' }}
                    ></span>
                    <span className="route-name">{route.name}</span>
                  </div>
                  <div className="route-item-actions">
                    <span className="route-stops-count">
                      {route.stops?.length || 0} stops
                    </span>
                    {isAdmin && (
                      <button
                        className="edit-route-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditRoute(route.route_id)
                        }}
                        title="Edit Route"
                      >
                        ✏️
                      </button>
                    )}
                    {!isAdmin && (
                      <span onClick={() => handleRouteSelect(route.route_id)} style={{ cursor: 'pointer' }}>
                        {selectedRoute === route.route_id ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
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
