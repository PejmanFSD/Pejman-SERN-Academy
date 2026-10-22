import { useEffect, useState } from "react";

export default function ApprovingSchoolsByAdmins() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetch pending school applications when the component mounts
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

  // 2. Approve a school application
  const approveSchool = async (applicationId) => {
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
    }
  };

  // 3. Render loading, error, empty, or table states
  if (loading) {
    return <p>Loading pending school applications...</p>;
  }

  return (
    <div>
      <h3>The Waiting Schools</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {applications.length === 0 ? (
        <p>There are no pending school applications.</p>
      ) : (
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

                <td style={cellStyle}>
                  <button
                    type="button"
                    onClick={() => approveSchool(app.id)}
                    disabled={processingId !== null}
                  >
                    {processingId === app.id ? "Approving..." : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};
