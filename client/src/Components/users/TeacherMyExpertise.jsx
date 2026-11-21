import { useEffect, useState } from "react";

export default function TeacherMyExpertise() {
  const [expertise, setExpertise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const response = await fetch("/teachers/my-expertise", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch your expertise.");
        }

        setExpertise(data.expertise || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertise();
  }, []);

  if (loading) {
    return <p>Loading your expertise...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>My Teaching Expertise</h2>

      {expertise.length === 0 ? (
        <p>You don't have any teaching expertise.</p>
      ) : (
        <div>
          {expertise.map((subject) => (
            <div
              key={subject.subject_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "10px",
              }}
            >
              <strong>{subject.subject_name}</strong>

              <div style={{ color: "gray", marginTop: "5px" }}>
                {subject.category_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
