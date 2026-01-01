import { useEffect, useState } from "react";
import {
  getPosts,
  getUsers,
  updateUser,
  deletePost
} from "../api";

export default function Profile() {
  const session = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 🗑 delete modal state
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [postToDelete, setPostToDelete] =
    useState(null);

  useEffect(() => {
    async function load() {
      const users = await getUsers();
      const me = users.find(
        u => u.username === session.username
      );

      const allPosts = await getPosts();
      const mine = allPosts.filter(
        p =>
          p.type === "upload" &&
          p.username === session.username
      );

      setUser(me);
      setPosts(
        mine.sort(
          (a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        )
      );
      setLoading(false);
    }

    load();
  }, [session.username]);

  /* 📸 PROFILE PIC UPLOAD */
  async function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      await updateUser(user.id, {
        profilePic: reader.result
      });

      setUser(prev => ({
        ...prev,
        profilePic: reader.result
      }));

      setUploading(false);
    };

    reader.readAsDataURL(file);
  }

  /* 🗑 OPEN DELETE MODAL */
  function openDeleteModal(postId) {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  }

  /* ❌ CLOSE DELETE MODAL */
  function closeDeleteModal() {
    setPostToDelete(null);
    setShowDeleteModal(false);
  }

  /* ✅ CONFIRM DELETE */
  async function confirmDelete() {
    if (!postToDelete) return;

    await deletePost(postToDelete);

    setPosts(prev =>
      prev.filter(p => p.id !== postToDelete)
    );

    closeDeleteModal();
  }

  if (loading || !user) {
    return (
      <div className="profile-page">
        <p style={{ padding: 16 }}>
          Loading profile…
        </p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* 👤 PROFILE HEADER */}
      <div className="profile-header">
        <label className="profile-avatar">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
            />
          ) : (
            <span>
              {user.username[0].toUpperCase()}
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfilePicChange}
          />

          {uploading && (
            <div className="avatar-loading">
              Uploading…
            </div>
          )}
        </label>

        <div className="profile-meta">
          <h2>@{user.username}</h2>
          <div className="profile-stats">
            <div>
              <strong>{posts.length}</strong>
              <span>Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼 POSTS GRID */}
      {posts.length === 0 ? (
        <p className="no-posts">
          No posts yet. Upload your first photo 📸
        </p>
      ) : (
        <div className="profile-grid">
          {posts.map(post => (
            <div
              key={post.id}
              className="grid-item profile-post"
            >
              {post.mediaType === "video" ? (
                <video
                  src={post.url}
                  muted
                  loop
                />
              ) : (
                <img src={post.url} alt="" />
              )}

              {/* 🗑 DELETE ICON */}
              <button
                className="profile-delete-btn"
                onClick={() =>
                  openDeleteModal(post.id)
                }
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🧨 DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="delete-modal-backdrop">
          <div className="delete-modal">
            <h3>Delete post?</h3>
            <p>
              This action cannot be undone.
            </p>

            <button
              className="delete-confirm-btn"
              onClick={confirmDelete}
            >
              Delete
            </button>

            <button
              className="delete-cancel-btn"
              onClick={closeDeleteModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
