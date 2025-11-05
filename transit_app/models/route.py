"""
Route data model - represents a bus route from origin to destination

A Route object encapsulates all information about a transit route including:
- Route identification (ID, origin, destination)
- Sequence of stops along the route
- Duration and cost information
- Transfer requirements

This model is used throughout the application to represent route information
retrieved from the API or GTFS data.
"""

from typing import List, Optional
from datetime import timedelta


class Route:
    """
    Represents a bus route from origin to destination
    
    This class stores all relevant information about a transit route:
    - Identification: unique route ID, origin and destination names
    - Path: ordered list of stops along the route
    - Metrics: estimated duration, cost, and number of transfers required
    - The stops list maintains the order of stops from origin to destination
    """
    
    def __init__(self, route_id: str = None, origin: str = None, 
                 destination: str = None, stops: List = None,
                 duration: timedelta = None, cost: float = None,
                 transfers: int = 0):
        """
        Initialize a Route object
        
        Args:
            route_id: Unique identifier for this route (e.g., "ROUTE101")
            origin: Starting location name (e.g., "Downtown Station")
            destination: Ending location name (e.g., "University Campus")
            stops: List of Stop objects representing stops along the route (in order)
            duration: Estimated travel time as a timedelta object
            cost: Fare cost for this route (float, can be None if unknown)
            transfers: Number of transfers required (0 = direct route)
        """
        self.route_id = route_id or ""  # Unique route identifier
        self.origin = origin or ""       # Starting point name
        self.destination = destination or ""  # Ending point name
        self.stops = stops or []         # Ordered list of Stop objects
        self.duration = duration or timedelta(0)  # Travel time
        self.cost = cost                 # Fare cost (None if unknown)
        self.transfers = transfers        # Number of bus changes required
    
    def __repr__(self):
        """
        String representation for debugging
        Returns a formatted string showing route summary
        """
        return f"Route({self.origin} -> {self.destination}, {len(self.stops)} stops, {self.duration})"
    
    def get_duration_string(self) -> str:
        """
        Get duration as human-readable string
        
        Converts the timedelta duration to a user-friendly format like "1h 25m" or "45m"
        
        Returns:
            Human-readable duration string (e.g., "1h 25m" or "45m")
        """
        total_seconds = int(self.duration.total_seconds())
        hours = total_seconds // 3600      # Calculate hours
        minutes = (total_seconds % 3600) // 60  # Calculate remaining minutes
        
        # Format with hours if duration is >= 1 hour
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"  # Just show minutes if < 1 hour
    
    def add_stop(self, stop):
        """
        Add a stop to the route
        
        Adds a Stop object to the route's stop list. Prevents duplicates by checking
        if the stop is already in the list. Stops should be added in order from
        origin to destination.
        
        Args:
            stop: Stop object to add to this route
        """
        if stop not in self.stops:
            self.stops.append(stop)
    
    def to_dict(self) -> dict:
        """
        Convert route to dictionary format
        
        Useful for serialization, API responses, or storing in databases.
        Converts the Route object to a plain dictionary with all attributes.
        
        Returns:
            Dictionary containing all route information
        """
        return {
            'route_id': self.route_id,
            'origin': self.origin,
            'destination': self.destination,
            'stops': [str(stop) for stop in self.stops],  # Convert stops to strings
            'duration': str(self.duration),  # Convert timedelta to string
            'cost': self.cost,
            'transfers': self.transfers
        }

