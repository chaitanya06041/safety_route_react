import React, { useState } from "react";
import "./ReportCrime.css";
import app from "../firebaseConfig";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
function ReportCrime() {
  const [crimeLocation, setCrimeLocation] = useState("");
  const [crimeType, setCrimeType] = useState("murder"); // Default value
  const [selectedLocation, setSelectedLocation] = useState("");

  function handleLocationChange(e) {
    setCrimeLocation(e.target.value);
  }

  function handleCrimeType(e) {
    setCrimeType(e.target.value);
  }

  async function handleSubmit() {
    if (!crimeLocation.trim()) {
      alert("Please enter a valid location.");
      return;
    }
    if (!selectedLocation) {
      alert("Please select a valid location.");
      return;
    }
    console.log(`Location: ${crimeLocation}, Crime Type: ${crimeType}`);

    const db = getDatabase(app);
    const crimeRef = ref(db, "safe-routes/crime-locations");

    try {
      // Query to check if location already exists
      const locationQuery = query(
        crimeRef,
        orderByChild("Location"),
        equalTo(crimeLocation)
      );
      const snapshot = await get(locationQuery);

      if (snapshot.exists()) {
        let existingKey = null;
        let crimeData = {};

        snapshot.forEach((child) => {
          existingKey = child.key;
          crimeData = child.val().Crimes || {};
        });

        // Increment existing crime count or initialize it
        crimeData[crimeType] = (crimeData[crimeType] || 0) + 1;

        // Update existing record
        await set(
          ref(db, `safe-routes/crime-locations/${existingKey}/Crimes`),
          crimeData
        );
      } else {
        // Create a new location entry
        const newDocRef = push(crimeRef);
        await set(newDocRef, {
          Location: crimeLocation,
          Crimes: { [crimeType]: 1 },
        });
      }

      setCrimeLocation("");
      alert("Data saved successfully!");
    } catch (error) {
      setCrimeLocation("");
      alert(error.message);
    }
    console.log(`Location: ${crimeLocation}, Crime Type: ${crimeType}`);
  }

  return (
    <div className="report_crime">
      <h2>Report Crime</h2>

      <label>Crime Location:</label>
      <PlaceSuggestionInput
        onLocationSelect={(location) => {
          setCrimeLocation(location);
          setSelectedLocation(location); // Ensure only selected locations are allowed
        }}
        value={crimeLocation}
        inputClass='crime_input'
        ulClass='crime_input'
      />

      <label>Crime Type:</label>
      <select value={crimeType} onChange={handleCrimeType}>
        <option value="murder">Murder</option>
        <option value="rape">Rape</option>
        <option value="kidnapping">Kidnapping</option>
        <option value="robbery">Robbery</option>
      </select>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default ReportCrime;
