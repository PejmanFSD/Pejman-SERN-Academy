import { useState, useEffect } from "react";

export default function CreateSchool() {
  const [formData, setFormData] = useState({
    schoolName: "",
    countryCode: "CA",
    city: "",
    address: "",
    zipCode: "",
    subjects: [],
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  const handleChange = (e) => {
    setError("");
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
    if (!isValidZipCode(formData.zipCode)) {
      setError(
        "The zip code isn't valid! The valid zip code is in the 3 characters + space + 3 characters format where each character is either a capital letter or a number",
      );
      return;
    }
    try {
      // Get the selected subject IDs
      const subjectsToSubmit = selectedSubjects.map(
        (subject) => subject.subject_id,
      );
      const response = await fetch("/schools/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          subjects: subjectsToSubmit,
        }),
      });
      // const json = await response.json();
      const responseText = await response.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (error) {
        setError(
          "The server returned HTML instead of JSON. Check the backend terminal.",
        );
        return;
      }
      if (!response.ok) {
        setError(json.message || json.error || "Submission failed.");
        return;
      }
      setMessage(json.message);
      // Reset form data
      setFormData({
        schoolName: "",
        countryCode: "CA",
        city: "",
        address: "",
        zipCode: "",
        subjects: [],
      });
      // Reset selected subjects
      setSelectedSubjects([]);
    } catch (error) {
      console.error("School submission error:", error);
      setError(error.message || "An unexpected error occurred.");
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setAvailableSubjects([]);
    if (!categoryId) {
      return;
    }
    try {
      const response = await fetch(
        `/subject-categories/${categoryId}/subjects`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAvailableSubjects(data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleAddSubject = () => {
    if (!selectedSubjectId) {
      alert("Please choose a subject.");
      return;
    }
    const subject = availableSubjects.find(
      (s) => s.subject_id === Number(selectedSubjectId),
    );
    if (!subject) {
      return;
    }
    const alreadyExists = selectedSubjects.some(
      (s) => s.subject_id === subject.subject_id,
    );
    if (alreadyExists) {
      alert("This subject has already been added.");
      return;
    }
    setSelectedSubjects((prev) => [...prev, subject]);
    // Add the subject ID to formData as well
    setFormData((prev) => ({
      ...prev,
      subjects: [...(prev.subjects || []), subject.subject_id],
    }));
    setSelectedSubjectId("");
    setSelectedCategory("");
    setAvailableSubjects([]);
  };

  const handleRemoveSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.filter((s) => s.subject_id !== subjectId),
    );
    setFormData((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((id) => id !== subjectId),
    }));
  };

  const isValidZipCode = (zipCode) => {
    return /^[A-Z0-9]{3} [A-Z0-9]{3}$/.test(zipCode);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/subject-categories");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
      <h3>Subjects taught at this school</h3>
      {!showSubjectForm && (
        <button type="button" onClick={() => setShowSubjectForm(true)}>
          Add Subject
        </button>
      )}
      {showSubjectForm && (
        <div>
          <h3>Choose a Category</h3>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <>
              <h3>Choose Subject</h3>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">Select a subject</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddSubject}>
                Add
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setShowSubjectForm(false);
              setSelectedCategory("");
              setSelectedSubjectId("");
              setAvailableSubjects([]);
            }}
          >
            Close
          </button>
        </div>
      )}
      <h3>Selected Subjects</h3>
      {selectedSubjects.length === 0 ? (
        <p>No subjects selected.</p>
      ) : (
        <ul>
          {selectedSubjects.map((subject) => (
            <li key={subject.subject_id}>
              {subject.subject_name}
              <button
                type="button"
                onClick={() => handleRemoveSubject(subject.subject_id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="submit">Submit for approval</button>
      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
