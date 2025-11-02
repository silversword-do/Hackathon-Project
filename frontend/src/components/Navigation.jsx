import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">
            <img
              src="/bus-logo.png"
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
  );
}

export default Navigation;
