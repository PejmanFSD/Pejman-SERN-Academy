import { useEffect, useState } from "react";

export default function TeacherSchools() {
  const [schools, setSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ID of the school whose reconsideration form is open
  const [reconsideringSchoolId, setReconsideringSchoolId] =
    useState(null);
  const [reconsiderationMessage, setReconsiderationMessage] =
    useState("");
  const [submitting, setSubmitting] = useState(false);
  // GET SCHOOLS
  const fetchSchools = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/teacher/schools?page=${currentPage}`,
        {
          credentials: "include"
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to retrieve schools.");
      }
      setSchools(data.schools);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [currentPage]);
  // APPLY TO SCHOOL
  const handleApply = async (schoolId) => {
    try {
      const response = await fetch(
        `/teacher/schools/${schoolId}/apply`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      await fetchSchools();
    } catch (error) {
      alert(error.message);
    }
  };
  // RESIGN FROM SCHOOL
  const handleResign = async (schoolId) => {
    const confirmed = window.confirm(
      "Are you sure you want to resign from this school?"
    );
    if (!confirmed) return;
    try {
      const response = await fetch(
        `/teacher/schools/${schoolId}/resign`,
        {
          method: "PATCH",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      await fetchSchools();
    } catch (error) {
      alert(error.message);
    }
  };
  // OPEN RECONSIDERATION FORM
  const openReconsiderationForm = (schoolId) => {
    setReconsideringSchoolId(schoolId);
    setReconsiderationMessage("");
  };
  // SUBMIT RECONSIDERATION
  const handleReconsideration = async (schoolId) => {
    if (!reconsiderationMessage.trim()) {
      alert("Please enter your message.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        `/teacher/schools/${schoolId}/reconsider`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reconsiderationMessage
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setReconsideringSchoolId(null);
      setReconsiderationMessage("");
      await fetchSchools();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  // RENDER ACTION BASED ON STATUS
  const renderSchoolAction = (school) => {
    const status = school.application_status;
    // No application or resigned
    if (!status || status === "Resigned") {
      return (
        <>
          {status === "Resigned" && (
            <p>
              You've already resigned from this school.
            </p>
          )}
          <button
            onClick={() => handleApply(school.id)}
          >
            {status === "Resigned" ? "Apply again" : "Apply"}
          </button>
        </>
      );
    }
    // Pending application
    if (status === "Pending") {
      return (
        <p>
          Waiting for the principal{" "}
          {school.principal_username} to approve/deny.
        </p>
      );
    }
    // Approved application
    if (status === "Approved") {
      return (
        <button
          onClick={() => handleResign(school.id)}
        >
          Resign
        </button>
      );
    }
    // Denied application
    if (status === "Denied") {
      return (
        <>
          <p>
            Your request to this school was denied by{" "}
            {school.principal_username}.
          </p>
          {school.denial_message && (
            <p>
              Principal's message: {school.denial_message}
            </p>
          )}
          {reconsideringSchoolId !== school.id ? (
            <button
              onClick={() =>
                openReconsiderationForm(school.id)
              }
            >
              Re-consider
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReconsideration(school.id);
              }}
            >
              <textarea
                value={reconsiderationMessage}
                onChange={(e) =>
                  setReconsiderationMessage(e.target.value)
                }
                maxLength={1000}
                required
                placeholder="Write your reconsideration message..."
              />
              <button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReconsideringSchoolId(null);
                  setReconsiderationMessage("");
                }}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      );
    }
    return null;
  };
  // RENDER PAGE
  if (loading) {
    return <p>Loading schools...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  return (
    <div>
      <h2>Approved Schools</h2>
      <table>
        <thead>
          <tr>
            <th>School Name</th>
            <th>Country</th>
            <th>City</th>
            <th>Principal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schools.length === 0 ? (
            <tr>
              <td colSpan="5">
                No approved schools found.
              </td>
            </tr>
          ) : (
            schools.map((school) => (
              <tr key={school.id}>
                <td>{school.school_name}</td>
                <td>{school.country_name}</td>
                <td>{school.city}</td>
                <td>{school.principal_username}</td>
                <td>
                  {renderSchoolAction(school)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* PAGINATION */}
      <div>
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
        >
          Previous
        </button>
        <span>
          {" "}Page {currentPage} of {totalPages}{" "}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}