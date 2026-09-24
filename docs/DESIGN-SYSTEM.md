# OnSkillIT visual and interaction design system

Status: **architecture approved 2026-09-25; pixel-level visual validation during implementation**. No UI has been implemented or visually tested. The founding partner requires portfolio-derived **color grading**, independent motion/interaction, full responsiveness, complete Bangla/English purity, dark/light theme and exceptional polish.

## Brand relationship

Portfolio source (`soobujmiah.github.io/DESIGN_SYSTEM.md`) uses near-black `#050507`, warm off-white `#e4e2df` and restrained green `#22c55e`. Carry that tonal relationship into OnSkillIT while making its visual identity more educational and service-oriented. Adopted concept motif: a sequence of connected learning/service milestones expressed through line, depth and progress, not the portfolio's geographic map, particles or page turns. Public hero should communicate the actual approved value proposition immediately; avoid generic tech imagery and invented student claims.

## Token architecture

Separate foundation tokens (color scales, type, spacing, radii, elevation, motion) from semantic tokens (`surface.canvas`, `surface.card`, `text.primary`, `text.secondary`, `border.default`, `action.primary`, `status.success/warning/error/info`, `focus.ring`). Semantic tokens have explicit dark and light values. Dark canvas/primary ink/green anchor derive from portfolio grading. Light theme is warm neutral with green accents, not white-on-green inversion. Accent overuse and low-opacity text must be rejected by contrast review. Create tokens for hover, pressed, disabled, selected, focus, loading and invalid states. Document actual contrast ratios and approvals before code.

Typography: Bangla needs Noto Sans Bengali or a reviewed equivalent with dedicated metrics; Latin UI can evaluate Inter or a distinct face. Use a limited display style for headings, a comfortable text face for learning and a restrained mono treatment for technical labels. Bangla line-height/letter-spacing must be tested separately; never apply wide Latin tracking to Bangla. Digit localization follows language. Use a type scale with body ≥16 CSS px in learning/forms and fluid headings; sizes below are the implementation baseline and must pass device review.

Spacing and layout: 4px base rhythm with semantic spacing steps; constrained prose width; responsive grid for catalog cards; content-first single column on narrow screens. Admin tables may transform to labeled cards or bounded scrollers that preserve row identity/actions. Keep global navigation, search, active course and account context predictable. Sticky UI must not obscure form controls or accessibility focus.

## Independent motion system

Interaction family: **guided progress**. Motion should show where content came from or whether an action succeeded. Public route transitions are ordinary navigation with optional brief section entrance; catalogs filter in place with live result count; cards respond with modest elevation/color; enrollment shows clear state transition; lesson progress moves only after saved completion; schedule items expand/collapse; admin changes show stable inline confirmation. Proposed durations: micro-feedback 120–180ms, panels 180–240ms, entrances 240–320ms. These are hypotheses for prototype validation, not portfolio constants. Use compositor-friendly opacity/transform and avoid changing layout geometry unexpectedly. No scroll hijack, magnetic pointer, page-turn gestures, map flights or particle identity mark. Reduced-motion mode removes nonessential movement without hiding status or functionality.

## Shared component contract

| Component | Public use | Staff/portal use | Required states |
|---|---|---|---|
| Button/link | CTA, navigation | save, publish, approve | default, hover, focus, pressed, disabled, busy |
| Card | service/course/project | summary, task, record | default, selected, unavailable |
| Field | inquiry, registration | editor, filter, finance | hint, required, invalid, success, busy |
| Table/list | course schedule | users, enrollments, invoices | loading, empty, filtered, paged, error |
| Dialog/drawer | optional details | confirmation, editing | focus trap, escape, destructive warning |
| Tabs/accordion | FAQ, curriculum | record views | keyboard, expanded/collapsed |
| Alert/toast | transaction result | operational result | accessible announcement, persistent error |
| Progress/status | course completion | workflow, batch state | text equivalent, never color-only |

The CMS page builder uses the same visual primitives but limits editors to approved typed sections. Custom media crops, logos and illustrations must carry documented rights. Team/developer cards come from CMS data and require consent to publish names/photos. Footer attribution is configurable and legally verified.

## Responsive and accessibility acceptance

Verify each major route at 320, 360, 390, 768, 1024, 1440 and ≥1920 CSS px; touch, keyboard, orientation where relevant, 200%/400% zoom and real Bangla strings. No horizontal page overflow, clipped critical text, hidden form action or unusable modal. Mobile navigation exposes the same meaningful destinations as desktop. Course media includes captions/transcripts where required; progress has a text equivalent. Focus remains visible in both themes. Target WCAG 2.2 AA, including reduced motion and sufficient contrast. Review with screen reader samples and low-end mobile performance evidence on GitHub/staging. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Language and theme contract

