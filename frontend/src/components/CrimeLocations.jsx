import React, { useState } from "react";
import { useEffect,useRef  } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "../firebaseConfig";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import crimeIcon from "../assets/crime.png";
import MyMap from "./MyMap";

const defaultCenter = {
  lat: 18.5004949,
  lng: 73.8529037,
};
const mapContainerStyle = {
  width: "100%",
  height: "500px",
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
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh", borderRadius: "10px" }}
    />
  );
}

export default CrimeLocations;
