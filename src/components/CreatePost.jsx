import { useState } from "react";
import { createPost } from "../api";
import "../App.css";

export default function CreatePost({
  open,
  onClose,
  onPostCreated
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function closeModal() {
    onClose();
    setFile(null);
    setPreview(null);
    setCaption("");
    setLoading(false);
  }

  async function handlePost() {
    if (!file || loading || !user) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const post = {
        type: "upload",
        mediaType: file.type.startsWith("video")
          ? "video"
          : "image",
        url: reader.result,
        caption,
        username: user.username,
        likes: [],
        createdAt: Date.now()
      };

      try {
        await createPost(post);
        closeModal();
        onPostCreated();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="upload-modal-backdrop">
      <div className="upload-modal">
        <h3>Create Post</h3>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
        />

        {preview && (
          <>
            {file.type.startsWith("video") ? (
              <video src={preview} controls />
            ) : (
              <img src={preview} alt="preview" />
            )}
          </>
        )}

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={e =>
            setCaption(e.target.value)
          }
        />

        <div className="upload-actions">
          <button
            className="cancel-btn"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            className="post-btn"
            disabled={!file || loading}
            onClick={handlePost}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
