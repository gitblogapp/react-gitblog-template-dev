import type { Site } from "./config";
import type { Article } from "./page";
export type ExtensionSlot =
  "article-before-body" | "article-after-body" | "site-footer";
export interface ExtensionContext {
  site: Site;
  locale: string;
  pathname: string;
  post?: Article;
}
export const themeApiVersion = 1;
export const extensionApiVersion = 1;
