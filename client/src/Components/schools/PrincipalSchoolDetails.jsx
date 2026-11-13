import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function PrincipalSchoolDetails() {
  const { schoolId } = useParams();
  // Pending applications
  const [applications, setApplications] = useState([]);
  const [applicationPage, setApplicationPage] = useState(1);
  const [applicationTotalPages, setApplicationTotalPages] = useState(1);
  // Resigned teachers
  const [resignedTeachers, setResignedTeachers] = useState([]);
  const [resignedPage, setResignedPage] = useState(1);
  const [resignedTotalPages, setResignedTotalPages] = useState(1);
  const [approvingApplicationId, setApprovingApplicationId] = useState(null);
  // Denial form
  const [denyingApplicationId, setDenyingApplicationId] = useState(null);
  const [denialMessage, setDenialMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [resignedLoading, setResignedLoading] = useState(false);

  const navigate = useNavigate();
  // GET PENDING APPLICATIONS
  const refreshApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await fetch(
        `/principal/schools/${schoolId}/teacher-applications?page=${applicationPage}`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch applications.");
      }
      if (data.applications.length === 0 && applicationPage > 1) {
        setApplicationPage((prevPage) => prevPage - 1);
        return;
      }
      setApplications(data.applications);
      setApplicationTotalPages(data.totalPages);
    } catch (error) {
      console.error("Applications request error:", error);
      setError(error.message);
    } finally {
      setApplicationsLoading(false);
    }
  };
  // GET RESIGNED TEACHERS
  const fetchResignedTeachers = async () => {
    setResignedLoading(true);
    try {
      const response = await fetch(
        `/principal/schools/${schoolId}/resigned-teachers?page=${resignedPage}`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setResignedTeachers(data.teachers);
      setResignedTotalPages(data.totalPages);
    } catch (error) {
      setError(error.message);
    } finally {
      setResignedLoading(false);
    }
  };

  useEffect(() => {
    refreshApplications();
  }, [schoolId, applicationPage]);

  useEffect(() => {
    fetchResignedTeachers();
  }, [schoolId, resignedPage]);
  // APPROVE TEACHER
  const handleApprove = (applicationId) => {
    setApprovingApplicationId(applicationId);
  };
  const handleApproveYes = async (applicationId) => {
    try {
      const response = await fetch(
        `/principal/teacher-applications/${applicationId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      await refreshApplications();
    } catch (error) {
      alert(error.message);
    } finally {
      setApprovingApplicationId(null);
    }
  };
  const handleApproveNo = () => {
    setApprovingApplicationId(null);
  };
  // OPEN DENIAL FORM
  const openDenialForm = (applicationId) => {
    setDenyingApplicationId(applicationId);

    setDenialMessage("");
  };
  // DENY TEACHER
  const handleDeny = async (e, applicationId) => {
    e.preventDefault();
    if (!denialMessage.trim()) {
      alert("Please enter a denial message.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        `/principal/teacher-applications/${applicationId}/deny`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            denialMessage,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setDenyingApplicationId(null);
      setDenialMessage("");
      await refreshApplications();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  // RENDER
  return (
    <div>
      <h2>Teacher Applications</h2>
      {error && <p>{error}</p>}
      {/* PENDING APPLICATIONS TABLE         */}
      {applicationsLoading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p>No available apply for this school!</p>
      ) : (
        !approvingApplicationId && (
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Application Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="3">No pending applications.</td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application.application_id}>
                    <td>{application.teacher_username}</td>
                    <td>
                      {application.reconsideration_message ? (
                        <>
                          <p>
                            {application.teacher_username} has requested
                            reconsideration.
                          </p>
                          <strong>Reconsideration message:</strong>
                          <p>{application.reconsideration_message}</p>
                        </>
                      ) : (
                        <p>
                          {application.teacher_username} wants to teach in your
                          school.
                        </p>
                      )}
                    </td>
                    <td>
                      {denyingApplicationId !== application.application_id ? (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(application.application_id)
                            }
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              openDenialForm(application.application_id)
                            }
                          >
                            Deny
                          </button>
                        </>
                      ) : (
                        <form
                          onSubmit={(e) =>
                            handleDeny(e, application.application_id)
                          }
                        >
                          <textarea
                            value={denialMessage}
                            onChange={(e) => setDenialMessage(e.target.value)}
                            placeholder="Enter your denial message..."
                            maxLength={1000}
                            required
                          />
                          <button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDenyingApplicationId(null);
                              setDenialMessage("");
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )
      )}
      {/* PENDING APPLICATIONS PAGINATION */}
      {applications.length > 0 && !approvingApplicationId && (
        <div>
          <button
            disabled={applicationPage === 1}
            onClick={() => setApplicationPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            {" "}
            Page {applicationPage} of {applicationTotalPages}{" "}
          </span>
          <button
            disabled={applicationPage >= applicationTotalPages}
            onClick={() => setApplicationPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
      {!approvingApplicationId && <hr />}
      {/* RESIGNED TEACHERS TABLE             */}
      {!approvingApplicationId && <h2>Resigned Teachers</h2>}
      {resignedLoading ? (
        <p>Loading...</p>
      ) : resignedTeachers.length === 0 && !approvingApplicationId ? (
        <p>No resigned teachers.</p>
      ) : (
        !approvingApplicationId && (
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Accepted Date</th>
                <th>Resignation Date</th>
              </tr>
            </thead>
            <tbody>
              {resignedTeachers.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    No teachers have resigned from this school.
                  </td>
                </tr>
              ) : (
                resignedTeachers.map((teacher) => (
                  <tr key={teacher.application_id}>
                    <td>{teacher.teacher_username}</td>
                    <td>
                      {teacher.approved_at
                        ? new Date(teacher.approved_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {teacher.resigned_at
                        ? new Date(teacher.resigned_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )
      )}
      {/* RESIGNED TEACHERS PAGINATION */}
      {resignedTeachers.length > 0 && !approvingApplicationId && (
        <div>
          <button
            disabled={resignedPage === 1}
            onClick={() => setResignedPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            {" "}
            Page {resignedPage} of {resignedTotalPages}{" "}
          </span>
          <button
            disabled={resignedPage >= resignedTotalPages}
            onClick={() => setResignedPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
      {approvingApplicationId && (
        <div>
          <div>{`Are you sure you want to approve ${applications.find((a) => a.application_id === approvingApplicationId).teacher_username} for your school?`}</div>
          <button onClick={() => handleApproveYes(approvingApplicationId)}>
            Yes
          </button>
          <button onClick={handleApproveNo}>No</button>
        </div>
      )}
    </div>
  );
}

export default PrincipalSchoolDetails;
