"""
Mock data for testing without API
Uses OSU GTFS data when available, falls back to sample data
"""

from typing import List
from datetime import datetime, timedelta, time
from ..models.route import Route
from ..models.stop import Stop
from ..models.schedule import Schedule
from ..models.bus import Bus

# Try to import OSU data
try:
    from .osu_data import (
        get_osu_routes_for_origin_destination,
        get_osu_stops,
        search_osu_stops,
        get_osu_schedules,
        load_osu_data
    )
    USE_OSU_DATA = True
except ImportError:
    USE_OSU_DATA = False


# Sample stops
SAMPLE_STOPS = [
    Stop(stop_id="STOP001", name="Downtown Station", latitude=40.7128, longitude=-74.0060, address="123 Main St"),
    Stop(stop_id="STOP002", name="University Campus", latitude=40.7580, longitude=-73.9855, address="456 College Ave"),
    Stop(stop_id="STOP003", name="Shopping Center", latitude=40.7505, longitude=-73.9934, address="789 Mall Blvd"),
    Stop(stop_id="STOP004", name="Airport Terminal", latitude=40.6413, longitude=-73.7781, address="1 Airport Way"),
    Stop(stop_id="STOP005", name="Hospital", latitude=40.7614, longitude=-73.9776, address="321 Medical Dr"),
    Stop(stop_id="STOP006", name="City Park", latitude=40.7829, longitude=-73.9654, address="Park Entrance"),
    Stop(stop_id="STOP007", name="Train Station", latitude=40.7527, longitude=-73.9772, address="Railway Plaza"),
    Stop(stop_id="STOP008", name="Sports Arena", latitude=40.7505, longitude=-73.9934, address="Arena Blvd"),
]


# Sample routes
def get_sample_routes(origin: str, destination: str) -> List[Route]:
    """
    Get routes based on origin and destination
    Uses OSU GTFS data if available, otherwise generates sample routes
    """
    # Try to use OSU data first
    if USE_OSU_DATA:
        try:
            # Try to load OSU data if not already loaded
            load_osu_data()
            osu_routes = get_osu_routes_for_origin_destination(origin, destination)
            if osu_routes:
                return osu_routes
        except Exception as e:
            print(f"Warning: Could not load OSU data, using sample routes: {e}")
    
    # Fallback to sample routes
    routes = []
    
    # Find matching stops or use defaults
    origin_stop = next((s for s in SAMPLE_STOPS if origin.lower() in s.name.lower()), SAMPLE_STOPS[0])
    dest_stop = next((s for s in SAMPLE_STOPS if destination.lower() in s.name.lower()), SAMPLE_STOPS[1])
    
    # Route 1: Direct route
    route1 = Route(
        route_id="ROUTE101",
        origin=origin_stop.name,
        destination=dest_stop.name,
        duration=timedelta(minutes=25),
        cost=2.50,
        transfers=0
    )
    route1.add_stop(origin_stop)
    route1.add_stop(dest_stop)
    routes.append(route1)
    
    # Route 2: With one transfer
    if origin_stop != dest_stop:
        transfer_stop = next((s for s in SAMPLE_STOPS if s not in [origin_stop, dest_stop]), SAMPLE_STOPS[2])
        
        route2 = Route(
            route_id="ROUTE102",
            origin=origin_stop.name,
            destination=dest_stop.name,
            duration=timedelta(minutes=35),
            cost=3.00,
            transfers=1
        )
        route2.add_stop(origin_stop)
        route2.add_stop(transfer_stop)
        route2.add_stop(dest_stop)
        routes.append(route2)
    
    # Route 3: Scenic route (longer)
    route3 = Route(
        route_id="ROUTE103",
        origin=origin_stop.name,
        destination=dest_stop.name,
        duration=timedelta(minutes=45),
        cost=2.50,
        transfers=0
    )
    route3.add_stop(origin_stop)
    route3.add_stop(next((s for s in SAMPLE_STOPS if s.name == "City Park"), SAMPLE_STOPS[5]))
    route3.add_stop(next((s for s in SAMPLE_STOPS if s.name == "Shopping Center"), SAMPLE_STOPS[2]))
    route3.add_stop(dest_stop)
    routes.append(route3)
    
    return routes


