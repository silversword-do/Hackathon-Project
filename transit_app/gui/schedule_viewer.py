"""
Schedule Viewer GUI component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import List
from ..models.schedule import Schedule
from ..api.transit_client import TransitClient


class ScheduleViewer:
    """Schedule viewing interface"""
    
    def __init__(self, parent, transit_client: TransitClient):
        self.transit_client = transit_client
        
        # Create frame
        self.frame = ttk.Frame(parent, padding="10")
        
        # Route selection
        route_frame = ttk.Frame(self.frame)
        route_frame.grid(row=0, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(route_frame, text="Route ID:").pack(side=tk.LEFT, padx=5)
        self.route_id_var = tk.StringVar()
        route_entry = ttk.Entry(route_frame, textvariable=self.route_id_var, width=30)
        route_entry.pack(side=tk.LEFT, padx=5)
        
        # Stop selection (optional)
        ttk.Label(route_frame, text="Stop ID (optional):").pack(side=tk.LEFT, padx=5)
        self.stop_id_var = tk.StringVar()
        stop_entry = ttk.Entry(route_frame, textvariable=self.stop_id_var, width=30)
        stop_entry.pack(side=tk.LEFT, padx=5)
        
        # Search button
        ttk.Button(route_frame, text="View Schedule", command=self._view_schedule).pack(side=tk.LEFT, padx=5)
        
        # Schedule display
        ttk.Label(self.frame, text="Schedule:", font=('Arial', 10, 'bold')).grid(row=1, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        schedule_frame = ttk.Frame(self.frame)
        schedule_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        scrollbar = ttk.Scrollbar(schedule_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.schedule_tree = ttk.Treeview(schedule_frame, columns=('Route', 'Stop', 'Departures', 'Arrivals', 'Frequency'), 
                                          show='tree headings', yscrollcommand=scrollbar.set, height=15)
        self.schedule_tree.heading('#0', text='Schedule ID')
        self.schedule_tree.heading('Route', text='Route')
        self.schedule_tree.heading('Stop', text='Stop')
        self.schedule_tree.heading('Departures', text='Departure Times')
        self.schedule_tree.heading('Arrivals', text='Arrival Times')
        self.schedule_tree.heading('Frequency', text='Frequency (min)')
        
        self.schedule_tree.column('#0', width=120)
        self.schedule_tree.column('Route', width=100)
        self.schedule_tree.column('Stop', width=150)
        self.schedule_tree.column('Departures', width=200)
        self.schedule_tree.column('Arrivals', width=200)
        self.schedule_tree.column('Frequency', width=120)
        
        self.schedule_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.schedule_tree.yview)
        
        # Bind selection event
        self.schedule_tree.bind('<<TreeviewSelect>>', self._on_schedule_select)
        
        # Schedule details area
        details_label = ttk.Label(self.frame, text="Schedule Details:", font=('Arial', 10, 'bold'))
        details_label.grid(row=3, column=0, columnspan=3, sticky=tk.W, pady=(20, 5))
        
        self.details_text = tk.Text(self.frame, height=8, wrap=tk.WORD, state=tk.DISABLED)
        self.details_text.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        details_scrollbar = ttk.Scrollbar(self.frame, command=self.details_text.yview)
        details_scrollbar.grid(row=4, column=3, sticky=(tk.N, tk.S))
        self.details_text.config(yscrollcommand=details_scrollbar.set)
        
        # Store schedules
        self.schedules: List[Schedule] = []
        
        # Configure grid weights
        self.frame.columnconfigure(0, weight=1)
        self.frame.rowconfigure(2, weight=1)
        self.frame.rowconfigure(4, weight=1)
    
    def _view_schedule(self):
        """View schedule for route"""
        route_id = self.route_id_var.get().strip()
        
        if not route_id:
            messagebox.showerror("Error", "Please enter a Route ID")
            return
        
        if not self.transit_client:
            messagebox.showerror("Error", "API client not initialized.")
            return
        
        stop_id = self.stop_id_var.get().strip() or None
        
        # Clear previous results
        for item in self.schedule_tree.get_children():
            self.schedule_tree.delete(item)
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        self.details_text.config(state=tk.DISABLED)
        
        try:
            # Get schedules from API
            self.schedules = self.transit_client.get_schedules(route_id, stop_id=stop_id)
            
            if not self.schedules:
                messagebox.showinfo("No Results", "No schedules found for this route.")
            else:
                # Display schedules
                for i, schedule in enumerate(self.schedules):
                    route_str = schedule.route.route_id if schedule.route else "N/A"
                    stop_str = schedule.stop.name if schedule.stop else schedule.stop.stop_id if schedule.stop else "All Stops"
                    
                    # Format times
                    dep_times = ", ".join([t.strftime('%H:%M') for t in schedule.departure_times[:10]])
                    if len(schedule.departure_times) > 10:
                        dep_times += f" ... (+{len(schedule.departure_times) - 10} more)"
                    
                    arr_times = ", ".join([t.strftime('%H:%M') for t in schedule.arrival_times[:10]])
                    if len(schedule.arrival_times) > 10:
                        arr_times += f" ... (+{len(schedule.arrival_times) - 10} more)"
                    
                    freq_str = str(schedule.frequency) if schedule.frequency else "N/A"
                    
                    schedule_id = f"schedule_{i}"
                    item_id = self.schedule_tree.insert('', tk.END, text=schedule_id,
                                                       values=(route_str, stop_str, dep_times, arr_times, freq_str))
                    self.schedule_tree.set(item_id, 'schedule_index', str(i))
        
        except Exception as e:
            messagebox.showerror("Error", f"Failed to get schedule: {str(e)}")
    
    def _on_schedule_select(self, event):
        """Handle schedule selection"""
        selection = self.schedule_tree.selection()
        if not selection:
            return
        
        item = selection[0]
        try:
            schedule_index = int(self.schedule_tree.set(item, 'schedule_index'))
            if 0 <= schedule_index < len(self.schedules):
                schedule = self.schedules[schedule_index]
                self._show_schedule_details(schedule)
        except (ValueError, IndexError):
            pass
    
    def _show_schedule_details(self, schedule: Schedule):
        """Display schedule details"""
        self.details_text.config(state=tk.NORMAL)
        self.details_text.delete(1.0, tk.END)
        
        details = ""
        if schedule.route:
            details += f"Route: {schedule.route.route_id}\n"
        if schedule.stop:
            details += f"Stop: {schedule.stop.name} ({schedule.stop.stop_id})\n"
        
        if schedule.frequency:
            details += f"Frequency: Every {schedule.frequency} minutes\n"
        
        details += "\nDeparture Times:\n"
        if schedule.departure_times:
            for i, dep_time in enumerate(schedule.departure_times, 1):
                details += f"{i}. {dep_time.strftime('%H:%M')}\n"
        else:
            details += "No departure times available\n"
        
        details += "\nArrival Times:\n"
        if schedule.arrival_times:
            for i, arr_time in enumerate(schedule.arrival_times, 1):
                details += f"{i}. {arr_time.strftime('%H:%M')}\n"
        else:
            details += "No arrival times available\n"
        
        # Show next departure
        next_dep = schedule.get_next_departure()
        if next_dep:
            details += f"\nNext Departure: {next_dep.strftime('%H:%M')}\n"
        
        self.details_text.insert(1.0, details)
        self.details_text.config(state=tk.DISABLED)

