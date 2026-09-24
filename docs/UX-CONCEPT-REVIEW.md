# Original OnSkillIT UX and brand adaptation review

Status: **text concepts proposed, visual and usability approval pending**. Reviewed 2026-09-24. This is Phase 0 design work, not frontend implementation. Superdesign CLI was available, but its authorization session expired before a canvas project/draft could be created; no AI visual is claimed as reviewed. The concepts below are original specifications for later visual prototyping and owner review. The founding partner approved use of portfolio **color grading only**, with independent motion and interaction.

## Brand translation chain

```text
Portfolio tonal language (#050507 near-black, #e4e2df warm text, #22c55e green)
  → OnSkillIT principles: credible learning, visible progress, calm service clarity
  → OnSkillIT semantic tokens and bilingual typography
  → 74 route templates and shared page patterns
  → components and interaction states
```

Do not import portfolio page turns, moving map, identity mark, magnetic links, code, motion timings or component layouts. The OnSkillIT signature motif is **a clear path of learning/service milestones**, shown as content structure and state, not decorative particles. The name/mark requires owner-approved assets. Do not invent a logo.

## Proposed visual foundation (not final tokens)

| System | Proposed rule | Review evidence still needed |
|---|---|---|
| Color | Dark canvas near `#050507`, warm primary text near `#e4e2df`, green anchor near `#22c55e`; light canvas warm off-white with dark ink and controlled green accent | Contrast measurements in both themes, on real Bangla and English content |
| Semantic palette | `surface.canvas/raised/overlay`, `text.primary/secondary/inverse`, `border.default/strong`, `action.primary/hover/pressed`, `focus.ring`, `status.success/info/warning/error` | Accessible pairings and no color-only meaning |
| Typography | English: test Inter or similar highly legible UI face; Bangla: test Noto Sans Bengali or equivalent with independent metrics; limited display face only for verified headings | Font rights, loading, Bangla shaping, line breaks, numeral policy and script purity |
| Scale/grid | 4px spacing rhythm; body at least 16 CSS px; capped prose width; fluid heading scale; one-column mobile, flexible two/three-column catalog at larger widths | 320–1920+ px, zoom 200/400%, long Bangla titles |
| Radius/elevation | Modest radii by function: fields ~8px, cards ~12px, overlays ~16px; surfaces rely on border/contrast before shadow | Both-theme depth clarity, low-end device cost |
| Imagery/icons | Real OnSkillIT work/course imagery with rights; consistent simple line icons, text labels for critical actions | Media license/consent, crops, alt text, dark/light overlays |
| Motion | Guided progress: save/submit state, catalog result transition, lesson completion, batch status; restrained transform/opacity, no scroll hijack | Reduced-motion equivalence, latency, accessibility and performance review |
| Control states | Every button, card, field, table row and nav item needs idle/hover/focus/active/disabled/loading/error/success where relevant | Keyboard, touch, screen reader and status announcement review |

Dark/light choice follows system setting until user override, persists without first-paint flash, and applies to public/staff/portals. The Bangla version must contain Bangla authored copy without English letters; the English version must contain English authored copy without Bengali characters. URLs, email addresses and proper immutable identifiers are separately reviewed data exceptions, never mixed into prose as translation shortcuts. No fake copy is used to fill layouts.

## Page-pattern concept matrix

| Concept and canonical IDs | Original task pattern | Mobile/accessibility review |
|---|---|---|
| Home — PAGE-HOME | One verified value statement, two clear paths (learn / request service), approved proof, short latest offerings; editorial sections are CMS-managed | Hero CTA visible without animation, no unsupported claims, one-column order |
| Public navigation — public IDs | Short task labels for Services, Courses, Programs, Work/Insights only when published, Contact; language/theme and account controls | Full-screen or anchored menu with focus trap/return, 44px targets, same destinations as desktop |
| Services — PAGE-SERVICES / DETAIL | Problem-to-outcome discovery, scope, delivery process, evidence and inquiry CTA; canonical detail record | Filters do not hide result count; no fabricated case studies |
| Course discovery/detail — PAGE-COURSES / DETAIL | Outcome, level, prerequisites, format, instructor, syllabus, schedule/fee and enrollment availability | Sticky CTA must not cover content; syllabus accordion keyboard access; empty catalog explains availability |
| Enrollment — USER-ENROLLMENTS | Clear eligibility → seat/payment state → confirmation; no admission before verified payment/capacity | Recoverable errors, explicit pending status and safe retry; live region on state change |
| Contact — PAGE-CONTACT | Short service inquiry with privacy hint and human follow-up expectation | Labels above fields, large controls, validation in both languages, anti-spam without inaccessible puzzle |
| Authentication — AUTH-* | Email-or-mobile choice on one form; recovery branch explains staff-assisted mobile path | Password reveal accessible; generic reset responses; no OTP requirement in V1 |
| Student — USER-DASHBOARD and learning IDs | Next lesson/session first, progress as text + graphic, due work and certificates only when eligible | Prioritize current task, no dense chart-only progress, offline/error states |
| Client — CLIENT-* | Project/request status and invoice facts scoped to account; notes remain private | Long project names, document-like finance rows and clear support path |
| Staff landing / admin — ADMIN-* | `/staff` resolves to first authorized work queue; role-specific summary can live in existing queue, not a new page template | Dense tables become labeled cards/scroll with row actions retained; no permission inference from hidden buttons |
| CMS — ADMIN-CMS-PAGES/EDITOR | Content tree, draft/review status, locale parity, evidence/rights checklist and side-by-side preview | Mobile editing covers essential fields, safe autosave, unsaved-change warning, keyboard block reorder |
| Search — catalog/blog IDs | Search field within existing listing templates; scoped staff search within work queues | Debounced status announcement, filtered empty state, query retained in URL without indexing filter variants |
| CTA/state language — all | One primary action per task region; explain disabled, pending, success and rollback outcomes | Focus visible, errors persistent, reduced motion, text equivalent |

## Required visual and usability gate

Create original high-fidelity or interactive concepts for home, service/course discovery and detail, enrollment, contact, auth, student/client/staff/CMS, mobile navigation and key states in both languages/themes. Use real approved content or clearly labeled neutral structural placeholders; never publish invented business claims. Review with owner, a Bangla language reviewer, accessibility reviewer and realistic mobile devices. Record the chosen direction, rejected alternatives and token/interaction adjustments. A design-tool render alone is **not** owner approval. Current UX/design gate: **PASS WITH OWNER DECISION** for architecture, **BLOCKED** for visual approval.
