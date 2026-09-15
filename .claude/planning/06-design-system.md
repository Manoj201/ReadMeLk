# 06 — Design system (modern professional)

**v3 (current):** a clean, modern, professional theme — cool neutral slate/white surfaces,
a single confident ink-blue brand color for actions and links, and a warm amber accent
reserved for ratings and small highlights (a "Featured" ribbon, a divider dot). No themed
or cultural motifs. The platform's bilingual Sinhala/English identity lives in the
*product* (fonts, i18n, content) — see [05-i18n.md](05-i18n.md) — not in the color palette
or decorative illustration.

Earlier versions used a Sri Lankan heritage palette (flag gold/crimson on warm parchment);
that direction was tried and explicitly dropped. History is kept in the collapsed section
below for context, not as a reference for new work.

Everything below is expressed as **design tokens → Tailwind theme → shadcn CSS variables**
so all shadcn/ui components inherit the theme automatically.

## Palette (v3 — current)

### Brand

| Token | Role | Hex (light) | Hex (dark) |
|---|---|---|---|
| `brand-primary` | primary actions, links, focus ring | `#20396F` | `#5F8FDD` |
| `brand-primary-deep` | hover/active primary, `accent-foreground` | `#142852` | `#3B73CE` |
| `brand-accent` | ratings, "Featured" highlights — used sparingly | `#CE9127` | `#E0B152` |
| `brand-accent-deep` | hover/active accent | `#A06D22` | `#D2962D` |

### Neutrals (cool slate — never warm parchment)

| Token | Role | Hex (light) | Hex (dark) |
|---|---|---|---|
| `paper` | app background | `#FCFCFD` | `#101219` |
| `paper-raised` | cards, popovers | `#FFFFFF` | `#181C25` |
| `paper-sunk` | muted panels, table stripes | `#F0F2F4` | `#0C0E13` |
| `ink` | primary text | `#171C26` | `#E7EBEF` |
| `ink-soft` | secondary text | `#5D636F` | `#9BA4B0` |
| `line` | borders / dividers | `#DFE2E7` | `#2B313B` |

### shadcn extras derived from the above

`secondary` (neutral button surface, not brand-colored) → `#EBECF0` light / `#272B35`
dark. `accent` (hover panel tint) → `#EEF1F6` light / `#222B39` dark, with
`accent-foreground` = `brand-primary-deep` / `brand-primary`.

### Functional

| Token | Hex (light) | Hex (dark) |
|---|---|---|
| `rating` (stars) | `#D99D26` | `#DDB35F` |
| `success` | `#2A6F4F` | `#56B388` |
| `warning` | `#C18825` | `#DBAD57` |
| `destructive` | `#AE292D` | `#D3696C` |
| `info` | `#3668A1` | `#709BCD` |

<details>
<summary>v1 / v2 — Sri Lankan heritage palette (superseded, dropped)</summary>

The original brief: "feel like a well-made Sri Lankan book — warm parchment paper, gold
and crimson of the national flag and temple murals, ola-leaf manuscript texture."
v2 desaturated the same hues into accents over calmer neutrals; the direction was then
dropped in favor of v3 above.

### Brand (v2)

| Token | Name & source | Hex (light) | Hex (dark) |
|---|---|---|---|
| `brand-gold` | Turmeric / robe saffron, desaturated to an ochre accent | `#BE892D` | `#D3AC69` |
| `brand-gold-deep` | Darker gold for text/borders on light bg | `#8B6123` | `#C49145` |
| `brand-crimson` | Flag maroon / kurakkan red, deepened rather than bright | `#74252F` | `#BE606C` |
| `brand-crimson-deep` | Hover / active crimson | `#571923` | `#A74451` |
| `brand-green` | Flag green — sparingly, tags & illustration | `#23574A` | `#54AB94` |
| `brand-orange` | Flag orange, muted to a terracotta | `#BC602F` | `#C9845E` |

### Neutrals (v2, warm)

| Token | Role | Hex (light) | Hex (dark) |
|---|---|---|---|
| `paper` | app background | `#F9F8F6` | `#1E1915` |
| `paper-raised` | cards, popovers | `#FDFDFC` | `#29231E` |
| `paper-sunk` | muted panels, table stripes | `#F0EEEA` | `#15120E` |
| `ink` | primary text | `#27201B` | `#EDE7DE` |
| `ink-soft` | secondary text | `#655A53` | `#BAAFA0` |
| `line` | borders / dividers | `#E0DCD6` | `#403830` |

### v1 — original brighter take

