import React, { useState } from "react";
import { useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "../firebaseConfig";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import crimeIcon from "../assets/crime.png";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 18.5004949, // Default to San Francisco (Change if needed)
  lng: 73.8529037,
};

const GOOGLE_MAP_API = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s";
function CrimeLocations() {
  let [crimeData, setCrimeData] = useState([]);
  let [co_ordinates, setCo_ordinates] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCrimeData = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "safe-routes/crime-locations");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      setCrimeData(Object.values(snapshot.val()));
    } else {
      alert("Error finding data");
    }
  };
  const getCoOrdinates = async () => {
    const geoCodedLocations = [];
    for (const crime of crimeData) {
      if (!crime.Location) {
        console.log(crime);
        continue;
      }
      let address = crime.Location;
      console.log(address);
      address = address.split(", ").join('+');
      address = address.split(" ").join('+');
      console.log("up: ", address);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAP_API}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        geoCodedLocations.push({ lat, lng, location: crime.Location });
      } 
      else {
        console.error(`Geocoding failed for ${crime.Location}:`, data.status);
      }

    }
    setCo_ordinates(geoCodedLocations);
  };
   useEffect(() => {
    fetchCrimeData();
  }, []);

  useEffect(() => {
    if (crimeData.length > 0) {
      getCoOrdinates();
    }
  }, [crimeData]);


  return (
    <div>
      <h2>Crime Locations</h2>
      <LoadScript googleMapsApiKey={GOOGLE_MAP_API} onLoad={() => setIsLoaded(true)}>
        {isLoaded && (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={12}>
            {co_ordinates.map((coord, index) => (
              <Marker
                key={index}
                position={{ lat: coord.lat, lng: coord.lng }}
                icon={{
                  url: crimeIcon,
                  scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null,
                }}
              />
            ))}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
}

export default CrimeLocations;
