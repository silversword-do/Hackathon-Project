"""
Main application entry point
"""

import tkinter as tk
import sys
from transit_app.gui.main_window import MainWindow


def main():
    """Main application entry point"""
    root = tk.Tk()
    app = MainWindow(root)
    root.mainloop()


if __name__ == "__main__":
    main()

