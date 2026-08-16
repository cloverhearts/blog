import assert from "node:assert/strict";
import test from "node:test";

import {
  OPEN_GRAPH_PREFIX,
  createPostOpenGraphTags,
  renderOpenGraphMetaTags,
  selectPostOpenGraphImage,
} from "../../apps/blog-web/src/seo/open-graph.ts";

const input = {
  title: "C++ 프로그래밍에 대해서",
  description: "좋은 C++ 프로그램을 설계하기 위한 기본 원칙입니다.",
  canonicalUrl: "https://example.com/ko/posts/cpp-programming/",
  siteName: "CloverHearts Blog",
  locale: "ko_KR",
  alternateLocales: ["en_US", "ko_KR", "ja_JP", "en_US"],
  publishedTime: "2026-09-13T13:00:00+09:00",
  modifiedTime: "2026-09-14T13:00:00+09:00",
  section: "프로그래밍",
  tags: ["C++", "방법론", "C++"],
  image: {
    url: "https://example.com/_assets/social/cpp-programming.ko.png",
    mediaType: "image/png",
    width: 1200,
    height: 630,
    alt: "C++ 코드와 메모리 구조를 표현한 미리보기",
  },
} as const;

test("creates complete, localized article Open Graph tags", () => {
  assert.equal(
    OPEN_GRAPH_PREFIX,
    "og: https://ogp.me/ns# article: https://ogp.me/ns/article#",
  );
  const tags = createPostOpenGraphTags(input);
  const properties = tags.map(({ property }) => property);

  for (const required of ["og:title", "og:type", "og:image", "og:url"] as const) {
    assert.equal(properties.includes(required), true);
  }
  assert.deepEqual(properties.slice(0, 9), [
    "og:title",
    "og:type",
    "og:image",
    "og:image:secure_url",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
    "og:url",
  ]);
  assert.deepEqual(
    tags.filter(({ property }) => property === "og:locale:alternate"),
    [
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:locale:alternate", content: "ja_JP" },
    ],
  );
  assert.equal(
    tags.find(({ property }) => property === "article:published_time")?.content,
    input.publishedTime,
  );
  assert.equal(
    tags.filter(({ property }) => property === "article:tag").length,
    2,
  );
});

test("escapes metadata before rendering it into static HTML", () => {
  const tags = createPostOpenGraphTags({
    ...input,
    title: 'C++ <guide> & "patterns"',
  });
  const html = renderOpenGraphMetaTags(tags);
  assert.match(html, /C\+\+ &lt;guide&gt; &amp; &quot;patterns&quot;/u);
  assert.doesNotMatch(html, /<guide>/u);
});

test("rejects non-HTTPS URLs and incomplete image metadata", () => {
  assert.throws(() =>
    createPostOpenGraphTags({ ...input, canonicalUrl: "http://example.com/post/" }),
  );
  assert.throws(() =>
    createPostOpenGraphTags({
      ...input,
      image: { ...input.image, alt: "" },
    }),
  );
  assert.throws(() =>
    createPostOpenGraphTags({
      ...input,
      image: { ...input.image, width: 0 },
    }),
  );
});

test("follows the owner-approved representative image mode", () => {
  const generatedCard = input.image;
  const cover = { ...input.image, url: "https://example.com/cover.png" };
  const socialImage = {
    ...input.image,
    url: "https://example.com/social.png",
  };

  assert.equal(
    selectPostOpenGraphImage({
      representativeImage: "social-image",
      socialImage,
      cover,
      generatedCard,
    }).kind,
    "social-image",
  );
  assert.equal(
    selectPostOpenGraphImage({
      representativeImage: "cover",
      cover,
      generatedCard,
    }).kind,
    "cover",
  );
  assert.equal(
    selectPostOpenGraphImage({
      representativeImage: "generated-card",
      cover,
      generatedCard,
    }).kind,
    "generated-card",
  );
  assert.throws(() =>
    selectPostOpenGraphImage({
      representativeImage: "social-image",
      generatedCard,
    }),
  );
  assert.throws(() =>
    selectPostOpenGraphImage({
      representativeImage: "cover",
      generatedCard,
    }),
  );
  assert.throws(() =>
    selectPostOpenGraphImage({
      representativeImage: "invalid" as never,
      generatedCard,
    }),
  );
});
