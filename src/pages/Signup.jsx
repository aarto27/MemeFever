import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [available, setAvailable] = useState(null);

  const navigate = useNavigate();

  function checkUsername(value) {
    setUsername(value);
    setError("");

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(u => u.username === value);

    if (!value) setAvailable(null);
    else setAvailable(!exists);
  }

  function handleSignup(e) {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!available) {
      setError("Username already taken");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    navigate("/login");
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSignup}>
        <h2>Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => checkUsername(e.target.value)}
        />

        {available === true && (
          <p className="success">Username available ✓</p>
        )}
        {available === false && (
          <p className="error">Username already taken</p>
        )}

        {/* PASSWORD TOGGLE */}
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* CONFIRM PASSWORD TOGGLE */}
        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />
          <span
            className="eye"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button>Create Account</button>

        <p>
          Already have an account?
          <Link to="/login"> Log in</Link>
        </p>
      </form>
    </div>
  );
}
