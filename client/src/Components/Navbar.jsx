import { useEffect } from "react";

import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function Navbar({error, setError, currentUser, setCurrentUser}) {
    const navigate = useNavigate();
  return (
    <div>
      {currentUser && <div>Welcome {currentUser.username}!</div>}
      <nav>
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
      </nav>
    </div>
  );
}
