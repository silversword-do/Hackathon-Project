"""
Main application entry point for the Bus Transit App

This is the starting point of the desktop application. It creates the main
Tkinter window and initializes the MainWindow GUI component which provides
the tabbed interface for route planning, bus tracking, and schedule viewing.

Flow:
    1. Python interpreter runs this file
    2. main() function creates Tkinter root window
    3. MainWindow is instantiated with the root window
    4. MainWindow sets up the GUI with tabs and API client
    5. root.mainloop() starts the event loop, keeping app running
"""

import tkinter as tk
import sys
from transit_app.gui.main_window import MainWindow


def main():
    """
    Main application entry point
    
    Creates the Tkinter root window and initializes the MainWindow GUI component.
    The mainloop() call starts the GUI event loop, which keeps the application
    running and responsive to user interactions.
    """
    # Create the root Tkinter window - this is the main application window
    root = tk.Tk()
    
    # Initialize the MainWindow GUI component which contains all tabs and functionality
    app = MainWindow(root)
    
    # Start the GUI event loop - this blocks until the window is closed
    # All user interactions (clicks, keyboard, etc.) are handled here
    root.mainloop()


if __name__ == "__main__":
    # Only run if this file is executed directly (not imported as a module)
    main()

