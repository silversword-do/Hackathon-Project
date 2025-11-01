"""
Route data model
"""

from typing import List, Optional
from datetime import timedelta


class Route:
    """Represents a bus route from origin to destination"""
    
    def __init__(self, route_id: str = None, origin: str = None, 
                 destination: str = None, stops: List = None,
                 duration: timedelta = None, cost: float = None,
                 transfers: int = 0):
        self.route_id = route_id or ""
        self.origin = origin or ""
        self.destination = destination or ""
        self.stops = stops or []
        self.duration = duration or timedelta(0)
        self.cost = cost
        self.transfers = transfers
    
    def __repr__(self):
        return f"Route({self.origin} -> {self.destination}, {len(self.stops)} stops, {self.duration})"
    
    def get_duration_string(self) -> str:
        """Get duration as human-readable string"""
        total_seconds = int(self.duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"
    
    def add_stop(self, stop):
        """Add a stop to the route"""
        if stop not in self.stops:
            self.stops.append(stop)
    
    def to_dict(self) -> dict:
        """Convert route to dictionary"""
        return {
            'route_id': self.route_id,
            'origin': self.origin,
            'destination': self.destination,
            'stops': [str(stop) for stop in self.stops],
            'duration': str(self.duration),
            'cost': self.cost,
            'transfers': self.transfers
        }

