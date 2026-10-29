import { useEffect, useRef } from "react";
import { analyticsRequest } from "@gitblogapp/browser/analytics";
import { mountMembership } from "@gitblogapp/browser/membership";
import type { PageData, Article } from "./page";
import { copy } from "../../theme/copy";

export function useAnalytics(config: PageData["integrations"]["analytics"]) {
  useEffect(() => {
    const request = analyticsRequest(
      config,
      location.href,
      document.referrer,
      navigator.doNotTrack === "1" ||
        (navigator as Navigator & { globalPrivacyControl?: boolean })
          .globalPrivacyControl === true,
    );
    if (!request || import.meta.env.DEV) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sent = false;
    const send = () => {
      if (sent || document.visibilityState !== "visible") return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (sent || document.visibilityState !== "visible") return;
        sent = true;
        void fetch(request.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request.body),
          credentials: "omit",
          keepalive: true,
        }).catch(() => {});
      }, 800);
    };
    const hide = () => clearTimeout(timer);
    document.addEventListener("visibilitychange", send);
    window.addEventListener("pagehide", hide);
    send();
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", send);
      window.removeEventListener("pagehide", hide);
    };
  }, [config]);
}
export function PostIntegrations({
  data,
  post,
}: {
  data: PageData;
  post: Article;
}) {
  const member = useRef<HTMLElement>(null),
    related = useRef<HTMLElement>(null);
  useEffect(() => {
    const reader =
      member.current && post.membershipId
        ? mountMembership(member.current, {
            id: post.membershipId,
            locale: data.locale,
          })
        : undefined;
    if (related.current) {
      const script = document.createElement("script");
      script.src = "https://gitblog.app/related/v1/client.js";
      script.async = true;
      for (const [key, value] of Object.entries({
        repo: data.integrations.repository,
        "post-id": post.id,
        lang: data.locale,
        theme: "auto",
        "show-thumbnail": String(data.integrations.thumbnails),
        limit: String(data.integrations.limit),
      }))
        script.setAttribute(`data-${key}`, value);
      related.current.replaceChildren(script);
    }
    return () => reader?.destroy();
  }, [data.integrations, data.locale, post.id, post.membershipId]);
  return (
    <>
      {post.access === "membership" && (
        <section
          ref={member}
          className="membership-embed"
          data-member-id={post.membershipId}
          data-locale={data.locale}
          data-pagefind-ignore
        >
          <noscript>
            JavaScript is required to read this membership article.
          </noscript>
        </section>
      )}
      {data.integrations.related && (
        <section
          ref={related}
          className="related-panel"
          data-pagefind-ignore
          data-repo={data.integrations.repository}
          data-post-id={post.id}
          data-lang={data.locale}
          data-limit={data.integrations.limit}
        />
      )}
    </>
  );
}
export function Comments({ data, post }: { data: PageData; post: Article }) {
  const host = useRef<HTMLDivElement>(null),
    site = data.site;
  const enabled =
    site.giscusEnabled &&
    site.giscusRepo &&
    site.giscusRepoId &&
    site.giscusCategory &&
    site.giscusCategoryId;
  useEffect(() => {
    if (!enabled || !host.current) return;
    const script = document.createElement("script");
    script.src = `${site.giscusHost}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    const theme = () =>
      document.documentElement.dataset.theme === "dark"
        ? "dark_dimmed"
        : "light";
    const options = {
      repo: site.giscusRepo,
      "repo-id": site.giscusRepoId,
      category: site.giscusCategory,
      "category-id": site.giscusCategoryId,
      mapping: "specific",
      term: post.giscusTerm,
      strict: "0",
      "reactions-enabled": "1",
      "emit-metadata": "0",
      "input-position": "top",
      loading: "lazy",
      lang: data.locale.split("-")[0],
      theme: theme(),
    };
    for (const [key, value] of Object.entries(options))
      script.setAttribute(`data-${key}`, value);
    host.current.replaceChildren(script);
    const observer = new MutationObserver(() =>
      host.current
        ?.querySelector<HTMLIFrameElement>("iframe")
        ?.contentWindow?.postMessage(
          { giscus: { setConfig: { theme: theme() } } },
          site.giscusHost,
        ),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [enabled, site, data.locale, post.giscusTerm]);
  return enabled ? (
    <section className="comments" data-pagefind-ignore>
      <h2>{copy(data.locale).comments}</h2>
      <div className="giscus" ref={host} />
    </section>
  ) : null;
}
