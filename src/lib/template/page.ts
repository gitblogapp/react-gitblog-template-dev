import type { Site } from "./config";

/** Only these public fields cross the build/browser boundary. Never serialize Config or Post. */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  date: string;
  updated: string | null;
  cover: string | null;
  readingMinutes: number;
  access: "public" | "membership";
}
export interface Article extends ArticleSummary {
  html: string;
  toc: { id: string; text: string; level: number }[];
  giscusTerm: string;
  membershipId: string | null;
  previewAllowed: boolean;
  audioUrl: string | null;
  lastModified: string;
  aliases: string[];
}
export interface PageData {
  page: "home" | "search" | "post" | "404" | "custom";
  locale: string;
  site: Site;
  pathname: string;
  canonical: string;
  base: string;
  home: string;
  search: string;
  rss: string;
  year: number;
  title: string;
  description: string;
  markdown: boolean;
  languages: {
    locale: string;
    label: string;
    href: string;
    available: boolean;
  }[];
  alternates: { hreflang: string; href: string }[];
  posts: ArticleSummary[];
  post?: Article;
  customHtml?: string;
  integrations: {
    related: boolean;
    repository: string;
    limit: number;
    thumbnails: boolean;
    analytics: {
      enabled?: string;
      hubEnabled: string;
      hubUrl?: string;
      repository: string;
      siteUrl: string;
    };
  };
}
