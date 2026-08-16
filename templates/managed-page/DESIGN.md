# __TITLE__ Design System

## Status and scope

- Status: draft
- Scope: `managed-pages/__PAGE_ID__/` only
- Kind: document
- Blog inheritance: none

This is the page-local Open Design contract. It must be completed before the
page is implemented and is not published as page content.

## 1. Visual theme and atmosphere

Define the page's purpose, audience, desired impression, visual references, and
canvas behavior.

## 2. Color palette and semantic roles

List every color with a semantic name, exact value, role, and approved contrast
pairs.

## 3. Typography rules

Define display, body, UI, and monospace stacks, sizes, weights, line heights,
measure, fallbacks, and font licenses.

## 4. Spacing and layout principles

Define the spacing scale, grid, content hierarchy, viewport behavior, and safe
areas for the injected return control.

## 5. Components and interaction states

Define page-specific components and their default, hover, focus, active,
disabled, loading, empty, and error states when applicable.

## 6. Depth, elevation, and motion

Define surfaces, borders, shadows, transitions, animation, reduced-motion
behavior, and presentation navigation when applicable.

## 7. Voice, content presentation, and brand behavior

Define interface voice, content hierarchy, imagery, iconography, and rules for
representing the owner without inventing claims or assets.

## 8. Responsive, accessibility, no-JavaScript, and print behavior

Define breakpoints, touch/keyboard behavior, focus and screen-reader behavior,
no-JavaScript fallback, print size, page breaks, margins, and hidden elements.

The compiler injects the return link. This page may set the documented return
control CSS variables but must not remove its semantics, destination, focus
state, safe-area behavior, or print hiding.

## 9. Do, do not, and protected decisions

Record guardrails, anti-patterns, and elements requiring owner approval.

## 10. Open Design handoff and agent prompt guide

Use this managed-page directory as the Open Design project. Do not import the
root blog `DESIGN.md`. Keep generated exports under this package until reviewed,
then promote only approved assets and implementation tokens.

## Provenance and licenses

Record each external design reference, design-system package, font, icon,
image, version or commit, license, and material modification.
