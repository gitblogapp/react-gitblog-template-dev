import type { Config } from "./config";
export function withBase(config: Config, value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  if (
    config.base &&
    (value === config.base ||
      value.startsWith(`${config.base}/`) ||
      value.startsWith(`${config.base}?`) ||
      value.startsWith(`${config.base}#`))
  )
    return value;
  return `${config.base}${value}`;
}
export const homePath = (config: Config, locale: string) =>
  withBase(config, locale === config.sourceLocale ? "/" : `/${locale}/`);
export const postPath = (config: Config, locale: string, slug: string) =>
  `${homePath(config, locale)}blog/${encodeURIComponent(slug)}/`;
export const searchPath = (config: Config, locale: string) =>
  `${homePath(config, locale)}search/`;
export const rssPath = (config: Config, locale: string) =>
  `${homePath(config, locale)}rss.xml`;
export const absolute = (config: Config, value: string) =>
  new URL(withBase(config, value), config.siteUrl).href;
