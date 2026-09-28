"""Check locale-dictionary script purity and key parity. GitHub-only."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EN_PATH = ROOT / "src/i18n/dictionaries/en.json"
BN_PATH = ROOT / "src/i18n/dictionaries/bn.json"

# Endonyms shown by the language switcher are a narrow, documented
# exception, the same way docs/SPECIFICATION.md treats URLs/identifiers:
# the English page names the target language ("বাংলা"), the Bangla page
# names its target ("English"). Nothing else may cross scripts.
EXEMPT_PATHS = {"language.switchTo"}

BENGALI_RANGE = re.compile(r"[ঀ-৿]")
LATIN_LETTER = re.compile(r"[A-Za-z]")

errors = []


def walk(node, path, on_string):
    if isinstance(node, dict):
        for key, value in node.items():
            walk(value, f"{path}.{key}" if path else key, on_string)
    elif isinstance(node, str):
        on_string(path, node)


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


en = load(EN_PATH)
bn = load(BN_PATH)


def check_en(path, value):
    if path in EXEMPT_PATHS:
        return
    if BENGALI_RANGE.search(value):
        errors.append(f"en.json {path}: contains Bengali script: {value!r}")


def check_bn(path, value):
    if path in EXEMPT_PATHS:
        return
    if LATIN_LETTER.search(value):
        errors.append(f"bn.json {path}: contains Latin letters: {value!r}")


walk(en, "", check_en)
walk(bn, "", check_bn)

en_paths = set()
walk(en, "", lambda path, _value: en_paths.add(path))
bn_paths = set()
walk(bn, "", lambda path, _value: bn_paths.add(path))

if en_paths != bn_paths:
    only_en = sorted(en_paths - bn_paths)
    only_bn = sorted(bn_paths - en_paths)
    if only_en:
        errors.append(f"keys only in en.json: {only_en}")
    if only_bn:
        errors.append(f"keys only in bn.json: {only_bn}")

if errors:
    print("Locale purity check FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(f"Locale purity check passed: {len(en_paths)} keys, en/bn script-pure and parity-matched")
