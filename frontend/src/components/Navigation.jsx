import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top navigation for desktop/tablet */}
      <nav className="navigation navigation-top">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/">
              <img
                src="/site-logo.png"
                alt="BUS OK STATE"
                className="app-logo"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "inline";
                }}
              />
              <span style={{ display: "none" }}>BUS OK STATE</span>
            </Link>
          </div>
          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive("/") ? "active" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/map" className={isActive("/map") ? "active" : ""}>
                Map
              </Link>
            </li>
            <li>
              <Link
                to="/schedule"
                className={isActive("/schedule") ? "active" : ""}
              >
                Class Schedule
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={isActive("/settings") ? "active" : ""}
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Bottom tab bar for mobile */}
      <nav className="navigation navigation-bottom">
        <div className="mobile-nav-tabs">
          <Link
            to="/"
            className={`mobile-nav-tab ${isActive("/") ? "active" : ""}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </Link>
          <Link
            to="/map"
            className={`mobile-nav-tab ${isActive("/map") ? "active" : ""}`}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Map</span>
          </Link>
          <Link
            to="/schedule"
            className={`mobile-nav-tab ${
              isActive("/schedule") ? "active" : ""
            }`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">Schedule</span>
          </Link>
          <Link
            to="/settings"
            className={`mobile-nav-tab ${
              isActive("/settings") ? "active" : ""
            }`}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
