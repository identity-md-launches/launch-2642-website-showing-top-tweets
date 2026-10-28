import {
  ArrowUpRight,
  Bookmark,
  Check,
  Eye,
  Heart,
  Repeat2,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { type Post, formatCount, formatDate } from "../lib";

export function XMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.8-9L.8 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
    </svg>
  );
}

export function TweetCard({
  post,
  rank,
  saved,
  onSave,
  onShare,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  return (
    <article
      className="tweet-card"
      aria-label={`Tweet by ${post.author}`}
      data-post-id={post.id}
    >
      <div className="tweet-topline">
        <span className="rank">{String(rank).padStart(2, "0")}</span>
        <span className="topic-label">{post.topic}</span>
        <XMark />
      </div>
      <div className="tweet-author">
        <a
          href={`https://x.com/${post.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="author-avatar"
          aria-label={`${post.author}'s X profile (opens in new tab)`}
        >
          {avatarFailed ? (
            <span>{post.author.slice(0, 1)}</span>
          ) : (
            <img
              src={post.avatar}
              alt=""
              width="40"
              height="40"
              loading="lazy"
              onError={() => setAvatarFailed(true)}
            />
          )}
        </a>
        <div className="author-details">
          <a
            className="author-name"
            href={`https://x.com/${post.handle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {post.author}
            <ArrowUpRight size={13} />
          </a>
          <span className="author-handle">@{post.handle}</span>
        </div>
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      </div>
      <blockquote>
        {post.text}
        {post.excerpt && <span aria-label="Excerpt continues"> …</span>}
      </blockquote>
      <div className="tweet-readline">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${post.excerpt ? "Read full tweet" : "Read on X"} by ${post.author}, ${formatDate(post.createdAt)} (opens in new tab)`}
        >
          Read {post.excerpt ? "full tweet" : "on X"}
          <ArrowUpRight size={14} />
        </a>
        <span>{post.excerpt ? "Tweet excerpt" : "Tweet"}</span>
      </div>
      <div className="tweet-bottom">
        <div className="metrics" aria-label="Engagement at capture">
          <span title={`${post.likes.toLocaleString()} likes`}>
            <Heart size={15} />
            <span>{formatCount(post.likes)}</span>
            <span className="sr-only"> likes</span>
          </span>
          <span title={`${post.reposts.toLocaleString()} reposts`}>
            <Repeat2 size={16} />
            <span>{formatCount(post.reposts)}</span>
            <span className="sr-only"> reposts</span>
          </span>
          <span title={`${post.views.toLocaleString()} views`}>
            <Eye size={16} />
            <span>{formatCount(post.views)}</span>
            <span className="sr-only"> views</span>
          </span>
        </div>
        <div className="tweet-actions">
          <button
            type="button"
            className="icon-button share-button"
            onClick={onShare}
            aria-label={`Share ${post.author}'s ${formatDate(post.createdAt)} tweet`}
            title="Copy tweet link"
          >
            <Share2 size={17} />
          </button>
          <button
            type="button"
            className={`icon-button bookmark-button ${saved ? "is-saved" : ""}`}
            onClick={onSave}
            aria-pressed={saved}
            aria-label={`${saved ? "Unsave" : "Save"} ${post.author}'s ${formatDate(post.createdAt)} tweet`}
            title={saved ? "Remove from saved" : "Save tweet"}
          >
            {saved ? <Check size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}
