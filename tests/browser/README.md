# Focused browser regressions

These Playwright checks complement the Vitest contract suite; they do not
replace it and do not create or restore real blog posts.

Run with the pinned Node.js/npm runtime and an installed Playwright Chromium:

```sh
npx playwright test tests/browser --workers=1 --output=.artifacts/browser-tests
```

For an existing offline Chromium installation, optionally set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path. No download is performed
by the test. Screenshots and runner results stay in `.artifacts/`.

The image-viewer fixture uses the real document renderer, stylesheet and client
enhancement with synthetic in-memory images. It blocks external requests and
uses system-font fallbacks. Six cases cover desktop, portrait, mobile, short
landscape viewports, long/unbroken descriptions and empty captions. Assertions
check viewport bounds, image/close/caption separation, slim padding, horizontal
wrapping, keyboard caption scrolling, Escape and focus restoration.

The recovery fixture compiles an empty temporary blog with the real renderer
and stylesheet. Twelve cases cover all three languages at desktop, large,
mobile and short/narrow viewport sizes. They check the 80% available-height
target, centered spacing, natural expansion, all nine recovery links, footer
separation and no clipping or horizontal overflow, without restoring posts.

The Clarity consent fixture uses production HTML and the actual local module
with a stubbed remote SDK. Desktop/mobile cases verify immediate loading with
both storage denials queued, no automatic preference write, no allow button,
collapsed information, keyboard stopping, text masking and withdrawal
reload with no second SDK request. No test traffic reaches Microsoft; dashboard
receipt and real vendor capture/masking remain separate activation gates.

These are Chromium layout regressions, not a claim of complete cross-browser,
screen-reader, production-font or physical-device validation.
