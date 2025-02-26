import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReportCrime from "./components/ReportCrime";
import Input from "./components/PlaceSuggestionInput";
import CrimeLocations from "./components/CrimeLocations";
function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/report-crime" element={<ReportCrime /> } />
        <Route path="/crime-locations" element={<CrimeLocations/>}></Route>
      </Routes>
    </Router>
  );
}

export default AppRouter;
