import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Home";
import Register from "./Components/users/Register";
import Login from "./Components/users/Login";
import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await fetch("/current-user", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to restore user");
      } finally {
        setIsAuthChecked(true);
      }
    };
    restoreUser();
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                error={error}
                setError={setError}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                isLoggingOut={isLoggingOut}
                setIsLoggingOut={setIsLoggingOut}
              />
            }
          />
          <Route
            path="/register"
            element={<Register error={error} setError={setError} />}
          />
          <Route
            path="/login"
            element={
              <Login
                error={error}
                setError={setError}
                setCurrentUser={setCurrentUser}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
