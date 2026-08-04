import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({
  error,
  setError,
  setCurrentUser,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // For navigating to the appropriate page after logging in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/login", {
        method: "POST",
        credentials: "include", // We're using sessions, so we need this line
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "Login failed");
        return;
      }
      setCurrentUser(json.user);
      setUsername("");
      setPassword("");
      const from = location.state?.from?.pathname || "/"; // Either navigate to "/" or
      // the page that required login and the user was trying to reach
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div>
          <label htmlFor="username">
            <strong>Username:</strong>
          </label>
          <div>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              name="username"
              value={username}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password">
            <strong>Password:</strong>
          </label>
          <div>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              value={password}
              required
            />
          </div>
        </div>
        <br />
        <button disabled={!username || !password || loading}>Login</button>
        {loading && <div>Logging in...</div>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
