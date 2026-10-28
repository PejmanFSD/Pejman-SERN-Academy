import { useEffect, useState } from "react";

export default function MySchool({ isDeleting, setIsDeleting }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejectedApplications, setRejectedApplications] = useState([]);

  const [formData, setFormData] = useState({
    schoolName: "",
    countryCode: "CA",
    city: "",
    address: "",
    zipCode: "",
  });

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/schools/my-schools", {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to load schools.");
      }

      setSchools(json.schools || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const startEditing = (school) => {
    setEditingId(school.id);
    setMessage("");
    setError("");

    setFormData({
      schoolName: school.school_name,
      countryCode: school.country_code,
      city: school.city,
      address: school.address,
      zipCode: school.zip_code || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveSchool = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`/schools/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to update school.");
      }

      setMessage(json.message);
      setEditingId(null);

      await loadSchools();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSchool = (id) => {
    setDeletingId(id);
    setIsDeleting(true);
  };

  const deleteSchoolYes = async (schoolId) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`/schools/${schoolId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to delete school.");
      }

      setSchools((current) =>
        current.filter((school) => school.id !== schoolId),
      );

      if (editingId === schoolId) {
        setEditingId(null);
      }

      setMessage(json.message || "School deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const deleteSchoolNo = () => {
    setIsDeleting(false);
    setDeletingId(null);
  };

  const loadRejectedApplications = async () => {
    try {
      const response = await fetch("/schools/my-applications/rejected", {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to load rejected applications.");
      }

      setRejectedApplications(json.applications || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSchools();
    loadRejectedApplications();
  }, []);

  if (loading) {
    return <p>Loading your schools...</p>;
  }

  return (
    <section>
      <h2>My School</h2>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "green" }}>
          {message}
        </p>
      )}

      {!isDeleting && schools.length === 0 ? (
        <p>You don't have any approved schools yet.</p>
      ) : (
        !isDeleting &&
        schools.map((school) => (
          <article
            key={school.id}
            style={{
              //   border: "1px solid #ccc",
              //   borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            {/* {editingId !== school.id ? ( */}
            {editingId === null ? (
              <>
                <h3>{school.school_name}</h3>
                <p>
                  <strong>Location:</strong> {school.city},{" "}
                  {school.country_name}
                </p>
                <p>
                  <strong>Address:</strong> {school.address}
                </p>
                <p>
                  <strong>Postal code:</strong>{" "}
                  {school.zip_code || "Not provided"}
                </p>
                <p>
                  <strong>Approval status:</strong> Approved
                </p>
                <p>
                  <strong>Approved by:</strong>{" "}
                  {school.approved_by || "Approval record unavailable"}
                </p>
                <p>
                  <strong>Approval date:</strong>{" "}
                  {school.approved_at
                    ? new Date(school.approved_at).toLocaleDateString()
                    : "Unavailable"}
                </p>
                <button type="button" onClick={() => startEditing(school)}>
                  Edit School
                </button>{" "}
                <button type="button" onClick={() => deleteSchool(school.id)}>
                  Delete School
                </button>
              </>
            ) : (
              editingId === school.id && (
                <form onSubmit={saveSchool}>
                  <h3>Edit School Information</h3>
                  <label htmlFor={`schoolName-${school.id}`}>School Name</label>
                  <input
                    id={`schoolName-${school.id}`}
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    maxLength={200}
                    required
                  />
                  <label htmlFor={`countryCode-${school.id}`}>Country</label>
                  <select
                    id={`countryCode-${school.id}`}
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="CA">Canada</option>
                    <option value="US">United States of America</option>
                    <option value="GB">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="JP">Japan</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                    <option value="AU">Australia</option>
                    <option value="SE">Sweden</option>
                    <option value="CH">Switzerland</option>
                    <option value="CN">China</option>
                    <option value="AT">Austria</option>
                    <option value="BE">Belgium</option>
                    <option value="MX">Mexico</option>
                    <option value="BR">Brazil</option>
                  </select>
                  <label htmlFor={`city-${school.id}`}>City</label>
                  <input
                    id={`city-${school.id}`}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                  <label htmlFor={`address-${school.id}`}>Address</label>
                  <input
                    id={`address-${school.id}`}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    maxLength={255}
                    required
                  />
                  <label htmlFor={`zipCode-${school.id}`}>Postal Code</label>
                  <input
                    id={`zipCode-${school.id}`}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength={20}
                  />
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>{" "}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </form>
              )
            )}
          </article>
        ))
      )}
      {isDeleting && deletingId !== null && (
        <div>
          <p>{`Are you sure you want to delete ${schools.find((s) => s.id === deletingId).school_name}?`}</p>
          <button type="button" onClick={() => deleteSchoolYes(deletingId)}>
            Yes
          </button>
          <button type="button" onClick={deleteSchoolNo}>
            No
          </button>
        </div>
      )}
      {rejectedApplications.length === 0 ? (
        <p>You have no rejected school applications.</p>
      ) : (
        rejectedApplications.map((application) => (
          <div
            key={application.id}
            style={{
              border: "1px solid #d9534f",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h3>School Application Rejected</h3>

            <p>
              Your application for <strong>{application.school_name}</strong>{" "}
              has been rejected.
            </p>

            <p>
              <strong>Rejected by:</strong>{" "}
              {application.rejected_by || "Admin name unavailable"}
            </p>

            <p>
              <strong>Rejection date:</strong>{" "}
              {application.reviewed_at
                ? new Date(application.reviewed_at).toLocaleString()
                : "Date unavailable"}
            </p>
            <p>
              <strong>Reason for rejection:</strong>{" "}
              {application.rejection_reason || "No reason was provided."}
            </p>
          </div>
        ))
      )}
    </section>
  );
}
