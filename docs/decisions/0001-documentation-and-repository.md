# ADR 0001 — Documentation phase and public GitHub repository

Status: **accepted by founding partner**, 2026-09-24.

Context/problem: OnSkillIT is a new serious platform; the existing site is a research source with demo/unrelated content. Future agents need a shared source of truth. The owner requires all builds/tests on GitHub and no local builds/tests.

Options: start implementation immediately; keep private chat notes; create a public documentation repository before implementation. Decision: use public `soobujmiah/onskillit-platform` for product/architecture documentation first. Do not start application code or production changes until documentation review and owner approval. CI/build/test evidence will be GitHub-based when implementation begins.

Rationale: reviewable history, agent continuity and clear evidence boundaries. Trade-offs: public documentation cannot include private business, student/client or security details; sensitive operational procedures may need private storage. Consequences: no license is assumed; publication rights and secrets must be checked before every commit; unfinished decisions remain marked. This ADR authorizes the repository/documentation workflow, not a final architecture or deployment.
