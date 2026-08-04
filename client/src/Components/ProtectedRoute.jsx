import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  currentUser,
  isAuthChecked,
  children,
}) {
  const location = useLocation();
  // We don't want the user to be redirected to the "Login" page
  // whenever they refresh the page:
  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }
  if (!currentUser) {
    return (
      <Navigate
        to="/login" // If the user clicks on the "Login" button
        replace
        state={{ from: location }} // If the user was trying to reach a
        // page that required login.
      />
    );
  }
  return children;
}
