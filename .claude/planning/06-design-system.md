# 06 — Design system (refined Sri Lankan heritage)

The look should feel like a well-made Sri Lankan book: warm parchment paper, gold and
crimson of the national flag and temple murals, restrained *liyavel* vine ornament, and
the texture of *ola-leaf* (palm-leaf) manuscripts. Tasteful and literary — not a tourist
poster.

**v2 (current):** the same brand hues, desaturated and confined to accents (buttons,
badges, stars, illustration) over much calmer, lower-chroma neutrals, so the site reads as
a polished publishing product rather than a festival poster. The v1 palette below the line
was the original, brighter take — kept here for history; `src/index.css` implements v2.

Everything below is expressed as **design tokens → Tailwind theme → shadcn CSS variables**
so all shadcn/ui components inherit the theme automatically.

## Palette (v2 — current)

### Brand

| Token | Name & source | Hex (light) | Hex (dark) |
|---|---|---|---|
| `brand-gold` | Turmeric / robe saffron, desaturated to an ochre accent | `#BE892D` | `#D3AC69` |
| `brand-gold-deep` | Darker gold for text/borders on light bg | `#8B6123` | `#C49145` |
| `brand-crimson` | Flag maroon / kurakkan red, deepened rather than bright | `#74252F` | `#BE606C` |
| `brand-crimson-deep` | Hover / active crimson | `#571923` | `#A74451` |
| `brand-green` | Flag green — sparingly, tags & illustration | `#23574A` | `#54AB94` |
| `brand-orange` | Flag orange, muted to a terracotta | `#BC602F` | `#C9845E` |

### Neutrals (warm, low-chroma — never pure white/black, never bright parchment)

| Token | Role | Hex (light) | Hex (dark) |
|---|---|---|---|
| `paper` | app background | `#F9F8F6` | `#1E1915` |
| `paper-raised` | cards, popovers | `#FDFDFC` | `#29231E` |
| `paper-sunk` | muted panels, table stripes | `#F0EEEA` | `#15120E` |
| `ink` | primary text | `#27201B` | `#EDE7DE` |
| `ink-soft` | secondary text | `#655A53` | `#BAAFA0` |
| `line` | borders / dividers | `#E0DCD6` | `#403830` |

### Functional

| Token | Hex (light) | Hex (dark) |
|---|---|---|
| `rating` (stars) | `#C6922A` | `#D5B26D` |
| `success` | `#265E50` | `#62B29C` |
| `warning` | `#9D6F25` | `#D1AA61` |
| `destructive` | `#962C34` | `#CC666E` |
| `info` | `#385E75` | `#7BA9C1` |

<details>
<summary>v1 — original brighter palette (superseded)</summary>

### Brand

| Token | Name & source | Hex |
|---|---|---|
| `brand-gold` | Turmeric / robe saffron — flag border & panels | `#E8A33D` |
| `brand-gold-deep` | Darker gold for text/borders on light bg | `#B9781F` |
| `brand-crimson` | Flag maroon / kurakkan red | `#8D1D2C` |
| `brand-crimson-deep` | Hover / active crimson | `#6E1421` |
| `accent-green` | Flag green — sparingly, tags & success | `#1E6F5C` |
| `accent-orange` | Flag orange — sparingly, highlights | `#E96B26` |

### Neutrals (warm, never pure white/black)

| Token | Role | Hex (light) |
|---|---|---|
| `paper` | app background — parchment | `#FBF6EC` |
| `paper-raised` | cards, popovers | `#FFFDF7` |
| `paper-sunk` | muted panels, table stripes | `#EFE4CE` |
| `ink` | primary text — manuscript ink | `#241E1A` |
| `ink-soft` | secondary text | `#5A5048` |
| `line` | borders / dividers | `#D8C8A8` |

### Dark theme (lacquer & teak)

| Token | Role | Hex (dark) |
|---|---|---|
| `paper` | background — dark teak/lacquer | `#1E1813` |
| `paper-raised` | cards | `#2A231C` |
| `paper-sunk` | muted panels | `#161009` |
| `ink` | primary text — warm bone | `#F1E7D6` |
| `ink-soft` | secondary text | `#B9AC97` |
| `line` | borders | `#3D3327` |
| brand tokens | gold/crimson kept, slightly lightened for contrast | `brand-gold` → `#F0B65C`, `brand-crimson` → `#C24C5A` |

### Functional

| Token | Hex light / dark |
|---|---|
| `rating` (stars) | `#E0A030` / `#F0B65C` |
| `success` | `#1E6F5C` / `#4FB79E` |
| `warning` | `#C9871B` / `#E5A93D` |
| `danger` | `#B4232F` / `#E5636E` |
| `info` | `#3A6B8A` / `#6FA8C7` |

</details>

## Token → shadcn variable mapping

