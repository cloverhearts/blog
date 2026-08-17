import type { SupportedLanguage } from "../../../../packages/project-config/src/i18n.ts";

export interface BlogMessages {
  readonly allowAnalytics: string;
  readonly archive: string;
  readonly backHome: string;
  readonly categories: string;
  readonly closeNavigation: string;
  readonly denyAnalytics: string;
  readonly home: string;
  readonly language: string;
  readonly menu: string;
  readonly nextPage: string;
  readonly noJavaScriptSearch: string;
  readonly notFoundDescription: string;
  readonly notFoundTitle: string;
  readonly openNavigation: string;
  readonly originalLanguage: string;
  readonly originalPost: string;
  readonly posts: string;
  readonly previousPage: string;
  readonly readMore: string;
  readonly relatedPosts: string;
  readonly readOriginal: string;
  readonly fallbackLanguage: string;
  readonly revokeAnalytics: string;
  readonly search: string;
  readonly searchEmpty: string;
  readonly searchResultCount: string;
  readonly skipToContent: string;
  readonly tags: string;
  readonly tableOfContents: string;
}

export function blogMessages(language: SupportedLanguage): BlogMessages {
  switch (language) {
    case "en":
      return BLOG_MESSAGES.en;
    case "ko":
      return BLOG_MESSAGES.ko;
    case "ja":
      return BLOG_MESSAGES.ja;
  }
}

export const BLOG_MESSAGES: Readonly<Record<SupportedLanguage, BlogMessages>> = {
  en: {
    allowAnalytics: "Allow analytics",
    archive: "Archive",
    backHome: "Back to home",
    categories: "Categories",
    closeNavigation: "Close navigation",
    denyAnalytics: "Decline analytics",
    home: "Home",
    language: "Language",
    menu: "Menu",
    nextPage: "Next page",
    noJavaScriptSearch: "Search requires JavaScript. Browse categories, tags, or the archive instead.",
    notFoundDescription: "The requested page could not be found.",
    notFoundTitle: "Page not found",
    openNavigation: "Open navigation",
    originalLanguage: "Original language",
    originalPost: "Original post",
    posts: "Posts",
    previousPage: "Previous page",
    readMore: "Read more",
    relatedPosts: "Related posts",
    readOriginal: "Read the original",
    fallbackLanguage: "Available in",
    revokeAnalytics: "Revoke analytics consent",
    search: "Search",
    searchEmpty: "No matching posts were found.",
    searchResultCount: "{n} results",
    skipToContent: "Skip to main content",
    tags: "Tags",
    tableOfContents: "Table of contents",
  },
  ko: {
    allowAnalytics: "분석 허용",
    archive: "보관함",
    backHome: "홈으로 돌아가기",
    categories: "카테고리",
    closeNavigation: "네비게이션 닫기",
    denyAnalytics: "분석 거부",
    home: "홈",
    language: "언어",
    menu: "메뉴",
    nextPage: "다음 페이지",
    noJavaScriptSearch: "검색에는 JavaScript가 필요합니다. 카테고리, 태그 또는 보관함을 이용해 주세요.",
    notFoundDescription: "요청한 페이지를 찾을 수 없습니다.",
    notFoundTitle: "페이지를 찾을 수 없습니다",
    openNavigation: "네비게이션 열기",
    originalLanguage: "원문 언어",
    originalPost: "원문",
    posts: "포스트",
    previousPage: "이전 페이지",
    readMore: "더 읽기",
    relatedPosts: "연관 포스트",
    readOriginal: "원문 읽기",
    fallbackLanguage: "제공 언어",
    revokeAnalytics: "분석 동의 철회",
    search: "검색",
    searchEmpty: "일치하는 포스트가 없습니다.",
    searchResultCount: "결과 {n}개",
    skipToContent: "본문으로 건너뛰기",
    tags: "태그",
    tableOfContents: "목차",
  },
  ja: {
    allowAnalytics: "アクセス解析を許可",
    archive: "アーカイブ",
    backHome: "ホームに戻る",
    categories: "カテゴリー",
    closeNavigation: "ナビゲーションを閉じる",
    denyAnalytics: "アクセス解析を拒否",
    home: "ホーム",
    language: "言語",
    menu: "メニュー",
    nextPage: "次のページ",
    noJavaScriptSearch: "検索にはJavaScriptが必要です。カテゴリー、タグ、またはアーカイブをご利用ください。",
    notFoundDescription: "お探しのページは見つかりませんでした。",
    notFoundTitle: "ページが見つかりません",
    openNavigation: "ナビゲーションを開く",
    originalLanguage: "原文の言語",
    originalPost: "原文",
    posts: "記事",
    previousPage: "前のページ",
    readMore: "続きを読む",
    relatedPosts: "関連記事",
    readOriginal: "原文を読む",
    fallbackLanguage: "提供言語",
    revokeAnalytics: "アクセス解析の同意を取り消す",
    search: "検索",
    searchEmpty: "一致する記事が見つかりません。",
    searchResultCount: "{n}件",
    skipToContent: "本文へ移動",
    tags: "タグ",
    tableOfContents: "目次",
  },
};
