import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import folium
from folium.plugins import HeatMap
from datetime import datetime
import googlemaps
import polyline
import random
from sklearn.model_selection import train_test_split
from crime_route_safety_model import CrimeRouteSafetyModel, get_route_danger

# Set your Google Maps API key here
GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE"

def generate_sample_data(n_samples=1000):
    """Generate sample crime data for Pune if real data isn't available"""
    # Pune boundaries (approximate)
    lat_min, lat_max = 18.45, 18.65
    lon_min, lon_max = 73.75, 73.95
    
    # Generate random coordinates
    lats = np.random.uniform(lat_min, lat_max, n_samples)
    lons = np.random.uniform(lon_min, lon_max, n_samples)
    
    # Generate dates and times (2023-2024)
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2024, 12, 31)
    days_range = (end_date - start_date).days
    
    random_days = np.random.randint(0, days_range, n_samples)
    dates = [start_date + pd.Timedelta(days=d) for d in random_days]
    
    # Format dates and times
    date_strings = [d.strftime('%Y-%m-%d') for d in dates]
    time_strings = [f"{np.random.randint(0, 24):02d}:{np.random.randint(0, 60):02d}:00" for _ in range(n_samples)]
    
    # Crime types with frequency weights
    crime_types = [
        'Theft', 'Robbery', 'Assault', 'Vehicle theft', 'Burglary', 
        'Harassment', 'Drug related', 'Fraud', 'Murder', 'Other'
    ]
    
    crime_weights = [0.3, 0.15, 0.1, 0.15, 0.1, 0.05, 0.05, 0.05, 0.01, 0.04]
    
    # Generate crime types
    generated_crime_types = np.random.choice(crime_types, n_samples, p=crime_weights)
    
    # Create DataFrame
    df = pd.DataFrame({
        'Latitude': lats,
        'Longitude': lons,
        'Date': date_strings,
        'Time': time_strings,
        'Crime Type': generated_crime_types
    })
    
    return df

def initialize_gmaps():
    """Initialize Google Maps client"""
    return googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def visualize_crime_data(crime_data):
    """Create a folium map showing crime data"""
    # Center map on Pune
    pune_center = [18.5204, 73.8567]
    m = folium.Map(location=pune_center, zoom_start=12)
    
    # Create heatmap of crimes
    heat_data = [[row['Latitude'], row['Longitude']] for _, row in crime_data.iterrows()]
    HeatMap(heat_data).add_to(m)
    
    # Add markers for different crime types (limited to 100 for visibility)
    for crime_type in crime_data['Crime Type'].unique():
        subset = crime_data[crime_data['Crime Type'] == crime_type].iloc[:100]
        for _, crime in subset.iterrows():
            folium.CircleMarker(
                location=[crime['Latitude'], crime['Longitude']],
                radius=5,
                popup=f"{crime_type}<br>Date: {crime['Date']}<br>Time: {crime['Time']}",
                color=get_color_for_crime(crime_type),
                fill=True,
                fill_opacity=0.7
            ).add_to(m)
    
    # Save map
    m.save('pune_crime_map.html')
    print("Crime map saved as 'pune_crime_map.html'")
    
    return m

def get_color_for_crime(crime_type):
    """Get a consistent color for each crime type"""
    colors = {
        'Theft': 'blue',
        'Robbery': 'red',
        'Assault': 'darkred',
        'Murder': 'black',
        'Vehicle theft': 'lightblue',
        'Burglary': 'orange',
        'Harassment': 'purple',
        'Drug related': 'green',
        'Fraud': 'lightgreen',
        'Other': 'gray'
    }
    return colors.get(crime_type, 'gray')

def visualize_routes(routes, crime_data, model):
    """Visualize multiple routes with danger scores on a map"""
    # Center map on the first point of the first route
    if routes and routes[0]['coordinates']:
        center = routes[0]['coordinates'][0]
    else:
        center = [18.5204, 73.8567]  # Default Pune center
    
    m = folium.Map(location=center, zoom_start=13)
    
    # Add crime heatmap
    heat_data = [[row['Latitude'], row['Longitude']] for _, row in crime_data.iterrows()]
    HeatMap(heat_data, radius=10).add_to(m)
    
    # Add routes with color based on danger score
    for route in routes:
        danger = route['danger']
        # Color gradient from green (safe) to red (dangerous)
        color = get_color_from_danger(danger)
        
        # Create path
        path = route['coordinates']
        folium.PolyLine(
            path, 
            color=color, 
            weight=5, 
            opacity=0.8,
            popup=f"Danger: {danger:.2f}<br>Distance: {route['distance']}<br>Duration: {route['duration']}"
        ).add_to(m)
        
        # Add start and end markers
        if path:
            folium.Marker(
                path[0], 
                popup="Start", 
                icon=folium.Icon(color='green', icon='play')
            ).add_to(m)
            
            folium.Marker(
                path[-1], 
                popup="End", 
                icon=folium.Icon(color='red', icon='stop')
            ).add_to(m)
    
    # Save map
    m.save('pune_routes_map.html')
    print("Routes map saved as 'pune_routes_map.html'")
    
    return m

