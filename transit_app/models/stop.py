"""
Bus stop data model
"""

from typing import Optional


class Stop:
    """Represents a bus stop"""
    
    def __init__(self, stop_id: str = None, name: str = None,
                 latitude: float = None, longitude: float = None,
                 address: str = None):
        self.stop_id = stop_id or ""
        self.name = name or ""
        self.latitude = latitude
        self.longitude = longitude
        self.address = address or ""
    
    def __repr__(self):
        return f"Stop({self.name}, ID: {self.stop_id})"
    
    def __str__(self):
        return self.name if self.name else self.stop_id
    
    def has_coordinates(self) -> bool:
        """Check if stop has valid coordinates"""
        return self.latitude is not None and self.longitude is not None
    
    def to_dict(self) -> dict:
        """Convert stop to dictionary"""
        return {
            'stop_id': self.stop_id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address
        }

