import { useState, useEffect } from "react";
export default function G5({ error, setError }) {
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
  const [boxes, setBoxes] = useState([]);
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
              <h2>{box.box_name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
