import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="bottom-nav">
      <button
        className={isActive("/") ? "active" : ""}
        onClick={() => navigate("/")}
      >
        🏠
      </button>

      <button
        onClick={() =>
          document
            .querySelector(".upload-btn")
            ?.click()
        }
      >
        ➕
      </button>

      <button
        className={isActive("/profile") ? "active" : ""}
        onClick={() => navigate("/profile")}
      >
        👤
      </button>
    </nav>
  );
}
