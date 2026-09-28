"""Check the canonical phase/page registers. Run only in GitHub Actions per owner policy."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
read = lambda name: (ROOT / name).read_text(encoding="utf-8")
phases = read("docs/PHASES.md")
pages = read("docs/PAGES.md")
sitemap = read("docs/SITEMAP.md")
trace = read("docs/TRACEABILITY.md")
roadmap = read("docs/ROADMAP.md")
errors = []

phase_lines = [line for line in phases.splitlines() if re.match(r"^\| PHASE-\d\d \|", line)]
phase_ids = [line.split("|")[1].strip() for line in phase_lines]
if phase_ids != [f"PHASE-{n:02}" for n in range(16)]:
    errors.append(f"phase register sequence: {phase_ids}")

prefixes = ("PAGE-", "AUTH-", "USER-", "CLIENT-", "ADMIN-", "SYS-", "FUT-")
page_rows = []
for line in pages.splitlines():
    if line.startswith("| ") and line.split("|")[1].strip().startswith(prefixes):
        fields = [part.strip() for part in line.strip("|").split("|")]
        if len(fields) != 16:
            errors.append(f"page column count {len(fields)}: {line[:90]}")
        else:
            page_rows.append(fields)
ids = [row[0] for row in page_rows]
routes = [row[2] for row in page_rows]
if len(ids) != len(set(ids)):
    errors.append("duplicate page ID")
if len(routes) != len(set(routes)):
    errors.append("duplicate route pattern")
for row in page_rows:
    id_, group, phase, state = row[0], row[3], row[13], row[14]
    if phase not in phase_ids:
        errors.append(f"{id_}: unknown phase {phase}")
    if group == "Future" and phase != "PHASE-15":
        errors.append(f"{id_}: future phase mismatch")
    if group != "Future" and phase in ("PHASE-00", "PHASE-15"):
        errors.append(f"{id_}: invalid V1 phase")
    if state not in ("NOT STARTED", "IN PROGRESS", "CI-VERIFIED", "RELEASED"):
        errors.append(f"{id_}: unexpected page state {state}")
    if id_ not in trace:
        errors.append(f"{id_}: missing traceability")
    if group == "Public" and id_ not in sitemap:
        errors.append(f"{id_}: missing public sitemap")
    if group in ("Authentication", "Student", "Client", "Admin") and row[9] != "noindex":
        errors.append(f"{id_}: private SEO conflict")
    if group != "Future" and id_ not in phases:
        errors.append(f"{id_}: absent from owning phase detail")

from collections import Counter
counts = Counter(row[3] for row in page_rows)
expected = {"Public": 19, "Authentication": 4, "Student": 13, "Client": 6, "Admin": 29, "System": 3, "Future": 5}
if dict(counts) != expected:
    errors.append(f"page category counts: {dict(counts)}")
if sum(counts.values()) - counts["Future"] != 74:
    errors.append("V1 count mismatch")
if sum(row[3] == "Public" and row[10] == "dynamic" for row in page_rows) != 6:
    errors.append("dynamic public count mismatch")
for phase in phase_ids:
    if phase not in roadmap:
        errors.append(f"{phase}: missing roadmap reference")
for source in ("docs/PHASES.md", "docs/PAGES.md", "docs/SITEMAP.md", "docs/ROADMAP.md", "docs/TRACEABILITY.md"):
    body = read(source)
    for target in re.findall(r"\]\(([^)]+\.md)(?:#[^)]*)?\)", body):
        if target.startswith("http"):
            continue
        if not ((ROOT / source).parent / target).exists():
            errors.append(f"{source}: broken document link {target}")

# Phase 0 evidence coverage and permitted readiness dispositions.
required_docs = (
    "OFFERINGS.md", "HOSTING-CAPABILITY.md", "LEGAL-IDENTITY.md",
    "LEGACY-URL-DISPOSITION.md", "UX-CONCEPT-REVIEW.md",
    "DOMAIN-CONSISTENCY.md", "DATA-MODEL.md", "API-CONTRACT.md",
    "PAYMENTS.md", "SECURITY-ARCHITECTURE.md", "SEO-CONTENT.md",
)
for name in required_docs:
    if not (ROOT / "docs" / name).is_file():
        errors.append(f"missing Phase 0 document: {name}")
readiness = read("docs/READINESS.md")
section = readiness.split("## Gate matrix", 1)[-1].split("## Completed evidence", 1)[0]
allowed = {"PASS", "PASS WITH OWNER DECISION", "EXTERNAL DEPENDENCY", "UNKNOWN NON-BLOCKING", "BLOCKED"}
gate_rows = [line for line in section.splitlines() if line.startswith("| ")][2:]
if len(gate_rows) < 25:
    errors.append("Phase 0 gate matrix has too few rows")
for line in gate_rows:
    fields = [part.strip() for part in line.strip("|").split("|")]
    if len(fields) != 3 or fields[1] not in allowed:
        errors.append(f"invalid Phase 0 gate row/status: {line[:100]}")
if "accepted by founding partner" not in read("docs/decisions/0005-phase-and-page-registers.md"):
    errors.append("ADR 0005 acceptance state missing")
if errors:
    print("Documentation architecture check FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)
print(f"Documentation architecture check passed: {len(phase_ids)} phases, 74 V1 templates, 5 future templates, 6 dynamic public templates")
