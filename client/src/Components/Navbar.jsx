import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function Navbar(error, setError) {
    const navigate = useNavigate();
  return (
    <div>
      <nav>
        <button onClick={() => navigate("/register")}>Register</button>
      </nav>
    </div>
  );
}