def get_sample_buses(stop_id: str = None, route_id: str = None) -> List[Bus]:
    """Generate sample bus locations"""
    buses = []
    now = datetime.now()
    
    # Sample bus data
    sample_bus_data = [
        {
            "bus_id": "BUS001",
            "route_id": "ROUTE101",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "status": "on-time",
            "minutes": 5,
            "current_stop": "Downtown Station",
            "next_stop": "University Campus"
        },
        {
            "bus_id": "BUS002",
            "route_id": "ROUTE101",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "status": "delayed",
            "minutes": 12,
            "current_stop": "Shopping Center",
            "next_stop": "Hospital"
        },
        {
            "bus_id": "BUS003",
            "route_id": "ROUTE102",
            "latitude": 40.7580,
            "longitude": -73.9855,
            "status": "on-time",
            "minutes": 3,
            "current_stop": "University Campus",
            "next_stop": "City Park"
        },
        {
            "bus_id": "BUS004",
            "route_id": "ROUTE103",
            "latitude": 40.7829,
            "longitude": -73.9654,
            "status": "on-time",
            "minutes": 8,
            "current_stop": "City Park",
            "next_stop": "Shopping Center"
        },
    ]
    
    for bus_data in sample_bus_data:
        # Filter by stop_id or route_id if provided
        if stop_id and stop_id not in bus_data["current_stop"]:
            continue
        if route_id and route_id != bus_data["route_id"]:
            continue
        
        from ..models.route import Route
        route = Route(route_id=bus_data["route_id"])
        
        bus = Bus(
            bus_id=bus_data["bus_id"],
            route=route,
            latitude=bus_data["latitude"],
            longitude=bus_data["longitude"],
            status=bus_data["status"],
            estimated_arrival=now + timedelta(minutes=bus_data["minutes"]),
            current_stop=bus_data["current_stop"],
            next_stop=bus_data["next_stop"]
        )
        buses.append(bus)
    
    return buses


def get_sample_schedules(route_id: str, stop_id: str = None) -> List[Schedule]:
    """
    Get schedules for a route
    Uses OSU GTFS data if available, otherwise generates sample schedules
    """
    # Try to use OSU data first
    if USE_OSU_DATA:
        try:
            osu_schedules = get_osu_schedules(route_id, stop_id)
            if osu_schedules:
                return osu_schedules
        except Exception as e:
            print(f"Warning: Could not load OSU schedules, using sample schedules: {e}")
    
    # Fallback to sample schedules
    schedules = []
    
    from ..models.route import Route
    route = Route(route_id=route_id)
    
    # Generate schedule for each stop or specific stop
    stops_to_schedule = [s for s in SAMPLE_STOPS if not stop_id or s.stop_id == stop_id]
    
    for stop in stops_to_schedule:
        schedule = Schedule(route=route, stop=stop, frequency=30)
        
        # Generate departure times (every 30 minutes from 6 AM to 10 PM)
        for hour in range(6, 22):
            for minute in [0, 30]:
                schedule.add_departure(time(hour, minute))
        
        # Generate arrival times (15 minutes after departure)
        for hour in range(6, 22):
            for minute in [15, 45]:
                if minute == 45 and hour == 21:
                    continue  # Skip last arrival
                schedule.add_arrival(time(hour, minute))
        
        schedules.append(schedule)
    
    return schedules


def search_sample_stops(query: str) -> List[Stop]:
    """
    Search stops by query
    Uses OSU GTFS data if available, otherwise searches sample stops
    """
    # Try to use OSU data first
    if USE_OSU_DATA:
        try:
            osu_results = search_osu_stops(query)
            if osu_results:
                return osu_results
        except Exception as e:
            print(f"Warning: Could not search OSU stops, using sample stops: {e}")
    
    # Fallback to sample stops
    query_lower = query.lower()
    results = []
    
    for stop in SAMPLE_STOPS:
        if (query_lower in stop.name.lower() or 
            query_lower in stop.stop_id.lower() or
            query_lower in stop.address.lower()):
            results.append(stop)
    
    # If no results, return all stops
    if not results:
        results = SAMPLE_STOPS[:5]  # Return first 5 as default
    
    return results

