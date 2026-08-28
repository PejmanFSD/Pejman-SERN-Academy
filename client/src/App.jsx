import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Home";
import Register from "./Components/users/Register";
import Login from "./Components/users/Login";
import Users from "./Components/users/Users";
import Profile from "./Components/users/Profile";
import EditProfile from "./Components/users/EditProfile";
import G5 from "./Components/g5/G5";
import G5Box from "./Components/g5/G5Box";
import CreateG5Form from "./Components/g5/CreateG5Form";

// import AboutAcademy from "./Components/AboutAcademy";
import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isG5, setIsG5] = useState(false);
  // const [youShouldLoginMessage, setYouShouldLoginMessage] = useState(false);
  // const [flash, setFlash] = useState(null);
  // const [theme, setTheme] = useState("Blue");
  const [boxes, setBoxes] = useState([]);
  const [isCreatingBox, setIsCreatingBox] = useState(false);

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
  // Flash message
  // useEffect(() => {
  //   if (flash) {
  //     const timer = setTimeout(() => {
  //       setFlash(null);
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [flash]);
  // Themes:
  // useEffect(() => {
  //   const root = document.documentElement;
  //   if (theme === "Blue") {
  //     root.style.setProperty("--primary", "#52bcfd");
  //     root.style.setProperty("--secondary", "#3a6296");
  //     root.style.setProperty("--background", "#e2fbff");
  //   }
  //   if (theme === "Red") {
  //     root.style.setProperty("--primary", "#ff8989");
  //     root.style.setProperty("--secondary", "#c34751");
  //     root.style.setProperty("--background", "#ffeaea");
  //   }
  //   if (theme === "Green") {
  //     root.style.setProperty("--primary", "#30e791");
  //     root.style.setProperty("--secondary", "#317e5a");
  //     root.style.setProperty("--background", "#dbffe5");
  //   }
  // }, [theme]);
  return (
    <div className="App">
      {/* {flash && <div className={`flash-message ${flash.type}`}>{flash}</div>} */}
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
                // youShouldLoginMessage={youShouldLoginMessage}
                // setYouShouldLoginMessage={setYouShouldLoginMessage}
                isCreatingBox={isCreatingBox}
                setIsCreatingBox={setIsCreatingBox}
                isG5={isG5}
                setIsG5={setIsG5}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                // currentUser={currentUser}
                error={error}
                setError={setError}
                // onRegister={(user) => setCurrentUser(user)}
                userCount={userCount}
                setUserCount={setUserCount}
                // setFlash={setFlash}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                // currentUser={currentUser}
                error={error}
                setError={setError}
                // onLogin={(user) => setCurrentUser(user)}
                setCurrentUser={setCurrentUser}
                // youShouldLoginMessage={youShouldLoginMessage}
                // setYouShouldLoginMessage={setYouShouldLoginMessage}
                // setFlash={setFlash}
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <Users
                  users={users}
                  setUsers={setUsers}
                  error={error}
                  setError={setError}
                  isLoggingOut={isLoggingOut}
                  currentUser={currentUser}
                  isDeleting={isDeleting}
                  setIsDeleting={setIsDeleting}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <Profile
                  currentUser={currentUser}
                  error={error}
                  setError={setError}
                  setIsProfileEditing={setIsProfileEditing}
                  isLoggingOut={isLoggingOut}
                />
              </ProtectedRoute>
            }
          />
          {/* {!isLoggingOut && (
            <Route path="/about-academy" element={<AboutAcademy />} />
          )} */}
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <EditProfile
                  setCurrentUser={setCurrentUser}
                  // setFlash={setFlash}
                  setIsProfileEditing={setIsProfileEditing}
                  error={error}
                  passwordError={passwordError}
                  setError={setError}
                  setPasswordError={setPasswordError}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/G5"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <G5
                  error={error}
                  setError={setError}
                  currentUser={currentUser}
                  onBoxCreated={(newBox) => {
                    setBoxes((currBoxes) => [newBox, ...currBoxes]);
                  }}
                  // setFlash={setFlash}
                  isCreatingBox={isCreatingBox}
                  setIsCreatingBox={setIsCreatingBox}
                  isLoggingOut={isLoggingOut}
                  isDeleting={isDeleting}
                  isProfileEditing={isProfileEditing}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/G5/G5Boxes/:boxId"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <G5Box />
              </ProtectedRoute>
            }
          />
          <Route
            path="/G5/newG5Box"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                isAuthChecked={isAuthChecked}
              >
                <CreateG5Form
                  error={error}
                  setError={setError}
                  currentUser={currentUser}
                  onBoxCreated={(newBox) => {
                    setBoxes((currBoxes) => [newBox, ...currBoxes]);
                  }}
                  // setFlash={setFlash}
                  setIsCreatingBox={setIsCreatingBox}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
