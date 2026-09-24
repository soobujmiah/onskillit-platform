# ADR 0002 — Brand, language, theme and responsive direction

Status: **accepted direction**, detailed tokens/prototypes pending review, 2026-09-24.

Context/problem: OnSkillIT should feel related to the founder's portfolio while having a distinct product identity and working across public, learning and staff tasks.

Options: copy portfolio UI/motion; use unrelated design; inherit its color grading while defining OnSkillIT motion, components and task flows. Decision: inherit portfolio color grading only. Build independent “guided progress” motion/interaction system. Provide dark/light toggle throughout. Launch complete Bangla and English versions with two-way authored-script purity. Make full responsiveness a release gate across 320–1920+ CSS px and major task flows. Founding partner wants the site to be a marvel of the team's work, evaluated with original visual direction, accessibility, performance and functional quality.

Rationale: brand continuity without copying. Trade-offs: two languages and two themes multiply content/design/QA effort; motion must remain restrained for accessibility and operations. Consequences: visual prototype, token/contrast review, locale-purity CI, human Bangla review, both-theme responsive matrix and partner aesthetic approval before development. Exact colors beyond the portfolio anchor, typography, motion timings and components remain proposed.
