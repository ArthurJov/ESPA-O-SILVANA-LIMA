import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:4187")
ROUTES = [
    "/",
    "/sobre/",
    "/procedimentos/",
    "/procedimentos/reducao-abdominal-360/",
    "/procedimentos/diastase/",
    "/procedimentos/harmonizacao-abdominal/",
    "/procedimentos/massagens-e-drenagem/",
    "/procedimentos/limpeza-de-pele/",
    "/resultados/",
    "/avaliacao/",
    "/mentoria/",
    "/contato/",
    "/politica-de-privacidade/",
]
SITE_VIEWPORTS = [
    (320, 640),
    (768, 1024),
    (1024, 640),
    (1179, 768),
    (1180, 768),
    (1366, 768),
]
HOME_VIEWPORTS = [
    (360, 640),
    (375, 667),
    (390, 664),
    (667, 375),
    (1024, 600),
    (1100, 700),
    (1366, 768),
    (1920, 1080),
]


def visible_box(page, selector):
    locator = page.locator(selector).first
    if not locator.count() or not locator.is_visible():
        return None
    return locator.bounding_box()


def intersects(first, second):
    if not first or not second:
        return False
    return not (
        first["x"] + first["width"] <= second["x"]
        or second["x"] + second["width"] <= first["x"]
        or first["y"] + first["height"] <= second["y"]
        or second["y"] + second["height"] <= first["y"]
    )


def inspect_layout(page, route, width, height):
    issues = []
    page.set_viewport_size({"width": width, "height": height})
    page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(120)

    dimensions = page.evaluate(
        """() => ({
            viewport: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth
        })"""
    )
    if dimensions["documentWidth"] > dimensions["viewport"] + 1:
        issues.append(f"overflow document={dimensions['documentWidth']} viewport={dimensions['viewport']}")
    if dimensions["bodyWidth"] > dimensions["viewport"] + 1:
        issues.append(f"overflow body={dimensions['bodyWidth']} viewport={dimensions['viewport']}")

    logo = visible_box(page, ".header .logo")
    desktop_nav = visible_box(page, ".nav-desktop")
    header_action = visible_box(page, ".header__actions, .header__inner > .btn")
    hamburger = visible_box(page, ".hamburger")
    header = visible_box(page, ".header")
    heading = visible_box(page, "main h1")

    if desktop_nav and hamburger:
        issues.append("desktop navigation and hamburger visible together")
    for name, first, second in [
        ("logo/nav", logo, desktop_nav),
        ("logo/action", logo, header_action),
        ("nav/action", desktop_nav, header_action),
        ("logo/hamburger", logo, hamburger),
    ]:
        if intersects(first, second):
            issues.append(f"header collision: {name}")

    if heading:
        if heading["x"] < -1 or heading["x"] + heading["width"] > width + 1:
            issues.append("h1 outside viewport")
        if header and heading["y"] < header["y"] + header["height"] - 1:
            issues.append("h1 overlaps header")

    if route == "/":
        hero = visible_box(page, ".hero")
        content = visible_box(page, ".hero__content")
        trust = visible_box(page, ".trust-bar")
        whatsapp = visible_box(page, ".wa-float")
        if hero and hero["height"] + 1 < height:
            issues.append(f"hero shorter than viewport: {hero['height']:.1f}px")
        if header and content and content["y"] < header["y"] + header["height"] - 1:
            issues.append("hero content overlaps header")
        if content and content["y"] + content["height"] > height + 1:
            issues.append(f"hero content ends below first viewport at {content['y'] + content['height']:.1f}px")
        if trust and trust["y"] < height - 1:
            issues.append(f"second section starts at {trust['y']:.1f}px")
        for index in range(page.locator(".hero__actions .btn").count()):
            action = page.locator(".hero__actions .btn").nth(index)
            if action.is_visible() and intersects(whatsapp, action.bounding_box()):
                issues.append(f"WhatsApp overlaps hero action {index + 1}")

    return issues


def test_mobile_menu(page):
    page.set_viewport_size({"width": 390, "height": 664})
    page.goto(BASE_URL, wait_until="networkidle", timeout=20000)
    button = page.locator(".hamburger")
    button.click()
    page.wait_for_timeout(420)
    state = page.evaluate(
        """() => ({
            expanded: document.querySelector('.hamburger')?.getAttribute('aria-expanded'),
            menuOpen: document.querySelector('.nav-mobile')?.classList.contains('is-open'),
            activeInMenu: document.querySelector('.nav-mobile')?.contains(document.activeElement),
            triggerFocused: document.activeElement === document.querySelector('.hamburger'),
            bodyPosition: getComputedStyle(document.body).position,
            menuScrollable: document.querySelector('.nav-mobile')?.scrollHeight >= document.querySelector('.nav-mobile')?.clientHeight
        })"""
    )
    issues = [f"mobile menu state invalid: {state}"] if not (
        state["expanded"] == "true"
        and state["menuOpen"]
        and state["activeInMenu"]
        and state["bodyPosition"] == "fixed"
        and state["menuScrollable"]
    ) else []
    page.keyboard.press("Tab")
    if not page.evaluate("() => document.querySelector('.nav-mobile')?.contains(document.activeElement)"):
        issues.append("Tab did not enter the open mobile menu")
    page.keyboard.press("Escape")
    page.wait_for_timeout(80)
    escaped = page.evaluate(
        """() => ({
            expanded: document.querySelector('.hamburger')?.getAttribute('aria-expanded'),
            focused: document.activeElement === document.querySelector('.hamburger'),
            bodyPosition: getComputedStyle(document.body).position
        })"""
    )
    if escaped != {"expanded": "false", "focused": True, "bodyPosition": "static"}:
        issues.append(f"mobile menu escape invalid: {escaped}")
    return issues


