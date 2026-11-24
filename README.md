# BraceMotion

Landing page for **BraceMotion**, a student research prototype: a wrist-worn device that records hand movement with a six-axis sensor and responds with vibration from a small motor.

**Live site:** https://bracemotion.netlify.app

> BraceMotion is a research prototype, not a medical device. Its clinical effect has not been established. The app preview on the site uses synthetic data.

## The prototype

| Part | Role |
| --- | --- |
| ESP32-C3 | Runs the firmware; USB-C and antenna on the board |
| MPU6050 | Six-axis motion sensor: acceleration and angular velocity |
| Coin motor | Turns a signal from the board into vibration |
| Li-Po battery | Powers the board; a separate module charges it |
| Case and strap | Printed case with a lift-off lid on a thin textile strap |

Builds shown on the site: V2 (from mechanical compensation to vibration), V3 (smaller case, USB-C, motion sensor), V4 (the compact build).

## Stack

- Next.js 15 (App Router), exported as a static site (`output: "export"`)
- TypeScript (strict)
- Tailwind CSS v4
- Framer Motion 12
- Lucide icons, IBM Plex Sans and Plex Mono

Components adapted from [21st.dev](https://21st.dev): `background-paths` (hero lines), `health-stat-card` (app overview), `stats-bento` (V4 tile), `mini-chart` (last recording).

## Run it

```bash
git clone https://github.com/sNibaAdeka/bracemotion
cd bracemotion
npm install
npm run dev
```

Build the static site into `out/`:

```bash
npm run build
```

## Structure

```
app/                   layout, page, design tokens (globals.css)
components/sections/   hero, inside, builds, app-demo, questions, closing
components/ui/         background-paths, stat-card, axis-chart, mini-chart, signal-path
components/shared/     nav, motion provider
lib/                   demo data (synthetic), motion tokens, site constants
public/images/         prototype photographs, V2 to V4
```

## Deploy

The repository is connected to Netlify: every push to `main` runs `npm run build` and publishes `out/` to the live site (see `netlify.toml`).

## Accessibility and motion

- Every animation respects `prefers-reduced-motion`; the hero lines have a pause switch and stay still on phones.
- Colour contrast is 7:1 or more for body text; focus rings show on every control.
- The hero entrance is plain CSS, so the page reads in full without JavaScript.

## Credits

Photographs come from the BraceMotion project presentation.

## License

MIT, see [LICENSE](LICENSE).
