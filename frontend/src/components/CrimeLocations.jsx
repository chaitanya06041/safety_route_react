import React, { useState } from "react";
import { useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "../firebaseConfig";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import crimeIcon from "../assets/crime.png";


const defaultCenter = {
  lat: 18.5004949, 
  lng: 73.8529037,
};
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const GOOGLE_MAP_API = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s";

function CrimeLocations() {
  let [crimeData, setCrimeData] = useState([]);
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
    console.log(crimeData);
  };

   useEffect(() => {
    fetchCrimeData();
  }, []);



  return (
    <div>
      <h2>Crime Locations</h2>
      <button onClick={() => console.log(crimeData)}>Click</button>
      <LoadScript googleMapsApiKey={GOOGLE_MAP_API} loading="async" onLoad={() => setIsLoaded(true)}>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={12}>
          </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default CrimeLocations;
