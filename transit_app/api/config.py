"""
API configuration management
"""

import configparser
import os
from typing import Optional


class APIConfig:
    """Manages API configuration from config.ini file"""
    
    def __init__(self, config_file: str = "config.ini"):
        self.config_file = config_file
        self.config = configparser.ConfigParser()
        self.load_config()
    
    def load_config(self) -> bool:
        """Load configuration from file"""
        if os.path.exists(self.config_file):
            self.config.read(self.config_file)
            return True
        return False
    
    def get_api_key(self) -> Optional[str]:
        """Get API key from configuration"""
        try:
            api_key = self.config.get('API', 'api_key', fallback=None)
            if api_key and api_key != 'YOUR_API_KEY_HERE':
                return api_key
        except (configparser.NoSectionError, configparser.NoOptionError):
            pass
        return None
    
    def get_api_url(self) -> Optional[str]:
        """Get API URL from configuration"""
        try:
            return self.config.get('API', 'api_url', fallback=None)
        except (configparser.NoSectionError, configparser.NoOptionError):
            return None
    
    def get_provider(self) -> str:
        """Get API provider name"""
        try:
            return self.config.get('API', 'provider', fallback='default')
        except (configparser.NoSectionError, configparser.NoOptionError):
            return 'default'
    
    def set_api_key(self, api_key: str) -> bool:
        """Set API key in configuration"""
        try:
            if not self.config.has_section('API'):
                self.config.add_section('API')
            self.config.set('API', 'api_key', api_key)
            return True
        except Exception:
            return False
    
    def save_config(self) -> bool:
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                self.config.write(f)
            return True
        except Exception:
            return False
    
    def is_configured(self) -> bool:
        """Check if API is properly configured"""
        api_key = self.get_api_key()
        return api_key is not None and api_key != 'YOUR_API_KEY_HERE'

