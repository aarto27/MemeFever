import { useState } from "react";
import CommentsPanel from "./CommentsPanel";

export default function MemeCard({ meme, liked, onLike }) {
  const [showComments, setShowComments] = useState(false);

  function share() {
    navigator.clipboard.writeText(meme.url);
  }

  return (
    <>
      <div className="ig-card">
        <div className="ig-card-header">
          r/{meme.subreddit}
        </div>

        <img
          src={meme.url}
          alt={meme.title}
          className="meme-img"
        />

        <div className="ig-actions">
          <button onClick={() => onLike(meme.url)}>
            {liked ? "❤️" : "🤍"}
          </button>

          {/* 💬 COMMENT BUTTON */}
          <button
            onClick={() => setShowComments(true)}
          >
            💬
          </button>

          <button onClick={share}>📤</button>
        </div>

        <div className="ig-caption">
          <strong>{meme.title}</strong>
        </div>
      </div>

      {/* COMMENTS PANEL */}
      {showComments && (
        <CommentsPanel
          meme={meme}
          onClose={() =>
            setShowComments(false)
          }
        />
      )}
    </>
  );
}
