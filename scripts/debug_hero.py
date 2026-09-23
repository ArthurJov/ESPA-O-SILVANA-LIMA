from playwright.sync_api import sync_playwright

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    )
    page = browser.new_page(viewport={"width": 1366, "height": 768})
    page.add_init_script("sessionStorage.setItem('silvana-lima-splash', 'seen')")
    page.goto("http://127.0.0.1:4187", wait_until="networkidle")
    page.wait_for_timeout(1400)
    print(page.evaluate("""() => {
        const title = document.querySelector('.hero .section-title');
        const desktop = document.querySelector('.hero-title-desktop');
        const inner = document.querySelector('.title-line-inner');
        const info = (element) => ({
            html: element.innerHTML,
            box: element.getBoundingClientRect().toJSON(),
            display: getComputedStyle(element).display,
            fontSize: getComputedStyle(element).fontSize,
            maxWidth: getComputedStyle(element).maxWidth,
            whiteSpace: getComputedStyle(element).whiteSpace,
            textWrap: getComputedStyle(element).textWrap
        });
        return { title: info(title), inner: info(inner), desktop: info(desktop) };
    }"""))
    browser.close()
