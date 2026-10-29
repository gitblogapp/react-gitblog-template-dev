import { useEffect, useRef, useState } from "react";
import type { PageData } from "../lib/template/page";
import { copy } from "./copy";
import { Icon } from "./icons";

type Entry = {
  title: string;
  description: string;
  category: string;
  date: string;
  url: string;
};
type Pagefind = {
  search: (
    q: string | null,
    options: { filters: Record<string, string> },
  ) => Promise<{
    results: {
      data: () => Promise<{ url: string; meta: Record<string, string> }>;
    }[];
  }>;
};
export function Search({ data }: { data: PageData }) {
  const ui = copy(data.locale),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("");
  const [ready, setReady] = useState(false),
    [results, setResults] = useState<Entry[]>([]),
    [status, setStatus] = useState(ui.searchStart);
  const index = useRef<Promise<Pagefind> | null>(null);
  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(location.search);
      setQuery(params.get("q") || "");
      setCategory(params.get("category") || "");
      setReady(true);
    };
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const url = new URL(location.href);
      query.trim()
        ? url.searchParams.set("q", query.trim())
        : url.searchParams.delete("q");
      category
        ? url.searchParams.set("category", category)
        : url.searchParams.delete("category");
      history.replaceState(null, "", url);
      try {
        let found: Entry[] = [];
        if (!query.trim())
          found = data.posts.filter(
            (p) => !category || p.category === category,
          );
        else if (data.posts.length) {
          index.current ??= import(
            /* @vite-ignore */ `${data.base}/pagefind/pagefind.js`
          ) as Promise<Pagefind>;
          const response = await (
            await index.current
          ).search(query.trim(), {
            filters: { locale: data.locale, ...(category ? { category } : {}) },
          });
          found = await Promise.all(
            response.results.map(async (item) => {
              const entry = await item.data();
              return {
                title: entry.meta.title || "",
                description: entry.meta.description || "",
                category: entry.meta.category || "",
                date: entry.meta.date || "",
                url: entry.url,
              };
            }),
          );
        }
        if (!cancelled) {
          setResults(found);
          setStatus(found.length ? `${found.length} ${ui.results}` : ui.empty);
        }
      } catch {
        if (!cancelled) {
          index.current = null;
          setResults([]);
          setStatus(ui.error);
        }
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category, ready, data, ui]);
  return (
    <section className="search-page">
      <div className="breadcrumb">
        <Icon name="search" />
        {ui.search}
      </div>
      <header className="page-heading">
        <h1>{ui.searchTitle}</h1>
        <p>{ui.searchHint}</p>
      </header>
      <form
        className="search-form"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label className="search-input">
          <Icon name="search" />
          <span className="sr-only">{ui.search}</span>
          <input
            id="query"
            type="search"
            placeholder={ui.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="category-select">
          <span className="sr-only">{ui.topics}</span>
          <select
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{ui.all}</option>
            {[...new Set(data.posts.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Icon name="chevron" />
        </label>
      </form>
      <p className="search-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="search-results">
        {results.map((entry) => (
          <article className="search-result" key={entry.url}>
            <p className="post-meta">
              {entry.category} · {entry.date.slice(0, 10)}
            </p>
            <h2>
              <a href={entry.url}>
                {entry.title}
                <Icon name="arrow" />
              </a>
            </h2>
            <p>{entry.description}</p>
          </article>
        ))}
      </div>
      <noscript>
        <p>{ui.searchStart}</p>
        {data.posts.map((post) => (
          <p key={post.id}>
            <a href={post.url}>{post.title}</a>
          </p>
        ))}
      </noscript>
    </section>
  );
}
