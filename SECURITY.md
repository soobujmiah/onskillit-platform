# Security and disclosure

This is a public documentation repository. Do not commit credentials, tokens, private customer/student data, payment records, production database exports, unpublished business plans, or assets without publication rights. Use GitHub environment secrets only after deployment architecture is approved. Treat public pull requests as untrusted and never grant their workflows production credentials.

For a suspected vulnerability in the current live website, preserve minimal evidence and report privately to the site owner. Do not publish exploit details, access private CMS areas without authorization, or infer a compromise from unrelated indexed content alone. The current public audit is in `docs/SITE-AUDIT.md`.

Before implementation, define a private security reporting channel, retention policy, incident owner, access review cadence and release gate in an accepted ADR. This file is a public safety baseline, not a claim that those operations already exist.
