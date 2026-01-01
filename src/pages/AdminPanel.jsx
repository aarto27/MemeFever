import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../App.css";
import {
  getUsers,
  blockUser,
  unblockUser,
  getActivities,
  getPosts
} from "../api";

export default function AdminPanel() {
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    async function load() {
      try {
        const [
          usersData,
          logsData,
          postsData
        ] = await Promise.all([
          getUsers(),
          getActivities(),
          getPosts()
        ]);

        setUsers(usersData);
        setLogs(logsData);
        setPosts(postsData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function toggleBlock(target) {
    if (target.role === "admin") return;

    if (target.blocked) {
      await unblockUser(target.username);
    } else {
      await blockUser(target.username);
    }

    setUsers(prev =>
      prev.map(u =>
        u.username === target.username
          ? { ...u, blocked: !u.blocked }
          : u
      )
    );
  }

  function formatActivity(a) {
    if (a.type === "login")
      return "logged in";

    if (a.type === "comment")
      return "commented on a post";

    if (a.type === "reply")
      return `replied to @${a.targetUser}`;

    if (a.type === "like")
      return "liked a comment";

    return a.type;
  }

  function getPostById(postId) {
    return posts.find(p => p.id === postId);
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <h2>Admin Dashboard</h2>
        <p>Loading data…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Admin Dashboard</h2>

      {/* USERS */}
      <section className="admin-section">
        <h3>Users</h3>

        {users.map(u => (
          <div
            key={u.id}
            className={`admin-user ${
              u.blocked ? "blocked" : ""
            }`}
          >
            <span className="admin-username">
              @{u.username}
            </span>

            <span className="admin-role">
              {u.role}
            </span>

            <span className="admin-status">
              {u.blocked ? "Blocked" : "Active"}
            </span>

            {u.role !== "admin" && (
              <button
                onClick={() => toggleBlock(u)}
                className={
                  u.blocked
                    ? "unblock-btn"
                    : "block-btn"
                }
              >
                {u.blocked
                  ? "Unblock"
                  : "Block"}
              </button>
            )}
          </div>
        ))}
      </section>

      {/* ACTIVITY LOGS */}
      <section className="admin-section">
        <h3>Activity Log</h3>

        {logs.length === 0 && (
          <p>No activity recorded</p>
        )}

        {logs
          .slice()
          .reverse()
          .map(a => {
            const post = getPostById(a.postId);

            return (
              <div
                key={a.id}
                className="admin-log"
              >
                {post && (
                  <img
                    src={post.url}
                    alt={post.title}
                    className="admin-log-image"
                  />
                )}

                <div className="admin-log-content">
                  <div>
                    <strong>
                      @{a.actor}
                    </strong>{" "}
                    {formatActivity(a)}
                  </div>

                  {post && (
                    <div className="admin-log-title">
                      {post.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}
    