import { useState, useEffect, useRef } from "react";
import {
    useNavigate,
    useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function G5({
  error,
  setError,
  currentUser,
  onBoxCreated,
  // setFlash,
  setIsCreatingBox,
  isLoggingOut,
  isDeleting,
  isProfileEditing,
  isCreatingBox,
}) {
    const navigate = useNavigate();
  const location = useLocation();
  const renderCreateBoxPage = () => {
    setIsCreatingBox(true);
    navigate("/G5/newG5Box");
  };
  return (
    <div>
        
        {currentUser &&
                  location.pathname !== "/G5/newG5Box" &&
                  !isLoggingOut &&
                  !isDeleting &&
                  !isProfileEditing &&
                  // !isAdEditing &&
                  !isCreatingBox &&
                  !error && (
                    <button onClick={renderCreateBoxPage}>Create new G5-Box</button>
                  )}
    </div>
  )
    
}