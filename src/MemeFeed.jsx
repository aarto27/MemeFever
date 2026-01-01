import { useEffect, useState, useRef } from "react";
import MemeCard from "./components/MemeCard";
import Loader from "./components/Loader";
import CreatePost from "./components/CreatePost";
import { getPosts, createPost } from "./api";

function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.type === "upload" && b.type !== "upload") return -1;
    if (a.type !== "upload" && b.type === "upload") return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export default function MemeFeed({
  openPostId,
  showUpload,
  closeUpload
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadingRef = useRef(false);
  const seenUrls = useRef(new Set());
  const imgflipMemes = useRef([]);

  async function reloadPosts() {
    const all = await getPosts();
    setPosts(sortPosts(all));
  }

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
      type: "meme",
      title: meme.name,
      url: meme.url,
      subreddit: "imgflip",
      likes: [],
      createdAt: Date.now()
    };
  }

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
        type: "meme",
        title: data.title,
        url: data.url,
        subreddit: data.subreddit,
        likes: [],
        createdAt: Date.now()
      };
    } catch {
      return null;
    }
  }

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

      if (!meme) return;

      const created = await createPost(meme);

      setPosts(prev => [...prev, created]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      const existing = await getPosts();

      existing.forEach(
        p => p.url && seenUrls.current.add(p.url)
      );

      setPosts(sortPosts(existing));

      if (existing.length < 5) {
        for (let i = 0; i < 5; i++) {
          await loadMeme();
        }
      }
    }

    init();
  }, []);

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
        setPosts(prev =>
          sortPosts([target, ...prev])
        );
      }
    }

    ensurePost();
  }, [openPostId, posts]);


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
      <CreatePost
        open={showUpload}
        onClose={closeUpload}
        onPostCreated={reloadPosts}
      />

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
