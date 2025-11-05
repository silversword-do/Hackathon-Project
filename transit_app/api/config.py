"""
API configuration management - handles reading and writing API settings

This module manages the application's API configuration stored in a config.ini file.
It provides a centralized way to:
- Load API credentials (key, URL, provider) from disk
- Save new API configuration
- Validate that configuration is properly set
- Check if API is ready to use

The configuration is stored in INI format in the project root directory.
Users can configure the API through the GUI Settings dialog, which uses this class.
"""

import configparser
import os
from typing import Optional


class APIConfig:
    """
    Manages API configuration from config.ini file
    
    This class handles all interaction with the configuration file that stores
    API credentials and settings. It uses Python's configparser to read/write
    INI format files.
    
    Configuration file structure:
        [API]
        api_key = your_api_key_here
        api_url = https://api.example.com
        provider = default
    
    The class provides methods to:
    - Load existing configuration from file
    - Get individual configuration values
    - Set and save new configuration values
    - Validate that configuration is complete
    """
    
    def __init__(self, config_file: str = "config.ini"):
        """
        Initialize the configuration manager
        
        Args:
            config_file: Path to the configuration file (default: "config.ini" in project root)
        """
        self.config_file = config_file           # Path to config file
        self.config = configparser.ConfigParser()  # Parser for INI format
        self.load_config()                        # Automatically load existing config
    
    def load_config(self) -> bool:
        """
        Load configuration from file
        
        Reads the configuration file from disk if it exists. If the file doesn't
        exist or can't be read, the configuration will be empty and can be set
        later through the Settings dialog.
        
        Returns:
            True if config file exists and was loaded, False otherwise
        """
        if os.path.exists(self.config_file):
            self.config.read(self.config_file)
            return True
        return False  # File doesn't exist yet - will be created when saving
    
    def get_api_key(self) -> Optional[str]:
        """
        Get API key from configuration
        
        Retrieves the API authentication key from the configuration file.
        Validates that it's not just the placeholder value.
        
        Returns:
            API key string if valid, None if not set or is placeholder
        """
        try:
            api_key = self.config.get('API', 'api_key', fallback=None)
            # Ignore placeholder values that haven't been set
            if api_key and api_key != 'YOUR_API_KEY_HERE':
                return api_key
        except (configparser.NoSectionError, configparser.NoOptionError):
            # Section or option doesn't exist in config file
            pass
        return None
    
    def get_api_url(self) -> Optional[str]:
        """
        Get API URL from configuration
        
        Retrieves the base API endpoint URL from the configuration file.
        
        Returns:
            API URL string if set, None if not configured
        """
        try:
            return self.config.get('API', 'api_url', fallback=None)
        except (configparser.NoSectionError, configparser.NoOptionError):
            # Section or option doesn't exist
            return None
    
    def get_provider(self) -> str:
        """
        Get API provider name from configuration
        
        Retrieves the provider identifier (useful if supporting multiple APIs).
        Returns 'default' if not specified.
        
        Returns:
            Provider name string, or 'default' if not set
        """
        try:
            return self.config.get('API', 'provider', fallback='default')
        except (configparser.NoSectionError, configparser.NoOptionError):
            return 'default'
    
    def set_api_key(self, api_key: str) -> bool:
        """
        Set API key in configuration
        
        Updates the API key in memory. Call save_config() to persist to disk.
        Automatically creates the [API] section if it doesn't exist.
        
        Args:
            api_key: The API key to store
        
        Returns:
            True if successful, False on error
        """
        try:
            # Create [API] section if it doesn't exist
            if not self.config.has_section('API'):
                self.config.add_section('API')
            self.config.set('API', 'api_key', api_key)
            return True
        except Exception:
            return False
    
    def save_config(self) -> bool:
        """
        Save configuration to file
        
        Writes the current configuration (including any changes made with set_api_key)
        to the config.ini file. Creates the file if it doesn't exist.
        
        Returns:
            True if successful, False on error (e.g., permission denied)
        """
        try:
            with open(self.config_file, 'w') as f:
                self.config.write(f)
            return True
        except Exception:
            return False  # Couldn't write file (permissions, disk full, etc.)
    
    def is_configured(self) -> bool:
        """
        Check if API is properly configured
        
        Validates that the API key has been set and is not just a placeholder.
        This is used to determine whether to make real API calls or use mock data.
        
        Returns:
            True if API key is set and valid, False otherwise
        """
        api_key = self.get_api_key()
        return api_key is not None and api_key != 'YOUR_API_KEY_HERE'

