export default function CommentActions({
  commentId,
  likes,
  isOwner,
  onLike,
  onReplyToggle,
  onDelete
}) {
  function handleDelete() {
    const ok = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (ok) {
      onDelete(commentId);
    }
  }

  return (
    <div className="comment-actions">
      <button onClick={() => onLike(commentId)}>
        ❤️ {likes}
      </button>

      <button onClick={onReplyToggle}>
        ↩ Reply
      </button>

      {isOwner && (
        <button
          className="delete-btn"
          onClick={handleDelete}
        >
          🗑 Delete
        </button>
      )}
    </div>
  );
}
