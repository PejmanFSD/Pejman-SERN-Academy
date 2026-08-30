import { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";
import G5Boxes from "./G5Boxes";

export default function G5({
  boxes,
  setBoxes,
  error,
  setError,
  currentUser,
  onBoxCreated,
  // setFlash,
  setIsCreatingBox,
  isLoggingOut,
  isDeleting,
  setIsDeleting,
  isProfileEditing,
  isCreatingBox,
}) {
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editedBoxName, setEditedBoxName] = useState("");
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
        !isProfileEditing &&
        // !isBoxEditing &&
        !isCreatingBox &&
        !error && (
          <button onClick={renderCreateBoxPage} disabled={isDeleting || editingBoxId}>
            Create new G5-Box
          </button>
        )}
      <G5Boxes
        error={error}
        setError={setError}
        boxes={boxes}
        setBoxes={setBoxes}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        editingBoxId={editingBoxId}
        setEditingBoxId={setEditingBoxId}
        editedBoxName={editedBoxName}
        setEditedBoxName={setEditedBoxName}
      />
    </div>
  );
}
