import { useEffect, useState, useRef } from "react";
import MemeCard from "./components/MemeCard";
import Loader from "./components/Loader";

export default function MemeFeed() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const seenMemes = useRef(new Set());
  const imgflipMemes = useRef([]);

  async function loadImgflip() {
    if (imgflipMemes.current.length) return;
    const res = await fetch("https://api.imgflip.com/get_memes");
    const json = await res.json();
    imgflipMemes.current = json.data.memes;
  }

  function getImgflipMeme() {
    const list = imgflipMemes.current;
    if (!list.length) return null;
    let meme;
    let tries = 0;
    do {
      meme = list[Math.floor(Math.random() * list.length)];
      tries++;
    } while (seenMemes.current.has(meme.url) && tries < 10);
    if (seenMemes.current.has(meme.url)) return null;
    seenMemes.current.add(meme.url);
    return { title: meme.name, url: meme.url, subreddit: "imgflip" };
  }

  async function getRedditMeme() {
    try {
      const res = await fetch("https://meme-api.com/gimme/memes");
      const data = await res.json();
      if (seenMemes.current.has(data.url)) return null;
      seenMemes.current.add(data.url);
      return data;
    } catch (e) { return null; }
  }

  async function loadMeme() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      await loadImgflip();
      const useImgflip = Math.random() < 0.5;
      let meme = useImgflip ? getImgflipMeme() : await getRedditMeme();
      
      if (!meme) meme = await getRedditMeme();
      if (meme) setMemes(prev => [...prev, meme]);
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  // Sequential batch loader to prevent the loadingRef block
  async function loadBatch(count) {
    for (let i = 0; i < count; i++) {
      await loadMeme();
    }
  }

  useEffect(() => {
    loadBatch(5); // Load 5 memes initially on refresh
  }, []);

  useEffect(() => {
    function onScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMeme();
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="app">
      {memes.map((meme) => (
        // Use meme.url as key instead of index for better React performance
        <MemeCard key={meme.url} meme={meme} />
      ))}
      {loading && <Loader />}
    </main>
  );
}