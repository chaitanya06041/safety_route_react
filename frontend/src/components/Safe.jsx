import React, { useState, useEffect } from "react";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
import SourceIcon from "../assets/pin.png";
import AlterIcon from "../assets/alter.png";
import DestIcon from "../assets/flag.png";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
const GOOGLE_MAP_API = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s";
import './Safe.css'
function Safe() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [map, setMap] = useState(null);
    const [polylines, setPolylines] = useState([]);

  
    useEffect(() => {
      if (window.google) {
        setMap(
          new window.google.maps.Map(document.getElementById("map"), {
            center: { lat: 18.5204, lng: 73.8567 }, // Default center (Pune)
            zoom: 12,
          })
        );
      }
    }, []);

    const handleAlter = () => {
      let temp = source;
      setSource(destination);
      setDestination(temp);
    };

    const getSafePaths = async (source, destination) => {
        try {
          const response = await axios.post("http://127.0.0.1:5000/get-safe-paths", {
            source: source,
            destination: destination,
          });
      
          if (response.data.routes && map) {
            console.log(response.data.routes);
            
            // Clear previous polylines
            polylines.forEach((polyline) => polyline.setMap(null));
            const newPolylines = [];
      
            response.data.routes.forEach((route) => {
                const pathCoords = route["coordinates"].map((coord) => ({
                    lat: parseFloat(coord[0]),
                    lng: parseFloat(coord[1]),
                  })); // assuming list of {lat, lng}
              const dangerLevel = route["danger"];
      
              // Determine color based on danger
              let strokeColor = "green";
              if (dangerLevel > 12000) strokeColor = "red";
              else if (dangerLevel > 1000) strokeColor = "blue";
      
              const polyline = new window.google.maps.Polyline({
                path: pathCoords,
                geodesic: true,
                strokeColor,
                strokeOpacity: 1.0,
                strokeWeight: 4,
              });
      
              polyline.setMap(map);
              newPolylines.push(polyline);
            });
      
            setPolylines(newPolylines);
          }
        } catch (err) {
          console.error("caught error ", err);
        }
      };
      


    const handleSearch = async() => {
        if(source == "" || destination == "") {
            alert("Please enter source and destination");
            return;
        }
        await getSafePaths(source, destination);
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
              />
            </div>
          </div>
  
          <div className="btn_section">
            <Stack spacing={2} direction="row">
              <Button variant="contained" onClick={handleSearch}>
                Find Safe Route
              </Button>
            </Stack>
          </div>
  
          <div className="sos_section">
            <Stack spacing={2} direction="row">
              <Button
                variant="contained"
                color="error"
              >
                SOS
              </Button>
            </Stack>
          </div>
        </div>
        <div className="map_section">
          <div
            id="map"
            //   style={{ width: "100%", height: "500px", marginTop: "10px" }}
          ></div>
        </div>
      </div>
    );
}

export default Safe
