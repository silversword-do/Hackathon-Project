"""
Route Planner GUI component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import List
from ..models.route import Route
from ..api.transit_client import TransitClient


class RoutePlanner:
    """Route planning interface"""
    
    def __init__(self, parent, transit_client: TransitClient):
        self.transit_client = transit_client
        
        # Create frame
        self.frame = ttk.Frame(parent, padding="10")
        
        # Origin input
        ttk.Label(self.frame, text="Origin:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.origin_var = tk.StringVar()
        self.origin_entry = ttk.Entry(self.frame, textvariable=self.origin_var, width=40)
        self.origin_entry.grid(row=0, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # Destination input
        ttk.Label(self.frame, text="Destination:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.dest_var = tk.StringVar()
        self.dest_entry = ttk.Entry(self.frame, textvariable=self.dest_var, width=40)
        self.dest_entry.grid(row=1, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # Search button
        self.search_button = ttk.Button(self.frame, text="Search Routes", command=self._search_routes)
        self.search_button.grid(row=2, column=1, pady=10)
        
        # Results area
        ttk.Label(self.frame, text="Route Options:", font=('Arial', 10, 'bold')).grid(row=3, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        # Create results treeview
        results_frame = ttk.Frame(self.frame)
        results_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        scrollbar = ttk.Scrollbar(results_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.results_tree = ttk.Treeview(results_frame, columns=('Duration', 'Transfers', 'Cost'), 
                                         show='tree headings', yscrollcommand=scrollbar.set, height=15)
        self.results_tree.heading('#0', text='Route')
        self.results_tree.heading('Duration', text='Duration')
        self.results_tree.heading('Transfers', text='Transfers')
        self.results_tree.heading('Cost', text='Cost')
        
        self.results_tree.column('#0', width=400)
        self.results_tree.column('Duration', width=100)
        self.results_tree.column('Transfers', width=80)
        self.results_tree.column('Cost', width=80)
        
        self.results_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.results_tree.yview)
        
        # Bind selection event
        self.results_tree.bind('<<TreeviewSelect>>', self._on_route_select)
        
        # Route details area
        details_label = ttk.Label(self.frame, text="Route Details:", font=('Arial', 10, 'bold'))
        details_label.grid(row=5, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        self.details_text = tk.Text(self.frame, height=8, wrap=tk.WORD, state=tk.DISABLED)
        self.details_text.grid(row=6, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        details_scrollbar = ttk.Scrollbar(self.frame, command=self.details_text.yview)
        details_scrollbar.grid(row=6, column=3, sticky=(tk.N, tk.S))
        self.details_text.config(yscrollcommand=details_scrollbar.set)
        
        # Store routes
        self.routes: List[Route] = []
        
        # Configure grid weights
        self.frame.columnconfigure(1, weight=1)
        self.frame.rowconfigure(4, weight=1)
        self.frame.rowconfigure(6, weight=1)
    
    def _search_routes(self):
        """Search for routes"""
        origin = self.origin_var.get().strip()
        destination = self.dest_var.get().strip()
        
        if not origin or not destination:
            messagebox.showerror("Error", "Please enter both origin and destination")
            return
        
        if not self.transit_client:
            messagebox.showerror("Error", "API client not initialized. Please configure API key in Settings.")
            return
        
        # Clear previous results
        for item in self.results_tree.get_children():
            self.results_tree.delete(item)
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        self.details_text.config(state=tk.DISABLED)
        
        # Update button state
        self.search_button.config(state=tk.DISABLED, text="Searching...")
        self.frame.update()
        
        try:
            # Get routes from API
            self.routes = self.transit_client.get_routes(origin, destination)
            
            if not self.routes:
                messagebox.showinfo("No Results", "No routes found. Please check your inputs or try again.")
            else:
                # Display routes
                for i, route in enumerate(self.routes):
                    route_name = f"{route.origin} → {route.destination}"
                    cost_str = f"${route.cost:.2f}" if route.cost else "N/A"
                    
                    item_id = self.results_tree.insert('', tk.END, text=route_name,
                                                      values=(route.get_duration_string(), 
                                                              route.transfers, cost_str))
                    # Store route reference (as string since treeview needs string)
                    self.results_tree.set(item_id, 'route_index', str(i))
        
        except Exception as e:
            messagebox.showerror("Error", f"Failed to search routes: {str(e)}")
        
        finally:
            self.search_button.config(state=tk.NORMAL, text="Search Routes")
    
    def _on_route_select(self, event):
        """Handle route selection"""
        selection = self.results_tree.selection()
        if not selection:
            return
        
        item = selection[0]
        try:
            route_index = int(self.results_tree.set(item, 'route_index'))
            if 0 <= route_index < len(self.routes):
                route = self.routes[route_index]
                self._show_route_details(route)
        except (ValueError, IndexError):
            pass
    
    def _show_route_details(self, route: Route):
        """Display route details"""
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        
        details = f"Route ID: {route.route_id}\n"
        details += f"Origin: {route.origin}\n"
        details += f"Destination: {route.destination}\n"
        details += f"Duration: {route.get_duration_string()}\n"
        details += f"Transfers: {route.transfers}\n"
        if route.cost:
            details += f"Cost: ${route.cost:.2f}\n"
        details += "\nStops:\n"
        
        if route.stops:
            for i, stop in enumerate(route.stops, 1):
                details += f"{i}. {stop.name} ({stop.stop_id})\n"
        else:
            details += "No stops information available\n"
        
        self.details_text.insert(1.0, details)
        self.details_text.config(state=tk.DISABLED)

