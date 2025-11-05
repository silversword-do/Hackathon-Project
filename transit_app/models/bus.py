"""
Bus data model for real-time tracking - represents a live bus with current location

A Bus object contains real-time information about a specific bus vehicle:
- Identification (bus ID and associated route)
- Current location (GPS coordinates)
- Status information (on-time, delayed, etc.)
- Estimated arrival times
- Current and next stop information
- Last update timestamp

This model is used for real-time bus tracking functionality, allowing users
to see where buses are and when they'll arrive.
"""

from typing import Optional
from datetime import datetime
from .route import Route


class Bus:
    """
    Represents a bus with real-time tracking information
    
    This class stores all relevant information about a live bus vehicle:
    - Identification: unique bus ID and associated route
    - Location: current GPS coordinates (latitude/longitude)
    - Status: real-time status (on-time, delayed, early, unknown)
    - Timing: estimated arrival time at next stop
    - Progress: current stop name and next stop name
    - Metadata: when this information was last updated
    
    Used for displaying real-time bus locations and arrival predictions.
    """
    
    def __init__(self, bus_id: str = None, route: Route = None,
                 latitude: float = None, longitude: float = None,
                 status: str = None, estimated_arrival: datetime = None,
                 current_stop: str = None, next_stop: str = None):
        """
        Initialize a Bus object
        
        Args:
            bus_id: Unique identifier for this bus (e.g., "BUS001")
            route: Route object representing the route this bus is serving
            latitude: Current GPS latitude coordinate (float, can be None)
            longitude: Current GPS longitude coordinate (float, can be None)
            status: Current status - "on-time", "delayed", "early", or "unknown"
            estimated_arrival: datetime object for when bus will arrive at next stop
            current_stop: Name of the stop the bus is currently at or approaching
            next_stop: Name of the next stop the bus will visit
        """
        self.bus_id = bus_id or ""           # Unique bus identifier
        self.route = route                   # Associated route
        self.latitude = latitude             # Current GPS latitude (None if unknown)
        self.longitude = longitude           # Current GPS longitude (None if unknown)
        self.status = status or "unknown"    # on-time, delayed, early, unknown
        self.estimated_arrival = estimated_arrival  # When bus arrives at next stop
        self.current_stop = current_stop or ""     # Current stop name
        self.next_stop = next_stop or ""          # Next stop name
        self.last_updated = datetime.now()    # Timestamp of last update
    
    def __repr__(self):
        """
        String representation for debugging
        Returns a formatted string showing bus ID, route, and status
        """
        return f"Bus({self.bus_id}, Route: {self.route}, Status: {self.status})"
    
    def has_location(self) -> bool:
        """
        Check if bus has valid coordinates
        
        Verifies that both latitude and longitude are set (not None).
        Used to determine if the bus can be displayed on a map.
        
        Returns:
            True if both latitude and longitude are set, False otherwise
        """
        return self.latitude is not None and self.longitude is not None
    
    def get_estimated_arrival_string(self) -> str:
        """
        Get estimated arrival as human-readable string
        
        Converts the estimated arrival datetime to a user-friendly format
        showing minutes until arrival, or special messages for immediate/arrived buses.
        
        Returns:
            Human-readable arrival string:
            - "Arrived" if bus has already arrived
            - "Arriving now" if < 1 minute away
            - "{minutes} min" for minutes until arrival
            - "Unknown" if no estimated arrival time
        """
        if not self.estimated_arrival:
            return "Unknown"
        
        now = datetime.now()
        
        # Check if bus has already arrived
        if self.estimated_arrival < now:
            return "Arrived"
        
        # Calculate minutes until arrival
        delta = self.estimated_arrival - now
        minutes = int(delta.total_seconds() / 60)
        
        # Return user-friendly message
        if minutes < 1:
            return "Arriving now"
        return f"{minutes} min"
    
    def to_dict(self) -> dict:
        """
        Convert bus to dictionary format
        
        Useful for serialization, API responses, or storing in databases.
        Converts the Bus object to a plain dictionary with all attributes.
        Datetime objects are converted to ISO format strings.
        
        Returns:
            Dictionary containing all bus information
        """
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

