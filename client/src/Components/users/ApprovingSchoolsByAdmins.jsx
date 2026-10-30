import { useEffect, useState } from "react";

export default function ApprovingSchoolsByAdmins({
  rejectingSchoolId,
  setRejectingSchoolId,
  approvingSchoolId,
  setApprovingSchoolId,
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  // const [rejectingSchoolId, setRejectingSchoolId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  // const [approvingSchoolId, setApprovingSchoolId] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch pending school applications when the component mounts
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/schools/applications/pending", {
          credentials: "include",
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to fetch school applications.");
        }

        setApplications(json.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
  const approveApplication = (id) => {
    setApprovingSchoolId(id);
  };
  // Approve a school application
  const approveApplicationYes = async (applicationId) => {
    try {
      setError("");
      setProcessingId(applicationId);

      const response = await fetch(
        `/schools/applications/${applicationId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Approval failed.");
      }
      // Remove the approved application from the table
      setApplications((currentApplications) =>
        currentApplications.filter((app) => app.id !== applicationId),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
      setApprovingSchoolId(null);
    }
  };
  const approveApplicationNo = () => {
    setApprovingSchoolId(null);
  };

  const submitRejection = async (applicationId) => {
    const reason = rejectionReason.trim();

    if (!reason) {
      setError("Please enter a reason for rejecting this application.");
      return;
    }

    if (reason.length > 1000) {
      setError("The rejection reason cannot exceed 1000 characters.");
      return;
    }

    try {
      setIsRejecting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/schools/applications/${applicationId}/reject`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: reason,
          }),
        },
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to reject school application.");
      }

      setApplications((current) =>
        current.filter((application) => application.id !== applicationId),
      );

      setRejectingSchoolId(null);
      setRejectionReason("");
      setMessage("School application rejected successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRejecting(false);
    }
  };
  // Render loading, error, empty, or table states
  if (loading) {
    return <p>Loading pending school applications...</p>;
  }

  return (
    <div>
      <h3>The Waiting Schools</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {applications.length === 0 &&
      approvingSchoolId === null &&
      rejectingSchoolId === null ? (
        <p>There are no pending school applications.</p>
      ) : (
        approvingSchoolId === null &&
        rejectingSchoolId === null && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>School Name</th>
                <th style={cellStyle}>Principal</th>
                <th style={cellStyle}>Country</th>
                <th style={cellStyle}>City</th>
                <th style={cellStyle}>Address</th>
                <th style={cellStyle}>Zip Code</th>
                <th style={cellStyle}>Action</th>
                <th style={cellStyle}>Reconsideration Message</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td style={cellStyle}>{app.school_name}</td>
                  <td style={cellStyle}>{app.principal_username}</td>
                  <td style={cellStyle}>{app.country_name}</td>
                  <td style={cellStyle}>{app.city}</td>
                  <td style={cellStyle}>{app.address}</td>
                  <td style={cellStyle}>{app.zip_code || "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => approveApplication(app.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingSchoolId(app.id);
                        setRejectionReason("");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Reject
                    </button>
                  </td>
                  <td style={cellStyle}>
                    {app.reconsideration_message || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {rejectingSchoolId !== null && (
        <div className="rejection-form">
          <h3>Reason for rejecting the school</h3>

          <label htmlFor="rejectionReason">
            Explain why this school application is being rejected:
          </label>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            maxLength={1000}
            rows={5}
            required
          />

          <p>{rejectionReason.length}/1000 characters</p>

          <button
            type="button"
            disabled={isRejecting || !rejectionReason.trim()}
            onClick={() => submitRejection(rejectingSchoolId)}
          >
            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
          </button>

          <button
            type="button"
            disabled={isRejecting}
            onClick={() => {
              setRejectingSchoolId(null);
              setRejectionReason("");
              setError("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {approvingSchoolId !== null && (
        <div>
          <p>
            Are you sure you want to approve school{" "}
            <strong>
              {
                applications.find((school) => school.id === approvingSchoolId)
                  ?.school_name
              }
            </strong>
            ?
          </p>

          <button
            type="button"
            onClick={() => approveApplicationYes(approvingSchoolId)}
            disabled={processingId === approvingSchoolId}
          >
            {processingId === approvingSchoolId ? "Approving..." : "Yes"}
          </button>

          <button
            type="button"
            onClick={approveApplicationNo}
            disabled={processingId === approvingSchoolId}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};
