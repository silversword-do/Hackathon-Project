"""
Schedule data model - represents bus arrival and departure times for a route

A Schedule object contains timing information for buses at a specific stop
or for an entire route. It stores:
- Associated route and stop information
- List of departure times (when buses leave)
- List of arrival times (when buses arrive)
- Frequency information (how often buses run)

This model is used to display schedule information to users and calculate
next available buses.
"""

from typing import List, Optional
from datetime import datetime, time
from .route import Route
from .stop import Stop


class Schedule:
    """
    Represents a bus schedule for a route at a specific stop
    
    This class stores timing information for buses:
    - Route and stop association (which route and which stop)
    - Departure times: when buses leave this stop (sorted list)
    - Arrival times: when buses arrive at this stop (sorted list)
    - Frequency: minutes between buses (if service is regular)
    
    Times are stored as Python time objects (hour:minute) and are automatically
    sorted when added. This allows easy calculation of "next bus" information.
    """
    
    def __init__(self, route: Route = None, stop: Stop = None,
                 departure_times: List[time] = None,
                 arrival_times: List[time] = None,
                 frequency: int = None):
        """
        Initialize a Schedule object
        
        Args:
            route: Route object this schedule applies to (can be None)
            stop: Stop object this schedule applies to (None = all stops on route)
            departure_times: List of time objects representing when buses depart
            arrival_times: List of time objects representing when buses arrive
            frequency: Regular interval in minutes between buses (if applicable)
        """
        self.route = route                    # Associated route
        self.stop = stop                      # Associated stop (None = all stops)
        self.departure_times = departure_times or []  # Sorted list of departure times
        self.arrival_times = arrival_times or []      # Sorted list of arrival times
        self.frequency = frequency            # Minutes between buses (if regular service)
    
    def __repr__(self):
        """
        String representation for debugging
        Returns a formatted string showing schedule summary
        """
        return f"Schedule(Route: {self.route}, Stop: {self.stop}, {len(self.departure_times)} departures)"
    
    def add_departure(self, departure_time: time):
        """
        Add a departure time to the schedule
        
        Adds a new departure time and automatically sorts the list to maintain
        chronological order. Prevents duplicates.
        
        Args:
            departure_time: time object representing when a bus departs
        """
        if departure_time not in self.departure_times:
            self.departure_times.append(departure_time)
            self.departure_times.sort()  # Keep times in chronological order
    
    def add_arrival(self, arrival_time: time):
        """
        Add an arrival time to the schedule
        
        Adds a new arrival time and automatically sorts the list to maintain
        chronological order. Prevents duplicates.
        
        Args:
            arrival_time: time object representing when a bus arrives
        """
        if arrival_time not in self.arrival_times:
            self.arrival_times.append(arrival_time)
            self.arrival_times.sort()  # Keep times in chronological order
    
    def get_next_departure(self, current_time: datetime = None) -> Optional[time]:
        """
        Get the next departure time after current time
        
        Finds the next bus departure time based on the current time. If it's
        past the last departure of the day, returns the first departure (next day).
        
        Args:
            current_time: datetime object for "now" (defaults to actual current time)
        
        Returns:
            Next departure time as time object, or None if no departures exist
        """
        if not self.departure_times:
            return None
        
        # Use current time if not provided
        if current_time is None:
            current_time = datetime.now()
        
        current_time_only = current_time.time()  # Extract just the time portion
        
        # Find first departure time that is >= current time
        for dep_time in self.departure_times:
            if dep_time >= current_time_only:
                return dep_time
        
        # If no departure found today, return first departure (next day)
        # This handles cases where it's late in the day
        return self.departure_times[0] if self.departure_times else None
    
    def to_dict(self) -> dict:
        """
        Convert schedule to dictionary format
        
        Useful for serialization, API responses, or storing in databases.
        Converts the Schedule object to a plain dictionary with all attributes.
        Times are converted to strings in HH:MM format.
        
        Returns:
            Dictionary containing all schedule information
        """
        return {
            'route': self.route.route_id if self.route else None,
            'stop': self.stop.stop_id if self.stop else None,
            'departure_times': [t.strftime('%H:%M') for t in self.departure_times],  # Convert to strings
            'arrival_times': [t.strftime('%H:%M') for t in self.arrival_times],      # Convert to strings
            'frequency': self.frequency
        }

