"""
Bus data model for real-time tracking
"""

from typing import Optional
from datetime import datetime
from .route import Route


class Bus:
    """Represents a bus with real-time tracking information"""
    
    def __init__(self, bus_id: str = None, route: Route = None,
                 latitude: float = None, longitude: float = None,
                 status: str = None, estimated_arrival: datetime = None,
                 current_stop: str = None, next_stop: str = None):
        self.bus_id = bus_id or ""
        self.route = route
        self.latitude = latitude
        self.longitude = longitude
        self.status = status or "unknown"  # on-time, delayed, early, unknown
        self.estimated_arrival = estimated_arrival
        self.current_stop = current_stop or ""
        self.next_stop = next_stop or ""
        self.last_updated = datetime.now()
    
    def __repr__(self):
        return f"Bus({self.bus_id}, Route: {self.route}, Status: {self.status})"
    
    def has_location(self) -> bool:
        """Check if bus has valid coordinates"""
        return self.latitude is not None and self.longitude is not None
    
    def get_estimated_arrival_string(self) -> str:
        """Get estimated arrival as human-readable string"""
        if not self.estimated_arrival:
            return "Unknown"
        
        now = datetime.now()
        if self.estimated_arrival < now:
            return "Arrived"
        
        delta = self.estimated_arrival - now
        minutes = int(delta.total_seconds() / 60)
        
        if minutes < 1:
            return "Arriving now"
        return f"{minutes} min"
    
    def to_dict(self) -> dict:
        """Convert bus to dictionary"""
        return {
            'bus_id': self.bus_id,
            'route': self.route.route_id if self.route else None,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'estimated_arrival': self.estimated_arrival.isoformat() if self.estimated_arrival else None,
            'current_stop': self.current_stop,
            'next_stop': self.next_stop,
            'last_updated': self.last_updated.isoformat()
        }

