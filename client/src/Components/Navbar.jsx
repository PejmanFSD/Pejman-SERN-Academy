import { useEffect } from "react";

import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function Navbar({
  error,
  setError,
  currentUser,
  setCurrentUser,
  isLoggingOut,
  setIsLoggingOut,
  users,
  setUsers,
}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    setIsLoggingOut(true);
  };
  const handleLogoutYes = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
      const json = await response.json();
      if (!response.ok) {
        // setFlash(json.error || "Logout failed");
        return;
      }
      setCurrentUser(null);
      // setFlash(json.message);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      // setFlash("Network error during logout");
    }
    setIsLoggingOut(false);
  };
  const handleLogoutNo = () => {
    setIsLoggingOut(false);
  };
  return (
    <div>
      {currentUser && (
        <div>
          Welcome {currentUser.username} - {currentUser.role}!
        </div>
      )}
      <nav>
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={handleLogout}>Logout</button>

        {currentUser && currentUser.role === "Admin" && !error && (
          <button onClick={() => navigate("/users")}>All users</button>
        )}

        {isLoggingOut && (
          <div>
            <div>Are you sure you want to logout?</div>
            <div>
              <button onClick={handleLogoutYes}>Yes</button>
              <button onClick={handleLogoutNo}>No</button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
