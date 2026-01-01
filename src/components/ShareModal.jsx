import { useState, useEffect } from "react";
import { getUsers, sendDM } from "../api";

export default function ShareModal({ meme, onClose }) {
  const currentUser =
    JSON.parse(localStorage.getItem("user"))?.username;

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [delivered, setDelivered] = useState(false);

  /* 🔄 LOAD USERS FROM DB */
  useEffect(() => {
    async function loadUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);

  function toggleUser(username) {
    setSelected(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  }

  /* 📩 SEND DMs TO DB */
  async function sendMessage() {
    for (const username of selected) {
      await sendDM({
        from: currentUser,
        to: username,
        post: {
          id: meme.id,
          title: meme.title,
          url: meme.url
        },
        time: Date.now()
      });
    }

    setDelivered(true);
  }

  /* 🔥 AUTO CLOSE AFTER DELIVERED */
  useEffect(() => {
    if (!delivered) return;

    const timer = setTimeout(() => {
      onClose();
    }, 1200);

    return () => clearTimeout(timer);
  }, [delivered, onClose]);

  const filteredUsers = users
    .filter(u => u.username !== currentUser)
    .filter(u =>
      u.username
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="share-overlay">
      <div className="share-modal">
        {delivered ? (
          <div className="share-delivered">
            <span className="delivered-icon">✅</span>
            <p className="delivered-text">
              Delivered
            </p>
          </div>
        ) : (
          <>
            <div className="share-header">
              <span>Send to</span>
              <button onClick={onClose}>✖</button>
            </div>

            <div className="share-search">
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="share-users">
              {filteredUsers.length === 0 && (
                <p className="no-users">
                  No users found
                </p>
              )}

              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className={`share-user ${
                    selected.includes(u.username)
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleUser(u.username)
                  }
                >
                  @{u.username}
                </div>
              ))}
            </div>

            <button
              className="share-send"
              disabled={!selected.length}
              onClick={sendMessage}
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}
