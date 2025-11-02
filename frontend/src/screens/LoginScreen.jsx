import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginScreen.css";

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Admin account credentials
    if (username === "admin" && password === "admin123") {
      login("admin");
    }
    // Regular user credentials
    else if (username === "dummy" && password === "123") {
      login("user");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="pistol-pete-large"></div>
          <h1>OSU Transit App</h1>
          <p>Go Pokes! Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="login-hint">
          <p>Demo credentials:</p>
          <p>
            <strong>Admin:</strong> Username: <strong>admin</strong> | Password:{" "}
            <strong>admin123</strong>
          </p>
          <p>
            <strong>User:</strong> Username: <strong>dummy</strong> | Password:{" "}
            <strong>123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
