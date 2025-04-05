import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import HospitalIcon from "../assets/hospital.png";
import PoliceStationIcon from "../assets/police-station.png";
import UserIcon from "../assets/pin.png"; // Add a custom user icon

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
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
        fetchOSMPlaces(coords);
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Please allow location access to show nearby safety centers.");
      }
    );
  };

  // Fetch places using Overpass API near user's location
  const fetchOSMPlaces = async ({ lat, lng }) => {
    const latMin = lat - 0.02;
    const latMax = lat + 0.02;
    const lonMin = lng - 0.02;
    const lonMax = lng + 0.02;

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](${latMin},${lonMin},${latMax},${lonMax});
        node["amenity"="police"](${latMin},${lonMin},${latMax},${lonMax});
      );
      out body;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await response.json();
      const filtered = data.elements.filter((place) => {
        const distance = haversineDistance(
          lat,
          lng,
          place.lat,
          place.lon
        );
        return distance <= 5; // only within 2km
      });

      setPlaces(filtered);
    } catch (error) {
      console.error("Error fetching OSM data:", error);
      alert("Failed to load hospital/police locations");
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
          {places.map((place, index) => (
            <Marker
              key={index}
              position={{ lat: place.lat, lng: place.lon }}
              icon={{
                url:
                  place.tags.amenity === "hospital"
                    ? HospitalIcon
                    : PoliceStationIcon,
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              title={place.tags.name || place.tags.amenity}
            />
          ))}
        </GoogleMap>
      )}
    </>
  );
}

export default CommunityCenters;
