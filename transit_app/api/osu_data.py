"""
Oklahoma State University (OSU) Bus Route Data
Uses GTFS data from: https://shuttle.okstate.edu/gtfs_google/gtfs.zip
"""

import os
from typing import List, Dict, Optional
from datetime import timedelta, time
from ..models.route import Route
from ..models.stop import Stop
from ..models.schedule import Schedule
from ..utils.gtfs_parser import GTFSParser


# OSU GTFS data URL
OSU_GTFS_URL = "https://shuttle.okstate.edu/gtfs_google/gtfs.zip"

# Cache for parsed data
_gtfs_parser: Optional[GTFSParser] = None
_osu_stops: List[Stop] = []
_osu_routes: List[Route] = []
_osu_schedules: Dict[str, List[Schedule]] = {}


def get_gtfs_parser() -> GTFSParser:
    """Get or create GTFS parser instance"""
    global _gtfs_parser
    
    if _gtfs_parser is None:
        _gtfs_parser = GTFSParser()
        
        # Try to download and load OSU GTFS data
        try:
            gtfs_path = _gtfs_parser.download_gtfs(OSU_GTFS_URL, "osu_gtfs.zip")
            _gtfs_parser.load_gtfs_data(gtfs_path)
        except Exception as e:
            print(f"Warning: Could not load OSU GTFS data: {e}")
            print("Using empty GTFS parser - will return empty data")
    
    return _gtfs_parser


def load_osu_data(force_reload: bool = False) -> None:
    """
    Load OSU bus route data from GTFS
    
    Args:
        force_reload: Force reload even if data is already loaded
    """
    global _osu_stops, _osu_routes, _osu_schedules
    
    if not force_reload and _osu_stops and _osu_routes:
        return
    
    parser = get_gtfs_parser()
    
    # Load stops
    _osu_stops = []
    stops_data = parser.get_stops()
    for stop_id, stop_data in stops_data.items():
        stop = Stop(
            stop_id=stop_id,
            name=stop_data.get('stop_name', stop_id),
            latitude=stop_data.get('stop_lat'),
            longitude=stop_data.get('stop_lon'),
            address=stop_data.get('stop_desc', '')
        )
        _osu_stops.append(stop)
    
    # Load routes
    _osu_routes = []
    routes_data = parser.get_routes()
    stop_dict = {stop.stop_id: stop for stop in _osu_stops}
    
    for route_id, route_data in routes_data.items():
        # Get stops for this route
        route_stops_data = parser.get_route_stops(route_id)
        route_stops = []
        
        for stop_data in route_stops_data:
            stop_id = stop_data['stop_id']
            if stop_id in stop_dict:
                route_stops.append(stop_dict[stop_id])
        
        if not route_stops:
            continue
        
        # Calculate duration estimate (rough estimate: 2 minutes per stop)
        duration_minutes = len(route_stops) * 2
        
        route = Route(
            route_id=route_id,
            origin=route_stops[0].name if route_stops else "",
            destination=route_stops[-1].name if route_stops else "",
            stops=route_stops,
            duration=timedelta(minutes=duration_minutes),
            cost=0.0,  # Free for OSU students/faculty/staff
            transfers=0
        )
        
        # Add route metadata if available
        route_short_name = route_data.get('route_short_name', '')
        route_long_name = route_data.get('route_long_name', '')
        if route_short_name:
            route.origin = f"{route_short_name} Route"
        
        _osu_routes.append(route)
    
    # Load schedules
    _osu_schedules = {}
    for route in _osu_routes:
        route_schedules = []
        route_stop_times = parser.get_stop_times_for_route(route.route_id)
        
        # Group stop times by stop_id
        stop_times_dict: Dict[str, List[Dict]] = {}
        for st in route_stop_times:
            stop_id = st['stop_id']
            if stop_id not in stop_times_dict:
                stop_times_dict[stop_id] = []
            stop_times_dict[stop_id].append(st)
        
        # Create schedules for each stop
        for stop_id, times_list in stop_times_dict.items():
            if stop_id not in stop_dict:
                continue
            
            stop = stop_dict[stop_id]
            schedule = Schedule(route=route, stop=stop)
            
            # Parse arrival and departure times
            arrival_times = set()
            departure_times = set()
            
            for st_data in times_list:
                arrival_str = st_data.get('arrival_time', '')
                departure_str = st_data.get('departure_time', '')
                
                if arrival_str:
                    arrival_time = GTFSParser.parse_gtfs_time(arrival_str)
                    if arrival_time:
                        arrival_times.add(arrival_time)
                
                if departure_str:
                    departure_time = GTFSParser.parse_gtfs_time(departure_str)
                    if departure_time:
                        departure_times.add(departure_time)
            
            # Add times to schedule
            for t in sorted(arrival_times):
                schedule.add_arrival(t)
            for t in sorted(departure_times):
                schedule.add_departure(t)
            
            if schedule.departure_times or schedule.arrival_times:
                route_schedules.append(schedule)
        
        _osu_schedules[route.route_id] = route_schedules
    
    print(f"Loaded {len(_osu_stops)} stops, {len(_osu_routes)} routes, {sum(len(s) for s in _osu_schedules.values())} schedules")


