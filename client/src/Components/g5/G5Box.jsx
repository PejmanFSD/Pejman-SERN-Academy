import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function G5Box() {
  const { boxId } = useParams();
  const [box, setBox] = useState(null);

  useEffect(() => {
    const fetchBox = async () => {
      const response = await fetch(`/g5Boxes/${boxId}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setBox(data);
    };

    fetchBox();
  }, [boxId]);
  if (!box) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>{box.box_name}</h1>
    </div>
  );
}
