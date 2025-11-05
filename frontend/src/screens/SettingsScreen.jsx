import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { submitUserIssue, getUserIssues } from '../services/firebaseUserIssues'
import './SettingsScreen.css'

function SettingsScreen() {
  const { logout, isAdmin, user } = useAuth()
  const { theme, setTheme: setThemeState } = useTheme()
  const [settings, setSettings] = useState({
    apiKey: '',
    apiUrl: '',
    autoRefresh: true,
    refreshInterval: 30,
    theme: theme,
    notifications: true
  })
  
  // Help/Support state
  const [helpIssue, setHelpIssue] = useState('')
  const [helpCategory, setHelpCategory] = useState('general')
  const [submittingIssue, setSubmittingIssue] = useState(false)
  const [issueSubmitted, setIssueSubmitted] = useState(false)
  const [userIssues, setUserIssues] = useState([])
  const [showHelpTab, setShowHelpTab] = useState(false)

  // Sync settings theme with theme context
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }))
  }, [theme])
  
  // Load user issues when component mounts or user changes
  useEffect(() => {
    if (user && user.uid) {
      loadUserIssues()
    }
  }, [user])
  
  const loadUserIssues = async () => {
    if (!user?.uid) return
    try {
      const issues = await getUserIssues(user.uid)
      setUserIssues(issues)
    } catch (error) {
      console.error('Error loading user issues:', error)
    }
  }
  
  const handleSubmitIssue = async (e) => {
    e.preventDefault()
    if (!user?.uid || !helpIssue.trim()) {
      alert('Please enter an issue description')
      return
    }
    
    setSubmittingIssue(true)
    try {
      await submitUserIssue(user.uid, helpIssue, helpCategory)
      setIssueSubmitted(true)
      setHelpIssue('')
      setHelpCategory('general')
      await loadUserIssues() // Reload issues
      
      setTimeout(() => {
        setIssueSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting issue:', error)
      alert('Failed to submit issue. Please try again.')
    } finally {
      setSubmittingIssue(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Update theme context when theme changes
    if (name === 'theme') {
      setThemeState(value)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    // In a real app, this would save to backend/localStorage
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    const resetSettings = {
      apiKey: '',
      apiUrl: '',
      autoRefresh: true,
      refreshInterval: 30,
      theme: 'light',
      notifications: true
    }
    setSettings(resetSettings)
    setThemeState('light')
  }

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your app preferences and API settings</p>
        <div className="settings-tabs">
          <button
            className={`tab-button ${!showHelpTab ? 'active' : ''}`}
            onClick={() => setShowHelpTab(false)}
          >
            Settings
          </button>
          <button
            className={`tab-button ${showHelpTab ? 'active' : ''}`}
            onClick={() => setShowHelpTab(true)}
          >
            Help & Support
          </button>
        </div>
      </div>

      {!showHelpTab ? (
        <form onSubmit={handleSave} className="settings-form">
        {isAdmin && (
          <div className="settings-section">
            <h2>API Configuration</h2>
            <p className="settings-note">Admin-only settings</p>
            
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
        )}

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

        <div className="settings-section">
          <h2>Account</h2>
          {user && (
            <>
              <div className="form-group">
                <label>Account Name (Email)</label>
                <div className="account-info-display">
                  {user.email || 'No email associated'}
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="account-info-display account-password-display">
                  •••••••••••• (Encrypted - Cannot be displayed for security reasons)
                </div>
              </div>
            </>
          )}
          <div className="form-group">
            <button 
              type="button" 
              onClick={logout} 
              className="button button-logout"
            >
              Log Out
            </button>
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
      ) : (
        <div className="settings-form">
          <div className="settings-section">
            <h2>Submit an Issue</h2>
            <p className="settings-note">
              Found a bug or have a suggestion? Let us know! We'll review your issue and get back to you.
            </p>
            
            {issueSubmitted && (
              <div className="success-message">
                ✓ Issue submitted successfully! We'll review it soon.
              </div>
            )}
            
            <form onSubmit={handleSubmitIssue}>
              <div className="form-group">
                <label htmlFor="helpCategory">Category</label>
                <select
                  id="helpCategory"
                  value={helpCategory}
                  onChange={(e) => setHelpCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="map">Map Issue</option>
                  <option value="bus">Bus Tracking</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="helpIssue">Describe your issue</label>
                <textarea
                  id="helpIssue"
                  value={helpIssue}
                  onChange={(e) => setHelpIssue(e.target.value)}
                  placeholder="Please describe the issue you're experiencing, what you were trying to do, and any steps to reproduce it..."
                  className="form-textarea"
                  rows={6}
                  required
                />
              </div>
              
              <div className="form-group">
                <button 
                  type="submit" 
                  className="button button-primary"
                  disabled={submittingIssue || !helpIssue.trim()}
                >
                  {submittingIssue ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
          
          {userIssues.length > 0 && (
            <div className="settings-section">
              <h2>Your Submitted Issues ({userIssues.length})</h2>
              <div className="issues-list">
                {userIssues.map((issue) => (
                  <div key={issue.id} className="issue-item">
                    <div className="issue-header">
                      <span className={`issue-status ${issue.status}`}>{issue.status}</span>
                      <span className="issue-category">{issue.category}</span>
                      <span className="issue-date">
                        {issue.createdAt instanceof Date 
                          ? issue.createdAt.toLocaleDateString() 
                          : new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="issue-text">{issue.issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SettingsScreen

