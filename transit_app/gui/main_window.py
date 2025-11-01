"""
Main application window
"""

import tkinter as tk
from tkinter import ttk, messagebox
from ..api.transit_client import TransitClient
from ..api.config import APIConfig
from .route_planner import RoutePlanner
from .tracker import BusTracker
from .schedule_viewer import ScheduleViewer


class MainWindow:
    """Main application window with tabbed interface"""
    
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Bus Transit App")
        self.root.geometry("900x700")
        self.root.resizable(True, True)
        
        # Initialize API configuration and client
        self.api_config = APIConfig()
        self.transit_client = None
        
        # Create menu bar
        self._create_menu()
        
        # Create main container
        main_container = ttk.Frame(root, padding="10")
        main_container.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        
        # Create tabbed interface
        self.notebook = ttk.Notebook(main_container)
        self.notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        main_container.columnconfigure(0, weight=1)
        main_container.rowconfigure(0, weight=1)
        
        # Initialize API client
        self._initialize_api_client()
        
        # Create tabs
        self.route_planner = RoutePlanner(self.notebook, self.transit_client)
        self.bus_tracker = BusTracker(self.notebook, self.transit_client)
        self.schedule_viewer = ScheduleViewer(self.notebook, self.transit_client)
        
        self.notebook.add(self.route_planner.frame, text="Route Planner")
        self.notebook.add(self.bus_tracker.frame, text="Bus Tracker")
        self.notebook.add(self.schedule_viewer.frame, text="Schedule Viewer")
        
        # Create status bar
        self.status_bar = ttk.Label(root, text="Ready", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.grid(row=1, column=0, sticky=(tk.W, tk.E))
        
        self._update_status()
    
    def _create_menu(self):
        """Create menu bar"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Settings", command=self._show_settings)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
        # View menu
        view_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="View", menu=view_menu)
        view_menu.add_command(label="Refresh All", command=self._refresh_all)
        
        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=self._show_about)
    
    def _initialize_api_client(self):
        """Initialize transit API client"""
        try:
            self.transit_client = TransitClient(self.api_config)
            if not self.api_config.is_configured():
                self.status_bar.config(text="Warning: API not configured. Please set API key in Settings.")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to initialize API client: {e}")
            self.transit_client = None
    
    def _update_status(self):
        """Update status bar"""
        if self.api_config.is_configured():
            self.status_bar.config(text="API Configured - Ready", foreground="green")
        else:
            self.status_bar.config(text="API Not Configured - Please set API key in Settings", foreground="orange")
    
    def _show_settings(self):
        """Show settings dialog for API configuration"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Settings")
        settings_window.geometry("500x200")
        settings_window.resizable(False, False)
        
        # API Key input
        ttk.Label(settings_window, text="API Key:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        api_key_var = tk.StringVar(value=self.api_config.get_api_key() or "")
        api_key_entry = ttk.Entry(settings_window, textvariable=api_key_var, width=50, show="*")
        api_key_entry.grid(row=0, column=1, padx=10, pady=10)
        
        # API URL input
        ttk.Label(settings_window, text="API URL:").grid(row=1, column=0, padx=10, pady=10, sticky=tk.W)
        api_url_var = tk.StringVar(value=self.api_config.get_api_url() or "")
        api_url_entry = ttk.Entry(settings_window, textvariable=api_url_var, width=50)
        api_url_entry.grid(row=1, column=1, padx=10, pady=10)
        
        def save_settings():
            """Save API settings"""
            api_key = api_key_var.get().strip()
            api_url = api_url_var.get().strip()
            
            if not api_key:
                messagebox.showerror("Error", "API key cannot be empty")
                return
            
            if not api_url:
                messagebox.showerror("Error", "API URL cannot be empty")
                return
            
            self.api_config.set_api_key(api_key)
            if not self.api_config.config.has_section('API'):
                self.api_config.config.add_section('API')
            self.api_config.config.set('API', 'api_url', api_url)
            
            if self.api_config.save_config():
                self._initialize_api_client()
                # Update transit client in all tabs
                self.route_planner.transit_client = self.transit_client
                self.bus_tracker.transit_client = self.transit_client
                self.schedule_viewer.transit_client = self.transit_client
                self._update_status()
                messagebox.showinfo("Success", "Settings saved successfully")
                settings_window.destroy()
            else:
                messagebox.showerror("Error", "Failed to save settings")
        
        # Buttons
        button_frame = ttk.Frame(settings_window)
        button_frame.grid(row=2, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=save_settings).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=settings_window.destroy).pack(side=tk.LEFT, padx=5)
    
    def _refresh_all(self):
        """Refresh all tabs"""
        self._update_status()
        messagebox.showinfo("Info", "All tabs refreshed")
    
    def _show_about(self):
        """Show about dialog"""
        about_text = """Bus Transit App v1.0.0
        
A desktop application for bus transit information.
Features:
- Route Planning
- Real-time Bus Tracking
- Schedule Viewing

Developed for Hack OKState Hackathon"""
        messagebox.showinfo("About", about_text)

