import { useState, useEffect } from "react";
import CommentActions from "./CommentActions";
import {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  createNotification
} from "../api";

function updateRepliesTree(replies, targetId, updater, capture) {
  return replies.map(r => {
    if (r.id === targetId) {
      capture && capture(r);
      return updater({
        ...r,
        replies: r.replies || []
      });
    }
    return {
      ...r,
      replies: updateRepliesTree(
        r.replies || [],
        targetId,
        updater,
        capture
      )
    };
  });
}

function removeReplyTree(replies, targetId) {
  return replies
    .filter(r => r.id !== targetId)
    .map(r => ({
      ...r,
      replies: removeReplyTree(r.replies || [], targetId)
    }));
}

export default function CommentsPanel({ meme, onClose }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;

  useEffect(() => {
    if (!meme?.id) return;
    async function load() {
      const data = await getCommentsByPost(meme.id);
      setComments(data);
    }
    load();
  }, [meme]);

  async function notify(to, type, commentId) {
    if (!to || to === username) return;
    await createNotification({
      to,
      from: username,
      type,
      postId: meme.id,
      commentId,
      read: false,
      time: Date.now()
    });
  }

  async function addComment() {
    if (!comment.trim()) return;
    const created = await createComment({
      postId: meme.id,
      username,
      text: comment,
      likes: [],
      replies: []
    });
    setComments(prev => [...prev, created]);
    setComment("");
  }

  async function toggleLike(c) {
    const hasLiked = c.likes.includes(username);
    const likes = hasLiked
      ? c.likes.filter(u => u !== username)
      : [...c.likes, username];

    await updateComment(c.id, { likes });

    setComments(prev =>
      prev.map(x =>
        x.id === c.id ? { ...x, likes } : x
      )
    );

    if (!hasLiked) await notify(c.username, "like", c.id);
  }

  async function addReply(rootId, parentId, text) {
    const newReply = {
      id: Date.now(),
      username,
      text,
      likes: [],
      replies: []
    };

    let targetUser = null;

    const updated = comments.map(c => {
      if (c.id !== rootId) return c;

      if (parentId === rootId) {
        targetUser = c.username;
        return {
          ...c,
          replies: [...c.replies, newReply]
        };
      }

      const replies = updateRepliesTree(
        c.replies,
        parentId,
        r => ({
          ...r,
          replies: [...r.replies, newReply]
        }),
        r => (targetUser = r.username)
      );

      return { ...c, replies };
    });

    setComments(updated);
    await updateComment(rootId, {
      replies: updated.find(c => c.id === rootId).replies
    });

    await notify(targetUser, "reply", rootId);
  }

  async function likeReply(rootId, replyId) {
    let targetUser = null;

    const updated = comments.map(c => {
      if (c.id !== rootId) return c;

      const replies = updateRepliesTree(
        c.replies,
        replyId,
        r => {
          const hasLiked = r.likes.includes(username);
          if (!hasLiked) targetUser = r.username;
          return {
            ...r,
            likes: hasLiked
              ? r.likes.filter(u => u !== username)
              : [...r.likes, username]
          };
        }
      );

      return { ...c, replies };
    });

    setComments(updated);
    await updateComment(rootId, {
      replies: updated.find(c => c.id === rootId).replies
    });

    await notify(targetUser, "like", rootId);
  }

  async function deleteReply(rootId, replyId) {
    const updated = comments.map(c =>
      c.id === rootId
        ? { ...c, replies: removeReplyTree(c.replies, replyId) }
        : c
    );
    setComments(updated);
    await updateComment(rootId, {
      replies: updated.find(c => c.id === rootId).replies
    });
  }

  async function removeComment(id) {
    await deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  function CommentItem({ comment, rootId }) {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const hasLiked = comment.likes.includes(username);

    return (
      <div className="comment">
        <span className="comment-user">@{comment.username}</span>
        <span className="comment-text">{comment.text}</span>

        <CommentActions
          likes={comment.likes.length}
          isLiked={hasLiked}
          isOwner={comment.username === username}
          onLike={() =>
            comment.id === rootId
              ? toggleLike(comment)
              : likeReply(rootId, comment.id)
          }
          onReplyToggle={() => setReplying(!replying)}
          onDelete={() =>
            comment.id === rootId
              ? removeComment(rootId)
              : deleteReply(rootId, comment.id)
          }
        />

        {replying && (
          <div className="reply-input">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
            />
            <button
              onClick={() => {
                if (!replyText.trim()) return;
                addReply(rootId, comment.id, replyText);
                setReplyText("");
                setReplying(false);
              }}
            >
              Post
            </button>
          </div>
        )}

        {comment.replies?.map(r => (
          <CommentItem
            key={r.id}
            comment={r}
            rootId={rootId}
          />
        ))}
      </div>
    );
  }

  if (!meme) return null;

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <span>Comments</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="post-caption">
        <span className="comment-user">@post</span>
        <span className="comment-text">{meme.title}</span>
      </div>

      <div className="comments-body">
        {comments.map(c => (
          <CommentItem
            key={c.id}
            comment={c}
            rootId={c.id}
          />
        ))}
      </div>

      <div className="comments-input">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={addComment}>Post</button>
      </div>
    </div>
  );
}
