import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">Transit App</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/map" 
              className={isActive('/map') ? 'active' : ''}
            >
              Map
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={isActive('/settings') ? 'active' : ''}
            >
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation

