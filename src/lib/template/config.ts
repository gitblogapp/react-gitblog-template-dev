import { publicUrl } from '@gitblogapp/core/seo';
import fs from "node:fs";
import path from "node:path";
import { readPublicSettings } from "../../../scripts/lib/site-settings.mjs";
import { siteAddress, pagesBase } from "../../../scripts/lib/site-config.mjs";
import { locales as configuredLocales } from "../../../scripts/lib/authoring.mjs";
import { aiPolicy, publicFlag } from "./ai-policy.ts";

export const normalizeLocale = (value: string) =>
  value.trim().replaceAll("_", "-").toLowerCase();
export const languageTag = (locale: string) => {
  try {
    return Intl.getCanonicalLocales(normalizeLocale(locale))[0];
  } catch {
    throw new Error(`Invalid locale: ${locale}`);
  }
};
export function readJson(file: string): Record<string, unknown> {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${file}: invalid JSON`, { cause: error });
  }
}
export function loadPublicEnv(
  root: string,
  _mode: string,
  environment: NodeJS.ProcessEnv = process.env,
) {
  return readPublicSettings(root, environment) as Record<string, string>;
}
export function loadConfig(
  root = process.cwd(),
  mode = process.env.NODE_ENV === "development" ? "development" : "production",
  environment: NodeJS.ProcessEnv = process.env,
) {
  const env = loadPublicEnv(root, mode, environment);
  const setting = (key: string, fallback = "") =>
    env[key] === undefined ? fallback : env[key].trim();
  const languages = configuredLocales(env);
  const sourceLocale: string = languages.source;
  const locales: string[] = [sourceLocale, ...languages.targets];
  const address = siteAddress(
    setting("PUBLIC_SITE_URL", "https://example.github.io"),
  );
  const base: string = pagesBase(env, address.url);
  const siteUrl = `${new URL(address.url).origin}${base}/`;
  const hubEnabled = publicFlag(env.PUBLIC_HUB_ENABLED);
  const repository =
    setting("GITHUB_REPOSITORY") || setting("PUBLIC_SITE_REPOSITORY");
  if (
    hubEnabled &&
    (repository.length > 200 || !/^[\w.-]+\/[\w.-]+$/.test(repository))
  )
    throw new Error(
      "Hub requires owner/repository in PUBLIC_SITE_REPOSITORY (or GITHUB_REPOSITORY)",
    );
  const provider = setting("PUBLIC_GISCUS_PROVIDER", "giscus");
  const host = new URL(
    setting(
      "PUBLIC_GISCUS_HOST",
      provider === "gitblog" ? "https://gitblog.app" : "https://giscus.app",
    ),
  );
  if (
    host.protocol !== "https:" ||
    host.username ||
    host.password ||
    host.pathname !== "/" ||
    host.search ||
    host.hash
  )
    throw new Error("PUBLIC_GISCUS_HOST must be an HTTPS origin");
  const site = {
    title: setting("PUBLIC_SITE_TITLE", "GitBlog"),
    tagline: setting("PUBLIC_SITE_TAGLINE"),
    description: setting("PUBLIC_SITE_DESCRIPTION"),
    footer: setting("PUBLIC_SITE_FOOTER"),
    author: setting("PUBLIC_SITE_OWNER"),
    authorUrl: setting("PUBLIC_AUTHOR_URL") ? publicUrl(setting("PUBLIC_AUTHOR_URL"), "PUBLIC_AUTHOR_URL") : "",
    authorSiteUrl: siteUrl,
    image: setting("PUBLIC_SITE_IMAGE"),
    giscusEnabled: publicFlag(env.PUBLIC_GISCUS_ENABLED),
    giscusHost: host.origin,
    giscusRepo: setting("PUBLIC_GISCUS_REPO"),
    giscusRepoId: setting("PUBLIC_GISCUS_REPO_ID"),
    giscusCategory: setting("PUBLIC_GISCUS_CATEGORY"),
    giscusCategoryId: setting("PUBLIC_GISCUS_CATEGORY_ID"),
    verification: setting("PUBLIC_GOOGLE_SITE_VERIFICATION"),
    bingVerification: setting("PUBLIC_BING_SITE_VERIFICATION"),
    socials: [
      {
        label: setting("PUBLIC_SOCIAL_GITHUB_LABEL", "GitHub"),
        url: setting("PUBLIC_SOCIAL_GITHUB_URL"),
      },
      {
        label: setting("PUBLIC_SOCIAL_X_LABEL", "X"),
        url: setting("PUBLIC_SOCIAL_X_URL"),
      },
    ].filter(({ url }) => /^https?:\/\//.test(url)),
  };
  return {
    root,
    env,
    sourceLocale,
    locales,
    siteUrl,
    base,
    hubEnabled,
    repository,
    site,
    buildCommit: setting("GITBLOG_BUILD_COMMIT") || null,
    policy: aiPolicy(env),
  };
}
export type Config = ReturnType<typeof loadConfig>;
export function localizedSite(config: Config, locale: string) {
  const copy =
    locale === config.sourceLocale
      ? {}
      : readJson(
          path.join(config.root, "content/translations", locale, "site.json"),
        );
  const site = { ...config.site, language: languageTag(locale) };
  for (const key of ["tagline", "description", "footer"] as const)
    if (typeof copy[key] === "string") site[key] = copy[key];
  return site;
}
export type Site = ReturnType<typeof localizedSite>;
