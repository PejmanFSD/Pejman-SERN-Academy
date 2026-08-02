import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Home";
import Register from "./Components/users/Register";
import "./App.css";

export default function App() {
  const [error, setError] = useState(null);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home error={error} setError={setError} />}
          />
          <Route
            path="/register"
            element={<Register error={error} setError={setError} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
