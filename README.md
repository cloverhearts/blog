# CloverHearts Blog

A TypeScript-based static blog with independently developed content, blog
presentation, and standalone managed pages.

> TypeScript 기반의 정적 블로그로, 콘텐츠와 블로그 프레젠테이션, 독립형
> 관리 페이지를 서로 분리하여 개발합니다.

The approved implementation uses Node.js 24.19.0 LTS, npm 11.17.0 workspaces,
Astro static output, Zod 4, unified/remark/rehype, Pagefind, Sharp, Vitest,
Playwright, and axe-core. See `IMPLEMENTATION_SPEC.md` and ADR 0004.

> 승인된 구현 스택은 Node.js 24.19.0 LTS, npm 11.17.0 워크스페이스,
> Astro 정적 출력, Zod 4, unified/remark/rehype, Pagefind, Sharp, Vitest,
> Playwright 및 axe-core입니다. 자세한 내용은 `IMPLEMENTATION_SPEC.md`와
> ADR 0004를 참고합니다.

English is the authoritative README language and appears first. Korean companion
text follows each English section and must be updated together with it.

> 영어를 README의 기준 언어로 사용하고 항상 먼저 표시합니다. 각 영어
> 섹션에는 한국어 번역을 함께 제공하며 두 언어는 동일한 변경에서 함께
> 갱신합니다.

## Overview / 개요

The repository is designed around runtime-validated, versioned build artifacts
so source content never imports the blog UI, and the blog UI never parses source
Markdown directly. Preview and production outputs are structurally separate, a
dedicated final-HTML stage builds serverless search data, and external embeds
can be added later through isolated build-time provider plugins.

> 저장소는 런타임 검증을 거치는 버전 기반 빌드 산출물을 중심으로 설계되어
> 구성됩니다. 원본 콘텐츠는 블로그 UI를 가져오지 않으며, 블로그 UI도 원본
> Markdown을 직접 해석하지 않습니다. 미리보기와 운영 산출물은 구조적으로
> 분리하고, 최종 HTML 전용 단계에서 서버 없는 검색 데이터를 생성합니다.
> 외부 임베드는 향후 격리된 빌드 타임 제공자 플러그인으로 추가할 수
> 있습니다.

Production hosting is GitHub Pages through a custom GitHub Actions workflow.
Only the verified `dist/` release is published; `docs/` remains an unpublished
build input rather than a Pages source directory. The canonical production
origin is `https://blog.cloverhearts.com`.

> 운영 호스팅은 사용자 정의 GitHub Actions 워크플로를 통한 GitHub Pages를
> 사용합니다. 검증된 `dist/` 릴리스만 게시하며, `docs/`는 Pages 게시
> 디렉터리가 아니라 게시되지 않는 빌드 입력으로 유지합니다. 운영 canonical
> 주소는 `https://blog.cloverhearts.com`입니다.

Korean is the blog's unprefixed default and no-JavaScript fallback. English is
published under `/en/` and Japanese under `/ja/`; browser-language navigation
may select an existing static alternate only from an unprefixed Korean route.

> 블로그의 무접두 기본 언어와 JavaScript 미지원 시 대체 언어는 한국어입니다.
> 영어는 `/en/`, 일본어는 `/ja/`에 게시하며, 브라우저 언어에 따른 이동은
> 무접두 한국어 경로에서 기존 정적 번역본으로 이동할 때만 적용합니다.

Public comments are intentionally excluded from the initial release. The site
does not require a comment provider, write API, account system, moderation
queue, or comment database; adding comments later requires a separate privacy,
security, operating-cost, and architecture decision.

> 공개 댓글은 초기 릴리스 범위에서 의도적으로 제외합니다. 사이트는 댓글
> 제공자, 쓰기 API, 계정 시스템, 검토 대기열, 댓글 데이터베이스를 요구하지
> 않습니다. 향후 댓글을 추가하려면 개인정보 보호, 보안, 운영 비용 및
> 아키텍처를 별도로 결정해야 합니다.

