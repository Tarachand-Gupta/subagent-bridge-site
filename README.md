# Harness Bridge website

A separate, MIT-licensed product site built with **Vite + vanilla JavaScript + CSS**. No framework, server, accounts, analytics, or ChatGPT Sites dependency. Self-hosted Inter font. Inspired by Diskzy’s product-first storytelling; all copy and UI illustrations here are original to Harness Bridge.

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

## Publish on Cloudflare Pages

Create a GitHub repo from this independent checkout, push it, then connect it in Cloudflare Pages:

- Framework: **Vite** (or None)
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`
- Node: 22 (also set in `.node-version`)
- No secrets or runtime environment variables

Or deploy the prebuilt site with your authenticated Cloudflare CLI:

```sh
npx wrangler pages deploy dist --project-name=harness-bridge-site
```

## Alternatively, Workers Static Assets

Cloudflare recommends Workers for new static sites. This site also includes a minimal `wrangler.jsonc` for an assets-only deployment:

```sh
npm run build
npx wrangler deploy
```

No Worker script or paid API is required by this website. Cloudflare account limits still apply. Neither command above has been run for this project; no public deployment or Cloudflare resource has been created.

## Connect real downloads

Edit **`src/release.json`**, then rebuild:

- `sourceUrl`: public application repository (not this website’s repo, unless intended)
- `releaseNotesUrl`: the public release page
- Each platform's `url`: an HTTPS installer asset URL on GitHub Releases or your R2 custom domain
- Update `version`, package details, and platform notes with each verified release

Null URLs render a clear availability message, not a fake download button. Source and release-note links remain hidden until configured. No operating-system guessing or automatic download. The user selects a platform explicitly.

The current app has a tested macOS Apple Silicon build; public download is not configured. The local Mac installer is unsigned. Windows and Linux have packaging configuration, but are **not labelled released or tested**. Claude Code is explicitly deferred. Update these claims and the FAQ only after verifying a release.

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
public/              Original icon/social SVG, 404 page, Cloudflare headers
scripts/check.mjs    Release config + static asset checks
wrangler.jsonc       Optional Workers Static Assets deployment
```

The site loads no third-party scripts. The font is bundled locally. `_headers` supplies a restrictive CSP; use the production bundle, not Vite’s development server, when testing that policy. Inter is distributed under the SIL Open Font License by Fontsource. Brand names identify integrations and do not imply endorsement.

For a production domain, add an absolute canonical URL and use a raster version of `public/social.svg` for social networks that do not support SVG preview images.

## Verification

Build and asset checks run in GitHub Actions. Browser acceptance includes desktop/mobile layout, switching examples, choosing a worker, disabling a rule, Claude Code selection, source and social links, FAQ expansion, keyboard controls, and the unpublished download state. Details are recorded in `QA.md` after live verification.

## References

- [Cloudflare Pages build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/)

The interactive preview lets visitors change the parent, task, delegation policy, worker, model alternatives, thinking level, and rule toggle. It uses an illustrative local catalogue, without contacting a model provider. Third-party harness artwork is documented in `public/icons/SOURCES.md` and displayed in monochrome.

Only macOS has a download CTA. Windows and Linux display Coming soon. Until `sourceUrl` is set, GitHub icons navigate to the local source/contact section, which explicitly says the public repository is coming soon. Set `sourceUrl` to the real GitHub repository before publishing source links.
