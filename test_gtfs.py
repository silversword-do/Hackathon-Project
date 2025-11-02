"""
Test script to verify GTFS download and parsing for OSU bus routes
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from transit_app.api.osu_data import (
    load_osu_data,
    get_osu_routes,
    get_osu_stops,
    search_osu_stops,
    get_osu_schedules,
    reload_osu_data
)


def test_osu_gtfs():
    """Test OSU GTFS data loading and access"""
    print("=" * 60)
    print("Testing OSU GTFS Data Loading")
    print("=" * 60)
    
    try:
        # Load OSU data
        print("\n1. Loading OSU data from GTFS...")
        load_osu_data()
        print("✓ Data loaded successfully!")
        
        # Get routes
        print("\n2. Getting OSU routes...")
        routes = get_osu_routes()
        print(f"✓ Found {len(routes)} routes")
        
        if routes:
            print("\n   First 5 routes:")
            for route in routes[:5]:
                print(f"   - {route.route_id}: {route.origin} -> {route.destination} ({len(route.stops)} stops)")
        
        # Get stops
        print("\n3. Getting OSU stops...")
        stops = get_osu_stops()
        print(f"✓ Found {len(stops)} stops")
        
        if stops:
            print("\n   First 5 stops:")
            for stop in stops[:5]:
                coords = f"({stop.latitude}, {stop.longitude})" if stop.has_coordinates() else "No coordinates"
                print(f"   - {stop.stop_id}: {stop.name} {coords}")
        
        # Search stops
        print("\n4. Testing stop search...")
        search_results = search_osu_stops("union")
        print(f"✓ Found {len(search_results)} stops matching 'union'")
        for stop in search_results[:3]:
            print(f"   - {stop.name}")
        
        # Get schedules for first route
        if routes:
            print("\n5. Getting schedules for first route...")
            first_route = routes[0]
            schedules = get_osu_schedules(first_route.route_id)
            print(f"✓ Found {len(schedules)} schedules for route {first_route.route_id}")
            
            if schedules:
                print(f"\n   Schedule for stop '{schedules[0].stop.name if schedules[0].stop else 'Unknown'}':")
                deps = schedules[0].departure_times[:5]  # First 5 departures
                if deps:
                    dep_times = [t.strftime("%H:%M") for t in deps]
                    print(f"   Departures: {', '.join(dep_times)}")
        
        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_osu_gtfs()
    sys.exit(0 if success else 1)

