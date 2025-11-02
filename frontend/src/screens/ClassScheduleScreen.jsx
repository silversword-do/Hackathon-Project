import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchClassSchedule, saveClassScheduleData, matchClassesToMarkers } from '../services/classScheduleApi'
import { fetchOSUStops } from '../services/api'
import './ClassScheduleScreen.css'

// Common OSU building coordinates (approximate)
const OSU_BUILDINGS = {
  'Student Union': { lat: 36.1197, lon: -97.0661 },
  'Library': { lat: 36.1240, lon: -97.0680 },
  'Engineering North': { lat: 36.1280, lon: -97.0695 },
  'Engineering South': { lat: 36.1260, lon: -97.0700 },
  'Life Sciences East': { lat: 36.1230, lon: -97.0710 },
  'Life Sciences West': { lat: 36.1230, lon: -97.0720 },
  'Agriculture': { lat: 36.1220, lon: -97.0730 },
  'Colvin Center': { lat: 36.1260, lon: -97.0670 },
  'Business Building': { lat: 36.1210, lon: -97.0680 },
  'Galloway Hall': { lat: 36.1225, lon: -97.0690 },
  'Morrill Hall': { lat: 36.1200, lon: -97.0680 },
  'Gunderson Hall': { lat: 36.1215, lon: -97.0675 },
  'Noble Research Center': { lat: 36.1250, lon: -97.0690 },
}

function ClassScheduleScreen() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [stops, setStops] = useState([])
  const [matchedClasses, setMatchedClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  // Form state for adding new class
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    buildingName: '',
    buildingLat: '',
    buildingLon: '',
    days: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (classes.length > 0) {
      const matched = stops.length > 0 
        ? matchClassesToMarkers(classes, stops)
        : classes.map(cls => ({ ...cls, closestMarker: null }))
      setMatchedClasses(matched)
    } else {
      setMatchedClasses([])
    }
  }, [classes, stops])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = user?.uid || null
      const [scheduleData, stopsData] = await Promise.all([
        fetchClassSchedule(userId),
        fetchOSUStops()
      ])
      
      setClasses(scheduleData.classes || [])
      setStops(stopsData.stops || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleBuildingChange = (buildingName) => {
    const building = OSU_BUILDINGS[buildingName]
    if (building) {
      setFormData({
        ...formData,
        buildingName,
        buildingLat: building.lat.toString(),
        buildingLon: building.lon.toString()
      })
    } else {
      setFormData({
        ...formData,
        buildingName,
        buildingLat: '',
        buildingLon: ''
      })
    }
  }

  const handleAddClass = () => {
    if (!formData.courseCode || !formData.buildingName) {
      setSaveMessage('Please fill in at least course code and building name')
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    const newClass = {
      id: Date.now().toString(),
      courseCode: formData.courseCode,
      courseName: formData.courseName,
      buildingName: formData.buildingName,
      buildingLat: formData.buildingLat ? parseFloat(formData.buildingLat) : null,
      buildingLon: formData.buildingLon ? parseFloat(formData.buildingLon) : null,
      days: formData.days,
      startTime: formData.startTime,
      endTime: formData.endTime
    }

    const updatedClasses = [...classes, newClass]
    setClasses(updatedClasses)
    handleSave(updatedClasses)
    setFormData({
      courseCode: '',
      courseName: '',
      buildingName: '',
      buildingLat: '',
      buildingLon: '',
      days: '',
      startTime: '',
      endTime: ''
    })
    setShowAddForm(false)
  }

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const updatedClasses = classes.filter(c => c.id !== classId)
      setClasses(updatedClasses)
      await handleSave(updatedClasses)
    }
  }

  const handleSave = async (classesToSave = classes) => {
    try {
      const userId = user?.uid || null
      const success = await saveClassScheduleData(classesToSave, userId)
      if (success) {
        setSaveMessage('Class schedule saved successfully!')
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage('Failed to save class schedule')
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving class schedule:', error)
      setSaveMessage('Error saving class schedule')
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const groupClassesByMarker = () => {
    const grouped = {}
    
    matchedClasses.forEach(cls => {
      const markerKey = cls.closestMarker 
        ? `${cls.closestMarker.stop_id}-${cls.closestMarker.name}` 
        : 'unknown'
      
      if (!grouped[markerKey]) {
        grouped[markerKey] = {
          marker: cls.closestMarker,
          classes: []
        }
      }
      grouped[markerKey].classes.push(cls)
    })

    return Object.values(grouped)
  }

  if (loading) {
    return (
      <div className="class-schedule-screen">
        <div className="class-schedule-header">
          <h1>Class Schedule</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="class-schedule-screen">
        <div className="class-schedule-header">
          <h1>Class Schedule</h1>
          <p className="error-text">{error}</p>
          <button onClick={loadData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const groupedClasses = groupClassesByMarker()

  return (
    <div className="class-schedule-screen">
      <div className="class-schedule-header">
        <h1>My Class Schedule</h1>
        <p>Manage your classes organized by closest bus stop</p>
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
      </div>

      <div className="class-schedule-controls">
        <button
          className="control-button primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Class'}
        </button>
        <button
          className="control-button"
          onClick={() => handleSave()}
        >
          Save Schedule
        </button>
      </div>

      {showAddForm && (
        <div className="add-class-form">
          <h3>Add New Class</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                placeholder="e.g., CS 101"
              />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input
                type="text"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="e.g., Introduction to Programming"
              />
            </div>
            <div className="form-group">
              <label>Building *</label>
              <select
                value={formData.buildingName}
                onChange={(e) => handleBuildingChange(e.target.value)}
              >
                <option value="">Select Building</option>
                {Object.keys(OSU_BUILDINGS).map(building => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Days</label>
              <input
                type="text"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                placeholder="e.g., MWF or TTH"
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <button className="control-button primary" onClick={handleAddClass}>
            Add Class
          </button>
        </div>
      )}

      <div className="class-schedule-content">
        {groupedClasses.length === 0 ? (
          <div className="no-classes">
            <p>No classes added yet. Click "Add Class" to get started!</p>
          </div>
        ) : (
          groupedClasses.map((group, idx) => (
            <div key={idx} className="marker-group">
              <div className="marker-header">
                <h3>
                  {group.marker 
                    ? `Closest Stop: ${group.marker.name}` 
                    : 'Unknown Location'}
                </h3>
                {group.marker && (
                  <span className="distance-badge">
                    {group.marker.distance.toFixed(2)} km away
                  </span>
                )}
              </div>
              <div className="classes-list">
                {group.classes.map(cls => (
                  <div key={cls.id} className="class-item">
                    <div className="class-info">
                      <h4>{cls.courseCode}</h4>
                      {cls.courseName && <p className="course-name">{cls.courseName}</p>}
                      <div className="class-details">
                        <span className="building-name">📍 {cls.buildingName}</span>
                        {cls.days && <span>📅 {cls.days}</span>}
                        {cls.startTime && cls.endTime && (
                          <span>🕐 {cls.startTime} - {cls.endTime}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteClass(cls.id)}
                      title="Delete Class"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ClassScheduleScreen

