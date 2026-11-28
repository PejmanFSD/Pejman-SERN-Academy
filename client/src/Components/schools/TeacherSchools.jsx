import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function TeacherSchools() {
  const [schools, setSchools] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page"));
    return Number.isInteger(page) && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ID of the school whose reconsideration form is open
  const [reconsideringSchoolId, setReconsideringSchoolId] =
    useState(null);
  const [reconsiderationMessage, setReconsiderationMessage] =
    useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isResigning, setIsResigning] = useState(false);
  const [resigningId, setResigningId] = useState(null);

  const navigate = useNavigate();
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

  useEffect(() => {
    setSearchParams(
      { page: String(currentPage) },
      { replace: true }
    );
  }, [currentPage, setSearchParams]);
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
  const handleResign = (id) => {
    setIsResigning(true);
    setResigningId(id);
  }
  const handleResignYes = async (schoolId) => {
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
    } finally {
      setIsResigning(false);
      setResigningId(null);
    }
  };
  const handleResignNo = () => {
    setIsResigning(false);
    setResigningId(null);
  }
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
              You've resigned from this school.
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
      <h2>Schools</h2>
      {!isResigning &&
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
                No schools found.
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
                <button
                  onClick={() =>
                    navigate(`/teacher/schools/${school.id}/details?page=${currentPage}`)
                  }
                >
                  Details
                </button>
                  {renderSchoolAction(school)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      }
      {/* PAGINATION */}
      {!isResigning &&
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
      }
      {isResigning &&
        <div>
          <div>{`Are you sure you want to resign from ${schools.find(s => s.id === resigningId).school_name}?`}</div>
          <button onClick={() => handleResignYes(resigningId)}>Yes</button>
          <button onClick={handleResignNo}>No</button>
        </div>
      }
    </div>
  );
}