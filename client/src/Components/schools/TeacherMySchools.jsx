import { useEffect, useState } from "react";

export default function TeacherMySchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMySchools = async () => {
      try {
        const response = await fetch("/teachers/my-approved-schools", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to retrieve your schools.");
        }
        setSchools(data.schools || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMySchools();
  }, []);
  if (loading) {
    return <p>Loading your schools...</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>My Schools</h2>
      {schools.length === 0 ? (
        <div>
          <div>You haven't been accepted by any school.</div>
          <div>
            For applying to your favorite school(s) visit the "Schools' list"
            section.
          </div>
        </div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>School Name</th>
                <th>City</th>
                <th>Country</th>
                <th>Address</th>
                <th>Zip Code</th>
                <th>Accepted Date</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.school_id}>
                  <td>{school.school_name}</td>
                  <td>{school.city}</td>
                  <td>{school.country_name}</td>
                  <td>{school.address}</td>
                  <td>{school.zip_code}</td>
                  <td>
                    {school.approved_at
                      ? new Date(school.approved_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>For resigning, visit the "Schools' list" section.</div>
        </div>
      )}
    </div>
  );
}
