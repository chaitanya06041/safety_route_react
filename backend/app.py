from flask import Flask, request, jsonify
import requests
# from geopy.distance import geodesic
from flask_cors import CORS
import pandas as pd
import temp
import get_routes
import polyline
from twilio.rest import Client
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

# Load Firebase credentials from the service account key JSON file

GOOGLE_MAPS_API_KEY = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s"



@app.route('/get-crime-locations', methods=['POST'])
def get_crime_locationss():
    filtered_df = temp.get_crime_locations()
    # filtered_df = pd.read_csv('crime_data_pune.csv')
    filtered_df['Time'] = filtered_df['Time'].apply(lambda t: t.strftime('%H:%M'))
    return jsonify({
        "status": "success",
        "data": filtered_df.to_dict(orient='records')
    })


@app.route('/get-community-centers', methods=["POST"])
def get_nearby_places():
    data = request.get_json()
    user_lat = data.get("lat")
    user_lng = data.get("lng")
    radius = 3000  # in meters (5km)

    if not user_lat or not user_lng:
        return jsonify({"status": "error", "message": "Missing coordinates"}), 400

    places = []
    for place_type in ["hospital", "police"]:
        url = (
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            f"?location={user_lat},{user_lng}"
            f"&radius={radius}"
            f"&type={place_type}"
            f"&key={GOOGLE_MAPS_API_KEY}"
        )

        response = requests.get(url)
        data = response.json()

        if data.get("status") == "OK":
            for result in data["results"]:
                places.append({
                    "name": result["name"],
                    "type": place_type,
                    "lat": float(result["geometry"]["location"]["lat"]),
                    "lng": float(result["geometry"]["location"]["lng"])
                })

    return jsonify({"status": "success", "places": places})


@app.route('/get-safe-paths', methods = ['POST'])
def get_safe_paths():
    data = request.json
    source = data['source']
    destination = data['destination']
    print(source, destination)

    if not source or not destination:
        return jsonify({"error": "Source and destination are not present"}), 400
    
    routes = get_routes.get_routes(source, destination)   
    return jsonify({'routes': routes})

@app.route('/send-sos-message', methods = ["POST"])
def send_whatsapp_message():
    data = request.json
    userLatitude = data['lat']
    userLongitude = data['lng']
    username = data['username']
    loclink = f"https://www.google.com/maps?q={userLatitude},{userLongitude}"
    msg = f"SOS Alert {username} is at this location.\n{loclink}"
    #Fetch Twilio account details from .env
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
    TO_WHATSAPP_NUMBER = os.getenv("TO_WHATSAPP_NUMBER")
    print("Twilio: ",TWILIO_ACCOUNT_SID)
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        from_=TWILIO_WHATSAPP_NUMBER,
        body=msg,
        to=TO_WHATSAPP_NUMBER
    )
    print("Whatsapp message sent to ")
    print(msg)
    print(TO_WHATSAPP_NUMBER)
    return jsonify({'success': 'success'})

if __name__ == '__main__':
    # get_crime_locations()
    app.run(debug=True)