def get_osu_stops() -> List[Stop]:
    """Get all OSU bus stops"""
    if not _osu_stops:
        load_osu_data()
    return _osu_stops.copy()


def get_osu_routes() -> List[Route]:
    """Get all OSU bus routes"""
    if not _osu_routes:
        load_osu_data()
    return _osu_routes.copy()


def get_osu_routes_for_origin_destination(origin: str = None, destination: str = None) -> List[Route]:
    """
    Get OSU routes filtered by origin and/or destination
    
    Args:
        origin: Origin location (optional)
        destination: Destination location (optional)
        
    Returns:
        List of matching routes
    """
    all_routes = get_osu_routes()
    
    if not origin and not destination:
        return all_routes
    
    matching_routes = []
    origin_lower = origin.lower() if origin else ""
    dest_lower = destination.lower() if destination else ""
    
    for route in all_routes:
        route_stop_names = [stop.name.lower() for stop in route.stops]
        
        origin_match = not origin or any(origin_lower in name for name in route_stop_names)
        dest_match = not destination or any(dest_lower in name for name in route_stop_names)
        
        if origin_match and dest_match:
            matching_routes.append(route)
    
    return matching_routes if matching_routes else all_routes[:5]  # Fallback to first 5


def search_osu_stops(query: str) -> List[Stop]:
    """
    Search OSU stops by name or address
    
    Args:
        query: Search query
        
    Returns:
        List of matching stops
    """
    all_stops = get_osu_stops()
    if not query:
        return all_stops[:10]  # Return first 10 if no query
    
    query_lower = query.lower()
    results = []
    
    for stop in all_stops:
        if (query_lower in stop.name.lower() or
            query_lower in stop.address.lower() or
            query_lower in stop.stop_id.lower()):
            results.append(stop)
    
    return results if results else all_stops[:5]  # Fallback to first 5


def get_osu_schedules(route_id: str, stop_id: str = None) -> List[Schedule]:
    """
    Get schedules for an OSU route
    
    Args:
        route_id: Route ID
        stop_id: Optional stop ID to filter
        
    Returns:
        List of schedules
    """
    if not _osu_schedules:
        load_osu_data()
    
    route_schedules = _osu_schedules.get(route_id, [])
    
    if stop_id:
        route_schedules = [s for s in route_schedules if s.stop and s.stop.stop_id == stop_id]
    
    return route_schedules.copy()


def reload_osu_data() -> None:
    """Force reload OSU data from GTFS"""
    global _gtfs_parser
    _gtfs_parser = None
    _osu_stops.clear()
    _osu_routes.clear()
    _osu_schedules.clear()
    load_osu_data(force_reload=True)

