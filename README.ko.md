# CloverHearts Blog

<!-- language-switcher:start -->
**언어 선택**

[English](./README.md) · **한국어** · [日本語](./README.ja.md)
<!-- language-switcher:end -->

TypeScript 기반의 정적 블로그로, 콘텐츠와 블로그 프레젠테이션, 독립형
관리 페이지를 서로 분리하여 개발합니다.

승인된 구현 스택은 Node.js 24.19.0 LTS, npm 11.17.0 워크스페이스,
Astro 정적 출력, Zod 4, unified/remark/rehype, Pagefind, Sharp, Vitest,
Playwright 및 axe-core입니다. 자세한 내용은 `IMPLEMENTATION_SPEC.md`와
ADR 0004를 참고합니다.

영어 README를 기준 문서로 사용합니다. 번역은 `README.ko.md`, `README.ja.md`처럼
`README.<언어코드>.md` 파일로 각각 관리합니다. 기존 번역은 같은 변경에서 함께
갱신하고, 새 언어는 번역 파일을 만든 뒤 모든 README의 언어 선택 영역에
추가합니다. 이 문서의 지원 언어는 블로그의 게시 언어 설정과 별개입니다.

## 개요

저장소는 런타임 검증을 거치는 버전 기반 빌드 산출물을 중심으로 설계되어
구성됩니다. 원본 콘텐츠는 블로그 UI를 가져오지 않으며, 블로그 UI도 원본
Markdown을 직접 해석하지 않습니다. 미리보기와 운영 산출물은 구조적으로
분리하고, 최종 HTML 전용 단계에서 서버 없는 검색 데이터를 생성합니다.
외부 임베드는 향후 격리된 빌드 타임 제공자 플러그인으로 추가할 수
있습니다.

## 현재 상태

문서화된 빌드 명령은 실행 가능합니다. 게시된 포스트가 없어도 운영 사이트는
언어별 시스템 라우트와 검색 정보 파일과 함께 `dist/`로 조립됩니다. 검토를
마친 첫 포스트의 발행은 후속 과제입니다. 검토된 YouTube 임베드 제공자가
구현되어 있으며, [blog.cloverhearts.com](https://blog.cloverhearts.com/)에 도메인
검증과 HTTPS를 적용해 배포했습니다.
자세한 범위는 [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)를
참고합니다.

목표 스펙은 [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md), 단계별 완료
조건은 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)를 따릅니다.

현재 실행 가능한 명령은 다음과 같습니다.

```text
npm ci
npm run typecheck
npm run validate:config
npm run validate:embeds
npm run test:contracts
npm run test:policy
npm test
npm run build
npm run dev
```

운영 빌드에는 `SITE_ORIGIN=https://blog.cloverhearts.com`이 필요합니다.

운영 목표는 사용자 정의 GitHub Actions 워크플로를 통한 GitHub Pages
배포입니다. Pages 워크플로는 검증된 `dist/` 릴리스만 게시하며, `docs/`는
Pages 게시 디렉터리가 아니라 비공개 빌드 입력으로 유지합니다. 운영
canonical 주소는 `https://blog.cloverhearts.com`입니다.
`.github/workflows/pages.yml`은 `main`에 push할 때 또는 수동 실행으로
배포합니다. 품질 검사는 루트와 `/blog` 경로를 각각 별도 작업에서 빌드합니다.

