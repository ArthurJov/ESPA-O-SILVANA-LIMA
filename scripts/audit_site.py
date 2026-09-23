import json
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4187"
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
VIEWPORTS = [(390, 664), (1366, 768)]


def audit_page(page, route, viewport, findings):
    width, height = viewport
    page.set_viewport_size({"width": width, "height": height})
    response = page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(150)

    if not response or response.status != 200:
        findings.append(f"{route} returned HTTP {response.status if response else 'no response'}")

    dimensions = page.evaluate(
        """() => ({
          viewport: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth
        })"""
    )
    if dimensions["documentWidth"] > dimensions["viewport"] + 1:
        findings.append(f"{route} {width}x{height}: document overflow {dimensions}")
    if dimensions["bodyWidth"] > dimensions["viewport"] + 1:
        findings.append(f"{route} {width}x{height}: body overflow {dimensions}")

    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(150)
    broken_images = page.locator("img").evaluate_all(
        """images => images
          .filter(image => image.getAttribute('src') && (!image.complete || image.naturalWidth === 0))
          .map(image => image.getAttribute('src'))"""
    )
    if broken_images:
        findings.append(f"{route} {width}x{height}: broken images {broken_images}")


def main():
    findings = []
    console_errors = []
    request_errors = []
    artifact_dir = Path("artifacts/responsive")

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        )
        page = browser.new_page()
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: console_errors.append(str(error)))
        page.on("requestfailed", lambda request: request_errors.append(f"{request.url}: {request.failure}"))

        for route in ROUTES:
            for viewport in VIEWPORTS:
                audit_page(page, route, viewport, findings)

        page.set_viewport_size({"width": 390, "height": 664})
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=20000)
        menu = page.locator(".hamburger")
        menu.click()
        menu_state = page.evaluate(
            """() => ({
              expanded: document.querySelector('.hamburger')?.getAttribute('aria-expanded'),
              open: document.querySelector('.nav-mobile')?.classList.contains('is-open'),
              focusedInside: document.querySelector('.nav-mobile')?.contains(document.activeElement)
            })"""
        )
        if menu_state != {"expanded": "true", "open": True, "focusedInside": True}:
            findings.append(f"mobile menu open state invalid: {menu_state}")
        page.keyboard.press("Escape")
        page.wait_for_timeout(100)
        closed_state = page.evaluate(
            """() => ({
              expanded: document.querySelector('.hamburger')?.getAttribute('aria-expanded'),
              open: document.querySelector('.nav-mobile')?.classList.contains('is-open'),
              focusedTrigger: document.activeElement === document.querySelector('.hamburger')
            })"""
        )
        if closed_state != {"expanded": "false", "open": False, "focusedTrigger": True}:
            findings.append(f"mobile menu close state invalid: {closed_state}")

        page.goto(f"{BASE_URL}/resultados/", wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(150)
        if page.locator(".result-card").count() != 6:
            findings.append(f"results card count invalid: {page.locator('.result-card').count()}")
        if page.locator(".results-empty").count():
            findings.append("results empty state is visible despite published records")
        first_gallery_item = page.locator(".gallery-item").first
        first_gallery_item.click()
        lightbox_state = page.evaluate(
            """() => ({
              active: document.querySelector('#lightbox')?.classList.contains('is-active'),
              hidden: document.querySelector('#lightbox')?.getAttribute('aria-hidden'),
              loaded: Boolean(document.querySelector('.lightbox__img')?.getAttribute('src'))
            })"""
        )
        if lightbox_state != {"active": True, "hidden": "false", "loaded": True}:
            findings.append(f"lightbox open state invalid: {lightbox_state}")
        page.keyboard.press("Escape")
        if page.locator("#lightbox.is-active").count():
            findings.append("lightbox did not close with Escape")
        page.screenshot(path=artifact_dir / "results-390x664.png", full_page=True)

        page.set_viewport_size({"width": 1366, "height": 768})
        page.goto(f"{BASE_URL}/resultados/", wait_until="networkidle", timeout=20000)
        page.screenshot(path=artifact_dir / "results-1366x768.png", full_page=False)
        page.locator(".results-gallery-section").scroll_into_view_if_needed()
        page.wait_for_timeout(450)
        page.screenshot(path=artifact_dir / "results-gallery-1366x768.png", full_page=False)

        page.set_viewport_size({"width": 390, "height": 664})
        page.goto(f"{BASE_URL}/avaliacao/", wait_until="networkidle", timeout=20000)
        page.locator('#contact-form button[type="submit"]').click()
        form_state = page.evaluate(
            """() => ({
              invalid: document.querySelectorAll('[aria-invalid="true"]').length,
              alerts: document.querySelectorAll('[role="alert"]').length,
              focused: document.activeElement?.id
            })"""
        )
        if form_state["invalid"] < 1 or form_state["alerts"] < 1 or form_state["focused"] != "form-name":
            findings.append(f"form validation state invalid: {form_state}")

        page.goto(f"{BASE_URL}/contato/", wait_until="networkidle", timeout=20000)
        accordion = page.locator(".accordion__header").first
        accordion.focus()
        page.keyboard.press("Enter")
        page.wait_for_timeout(450)
        accordion_state = page.evaluate(
            """() => {
              const button = document.querySelector('.accordion__header');
              const panel = document.getElementById(button?.getAttribute('aria-controls'));
              return {
                expanded: button?.getAttribute('aria-expanded'),
                labelled: panel?.getAttribute('aria-labelledby') === button?.id,
                visible: panel?.getBoundingClientRect().height > 0
              };
            }"""
        )
        if accordion_state != {"expanded": "true", "labelled": True, "visible": True}:
            findings.append(f"accordion state invalid: {accordion_state}")

        browser.close()

    print(json.dumps({
        "findings": findings,
        "consoleErrors": sorted(set(console_errors)),
        "requestErrors": sorted(set(request_errors)),
    }, ensure_ascii=False, indent=2))
    raise SystemExit(1 if findings or console_errors or request_errors else 0)


if __name__ == "__main__":
    main()
