# Subagent Bridge website

A separate, MIT-licensed product site built with **Vite + vanilla JavaScript + CSS**. No framework, server, accounts, analytics, or ChatGPT Sites dependency. Self-hosted Inter font. Inspired by Diskzy’s product-first storytelling; all copy and UI illustrations here are original to Subagent Bridge.

## Local development

Requires Node.js 22.13+.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run check
npm run preview
```

Vite produces the static site in `dist/`. The interactive rule editor is a local example: it does not access local harnesses, spend model credits, or change the desktop configuration. The preview's selected rules reset on reload.

## Publish on GitHub Pages

Public website repository: https://github.com/Tarachand-Gupta/subagent-bridge-site

Website: https://tarachand-gupta.github.io/subagent-bridge-site/

Push to `main` to build, validate and deploy using `.github/workflows/pages.yml`.
GitHub Pages must use **GitHub Actions** as its source. No hosting credentials or
custom domain are needed. The workflow obtains the repository base path from
`configure-pages`; JavaScript-generated icons use the same Vite base.

For a matching local deployment check:

```sh
PAGES_BASE_PATH=/subagent-bridge-site/ npm run build
PAGES_BASE_PATH=/subagent-bridge-site/ npm run check
```

Ordinary `npm run build` uses relative paths, so it also works at the root of a
local preview server or Cloudflare Pages. Cloudflare build settings remain
`npm run build` / `dist`; `wrangler.jsonc` optionally supports Workers Static Assets.
GitHub Pages does not apply Cloudflare's `_headers` file. The site adds no
analytics or tracking cookies; GitHub's hosting service records requests under
its own privacy policy.

## Sharing metadata

`index.html` includes an absolute canonical URL, Open Graph website metadata,
image dimensions and alt text, and an X large-image card with `@am_tarachand`.
`public/social.png` is a committed 1200 × 630 PNG so crawlers do not need
JavaScript or SVG support. Its editable source is `public/social.svg`:

```sh
npm run social:build
```

`robots.txt` and `sitemap.xml` identify the same production URL. If the domain or
repository name changes, update these files, metadata, the 404 home link, and the
canonical checks in `scripts/check.mjs` together. Social networks may cache
previews; fetching valid metadata does not prove each network has refreshed it.

## Connect real downloads

Edit **`src/release.json`**, then rebuild:

- `sourceUrl`: the public Subagent Bridge application repository. This website remains in its own repository.
- `releaseNotesUrl`: the public release page
- Each platform's `url`: an HTTPS installer asset URL on GitHub Releases or your R2 custom domain
- Update `version`, package details, and platform notes with each verified release

Null URLs render a clear availability message, not a fake download button. Source and release-note links remain hidden until configured. No operating-system guessing or automatic download. The user selects a platform explicitly.

Version 0.2.0 links directly to the public macOS Apple Silicon DMG on GitHub Releases. It targets macOS 12+ and requires Node.js 22.13+, configured agents, and the separate Codex/Pi worker adapters described in the installation guide. The preview is ad-hoc signed for bundle integrity, without Developer ID signing or Apple notarization. The website shows this status beside the download. Windows and Linux have packaging configuration, but are **not labelled released or tested**. Claude Code is explicitly deferred. Update these claims and the FAQ only after verifying a release.

Before announcing downloads:

```sh
npm run build
npm run check:release
```

This intentionally fails until a source URL and at least one installer URL are set. It validates configuration, not remote asset availability or signatures: verify the actual URLs and packages separately.

**Do not put installers in `public/`.** Cloudflare Pages has a 25 MiB per-file limit, while the current Mac DMG is about 55 MiB. Keep the website on Pages/Workers and installers on GitHub Releases or R2. R2 has its own quotas/billing; GitHub Releases is a straightforward option for a public open-source app.

## Structure

```text
index.html           Story, product illustrations, accessibility, FAQ
src/main.js          Rule preview, source links, macOS release rendering
src/style.css        Responsive layout, theme, reduced-motion support
src/release.json     The only place to change platform download links
public/              Icons, social PNG/SVG, sitemap, robots, 404, Cloudflare headers
scripts/check.mjs    Release config + static asset checks
wrangler.jsonc       Optional Workers Static Assets deployment
```

The site loads no third-party scripts. The font is bundled locally. `_headers` supplies a restrictive CSP; use the production bundle, not Vite’s development server, when testing that policy. Inter is distributed under the SIL Open Font License by Fontsource. Brand names identify integrations and do not imply endorsement.

The production canonical URL and PNG sharing card are configured and checked by `npm run check`.

## Verification

Build and asset checks run in GitHub Actions. Browser acceptance includes desktop/mobile layout, switching examples, choosing a worker, disabling a rule, Claude Code selection, source and social links, FAQ expansion, keyboard controls, and the unpublished download state. Details are recorded in `QA.md` after live verification.

## References

- [Cloudflare Pages build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/)

The interactive preview lets visitors change the parent, task, delegation policy, worker, model alternatives, thinking level, and rule toggle. It uses an illustrative local catalogue, without contacting a model provider. Third-party harness artwork is documented in `public/icons/SOURCES.md` and displayed in monochrome.

Only macOS has a download CTA. Windows and Linux display Coming soon. Until `sourceUrl` is set, GitHub icons navigate to the local source/contact section, which explicitly says the public repository is coming soon. Set `sourceUrl` to the real GitHub repository before publishing source links.
