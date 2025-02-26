import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../firebaseConfig";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import crimeIcon from "../assets/warning.png";
import HospitalIcon from '../assets/hospital.png'
import PoliceStationIcon from '../assets/police-station.png'

const defaultCenter = {
  lat: 18.5004949,
  lng: 73.8529037,
};
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

function CommunityCenters() {
  const [centers, setCenters] = useState([]);
  const mapRef = useRef(null);

  const fetchCenters = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "safe-routes/community-centers");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      setCenters(Object.values(snapshot.val()));
    } else {
      alert("Error finding data");
    }
    console.log(crimeData);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter, 
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
        {centers.map((center, index) => (
          <Marker
            key={index}
            position={{
              lat: center.Co_ordinates.latitude,
              lng: center.Co_ordinates.longitude,
            }}
            icon={{
              url: center.Type == 'hospital' ? HospitalIcon : PoliceStationIcon,
              scaledSize: new window.google.maps.Size(30, 30), // Resize the icon
            }}
          />
        ))}
      </GoogleMap>
    );
}

export default CommunityCenters;