Every localized post is designed to emit a complete static Open Graph article
record and a post-specific social image. Source images remain optional because
the blog web build can create a deterministic localized card from validated
post metadata and the approved design system.

> 모든 다국어 포스트는 완전한 정적 Open Graph 글 정보와 포스트별 소셜
> 이미지를 생성하도록 설계합니다. 원본 이미지가 없어도 블로그 웹 빌드가
> 검증된 포스트 메타데이터와 승인된 디자인 시스템으로 언어별 소셜 카드를
> 결정론적으로 만들 수 있으므로 원본 이미지는 선택 사항입니다.

The root [DESIGN.md](./DESIGN.md) is the Open Design-compatible visual contract
for the normal blog. The first implementation uses semantic classless CSS,
locally bundled Pretendard Variable, and the flow in [UX_FLOW.md](./UX_FLOW.md)
before branded styling. Korean and English are the primary UX review languages;
Japanese remains fully supported. Every standalone managed page owns a separate
uppercase `DESIGN.md` and does not inherit the blog design.

> 루트 [DESIGN.md](./DESIGN.md)는 일반 블로그에 적용되는 Open Design 호환
> 시각 계약입니다. 첫 구현은 브랜드 디자인보다 [UX_FLOW.md](./UX_FLOW.md)의
> 흐름, 시맨틱 classless CSS, 로컬 Pretendard Variable을 우선합니다. UX의
> 우선 검토 언어는 한국어와 영어이며 일본어 지원은 유지합니다. 각 독립형
> 관리 페이지는 별도의 대문자 `DESIGN.md`를 소유하며 블로그 디자인을
> 상속하지 않습니다.

## Project documentation / 프로젝트 문서

