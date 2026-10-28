import data from "./data/posts.json";

export type Post = (typeof data.posts)[number];
export type Topic = "All tweets" | "AI & agents" | "Building" | "Community";
export type Sort = "likes" | "newest" | "reposts";
export const topics: Topic[] = [
  "All tweets",
  "AI & agents",
  "Building",
  "Community",
];
export const posts = data.posts;
export const capturedAt = data.capturedAt;
export const storageKey = "the-swamp:saved:v1";

export function selectPosts(
  query: string,
  topic: Topic,
  sort: Sort,
  savedOnly: boolean,
  saved: string[],
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts
    .filter((post) => {
      const text =
        `${post.text} ${post.author} ${post.handle} ${post.topic}`.toLocaleLowerCase();
      return (
        (!savedOnly || saved.includes(post.id)) &&
        (topic === "All tweets" || post.topic === topic) &&
        terms.every((term) => text.includes(term))
      );
    })
    .sort((a, b) => {
      if (sort === "newest")
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      const score =
        sort === "reposts" ? b.reposts - a.reposts : b.likes - a.likes;
      return score || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
}

export function readSaved(): { ids: string[]; unavailable: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    return { ids: [], unavailable: true };
  }
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return { ids: [], unavailable: false };
    const known = new Set(posts.map((post) => post.id));
    return {
      ids: [
        ...new Set(
          value.filter(
            (id): id is string => typeof id === "string" && known.has(id),
          ),
        ),
      ],
      unavailable: false,
    };
  } catch {
    return { ids: [], unavailable: false };
  }
}

export const formatCount = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
