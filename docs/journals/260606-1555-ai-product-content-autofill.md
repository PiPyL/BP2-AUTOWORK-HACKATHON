---
date: 2026-06-06
session: ai-product-content-autofill
---

# Journal: 2026-06-06 - AI Product Content Autofill

## Context

Add one-click AI copy generation to the BurgerPrints product form for H1 title, description, short description, SEO title, and SEO description.

## What Happened

- Added a localized `AI viết nội dung sản phẩm` button with loading, success, and error states.
- Routed generation through the background service worker and offscreen Gemini runner.
- Generated structured, conversion-focused marketplace copy from current product context and up to four reference images.
- Discovered all required controls before writing, then filled them together while emitting `input`, `change`, and `blur` events for Angular state updates.
- Sanitized description HTML, enforced field limits, preserved the URL handle, and left final saving to the user.

## Reflection

DOM discovery and rich-text persistence are the highest-risk parts because the target form is an external Angular UI. Atomic validation prevents partial overwrites when its structure changes. Shared Gemini runner state also required explicit concurrency guards and offscreen cleanup.

## Decisions

- Fail without changing fields unless all five target controls are available.
- Use only supported product context and images; prohibit invented claims.
- Limit reference images to control request size and cost.
- Serialize AI jobs and close the offscreen document after completion.
- Require user review before saving generated copy.

## Next

- Validate the complete flow in a live authenticated BurgerPrints product page, including editor persistence after save and reload.
- Add automated DOM fixtures for selector drift and rich-text behavior.

## Validation

- `node --check` passed for modified JavaScript files.
- `git diff --check` passed.
- DOM harness verified five-field autofill, events, limits, sanitization, URL-handle preservation, and prevention of partial autofill.
- MV3 forwarding, async response handling, concurrent-job rejection, and offscreen cleanup were reviewed.
- Live authenticated browser validation remains incomplete because automated Chrome terminated with `SIGKILL`.
