import { useState } from "react";

export default function CreateSchool() {
  const [formData, setFormData] = useState({
    schoolName: "",
    countryCode: "CA",
    city: "",
    address: "",
    zipCode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/schools/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Submission failed.");
        return;
      }

      setMessage(json.message);

      setFormData({
        schoolName: "",
        countryCode: "CA",
        city: "",
        address: "",
        zipCode: "",
      });
    } catch {
      setError("Unable to connect to the server.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register a School</h2>

      <label htmlFor="schoolName">School Name</label>
      <input
        id="schoolName"
        name="schoolName"
        value={formData.schoolName}
        onChange={handleChange}
        maxLength={200}
        required
      />

      <label htmlFor="countryCode">Country</label>
      <select
        id="countryCode"
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

      <label htmlFor="city">City</label>
      <input
        id="city"
        name="city"
        value={formData.city}
        onChange={handleChange}
        maxLength={100}
        required
      />

      <label htmlFor="address">Address</label>
      <input
        id="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        maxLength={255}
        required
      />

      <label htmlFor="zipCode">ZIP / Postal code</label>
      <input
        id="zipCode"
        name="zipCode"
        value={formData.zipCode}
        onChange={handleChange}
        maxLength={20}
      />

      <button type="submit">Submit for approval</button>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
