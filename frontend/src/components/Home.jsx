import React, { useState } from "react";
import "./Home.css";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
import SourceIcon from "../assets/pin.png";
import AlterIcon from "../assets/alter.png";
import DestIcon from "../assets/flag.png";

function Home() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState({});
  const [activeInput, setActiveInput] = useState("");

  function handleSubmit() {
    console.log(`Source: ${source}, Destination: ${destination}`);
    console.log(
      `Current Location: ${currentLocation.latitude}  ${currentLocation.longitude}`
    );
  }

  async function handleCurrentLocation() {
    if (navigator.geolocation) {
      // what to do if supported
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // what to do once we have the position
          const { latitude, longitude } = position.coords;
          setCurrentLocation({latitude, longitude});
          if (activeInput === "source") {
            setSource(`${currentLocation.latitude}, ${currentLocation.longitude}`);
          } else if (activeInput === "destination") {
            setDestination(`${currentLocation.latitude}, ${currentLocation.longitude}`);
          }
        },
        (error) => {
          // display an error if we cant get the users position
          console.error("Error getting user location:", error);
        }
      );
    } else {
      // display an error if not supported
      console.error("Geolocation is not supported by this browser.");
    }
  }

  function handleAlter() {
    let temp = source;
    setSource(destination);
    setDestination(temp);
  }

  return (
    <div className="home">
      <div className="input_section">
        <div className="input_row">
          <div className="input_field">
            <img src={SourceIcon} alt="Source Icon" />
            <PlaceSuggestionInput
              value={source}
              onLocationSelect={(place) => setSource(place)}
              inputClass="inputs"
              ulClass="suggestions-dropdown"
              placeholder="Enter Source"
              onFocus={() => setActiveInput("source")}
            />
          </div>

          <div className="alter_icon" onClick={handleAlter}>
            <img src={AlterIcon} alt="Switch Icon" />
          </div>

          <div className="input_field">
            <img src={DestIcon} alt="Destination Icon" />
            <PlaceSuggestionInput
              value={destination}
              onLocationSelect={(place) => setDestination(place)}
              inputClass="inputs"
              ulClass="suggestions-dropdown"
              placeholder="Enter Destination"
              onFocus={() => setActiveInput("destination")}
            />
          </div>
        </div>
        {activeInput && ( // Show button only if an input field is active
          <button onClick={handleCurrentLocation}>Current Location</button>
        )}
        <button onClick={handleSubmit}>Search</button>
      </div>
      <div className="map_section"></div>
    </div>
  );
}

export default Home;
