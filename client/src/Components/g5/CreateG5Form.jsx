import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateG5Form({
  error,
  setError,
  currentUser,
  onBoxCreated,
  // setFlash,
  setIsCreatingBox,
}) {
  const [boxName, setBoxName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetch("/g5Boxes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        box_name: boxName.trim(),
      }),
      credentials: "include",
    });
    const json = await response.json();
    // Error handling
    // If the fetching box process fails:
    if (!response.ok) {
      setError(json.message || json.error || "Creating new box failed");
      return;
    }
    onBoxCreated(json);
    setBoxName("");
    //   setFlash(json.message);
    setIsCreatingBox(false);
    navigate("/");
  };

  const cancelSubmit = () => {
    setError(null);
    setIsCreatingBox(false);
    navigate("/");
  };
  return (
    <div>
      <h1 className="eater my-1" style={{ fontSize: "40px" }}>
        Create a new G5-Box
      </h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="boxName">
            <strong>Enter the name of you G5-Box:</strong>
          </label>
          <input
            type="text"
            onChange={(e) => setBoxName(e.target.value)}
            id="boxName"
            name="boxName"
            value={boxName}
            required
          />
        </div>
        <button disabled={error || !boxName.trim()}>Create Box</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
      <button onClick={cancelSubmit}>Cancel</button>
    </div>
  );
}
