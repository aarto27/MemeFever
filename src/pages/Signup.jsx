import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, createUser } from "../api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [available, setAvailable] = useState(null);

  const navigate = useNavigate();

  // 🔍 CHECK USERNAME VIA API
  async function checkUsername(value) {
    setUsername(value);
    setError("");

    if (!value) {
      setAvailable(null);
      return;
    }

    const users = await getUsers();
    const exists = users.find(
      u => u.username === value
    );

    setAvailable(!exists);
  }

  async function handleSignup(e) {
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

    // ✅ SAVE USER TO DB.JSON
    await createUser({
      username,
      password
    });

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
          onChange={(e) =>
            checkUsername(e.target.value)
          }
        />

        {available === true && (
          <p className="success">
            Username available ✓
          </p>
        )}
        {available === false && (
          <p className="error">
            Username already taken
          </p>
        )}

        {/* PASSWORD */}
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
          <span
            className="eye"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="password-field">
          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Re-enter Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />
          <span
            className="eye"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        <button>Create Account</button>

        <p>
          Already have an account?
          <Link to="/login"> Log in</Link>
        </p>
      </form>
    </div>
  );
}
