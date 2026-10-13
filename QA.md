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

## Interactive editor update — 13 October 2026

- All six sentence controls work: parent, task, Can/Should, worker, models and thinking.
- Checked and unchecked model alternatives, including returning to Auto. Worker changes reset model choices.
- Task changes update the simulated assignment and follow-up; selected parent, worker, model and thinking appear in the handoff.
- Turning the rule off disables both handoff entry points and cancels any pending simulated completion.
- Dropdowns anchor 8px from their trigger, have 12px item padding and 5px gaps. No sentence reflow when a menu opens.
- Arrow keys navigate options; Escape closes the menu and restores trigger focus.
- Real harness assets load locally with a grayscale treatment; provenance is in public/icons/SOURCES.md. The extra details band has been removed.
- Updated desktop, 390px and 320px layouts checked through the browser. No horizontal overflow; menus stay inside the viewport.
- Build and asset checks pass. The example catalogue and thinking levels are illustrative; no real model capabilities are discovered by this static site.

## Story and download revision — 13 October 2026

Supersedes the simulated-session checks above: the chat simulation, timers, and handoff buttons have been removed. The third story is a static, three-step editorial card. The interactive rule editor remains.

- Claude Code is selectable as a demo parent/worker, with illustrative Opus/Sonnet/Haiku model choices. Its live integration is explicitly unverified in the compatibility answer.
- Agent strip includes Claude Code and a 10+ link to the official ACP registry. This labels the wider ecosystem rather than claiming every agent is a tested Bridge integration.
- One macOS download CTA; it stays disabled with a clear release status until an installer URL is supplied. Windows/Linux show Coming soon.
- GitHub identity appears in header, source/contact section, and footer. Unconfigured source links go to the coming-soon explanation.
- X and LinkedIn links match the user-provided URLs; all identity assets load locally.
- Desktop and 390px/320px screenshots reviewed. No horizontal overflow, including the compact header and social footer.
- Vite production build and asset checks pass. No model calls, deployment, source publication, or downloads performed.
