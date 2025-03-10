from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
import requests
from geopy.distance import geodesic
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Load Firebase credentials from the service account key JSON file
cred = credentials.Certificate("./safety-route-a61c3-firebase-adminsdk-fbsvc-2fba397ea2.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://safety-route-a61c3-default-rtdb.asia-southeast1.firebasedatabase.app/'
})
GOOGLE_MAPS_API_KEY = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s"

def get_crime_locations():
    ref = db.reference('safe-routes/crime-locations')  # Adjust if your data path is different
    crime_data = ref.get()
    
    crime_locations = []
    if crime_data:
        for crime_id, crime_info in crime_data.items():
            lat = crime_info["Co_ordinates"]["latitude"]
            lng = crime_info["Co_ordinates"]["longitude"]
            crime_locations.append((lat, lng))
    
    
    return crime_locations

def is_near_crime(lat, lng, crime_locations):
    for crime in crime_locations:
        if geodesic((lat, lng), crime).meters < 200:
            return True
    return False


@app.route('/safe-route', methods=['POST'])
def get_safe_route():
    data = request.json
    print(data)
    source = data['source']['latitude'], data['source']['longitude']  # (lat, lng)
    destination = data['destination']['latitude'], data['destination']['longitude']  # (lat, lng)
    print(source, destination)

    # Fetch crime locations from Firebase
    crime_locations = get_crime_locations()
    # crime_locations = []

    # Call Google Directions API to get possible routes
    directions_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={source[0]},{source[1]}&destination={destination[0]},{destination[1]}&key={GOOGLE_MAPS_API_KEY}"
    response = requests.get(directions_url)
    routes = response.json().get('routes', [])

    # Filter out routes that pass near crime locations
    safe_routes = []
    for route in routes:
        is_safe = True
        for leg in route['legs']:
            for step in leg['steps']:
                lat = step['start_location']['lat']
                lng = step['start_location']['lng']
                if is_near_crime(lat, lng, crime_locations):
                    is_safe = False
                    break
            if not is_safe:
                break
        if is_safe:
            safe_routes.append(route)

    return jsonify({"safe_routes": safe_routes})

if __name__ == '__main__':
    get_crime_locations()
    app.run(debug=True)