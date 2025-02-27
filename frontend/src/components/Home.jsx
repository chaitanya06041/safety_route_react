import React, { useState } from "react";
import "./Home.css";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
import SourceIcon from "../assets/pin.png";
import AlterIcon from "../assets/alter.png";
import DestIcon from "../assets/flag.png";

function Home() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  function handleSubmit() {
    console.log(`Source: ${source}, Destination: ${destination}`);
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
            />
          </div>
        </div>
        <button onClick={handleSubmit}>Search</button>
      </div>
      <div className="map_section"></div>
    </div>
  );
}

export default Home;
