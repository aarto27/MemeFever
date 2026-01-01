import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationsForUser,
  markNotificationRead
} from "../api";

export default function Header({ user, setUser, onUpload }) {
  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);

  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user?.username) return;

    async function load() {
      const data = await getNotificationsForUser(
        user.username
      );
      setNotifications(data);
    }

    load();
  }, [user]);

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  async function handleNotificationClick(n) {
    await markNotificationRead(n.id);

    setNotifications(prev =>
      prev.filter(x => x.id !== n.id)
    );

    setOpenNotif(false);

    navigate("/", {
      state: { openPostId: n.postId }
    });
  }

  function getNotificationText(n) {
    if (n.type === "like") return "liked your comment";
    if (n.type === "reply") return "replied to your comment";
    return "interacted with your comment";
  }

  return (
    <header className="ig-header">
      <div className="ig-header-inner">
      
        <h1
          className="logo"
          onClick={() => navigate("/")}
        >
          MemeVerse
        </h1>

        {user && (
          <div className="header-right">
            <span className="username">
              @{user.username}
            </span>

         
            <button
              className="upload-btn"
              onClick={onUpload}
            >
              ＋ Upload
            </button>

           
            {isAdmin && (
              <button
                className="admin-btn"
                onClick={() =>
                  navigate("/admin")
                }
              >
                Admin
              </button>
            )}

          
            <div className="notification-wrap">
              <button
                className="bell"
                onClick={() =>
                  setOpenNotif(!openNotif)
                }
              >
                🔔
                {notifications.length > 0 && (
                  <span className="badge">
                    {notifications.length}
                  </span>
                )}
              </button>

              {openNotif && (
                <div className="notification-modal">
                  <h4>Notifications</h4>

                  {notifications.length === 0 && (
                    <p className="no-notifications">
                      No new notifications
                    </p>
                  )}

                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className="notification-item"
                      onClick={() =>
                        handleNotificationClick(n)
                      }
                    >
                      <strong>@{n.from}</strong>{" "}
                      {getNotificationText(n)}
                    </div>
                  ))}
                </div>
              )}
            </div>

          
            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
