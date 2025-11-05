import { useState } from "react";
import "./RouteEditor.css";

function RouteEditor({ route, onSave, onCancel, onDelete, allStops }) {
  const [name, setName] = useState(route?.name || "");
  const [routeId, setRouteId] = useState(route?.route_id || "");
  const [color, setColor] = useState(route?.color || "#FF6600");
  const [selectedStops, setSelectedStops] = useState(
    route?.stops?.map((s) => s.stop_id) || []
  );
  
  // Bus configuration state
  const [busCount, setBusCount] = useState(route?.busConfig?.count || 0);
  const [busDirection, setBusDirection] = useState(route?.busConfig?.direction || "forward");
  const [busStartPosition, setBusStartPosition] = useState(route?.busConfig?.startPosition || 0);

  const handleSave = () => {
    const stops = allStops.filter((s) => selectedStops.includes(s.stop_id));
    const routeData = {
      route_id: routeId || `ROUTE_${Date.now()}`,
      name,
      color,
      stops: stops,
      busConfig: {
        count: Math.max(0, Math.min(busCount, 10)), // Limit to 0-10 buses
        direction: busDirection,
        startPosition: Math.max(0, Math.min(busStartPosition, 1)), // 0-1 range
      },
    };
    onSave(routeData);
  };

  const toggleStop = (stopId) => {
    if (selectedStops.includes(stopId)) {
      setSelectedStops(selectedStops.filter((id) => id !== stopId));
    } else {
      setSelectedStops([...selectedStops, stopId]);
    }
  };

  return (
    <div className="route-editor">
      <div className="route-editor-header">
        <h3>{route ? "Edit Route" : "Add New Route"}</h3>
        {route && onDelete && (
          <button
            className="delete-button"
            onClick={() => onDelete(route.route_id)}
          >
            Delete
          </button>
        )}
      </div>

      <div className="route-editor-form">
        <div className="form-group">
          <label>Route ID</label>
          <input
            type="text"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            placeholder="e.g., OSU_ORANGE"
            disabled={!!route}
          />
        </div>

        <div className="form-group">
          <label>Route Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Orange Route"
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-input-group">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#FF6600"
              className="color-text-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Select Stops ({selectedStops.length} selected)</label>
          <div className="stops-selection">
            {allStops.map((stop) => (
              <label key={stop.stop_id} className="stop-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStops.includes(stop.stop_id)}
                  onChange={() => toggleStop(stop.stop_id)}
                />
                <span>{stop.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Bus Configuration</label>
          <div className="bus-config-section">
            <div className="bus-config-item">
              <label>Number of Buses</label>
              <input
                type="number"
                min="0"
                max="10"
                value={busCount}
                onChange={(e) => setBusCount(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <span className="config-hint">(0-10 buses per route)</span>
            </div>
            
            <div className="bus-config-item">
              <label>Direction</label>
              <select
                value={busDirection}
                onChange={(e) => setBusDirection(e.target.value)}
              >
                <option value="forward">Forward (Start to End)</option>
                <option value="reverse">Reverse (End to Start)</option>
              </select>
            </div>
            
            <div className="bus-config-item">
              <label>Start Position</label>
              <input
                type="range"
                min="0"
                max="100"
                value={busStartPosition * 100}
                onChange={(e) => setBusStartPosition(parseFloat(e.target.value) / 100)}
              />
              <span className="config-value">{Math.round(busStartPosition * 100)}%</span>
              <span className="config-hint">(Position along route: 0% = start, 100% = end)</span>
            </div>
          </div>
        </div>

        <div className="route-editor-actions">
          <button className="save-button" onClick={handleSave}>
            {route ? "Update Route" : "Create Route"}
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteEditor;
