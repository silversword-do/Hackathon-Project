import { useState } from 'react'
import './SettingsScreen.css'

function SettingsScreen() {
  const [settings, setSettings] = useState({
    apiKey: '',
    apiUrl: '',
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'light',
    notifications: true
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    // In a real app, this would save to backend/localStorage
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    setSettings({
      apiKey: '',
      apiUrl: '',
      autoRefresh: true,
      refreshInterval: 30,
      theme: 'light',
      notifications: true
    })
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your app preferences and API settings</p>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h2>API Configuration</h2>
          
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={settings.apiKey}
              onChange={handleInputChange}
              placeholder="Enter your API key"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiUrl">API URL</label>
            <input
              type="url"
              id="apiUrl"
              name="apiUrl"
              value={settings.apiUrl}
              onChange={handleInputChange}
              placeholder="https://api.example.com/transit"
              className="form-input"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Preferences</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autoRefresh"
                checked={settings.autoRefresh}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span>Enable Auto-refresh</span>
            </label>
          </div>

          {settings.autoRefresh && (
            <div className="form-group">
              <label htmlFor="refreshInterval">Refresh Interval (seconds)</label>
              <input
                type="number"
                id="refreshInterval"
                name="refreshInterval"
                value={settings.refreshInterval}
                onChange={handleInputChange}
                min="10"
                max="300"
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span>Enable Notifications</span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" onClick={handleReset} className="button button-secondary">
            Reset
          </button>
          <button type="submit" className="button button-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsScreen

