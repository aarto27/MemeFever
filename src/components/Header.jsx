import { useNavigate } from "react-router-dom";

export default function Header({ setUser }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  function logout() {
    // 1. Clear local storage
    localStorage.removeItem("user");
    // 2. Clear React state to trigger UI update (removes Header, redirects to Login)
    setUser(null);
    // 3. Navigate to login page
    navigate("/login");
  }

  return (
    <header className="ig-header">
      <div className="ig-header-inner">
        <h1 className="logo">MemeVerse</h1>
        {user && (
          <div className="header-right">
            <span className="username">@{user.username}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}