All authored UI, CMS, accessible text, emails/notifications and metadata have Bangla and English variants. Bangla authored copy contains no Latin letters; English authored copy contains no Bengali characters. Immutable addresses/URLs/identifiers are explicitly registered data exceptions and isolated from prose. CI checks both directions and locale parity; a content review checks natural language quality. Dark/light toggle appears across public, admin and portals, honors system preference until overridden, persists choice and avoids a first-paint flash. Test every component, illustration and media overlay in both themes and languages.

See `UX-CONCEPT-REVIEW.md` for original page-pattern concepts, proposed semantic foundation and the uncompleted visual review gate.

## Implementation-time visual approval artifacts

Before implementation, prepare a reference board with verified sources, brand tokens, type specimens, public homepage/service/course pages, learner lesson, staff dashboard/CMS editor, mobile navigation and all important states. Partners approve visual direction; accessibility/responsive/performance reviewers approve objective gates. Record outcomes and changed tokens in an ADR or design decision log.

## Implementation token baseline

Tokens are semantic and theme switched; components must not embed brand hex values. Contrast must be measured against actual backgrounds in GitHub/staging and adjusted if WCAG 2.2 AA fails. These are starting values, not evidence of a measured contrast pass.

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface.canvas` | `#F7F8F5` | `#090D0C` | Page ground |
| `surface.raised` | `#FFFFFF` | `#151D1A` | Cards and forms |
| `surface.overlay` | `#FFFFFF` | `#1C2621` | Dialogs/drawers |
| `text.primary` | `#17231D` | `#F2F5F0` | Primary text |
| `text.secondary` | `#46544B` | `#C3D0C6` | Supporting text |
| `border.default` | `#C9D5CB` | `#425248` | Rules and controls |
| `action.primary.bg` | `#176B3A` | `#51D486` | Solid action |
| `action.primary.text` | `#FFFFFF` | `#082113` | Action label |
| `focus.ring` | `#1E75CF` | `#9BC9FF` | Keyboard focus |
| `status.success` | `#1D6E3B` | `#62DB8C` | Success with text/icon |
| `status.warning` | `#855500` | `#FFD27A` | Warning with text/icon |
| `status.error` | `#AD3030` | `#FF8A8A` | Error with text/icon |
| `status.info` | `#165F9B` | `#8AC9FF` | Information with text/icon |

**Foundation scale:** spacing `0, 4, 8, 12, 16, 24, 32, 48, 64, 96` CSS px; semantic gaps `xs=4`, `sm=8`, `md=16`, `lg=24`, `xl=32`, `section=64` (48 narrow). Grid: 12 columns wide, 8 tablet, 4 mobile; max content width 1200px, prose width 70ch; gutters 16px mobile, 24px tablet, 32px desktop. Breakpoints are content triggers at 640, 768, 1024 and 1440 CSS px, not device labels. Radius `field=8`, `card=12`, `overlay=16`, `pill=9999`; borders 1px normal, 2px focus/selected. Elevation uses border and subtle shadow: level 0 none, level 1 `0 2px 8px rgba(0,0,0,.08)`, level 2 `0 8px 24px rgba(0,0,0,.16)`; dark mode reduces shadow reliance.

**Type scale:** body 16px/1.6 English and 17px/1.7 Bangla, small 14px/1.5, lead 20px/1.5, headings 24/30/40/56px with fluid interpolation for the top two sizes. English UI: self-hosted Inter if license verified; Bangla: self-hosted Noto Sans Bengali if license verified. Both have system sans fallbacks. Bangla receives no forced uppercase or letter spacing; localized digits follow locale except immutable identifiers. Limit long learning prose to 70ch-equivalent and use comfortable media captions.

**Components:** button variants primary/secondary/quiet/destructive; inputs with persistent label, help and error text; cards with clear title/metadata/action; data tables with sortable labeled headers and mobile row identity; navigation with active and breadcrumb states; dialogs and drawers with focus containment/return; tabs/accordions with keyboard operation; badges never color-only; alerts persistent for consequential errors; toasts only for noncritical confirmations; pagination with current/total status. All have idle, hover, focus-visible, pressed/selected, disabled, busy and relevant invalid/success states. Empty/loading/error/success patterns use the UX contract in UX-CONCEPT-REVIEW.

**Imagery/iconography:** use licensed real work/learning media; publish rights and alt text per locale. Icons are simple consistent strokes, paired with labels for critical actions. Hero imagery must support copy in both languages and themes; no fake portraits, claims or metrics.

**Motion:** independent guided-progress interactions, 120–180ms micro feedback, 180–240ms panel, 240–320ms optional entrance, ease-out and compositor-safe properties. Reduce or remove nonessential movement under `prefers-reduced-motion`. Learning completion, enrollment and admin publish transitions show persisted state rather than celebratory animation before server confirmation.
