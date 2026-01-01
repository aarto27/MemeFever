const BASE_URL = "http://localhost:3001";

/* ================= USERS ================= */

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const createUser = async (user) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  return res.json();
};

/* 🔧 UPDATE USER (profile pic, block, etc.) */
export const updateUser = async (id, data) => {
  await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

/* ================= POSTS ================= */

export const getPosts = async () => {
  const res = await fetch(`${BASE_URL}/posts`);
  return res.json();
};

export const createPost = async (post) => {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });
  return res.json();
};

export const updatePost = async (postId, data) => {
  await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const deletePost = async (postId) => {
  await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "DELETE"
  });
};

/* ================= COMMENTS ================= */

export const getCommentsByPost = async (postId) => {
  const res = await fetch(
    `${BASE_URL}/comments?postId=${postId}`
  );
  return res.json();
};

export const createComment = async (comment) => {
  const res = await fetch(`${BASE_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment)
  });
  return res.json();
};

export const updateComment = async (commentId, data) => {
  await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const deleteComment = async (commentId) => {
  await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "DELETE"
  });
};

/* ================= DMs ================= */

export const sendDM = async (dm) => {
  await fetch(`${BASE_URL}/dms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dm)
  });
};

export const getDMsForUser = async (username) => {
  const res = await fetch(
    `${BASE_URL}/dms?to=${username}`
  );
  return res.json();
};

/* ================= NOTIFICATIONS ================= */

export const createNotification = async (n) => {
  await fetch(`${BASE_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
};

export const getNotificationsForUser = async (username) => {
  const res = await fetch(
    `${BASE_URL}/notifications?to=${username}&read=false`
  );
  return res.json();
};

export const markNotificationRead = async (id) => {
  await fetch(`${BASE_URL}/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true })
  });
};

/* ================= ADMIN ================= */

export const blockUser = async (username) => {
  const res = await fetch(
    `${BASE_URL}/users?username=${username}`
  );
  const users = await res.json();
  if (!users.length) return;

  await updateUser(users[0].id, {
    blocked: true
  });
};

export const unblockUser = async (username) => {
  const res = await fetch(
    `${BASE_URL}/users?username=${username}`
  );
  const users = await res.json();
  if (!users.length) return;

  await updateUser(users[0].id, {
    blocked: false
  });
};

export const getActivities = async () => {
  const res = await fetch(`${BASE_URL}/activities`);
  return res.json();
};
