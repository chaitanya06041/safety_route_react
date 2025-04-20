import React, { useState, useEffect } from "react";
import PlaceSuggestionInput from "./PlaceSuggestionInput";
import SourceIcon from "../assets/pin.png";
import AlterIcon from "../assets/alter.png";
import DestIcon from "../assets/flag.png";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { ThreeDot } from "react-loading-indicators";
import RouteSelection from "./RouteSelection";
const GOOGLE_MAP_API = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s";
import "./Safe.css";
function Safe() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [map, setMap] = useState(null);
  const [polylines, setPolylines] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

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

  const handleCurrentLocation = async () => {
    console.log("Clicked on current location");
    console.log(activeInput);
    if (activeInput == "SOURCE") {
      setSource("CURRENT LOCATION");
    } else if (activeInput == "DESTINATION") {
      setDestination("CURRENT LOCATION");
    }
  };

  const fetchCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(coords);
          resolve(coords);
        },
        (err) => {
          console.error("Error getting location:", err);
          alert("Please allow location access to show nearby safety centers.");
          reject(err);
        }
      );
    });
  };

  const sendSOS = async () => {
    console.log("SOS clicked");
    try {
      const coords = await fetchCurrentLocation(); // Now this waits!

      const response = await axios.post(
        "http://127.0.0.1:5000/send-sos-message",
        {
          lat: coords.lat,
          lng: coords.lng,
          username: "Chaitanya",
        }
      );

      if (response.data.success) {
        alert("WhatsApp SOS sent successfully!");
      }
    } catch (err) {
      console.error("error: ", err);
    }
  };

  const getSafePaths = async (source, destination) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      let sourceCoords, destCoords;
  
      // Convert source
      if (source === "CURRENT LOCATION") {
        sourceCoords = await fetchCurrentLocation(); // Assumes it returns { lat, lng }
      } else {
        const sourceResult = await geocodeAddress(geocoder, source);
        sourceCoords = sourceResult;
      }
  
      // Convert destination
      if (destination === "CURRENT LOCATION") {
        destCoords = await fetchCurrentLocation();
      } else {
        const destResult = await geocodeAddress(geocoder, destination);
        destCoords = destResult;
      }
  
      const response = await axios.post("http://127.0.0.1:5000/get-safe-paths", {
        source_lat: sourceCoords.lat,
        source_lng: sourceCoords.lng,
        dest_lat: destCoords.lat,
        dest_lng: destCoords.lng,
      });
  
      if (response.data.routes && map) {
        setRoutes(response.data.routes);
  
        polylines.forEach((polyline) => polyline.setMap(null));
        markers.forEach((marker) => marker.setMap(null));
        const newPolylines = [];
        const newMarkers = [];
        const bounds = new window.google.maps.LatLngBounds();
  
        const dangerLevels = response.data.routes.map((r) => r.danger);
        const minDanger = Math.min(...dangerLevels);
        const maxDanger = Math.max(...dangerLevels);
  
        response.data.routes.forEach((route) => {
          const pathCoords = route.coordinates.map(([lat, lng]) => {
            const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
            bounds.extend(latLng);
            return latLng;
          });
  
          let strokeColor = "blue";
          if (route.danger === maxDanger) strokeColor = "red";
          else if (route.danger === minDanger) strokeColor = "green";
  
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
  
        // Add markers for first route
        const firstRoute = response.data.routes[0];
        const firstCoords = firstRoute.coordinates;
  
        if (firstCoords.length > 1) {
          const sourceMarker = new window.google.maps.Marker({
            position: {
              lat: parseFloat(firstCoords[0][0]),
              lng: parseFloat(firstCoords[0][1]),
            },
            map,
            label: "S",
            title: "Source",
          });
  
          const destinationMarker = new window.google.maps.Marker({
            position: {
              lat: parseFloat(firstCoords.at(-1)[0]),
              lng: parseFloat(firstCoords.at(-1)[1]),
            },
            map,
            label: "D",
            title: "Destination",
          });
  
          newMarkers.push(sourceMarker, destinationMarker);
        }
  
        map.fitBounds(bounds);
        setPolylines(newPolylines);
        setMarkers(newMarkers);
      }
    } catch (err) {
      console.error("caught error ", err);
    }
  };
  
  const geocodeAddress = (geocoder, address) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject("Geocoding failed: " + status);
        }
      });
    });
  };
  

  const handleSearch = async () => {
    if (source == "" || destination == "") {
      alert("Please enter source and destination");
      return;
    }
    if (source === destination) {
      alert("Source and Destination are same!");
      return;
    }
    console.log(source + " " + destination);

    setClicked(true);
    await getSafePaths(source, destination);
    setClicked(false);
  };

  const changeVal = (evt) => {};

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
              onFocus={() => setActiveInput("SOURCE")}
              onBlur={() => setActiveInput(null)}
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
              onFocus={() => setActiveInput("DESTINATION")}
              onBlur={() => setActiveInput(null)}
            />
          </div>
        </div>

        <div className="btn_section">
          {clicked ? (
            <ThreeDot
              color="#232923"
              size="medium"
              text="Fetching Routes"
              textColor=""
              className="Loader"
            />
          ) : (
            <>
              { activeInput && 
                <Stack spacing={2} direction="row">
                  <Button variant="contained" onMouseDown={handleCurrentLocation}>
                    Use Current Location
                  </Button>
                </Stack>
              }

              <Stack spacing={2} direction="row">
                <Button variant="contained" onClick={handleSearch}>
                  Find Safe Route
                </Button>
              </Stack>
            </>
          )}
        </div>

        <div className="sos_section">
          <Stack spacing={2} direction="row">
            <Button variant="contained" color="error" onClick={sendSOS}>
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

      {routes && (
        <RouteSelection routes={routes} map={map} setPolylines={setPolylines} />
      )}
    </div>
  );
}

export default Safe;