최초 배포 전 [저장소 Pages 설정](https://github.com/cloverhearts/blog/settings/pages)에서
**GitHub Actions**를 선택하고 커스텀 도메인으로 **blog.cloverhearts.com**을
저장합니다. 이미 사용 중이라는 오류가 나오면 기존 Pages 연결을 해제하거나
GitHub 도메인 소유권 검증을 먼저 완료해야 합니다. 그다음 DNS에
`blog` → `cloverhearts.github.io` CNAME 레코드를 설정하고, 인증서가 준비되면
**Enforce HTTPS**를 활성화합니다. Actions 배포에는 저장소의 `CNAME` 파일이
필요하지 않습니다. 자세한 내용은
[GitHub 커스텀 도메인 안내](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)를 참고합니다.
로컬 미리보기에 보이는 초안 포스트와 초안 프로필은 운영 배포에서 제외됩니다.

블로그의 무접두 기본 언어와 JavaScript 미지원 시 대체 언어는 한국어입니다.
영어는 `/en/`, 일본어는 `/ja/`에 게시합니다. 루트 방문만 브라우저에서
우선하는 지원 언어로 이동하고, 다른 주소는 해당 주소의 언어를 유지합니다.
일반 링크로 언어를 변경할 수 있으며, 한국어 홈 선택은 `/?lang=ko`를 사용해
쿠키나 저장소 없이 자동 전환을 방지합니다.
포스트 탐색 링크는 현재 언어, 영어, 한국어 순서로 연결합니다.

공개 댓글은 초기 릴리스 범위에서 의도적으로 제외합니다. 사이트는 댓글
제공자, 쓰기 API, 계정 시스템, 검토 대기열, 댓글 데이터베이스를 요구하지
않습니다. 향후 댓글을 추가하려면 개인정보 보호, 보안, 운영 비용 및
아키텍처를 별도로 결정해야 합니다.

모든 다국어 포스트는 완전한 정적 Open Graph 글 정보와 포스트별 소셜
이미지를 생성하도록 설계합니다. 원본 이미지가 없어도 블로그 웹 빌드가
검증된 포스트 메타데이터와 승인된 디자인 시스템으로 언어별 소셜 카드를
결정론적으로 만들 수 있으므로 원본 이미지는 선택 사항입니다.

루트 [DESIGN.md](./DESIGN.md)는 일반 블로그에 적용되는 Open Design 호환
시각 계약입니다. 현재 구현은 흰색·녹색 중심의 편집형 레이아웃과 로컬
Pretendard Variable, [UX_FLOW.md](./UX_FLOW.md)의 흐름을 사용합니다. UX의
우선 검토 언어는 한국어와 영어이며 일본어 지원은 유지합니다. 각 독립형
관리 페이지는 별도의 대문자 `DESIGN.md`를 소유하며 블로그 디자인을
상속하지 않습니다.

## 프로젝트 문서

의존성 경계는 [ARCHITECTURE.md](./ARCHITECTURE.md), 배포 계약은
[GITHUB_PAGES.md](./GITHUB_PAGES.md), 승인된 구현 스택 및 인계 기준은
[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md), 실제 구현 현황과 개발
인계 기준은 [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md), 구현 단계는
[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md), 상호작용과 정보 흐름은
[UX_FLOW.md](./UX_FLOW.md), 작성 규칙은
[CONTENT_RULES.md](./CONTENT_RULES.md), 영어·한국어·일본어 발행·발견,
언어 전환 및 포스트 링크 대체 규칙은 [I18N.md](./I18N.md)를 참고합니다.
운영 절차는
[DEVELOPMENT.md](./DEVELOPMENT.md), 검색 엔진 발견 규칙은
[SEO.md](./SEO.md), AI 크롤러 및 에이전트 지침은
[AI_DISCOVERY.md](./AI_DISCOVERY.md), 게시 동작은
[PUBLISHING.md](./PUBLISHING.md), 릴리스
승인 기준은 [QUALITY_GATES.md](./QUALITY_GATES.md)에 있습니다. 콘텐츠 외
프로젝트 변경 내역은 [History.md](./History.md)에 기록합니다.

## AI 검색 지원

검색 정보 빌드는 AI를 고려한 `robots.txt`와 간결한 루트 `llms.txt`를
생성합니다. 공개·색인 가능한 콘텐츠에 대해 AI 검색, 사용자 요청형 조회,
모델 개발 및 공개 데이터셋 크롤러를 명시적으로 허용합니다. 설정과 산출물
입력, 결정론적인 `robots.txt`·`llms.txt`, 사이트맵, 언어별 RSS, 매니페스트
및 파일 출력이 구현되어 있습니다.

크롤러 접근과 가이드 포함 정책은 `config/ai-crawlers.yaml`에서만
설정하며 생성 파일을 직접 수정하지 않습니다. `llms.txt`는 선택적인 검색
지원 제안이며 인증·접근 통제 수단이나 canonical HTML 및 페이지별
메타데이터를 대체하는 수단이 아닙니다.

포스트 산출물 계약은 원저작물에 대한 영문 저자 선언을 하나 요구합니다.
최종 정적 렌더러는 사람이 원문을 작성하고 AI는 교정에만 제한적으로
사용되었다는 내용을 문서 head의 사용자 정의 메타데이터로만 내보내야
합니다. 설정, 산출물 생성 및 최종 페이지의 head 메타데이터 렌더링이
구현되어 있습니다.

동작이나 정책을 추가·변경할 때는 같은 작업에서 테스트도 함께 추가하거나
수정해야 합니다. [TESTING.md](./TESTING.md)는 정상·실패·경계·회귀 테스트,
정책과 테스트의 추적 관계, fixture, 예외 및 검증 보고 규칙을 정의합니다.
영향도가 높은 정책은 `tests/policy-coverage.json`에서 정확한 테스트
케이스와 연결합니다.

## 선택적 Clarity 분석

분석 도구는 Microsoft Clarity 하나만 사용합니다. 활성화하려면 GitHub 저장소
또는 `github-pages` 환경에 다음 공개 변수를 설정합니다.

```text
CLARITY_PROJECT_ID=yourprojectid
```

빈 값이면 추적하지 않으며 잘못된 ID는 빌드에서 거부합니다. 허용된 운영 블로그
페이지에서 방문자가 동의한 뒤에만 Clarity를 실행합니다. 텍스트와 입력값은
가리고 검색·미리보기·관리 페이지는 제외합니다. 거부·철회 버튼은 계속 제공됩니다.
URL 메타데이터에는 제공자별 한계가 있으며 쿼리가 있는 진입은 측정하지 않습니다.
활성화 전 [설정 및 개인정보 경계](ANALYTICS.md)를 확인하세요.
