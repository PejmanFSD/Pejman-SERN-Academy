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
  userCount,
  setUserCount,
  isAuthChecked,
  isDeleting,
  setIsDeleting,
  // setFlash,
  isProfileEditing,
  // theme,
  // setTheme,
  isCreatingBox,
  setIsCreatingBox
}) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const renderCreateBoxPage = () => {
    setIsCreatingBox(true);
    navigate("/newG5Box");
  };
  // Fetching the total number of the registered users:
  useEffect(() => {
    const fetchUserCount = async () => {
      const res = await fetch("/users/count");
      const data = await res.json();
      setUserCount(data.count);
    };
    fetchUserCount();
  }, []);
  return (
    <div>
      {currentUser && (
        <div>
          Welcome {currentUser.username} - {currentUser.role}!
        </div>
      )}
      <nav>
        <div>
          Number of registered users: <strong>{userCount}</strong>
        </div>
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        {currentUser && currentUser.role === "Admin" && !error && (
          <button onClick={() => navigate("/users")}>All users</button>
        )}
        {currentUser && !error && (
          <button onClick={() => navigate("/profile")}>My Profile</button>
        )}

{currentUser &&
                  location.pathname !== "/newG5Box" &&
                  !isLoggingOut &&
                  !isDeleting &&
                  !isProfileEditing &&
                  // !isAdEditing &&
                  !isCreatingBox &&
                  !error && (
                    <button onClick={renderCreateBoxPage}>Create new G5-Box</button>
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
