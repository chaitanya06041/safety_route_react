import React, { useState, useEffect } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyABXrzOdYntmVFt7vHZPMHEtAnvZLr7N-s"; // Replace with your actual API key

const PlaceSuggestionInput = ({
  onLocationSelect,
  value,
  inputClass,
  ulClass,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [service, setService] = useState(null);
  const [validSelection, setValidSelection] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
    setValidSelection(false); // Reset selection when value changes externally
  }, [value]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setService(new window.google.maps.places.AutocompleteService());
    };
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setValidSelection(false); // Reset validation on user typing

    if (newValue.length > 2 && service) {
      service.getPlacePredictions(
        { input: newValue },
        (predictions, status) => {
          if (status === "OK") {
            setSuggestions(predictions || []);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (place) => {
    setInputValue(place.description);
    setSuggestions([]);
    setValidSelection(true); // Mark selection as valid
    onLocationSelect(place.description);
  };

  const handleBlur = () => {
    if (!validSelection) {
      setInputValue(""); // Clear input if user didn't select from suggestions
    }
  };

  return (
    <div style={{position : 'relative'}}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur} // Clear input if user doesn't select from suggestions
        placeholder="Enter crime location"
        className={inputClass}
        style={{
          // width: "100%",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {suggestions.length > 0 && (
        <ul
          className={ulClass}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            listStyle: "none",
            padding: "10px",
            margin: 0,
            border: "1px solid #ccc",
            borderRadius: "4px",
            zIndex: 1000,
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSuggestionInput;
