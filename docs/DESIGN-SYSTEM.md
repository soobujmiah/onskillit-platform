# OnSkillIT visual and interaction design system

Status: concept for partner design review, 2026-09-24. No UI has been implemented or visually tested. The founding partner requires portfolio-derived **color grading**, independent motion/interaction, full responsiveness, complete Bangla/English purity, dark/light theme and exceptional polish.

## Brand relationship

Portfolio source (`soobujmiah.github.io/DESIGN_SYSTEM.md`) uses near-black `#050507`, warm off-white `#e4e2df` and restrained green `#22c55e`. Carry that tonal relationship into OnSkillIT while making its visual identity more educational and service-oriented. Proposed motif: a sequence of connected learning/service milestones expressed through line, depth and progress, not the portfolio's geographic map, particles or page turns. Public hero should communicate the actual approved value proposition immediately; avoid generic tech imagery and invented student claims.

## Token architecture

Separate foundation tokens (color scales, type, spacing, radii, elevation, motion) from semantic tokens (`surface.canvas`, `surface.card`, `text.primary`, `text.secondary`, `border.default`, `action.primary`, `status.success/warning/error/info`, `focus.ring`). Semantic tokens have explicit dark and light values. Candidate dark canvas/primary ink/green anchor derive from portfolio values above. Candidate light theme is warm neutral with green accents, not white-on-green inversion. Accent overuse and low-opacity text must be rejected by contrast review. Create tokens for hover, pressed, disabled, selected, focus, loading and invalid states. Document actual contrast ratios and approvals before code.

Typography: Bangla needs Noto Sans Bengali or a reviewed equivalent with dedicated metrics; Latin UI can evaluate Inter or a distinct face. Use a limited display style for headings, a comfortable text face for learning and a restrained mono treatment for technical labels. Bangla line-height/letter-spacing must be tested separately; never apply wide Latin tracking to Bangla. Digit localization follows language. Use a type scale with body ≥16 CSS px in learning/forms and fluid headings; final sizes after device review.

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

## Design approval artifacts

Before implementation, prepare a reference board with verified sources, brand tokens, type specimens, public homepage/service/course pages, learner lesson, staff dashboard/CMS editor, mobile navigation and all important states. Partners approve visual direction; accessibility/responsive/performance reviewers approve objective gates. Record outcomes and changed tokens in an ADR or design decision log.
