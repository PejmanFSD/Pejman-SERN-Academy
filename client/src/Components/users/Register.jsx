import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({
  error,
  setError,
  userCount,
  setUserCount,
  // currentUser,
  onRegister,
  // setFlash
  setUsers,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [adminSecret, setAdminSecret] = useState("");
  // const [error, setError] = useState(null);
  const [passwordStrengthStatus, setPasswordStrengthStatus] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [teacherExpertise, setTeacherExpertise] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const navigate = useNavigate();
  // We check if the password is strong or not, both in Back-End and Front-End:
  const isStrongPassword = (password) => {
    if (password.length < 8) return false;
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    for (let char of password) {
      if (char >= "A" && char <= "Z") hasUpper = true;
      else if (char >= "a" && char <= "z") hasLower = true;
      else if (char >= "0" && char <= "9") hasNumber = true;
    }
    return hasUpper && hasLower && hasNumber;
  };
  // Checking if each character of the password has one of the
  // conditions of a strong password:
  const checkPassword = (password) => {
    setPasswordStrengthStatus({
      length: false,
      upper: false,
      lower: false,
      number: false,
    });
    for (let char of password) {
      if (char >= "A" && char <= "Z")
        setPasswordStrengthStatus((currPasswordStrengthStatus) => ({
          ...currPasswordStrengthStatus,
          upper: true,
        }));
      else if (char >= "a" && char <= "z")
        setPasswordStrengthStatus((currPasswordStrengthStatus) => ({
          ...currPasswordStrengthStatus,
          lower: true,
        }));
      else if (char >= "0" && char <= "9")
        setPasswordStrengthStatus((currPasswordStrengthStatus) => ({
          ...currPasswordStrengthStatus,
          number: true,
        }));
    }
    if (password.length >= 8)
      setPasswordStrengthStatus((currPasswordStrengthStatus) => ({
        ...currPasswordStrengthStatus,
        length: true,
      }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("You should enter a strong password");
      return;
    }
    if (role === "Teacher" && teacherExpertise.length === 0) {
      setError("Please select at least one subject you can teach.");
      return;
    }
    setError(null);
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // We're using sessions, so we need this line
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          role,
          adminSecret,
          expertise:
            role === "Teacher"
              ? teacherExpertise.map((subject) => subject.subject_id)
              : [],
        }),
      });
      const json = await response.json();
      // Error handling
      // If the fetching user process fails:
      if (!response.ok) {
        // If the issue is with the userSchema limitations:
        if (json.errors) {
          const firstError = Object.values(json.errors)[0];
          setError(firstError);
        }
        // If the issue is for something else (like the internet breakdown):
        else {
          setError(json.message || json.error || "Registration failed");
        }
        return;
      }
      setUserCount((currUserCount) => currUserCount + 1);
      onRegister(json.user);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("Student");
      setAdminSecret("");
      setTeacherExpertise([]);
      setSelectedCategory("");
      setSelectedSubjectId("");
      setAvailableSubjects([]);
      // setFlash(json.message);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddExpertise = () => {
    if (!selectedSubjectId) {
      setError("Please choose a subject.");
      return;
    }

    const subject = availableSubjects.find(
      (s) => s.subject_id === Number(selectedSubjectId),
    );

    if (!subject) return;

    const alreadyExists = teacherExpertise.some(
      (s) => s.subject_id === subject.subject_id,
    );

    if (alreadyExists) {
      setError("You have already added this subject.");
      return;
    }

    setTeacherExpertise((prev) => [...prev, subject]);

    setSelectedSubjectId("");
    setSelectedCategory("");
    setAvailableSubjects([]);
    setError(null);
  };

  const handleRemoveExpertise = (subjectId) => {
    setTeacherExpertise((prev) =>
      prev.filter((subject) => subject.subject_id !== subjectId),
    );
  };

  useEffect(() => {
    if (role !== "Teacher") return;

    const fetchCategories = async () => {
      try {
        const response = await fetch("/subject-categories");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories.");
        }

        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, [role, setError]);

  useEffect(() => {
    if (!selectedCategory) {
      setAvailableSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);

      try {
        const response = await fetch(
          `/subject-categories/${selectedCategory}/subjects`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch subjects.");
        }

        setAvailableSubjects(data.subjects);
      } catch (err) {
        setError(err.message);
        setAvailableSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedCategory, setError]);
  useEffect(() => {
    checkPassword(password);
  }, [password]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Sign Up!</h1>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            id="username"
            name="username"
            value={username}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            value={password}
            required
          />
        </div>
        <div>
          <div
            style={{
              color: passwordStrengthStatus.length ? "black" : "gray",
            }}
          >
            {passwordStrengthStatus.length ? "✔" : "✖"} at least 8 characters
          </div>
          <div
            style={{
              color: passwordStrengthStatus.upper ? "black" : "gray",
            }}
          >
            {passwordStrengthStatus.upper ? "✔" : "✖"} one uppercase letter
          </div>
          <div
            style={{
              color: passwordStrengthStatus.lower ? "black" : "gray",
            }}
          >
            {passwordStrengthStatus.lower ? "✔" : "✖"} one lowercase letter
          </div>
          <div
            style={{
              color: passwordStrengthStatus.number ? "black" : "gray",
            }}
          >
            {passwordStrengthStatus.number ? "✔" : "✖"} one number
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            required
          />
        </div>
        {password && confirmPassword && password !== confirmPassword && (
          <div style={{ color: "gray", marginTop: "10px" }}>
            ✖ Passwords do not match
          </div>
        )}
        {password && confirmPassword && password === confirmPassword && (
          <div style={{ color: "black", marginTop: "10px" }}>
            ✔ Passwords match
          </div>
        )}

        <div style={{ marginTop: "5px" }}>If you're an employer, please:</div>
        <div>
          - Signup as an "admin" (the Admin secret is <strong>PejmanFSD</strong>
          ).
        </div>
        <div style={{ marginTop: "8px" }}>
          <label htmlFor="role">Sign up as:</label>
          <select
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);

              // If the user changes from Teacher to another role,
              // clear teacher expertise.
              if (newRole !== "Teacher") {
                setTeacherExpertise([]);
                setSelectedCategory("");
                setSelectedSubjectId("");
                setAvailableSubjects([]);
              }
            }}
            id="role"
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Principal">Principal</option>
            <option value="Admin">Admin</option>
          </select>
          {role === "Admin" && (
            <input
              type="password"
              placeholder="Enter Admin Secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
            />
          )}
          {role === "Teacher" && (
            <div style={{ marginTop: "15px" }}>
              <h3>Choose Your Expertise</h3>

              {/* Category dropdown */}
              <div>
                <label htmlFor="expertiseCategory">Choose a Category:</label>

                <select
                  id="expertiseCategory"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubjectId("");
                  }}
                >
                  <option value="">-- Select a Category --</option>

                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject dropdown */}
              {selectedCategory && (
                <div>
                  <label htmlFor="expertiseSubject">Choose a Subject:</label>

                  <select
                    id="expertiseSubject"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    disabled={loadingSubjects}
                  >
                    <option value="">
                      {loadingSubjects
                        ? "Loading subjects..."
                        : "-- Select a Subject --"}
                    </option>

                    {availableSubjects.map((subject) => (
                      <option
                        key={subject.subject_id}
                        value={subject.subject_id}
                      >
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    disabled={!selectedSubjectId || loadingSubjects}
                  >
                    Add Subject
                  </button>
                </div>
              )}

              {/* Selected expertise */}
              <div>
                <h4>My Expertise</h4>

                {teacherExpertise.length === 0 ? (
                  <p>You haven't selected any subjects yet.</p>
                ) : (
                  <ul>
                    {teacherExpertise.map((subject) => (
                      <li key={subject.subject_id}>
                        {subject.subject_name}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExpertise(subject.subject_id)
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          disabled={
            !username ||
            !password ||
            password !== confirmPassword ||
            !isStrongPassword(password) ||
            (role === "Teacher" && teacherExpertise.length === 0)
          }
        >
          Sign Up
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
