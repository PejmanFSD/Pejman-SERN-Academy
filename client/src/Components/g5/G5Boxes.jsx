import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function G5({
  error,
  setError,
  isDeleting,
  setIsDeleting,
  boxes,
  setBoxes,
  editingBoxId,
  setEditingBoxId,
  editedBoxName,
  setEditedBoxName
}) {
  const [deletingBox, setDeletingBox] = useState(null);
  // const [editingBoxId, setEditingBoxId] = useState(null);
  // const [editedBoxName, setEditedBoxName] = useState("");

  const navigate = useNavigate();
  const fetchBoxes = async () => {
    const response = await fetch("/g5Boxes", {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to load G5 boxes.");
      return;
    }

    setBoxes(data);
  };
  const openG5Box = (boxId) => {
    navigate(`/G5/G5Boxes/${boxId}`);
  };
  const deleteG5Box = (id) => {
    setIsDeleting(true);
    setDeletingBox(id);
  };
  const deleteG5BoxYes = async (boxId) => {
    try {
      const response = await fetch(`/g5Boxes/${boxId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete G5 Box.");
        return;
      }

      // Remove the deleted box from the UI
      setBoxes((currentBoxes) =>
        currentBoxes.filter((box) => box.id !== boxId),
      );
    } catch (err) {
      setError("Something went wrong while deleting the G5 Box.");
    } finally {
      setIsDeleting(false);
      setDeletingBox(null);
    }
  };
  const deleteG5BoxNo = () => {
    setIsDeleting(false);
    setDeletingBox(null);
  };
  const editG5Box = (boxId) => {
    const box = boxes.find((box) => box.id === boxId);

    if (!box) {
      return;
    }

    setEditingBoxId(boxId);
    setEditedBoxName(box.box_name);
  };
  const saveG5Box = async (boxId) => {
    if (!editedBoxName.trim()) {
      setError("Box name is required.");
      return;
    }
    try {
      const response = await fetch(`/g5Boxes/${boxId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          box_name: editedBoxName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update G5 Box.");
        return;
      }
      // Update the box in React state
      setBoxes((currentBoxes) =>
        currentBoxes.map((box) => (box.id === boxId ? data.box : box)),
      );
      // Exit edit mode
      setEditingBoxId(null);
      setEditedBoxName("");
      setError(null);
    } catch (err) {
      setError("Something went wrong while updating the G5 Box.");
    }
  };
  useEffect(() => {
    fetchBoxes();
  }, []);
  return (
    <div>
      {boxes.length === 0 ? (
        <p>You don't have any G5 boxes yet.</p>
      ) : (
        <div>
          {boxes.map((box) => (
            <div key={box.id}>
              {editingBoxId === box.id ? (
                <>
                  <input
                    type="text"
                    value={editedBoxName}
                    onChange={(e) => setEditedBoxName(e.target.value)}
                  />
                  <button onClick={() => saveG5Box(box.id)}>Save</button>
                  <button
                    onClick={() => {
                      setEditingBoxId(null);
                      setEditedBoxName("");
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openG5Box(box.id)}
                    disabled={isDeleting || editingBoxId}
                  >
                    {box.box_name}
                  </button>
                  <button
                    onClick={() => deleteG5Box(box.id)}
                    disabled={isDeleting || editingBoxId}
                  >
                    &#128465;
                  </button>
                  <button
                    onClick={() => editG5Box(box.id)}
                    disabled={isDeleting || editingBoxId}
                  >
                    &#9999;
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {isDeleting && (
        <div>
          <div>{`Are you sure you want to delete ${boxes.find((box) => box.id === deletingBox).box_name}?`}</div>
          <button onClick={() => deleteG5BoxYes(deletingBox)}>Yes</button>
          <button onClick={() => deleteG5BoxNo()}>Cancel</button>
        </div>
      )}
      {error && (
          <div style={{ color: "red" }}>
              {error}
          </div>
      )}
    </div>
  );
}
