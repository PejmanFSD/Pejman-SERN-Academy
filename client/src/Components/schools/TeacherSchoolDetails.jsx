import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function TeacherSchoolDetails() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previousPage = searchParams.get("page") || "1";
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/teacher/schools/${schoolId}/details`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to retrieve school details.");
        }
        setSchool(data.school);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchoolDetails();
  }, [schoolId]);

  const handleBack = () => {
    navigate(`/all-schools?page=${previousPage}`);
  };
  if (loading) {
    return <p>Loading school details...</p>;
  }
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleBack}>Back to schools</button>
      </div>
    );
  }
  if (!school) {
    return (
      <div>
        <p>School not found.</p>
        <button onClick={handleBack}>Back to schools</button>
      </div>
    );
  }

  return (
    <div>
      <h2>School Information</h2>
      <h3>{school.school_name}</h3>
      <p><strong>Country:</strong> {school.country_name}</p>
      <p><strong>City:</strong> {school.city}</p>
      <p><strong>Address:</strong> {school.address}</p>
      <p><strong>Zip Code:</strong> {school.zip_code}</p>
      <p><strong>Principal:</strong> {school.principal_username}</p>
      <hr />
      <h3>Subjects Offered</h3>
      {school.subjects.length === 0 ? (
        <p>This school hasn't listed any subjects yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {school.subjects.map((subject) => (
              <tr key={subject.subject_id}>
                <td>{subject.category_name}</td>
                <td>{subject.subject_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={handleBack}>
        ← Back to schools
      </button>
    </div>
  );
}