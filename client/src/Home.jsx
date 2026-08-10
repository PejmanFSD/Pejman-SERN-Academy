import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";

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
  setUserCount
}) {
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
      />
    </div>
  );
}
