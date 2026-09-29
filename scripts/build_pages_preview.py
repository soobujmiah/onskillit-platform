"""Build the noindex GitHub Pages review site from the Phase 5 editorial copy.

This intentionally does not export the server application or publish policy drafts.
Run in GitHub Actions only, in line with the project's build boundary.
"""

from __future__ import annotations

import html
import json
import os
from pathlib import Path
from shutil import copyfile


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "pages-preview-output"
COPY = json.loads((ROOT / "docs/PHASE-05-CMS-COPY.json").read_text(encoding="utf-8"))
PAGES = {page["page_key"]: page for page in COPY["pages"]}
BASE = "/" + os.environ.get("GITHUB_REPOSITORY", "soobujmiah/onskillit-platform").split("/")[-1] + "/"
SERVICES = ("hospital-clinic", "hotel-booking", "ecommerce", "custom-development", "it-training")


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def path_for(key: str, locale: str) -> str:
    if key == "home":
        return f"{BASE}{locale}/"
    if key in SERVICES:
        return f"{BASE}{locale}/services/{key}/"
    return f"{BASE}{locale}/{key}/"


def label(locale: str, en: str, bn: str) -> str:
    return bn if locale == "bn" else en


def render_page(key: str, locale: str) -> str:
    page = PAGES[key][locale]
    title = esc(page["title"])
    other = "bn" if locale == "en" else "en"
    nav = "".join(
        f'<a href="{esc(path_for(item, locale))}"' + (' aria-current="page"' if item == key else "") + f'>{esc(label(locale, en, bn))}</a>'
        for item, en, bn in (
            ("home", "Home", "হোম"),
            ("about", "About", "পরিচিতি"),
            ("services", "Services", "সেবাসমূহ"),
            ("faq", "FAQ", "প্রশ্নোত্তর"),
            ("contact", "Contact", "যোগাযোগ"),
        )
    )
    sections = []
    for section in page["sections"]:
        action = ""
        if section["type"] == "cta" and section.get("href") == "/services":
            action = f'<a class="public-button" href="{esc(path_for("services", locale))}">{esc(section["heading"])}</a>'
        sections.append(
            f'<section class="public-section public-section-{esc(section["type"])}">'
            f'<h2>{esc(section["heading"])}</h2><p>{esc(section["body"])}</p>{action}</section>'
        )
    if key == "services":
        cards = "".join(
            f'<li class="public-card"><h2>{esc(PAGES[service][locale]["title"])}</h2>'
            f'<p>{esc(PAGES[service][locale]["description"])}</p>'
            f'<a href="{esc(path_for(service, locale))}">{esc(label(locale, "View service", "সেবা দেখুন"))}</a></li>'
            for service in SERVICES
        )
        sections.append(f'<ul class="public-card-grid">{cards}</ul>')
    if key == "contact":
        sections.append(
            '<div class="public-contact-details">'
            '<div><h2>Email</h2><a href="mailto:onskillitbd@gmail.com">onskillitbd@gmail.com</a></div>'
            '<div><h2>WhatsApp</h2><a href="https://wa.me/8801617301184">+8801617301184</a></div>'
            '<div><h2>Address</h2><address>40/1 Kalicharan Shaha Road, Gandaria, Dhaka-1204, Bangladesh</address></div>'
            '<div><h2>Social</h2><a href="https://www.facebook.com/onskillit">Facebook</a><a href="https://www.youtube.com/@onskillit">YouTube</a></div>'
            '</div>'
        )
    content = "".join(sections)
    home = esc(path_for("home", locale))
    switch = esc(path_for(key, other))
    description = esc(page["seoDescription"])
    preview = esc(label(locale, "Phase 5 preview · inquiry form unavailable", "পঞ্চম ধাপের প্রিভিউ · অনুসন্ধান ফর্ম এখন বন্ধ"))
    theme = esc(label(locale, "Toggle theme", "রং পরিবর্তন করুন"))
    language = esc(label(locale, "বাংলা", "English"))
    return f'''<!doctype html>
<html lang="{locale}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="description" content="{description}">
<title>{title} | OnSkillIT preview</title>
<link rel="stylesheet" href="{BASE}assets/tokens.css"><link rel="stylesheet" href="{BASE}assets/preview.css">
<script src="{BASE}assets/preview.js" defer></script></head><body>
<a class="skip-link" href="#content">{esc(label(locale, "Skip to content", "মূল অংশে যান"))}</a>
<div class="preview-banner">{preview}</div>
<header class="preview-header"><a class="site-brand" href="{home}">OnSkillIT</a>
<nav class="site-nav" aria-label="{esc(label(locale, "Main navigation", "প্রধান নেভিগেশন"))}">{nav}</nav>
<div class="preview-controls"><a href="{switch}" lang="{other}" hreflang="{other}">{language}</a><button type="button" id="theme-toggle" aria-label="{theme}">◐</button></div></header>
<main id="content"><article class="public-article"><header class="public-hero"><p class="public-kicker">OnSkillIT</p><h1>{title}</h1>
<p class="public-lead">{esc(page["description"])}</p></header><div class="public-sections">{content}</div></article></main>
<footer class="site-footer"><span>OnSkillIT</span><a href="{esc(path_for("contact", locale))}">{esc(label(locale, "Contact", "যোগাযোগ"))}</a></footer>
</body></html>'''


def main() -> None:
    if COPY["status"] != "editorial_draft" or set(PAGES) != {"home", "about", "services", "contact", "faq", *SERVICES}:
        raise SystemExit("Unexpected Phase 5 editorial copy shape")
    OUT.mkdir(exist_ok=True)
    assets = OUT / "assets"
    assets.mkdir(exist_ok=True)
    copyfile(ROOT / "src/styles/tokens.css", assets / "tokens.css")
    copyfile(ROOT / "scripts/pages-preview.css", assets / "preview.css")
    copyfile(ROOT / "scripts/pages-preview.js", assets / "preview.js")
    (OUT / ".nojekyll").touch()
    (OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    (OUT / "index.html").write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta http-equiv="refresh" content="0; url={BASE}en/"><title>OnSkillIT preview</title></head><body><a href="{BASE}en/">English</a> · <a href="{BASE}bn/">বাংলা</a></body></html>',
        encoding="utf-8",
    )
    for locale in ("en", "bn"):
        for key in PAGES:
            relative = path_for(key, locale).removeprefix(BASE)
            target = OUT / relative / "index.html"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(render_page(key, locale), encoding="utf-8")
    print(f"Generated {2 * len(PAGES)} localized preview pages in {OUT}")


if __name__ == "__main__":
    main()
