import { useState, useEffect } from 'react'
import './MapScreen.css'

function MapScreen() {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="map-screen">
      <div className="map-header">
        <h1>Map View</h1>
        <p>Track buses and view routes on the interactive map</p>
      </div>

      <div className="map-container">
        {!mapLoaded ? (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading map...</p>
          </div>
        ) : (
          <div className="map-placeholder">
            <div className="map-content">
              <div className="map-icon">🗺️</div>
              <h2>Map Display</h2>
              <p>Map integration can be added here</p>
              <p className="map-note">
                Consider integrating with:
                <br />
                • Leaflet.js
                <br />
                • Google Maps
                <br />
                • Mapbox
              </p>
              <div className="map-controls">
                <button className="map-button">Center on Location</button>
                <button className="map-button">Show Routes</button>
                <button className="map-button">Show Stops</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="map-sidebar">
        <div className="sidebar-section">
          <h3>Bus Stops</h3>
          <ul className="stop-list">
            <li className="stop-item">
              <span className="stop-name">Main Street Stop</span>
              <span className="stop-distance">0.2 km</span>
            </li>
            <li className="stop-item">
              <span className="stop-name">University Ave Stop</span>
              <span className="stop-distance">0.5 km</span>
            </li>
            <li className="stop-item">
              <span className="stop-name">Downtown Station</span>
              <span className="stop-distance">1.2 km</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Active Routes</h3>
          <ul className="route-list">
            <li className="route-item">
              <span className="route-number">Route 1</span>
              <span className="route-status">Active</span>
            </li>
            <li className="route-item">
              <span className="route-number">Route 2</span>
              <span className="route-status">Active</span>
            </li>
            <li className="route-item">
              <span className="route-number">Route 3</span>
              <span className="route-status">Active</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MapScreen

