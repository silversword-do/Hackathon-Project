"""
Abstract API adapter interface - defines the contract for transit API implementations

This module implements the Adapter design pattern, providing a standardized interface
for interacting with different transit APIs. This allows the application to work
with various transit providers without changing the rest of the code.

The APIAdapter is an abstract base class that defines the required methods that
any transit API implementation must provide. Concrete implementations (like
TransitClient) provide the actual API communication logic.

Benefits of this pattern:
- Easy to swap API providers without changing GUI or model code
- Consistent interface across different transit systems
- Can support multiple API providers simultaneously
- Makes testing easier with mock implementations
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..models.route import Route
from ..models.stop import Stop
from ..models.schedule import Schedule
from ..models.bus import Bus


class APIAdapter(ABC):
    """
    Abstract base class for transit API adapters
    
    This class defines the interface that all transit API implementations must follow.
    It uses Python's ABC (Abstract Base Class) to ensure subclasses implement
    all required methods.
    
    Any class that inherits from APIAdapter must implement:
    - get_routes(): Find routes between two locations
    - get_bus_locations(): Get real-time bus positions
    - get_schedules(): Get bus schedules
    - search_stops(): Search for bus stops
    
    The adapter pattern allows the GUI and business logic to work with any transit
    API without knowing the specific API details.
    """
    
    def __init__(self, api_key: str = None, api_url: str = None):
        """
        Initialize the API adapter with authentication and endpoint information
        
        Args:
            api_key: API authentication key (Bearer token, usually)
            api_url: Base URL for the transit API endpoint
        """
        self.api_key = api_key      # Authentication token
        self.api_url = api_url      # Base API endpoint URL
    
    @abstractmethod
    def get_routes(self, origin: str, destination: str) -> List[Route]:
        """
        Get available routes from origin to destination
        
        This is an abstract method that must be implemented by subclasses.
        It should query the transit API to find all possible routes between
        the origin and destination, returning them as Route model objects.
        
        Args:
            origin: Starting location (stop name, address, or stop ID)
            destination: Ending location (stop name, address, or stop ID)
            
        Returns:
            List of Route objects representing available transit options.
            Routes should be ordered by some preference (speed, cost, transfers).
        """
        pass
    
    @abstractmethod
    def get_bus_locations(self, stop_id: str = None, route_id: str = None) -> List[Bus]:
        """
        Get real-time bus locations
        
        This is an abstract method that must be implemented by subclasses.
        It should query the transit API for current bus positions and return
        them as Bus model objects with GPS coordinates and status information.
        
        Args:
            stop_id: Optional stop ID to filter buses (only buses near/at this stop)
            route_id: Optional route ID to filter buses (only buses on this route)
            
        Returns:
            List of Bus objects with current locations, status, and arrival estimates.
            Returns empty list if no buses match the filters.
        """
        pass
    
    @abstractmethod
    def get_schedules(self, route_id: str, stop_id: str = None) -> List[Schedule]:
        """
        Get schedule information for a route
        
        This is an abstract method that must be implemented by subclasses.
        It should query the transit API for scheduled arrival/departure times
        and return them as Schedule model objects.
        
        Args:
            route_id: Route identifier to get schedule for (required)
            stop_id: Optional stop ID to filter schedule (if None, returns all stops)
            
        Returns:
            List of Schedule objects with departure/arrival times.
            If stop_id is provided, returns schedule for that specific stop.
            If stop_id is None, returns schedules for all stops on the route.
        """
        pass
    
    @abstractmethod
    def search_stops(self, query: str) -> List[Stop]:
        """
        Search for bus stops by name or location
        
        This is an abstract method that must be implemented by subclasses.
        It should query the transit API to search for stops matching the query
        string (by name, address, or nearby location).
        
        Args:
            query: Search query (stop name, address, or location description)
            
        Returns:
            List of Stop objects matching the search query, ordered by relevance.
            Returns empty list if no matches found.
        """
        pass
    
    def is_configured(self) -> bool:
        """
        Check if adapter is properly configured with API credentials
        
        Verifies that both API key and API URL are set. This is used to determine
        whether to make real API calls or use mock/sample data.
        
        Returns:
            True if both api_key and api_url are set, False otherwise
        """
        return self.api_key is not None and self.api_url is not None

