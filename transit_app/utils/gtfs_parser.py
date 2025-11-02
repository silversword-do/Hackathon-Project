"""
GTFS (General Transit Feed Specification) Parser
Downloads and parses GTFS data from transit agencies
"""

import os
import csv
import zipfile
import requests
from typing import List, Dict, Optional, Tuple
from datetime import time, datetime
from pathlib import Path


class GTFSParser:
    """Parser for GTFS data files"""
    
    def __init__(self, gtfs_path: str = None, cache_dir: str = None):
        """
        Initialize GTFS parser
        
        Args:
            gtfs_path: Path to GTFS zip file or extracted directory
            cache_dir: Directory to cache downloaded GTFS data
        """
        self.gtfs_path = gtfs_path
        self.cache_dir = cache_dir or os.path.join(os.path.dirname(__file__), "..", "..", "data", "gtfs_cache")
        self.extracted_path = None
        self._routes: Dict[str, Dict] = {}
        self._stops: Dict[str, Dict] = {}
        self._trips: Dict[str, Dict] = {}
        self._stop_times: List[Dict] = []
        self._calendar: Dict[str, Dict] = {}
    
    def download_gtfs(self, url: str, filename: str = "gtfs.zip") -> str:
        """
        Download GTFS zip file from URL
        
        Args:
            url: URL to GTFS zip file
            filename: Local filename to save
            
        Returns:
            Path to downloaded file
        """
        os.makedirs(self.cache_dir, exist_ok=True)
        filepath = os.path.join(self.cache_dir, filename)
        
        print(f"Downloading GTFS data from {url}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"Downloaded GTFS data to {filepath}")
        return filepath
    
    def extract_gtfs(self, zip_path: str = None) -> str:
        """
        Extract GTFS zip file
        
        Args:
            zip_path: Path to GTFS zip file (uses self.gtfs_path if None)
            
        Returns:
            Path to extracted directory
        """
        if zip_path is None:
            zip_path = self.gtfs_path
        
        if not zip_path or not os.path.exists(zip_path):
            raise FileNotFoundError(f"GTFS file not found: {zip_path}")
        
        extract_path = os.path.join(self.cache_dir, "extracted")
        os.makedirs(extract_path, exist_ok=True)
        
        print(f"Extracting GTFS data from {zip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        self.extracted_path = extract_path
        print(f"Extracted to {extract_path}")
        return extract_path
    
    def load_gtfs_data(self, data_path: str = None) -> None:
        """
        Load all GTFS data files
        
        Args:
            data_path: Path to extracted GTFS directory (uses self.extracted_path if None)
        """
        if data_path is None:
            data_path = self.extracted_path or self.gtfs_path
        
        if data_path is None:
            raise ValueError("No GTFS data path provided")
        
        # If it's a zip file, extract it first
        if data_path.endswith('.zip'):
            data_path = self.extract_gtfs(data_path)
        
        # Load all required GTFS files
        self._load_routes(data_path)
        self._load_stops(data_path)
        self._load_trips(data_path)
        self._load_stop_times(data_path)
        self._load_calendar(data_path)
        
        print(f"Loaded {len(self._routes)} routes, {len(self._stops)} stops, {len(self._trips)} trips")
    
    def _load_routes(self, data_path: str) -> None:
        """Load routes.txt file"""
        routes_file = os.path.join(data_path, "routes.txt")
        if not os.path.exists(routes_file):
            print(f"Warning: routes.txt not found at {routes_file}")
            return
        
        with open(routes_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                route_id = row.get('route_id', '').strip()
                if route_id:
                    self._routes[route_id] = {
                        'route_id': route_id,
                        'route_short_name': row.get('route_short_name', '').strip(),
                        'route_long_name': row.get('route_long_name', '').strip(),
                        'route_type': row.get('route_type', '3'),  # 3 = bus
                        'route_color': row.get('route_color', '').strip(),
                        'route_text_color': row.get('route_text_color', '').strip(),
                        'route_desc': row.get('route_desc', '').strip(),
                    }
    
    def _load_stops(self, data_path: str) -> None:
        """Load stops.txt file"""
        stops_file = os.path.join(data_path, "stops.txt")
        if not os.path.exists(stops_file):
            print(f"Warning: stops.txt not found at {stops_file}")
            return
        
        with open(stops_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stop_id = row.get('stop_id', '').strip()
                if stop_id:
                    try:
                        lat = float(row.get('stop_lat', 0))
                        lon = float(row.get('stop_lon', 0))
                    except (ValueError, TypeError):
                        lat, lon = None, None
                    
                    self._stops[stop_id] = {
                        'stop_id': stop_id,
                        'stop_name': row.get('stop_name', '').strip(),
                        'stop_lat': lat,
                        'stop_lon': lon,
                        'stop_desc': row.get('stop_desc', '').strip(),
                        'zone_id': row.get('zone_id', '').strip(),
                    }
    
    def _load_trips(self, data_path: str) -> None:
        """Load trips.txt file"""
        trips_file = os.path.join(data_path, "trips.txt")
        if not os.path.exists(trips_file):
            print(f"Warning: trips.txt not found at {trips_file}")
            return
        
        with open(trips_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                trip_id = row.get('trip_id', '').strip()
                if trip_id:
                    self._trips[trip_id] = {
                        'trip_id': trip_id,
                        'route_id': row.get('route_id', '').strip(),
                        'service_id': row.get('service_id', '').strip(),
                        'trip_headsign': row.get('trip_headsign', '').strip(),
                        'direction_id': row.get('direction_id', '').strip(),
                        'shape_id': row.get('shape_id', '').strip(),
                    }
    
    def _load_stop_times(self, data_path: str) -> None:
        """Load stop_times.txt file"""
        stop_times_file = os.path.join(data_path, "stop_times.txt")
        if not os.path.exists(stop_times_file):
            print(f"Warning: stop_times.txt not found at {stop_times_file}")
            return
        
        with open(stop_times_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self._stop_times.append({
                    'trip_id': row.get('trip_id', '').strip(),
                    'arrival_time': row.get('arrival_time', '').strip(),
                    'departure_time': row.get('departure_time', '').strip(),
                    'stop_id': row.get('stop_id', '').strip(),
                    'stop_sequence': int(row.get('stop_sequence', 0)),
                })
    
    def _load_calendar(self, data_path: str) -> None:
        """Load calendar.txt file"""
        calendar_file = os.path.join(data_path, "calendar.txt")
        if not os.path.exists(calendar_file):
            print(f"Warning: calendar.txt not found at {calendar_file}")
            return
        
        with open(calendar_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                service_id = row.get('service_id', '').strip()
                if service_id:
                    self._calendar[service_id] = {
                        'service_id': service_id,
                        'monday': row.get('monday', '0') == '1',
                        'tuesday': row.get('tuesday', '0') == '1',
                        'wednesday': row.get('wednesday', '0') == '1',
                        'thursday': row.get('thursday', '0') == '1',
                        'friday': row.get('friday', '0') == '1',
                        'saturday': row.get('saturday', '0') == '1',
                        'sunday': row.get('sunday', '0') == '1',
                        'start_date': row.get('start_date', '').strip(),
                        'end_date': row.get('end_date', '').strip(),
                    }
    
    def get_routes(self) -> Dict[str, Dict]:
        """Get all routes"""
        return self._routes.copy()
    
    def get_stops(self) -> Dict[str, Dict]:
        """Get all stops"""
        return self._stops.copy()
    
    def get_route_stops(self, route_id: str) -> List[Dict]:
        """
        Get all stops for a specific route
        
        Args:
            route_id: Route ID
            
        Returns:
            List of stop dictionaries in order
        """
        # Find all trips for this route
        route_trips = [t for t in self._trips.values() if t['route_id'] == route_id]
        if not route_trips:
            return []
        
        # Get stop sequence from first trip (or merge from all trips)
        trip_id = route_trips[0]['trip_id']
        trip_stop_times = [st for st in self._stop_times if st['trip_id'] == trip_id]
        trip_stop_times.sort(key=lambda x: x['stop_sequence'])
        
        stops = []
        stop_ids_seen = set()
        for st in trip_stop_times:
            stop_id = st['stop_id']
            if stop_id in self._stops and stop_id not in stop_ids_seen:
                stop_info = self._stops[stop_id].copy()
                stop_info['stop_sequence'] = st['stop_sequence']
                stop_info['arrival_time'] = st.get('arrival_time', '')
                stop_info['departure_time'] = st.get('departure_time', '')
                stops.append(stop_info)
                stop_ids_seen.add(stop_id)
        
        return stops
    
    def get_stop_times_for_route(self, route_id: str, stop_id: str = None) -> List[Dict]:
        """
        Get stop times for a route
        
        Args:
            route_id: Route ID
            stop_id: Optional stop ID to filter
            
        Returns:
            List of stop time dictionaries
        """
        # Find all trips for this route
        route_trips = [t['trip_id'] for t in self._trips.values() if t['route_id'] == route_id]
        
        # Get stop times for these trips
        stop_times = [st for st in self._stop_times if st['trip_id'] in route_trips]
        
        if stop_id:
            stop_times = [st for st in stop_times if st['stop_id'] == stop_id]
        
        return stop_times
    
    @staticmethod
    def parse_gtfs_time(time_str: str) -> Optional[time]:
        """
        Parse GTFS time string (HH:MM:SS or H:MM:SS)
        
        Args:
            time_str: Time string in GTFS format
            
        Returns:
            time object or None
        """
        if not time_str:
            return None
        
        try:
            # GTFS times can be > 24 hours (e.g., 25:30:00 for next day)
            parts = time_str.split(':')
            if len(parts) >= 2:
                hours = int(parts[0])
                minutes = int(parts[1])
                seconds = int(parts[2]) if len(parts) > 2 else 0
                
                # Handle times >= 24 hours
                if hours >= 24:
                    hours = hours % 24
                
                return time(hours, minutes, seconds)
        except (ValueError, IndexError):
            pass
        
        return None

