import { useEffect, useState } from "react";
import CommentsPanel from "./CommentsPanel";
import ShareModal from "./ShareModal";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost
} from "../api";

export default function MemeCard({
  meme,
  autoOpenComments = false
}) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [post, setPost] = useState(null);
  const [deleted, setDeleted] = useState(false);

  // 🗑 delete modal
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;
  const isAdmin = user?.role === "admin";

  /* 🔁 Ensure post exists */
  useEffect(() => {
    async function syncPost() {
      const posts = await getPosts();

      let existing = posts.find(
        p => p.id === meme.id || p.url === meme.url
      );

      if (!existing) {
        existing = await createPost({
          type: meme.type || "meme",
          mediaType: meme.mediaType,
          url: meme.url,
          title: meme.title,
          caption: meme.caption,
          subreddit: meme.subreddit,
          username: meme.username,
          likes: [],
          createdAt: Date.now()
        });
      }

      setPost(existing);
    }

    syncPost();
  }, [meme]);

  /* 🔔 Auto-open comments */
  useEffect(() => {
    if (autoOpenComments) {
      setShowComments(true);
    }
  }, [autoOpenComments]);

  /* ❤️ Like */
  async function toggleLike() {
    if (!username || !post) return;

    const hasLiked = post.likes.includes(username);
    const updatedLikes = hasLiked
      ? post.likes.filter(u => u !== username)
      : [...post.likes, username];

    await updatePost(post.id, {
      likes: updatedLikes
    });

    setPost({
      ...post,
      likes: updatedLikes
    });
  }

  /* 🗑 Delete permissions */
  const canDelete =
    isAdmin ||
    (post?.type === "upload" &&
      post?.username === username);

  /* 🗑 Confirm delete */
  async function confirmDelete() {
    await deletePost(post.id);
    setDeleted(true);
    setShowDeleteModal(false);
  }

  if (!post || deleted) return null;

  return (
    <>
      <div className="ig-card">
        {/* 🔝 HEADER */}
        <div className="ig-card-header">
          {post.type === "upload" ? (
            <span className="post-username">
              @{post.username}
            </span>
          ) : (
            <span className="post-subreddit">
              r/{post.subreddit}
            </span>
          )}

          {/* 🗑 DELETE ICON */}
          {canDelete && (
            <button
              className="delete-post-btn"
              onClick={() =>
                setShowDeleteModal(true)
              }
            >
              🗑
            </button>
          )}
        </div>

        {/* 🖼 MEDIA */}
        {post.mediaType === "video" ? (
          <video
            src={post.url}
            controls
            className="meme-img"
          />
        ) : (
          <img
            src={post.url}
            alt=""
            className="meme-img"
          />
        )}

        {/* ❤️ 💬 📩 */}
        <div className="ig-actions">
          <button onClick={toggleLike}>
            {post.likes.includes(username)
              ? "❤️"
              : "🤍"}{" "}
            {post.likes.length}
          </button>

          <button
            onClick={() => setShowComments(true)}
          >
            💬
          </button>

          <button
            onClick={() => setShowShare(true)}
          >
            📩
          </button>
        </div>

        {/* 📝 CAPTION */}
        {(post.caption || post.title) && (
          <div className="ig-caption">
            {post.caption || post.title}
          </div>
        )}
      </div>

      {/* 💬 COMMENTS */}
      {showComments && (
        <CommentsPanel
          meme={post}
          onClose={() =>
            setShowComments(false)
          }
        />
      )}

      {/* 📩 SHARE */}
      {showShare && (
        <ShareModal
          meme={post}
          onClose={() =>
            setShowShare(false)
          }
        />
      )}

      {/* 🧨 DELETE MODAL */}
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
              onClick={() =>
                setShowDeleteModal(false)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
