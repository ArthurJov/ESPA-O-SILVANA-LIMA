import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.description = ""
        self.canonical = ""
        self.h1_count = 0
        self.images_without_alt = []
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "meta" and attributes.get("name") == "description":
            self.description = attributes.get("content", "")
        if tag == "link" and attributes.get("rel") == "canonical":
            self.canonical = attributes.get("href", "")
        if tag == "h1":
            self.h1_count += 1
        if tag == "img":
            if "alt" not in attributes:
                self.images_without_alt.append(attributes.get("src", ""))
            if attributes.get("src"):
                self.references.append(attributes["src"])
        for attribute in ("href", "src"):
            value = attributes.get(attribute, "")
            if value and not value.startswith(("#", "data:", "mailto:", "tel:", "http:")):
                self.references.append(value)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data.strip()


def resolve_local_reference(reference):
    parsed = urlparse(reference)
    path = parsed.path
    if not path.startswith("/"):
        return None
    public_candidate = PUBLIC / path.lstrip("/")
    if public_candidate.is_file():
        return public_candidate
    root_candidate = ROOT / path.lstrip("/")
    if root_candidate.is_file():
        return root_candidate
    if path.endswith("/"):
        page_candidate = ROOT / path.lstrip("/") / "index.html"
        if page_candidate.is_file():
            return page_candidate
    return None


def main():
    findings = []
    pages = sorted(path for path in ROOT.rglob("*.html") if "dist" not in path.parts)

    for page_path in pages:
        parser = PageParser()
        parser.feed(page_path.read_text(encoding="utf-8"))
        label = page_path.relative_to(ROOT).as_posix()
        if not parser.title:
            findings.append(f"{label}: missing title")
        if not parser.description:
            findings.append(f"{label}: missing meta description")
        if not parser.canonical:
            findings.append(f"{label}: missing canonical")
        if parser.h1_count != 1:
            findings.append(f"{label}: expected one h1, found {parser.h1_count}")
        for image in parser.images_without_alt:
            findings.append(f"{label}: image without alt: {image}")
        for reference in parser.references:
            if reference.startswith("/") and resolve_local_reference(reference) is None:
                findings.append(f"{label}: missing local reference: {reference}")

    sitemap = PUBLIC / "sitemap.xml"
    robots = PUBLIC / "robots.txt"
    if not sitemap.is_file():
        findings.append("public/sitemap.xml: missing")
    if not robots.is_file():
        findings.append("public/robots.txt: missing")
    elif "Sitemap: https://espacosilvanalima.com.br/sitemap.xml" not in robots.read_text(encoding="utf-8"):
        findings.append("public/robots.txt: sitemap declaration missing")

    results_source = (ROOT / "src/js/site-content.js").read_text(encoding="utf-8")
    published_results = len(re.findall(r"published:\s*true", results_source))
    composite_images = len(re.findall(r"compositeImage:\s*\"/images/Antes e Depois/", results_source))
    if published_results != 6 or composite_images != 6:
        findings.append(f"site-content results mismatch: published={published_results}, composite={composite_images}")

    print("Static audit:")
    print(f"- pages checked: {len(pages)}")
    print(f"- published result records: {published_results}")
    if findings:
        print("- findings:")
        print("\n".join(f"  - {finding}" for finding in findings))
        return 1
    print("- findings: none")
    return 0


if __name__ == "__main__":
    sys.exit(main())
