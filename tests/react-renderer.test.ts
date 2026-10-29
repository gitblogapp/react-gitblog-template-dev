import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "cheerio";
import { loadBlog } from "../src/lib/template/content";
import { loadConfig } from "../src/lib/template/config";
import { pageData } from "../src/lib/template/page-data";
import { renderPage } from "../src/lib/template/document";
import { seedContent } from "./helpers/fixture";

test("React renders public content before hydration and never serializes build credentials or draft data", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "react-renderer-"));
  try {
    seedContent(root);
    const blog = loadBlog(
      loadConfig(root, "production", {
        DEEPL_API_KEY: "PRIVATE_API_SENTINEL",
        GITHUB_TOKEN: "PRIVATE_TOKEN_SENTINEL",
      }),
    );
    const post = blog.posts[0];
    post.metadata.privateNote = "PRIVATE_METADATA_SENTINEL";
    const data = pageData(blog, "ko", "post", post);
    const html = renderPage(data, {
      script: "/blog/assets/client.js",
      styles: [],
    });
    const $ = load(html);
    assert.ok($(".article-content").text().includes("STATIC_PUBLIC_SENTINEL"));
    for (const secret of [
      "PRIVATE_API_SENTINEL",
      "PRIVATE_TOKEN_SENTINEL",
      "PRIVATE_METADATA_SENTINEL",
      "PRIVATE_DRAFT_SENTINEL",
      root,
    ])
      assert.ok(!html.includes(secret), secret);
    const payload = JSON.parse($("#page-data").text());
    assert.equal(payload.post.id, post.id);
    assert.equal(payload.post.metadata, undefined);
    assert.equal(payload.env, undefined);
    assert.equal(payload.posts.length, 1);
    assert.equal(
      $("link[rel=canonical]").attr("href"),
      "https://fixture.github.io/blog/blog/fixture-%EA%B8%80%20%EA%B3%B5%EB%B0%B1/",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("serialized page data cannot terminate its script element", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "react-escape-"));
  try {
    seedContent(root);
    const blog = loadBlog(loadConfig(root, "production", {}));
    const title = '</script><script id="unwanted">alert(1)</script>';
    blog.posts[0].title = title;
    const $ = load(
      renderPage(pageData(blog, "ko", "post", blog.posts[0]), {
        script: "/client.js",
        styles: [],
      }),
    );
    assert.equal($("#unwanted").length, 0);
    assert.equal($("#post-title").text(), title);
    assert.equal(JSON.parse($("#page-data").text()).post.title, title);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
