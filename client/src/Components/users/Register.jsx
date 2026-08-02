import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ error, setError }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [adminSecret, setAdminSecret] = useState("");
  const [passwordStrengthStatus, setPasswordStrengthStatus] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });
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
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("Student");
      setAdminSecret("");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };
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
            onChange={(e) => setRole(e.target.value)}
            id="role"
          >
            <option value="Student">Student</option>
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
        </div>
        <button
          disabled={
            !username ||
            !password ||
            password !== confirmPassword ||
            !isStrongPassword(password)
          }
        >
          Sign Up
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
