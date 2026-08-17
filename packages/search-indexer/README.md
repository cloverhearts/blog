# Static Search Indexer Boundary

This package transforms rendered blog HTML from `.artifacts/web/<mode>/` into `.artifacts/search/<mode>/`.

Run it through `npm run build:search`. Each supported language gets an isolated
Pagefind index tied to the exact web artifact hash.

It owns final-document text extraction, separate English/Korean/Japanese static
indexes, index manifests, and provenance tying each index to the exact web
artifact it consumed.

It uses validated content metadata only as an eligibility whitelist and descriptive supplement. External embeds contribute only their sanitized, visible fallback/search text from final HTML. Blog table-of-contents navigation is excluded as navigation boilerplate so heading text is indexed from the article heading once rather than duplicated. The indexer must not execute provider code, parse Markdown, derive taxonomy, render pages, modify web output, or include managed pages unless the content contract is explicitly changed later.

One locale index cannot contain another locale's translation sibling. The
browser loads only the active language index; changing language navigates to the
matching static search page.

The blog web search page is progressive enhancement: the labeled form, result
list, and no-JavaScript taxonomy links live in initial HTML, and
`/_assets/app/search.js` queries the language-isolated Pagefind bundle under
`/_assets/search/<language>/`.