def test_interactions(page):
    issues = []
    page.set_viewport_size({"width": 390, "height": 664})
    page.goto(f"{BASE_URL}/avaliacao/", wait_until="networkidle", timeout=20000)
    page.locator('#contact-form button[type="submit"]').click()
    form_state = page.evaluate(
        """() => ({
            focused: document.activeElement?.id,
            invalid: document.querySelectorAll('[aria-invalid="true"]').length,
            alerts: document.querySelectorAll('[role="alert"]').length
        })"""
    )
    if form_state != {"focused": "form-name", "invalid": 3, "alerts": 3}:
        issues.append(f"form validation invalid: {form_state}")

    page.goto(f"{BASE_URL}/contato/", wait_until="networkidle", timeout=20000)
    accordion = page.locator('.accordion__header').first
    accordion.focus()
    page.keyboard.press("Enter")
    page.wait_for_timeout(420)
    accordion_state = page.evaluate(
        """() => {
            const button = document.querySelector('.accordion__header');
            const panel = document.getElementById(button?.getAttribute('aria-controls'));
            return {
                expanded: button?.getAttribute('aria-expanded'),
                labelled: panel?.getAttribute('aria-labelledby') === button?.id,
                visibleHeight: panel?.getBoundingClientRect().height > 0
            };
        }"""
    )
    if accordion_state != {"expanded": "true", "labelled": True, "visibleHeight": True}:
        issues.append(f"accordion keyboard invalid: {accordion_state}")
    return issues


def main():
    output_dir = Path("artifacts/responsive")
    output_dir.mkdir(parents=True, exist_ok=True)
    findings = []
    console_errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        )
        page = browser.new_page()
        page.add_init_script("sessionStorage.setItem('silvana-lima-splash', 'seen')")
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: console_errors.append(str(error)))

        for route in ROUTES:
            for width, height in SITE_VIEWPORTS:
                issues = inspect_layout(page, route, width, height)
                if issues:
                    findings.append({"route": route, "viewport": f"{width}x{height}", "issues": issues})

        for width, height in HOME_VIEWPORTS:
            issues = inspect_layout(page, "/", width, height)
            if issues:
                findings.append({"route": "/", "viewport": f"{width}x{height}", "issues": issues})
            page.wait_for_timeout(1300)
            page.screenshot(path=output_dir / f"home-{width}x{height}.png", full_page=False)

        page.set_viewport_size({"width": 1366, "height": 768})
        page.goto(BASE_URL, wait_until="networkidle", timeout=20000)
        page.locator(".signature-story").scroll_into_view_if_needed()
        page.wait_for_timeout(900)
        page.locator(".signature-story").screenshot(path=output_dir / "signature-contrast-1366.png")
        contrast = page.locator(".signature-story .section-subtitle").evaluate(
            """(element) => {
                const parse = (value) => value.match(/[0-9.]+/g).slice(0, 3).map(Number);
                const luminance = (rgb) => {
                    const values = rgb.map((channel) => {
                        const value = channel / 255;
                        return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
                    });
                    return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
                };
                const foreground = luminance(parse(getComputedStyle(element).color));
                const background = luminance(parse(getComputedStyle(element.closest('.signature-story')).backgroundColor));
                return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
            }"""
        )
        if contrast < 4.5:
            findings.append({"route": "/", "viewport": "1366x768", "issues": [f"signature contrast {contrast:.2f}:1"]})

        for route, name in [("/avaliacao/", "avaliacao"), ("/contato/", "contato")]:
            page.set_viewport_size({"width": 320, "height": 640})
            page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=20000)
            page.screenshot(path=output_dir / f"{name}-320x640.png", full_page=True)

        findings.extend(
            {"route": "/", "viewport": "390x664", "issues": [issue]}
            for issue in test_mobile_menu(page)
        )
        findings.extend(
            {"route": "interaction", "viewport": "390x664", "issues": [issue]}
            for issue in test_interactions(page)
        )
        browser.close()

    print(json.dumps({"findings": findings, "consoleErrors": sorted(set(console_errors))}, ensure_ascii=False, indent=2))
    raise SystemExit(1 if findings or console_errors else 0)


if __name__ == "__main__":
    main()
