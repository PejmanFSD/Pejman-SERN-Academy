import Navbar from "./Components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Footer from "./Components/Footer";

export default function Home({
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
  // youShouldLoginMessage,
  // setYouShouldLoginMessage,
  isCreatingBox,
  setIsCreatingBox,
    isG5,
  setIsG5
}) {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Pejman SERN Academy";
  }, []);
  return (
    <div>
      <h1>Pejman SERN Academy</h1>
      <Navbar
        error={error}
        setError={setError}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isLoggingOut={isLoggingOut}
        setIsLoggingOut={setIsLoggingOut}
        users={users}
        setUsers={setUsers}
        userCount={userCount}
        setUserCount={setUserCount}
        isAuthChecked={isAuthChecked}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        // setFlash={setFlash}
        isProfileEditing={isProfileEditing}
        // theme={theme}
        // setTheme={setTheme}
        isCreatingBox={isCreatingBox}
        setIsCreatingBox={setIsCreatingBox}
        isG5={isG5}
        setIsG5={setIsG5}
      />
      {/* <Footer className="mt-auto" /> */}
    </div>
  );
}
