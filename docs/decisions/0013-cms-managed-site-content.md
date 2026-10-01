# ADR 0013 — Every visible public text and image is CMS-managed

Status: accepted for source implementation on 2026-10-01 following the founding partner's instruction that every visible text, media or other element on the website must be manageable through the CMS.

## Context

Page bodies, navigation labels, SEO fields and (for profiles) photos were already CMS-managed. Review found visible content still fixed in code: the contact block (email, phone, WhatsApp, address, Facebook, YouTube), the brand name and footer line, about 100 UI labels and messages, the 404 text, and images in hero and text sections, which could be attached but were never displayed.

## Decision

1. **Site settings** (`cms_setting`, edited by `settings.site`): brand names, footer text per language (with a year placeholder), logo (an approved public image with alt text), contact email, phone, WhatsApp number, address per language, and Facebook and YouTube links. An empty value restores the built-in default; the owner-confirmed contact values stay only as that fallback. Values are validated (https-only links, script purity per language) and invalid stored values are ignored at render.
2. **Visible text overrides** (`cms_text`, per language and key): every string in the `brand`, `skipLink`, `theme`, `language`, `public` and `identity` dictionary groups, which covers public pages, the form, navigation fallbacks, the 404 page and the account pages. Overrides use the same script-purity rule as other prose (the language switcher label may use either script) and fall back to the built-in text.
3. **Images**: any section type with an approved public image now renders it with its bilingual alt text; the logo renders in the header.
4. **Governance**: these direct edits follow the existing site-settings model. They need `settings.site`, are validated, and append an audit event, but they do **not** go through page revision, review and publish. Page content keeps the full revision workflow (ADR 0012 for its mode). The owner may later require review for site text.

## Explicit boundaries

Staff-only screens (CMS, users, roles, audit, inquiries) keep built-in text because they are not the public website. The client-side error boundary (`error.tsx`) cannot read the database and keeps built-in wording. Email subjects and bodies stay in code. The policy texts are CMS pages, not strings, and stay in the page workflow. This ADR publishes nothing and changes no content by itself; no override or setting exists until staff create one.
