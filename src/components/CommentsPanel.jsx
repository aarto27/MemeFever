import { useState, useEffect } from "react";
import CommentActions from "./CommentActions";

export default function CommentsPanel({ meme, onClose }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!meme) return;
    const saved =
      JSON.parse(
        localStorage.getItem(`comments-${meme.url}`)
      ) || [];
    setComments(saved);
  }, [meme]);

  function save(updated) {
    setComments(updated);
    localStorage.setItem(
      `comments-${meme.url}`,
      JSON.stringify(updated)
    );
  }

  function addComment() {
    if (!comment.trim()) return;

    save([
      ...comments,
      {
        id: Date.now(),
        username: user?.username || "anonymous",
        text: comment,
        likes: 0,
        replies: []
      }
    ]);

    setComment("");
  }

  function likeById(list, id) {
    return list.map(c =>
      c.id === id
        ? { ...c, likes: c.likes + 1 }
        : {
            ...c,
            replies: likeById(c.replies, id)
          }
    );
  }

  function replyById(list, id, text) {
    return list.map(c =>
      c.id === id
        ? {
            ...c,
            replies: [
              ...c.replies,
              {
                id: Date.now(),
                username:
                  user?.username || "anonymous",
                text,
                likes: 0,
                replies: []
              }
            ]
          }
        : {
            ...c,
            replies: replyById(c.replies, id, text)
          }
    );
  }

  function deleteById(list, id) {
    return list
      .filter(c => c.id !== id)
      .map(c => ({
        ...c,
        replies: deleteById(c.replies, id)
      }));
  }

  if (!meme) return null;

  return (
    <div className="comments-panel">
      {/* HEADER */}
      <div className="comments-header">
        <span>Comments</span>
        <button onClick={onClose}>✖</button>
      </div>

      {/* 📝 POST CAPTION */}
      <div className="post-caption">
        <span className="comment-user">
          @post
        </span>
        <span className="comment-text">
          {meme.title}
        </span>
      </div>

      <div className="comments-body">
        {comments.length === 0 && (
          <p className="no-comments">
            No comments yet 👀
          </p>
        )}

        {comments.map(c => (
          <CommentItem
            key={c.id}
            comment={c}
            currentUser={user?.username}
            onLike={id =>
              save(likeById(comments, id))
            }
            onReply={(id, text) =>
              save(replyById(comments, id, text))
            }
            onDelete={id =>
              save(deleteById(comments, id))
            }
          />
        ))}
      </div>

      <div className="comments-input">
        <input
          placeholder="Add a comment..."
          value={comment}
          onChange={e =>
            setComment(e.target.value)
          }
        />
        <button onClick={addComment}>
          Post
        </button>
      </div>
    </div>
  );
}

/* 🔹 SINGLE COMMENT (RECURSIVE) */
function CommentItem({
  comment,
  currentUser,
  onLike,
  onReply,
  onDelete
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="comment">
      <span className="comment-user">
        @{comment.username}
      </span>

      <span className="comment-text">
        {comment.text}
      </span>

      <CommentActions
        commentId={comment.id}
        likes={comment.likes}
        isOwner={
          comment.username === currentUser
        }
        onLike={onLike}
        onReplyToggle={() =>
          setReplying(!replying)
        }
        onDelete={onDelete}
      />

      {replying && (
        <div className="reply-input">
          <input
            placeholder="Write a reply..."
            value={replyText}
            onChange={e =>
              setReplyText(e.target.value)
            }
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onReply(comment.id, replyText);
              setReplyText("");
              setReplying(false);
            }}
          >
            Post
          </button>
        </div>
      )}

      {comment.replies.map(r => (
        <div key={r.id} className="reply">
          <CommentItem
            comment={r}
            currentUser={currentUser}
            onLike={onLike}
            onReply={onReply}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
