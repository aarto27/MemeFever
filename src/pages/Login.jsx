import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const found = users.find(
      u => u.username === username && u.password === password
    );

    if (!found) {
      setError("Invalid username or password");
      return;
    }

    const user = { username };
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    navigate("/");
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
        />

        {/* PASSWORD TOGGLE RESTORED */}
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          <span
            className="eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button>Log In</button>

        <p>
          Don’t have an account?
          <Link to="/signup"> Sign up</Link>
        </p>
      </form>
    </div>
  );
}