See [ARCHITECTURE.md](./ARCHITECTURE.md) for dependency boundaries,
[GITHUB_PAGES.md](./GITHUB_PAGES.md) for the deployment contract,
[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) for the approved coding
stack and handoff profile, [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for
implementation phases, [UX_FLOW.md](./UX_FLOW.md) for interaction and
information flow, [CONTENT_RULES.md](./CONTENT_RULES.md) for authoring
rules, and
[I18N.md](./I18N.md) for English/Korean/Japanese translation and routing.
Operational details are in [DEVELOPMENT.md](./DEVELOPMENT.md), discovery rules in
[SEO.md](./SEO.md), AI crawler and agent guidance in
[AI_DISCOVERY.md](./AI_DISCOVERY.md), publication behavior in
[PUBLISHING.md](./PUBLISHING.md), and release acceptance criteria in
[QUALITY_GATES.md](./QUALITY_GATES.md). Non-content project changes are recorded
in [History.md](./History.md).

> 의존성 경계는 [ARCHITECTURE.md](./ARCHITECTURE.md), 배포 계약은
> [GITHUB_PAGES.md](./GITHUB_PAGES.md), 승인된 구현 스택 및 인계 기준은
> [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md), 구현 단계는
> [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md), 상호작용과 정보 흐름은
> [UX_FLOW.md](./UX_FLOW.md), 작성 규칙은
> [CONTENT_RULES.md](./CONTENT_RULES.md), 영어·한국어·일본어 번역과 라우팅은
> [I18N.md](./I18N.md)를 참고합니다. 운영 절차는
> [DEVELOPMENT.md](./DEVELOPMENT.md), 검색 엔진 발견 규칙은
> [SEO.md](./SEO.md), AI 크롤러 및 에이전트 지침은
> [AI_DISCOVERY.md](./AI_DISCOVERY.md), 게시 동작은
> [PUBLISHING.md](./PUBLISHING.md), 릴리스
> 승인 기준은 [QUALITY_GATES.md](./QUALITY_GATES.md)에 있습니다. 콘텐츠 외
> 프로젝트 변경 내역은 [History.md](./History.md)에 기록합니다.

## AI discovery / AI 검색 지원

The discovery build generates an AI-aware `robots.txt` and a concise root
`llms.txt`. AI search, user-directed retrieval, model-development, and public
dataset crawlers are explicitly allowed for public, indexable content. The
generated agent guide links canonical language homes, feeds, the sitemap, and
selected public pages without publishing source Markdown or duplicating every
post.

> 검색 정보 빌드는 AI를 고려한 `robots.txt`와 간결한 루트 `llms.txt`를
> 생성합니다. 공개·색인 가능한 콘텐츠에 대해 AI 검색, 사용자 요청형 조회,
> 모델 개발 및 공개 데이터셋 크롤러를 명시적으로 허용합니다. 생성된
> 에이전트 가이드는 원본 Markdown이나 모든 포스트를 중복 게시하지 않고
> 언어별 대표 경로, 피드, 사이트맵 및 선별된 공개 페이지를 연결합니다.

Crawler access and guide inclusion are configured only in
`config/ai-crawlers.yaml`; generated files must not be edited by hand.
`llms.txt` is an optional discovery proposal, not authentication, access
control, or a substitute for canonical HTML and page-level metadata.

> 크롤러 접근과 가이드 포함 정책은 `config/ai-crawlers.yaml`에서만
> 설정하며 생성 파일을 직접 수정하지 않습니다. `llms.txt`는 선택적인 검색
> 지원 제안이며 인증·접근 통제 수단이나 canonical HTML 및 페이지별
> 메타데이터를 대체하는 수단이 아닙니다.

Each post artifact also carries one English, owner-declared provenance statement
for the original work. The static page emits it as custom document-head metadata
only: the original work is human-authored, and AI assistance on that work was
limited to proofreading. Translation provenance remains separate in
`originalLanguage`, internal review status, and validated alternate metadata;
review status is not reader-facing post chrome.

> 각 포스트 산출물에는 원저작물에 대한 영문 저자 선언 메타데이터가 하나씩
> 포함됩니다. 정적 페이지는 이를 문서 head의 사용자 정의 메타데이터로만
> 내보냅니다. 원저작물은 사람이 작성했고 AI는 교정에만 제한적으로
> 사용되었다는 선언이며, 번역 과정은 원문 언어, 내부 검토 상태, 검증된
> 대체 언어 경로 메타데이터로 별도 관리합니다. 검토 상태는 독자에게 보이는
> 포스트 UI로 노출하지 않습니다.

Behavior and policy changes must include their tests in the same task.
[TESTING.md](./TESTING.md) defines positive/negative/boundary/regression
coverage, policy-to-test traceability, fixtures, exemptions, and validation
reporting. High-impact policies are mapped to exact test cases in
`tests/policy-coverage.json`.

> 동작이나 정책을 추가·변경할 때는 같은 작업에서 테스트도 함께 추가하거나
> 수정해야 합니다. [TESTING.md](./TESTING.md)는 정상·실패·경계·회귀 테스트,
> 정책과 테스트의 추적 관계, fixture, 예외 및 검증 보고 규칙을 정의합니다.
> 영향도가 높은 정책은 `tests/policy-coverage.json`에서 정확한 테스트
> 케이스와 연결합니다.

## Optional GA4 analytics / 선택적 GA4 분석

The normal blog has a consent-gated GA4 adapter. Add one public build value to
enable it:

> 일반 블로그에는 사용자 동의를 요구하는 GA4 어댑터가 있습니다. 활성화할
> 때는 다음 공개 빌드 값 하나를 추가합니다.

```text
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leaving the value blank disables analytics completely. A configured value is
validated during the build, Google is not contacted before reader consent, URL
queries and raw search terms are not collected, and managed pages remain
untracked by default. On GitHub Pages, store the value as the
`GA4_MEASUREMENT_ID` repository or `github-pages` environment variable.

> 값을 비워 두면 분석 기능이 완전히 비활성화됩니다. 설정된 값은 빌드에서
> 검증하며, 사용자가 동의하기 전에는 Google에 연결하지 않습니다. URL 쿼리와
> 원본 검색어는 수집하지 않고 관리 페이지는 기본적으로 추적하지 않습니다.
> GitHub Pages에서는 이 값을 `GA4_MEASUREMENT_ID` 저장소 변수 또는
> `github-pages` 환경 변수로 보관합니다.
