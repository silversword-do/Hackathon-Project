"""
Helper utility functions
"""

from datetime import datetime, time, timedelta
from typing import Optional


def format_time(dt: datetime) -> str:
    """Format datetime as readable time string"""
    if not dt:
        return ""
    return dt.strftime("%H:%M")


def format_duration(seconds: int) -> str:
    """Format duration in seconds as human-readable string"""
    if seconds < 60:
        return f"{seconds}s"
    
    minutes = seconds // 60
    hours = minutes // 60
    minutes = minutes % 60
    
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def validate_address(address: str) -> bool:
    """Basic address validation"""
    if not address or len(address.strip()) < 3:
        return False
    return True


def parse_time_string(time_str: str) -> Optional[time]:
    """Parse time string (HH:MM or HH:MM:SS) to time object"""
    try:
        parts = time_str.split(':')
        if len(parts) == 2:
            return time(int(parts[0]), int(parts[1]))
        elif len(parts) == 3:
            return time(int(parts[0]), int(parts[1]), int(parts[2]))
    except (ValueError, IndexError):
        return None
    return None

