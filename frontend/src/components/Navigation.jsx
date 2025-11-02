import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFont } from "../context/FontContext";
import "./Navigation.css";

function Navigation() {
  const location = useLocation();
  const { userRole, viewAsUser, setViewAsUser } = useAuth();
  const { fontStyle, setFontStyle, fontOptions } = useFont();
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const fontDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setShowFontDropdown(false);
      }
    };

    if (showFontDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFontDropdown]);

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
          <div className="nav-controls">
            <div className="font-dropdown-wrapper" ref={fontDropdownRef}>
              <button
                className="nav-button font-dropdown-button"
                onClick={() => setShowFontDropdown(!showFontDropdown)}
                title="Change font style"
              >
                🔤 Font
              </button>
              {showFontDropdown && (
                <div className="font-dropdown-menu">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      className={`font-option ${fontStyle === font.value ? 'active' : ''}`}
                      onClick={() => {
                        setFontStyle(font.value)
                        setShowFontDropdown(false)
                      }}
                      style={{ fontFamily: font.family }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            {userRole === "admin" && (
              <li>
                <button
                  className="nav-button view-as-user-nav-button"
                  onClick={() => setViewAsUser(!viewAsUser)}
                  title={viewAsUser ? "Return to admin view" : "View as regular user"}
                >
                  {viewAsUser ? "👤 Admin View" : "👥 User View"}
                </button>
              </li>
            )}
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
