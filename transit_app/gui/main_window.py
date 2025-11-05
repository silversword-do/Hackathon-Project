"""
Main application window - Top-level GUI container for the desktop application

This module provides the MainWindow class, which is the main container for the
entire desktop application. It:
- Creates and manages the Tkinter root window
- Sets up the menu bar (File, View, Help)
- Creates a tabbed interface with three tabs:
  - Route Planner: Find routes between locations
  - Bus Tracker: Track real-time bus locations
  - Schedule Viewer: View bus schedules
- Manages API configuration and client initialization
- Provides a status bar showing API configuration status
- Handles settings dialog for API configuration

The MainWindow coordinates all GUI components and provides the API client
instance to each tab, allowing them to make transit API calls.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from ..api.transit_client import TransitClient
from ..api.config import APIConfig
from .route_planner import RoutePlanner
from .tracker import BusTracker
from .schedule_viewer import ScheduleViewer


class MainWindow:
    """
    Main application window with tabbed interface
    
    This class is the central coordinator for the desktop GUI application. It:
    - Manages the main window appearance and layout
    - Initializes the API client and configuration
    - Creates and manages three functional tabs
    - Provides menu bar with File, View, and Help menus
    - Shows status bar with API configuration information
    - Handles settings dialog for API key configuration
    
    The window uses a Notebook widget (tabbed interface) to organize the
    three main features of the application.
    """
    
    def __init__(self, root: tk.Tk):
        """
        Initialize the main application window
        
        Sets up all GUI components, loads configuration, and initializes
        the API client. Creates the menu bar, tabbed interface, and status bar.
        
        Args:
            root: Tkinter root window (created in main.py)
        """
        self.root = root
        self.root.title("Bus Transit App")  # Window title
        self.root.geometry("900x700")        # Initial window size (width x height)
        self.root.resizable(True, True)       # Allow window resizing
        
        # Initialize API configuration and client
        # APIConfig loads settings from config.ini if it exists
        self.api_config = APIConfig()
        self.transit_client = None  # Will be initialized after config loads
        
        # Create menu bar (File, View, Help menus)
        self._create_menu()
        
        # Create main container frame with padding
        main_container = ttk.Frame(root, padding="10")
        main_container.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        # Configure grid to expand container with window
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        
        # Create tabbed interface (Notebook widget)
        # Notebook provides tabs that users can click to switch views
        self.notebook = ttk.Notebook(main_container)
        self.notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        # Make notebook expand with container
        main_container.columnconfigure(0, weight=1)
        main_container.rowconfigure(0, weight=1)
        
        # Initialize API client with configuration
        # This determines if we use real API or mock data
        self._initialize_api_client()
        
        # Create the three tab components
        # Each tab receives the transit_client so it can make API calls
        self.route_planner = RoutePlanner(self.notebook, self.transit_client)
        self.bus_tracker = BusTracker(self.notebook, self.transit_client)
        self.schedule_viewer = ScheduleViewer(self.notebook, self.transit_client)
        
        # Add tabs to the notebook with labels
        self.notebook.add(self.route_planner.frame, text="Route Planner")
        self.notebook.add(self.bus_tracker.frame, text="Bus Tracker")
        self.notebook.add(self.schedule_viewer.frame, text="Schedule Viewer")
        
        # Create status bar at bottom of window
        # Shows API configuration status (configured/not configured)
        self.status_bar = ttk.Label(root, text="Ready", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.grid(row=1, column=0, sticky=(tk.W, tk.E))
        
        # Update status bar to show current API configuration state
        self._update_status()
    
    def _create_menu(self):
        """
        Create menu bar with File, View, and Help menus
        
        Sets up the traditional menu bar at the top of the window with:
        - File menu: Settings dialog and Exit option
        - View menu: Refresh functionality
        - Help menu: About dialog with app information
        """
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu - Application settings and exit
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Settings", command=self._show_settings)  # Opens API config dialog
        file_menu.add_separator()  # Visual separator
        file_menu.add_command(label="Exit", command=self.root.quit)  # Closes application
        
        # View menu - Refresh and view options
        view_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="View", menu=view_menu)
        view_menu.add_command(label="Refresh All", command=self._refresh_all)  # Refresh all tabs
        
        # Help menu - Information about the application
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=self._show_about)  # Shows app version/info
    
    def _initialize_api_client(self):
        """
        Initialize transit API client
        
        Creates a TransitClient instance using the loaded API configuration.
        The client will use real API calls if configured, or mock data if not.
        Displays a warning in the status bar if API is not configured.
        """
        try:
            # Create TransitClient with current configuration
            self.transit_client = TransitClient(self.api_config)
            
            # Warn user if API is not configured (will use mock data)
            if not self.api_config.is_configured():
                self.status_bar.config(text="Warning: API not configured. Please set API key in Settings.")
        except Exception as e:
            # Show error dialog if initialization fails
            messagebox.showerror("Error", f"Failed to initialize API client: {e}")
            self.transit_client = None
    
    def _update_status(self):
        """
        Update status bar with API configuration status
        
        Changes the status bar text and color based on whether the API
        is properly configured. Green = configured, Orange = not configured.
        """
        if self.api_config.is_configured():
            self.status_bar.config(text="API Configured - Ready", foreground="green")
        else:
            self.status_bar.config(text="API Not Configured - Please set API key in Settings", foreground="orange")
    
    def _show_settings(self):
        """
        Show settings dialog for API configuration
        
        Creates a modal dialog window where users can enter their API key and URL.
        The settings are saved to config.ini and the API client is reinitialized
        with the new credentials.
        """
        # Create modal dialog window (blocks interaction with main window)
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Settings")
        settings_window.geometry("500x200")
        settings_window.resizable(False, False)
        
        # API Key input field
        ttk.Label(settings_window, text="API Key:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        api_key_var = tk.StringVar(value=self.api_config.get_api_key() or "")
        # show="*" masks the API key input for security
        api_key_entry = ttk.Entry(settings_window, textvariable=api_key_var, width=50, show="*")
        api_key_entry.grid(row=0, column=1, padx=10, pady=10)
        
        # API URL input field
        ttk.Label(settings_window, text="API URL:").grid(row=1, column=0, padx=10, pady=10, sticky=tk.W)
        api_url_var = tk.StringVar(value=self.api_config.get_api_url() or "")
        api_url_entry = ttk.Entry(settings_window, textvariable=api_url_var, width=50)
        api_url_entry.grid(row=1, column=1, padx=10, pady=10)
        
        def save_settings():
            """
            Save API settings to config.ini
            
            Validates input, saves to configuration file, and reinitializes
            the API client with new credentials. Updates all tabs with new client.
            """
            api_key = api_key_var.get().strip()
            api_url = api_url_var.get().strip()
            
            # Validate that both fields are filled
            if not api_key:
                messagebox.showerror("Error", "API key cannot be empty")
                return
            
            if not api_url:
                messagebox.showerror("Error", "API URL cannot be empty")
                return
            
            # Save API key to configuration
            self.api_config.set_api_key(api_key)
            
            # Ensure [API] section exists and save URL
            if not self.api_config.config.has_section('API'):
                self.api_config.config.add_section('API')
            self.api_config.config.set('API', 'api_url', api_url)
            
            # Write configuration to file
            if self.api_config.save_config():
                # Reinitialize API client with new credentials
                self._initialize_api_client()
                
                # Update transit client reference in all tabs
                # This allows tabs to immediately use the new API client
                self.route_planner.transit_client = self.transit_client
                self.bus_tracker.transit_client = self.transit_client
                self.schedule_viewer.transit_client = self.transit_client
                
                # Update status bar to reflect new configuration
                self._update_status()
                
                messagebox.showinfo("Success", "Settings saved successfully")
                settings_window.destroy()
            else:
                messagebox.showerror("Error", "Failed to save settings")
        
        # Create button frame with Save and Cancel buttons
        button_frame = ttk.Frame(settings_window)
        button_frame.grid(row=2, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=save_settings).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=settings_window.destroy).pack(side=tk.LEFT, padx=5)
    
    def _refresh_all(self):
        """
        Refresh all tabs
        
        Updates the status bar and shows a confirmation message.
        Note: Individual tabs handle their own refresh logic when needed.
        """
        self._update_status()
        messagebox.showinfo("Info", "All tabs refreshed")
    
    def _show_about(self):
        """
        Show about dialog with application information
        
        Displays version number, features, and development information
        in a modal dialog window.
        """
        about_text = """Bus Transit App v1.0.0
        
A desktop application for bus transit information.
Features:
- Route Planning
- Real-time Bus Tracking
- Schedule Viewing

Developed for Hack OKState Hackathon"""
        messagebox.showinfo("About", about_text)

