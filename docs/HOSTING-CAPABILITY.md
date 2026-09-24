# Current domain-host capability assessment

Read-only public evidence collected 2026-09-24. This is an external-surface observation, not an authenticated hosting-panel inspection. Production is not modified. The founding partner intends to use the current domain hosting when ready, but has not supplied provider/plan or panel access.

| Capability | Evidence | Finding |
|---|---|---|
| Public server/runtime | HTTPS HEAD `/`: `server: LiteSpeed`, `x-powered-by: PHP/8.2.33`, WordPress JSON link | **VERIFIED public response only**; it does not prove shell, package or app deployment capability |
| TLS | HTTPS responds over HTTP/2 | **VERIFIED public endpoint**; certificate ownership, renewal/control and proxy topology UNKNOWN |
| DNS | Google Public DNS read-only response: NS `dns1/2.registrar-servers.com`, A `162.213.255.28`, `www` CNAME to apex | **VERIFIED public DNS snapshot**; registrar and DNS-control credentials UNKNOWN |
| Email routing | Public MX `mx1/2/3-hosting.jellyfish.systems` | **VERIFIED MX snapshot**; mailbox/SMTP/API, SPF/DKIM/DMARC and transactional capacity UNKNOWN |
| WordPress/API | Root advertises `/wp-json/`; public GET `/wp-json/` and `/wp-json/wp/v2/pages` returned 404 | **OBSERVED**; internal CMS state/cause UNKNOWN |
| Public sitemap/robots | GET `robots.txt`, `wp-sitemap.xml`, `sitemap_index.xml`, `sitemap.xml` returned 404 | **OBSERVED**; CDN/proxy configuration UNKNOWN |
| Network operator / hosting provider | [ARIN RDAP range](https://rdap.arin.net/registry/ip/162.213.255.28) `NCNET-4` and [registrant](https://rdap.arin.net/registry/entity/NAMEC-4) identify Namecheap, Inc. for the public IP block | **VERIFIED network registrant**; Namecheap hosting is plausible but account provider/plan and deploy rights remain **UNKNOWN** |
| Node/Python/long-lived worker/process manager | No authenticated capability report | **UNKNOWN** |
| PHP extensions, composer, CLI and deploy hooks | Header only | **UNKNOWN** |
| Database engine/version/access and migrations | No panel evidence | **UNKNOWN** |
| Filesystem persistence, storage quota, object storage | No panel evidence | **UNKNOWN** |
| Cron, queue, outbound network, callback ingress | No panel/firewall evidence | **UNKNOWN** |
| Secrets/environment management | No panel evidence | **UNKNOWN** |
| Backup/restore and staging | No provider evidence | **UNKNOWN** |
| CPU/RAM/IO limits and budget | No plan evidence | **UNKNOWN** |
| GitHub CI/CD deploy mechanism | No deploy credentials or workflow evidence | **UNKNOWN** |

Public evidence sources: `https://www.onskillit.com/` response headers; `https://dns.google/resolve?name=onskillit.com&type=NS`, corresponding `A`/`MX` and `www` `CNAME` DNS responses; sampled public routes above. These snapshots can change. Public IP and DNS identify a network operator, not the OnSkillIT account plan or deployment capabilities.

## Namecheap product documentation cross-check

The [Namecheap shared-hosting guide](https://www.namecheap.com/support/knowledgebase/article.aspx/177/27/shared-hosting-getting-started/) describes cPanel, file management, SSL, email, cron, backups and some runtime tools in its **product family**. The [Node.js App guide](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/) describes selectable Node versions, app start/restart, startup file and environment-variable UI. The [software-version page](https://www.namecheap.com/support/knowledgebase/article.aspx/129/22/what-version-of-the-software-is-used-on-your-servers/) lists PostgreSQL 10.23 only on specified older and Stellar Plus/Business plans; this is a product listing, **not** proof that OnSkillIT's account has PostgreSQL or that this version is suitable for a new production system. The [cron policy](https://www.namecheap.com/support/knowledgebase/article.aspx/9453/29/how-to-run-scripts-via-cron-jobs/) says shared servers prohibit intervals under five minutes or more than five simultaneous jobs. [Namecheap resource-limit guidance](https://www.namecheap.com/support/knowledgebase/article.aspx/1127/103/a-handy-guide-to-resource-limits-or-what-is-lve/) says shared accounts have CPU/RAM/disk-access limits, but OnSkillIT quotas are unknown. The [backup/restore guide](https://www.namecheap.com/support/knowledgebase/article/9365/2199/how-to-create-and-restore-backups-in-cpanel/) says self-service full-account AutoBackup restore is available on Stellar Plus/Business, while Stellar/Reseller full restore may require support; OnSkillIT plan is unknown. These pages show **possible** features and constraints; none identifies OnSkillIT's purchased plan, quotas, queue-worker reliability or deploy rights.

A [Namecheap Next.js cPanel guide](https://www.namecheap.com/support/knowledgebase/article.aspx/10686/29/how-to-deploy-reactjs-vitejs-react-native-and-nextjs-applications-in-cpanel/) exists, but a sample deployment recipe does not prove that a CMS/LMS/TMS/CRM platform with workers and database transactions will meet operational targets on this account. GitHub-built artifacts can be uploaded to compatible hosting, subject to verified runtime and deployment mechanism. No local builds or tests are permitted by owner direction.

## Compatibility decision

The proposed portable modular monolith is **hosting-independent at design level** because base URL, database, media, queue, mail and secrets are external configuration. Direct deployment of a Next.js/Node + PostgreSQL + worker candidate to the current host is **UNKNOWN / conditionally compatible**, not verified. The published PostgreSQL listing is old and plan-dependent; a current supported relational database or separate managed database may be necessary. PHP 8.2/LiteSpeed alone does not prove Laravel suitability either. A static-only public frontend would not satisfy CMS/LMS/TMS/CRM/payment operations. Do not choose a stack to match the observed header without panel evidence.

## Read-only capability request

**OWNER ACTION REQUIRED / EXTERNAL DEPENDENCY:** obtain provider and plan name, panel screenshots or export (redacted), runtime versions/extensions, shell/container access, persistent process/worker and cron policy, databases and versions, storage/object-storage support, outbound/inbound network and IP allowlisting, SSL/cert control, SMTP/API mail, backup restore, staging, DNS rights, deployment hooks, CPU/RAM/storage/IO limits, renewal cost and support SLA. No passwords, tokens or customer data should enter this public repository. The hosting choice and production topology ADR remain pending until these are checked against the selected stack.
