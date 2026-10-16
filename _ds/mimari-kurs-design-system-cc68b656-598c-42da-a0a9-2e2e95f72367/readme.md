# Mimari Kurs — Design System

Dark, cinematic, premium brand system for **Mimari Kurs**, an Autodesk Authorized Training Center (ATC) that teaches photorealistic architectural rendering with **3ds Max + V-Ray + Corona** to architects and interior architects.

> Render bilmeyen tasarımcıları, portfolyosuyla fark yaratan ve freelance gelir elde edebilen render uzmanlarına dönüştürürüz.

**Brand personality:** professional yet warm, honest, inspiring. No hype — focused on concrete career outcomes. Parent platform: **ARCHIFY (@archifycom)**. 1000+ graduates. 120-hour live program, 1:1 mentorship, %100 learning guarantee.

---

## Sources

- `uploads/index.html` — the live **3ds Max funnel landing page**. The authoritative source for the token system, type scale, component patterns (pills, tool tiles, stat numbers, CTAs). Every token here was lifted from its `:root`.
- `uploads/story-brief.md` / `uploads/mimari-kurs-story-brief.md` — full brief for the "Biz Kimiz?" Instagram Story series (9-frame version).
- Additional brief (chat) — the **7-frame** Story series that is the primary deliverable.
- `uploads/mimari kurs DERS logo.jpg` — wordmark (white on black) → `assets/logo-mimari-kurs.jpg`.
- `uploads/unnamed (1).png` — Autodesk ATC badge (black on transparent) → `assets/autodesk-atc-badge.png`; a white recolor for dark surfaces is at `assets/autodesk-atc-badge-white.png`.

---

## Index / manifest

- **`styles.css`** — the only file consumers link. `@import`s the token + font files.
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`.
- **`components/core/`** — `Button`, `Pill`, `StatNumber`, `PageIndicator` (React primitives + `.d.ts` + `.prompt.md` + card).
- **`templates/story-frame/`** — `StoryFrame.dc.html`, a reusable single 1080×1920 story-frame Design Component (props: frame number, eyebrow, title, body, CTA).
- **`ui_kits/biz-kimiz-story/`** — `index.html`, the finished **7-frame "Biz Kimiz?" Story series** ready to screenshot/export.
- **`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) for the Design System tab.

---

## CONTENT FUNDAMENTALS

- **Language:** Turkish, always. Numbers and brand terms (`3ds Max`, `V-Ray`, `Corona`, `Autodesk ATC`) stay in their original form.
- **Voice:** second person, warm and direct — *"sen"*, *"kendi ellerinle modelleyip render alırsın"*, *"Risk bizde — sen yalnızca öğrenmeye odaklan."* We address the reader as a peer, not a student to be lectured.
- **Tone:** confident but honest. We state concrete facts (120 saat, %100 garanti, 1000+ mezun, 2TB arşiv) instead of vague superlatives. Never over-promise.
- **Casing:** headlines are **Oswald UPPERCASE**. Body is sentence case. Mono eyebrows/labels are UPPERCASE with wide tracking.
- **Emphasis:** key numbers and keywords go **terracotta**; secondary emphasis is `<strong>` in pure white. Soft, emotive lines use *Instrument Serif italic* (e.g. *"Bir sonraki başarı hikâyemiz sen ol."*).
- **Emoji:** minimal to none. A single calendar/arrow glyph at most in CTAs.
- **Eyebrows:** short mono kickers — `BİZ KİMİZ?`, `NE YAPIYORUZ`, `NEDEN ÖNEMLİ` — set the section.
- **CTA copy:** action + reassurance. *"İletişime Geç → Profildeki linke tıkla."*

---

## VISUAL FOUNDATIONS

