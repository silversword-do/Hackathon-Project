"""
Transit API client implementation
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


class TransitClient(APIAdapter):
    """Concrete implementation of transit API client"""
    
    def __init__(self, api_config: APIConfig = None):
        if api_config is None:
            api_config = APIConfig()
        
        api_key = api_config.get_api_key()
        api_url = api_config.get_api_url()
        
        super().__init__(api_key, api_url)
        self.api_config = api_config
        self.session = requests.Session()
    
    def _make_request(self, endpoint: str, params: dict = None) -> Optional[dict]:
        """Make HTTP request to API"""
        if not self.is_configured():
            raise ValueError("API not configured. Please set API key in config.ini")
        
        url = f"{self.api_url.rstrip('/')}/{endpoint.lstrip('/')}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = self.session.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return None
    
    def get_routes(self, origin: str, destination: str) -> List[Route]:
        """Get available routes from origin to destination"""
        # This is a placeholder implementation
        # Actual implementation depends on specific API structure
        params = {
            'origin': origin,
            'destination': destination
        }
        
        data = self._make_request('/routes', params)
        if not data:
            return []
        
        routes = []
        # Parse API response and create Route objects
        # This structure will need to be adapted to the actual API
        if isinstance(data, list):
            for item in data:
                route = self._parse_route(item)
                if route:
                    routes.append(route)
        elif isinstance(data, dict) and 'routes' in data:
            for item in data['routes']:
                route = self._parse_route(item)
                if route:
                    routes.append(route)
        
        return routes
    
    def get_bus_locations(self, stop_id: str = None, route_id: str = None) -> List[Bus]:
        """Get real-time bus locations"""
        params = {}
        if stop_id:
            params['stop_id'] = stop_id
        if route_id:
            params['route_id'] = route_id
        
        data = self._make_request('/buses', params)
        if not data:
            return []
        
        buses = []
        # Parse API response and create Bus objects
        if isinstance(data, list):
            for item in data:
                bus = self._parse_bus(item)
                if bus:
                    buses.append(bus)
        elif isinstance(data, dict) and 'buses' in data:
            for item in data['buses']:
                bus = self._parse_bus(item)
                if bus:
                    buses.append(bus)
        
        return buses
    
    def get_schedules(self, route_id: str, stop_id: str = None) -> List[Schedule]:
        """Get schedule information for a route"""
        params = {'route_id': route_id}
        if stop_id:
            params['stop_id'] = stop_id
        
        data = self._make_request('/schedules', params)
        if not data:
            return []
        
        schedules = []
        # Parse API response and create Schedule objects
        if isinstance(data, list):
            for item in data:
                schedule = self._parse_schedule(item)
                if schedule:
                    schedules.append(schedule)
        elif isinstance(data, dict) and 'schedules' in data:
            for item in data['schedules']:
                schedule = self._parse_schedule(item)
                if schedule:
                    schedules.append(schedule)
        
        return schedules
    
    def search_stops(self, query: str) -> List[Stop]:
        """Search for bus stops by name or location"""
        params = {'q': query}
        
        data = self._make_request('/stops/search', params)
        if not data:
            return []
        
        stops = []
        # Parse API response and create Stop objects
        if isinstance(data, list):
            for item in data:
                stop = self._parse_stop(item)
                if stop:
                    stops.append(stop)
        elif isinstance(data, dict) and 'stops' in data:
            for item in data['stops']:
                stop = self._parse_stop(item)
                if stop:
                    stops.append(stop)
        
        return stops
    
    def _parse_route(self, data: dict) -> Optional[Route]:
        """Parse route data from API response"""
        try:
            # Adapt this parsing logic to match your API structure
            route = Route(
                route_id=data.get('route_id', ''),
                origin=data.get('origin', ''),
                destination=data.get('destination', ''),
                duration=timedelta(seconds=data.get('duration_seconds', 0)),
                cost=data.get('cost'),
                transfers=data.get('transfers', 0)
            )
            
            # Parse stops if provided
            if 'stops' in data:
                for stop_data in data['stops']:
                    stop = self._parse_stop(stop_data)
                    if stop:
                        route.add_stop(stop)
            
            return route
        except Exception as e:
            print(f"Error parsing route: {e}")
            return None
    
    def _parse_stop(self, data: dict) -> Optional[Stop]:
        """Parse stop data from API response"""
        try:
            return Stop(
                stop_id=data.get('stop_id', ''),
                name=data.get('name', ''),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                address=data.get('address', '')
            )
        except Exception as e:
            print(f"Error parsing stop: {e}")
            return None
    
    def _parse_schedule(self, data: dict) -> Optional[Schedule]:
        """Parse schedule data from API response"""
        try:
            from ..models.route import Route
            
            route = None
            if 'route_id' in data:
                # Create a minimal route object
                route = Route(route_id=data['route_id'])
            
            stop = None
            if 'stop_id' in data:
                stop = Stop(stop_id=data['stop_id'], name=data.get('stop_name', ''))
            
            schedule = Schedule(route=route, stop=stop)
            
            # Parse departure times
            if 'departure_times' in data:
                for time_str in data['departure_times']:
                    try:
                        # Parse time string (format: HH:MM)
                        parts = time_str.split(':')
                        if len(parts) == 2:
                            t = time(int(parts[0]), int(parts[1]))
                            schedule.add_departure(t)
                    except Exception:
                        continue
            
            # Parse arrival times
            if 'arrival_times' in data:
                for time_str in data['arrival_times']:
                    try:
                        parts = time_str.split(':')
                        if len(parts) == 2:
                            t = time(int(parts[0]), int(parts[1]))
                            schedule.add_arrival(t)
                    except Exception:
                        continue
            
            if 'frequency' in data:
                schedule.frequency = data['frequency']
            
            return schedule
        except Exception as e:
            print(f"Error parsing schedule: {e}")
            return None
    
    def _parse_bus(self, data: dict) -> Optional[Bus]:
        """Parse bus data from API response"""
        try:
            from ..models.route import Route
            from datetime import datetime
            
            route = None
            if 'route_id' in data:
                route = Route(route_id=data['route_id'])
            
            estimated_arrival = None
            if 'estimated_arrival' in data:
                try:
                    # Try parsing ISO format datetime
                    estimated_arrival = datetime.fromisoformat(data['estimated_arrival'])
                except Exception:
                    pass
            
            return Bus(
                bus_id=data.get('bus_id', ''),
                route=route,
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                status=data.get('status', 'unknown'),
                estimated_arrival=estimated_arrival,
                current_stop=data.get('current_stop', ''),
                next_stop=data.get('next_stop', '')
            )
        except Exception as e:
            print(f"Error parsing bus: {e}")
            return None

