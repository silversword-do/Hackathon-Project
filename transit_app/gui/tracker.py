"""
Real-time Bus Tracker GUI component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import List
from ..models.bus import Bus
from ..api.transit_client import TransitClient


class BusTracker:
    """Real-time bus tracking interface"""
    
    def __init__(self, parent, transit_client: TransitClient):
        self.transit_client = transit_client
        self.auto_refresh = False
        self.refresh_job = None
        
        # Create frame
        self.frame = ttk.Frame(parent, padding="10")
        
        # Stop selection
        stop_frame = ttk.Frame(self.frame)
        stop_frame.grid(row=0, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(stop_frame, text="Stop ID:").pack(side=tk.LEFT, padx=5)
        self.stop_id_var = tk.StringVar()
        self.stop_entry = ttk.Entry(stop_frame, textvariable=self.stop_id_var, width=30)
        self.stop_entry.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(stop_frame, text="Search", command=self._search_buses).pack(side=tk.LEFT, padx=5)
        ttk.Button(stop_frame, text="Clear", command=self._clear_search).pack(side=tk.LEFT, padx=5)
        
        # Route filter (optional)
        filter_frame = ttk.Frame(self.frame)
        filter_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(filter_frame, text="Route ID (optional):").pack(side=tk.LEFT, padx=5)
        self.route_id_var = tk.StringVar()
        route_entry = ttk.Entry(filter_frame, textvariable=self.route_id_var, width=30)
        route_entry.pack(side=tk.LEFT, padx=5)
        
        # Auto-refresh toggle
        self.auto_refresh_var = tk.BooleanVar()
        auto_refresh_check = ttk.Checkbutton(filter_frame, text="Auto-refresh (30s)", 
                                             variable=self.auto_refresh_var,
                                             command=self._toggle_auto_refresh)
        auto_refresh_check.pack(side=tk.LEFT, padx=5)
        
        # Refresh button
        self.refresh_button = ttk.Button(filter_frame, text="Refresh Now", command=self._refresh_buses)
        self.refresh_button.pack(side=tk.LEFT, padx=5)
        
        # Bus list
        ttk.Label(self.frame, text="Buses:", font=('Arial', 10, 'bold')).grid(row=2, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        list_frame = ttk.Frame(self.frame)
        list_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.bus_tree = ttk.Treeview(list_frame, columns=('Route', 'Status', 'Arrival', 'Location'), 
                                     show='tree headings', yscrollcommand=scrollbar.set, height=15)
        self.bus_tree.heading('#0', text='Bus ID')
        self.bus_tree.heading('Route', text='Route')
        self.bus_tree.heading('Status', text='Status')
        self.bus_tree.heading('Arrival', text='Estimated Arrival')
        self.bus_tree.heading('Location', text='Location')
        
        self.bus_tree.column('#0', width=120)
        self.bus_tree.column('Route', width=100)
        self.bus_tree.column('Status', width=100)
        self.bus_tree.column('Arrival', width=150)
        self.bus_tree.column('Location', width=200)
        
        self.bus_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.bus_tree.yview)
        
        # Bind selection event
        self.bus_tree.bind('<<TreeviewSelect>>', self._on_bus_select)
        
        # Bus details area
        details_label = ttk.Label(self.frame, text="Bus Details:", font=('Arial', 10, 'bold'))
        details_label.grid(row=4, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        self.details_text = tk.Text(self.frame, height=6, wrap=tk.WORD, state=tk.DISABLED)
        self.details_text.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        details_scrollbar = ttk.Scrollbar(self.frame, command=self.details_text.yview)
        details_scrollbar.grid(row=5, column=3, sticky=(tk.N, tk.S))
        self.details_text.config(yscrollcommand=details_scrollbar.set)
        
        # Store buses
        self.buses: List[Bus] = []
        
        # Configure grid weights
        self.frame.columnconfigure(0, weight=1)
        self.frame.rowconfigure(3, weight=1)
        self.frame.rowconfigure(5, weight=1)
    
    def _search_buses(self):
        """Search for buses"""
        self._refresh_buses()
    
    def _clear_search(self):
        """Clear search filters"""
        self.stop_id_var.set("")
        self.route_id_var.set("")
        for item in self.bus_tree.get_children():
            self.bus_tree.delete(item)
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        self.details_text.config(state=tk.DISABLED)
        self.buses = []
    
    def _refresh_buses(self):
        """Refresh bus list"""
        stop_id = self.stop_id_var.get().strip() or None
        route_id = self.route_id_var.get().strip() or None
        
        if not stop_id and not route_id:
            messagebox.showwarning("Warning", "Please enter at least a Stop ID or Route ID")
            return
        
        if not self.transit_client:
            messagebox.showerror("Error", "API client not initialized.")
            return
        
        # Clear previous results
        for item in self.bus_tree.get_children():
            self.bus_tree.delete(item)
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        self.details_text.config(state=tk.DISABLED)
        
        # Update button state
        self.refresh_button.config(state=tk.DISABLED, text="Refreshing...")
        self.frame.update()
        
        try:
            # Get buses from API
            self.buses = self.transit_client.get_bus_locations(stop_id=stop_id, route_id=route_id)
            
            if not self.buses:
                messagebox.showinfo("No Results", "No buses found.")
            else:
                # Display buses
                for i, bus in enumerate(self.buses):
                    route_str = bus.route.route_id if bus.route else "N/A"
                    location_str = f"({bus.latitude:.4f}, {bus.longitude:.4f})" if bus.has_location() else "Unknown"
                    
                    item_id = self.bus_tree.insert('', tk.END, text=bus.bus_id,
                                                   values=(route_str, bus.status, 
                                                          bus.get_estimated_arrival_string(), location_str))
                    self.bus_tree.set(item_id, 'bus_index', str(i))
        
        except Exception as e:
            messagebox.showerror("Error", f"Failed to get bus locations: {str(e)}")
        
        finally:
            self.refresh_button.config(state=tk.NORMAL, text="Refresh Now")
    
    def _toggle_auto_refresh(self):
        """Toggle auto-refresh functionality"""
        if self.auto_refresh_var.get():
            self._start_auto_refresh()
        else:
            self._stop_auto_refresh()
    
    def _start_auto_refresh(self):
        """Start auto-refresh timer"""
        self.auto_refresh = True
        self._schedule_refresh()
    
    def _stop_auto_refresh(self):
        """Stop auto-refresh timer"""
        self.auto_refresh = False
        if self.refresh_job:
            self.frame.after_cancel(self.refresh_job)
            self.refresh_job = None
    
    def _schedule_refresh(self):
        """Schedule next refresh"""
        if self.auto_refresh:
            stop_id = self.stop_id_var.get().strip() or None
            route_id = self.route_id_var.get().strip() or None
            
            if stop_id or route_id:
                self._refresh_buses()
            
            # Schedule next refresh in 30 seconds
            self.refresh_job = self.frame.after(30000, self._schedule_refresh)
    
    def _on_bus_select(self, event):
        """Handle bus selection"""
        selection = self.bus_tree.selection()
        if not selection:
            return
        
        item = selection[0]
        try:
            bus_index = int(self.bus_tree.set(item, 'bus_index'))
            if 0 <= bus_index < len(self.buses):
                bus = self.buses[bus_index]
                self._show_bus_details(bus)
        except (ValueError, IndexError):
            pass
    
    def _show_bus_details(self, bus: Bus):
        """Display bus details"""
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        
        details = f"Bus ID: {bus.bus_id}\n"
        if bus.route:
            details += f"Route: {bus.route.route_id}\n"
        details += f"Status: {bus.status}\n"
        if bus.estimated_arrival:
            details += f"Estimated Arrival: {bus.estimated_arrival.strftime('%Y-%m-%d %H:%M:%S')}\n"
        details += f"Arrival: {bus.get_estimated_arrival_string()}\n"
        
        if bus.has_location():
            details += f"Location: Latitude {bus.latitude:.6f}, Longitude {bus.longitude:.6f}\n"
        
        if bus.current_stop:
            details += f"Current Stop: {bus.current_stop}\n"
        if bus.next_stop:
            details += f"Next Stop: {bus.next_stop}\n"
        
        details += f"Last Updated: {bus.last_updated.strftime('%Y-%m-%d %H:%M:%S')}\n"
        
        self.details_text.insert(1.0, details)
        self.details_text.config(state=tk.DISABLED)

