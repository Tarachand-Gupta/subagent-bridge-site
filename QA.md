# Acceptance — 12 October 2026

## Verified

- Vite production build succeeds; static asset check passes.
- Desktop Chrome at 1672px, tablet at 768px, phone at 390px, narrow phone at 320px.
- No horizontal document overflow at 320, 390, 768, or 1672px after correcting the connection illustration's minimum width.
- All three scenario tabs update the rule and simulated session; current parent is excluded from worker choices.
- Worker picker changes the worker; Enter opens it and Escape dismisses it.
- Disabling the rule disables its handoff action; reenabling restores it.
- Handoff immediately shows a working state, followed by the simulated result. Follow-up retains the same worker and the scenario's prior context.
- FAQ disclosure expands and shows the Codex idle-chat delivery qualification.
- Download navigation reaches the platform section. Unpublished packages show availability text; there are no guessed asset URLs.
- Source and release-note links are hidden while unset.
- No broken images and no browser warnings/errors observed on the tested flow.
- JavaScript and CSS in the production DOM point to the local built assets. Font is bundled locally.
- `check:release` correctly refuses a release-ready claim while source/installer URLs are absent.

## Boundaries

No public deployment, remote Git repository, package upload, real model request, or download was performed. The demo is an explicit simulation, not an integration acceptance test. Windows/Linux application builds remain unverified. Safari/Firefox were not exercised. CSP headers are prepared for Cloudflare, but Vite preview does not apply Cloudflare `_headers`; verify deployed headers after publication.
