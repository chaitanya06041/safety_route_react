import React from "react";
import "./RouteSelection.css";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useState } from "react";

function RouteSelection({ routes, map, setPolylines }) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const handleRadioChange = (event) => {
    setSelectedRouteIndex(parseInt(event.target.value));
  };

  const handleSelect = () => {
    if (selectedRouteIndex === null || !map) {
      alert("Please select a route");
      return;
    }

    const selectedRoute = routes[selectedRouteIndex];

    // Clear all existing polylines
    setPolylines((prevPolylines) => {
      prevPolylines.forEach((polyline) => polyline.setMap(null));
      return [];
    });

    const pathCoords = selectedRoute.coordinates.map((coord) => ({
      lat: parseFloat(coord[0]),
      lng: parseFloat(coord[1]),
    }));

    let strokeColor = "green";
    if (selectedRoute.danger > 12000) strokeColor = "red";
    else if (selectedRoute.danger > 1000) strokeColor = "blue";

    const newPolyline = new window.google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });

    newPolyline.setMap(map);
    setPolylines([newPolyline]);

    console.log("Selected Route:", selectedRoute);
  };

  return (
    <div className="RouteSelection">
      {routes && routes.length > 0 ? (
        <>
          <h2>Select Route</h2>
          <div className="all-routes">
            {routes.map((route, index) => (
              <div key={index} className="route-card">
                <input
                  type="radio"
                  name="route"
                  value={index}
                  onChange={handleRadioChange}
                  checked={selectedRouteIndex === index}
                ></input>
                <div className="route-info">
                  <h3>Route {index + 1}</h3>
                  <p style={{ color: "red" }}>
                    danger level : {Math.round(route.danger)}
                  </p>
                  <p>Distance: {route.distance}</p>
                  <p>Time: {route.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="btn">
            <Stack spacing={2} direction="row">
              <Button variant="contained" onClick={handleSelect}>Select Route</Button>
            </Stack>
          </div>
        </>
      ) : (
        <p>No routes found</p>
      )}
      {selectedRouteIndex !== null && (
        <p>Selected Route: Route {selectedRouteIndex + 1}</p>
      )}
    </div>
  );
}

export default RouteSelection;