- **Mood:** dark, cinematic, premium. Near-black canvas (`#0A0A0A`) with restrained terracotta. Lots of negative space, clear hierarchy, never busy.
- **Color:** surfaces are a near-black ramp (`#0A0A0A → #141414 → #1C1C1C` + a translucent `white/4%` card). Ink is a **warm** white ramp (`#FFFFFF → #F5F2EC → #C8C2B8 → #9A938A`), never cold gray. The single brand accent is **terracotta `#D9532B`** used *sparingly* — CTAs, big numbers, keywords, the brand dot. It is a spice, not a base.
- **Type:** **Oswald** (condensed, 600/700, uppercase) for display; **Geist** for body (400/500, line-height 1.6, warm off-white); **Instrument Serif** italic for soft accents; **Geist Mono** for eyebrows, labels, page counters (uppercase, 0.12–0.22em tracking).
- **Backgrounds:** flat near-black, lifted by subtle **radial vignettes/spotlights** in terracotta-at-low-opacity, and an optional **faint white grid** (4% lines, 40–64px) masked to fade at the edges — evokes a 3D viewport. No photographic backgrounds in the system itself (drop renders behind a `--mk-scrim-bottom` gradient when used).
- **Borders:** hairlines only — `white/10%` subtle, `white/18%` medium, `terracotta/35%` accent. 1–1.5px.
- **Radii:** cards/tiles `14px`; larger panels `20px`; pills/CTAs/buttons fully rounded `999px`; small chips `9px`.
- **Cards/tiles:** elevated `#141414` fill, hairline border, soft deep shadow (`0 8px 32px black/45%`). The "primary" tile adds a faint terracotta top-gradient + accent border.
- **Glow:** the signature flourish — terracotta box/text-shadows (`0 0 24px`–`0 0 60px rgba(217,83,43,.2–.45)`) on the brand dot, primary CTAs and hero stat numbers. Used selectively so it stays special.
- **Numbers:** hero metrics are enormous Oswald terracotta numerals with a mono caption (`120 / Saat`, `%100`, `2TB`, `1000+`).
- **Hover:** borders brighten (`subtle → medium`); fills lift one elevation step. **Press:** slight `scale(.98)` + deeper accent (`accent-600`). **Easing:** `cubic-bezier(0.4,0,0.2,1)`; playful moments use the bounce curve. Fades over flourish; no gratuitous motion.
- **Transparency/blur:** translucent `white/4%` cards over the grid; occasional `backdrop-filter: blur` on overlay chips. Used to add depth, not decoration.
- **Layout:** funnel content column maxes at `540px`; Story frames are `1080×1920` with `~84–96px` safe padding. Fixed header (brand dot + wordmark + page counter + slogan) and a footer brand mark recur on every Story frame for series cohesion.

---

## ICONOGRAPHY

- The brand is **type-and-glyph led**, not icon-heavy. There is no custom icon font.
- The recurring "icon" is the **terracotta brand dot** (a small glowing circle) before the wordmark and footer mark.
- Tool identity (3ds Max / V-Ray / Corona) is expressed as **named tiles** with mono role labels and index numbers — not pictograms. V-Ray reads blue-ish (`#5b8fd6`), Corona warm orange (`#ee5a2b`) when their names are tinted.
- **Unicode glyphs** are used sparingly as functional marks: `→` (CTA direction), `●`/`·` separators. Emoji are avoided in finished design.
- **Real assets:** the Autodesk **ATC badge** (black original + white recolor in `assets/`) is the one external logo lockup; place the white version on dark surfaces. The Mimari Kurs wordmark is set in Oswald, not an image, in most contexts.
- **If you need UI icons** (arrows, check, play, whatsapp), use a thin stroke set — Lucide (CDN) is the closest match to the hairline aesthetic. *(Substitution — flag if a different set is preferred.)*

---

## Namespace

Components compile to `window.MimariKursDesignSystem_cc68b6`. In a card/HTML:
`const { Button, Pill, StatNumber, PageIndicator } = window.MimariKursDesignSystem_cc68b6;`

## Caveats

- **Fonts load from Google Fonts CDN** (Oswald, Geist, Geist Mono, Instrument Serif) — no binaries are vendored, so the compiler reports 0 `@font-face`. For fully offline/print use, host the WOFF2 files locally and add real `@font-face` rules.
- The ATC white badge is a flat recolor of the supplied black artwork.
