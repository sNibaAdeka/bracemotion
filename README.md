# BraceMotion

Landing page for **BraceMotion**, a student research prototype: a wrist-worn device that records hand movement with a six-axis sensor and responds with vibration from a small motor.

**Live site:** https://bracemotion.netlify.app

> BraceMotion is a research prototype, not a medical device. Its clinical effect has not been established.

## What is here

The R5 version of the site: the dark page with the purple hero, the 3D bracelet you can take apart (Assembled / Exploded) and the large wordmark. Built with Vite, React 19, three.js (react-three-fiber), Motion and GSAP.

```
src/
  App.tsx                     page sections
  components/ui/              hero (lycoris-specimen), 21st.dev components
  components/reveal/          scroll reveals (from the Forma Pilates Studio template)
  scene/                      the 3D bracelet: geometry, materials, lighting, motion
public/                       fonts, photographs, licences, _redirects
netlify/functions/            the inquiry API used by the "Discuss the project" form
  inquiry.ts                  POST /api/inquiry, stores requests in Netlify Blobs
  health.ts                   GET /api/health
```

### The 3D bracelet

- Studio image-based lighting (three's `RoomEnvironment`), a key light, a lavender rim light and soft 2048 px shadows.
- Physical materials: a satin printed shell with fine layer lines, a woven strap with sheen, a rounded strap edge and capped ends.
- Motion on the cover: the bracelet turns and rises in on load, floats, and tilts toward the pointer. Scroll and drag are damped. Frames run continuously only while that motion is on screen.

### Motion and design

- Section headings sharpen word by word out of a blur, paragraphs rise line by line, cards lift in with a stagger. Same timings as the owner's Forma Pilates Studio template; all reveals respect `prefers-reduced-motion`.
- 21st.dev components supplied by the owner: Background Paths (drifting lines behind the hero and on the sign-in page) and Box Loader (shown while the 3D scene loads).

### Colours

The R5 "pure black" revision turned every background black; this repository uses the colours of the revision before it (R5 with NexaCore panels), taken from that release's QA report: hero `#160b26` with a soft glow, page `#030305`, panels `#08080c`, `#111116`, `#141419`.

The November 2026 Next.js rebuild lives on the [`nextjs-rebuild`](https://github.com/sNibaAdeka/bracemotion/tree/nextjs-rebuild) branch.

## Run it locally

```bash
npm install
npm run dev
```

Checks:

```bash
npm run typecheck
npm test
npm run build
```

The inquiry form needs the Netlify Functions runtime: `npx netlify dev`.

## Deploy

The repository is connected to Netlify: every push to `main` runs `npm run build`, publishes `dist/` and deploys the functions (see `netlify.toml`).

## Credits

Third-party code and assets are listed in `public/attributions.txt` and `public/r5-component-attributions.txt`. The NexaCore card adaptations are MIT-licensed (`public/licenses/nexacore/`). Photographs come from the BraceMotion project presentation.