Set in `src/index.css` as HSL triples on `:root` and `.dark` (shadcn convention).
shadcn/ui components read these; do not restyle components individually.

| shadcn var | Light source token | Dark source token |
|---|---|---|
| `--background` | `paper` | `paper` (dark) |
| `--foreground` | `ink` | `ink` (dark) |
| `--card` / `--popover` | `paper-raised` | `paper-raised` (dark) |
| `--card-foreground` / `--popover-foreground` | `ink` | `ink` (dark) |
| `--primary` | `brand-crimson` | `brand-crimson` (dark) |
| `--primary-foreground` | `#FDFDFC` | `#1E1915` |
| `--secondary` | `brand-gold` | `brand-gold` (dark) |
| `--secondary-foreground` | `ink` | `#1E1915` |
| `--muted` | `paper-sunk` | `paper-sunk` (dark) |
| `--muted-foreground` | `ink-soft` | `ink-soft` (dark) |
| `--accent` | `brand-gold` @ 18% over paper | `brand-gold` @ 22% over paper |
| `--accent-foreground` | `brand-gold-deep` | `brand-gold` (dark) |
| `--destructive` | `danger` | `danger` (dark) |
| `--border` / `--input` | `line` | `line` (dark) |
| `--ring` | `brand-gold-deep` | `brand-gold` (dark) |
| `--radius` | `0.625rem` (pol-kudu — moderate, friendly) | same |

Custom (non-shadcn) vars also defined: `--rating`, `--genre-bg`, `--genre-fg`,
`--motif` (defaults to `currentColor`).

## Typography

| Level | Font | Size / line-height (en) | si line-height |
|---|---|---|---|
| Display | Latin serif / Noto Serif Sinhala | 2.5rem / 1.15 | 1.3 |
| H1 | serif | 2rem / 1.2 | 1.35 |
| H2 | serif | 1.5rem / 1.25 | 1.4 |
| H3 | sans (Inter / Noto Sans Sinhala) | 1.25rem / 1.3 | 1.45 |
| Body | sans | 1rem / 1.55 | 1.72 |
| Small / meta | sans | 0.875rem / 1.5 | 1.65 |

`body.lang-si` applies the wider line-heights and the Sinhala-first font stacks (see
[05-i18n.md](05-i18n.md)). Weights: body 400/500, headings 600/700.

## Motifs (tasteful, non-kitsch)

Ship as inline React SVG components in `src/components/` using `currentColor`, marked
`aria-hidden="true"`, and honoring `prefers-reduced-motion` (no animation by default):

- **`MotifDivider`** — a slim *liyavel* (curling vine) rule for section breaks and the
  footer top edge. Low contrast (`line` color), ~24px tall.
- **`LotusMark`** — a simplified lotus / palm-leaf glyph for the logo lockup and favicons.
- **Ola-leaf texture** — a tiling PNG/SVG at ~4–6% opacity behind the home hero and the
  auth pages only. Never behind body text.
- **Genre chips** — small pills using `--genre-bg`/`--genre-fg` (gold-tint), optional
  tiny leaf tick.
- **Corners** — `--radius` 0.625rem everywhere; cards get a 1px `line` border rather than
  heavy shadows (paper, not material).
- **Footer** — a woven *pandanus mat* pattern strip (SVG, `line` on `paper-sunk`).

Keep it sparse: at most one motif per viewport section.

## Components to theme first (M1)

Button, Card, Badge (genre chip variant), Input/Textarea, Select, Tabs, Avatar,
Dialog (report + review forms), Tooltip, Skeleton, plus the app-specific
`RatingStars`, `LanguageToggle`, `NavBar`, `Footer`, `EmptyState`/`ErrorState`.

## Accessibility

- Verify every text/background pair at ≥ 4.5:1 (AA), ≥ 3:1 for large text and UI borders.
  Gold on parchment fails as body text — use `brand-gold-deep` (`#8B6123`) for gold text
  on light, reserve bright `brand-gold` for fills and dark-mode text.
- `--ring` (`brand-gold-deep` / `brand-gold`) must be clearly visible on `paper`,
  `paper-raised`, and `brand-crimson` surfaces — 2px offset ring.
- Provide reduced-motion variants; motif textures respect `prefers-reduced-motion` and can
  be disabled.
- Both light and dark themes must pass an automated contrast check (axe / Lighthouse) in M6.

## Deliverable for implementation

M1 produces:
- `tailwind.config.ts` — `theme.extend.colors` mapping the tokens above, `fontFamily`,
  `borderRadius` from `--radius`.
- `src/index.css` — `:root` and `.dark` blocks with all shadcn vars + custom vars as HSL,
  `@font-face` declarations, `body.lang-si` / `body.lang-en` rules.
- The motif SVG components listed above.
