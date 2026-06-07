---
date: 2026-06-06
session: customer-style-onboarding
---

# Journal: 2026-06-06 - Seller Product Writing Style Onboarding

## Context

Implement a skippable first-run flow that learns a reusable seller product writing profile from products the seller previously created, then applies it to AI product-listing generation.

## Implemented Behavior

- New users see a localized EN/VI onboarding once and can skip it without blocking existing workflows.
- Users can analyze up to three public product URLs from products the seller already created, plus optional seller writing rules.
- Gemini returns a structured audience, copy style, SEO/wording guidance, confidence, and source-status profile for user review and editing before save.
- Profiles and onboarding status persist in `chrome.storage.local`; the active profile can be edited or disabled from Settings.
- Active profiles are used only by AI product-listing generation, and only when the Settings toggle is enabled.

## Key Decisions

- Keep onboarding progressive and optional; completed or skipped users are not prompted again automatically.
- Store structured profile summaries and source metadata, not fetched page HTML or remote images.
- Treat reviewed `userGuidance` as stronger than inferred profile fields, while explicit run instructions, product accuracy, and preservation rules remain highest priority.
- Serialize profile analysis with other AI jobs, support cancellation, close the offscreen runner after analysis, and preserve the last saved profile on failures.
- Use Gemini URL Context for public links instead of adding broad website host permissions.
- Serialize only user-reviewed and whitelisted profile fields into downstream prompts; public URL content is treated as untrusted evidence, not executable instruction text.
- Side-panel AI tasks publish a short-lived storage marker so background jobs do not run on top of form/chat generation.
- The profile no longer changes mockup defaults, AI Suggest, sidepanel mockup generation, chat mockup generation, or Quick Generate.

## Validation

- `node --check` passed for onboarding-related sidepanel, background, offscreen, storage, and Gemini JavaScript.
- EN and VI locale JSON parsed successfully.
- Scoped `git diff --check` passed for onboarding-related files.
- Focused probes covered safe-profile prompt serialization, URL metadata status mapping, DOM/i18n bindings, storage profile lifecycle, Settings toggle persistence, cancellation response propagation, and side-panel AI task markers.
- Repository-wide `git diff --check` remains blocked by unrelated pre-existing trailing whitespace in `content/content.css` and `content/content.js`.

## Remaining Limitation

The complete flow still needs a live extension test with an authenticated BurgerPrints page and a working Gemini API key, including public-URL retrieval, cancel behavior, persistence after reopening, and profile influence on AI product-listing generation.
