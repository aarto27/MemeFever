import { useEffect, useState } from "react";
import CommentsPanel from "./CommentsPanel";
import ShareModal from "./ShareModal";
import { getPosts, createPost, updatePost } from "../api";

export default function MemeCard({
  meme,
  autoOpenComments = false
}) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [post, setPost] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;

  // 🔁 Ensure post exists in DB
  useEffect(() => {
    async function syncPost() {
      const posts = await getPosts();

      let existing = posts.find(
        p => p.url === meme.url
      );

      if (!existing) {
        existing = await createPost({
          url: meme.url,
          title: meme.title,
          subreddit: meme.subreddit,
          likes: []
        });
      }

      setPost(existing);
    }

    syncPost();
  }, [meme]);

  // ✅ AUTO-OPEN COMMENTS (FROM NOTIFICATION)
  useEffect(() => {
    if (autoOpenComments) {
      setShowComments(true);
    }
  }, [autoOpenComments]);

  // ❤️ TOGGLE LIKE (DB BASED)
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

  if (!post) return null;

  return (
    <>
      <div className="ig-card">
        <div className="ig-card-header">
          r/{post.subreddit}
        </div>

        <img
          src={post.url}
          alt={post.title}
          className="meme-img"
        />

        <div className="ig-actions">
          {/* ❤️ POST LIKE */}
          <button onClick={toggleLike}>
            {post.likes.includes(username)
              ? "❤️"
              : "🤍"}{" "}
            {post.likes.length}
          </button>

          {/* 💬 COMMENTS */}
          <button
            onClick={() => setShowComments(true)}
          >
            💬
          </button>

          {/* 📩 DM SHARE */}
          <button
            onClick={() => setShowShare(true)}
          >
            📩
          </button>
        </div>

        <div className="ig-caption">
          <strong>{post.title}</strong>
        </div>
      </div>

      {showComments && (
        <CommentsPanel
          meme={post}
          onClose={() =>
            setShowComments(false)
          }
        />
      )}

      {showShare && (
        <ShareModal
          meme={post}
          onClose={() =>
            setShowShare(false)
          }
        />
      )}
    </>
  );
}
