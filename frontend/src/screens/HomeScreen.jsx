import { Link } from "react-router-dom";
import "./HomeScreen.css";

function HomeScreen() {
  return (
    <div className="home-screen">
      <div className="hero-section">
        <div className="osu-logo-section">
          <span className="pistol-pete-logo">
            <img
              src="/bus-logo.png"
              alt="BUS OK STATE"
              style={{
                width: "128px", // or "64px" for a smaller icon
                height: "auto", // maintain aspect ratio
                display: "block",
                margin: "0 auto 1rem", // center it with some spacing
              }}
            />
          </span>
          <h1>Welcome to OSU Transit App</h1>
        </div>
        <p className="subtitle">
          Go Pokes! Your one-stop solution for bus transit information
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <h3>Route Planning</h3>
          <p>
            Find the best routes from origin to destination with multiple
            options and detailed information.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🤠🚌</div>
          <h3>Real-time Tracking</h3>
          <p>
            Track Pistol Pete's buses in real-time with live location updates
            and accurate arrival estimates.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Schedule Viewing</h3>
          <p>
            View bus schedules by route and stop to plan your journey in
            advance.
          </p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/map" className="action-button primary">
            View Map
          </Link>
          <Link to="/settings" className="action-button secondary">
            Configure Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
