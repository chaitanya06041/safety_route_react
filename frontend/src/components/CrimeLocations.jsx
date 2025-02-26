import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { getDatabase, ref, get } from "firebase/database";
import {app} from "../firebaseConfig";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import crimeIcon from "../assets/warning.png";

const defaultCenter = {
  lat: 18.5004949,
  lng: 73.8529037,
};
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

function CrimeLocations() {
  const [crimeData, setCrimeData] = useState([]);
  const mapRef = useRef(null);

  const fetchCrimeData = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "safe-routes/crime-locations");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      setCrimeData(Object.values(snapshot.val()));
    } else {
      alert("Error finding data");
    }
    console.log(crimeData);
  };

  useEffect(() => {
    fetchCrimeData();
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter, // Default: San Francisco
        zoom: 13,
      });
    }
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={13}
    >
      {crimeData.map((crime, index) => (
        <Marker
          key={index}
          position={{
            lat: crime.Co_ordinates.latitude,
            lng: crime.Co_ordinates.longitude,
          }}
          icon={{
            url: crimeIcon,
            scaledSize: new window.google.maps.Size(30, 30), // Resize the icon
          }}
        />
      ))}
    </GoogleMap>
  );
}

export default CrimeLocations;
