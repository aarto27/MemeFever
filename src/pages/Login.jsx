import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../api";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const users = await getUsers();

      const found = users.find(
        u =>
          u.username === username &&
          u.password === password
      );

      if (!found) {
        setError(
          "Invalid username or password"
        );
        return;
      }

     
      if (found.blocked) {
        setError(
          "Your account has been blocked by admin"
        );
        return;
      }

     
      const user = {
        username: found.username,
        role: found.role
      };

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setUser(user);
      navigate("/");
    } catch (err) {
      setError(
        "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form
        className="auth-card"
        onSubmit={handleLogin}
      >
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => {
            setUsername(e.target.value);
            setError("");
          }}
        />

        
        <div className="password-field">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          <span
            className="eye"
            onClick={() =>
              setShowPassword(v => !v)
            }
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        <button disabled={loading}>
          {loading ? "Logging in…" : "Log In"}
        </button>

        <p>
          Don’t have an account?
          <Link to="/signup">
            {" "}
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
