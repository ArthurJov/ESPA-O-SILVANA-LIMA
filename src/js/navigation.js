/**
 * Shared header state and accessible mobile navigation.
 */
export function initNavigation() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const navMobile = document.querySelector('.nav-mobile');
  const html = document.documentElement;
  const body = document.body;
  const desktopQuery = window.matchMedia('(min-width: 1200px)');
  let savedScrollY = 0;

  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger && navMobile) {
    const controlledId = navMobile.id || 'nav-mobile';
    navMobile.id = controlledId;
    hamburger.type = 'button';
    hamburger.setAttribute('aria-controls', controlledId);

    const pageRegions = [...document.querySelectorAll('main, footer, .wa-float')];
    const getFocusableItems = () => [...navMobile.querySelectorAll('a[href], button:not([disabled])')];

    function lockPage() {
      savedScrollY = window.scrollY;
      html.classList.add('scroll-locked');
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.width = '100%';
      pageRegions.forEach((region) => { region.inert = true; });
    }

    function unlockPage() {
      html.classList.remove('scroll-locked');
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      pageRegions.forEach((region) => { region.inert = false; });
      window.scrollTo(0, savedScrollY);
    }

    function setMenu(open, restoreFocus = true) {
      const wasOpen = navMobile.classList.contains('is-open');
      if (open === wasOpen) return;

      hamburger.classList.toggle('is-active', open);
      header.classList.toggle('menu-open', open);
      navMobile.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      navMobile.setAttribute('aria-hidden', String(!open));

      if (open) {
        lockPage();
        window.requestAnimationFrame(() => getFocusableItems()[0]?.focus());
      } else {
        unlockPage();
        if (restoreFocus) hamburger.focus();
      }
    }

    hamburger.addEventListener('click', () => {
      setMenu(!navMobile.classList.contains('is-open'));
    });

    navMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false, false));
    });

    document.addEventListener('keydown', (event) => {
      if (!navMobile.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusableItems = getFocusableItems();
      if (!focusableItems.length) return;
      const first = focusableItems[0];
      const last = focusableItems[focusableItems.length - 1];

      if (!navMobile.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const handleDesktopChange = (event) => {
      if (event.matches) setMenu(false, false);
    };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleDesktopChange);
    else desktopQuery.addListener(handleDesktopChange);
  }

  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link, .nav-mobile__link').forEach((link) => {
    const linkPath = link.getAttribute('href');
    const isCurrent = linkPath === '/' ? currentPath === '/' : linkPath && currentPath.includes(linkPath);
    link.classList.toggle('active', Boolean(isCurrent));
    if (isCurrent) link.setAttribute('aria-current', 'page');
  });
}
