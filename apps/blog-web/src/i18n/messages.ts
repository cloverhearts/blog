import type { SupportedLanguage } from "../../../../packages/project-config/src/i18n.ts";

export interface BlogMessages {
  readonly analyticsDisclosure: string;
  readonly analyticsPrivacy: string;
  readonly analyticsNotice: string;
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
  readonly search: string;
  readonly searchEmpty: string;
  readonly searchHint: string;
  readonly searchPlaceholder: string;
  readonly searchResultCount: string;
  readonly searchClose: string;
  readonly searchDialog: string;
  readonly imagePreview: string;
  readonly imagePreviewOpen: string;
  readonly imagePreviewClose: string;
  readonly skipToContent: string;
  readonly tags: string;
  readonly tableOfContents: string;
  readonly profile: string;
  readonly explore: string;
  readonly exploreDescription: string;
  readonly recentPosts: string;
  readonly logicalPostCount: string;
  readonly pageContext: string;
  readonly publishedOn: string;
  readonly workPeriod: string;
  readonly authorBy: string;
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroDescription: string;
  readonly authorRole: string;
  readonly featuredPost: string;
  readonly selectedWork: string;
  readonly viewAll: string;
  readonly browseDescription: string;
  readonly emptyCollection: string;
  readonly publishedLabel: string;
  readonly readingTime: string;
  readonly articleNavigation: string;
  readonly previousPost: string;
  readonly nextPost: string;
  readonly recoveryLinks: string;
  readonly allPostsCta: string;
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
    analyticsDisclosure: "Microsoft Clarity starts limited, cookieless analytics automatically on eligible pages. Text and inputs are masked; URL and device metadata may be collected. Returning visitors and cross-page journeys cannot be reliably identified. You can stop collection here; this reloads the page. Without browser storage, this preference may not persist.",
    analyticsPrivacy: "Microsoft privacy statement",
    analyticsNotice: "Analytics information",
    archive: "Archive",
    backHome: "Back to home",
    categories: "Categories",
    closeNavigation: "Close navigation",
    denyAnalytics: "Stop analytics",
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
    search: "Search",
    searchEmpty: "No matching posts were found.",
    searchHint: "Search titles, article text, and tags.",
    searchPlaceholder: "Enter a search term",
    searchResultCount: "{n} results",
    searchClose: "Close search",
    searchDialog: "Search posts",
    imagePreview: "Enlarged image",
    imagePreviewOpen: "Open enlarged image",
    imagePreviewClose: "Close enlarged image",
    skipToContent: "Skip to main content",
    tags: "Tags",
    tableOfContents: "Table of contents",
    profile: "Profile",
    explore: "Explore",
    exploreDescription: "Browse categories, tags, and curated collections.",
    recentPosts: "Recent posts",
    logicalPostCount: "{n} posts",
    pageContext: "Page {n}",
    publishedOn: "Published",
    workPeriod: "Work period",
    authorBy: "By",
    heroEyebrow: "Field notes from an Applied AI Engineer",
    heroTitle: "Building verifiable AI workflows",
    heroDescription: "Notes on AI workflows, software systems, experiments, and the life around them.",
    authorRole: "Applied AI Engineer",
    featuredPost: "Featured post",
    selectedWork: "Selected work",
    viewAll: "View all",
    browseDescription: "Browse essays and experiments about AI workflows, software, data, and everyday life.",
    emptyCollection: "There is nothing published in this collection yet.",
    publishedLabel: "Published",
    readingTime: "{n} min read",
    articleNavigation: "Article navigation",
    previousPost: "Previous post",
    nextPost: "Next post",
    recoveryLinks: "Where would you like to go?",
    allPostsCta: "View all posts",
  },
  ko: {
    analyticsDisclosure: "허용된 페이지에서는 Microsoft Clarity가 쿠키 없이 제한적인 분석을 자동으로 시작합니다. 텍스트와 입력값은 가리지만 URL·기기 정보는 수집될 수 있습니다. 재방문자와 페이지 간 이동 경로는 정확히 구분하기 어렵습니다. 여기에서 수집을 중지하면 페이지를 새로고침합니다. 브라우저 저장소를 사용할 수 없으면 중지 선택이 유지되지 않을 수 있습니다.",
    analyticsPrivacy: "Microsoft 개인정보처리방침",
    analyticsNotice: "분석 안내",
    archive: "보관함",
    backHome: "홈으로 돌아가기",
    categories: "카테고리",
    closeNavigation: "네비게이션 닫기",
    denyAnalytics: "분석 수집 중지",
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
    search: "검색",
    searchEmpty: "일치하는 포스트가 없습니다.",
    searchHint: "제목, 본문과 태그에서 검색합니다.",
    searchPlaceholder: "검색어를 입력하세요",
    searchResultCount: "결과 {n}개",
    searchClose: "검색 닫기",
    searchDialog: "포스트 검색",
    imagePreview: "이미지 확대 보기",
    imagePreviewOpen: "이미지 크게 보기",
    imagePreviewClose: "이미지 확대 보기 닫기",
    skipToContent: "본문으로 건너뛰기",
    tags: "태그",
    tableOfContents: "목차",
    profile: "프로필",
    explore: "둘러보기",
    exploreDescription: "카테고리, 태그, 큐레이션 모음을 살펴보세요.",
    recentPosts: "최근 글",
    logicalPostCount: "{n}편",
    pageContext: "{n}페이지",
    publishedOn: "발행일",
    workPeriod: "작업 기간",
    authorBy: "글쓴이",
    heroEyebrow: "Applied AI Engineer의 필드 노트",
    heroTitle: "검증 가능한 AI 워크플로를 만듭니다",
    heroDescription: "AI 워크플로와 소프트웨어 시스템, 직접 해본 실험과 그 곁의 일상을 기록합니다.",
    authorRole: "Applied AI Engineer",
    featuredPost: "추천 글",
    selectedWork: "주요 작업",
    viewAll: "모두 보기",
    browseDescription: "AI 워크플로, 소프트웨어, 데이터와 일상에 대한 실험과 기록을 모았습니다.",
    emptyCollection: "아직 이 모음에 공개된 글이 없습니다.",
    publishedLabel: "발행",
    readingTime: "{n}분 읽기",
    articleNavigation: "글 탐색",
    previousPost: "이전 글",
    nextPost: "다음 글",
    recoveryLinks: "어디로 이동할까요?",
    allPostsCta: "전체 글 보기",
  },
  ja: {
    analyticsDisclosure: "対象ページでは Microsoft Clarity が Cookie を使わない限定的な分析を自動で開始します。テキストと入力値はマスクしますが、URL・端末情報が収集される場合があります。再訪問者やページ間の移動経路は正確に識別できません。ここで収集を停止するとページを再読み込みします。ブラウザーのストレージが使えない場合、停止の設定が保持されないことがあります。",
    analyticsPrivacy: "Microsoft プライバシーステートメント",
    analyticsNotice: "アクセス解析について",
    archive: "アーカイブ",
    backHome: "ホームに戻る",
    categories: "カテゴリー",
    closeNavigation: "ナビゲーションを閉じる",
    denyAnalytics: "アクセス解析を停止",
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
    search: "検索",
    searchEmpty: "一致する記事が見つかりません。",
    searchHint: "タイトル、本文、タグを検索します。",
    searchPlaceholder: "検索語を入力してください",
    searchResultCount: "{n}件",
    searchClose: "検索を閉じる",
    searchDialog: "記事を検索",
    imagePreview: "画像の拡大表示",
    imagePreviewOpen: "画像を拡大して表示",
    imagePreviewClose: "画像の拡大表示を閉じる",
    skipToContent: "本文へ移動",
    tags: "タグ",
    tableOfContents: "目次",
    profile: "プロフィール",
    explore: "探す",
    exploreDescription: "カテゴリー、タグ、キュレーションを一覧できます。",
    recentPosts: "最近の記事",
    logicalPostCount: "{n}件",
    pageContext: "{n}ページ",
    publishedOn: "公開日",
    workPeriod: "実績期間",
    authorBy: "著者",
    heroEyebrow: "Applied AI Engineerのフィールドノート",
    heroTitle: "検証可能なAIワークフローをつくる",
    heroDescription: "AIワークフロー、ソフトウェアシステム、実験、そしてその周りの日々を記録します。",
    authorRole: "Applied AI Engineer",
    featuredPost: "注目の記事",
    selectedWork: "主な実績",
    viewAll: "すべて見る",
    browseDescription: "AIワークフロー、ソフトウェア、データ、日々の暮らしに関する実験と記録です。",
    emptyCollection: "このコレクションには、まだ公開された記事がありません。",
    publishedLabel: "公開",
    readingTime: "{n}分で読めます",
    articleNavigation: "記事ナビゲーション",
    previousPost: "前の記事",
    nextPost: "次の記事",
    recoveryLinks: "どこへ移動しますか？",
    allPostsCta: "すべての記事を見る",
  },
};
