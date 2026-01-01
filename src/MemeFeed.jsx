import { useEffect, useState, useRef } from "react";
import MemeCard from "./components/MemeCard";
import Loader from "./components/Loader";
import { getPosts, createPost } from "./api";

export default function MemeFeed({ openPostId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadingRef = useRef(false);
  const seenUrls = useRef(new Set());
  const imgflipMemes = useRef([]);

  /* ---------------- IMGFLIP ---------------- */
  async function loadImgflip() {
    if (imgflipMemes.current.length) return;

    const res = await fetch(
      "https://api.imgflip.com/get_memes"
    );
    const json = await res.json();
    imgflipMemes.current = json.data.memes;
  }

  function getImgflipMeme() {
    const list = imgflipMemes.current;
    if (!list.length) return null;

    let meme;
    let tries = 0;

    do {
      meme =
        list[Math.floor(Math.random() * list.length)];
      tries++;
    } while (
      seenUrls.current.has(meme.url) &&
      tries < 10
    );

    if (seenUrls.current.has(meme.url)) return null;

    seenUrls.current.add(meme.url);

    return {
      title: meme.name,
      url: meme.url,
      subreddit: "imgflip",
      likes: []
    };
  }

  /* ---------------- REDDIT ---------------- */
  async function getRedditMeme() {
    try {
      const res = await fetch(
        "https://meme-api.com/gimme/memes"
      );
      const data = await res.json();

      if (seenUrls.current.has(data.url))
        return null;

      seenUrls.current.add(data.url);

      return {
        title: data.title,
        url: data.url,
        subreddit: data.subreddit,
        likes: []
      };
    } catch {
      return null;
    }
  }

  /* ---------------- LOAD SINGLE POST ---------------- */
  async function loadMeme() {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      await loadImgflip();

      let meme =
        Math.random() < 0.5
          ? getImgflipMeme()
          : await getRedditMeme();

      if (!meme) meme = await getRedditMeme();
      if (!meme) return;

      const created = await createPost(meme);
      setPosts(prev => [...prev, created]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    async function init() {
      const existing = await getPosts();

      existing.forEach(p =>
        seenUrls.current.add(p.url)
      );

      setPosts(existing);

      if (existing.length < 5) {
        for (let i = 0; i < 5; i++) {
          await loadMeme();
        }
      }
    }

    init();
  }, []);

  /* ✅ ENSURE POST EXISTS WHEN OPENING FROM NOTIFICATION */
  useEffect(() => {
    if (!openPostId) return;

    async function ensurePost() {
      const already = posts.find(
        p => p.id === openPostId
      );
      if (already) return;

      const all = await getPosts();
      const target = all.find(
        p => p.id === openPostId
      );

      if (target) {
        setPosts(prev => [target, ...prev]);
      }
    }

    ensurePost();
  }, [openPostId, posts]);

  /* ---------------- INFINITE SCROLL ---------------- */
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        loadMeme();
      }
    }

    window.addEventListener("scroll", onScroll);
    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="app">
      {posts.map(post => (
        <MemeCard
          key={post.id}
          meme={post}
          autoOpenComments={
            post.id === openPostId
          }
        />
      ))}

      {loading && <Loader />}
    </main>
  );
}