def get_color_from_danger(danger_score):
    """Convert danger score to a color (green=safe, red=dangerous)"""
    # Linear interpolation between green (0) and red (1)
    r = min(1.0, danger_score * 2)
    g = min(1.0, 2 - danger_score * 2)
    b = 0.0
    
    # Convert to hex color
    hex_color = "#{:02x}{:02x}{:02x}".format(
        int(r * 255), int(g * 255), int(b * 255)
    )
    
    return hex_color

def evaluate_model(model, test_data):
    """Evaluate model performance on test data"""
    # Extract test locations and actual crime weights
    test_locs = test_data[['Latitude', 'Longitude']].values
    
    # Get time from test data
    test_data = model._preprocess_date_time(test_data.copy())
    
    # Get actual danger scores
    actual_scores = []
    for _, crime in test_data.iterrows():
        crime_weight = model.crime_weights.get(crime['Crime Type'], model.crime_weights['Other'])
        time_weight = model.time_weights.get(crime['TimePeriod'], 0.5)
        actual_scores.append(crime_weight * time_weight)
    
    # Predict danger for each location
    predicted_scores = []
    for i, (lat, lon) in enumerate(test_locs):
        # Generate time string in the format found in the data
        # This handles both formats with and without seconds
        try:
            if 'DateTime' in test_data.columns:
                time_str = test_data['DateTime'].iloc[i].strftime('%Y-%m-%d %H:%M')
            else:
                time_str = f"{test_data['Date'].iloc[i]} {test_data['Time'].iloc[i]}"
                
            predicted = model.predict_point_danger(lat, lon, time_str)
            predicted_scores.append(predicted)
        except Exception as e:
            print(f"Error predicting for point {i}: {e}")
            # Use a default score if prediction fails
            predicted_scores.append(0.5)
    
    # Calculate correlation between actual and predicted
    correlation = np.corrcoef(actual_scores, predicted_scores)[0, 1]
    
    # Plot results
    plt.figure(figsize=(10, 6))
    plt.scatter(actual_scores, predicted_scores, alpha=0.5)
    plt.plot([0, 1], [0, 1], 'r--')
    plt.xlabel('Actual Danger Score')
    plt.ylabel('Predicted Danger Score')
    plt.title(f'Model Evaluation (Correlation: {correlation:.2f})')
    plt.savefig('model_evaluation.png')
    
    print(f"Model evaluation correlation: {correlation:.2f}")
    print("Model evaluation plot saved as 'model_evaluation.png'")

def get_routes_example(start, end, current_time=None, model=None):
    """Example implementation of get_routes using the trained model"""
    gmaps = initialize_gmaps()
    
    directions = gmaps.directions(start, end, alternatives=True)
    routes = []

    for i, route in enumerate(directions):
        path = polyline.decode(route['overview_polyline']['points'])
        danger = get_route_danger(path, model, current_time)

        steps = [
            {
                "instruction": step["html_instructions"],
                "distance": step["distance"]["text"],
                "location": step["end_location"]
            }
            for step in route["legs"][0]["steps"]
        ]

        routes.append({
            'id': i,
            'danger': danger,
            'distance': route['legs'][0]['distance']['text'],
            'duration': route['legs'][0]['duration']['text'],
            'coordinates': path,
            'steps': steps
        })
    return sorted(routes, key=lambda x: x['danger'])

def main():
    # Load crime data (or generate sample data if file doesn't exist)
    try:
        crime_data = pd.read_csv('crime_data_pune.csv')
        print("Loaded crime data from file")
    except FileNotFoundError:
        print("Generating sample crime data...")
        crime_data = generate_sample_data(n_samples=2000)
        crime_data.to_csv('crime_data_pune.csv', index=False)
        print("Sample data saved to 'crime_data_pune.csv'")
    
    # Split data for training and testing
    train_data, test_data = train_test_split(crime_data, test_size=0.2, random_state=42)
    
    # Train or load model
    try:
        model = CrimeRouteSafetyModel().load_model()
        print("Loaded existing model")
    except:
        print("Training new model...")
        model = CrimeRouteSafetyModel().train(train_data)
        model.save_model()
        print("Model training complete")
    
    # Evaluate model on test data
    evaluate_model(model, test_data)
    
    # Visualize crime data
    visualize_crime_data(crime_data)
    
    # Example: Get routes between two points in Pune
    start = "18.5204, 73.8567"  # Example: Pune Station
    end = "18.5502, 73.8767"    # Example: Viman Nagar
    
    current_time = datetime.now()
    
    try:
        # Get routes
        print(f"Finding routes from {start} to {end}...")
        routes = get_routes_example(start, end, current_time, model)
        
        # Visualize routes
        visualize_routes(routes, crime_data, model)
        
        # Print route information
        print(f"\nFound {len(routes)} routes. Showing from safest to most dangerous:")
        
        for i, route in enumerate(routes):
            print(f"\nRoute {i+1}:")
            print(f"Danger Score: {route['danger']:.2f} (lower is safer)")
            print(f"Distance: {route['distance']}")
            print(f"Duration: {route['duration']}")
            print("Steps:")
            for j, step in enumerate(route['steps'][:3]):  # Show first 3 steps
                print(f"- {j+1}. {step['instruction']}: {step['distance']}")
            if len(route['steps']) > 3:
                print(f"- ...and {len(route['steps']) - 3} more steps")
    
    except Exception as e:
        print(f"Error getting routes: {e}")
        print("Note: You need a valid Google Maps API key to get actual routes.")

if __name__ == "__main__":
    main()