import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation, // For hiding the button of the current page
} from "react-router-dom";

export default function G5({ error, setError }) {
  const [boxes, setBoxes] = useState([]);

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
  const deleteG5Box = async (boxId) => {
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
              currentBoxes.filter((box) => box.id !== boxId)
          );

      } catch (err) {
          setError("Something went wrong while deleting the G5 Box.");
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
              <button onClick={() => openG5Box(box.id)}>{box.box_name}</button>
              <button onClick={() => deleteG5Box(box.id)}>x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
