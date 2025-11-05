"""
Bus stop data model - represents a single bus stop location

A Stop object contains all information about a physical bus stop including:
- Identification (ID and name)
- Geographic location (latitude/longitude coordinates)
- Physical address

This model is used throughout the application to represent stops retrieved
from the API, GTFS data, or user searches.
"""

from typing import Optional


class Stop:
    """
    Represents a bus stop location
    
    Stores all relevant information about a physical bus stop:
    - Identification: unique stop ID and human-readable name
    - Location: GPS coordinates (latitude/longitude) for mapping
    - Address: physical street address for display
    
    Coordinates are used for mapping and route planning functionality.
    """
    
    def __init__(self, stop_id: str = None, name: str = None,
                 latitude: float = None, longitude: float = None,
                 address: str = None):
        """
        Initialize a Stop object
        
        Args:
            stop_id: Unique identifier for this stop (e.g., "STOP001")
            name: Human-readable name of the stop (e.g., "Downtown Station")
            latitude: GPS latitude coordinate (float, can be None)
            longitude: GPS longitude coordinate (float, can be None)
            address: Physical street address of the stop
        """
        self.stop_id = stop_id or ""      # Unique stop identifier
        self.name = name or ""            # Display name
        self.latitude = latitude          # GPS latitude (None if unknown)
        self.longitude = longitude        # GPS longitude (None if unknown)
        self.address = address or ""      # Street address
    
    def __repr__(self):
        """
        String representation for debugging
        Returns a formatted string showing stop ID and name
        """
        return f"Stop({self.name}, ID: {self.stop_id})"
    
    def __str__(self):
        """
        String representation for display
        Returns the stop name if available, otherwise the stop ID
        """
        return self.name if self.name else self.stop_id
    
    def has_coordinates(self) -> bool:
        """
        Check if stop has valid coordinates
        
        Verifies that both latitude and longitude are set (not None).
        Used to determine if the stop can be displayed on a map.
        
        Returns:
            True if both latitude and longitude are set, False otherwise
        """
        return self.latitude is not None and self.longitude is not None
    
    def to_dict(self) -> dict:
        """
        Convert stop to dictionary format
        
        Useful for serialization, API responses, or storing in databases.
        Converts the Stop object to a plain dictionary with all attributes.
        
        Returns:
            Dictionary containing all stop information
        """
        return {
            'stop_id': self.stop_id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address
        }

