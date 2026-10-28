import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Code2,
  Cpu,
  Heart,
  Info,
  Radio,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { AboutDialog } from "./components/AboutDialog";
import { TweetCard, XMark } from "./components/TweetCard";
import {
  formatCount,
  posts,
  readSaved,
  selectPosts,
  storageKey,
  topics,
  type Post,
  type Sort,
  type Topic,
} from "./lib";

const topicIcons = {
  "All tweets": Radio,
  "AI & agents": Cpu,
  Building: Code2,
  Community: Users,
};
const authors = [...new Map(posts.map((post) => [post.handle, post])).values()];
const likes = posts.reduce((total, post) => total + post.likes, 0);

function initialView() {
  return window.location.hash === "#saved" ? "saved" : "feed";
}

export function App() {
  const initialStorage = useMemo(readSaved, []);
  const [saved, setSaved] = useState(initialStorage.ids);
  const [storageUnavailable, setStorageUnavailable] = useState(
    initialStorage.unavailable,
  );
  const [view, setView] = useState(initialView);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Topic>("All tweets");
  const [sort, setSort] = useState<Sort>("likes");
  const [visibleCount, setVisibleCount] = useState(6);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [shareFallback, setShareFallback] = useState<Post | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const shareRef = useRef<HTMLDialogElement>(null);
  const result = selectPosts(query, topic, sort, view === "saved", saved);
  const shown = result.slice(0, visibleCount);

  useEffect(() => {
    const onHashChange = () => {
      setView(initialView());
      setQuery("");
      setTopic("All tweets");
      setVisibleCount(6);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (shareFallback && !shareRef.current?.open) shareRef.current?.showModal();
    if (!shareFallback && shareRef.current?.open) shareRef.current?.close();
  }, [shareFallback]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        setSaved(readSaved().ids);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function resetFilters() {
    setQuery("");
    setTopic("All tweets");
    setVisibleCount(6);
  }

  function goToFeed(savedOnly: boolean) {
    setView(savedOnly ? "saved" : "feed");
    resetFilters();
    window.location.hash = savedOnly ? "saved" : "feed";
    requestAnimationFrame(() => {
      feedRef.current?.scrollIntoView({ block: "start" });
      feedRef.current?.focus({ preventScroll: true });
    });
  }

  function savePost(post: Post) {
    const exists = saved.includes(post.id);
    const next = exists
      ? saved.filter((id) => id !== post.id)
      : [...saved, post.id];
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setStorageUnavailable(true);
    }
    setAnnouncement(
      `${exists ? "Removed" : "Saved"} ${post.author}’s tweet${exists ? " from saved." : "."}`,
    );
    if (exists && view === "saved")
      requestAnimationFrame(() =>
        feedRef.current?.focus({ preventScroll: true }),
      );
  }

  async function sharePost(post: Post) {
    setCopied(null);
    setAnnouncement("");
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(post.url);
      setCopied(post.id);
      setAnnouncement("Tweet link copied.");
    } catch {
      setShareFallback(post);
    }
  }

  function filterTopic(value: Topic) {
    setTopic(value);
    setVisibleCount(6);
  }

  return (
    <>
      <a className="skip-link" href="#feed">
        Skip to tweets
      </a>
      <header className="site-header">
        <div className="header-inner shell">
          <a
            href="#home"
            className="brand"
            aria-label="The Swamp home"
            onClick={() => {
              setView("feed");
              resetFilters();
              window.scrollTo({ top: 0 });
            }}
          >
            <img src="./favicon.svg" alt="" width="35" height="35" />
            <span>
              the swamp<span className="brand-period">.</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a
              href="#feed"
              onClick={(event) => {
                event.preventDefault();
                goToFeed(false);
              }}
              aria-current={view === "feed" ? "page" : undefined}
            >
              <Radio size={17} />
              <span>The feed</span>
            </a>
            <a
              href="#saved"
              onClick={(event) => {
                event.preventDefault();
                goToFeed(true);
              }}
              aria-current={view === "saved" ? "page" : undefined}
            >
              <Bookmark size={17} />
              <span>Saved</span>
              <span className="saved-count">{saved.length}</span>
            </a>
          </nav>
          <div className="header-utilities">
            <button
              type="button"
              className="icon-button"
              onClick={() => setAboutOpen(true)}
              aria-label="About this feed"
              title="About this feed"
            >
              <Info size={19} />
            </button>
            <a
              className="button button-secondary header-x"
              href="https://x.com/search?q=IdentityMD%20OR%20%22identity.md%22&f=top"
              target="_blank"
              rel="noopener noreferrer"
            >
              <XMark />
              Explore on X<ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </header>

      <main id="home" className="shell">
        {view === "feed" && (
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-art">
              <img
                src="./assets/swamp-squad.webp"
                alt="Three Pepes equipped with AI scanners and a glowing neural cube in a night-time swamp."
                width="1440"
                height="960"
                fetchPriority="high"
              />
            </div>
            <div className="hero-content">
              <h1 id="hero-title">
                IdentityMD.
                <br />
                <span>Above the noise.</span>
              </h1>
              <p>Top tweets from the IdentityMD community.</p>
              <a
                href="#feed"
                className="button button-primary"
                onClick={() => {
                  resetFilters();
                  feedRef.current?.focus({ preventScroll: true });
                }}
              >
                Explore top tweets
                <ArrowDown size={17} />
              </a>
            </div>
          </section>
        )}

        <div
          className={`snapshot-bar ${view === "saved" ? "saved-snapshot" : ""}`}
        >
          <span>
            <span className="snapshot-dot" />
            Public post snapshot
            <span className="snapshot-date"> · 28 Oct 2026</span>
          </span>
          <button
            type="button"
            className="plain-button"
            onClick={() => setAboutOpen(true)}
          >
            How this feed works
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="content-layout">
          <section
            id="feed"
            className="feed-section"
            ref={feedRef}
            tabIndex={-1}
            aria-labelledby="feed-title"
          >
            <div className="feed-heading">
              <div>
                <div className="heading-with-icon">
                  {view === "saved" ? (
                    <Bookmark size={22} />
                  ) : (
                    <Radio size={22} />
                  )}
                  {view === "saved" ? (
                    <h1 id="feed-title">Saved tweets</h1>
                  ) : (
                    <h2 id="feed-title">Top tweets</h2>
                  )}
                </div>
                <p>
                  {view === "saved"
                    ? "A little collection of good signal."
                    : "From builders, thinkers, and fellow Pepes."}
                </p>
              </div>
              <span className="post-total">
                {view === "saved" ? saved.length : posts.length}{" "}
                {view === "saved" && saved.length === 1 ? "tweet" : "tweets"}
              </span>
            </div>

            <div className="feed-toolbar">
              <div className="search-field">
                <Search size={18} />
                <label htmlFor="tweet-search">Search</label>
                <input
                  id="tweet-search"
                  ref={searchRef}
                  type="search"
                  placeholder="Tweets or people…"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisibleCount(6);
                  }}
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    className="icon-button clear-search"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="sort-field">
                <SlidersHorizontal size={16} />
                <label className="sr-only" htmlFor="sort-order">
                  Sort tweets
                </label>
                <select
                  id="sort-order"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as Sort);
                    setVisibleCount(6);
                  }}
                >
                  <option value="likes">Most liked</option>
                  <option value="newest">Newest first</option>
                  <option value="reposts">Most reposted</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </div>

            <div
              className="topic-filters"
              role="group"
              aria-label="Filter tweets by topic"
            >
              {topics.map((name) => {
                const Icon = topicIcons[name];
                return (
                  <button
                    type="button"
                    key={name}
                    className={
                      topic === name
                        ? "filter-button selected"
                        : "filter-button"
                    }
                    onClick={() => filterTopic(name)}
                    aria-pressed={topic === name}
                  >
                    <Icon size={15} />
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="results-line">
              <p role="status" aria-live="polite">
                {result.length
                  ? `${result.length} ${result.length === 1 ? "tweet" : "tweets"}${query.trim() ? ` matching “${query.trim()}”` : topic !== "All tweets" ? ` about ${topic.toLowerCase()}` : " in this snapshot"}`
                  : "No matching tweets"}
                <span className="sort-explanation">
                  {" "}
                  ·{" "}
                  {sort === "likes"
                    ? "ranked by captured likes"
                    : sort === "reposts"
                      ? "ranked by captured reposts"
                      : "newest first"}
                </span>
              </p>
              {(query || topic !== "All tweets") && (
                <button
                  type="button"
                  className="plain-button"
                  onClick={resetFilters}
                >
                  Reset filters
                  <X size={13} />
                </button>
              )}
            </div>
            {storageUnavailable && (
              <p className="storage-note" role="status">
                Browser storage is unavailable. Saves stay until this page
                reloads.
              </p>
            )}
            <div className="tweet-grid">
              {shown.map((post, index) => (
                <TweetCard
                  key={post.id}
                  post={post}
                  rank={index + 1}
                  saved={saved.includes(post.id)}
                  onSave={() => savePost(post)}
                  onShare={() => void sharePost(post)}
                />
              ))}
            </div>
            {result.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  {view === "saved" && !saved.length ? (
                    <Bookmark size={28} />
                  ) : (
                    <Search size={28} />
                  )}
                </div>
                <h3>
                  {view === "saved" && !saved.length
                    ? "Keep a little signal."
                    : "Nothing in this corner of the swamp."}
                </h3>
                <p>
                  {view === "saved" && !saved.length
                    ? "Select the bookmark on a tweet to keep it here. Saved only in this browser."
                    : query.trim()
                      ? `No tweets match “${query.trim()}”${topic !== "All tweets" ? ` in ${topic}` : ""}. Try another search or reset your filters.`
                      : `No saved tweets in ${topic}. Try another topic or reset your filters.`}
                </p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    if (view === "saved" && !saved.length) goToFeed(false);
                    else resetFilters();
                  }}
                >
                  {view === "saved" && !saved.length
                    ? "Explore the feed"
                    : "Reset filters"}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            {result.length > shown.length && (
              <button
                type="button"
                className="load-more button button-secondary"
                onClick={() => setVisibleCount((value) => value + 6)}
              >
                Show {Math.min(6, result.length - shown.length)} more tweets
                <ArrowDown size={16} />
              </button>
            )}
            {result.length > 0 && (
              <p className="feed-end">
                Showing {shown.length} of {result.length}{" "}
                {result.length === 1 ? "tweet" : "tweets"}
                <span />
                Good signal takes a little digging.
              </p>
            )}
          </section>

          <aside
            className="sidebar"
            aria-label="About the IdentityMD conversation"
          >
            <section className="sidebar-section pulse-section">
              <h2>The snapshot</h2>
              <div className="pulse-stats">
                <div>
                  <strong>{posts.length}</strong>
                  <span>Public posts</span>
                </div>
                <div>
                  <strong>{authors.length}</strong>
                  <span>Voices</span>
                </div>
                <div>
                  <strong>{formatCount(likes)}</strong>
                  <span>Likes captured</span>
                </div>
              </div>
              <p>
                One corner of the conversation.
                <br />
                Captured 28 October 2026.
              </p>
            </section>
            <section className="sidebar-section">
              <h2>In the mix</h2>
              <div className="topic-list">
                {topics
                  .filter((name) => name !== "All tweets")
                  .map((name) => {
                    const Icon = topicIcons[name];
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => {
                          filterTopic(name);
                          feedRef.current?.scrollIntoView({ block: "start" });
                        }}
                        aria-pressed={topic === name}
                      >
                        <span>
                          <Icon size={18} />
                          {name}
                        </span>
                        <span className="topic-count">
                          {posts.filter((post) => post.topic === name).length}
                          <ArrowUpRight size={14} />
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
            <section className="sidebar-section">
              <h2>Voices in the swamp</h2>
              <div className="avatar-stack">
                {authors.map((author) => (
                  <a
                    key={author.handle}
                    href={`https://x.com/${author.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${author.author} on X (opens in new tab)`}
                  >
                    <img
                      src={author.avatar}
                      width="36"
                      height="36"
                      alt=""
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
              <p>
                Different perspectives.
                <br />
                One very interesting experiment.
              </p>
            </section>
            <section className="swarm-note">
              <div className="swarm-note-icon">
                <Cpu size={25} />
                <span className="orbit-dot" />
              </div>
              <h2>
                Small frogs.
                <br />
                Big compute.
              </h2>
              <p>Meet the network behind the conversation.</p>
              <a
                href="https://imd.fun/"
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore IdentityMD
                <ArrowUpRight size={16} />
              </a>
            </section>
            <div className="sidebar-footnote">
              <Heart size={14} />
              <p>
                Independent community feed.
                <br />
                Not affiliated with IdentityMD or X.
              </p>
            </div>
          </aside>
        </div>
        <footer className="site-footer">
          <a
            className="footer-brand"
            href="#home"
            onClick={() => {
              setView("feed");
              resetFilters();
            }}
          >
            <img src="./favicon.svg" alt="" width="22" height="22" />
            the swamp.
          </a>
          <p>A little less noise. A little more green.</p>
          <button
            type="button"
            className="plain-button"
            onClick={() => setAboutOpen(true)}
          >
            About & sources
            <ArrowUpRight size={14} />
          </button>
        </footer>
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {copied && (
        <div className="copy-notice">
          <span>Tweet link copied</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Dismiss copied notification"
            onClick={() => setCopied(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <dialog
        ref={shareRef}
        className="share-dialog"
        aria-labelledby="share-title"
        onClose={() => setShareFallback(null)}
        onCancel={() => setShareFallback(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setShareFallback(null);
        }}
      >
        <div className="dialog-heading">
          <h2 id="share-title">Share this tweet</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close share link"
            onClick={() => setShareFallback(null)}
          >
            <X size={20} />
          </button>
        </div>
        <p>Automatic copying is unavailable. Select and copy this link:</p>
        <label htmlFor="share-url">Tweet link</label>
        <input
          id="share-url"
          type="url"
          readOnly
          value={shareFallback?.url ?? ""}
          onFocus={(event) => event.currentTarget.select()}
          autoFocus
        />
        <a
          className="text-link"
          href={shareFallback?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open original tweet
          <ArrowUpRight size={16} />
        </a>
      </dialog>
    </>
  );
}
