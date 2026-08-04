import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";

export default function Home({ error, setError, currentUser, setCurrentUser }) {
  return (
    <div>
      <h1>Pejman SERN Academy</h1>
      <Navbar
        error={error}
        setError={setError}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}
