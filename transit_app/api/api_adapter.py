"""
Abstract API adapter interface
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..models.route import Route
from ..models.stop import Stop
from ..models.schedule import Schedule
from ..models.bus import Bus


class APIAdapter(ABC):
    """Abstract base class for transit API adapters"""
    
    def __init__(self, api_key: str = None, api_url: str = None):
        self.api_key = api_key
        self.api_url = api_url
    
    @abstractmethod
    def get_routes(self, origin: str, destination: str) -> List[Route]:
        """
        Get available routes from origin to destination
        
        Args:
            origin: Starting location
            destination: Ending location
            
        Returns:
            List of Route objects
        """
        pass
    
    @abstractmethod
    def get_bus_locations(self, stop_id: str = None, route_id: str = None) -> List[Bus]:
        """
        Get real-time bus locations
        
        Args:
            stop_id: Optional stop ID to filter by
            route_id: Optional route ID to filter by
            
        Returns:
            List of Bus objects with current locations
        """
        pass
    
    @abstractmethod
    def get_schedules(self, route_id: str, stop_id: str = None) -> List[Schedule]:
        """
        Get schedule information for a route
        
        Args:
            route_id: Route identifier
            stop_id: Optional stop ID to filter by
            
        Returns:
            List of Schedule objects
        """
        pass
    
    @abstractmethod
    def search_stops(self, query: str) -> List[Stop]:
        """
        Search for bus stops by name or location
        
        Args:
            query: Search query
            
        Returns:
            List of matching Stop objects
        """
        pass
    
    def is_configured(self) -> bool:
        """Check if adapter is properly configured"""
        return self.api_key is not None and self.api_url is not None