| Token | Hex |
|---|---|
| `brand-gold` | `#E8A33D` |
| `brand-gold-deep` | `#B9781F` |
| `brand-crimson` | `#8D1D2C` |
| `brand-crimson-deep` | `#6E1421` |
| `accent-green` | `#1E6F5C` |
| `accent-orange` | `#E96B26` |
| `paper` (light) | `#FBF6EC` |
| `paper` (dark) | `#1E1813` |
| `ink` (light) | `#241E1A` |
| `ink` (dark) | `#F1E7D6` |

The v1/v2 motif set (`LotusMark`, ola-leaf texture, the dagoba/palm-tree hero scene, flag
book-spine colors) has been replaced — see Motifs below for the v3 set.

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
| `--primary` | `brand-primary` | `brand-primary` (dark) |
| `--primary-foreground` | `#FFFFFF` | `paper` (dark) |
| `--secondary` | neutral gray (not brand-colored) | neutral dark gray |
| `--secondary-foreground` | `ink` | `ink` (dark) |
| `--muted` | `paper-sunk` | `paper-sunk` (dark) |
| `--muted-foreground` | `ink-soft` | `ink-soft` (dark) |
| `--accent` | light blue-tinted neutral | dark blue-tinted neutral |
| `--accent-foreground` | `brand-primary-deep` | `brand-primary` (dark) |
| `--destructive` | `destructive` | `destructive` (dark) |
| `--border` / `--input` | `line` | `line` (dark) |
| `--ring` | `brand-primary` | `brand-primary` (dark) |
| `--radius` | `0.625rem` | same |

Custom (non-shadcn) vars also defined: `--rating`, `--success`, `--warning`, `--info`,
`--brand-primary(-deep)`, `--brand-accent(-deep)`.

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
[05-i18n.md](05-i18n.md)). Weights: body 400/500, headings 600/700. Unchanged by the v3
color refresh — this was never heritage-specific.

## Motifs (v3 — book-focused, not themed)

Ship as inline React SVG components in `src/components/artwork.tsx` and `motifs.tsx`,
using `currentColor`/theme tokens, marked `aria-hidden="true"`, honoring
`prefers-reduced-motion` (no animation by default):

- **`BrandMark`** (`motifs.tsx`) — a simple open-book glyph for the logo lockup and
  favicons. Replaces the old lotus mark.
- **`MotifDivider`** (`motifs.tsx`) — a slim rule with a small accent dot for section
  breaks and the footer top edge.
- **`SubtleTexture`** (`motifs.tsx`) — a faint tiling line texture (~4–6% opacity) behind
  large empty backdrops (author cover placeholder). Never behind body text.
- **`HeroScene`** (`artwork.tsx`) — an open book + a small book stack with a soft
  brand-color glow, for the home hero. Replaces the old dagoba/palm-tree landscape.
- **`ShelfBanner`** (`artwork.tsx`) — a row of colored book spines (primary/accent/
  secondary) for section headers on the home page and books browse.
- **`CoverFallback`** (`artwork.tsx`) — a themed gradient stand-in for a missing book
  cover, cycling through primary/accent/info tints.
- **Corners** — `--radius` 0.625rem everywhere; cards get a 1px `line` border rather than
  heavy shadows.

Keep it sparse: at most one motif per viewport section.

## Components to theme first (M1)

Button, Card, Badge (genre chip variant), Input/Textarea, Select, Tabs, Avatar,
Dialog (report + review forms), Tooltip, Skeleton, plus the app-specific
`RatingStars`, `LanguageToggle`, `NavBar`, `Footer`, `EmptyState`/`ErrorState`.

## Accessibility

- Verify every text/background pair at ≥ 4.5:1 (AA), ≥ 3:1 for large text and UI borders.
  `brand-accent` (amber) fails as body text on light `paper` — use `brand-accent-deep`
  for amber text on light, reserve bright `brand-accent` for fills and dark-mode text.
- `--ring` (`brand-primary`) must be clearly visible on `paper`, `paper-raised`, and
  `brand-primary` surfaces — 2px offset ring.
- Provide reduced-motion variants; motif textures respect `prefers-reduced-motion` and can
  be disabled.
- Both light and dark themes must pass an automated contrast check (axe / Lighthouse) in M6.

## Deliverable for implementation

- `tailwind.config.ts` — `theme.extend.colors` mapping the tokens above, `fontFamily`,
  `borderRadius` from `--radius`.
- `src/index.css` — `:root` and `.dark` blocks with all shadcn vars + custom vars as HSL,
  `@font-face` declarations, `body.lang-si` / `body.lang-en` rules.
- The motif SVG components listed above.
