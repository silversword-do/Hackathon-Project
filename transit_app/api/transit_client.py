"""
Transit API client implementation - concrete implementation of the API adapter

This module provides the TransitClient class, which is the concrete implementation
of the APIAdapter abstract interface. It handles:
- Making HTTP requests to transit APIs
- Parsing API responses into model objects (Route, Stop, Schedule, Bus)
- Falling back to mock data when API is not configured
- Handling API errors gracefully

The client uses the requests library for HTTP communication and implements
automatic fallback to sample data when the API is not properly configured.
This allows the application to work out-of-the-box without requiring API setup.

Flow when making API calls:
1. Check if API is configured (api_key and api_url set)
2. If not configured -> use mock_data functions
3. If configured -> make HTTP request with Bearer token
4. Parse JSON response into model objects
5. Return list of model objects to caller
"""

import requests
from typing import List, Optional
from .api_adapter import APIAdapter
from .config import APIConfig
from ..models.route import Route
from ..models.stop import Stop
from ..models.schedule import Schedule
from ..models.bus import Bus
from datetime import timedelta, time
from .mock_data import get_sample_routes, get_sample_buses, get_sample_schedules, search_sample_stops


class TransitClient(APIAdapter):
    """
    Concrete implementation of transit API client
    
    This class implements all abstract methods from APIAdapter, providing the actual
    HTTP communication logic and response parsing. It:
    - Makes authenticated HTTP requests to the transit API
    - Parses JSON responses into Python model objects
    - Handles errors gracefully (returns empty lists on failure)
    - Falls back to mock data when API is not configured
    
    The implementation supports both list responses and dict responses with nested
    data structures. Parsing logic must be adapted to match specific API formats.
    """
    
    def __init__(self, api_config: APIConfig = None):
        """
        Initialize the transit API client
        
        Sets up the client with API configuration. If no config is provided, creates
        a new APIConfig instance that loads from config.ini. Determines whether to
        use real API calls or mock data based on configuration status.
        
        Args:
            api_config: APIConfig instance with API credentials (creates new if None)
        """
        # Create config if not provided (loads from config.ini)
        if api_config is None:
            api_config = APIConfig()
        
        # Extract API credentials from config
        api_key = api_config.get_api_key()
        api_url = api_config.get_api_url()
        
        # Initialize parent class with credentials
        super().__init__(api_key, api_url)
        
        # Store config reference for later use
        self.api_config = api_config
        
        # Create HTTP session for connection pooling (better performance)
        self.session = requests.Session()
        
        # Determine if we should use mock data (when API not configured)
        self.use_mock_data = not self.is_configured()
    
    def _make_request(self, endpoint: str, params: dict = None) -> Optional[dict]:
        """
        Make HTTP request to API endpoint
        
        Internal method that handles all HTTP communication with the transit API.
        Constructs the full URL, sets authentication headers, and makes the GET request.
        Returns None on any error (caller will handle fallback to mock data).
        
        Args:
            endpoint: API endpoint path (e.g., '/routes', '/buses')
            params: Optional query parameters dictionary
        
        Returns:
            JSON response as dictionary, or None if request fails or API not configured
        """
        # Check if API is configured - if not, return None (caller uses mock data)
        if not self.is_configured():
            # Don't raise error - will use mock data instead
            return None
        
        # Construct full URL by combining base URL and endpoint
        # rstrip/lstrip remove extra slashes to avoid double slashes
        url = f"{self.api_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        # Set up HTTP headers with authentication and content type
        headers = {
            'Authorization': f'Bearer {self.api_key}',  # Bearer token authentication
            'Content-Type': 'application/json'          # Expect JSON response
        }
        
        try:
            # Make GET request with timeout (prevents hanging)
            response = self.session.get(url, headers=headers, params=params, timeout=10)
            
            # Raise exception if HTTP status code indicates error (4xx, 5xx)
            response.raise_for_status()
            
            # Parse JSON response body and return as dictionary
            return response.json()
        except requests.exceptions.RequestException as e:
            # Handle any HTTP errors (network, timeout, status codes, etc.)
            print(f"API request failed: {e}")
            return None  # Return None so caller can handle gracefully
    
    def get_routes(self, origin: str, destination: str) -> List[Route]:
        """
        Get available routes from origin to destination
        
        Implements the abstract method from APIAdapter. Queries the transit API
        to find all possible routes between two locations, or uses mock data if
        API is not configured.
        
        Args:
            origin: Starting location (stop name, address, or stop ID)
            destination: Ending location (stop name, address, or stop ID)
        
        Returns:
            List of Route objects, ordered by preference (speed, transfers, cost).
            Returns empty list if no routes found or API error occurs.
        """
        # Fallback to mock data if API not configured (allows app to work without setup)
        if self.use_mock_data:
            return get_sample_routes(origin, destination)
        
        # Prepare query parameters for API request
        # Note: Actual parameter names depend on your specific API
        params = {
            'origin': origin,
            'destination': destination
        }
        
        # Make HTTP request to routes endpoint
        data = self._make_request('/routes', params)
        if not data:
            return []  # API error or not configured - return empty list
        
        routes = []
        # Parse API response and create Route objects
        # API might return list directly or nested in dict - handle both
        
        if isinstance(data, list):
            # Response is a list of route objects
            for item in data:
                route = self._parse_route(item)
                if route:
                    routes.append(route)
        elif isinstance(data, dict) and 'routes' in data:
            # Response is a dict with 'routes' key containing the list
            for item in data['routes']:
                route = self._parse_route(item)
                if route:
                    routes.append(route)
        
        return routes
    
    def get_bus_locations(self, stop_id: str = None, route_id: str = None) -> List[Bus]:
        """
        Get real-time bus locations
        
        Implements the abstract method from APIAdapter. Queries the transit API
        for current bus positions with optional filtering by stop or route.
        
        Args:
            stop_id: Optional stop ID to filter buses (only buses at/near this stop)
            route_id: Optional route ID to filter buses (only buses on this route)
        
        Returns:
            List of Bus objects with current GPS locations, status, and arrival estimates.
            Returns empty list if no buses found or API error occurs.
        """
        # Fallback to mock data if API not configured
        if self.use_mock_data:
            return get_sample_buses(stop_id=stop_id, route_id=route_id)
        
        # Build query parameters (only include filters that are provided)
        params = {}
        if stop_id:
            params['stop_id'] = stop_id
        if route_id:
            params['route_id'] = route_id
        
        # Make HTTP request to buses endpoint
        data = self._make_request('/buses', params)
        if not data:
            return []  # API error - return empty list
        
        buses = []
        # Parse API response and create Bus objects
        # Handle both list and dict response formats
        
        if isinstance(data, list):
            # Response is a list of bus objects
            for item in data:
                bus = self._parse_bus(item)
                if bus:
                    buses.append(bus)
        elif isinstance(data, dict) and 'buses' in data:
            # Response is a dict with 'buses' key containing the list
            for item in data['buses']:
                bus = self._parse_bus(item)
                if bus:
                    buses.append(bus)
        
        return buses
    
    def get_schedules(self, route_id: str, stop_id: str = None) -> List[Schedule]:
        """
        Get schedule information for a route
        
        Implements the abstract method from APIAdapter. Queries the transit API
        for scheduled arrival/departure times for a route, optionally filtered by stop.
        
        Args:
            route_id: Route identifier (required)
            stop_id: Optional stop ID to filter schedule (None = all stops on route)
        
        Returns:
            List of Schedule objects with departure and arrival times.
            Returns empty list if no schedules found or API error occurs.
        """
        # Fallback to mock data if API not configured
        if self.use_mock_data:
            return get_sample_schedules(route_id, stop_id=stop_id)
        
        # Build query parameters - route_id is required
        params = {'route_id': route_id}
        if stop_id:
            params['stop_id'] = stop_id  # Optional filter by specific stop
        
        # Make HTTP request to schedules endpoint
        data = self._make_request('/schedules', params)
        if not data:
            return []  # API error - return empty list
        
        schedules = []
        # Parse API response and create Schedule objects
        # Handle both list and dict response formats
        
        if isinstance(data, list):
            # Response is a list of schedule objects
            for item in data:
                schedule = self._parse_schedule(item)
                if schedule:
                    schedules.append(schedule)
        elif isinstance(data, dict) and 'schedules' in data:
            # Response is a dict with 'schedules' key containing the list
            for item in data['schedules']:
                schedule = self._parse_schedule(item)
                if schedule:
                    schedules.append(schedule)
        
        return schedules
    
    def search_stops(self, query: str) -> List[Stop]:
        """
        Search for bus stops by name or location
        
        Implements the abstract method from APIAdapter. Queries the transit API
        to search for stops matching the query string (by name, address, or location).
        
        Args:
            query: Search query string (stop name, address, or location description)
        
        Returns:
            List of Stop objects matching the query, ordered by relevance.
            Returns empty list if no matches found or API error occurs.
        """
        # Fallback to mock data if API not configured
        if self.use_mock_data:
            return search_sample_stops(query)
        
        # Prepare search query parameter
        params = {'q': query}  # 'q' is common parameter name for search queries
        
        # Make HTTP request to stops search endpoint
        data = self._make_request('/stops/search', params)
        if not data:
            return []  # API error - return empty list
        
        stops = []
        # Parse API response and create Stop objects
        # Handle both list and dict response formats
        
        if isinstance(data, list):
            # Response is a list of stop objects
            for item in data:
                stop = self._parse_stop(item)
                if stop:
                    stops.append(stop)
        elif isinstance(data, dict) and 'stops' in data:
            # Response is a dict with 'stops' key containing the list
            for item in data['stops']:
                stop = self._parse_stop(item)
                if stop:
                    stops.append(stop)
        
        return stops
    
    def _parse_route(self, data: dict) -> Optional[Route]:
        """
        Parse route data from API response into Route model object
        
        Internal method that converts a dictionary (from JSON API response) into
        a Route model object. Handles missing fields gracefully and parses nested
        stop data if provided.
        
        Note: Field names may need to be adapted to match your specific API format.
        
        Args:
            data: Dictionary containing route data from API
        
        Returns:
            Route object if parsing successful, None on error
        """
        try:
            # Create Route object from API data
            # Using .get() with defaults handles missing fields gracefully
            route = Route(
                route_id=data.get('route_id', ''),
                origin=data.get('origin', ''),
                destination=data.get('destination', ''),
                duration=timedelta(seconds=data.get('duration_seconds', 0)),  # Convert seconds to timedelta
                cost=data.get('cost'),      # Can be None if not provided
                transfers=data.get('transfers', 0)  # Default to 0 transfers
            )
            
            # Parse nested stops data if provided in API response
            if 'stops' in data:
                for stop_data in data['stops']:
                    stop = self._parse_stop(stop_data)
                    if stop:
                        route.add_stop(stop)  # Add stop to route in order
            
            return route
        except Exception as e:
            # Log error but don't crash - return None so other routes can still be parsed
            print(f"Error parsing route: {e}")
            return None
    
    def _parse_stop(self, data: dict) -> Optional[Stop]:
        """
        Parse stop data from API response into Stop model object
        
        Internal method that converts a dictionary (from JSON API response) into
        a Stop model object. Handles missing fields gracefully.
        
        Args:
            data: Dictionary containing stop data from API
        
        Returns:
            Stop object if parsing successful, None on error
        """
        try:
            return Stop(
                stop_id=data.get('stop_id', ''),
                name=data.get('name', ''),
                latitude=data.get('latitude'),    # Can be None if not provided
                longitude=data.get('longitude'),  # Can be None if not provided
                address=data.get('address', '')
            )
        except Exception as e:
            # Log error but don't crash
            print(f"Error parsing stop: {e}")
            return None
    
    def _parse_schedule(self, data: dict) -> Optional[Schedule]:
        """
        Parse schedule data from API response into Schedule model object
        
        Internal method that converts a dictionary (from JSON API response) into
        a Schedule model object. Parses time strings and creates associated Route
        and Stop objects if IDs are provided.
        
        Args:
            data: Dictionary containing schedule data from API
        
        Returns:
            Schedule object if parsing successful, None on error
        """
        try:
            from ..models.route import Route
            
            # Create minimal Route object if route_id is provided
            route = None
            if 'route_id' in data:
                # Create a minimal route object (just ID, not full route details)
                route = Route(route_id=data['route_id'])
            
            # Create minimal Stop object if stop_id is provided
            stop = None
            if 'stop_id' in data:
                stop = Stop(stop_id=data['stop_id'], name=data.get('stop_name', ''))
            
            # Create Schedule object with route and stop
            schedule = Schedule(route=route, stop=stop)
            
            # Parse departure times from list of time strings
            if 'departure_times' in data:
                for time_str in data['departure_times']:
                    try:
                        # Parse time string (format: HH:MM)
                        parts = time_str.split(':')
                        if len(parts) == 2:
                            t = time(int(parts[0]), int(parts[1]))
                            schedule.add_departure(t)  # Automatically sorts times
                    except Exception:
                        # Skip invalid time strings
                        continue
            
            # Parse arrival times from list of time strings
            if 'arrival_times' in data:
                for time_str in data['arrival_times']:
                    try:
                        parts = time_str.split(':')
                        if len(parts) == 2:
                            t = time(int(parts[0]), int(parts[1]))
                            schedule.add_arrival(t)  # Automatically sorts times
                    except Exception:
                        # Skip invalid time strings
                        continue
            
            # Set frequency if provided (minutes between buses)
            if 'frequency' in data:
                schedule.frequency = data['frequency']
            
            return schedule
        except Exception as e:
            # Log error but don't crash
            print(f"Error parsing schedule: {e}")
            return None
    
    def _parse_bus(self, data: dict) -> Optional[Bus]:
        """
        Parse bus data from API response into Bus model object
        
        Internal method that converts a dictionary (from JSON API response) into
        a Bus model object. Handles datetime parsing for estimated arrival times.
        
        Args:
            data: Dictionary containing bus data from API
        
        Returns:
            Bus object if parsing successful, None on error
        """
        try:
            from ..models.route import Route
            from datetime import datetime
            
            # Create minimal Route object if route_id is provided
            route = None
            if 'route_id' in data:
                route = Route(route_id=data['route_id'])
            
            # Parse estimated arrival datetime (handles ISO format strings)
            estimated_arrival = None
            if 'estimated_arrival' in data:
                try:
                    # Try parsing ISO format datetime (e.g., "2024-01-15T14:30:00")
                    estimated_arrival = datetime.fromisoformat(data['estimated_arrival'])
                except Exception:
                    # If parsing fails, leave as None
                    pass
            
            # Create Bus object with all parsed data
            return Bus(
                bus_id=data.get('bus_id', ''),
                route=route,
                latitude=data.get('latitude'),      # Can be None
                longitude=data.get('longitude'),   # Can be None
                status=data.get('status', 'unknown'),  # Default to 'unknown'
                estimated_arrival=estimated_arrival,
                current_stop=data.get('current_stop', ''),
                next_stop=data.get('next_stop', '')
            )
        except Exception as e:
            # Log error but don't crash
            print(f"Error parsing bus: {e}")
            return None

