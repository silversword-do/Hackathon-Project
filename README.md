# Bus Transit Application

A desktop bus transit application built with Python and tkinter for Hack OKState Hackathon.

## Features

- **Route Planning**: Find routes from origin to destination with multiple options
- **Real-time Bus Tracking**: Track buses in real-time with location and arrival estimates
- **Schedule Viewing**: View bus schedules by route and stop

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone or download this repository

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

### Configuration

1. Open `config.ini` and add your transit API credentials:
```ini
[API]
api_key = YOUR_API_KEY_HERE
api_url = https://api.example.com/transit
provider = default
```

2. Replace `YOUR_API_KEY_HERE` with your actual API key
3. Update `api_url` with your transit API endpoint URL

### Running the Application

From the project root directory, run:

```bash
python -m transit_app.main
```

Or if you have a script:

```bash
python transit_app/main.py
```

### Using the Application

1. **Configure API**: Go to File > Settings and enter your API key and URL
2. **Route Planning**: 
   - Select "Route Planner" tab
   - Enter origin and destination
   - Click "Search Routes"
   - Select a route to view details
3. **Bus Tracking**:
   - Select "Bus Tracker" tab
   - Enter Stop ID or Route ID
   - Click "Search" to view buses
   - Enable auto-refresh for live updates
4. **Schedule Viewing**:
   - Select "Schedule Viewer" tab
   - Enter Route ID
   - Optionally enter Stop ID
   - Click "View Schedule"

## Project Structure

```
Hackathone-Project/
├── transit_app/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── gui/                 # GUI components
│   │   ├── main_window.py   # Main window
│   │   ├── route_planner.py # Route planning UI
│   │   ├── tracker.py       # Bus tracking UI
│   │   └── schedule_viewer.py # Schedule UI
│   ├── api/                 # API integration
│   │   ├── api_adapter.py   # Abstract API interface
│   │   ├── transit_client.py # API client
│   │   └── config.py        # API configuration
│   ├── models/              # Data models
│   │   ├── route.py         # Route model
│   │   ├── stop.py          # Stop model
│   │   ├── schedule.py      # Schedule model
│   │   └── bus.py           # Bus model
│   └── utils/               # Utility functions
│       └── helpers.py
├── config.ini               # API configuration
├── requirements.txt          # Dependencies
└── README.md                # This file
```

## API Integration

The application uses an adapter pattern to support different transit APIs. The `TransitClient` class handles API communication and can be adapted to work with various transit API providers.

### API Response Format

The application expects API responses in the following format (adapt as needed):

**Routes** (`/routes`):
```json
{
  "routes": [
    {
      "route_id": "123",
      "origin": "Location A",
      "destination": "Location B",
      "duration_seconds": 1800,
      "cost": 2.50,
      "transfers": 0,
      "stops": [...]
    }
  ]
}
```

**Buses** (`/buses`):
```json
{
  "buses": [
    {
      "bus_id": "BUS001",
      "route_id": "123",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "status": "on-time",
      "estimated_arrival": "2024-01-01T12:30:00",
      "current_stop": "Stop A",
      "next_stop": "Stop B"
    }
  ]
}
```

**Schedules** (`/schedules`):
```json
{
  "schedules": [
    {
      "route_id": "123",
      "stop_id": "STOP001",
      "departure_times": ["08:00", "08:30", "09:00"],
      "arrival_times": ["08:15", "08:45", "09:15"],
      "frequency": 30
    }
  ]
}
```

You may need to modify the parsing methods in `transit_client.py` to match your specific API format.

## Troubleshooting

- **API not configured**: Make sure you've entered your API key in Settings (File > Settings)
- **No results found**: Check that your API endpoints are correct and the API key is valid
- **Import errors**: Make sure you're running from the project root directory

## Development

This project was developed for the Hack OKState Hackathon by:
- Alex Rockwood
- Tristan Stuart
- Ahmed Kulac
- Nicolas Cooper

## License

This project is for educational/hackathon purposes.
