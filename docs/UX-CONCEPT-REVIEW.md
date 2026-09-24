# Original OnSkillIT UX and brand adaptation review

Status: **UX ARCHITECTURE APPROVED; VISUAL PIXEL-LEVEL DESIGN REQUIRES IMPLEMENTATION-TIME VALIDATION**. Reviewed 2026-09-24. This is Phase 0 design work, not frontend implementation. Superdesign CLI was available, but its authorization session expired before a canvas project/draft could be created; no AI visual is claimed as reviewed. The concepts below are original specifications for later visual prototyping and owner review. The founding partner approved use of portfolio **color grading only**, with independent motion and interaction.

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

## Implementation-time visual and usability validation

Create original high-fidelity or interactive concepts for home, service/course discovery and detail, enrollment, contact, auth, student/client/staff/CMS, mobile navigation and key states in both languages/themes. Use real approved content or clearly labeled neutral structural placeholders; never publish invented business claims. Review with owner, a Bangla language reviewer, accessibility reviewer and realistic mobile devices. Record the chosen direction, rejected alternatives and token/interaction adjustments. A design-tool render alone is **not** owner approval. Current UX/design architecture gate: **PASS** under the founding partner’s final Phase 0 delegation. Visual validation is a PHASE-02 and later page-implementation acceptance condition, not a Phase 0 architecture blocker.

## Page-pattern blueprint: hierarchy and task

The canonical IDs, routes and implementation phases remain in [PAGES.md](PAGES.md). These are layout patterns for those IDs, not new pages. All patterns share a skip link, visible current location, locale/theme controls where relevant, one primary task per region and a footer/help route.

| Pattern / canonical page family | Layout and content hierarchy | Primary action and navigation | Small-screen behavior | Data/permission boundary |
|---|---|---|---|---|
| Home, About (`PAGE-HOME`, `PAGE-ABOUT`) | Verified promise → paths for learning/services → approved proof → process → contact; About adds organization facts and team | Choose course/service; primary public nav | One-column editorial order; no decorative motion before value statement | Only published locale-complete CMS records |
| Services and detail (`PAGE-SERVICES`, `PAGE-SERVICE-DETAIL`) | Search/filter/result count → service cards; detail: outcome, audience, scope, process, proof, FAQ | Inquiry links to Contact with service context | Filter drawer and persistent result summary; detail CTA follows scope | Published Service, category, media, SEO |
| Courses, detail and Programs (`PAGE-COURSES`, `PAGE-COURSE-DETAIL`, `PAGE-PROGRAMS`) | Discovery by level/format → course facts; detail: outcome, prerequisites, instructor, modules, schedule, fee and availability; programs group related study paths | Enroll or request information; show pending capacity/payment clearly | Collapsible syllabus, action after eligibility; no CTA covering lesson text | Published edition/program, batch, capacity and price only |
| Portfolio/project (`PAGE-PORTFOLIO`, `PAGE-PROJECT-DETAIL`) | Filtered work → client-approved project goal, role, work, outcome and rights-cleared media | Contact for similar work | Stacked imagery and captions | Rights/publication approval; no invented clients/results |
| Blog/article (`PAGE-BLOG`, `PAGE-ARTICLE`) | Topic/search and dated list → article title, byline, reading body, sources, related links | Read related item or inquire | Narrow prose measure, accessible table/media overflow | Published revision, author rights, metadata |
| Contact (`PAGE-CONTACT`) | Contact choices → concise inquiry form → privacy hint and response expectation → verified contact facts | Submit inquiry | Single column, labels above controls, keyboard-friendly validation | Anti-spam, consent and CRM intake; generic safe acknowledgement |
| Auth (`AUTH-*`) | Task heading → email or mobile identifier → password or recovery → support path | Sign in/register/reset | Large controls, password reveal, no OTP prompt | Generic reset response; assisted phone recovery |
| Student dashboard/course/learning/progress (`USER-*`) | Next action → current enrollment/lesson → progress text/chart → history | Resume learning or attend session | Current task first, media and syllabus stack, offline/error feedback | Student-owned enrollment and released content |
| Student assessment/result/certificate/training/billing/notifications (`USER-*`) | Due work or upcoming session → status/details → history/receipts | Submit/attend/download/pay when eligible | Time/status as text, accessible table cards | Release/eligibility rules, immutable invoice facts |
| Client dashboard/projects/detail/requests/billing/profile (`CLIENT-*`) | Current project/request status → next staff/client action → evidence/documents → financial facts | Request service, respond or pay | Status-first cards, documents in scannable rows | Account-scoped projection; private staff notes excluded |
| Admin dashboard/CMS/users (`ADMIN-*`) | Authorized work queue → filters/count → record table/detail → audit context | Review, publish, assign or save | Labeled rows/card alternative; essential CMS fields editable | Permission and scope checked for data and action |
| Admin LMS/TMS/CRM/payments/analytics/settings (`ADMIN-*`) | Domain-specific queue → status/filter → record detail → history/exception handling | Manage lesson/batch/lead, reconcile, configure | Summary first, complex table scroll with fixed identity/action | Least-privilege financial/admin actions; immutable history |

## Universal interaction contract

**Navigation:** public header exposes Home, Services, Courses, Programs, Work, Insights and Contact only where published. Portal sidebar/bottom or menu groups task routes; staff navigation exposes only authorized groups. Mobile menu is an accessible dialog with focus return, escape and 44 CSS px target minimum. Breadcrumbs convey hierarchy; search/filter state stays in URL where public and is noindexed as a filtered variant.

**Language:** Bangla pages use authored Bengali script for all prose, labels, validation, status, metadata, alt text and notifications; English pages use authored English with no Bengali characters. Technical identifiers, emails and URLs are separately marked data exceptions. No fallback prose crosses scripts; missing translation blocks publication of the locale. Locale change preserves the semantic record if translated, otherwise goes to the locale catalog with an explanation. Bangla font metrics and line breaks are tested independently.

**Theme:** semantic surfaces, text, borders and status colors support light/dark. Respect system preference until override, persist choice, prevent first-paint flash, preserve focus/contrast in both. Imagery gets theme-safe scrims only when text overlays it.

**States:** loading uses a stable skeleton or status text; empty state explains why and gives a permitted next step; errors keep entered data and give a recovery path; success names the completed action and resulting status. Pending payment/enrollment is never styled as success. Hover is supplemental to visible keyboard focus; active and disabled states have text or icon-plus-text explanations. Status changes announce through an accessible live region. Reduced motion removes entrances and transform feedback while retaining meaning. No scroll hijack, parallax requirement or motion copied from the portfolio.

**Responsive acceptance:** at 320/360/390/768/1024/1440/1920 CSS px, 200%/400% zoom, touch and keyboard, no clipped critical content, hidden action, horizontal page overflow or inaccessible modal. Public discovery retains filters/result count; student learning retains media controls and progress; client and staff tables retain row identity and every action. PHASE-02 validates shared patterns; owning phases validate each page.
