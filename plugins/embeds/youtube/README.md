# YouTube embed provider

This reviewed local provider owns the `::youtube` directive. It accepts only a
stable 11-character video ID and an accessible title, renders a lazy privacy-
enhanced `youtube-nocookie.com` iframe, declares its frame origin and iframe
permissions, and leaves a normal YouTube link as the compiler-owned fallback.

It performs no build-time network access and ignores no author attributes:
unknown attributes are rejected.
