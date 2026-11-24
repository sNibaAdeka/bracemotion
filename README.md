# BraceMotion

Landing page for **BraceMotion**, a student research prototype: a wrist-worn device that records hand movement with a six-axis sensor and responds with vibration from a small motor.

**Live site:** https://bracemotion.netlify.app

> BraceMotion is a research prototype, not a medical device. Its clinical effect has not been established.

## What is here

This is the R5 version of the site from October 2026: the dark page with the purple hero, the 3D bracelet you can take apart (Assembled / Exploded) and the large Evolventa wordmark.

```
site/                 the built site, served as is
  assets/             JavaScript and CSS bundles, including the 3D scene
  fonts/              Evolventa (see fonts/NOTICE.txt for its licences)
  images/             prototype photographs, V2 to V4
  _redirects          client-side routes: /sign-in, /account/preview
netlify/functions/    the inquiry API used by the "Discuss the project" form
  inquiry.ts          POST /api/inquiry, stores requests in Netlify Blobs
  health.ts           GET /api/health
```

## How it was restored

The original build was published from a local folder and never committed. The newest complete copy on disk was the R5 "pure black" revision, which turned every background black. This repository takes that build and puts back the colours of the revision before it (R5 with NexaCore panels), using the values recorded in its QA report:

| Part | Pure black | Restored |
| --- | --- | --- |
| Hero stage | `#000` | `#160b26` with a soft purple glow |
| Page and header | `#000` | `#030305` |
| Section panels | `#000` | `#08080c`, `#111116`, `#141419` |
| "04" card | `#000` | `#1b1624` |
| Question block | `#000` | `#17151e` |
| Pricing cards | `#000` | `#191222`, `#15151e`, `#1d141f` |
| Service card glow | hidden | shown |

All changes are in `site/assets/index-BSkvKKTD.css`; the JavaScript is the original build.

The November 2026 Next.js rebuild lives on the [`nextjs-rebuild`](https://github.com/sNibaAdeka/bracemotion/tree/nextjs-rebuild) branch.

## Run it locally

```bash
npx serve site -s
```

The inquiry form needs the Netlify Functions runtime:

```bash
npm install
npx netlify dev
```

## Deploy

The repository is connected to Netlify: every push to `main` publishes `site/` and deploys the functions (see `netlify.toml`).

## Credits

Third-party code and assets are listed in `site/attributions.txt` and `site/r5-component-attributions.txt`. The NexaCore card adaptations are MIT-licensed (`site/licenses/nexacore/`). Photographs come from the BraceMotion project presentation.
