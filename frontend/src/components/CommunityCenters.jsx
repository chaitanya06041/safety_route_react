import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import HospitalIcon from "../assets/hospital.png";
import PoliceStationIcon from "../assets/police-station.png";
import UserIcon from "../assets/pin.png"; // Add a custom user icon

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

function CommunityCenters() {
  const [places, setPlaces] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Fetch user's location
  const fetchCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(coords);
        fetchNearbyPlaces(coords);
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Please allow location access to show nearby safety centers.");
      }
    );
  };

  const fetchNearbyPlaces = async ({ lat, lng }) => {
    try {
      const response = await fetch(
        "http://localhost:5000/get-community-centers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setPlaces(data.places);
        console.log(data.places);
      } else {
        alert("Failed to fetch community centers.");
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return (
    <>
      {currentLocation && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={14}
        >
          {/* User Marker */}
          <Marker
            position={currentLocation}
            icon={{
              url: UserIcon,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title="You are here"
          />

          {/* Community Centers within 2km */}
          {places.map((place, index) => {
            const lat = Number(place.lat);
            const lng = Number(place.lng);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn("Invalid LatLng:", place); // Optional: for debugging
              return null;
            }

            return (
              <Marker
              key={index}
              position={{ lat, lng }}
              icon={{
                url:
                  place.type === "hospital"
                    ? HospitalIcon
                    : PoliceStationIcon,
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              title={place.name || place.type}
            />
            );
          })}
        </GoogleMap>
      )}
    </>
  );
}

export default CommunityCenters;
