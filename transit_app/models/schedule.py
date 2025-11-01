"""
Schedule data model
"""

from typing import List, Optional
from datetime import datetime, time
from .route import Route
from .stop import Stop


class Schedule:
    """Represents a bus schedule for a route"""
    
    def __init__(self, route: Route = None, stop: Stop = None,
                 departure_times: List[time] = None,
                 arrival_times: List[time] = None,
                 frequency: int = None):
        self.route = route
        self.stop = stop
        self.departure_times = departure_times or []
        self.arrival_times = arrival_times or []
        self.frequency = frequency  # Minutes between buses
    
    def __repr__(self):
        return f"Schedule(Route: {self.route}, Stop: {self.stop}, {len(self.departure_times)} departures)"
    
    def add_departure(self, departure_time: time):
        """Add a departure time"""
        if departure_time not in self.departure_times:
            self.departure_times.append(departure_time)
            self.departure_times.sort()
    
    def add_arrival(self, arrival_time: time):
        """Add an arrival time"""
        if arrival_time not in self.arrival_times:
            self.arrival_times.append(arrival_time)
            self.arrival_times.sort()
    
    def get_next_departure(self, current_time: datetime = None) -> Optional[time]:
        """Get the next departure time after current time"""
        if not self.departure_times:
            return None
        
        if current_time is None:
            current_time = datetime.now()
        
        current_time_only = current_time.time()
        for dep_time in self.departure_times:
            if dep_time >= current_time_only:
                return dep_time
        
        # If no departure found, return first departure of next day
        return self.departure_times[0] if self.departure_times else None
    
    def to_dict(self) -> dict:
        """Convert schedule to dictionary"""
        return {
            'route': self.route.route_id if self.route else None,
            'stop': self.stop.stop_id if self.stop else None,
            'departure_times': [t.strftime('%H:%M') for t in self.departure_times],
            'arrival_times': [t.strftime('%H:%M') for t in self.arrival_times],
            'frequency': self.frequency
        }

