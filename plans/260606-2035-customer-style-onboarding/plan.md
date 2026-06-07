---
date: 2026-06-06
status: complete
progress: 100
source: ../reports/260606-2020-customer-style-onboarding-research.md
---

# Seller Product Writing Style Onboarding Implementation Plan

## Overview

Implement the corrected onboarding MVP. New users can skip or create a reusable seller product writing profile from public product URLs for products the seller created previously, plus optional writing rules.

## Phases

- [x] Phase 1: Add customer profile storage model and active-profile helpers.
- [x] Phase 2: Add Gemini structured profile analysis and background/offscreen message flow.
- [x] Phase 3: Add skippable onboarding, review/edit UI, and profile settings.
- [x] Phase 4: Apply active profile only to AI product-listing generation, gated by a Settings toggle.
- [x] Phase 5: Validate syntax, storage/message behavior, prompt integration, and update docs.

## Constraints

- Preserve existing uncommitted content banner and offscreen HTML edits.
- No broad host permission in MVP.
- Store profile summary/source metadata only, not raw HTML or remote images.
- Existing workflows remain usable when onboarding is skipped or profile is disabled.
- Safety and product-preservation rules override profile preferences.

## Success Criteria

- First open shows skippable onboarding once.
- User can analyze at least one existing seller product URL and review the result.
- Saved active profile persists locally and can be edited, disabled, or re-opened.
- Profile context reaches AI product-listing generation only when the Settings toggle is enabled.
- URL/source failure returns a useful error without corrupting saved profiles.
- All modified JavaScript and JSON files pass syntax validation.

## Validation

- `node --check` passed for all modified JavaScript files.
- JSON parsing passed for `manifest.json` and both locale message files.
- Static implementation inspection confirmed storage/onboarding state, analysis and cancellation message flow, and active-profile propagation only for listing generation.
- Focused probes covered safe-profile prompt serialization, URL metadata `used|failed|partial` mapping, DOM/i18n contracts, Settings toggle persistence, and side-panel AI task markers for background job concurrency.

## Residual Risk

- Live Chrome-extension onboarding, storage persistence, cancellation, and Gemini URL-context behavior were not exercised end to end with a real API key.
- The repository has no automated browser or integration suite covering these flows.
- Multi-context profile writes still use `chrome.storage.local` read-modify-write. The side panel listens for profile storage changes, but true cross-context transactional writes would require a larger storage/locking change.
