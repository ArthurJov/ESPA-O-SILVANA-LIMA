/**
 * Motion system: one restrained vocabulary for entrance, scroll, image reveal
 * and the single storytelling section that benefits from pinning.
 */
export function initAnimations() {
  const splash = document.getElementById('splash-screen');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const splashSeen = Boolean(splash && hasSeenSplash());

  if (splashSeen) dismissSplash(splash);

  if (!hasGsap || reduced) {
    rememberSplash();
    dismissSplash(splash);
    revealWithoutMotion();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  gsap.registerPlugin(ScrollTrigger);
  rememberSplash();
  if (!splashSeen) playSplash(splash, gsap);
  animateHero(gsap);

  document.querySelectorAll('[data-reveal], .gsap-reveal').forEach((element) => {
    gsap.fromTo(element, { autoAlpha: 0, y: isMobile ? 24 : 28 }, {
      autoAlpha: 1,
      y: 0,
      duration: isMobile ? .72 : .8,
      ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: { trigger: element, start: isMobile ? 'top 92%' : 'top 86%', once: true }
    });
  });

  document.querySelectorAll('[data-stagger]').forEach((container) => {
    const items = container.children;
    gsap.fromTo(items, { autoAlpha: 0, y: isMobile ? 18 : 20 }, {
      autoAlpha: 1,
      y: 0,
      duration: isMobile ? .62 : .65,
      stagger: isMobile ? .13 : .1,
      ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: { trigger: container, start: isMobile ? 'top 91%' : 'top 82%', once: true }
    });
  });

  document.querySelectorAll('.hero-internal__img-wrap, .card-procedure__img-wrap').forEach((image) => {
    gsap.fromTo(image, { clipPath: 'inset(0 0 14% 0)' }, {
      clipPath: 'inset(0 0 0% 0)',
      duration: isMobile ? .85 : 1.05,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: { trigger: image, start: isMobile ? 'top 94%' : 'top 88%', once: true }
    });
  });

  document.querySelectorAll('.clip-reveal').forEach((element) => {
    gsap.fromTo(element, { clipPath: 'inset(0 0 100% 0)' }, {
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.1,
      ease: 'power3.inOut',
      immediateRender: false,
      scrollTrigger: { trigger: element, start: 'top 82%', once: true }
    });
  });

  if (!coarsePointer && !isMobile) {
    document.querySelectorAll('.parallax-img').forEach((image) => {
      gsap.to(image, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  const story = document.querySelector('.signature-story');
  const storyVisual = story?.querySelector('.signature-story__visual');
  if (story && storyVisual && window.matchMedia('(min-width: 900px)').matches) {
    gsap.to(storyVisual, { y: 22, ease: 'none', scrollTrigger: { trigger: story, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const progress = document.querySelector('[data-progress]');
  if (progress) {
    gsap.to(progress, { scaleX: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: { trigger: progress.closest('.journey'), start: 'top 70%', end: 'bottom 70%', scrub: true } });
  }
}

function revealWithoutMotion() {
  document.querySelectorAll('.gsap-reveal, [data-reveal], [data-stagger] > *').forEach((element) => {
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.transform = 'none';
  });
}

function animateHero(gsap) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const image = hero.querySelector('.hero__img');
  const eyebrow = hero.querySelector('.eyebrow');
  const title = hero.querySelector('.section-title');
  const copy = hero.querySelector('.section-subtitle');
  const actions = hero.querySelector('.hero__actions');
  const meta = hero.querySelector('.hero__meta');
  const timeline = gsap.timeline({ delay: .15 });
  if (image) timeline.fromTo(image, { scale: 1.12, clipPath: 'inset(0 8% 0 0)' }, { scale: 1.04, clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.out' }, 0);
  if (eyebrow) timeline.fromTo(eyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .55 }, .45);
  if (title) timeline.fromTo(title, { autoAlpha: 0, y: 35 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, .55);
  if (copy) timeline.fromTo(copy, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .65 }, .8);
  if (actions) timeline.fromTo(actions, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .6 }, 1);
  if (meta) timeline.fromTo(meta, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 1.15);
}

function playSplash(splash, gsap) {
  if (!splash) return;
  let timeline;
  const hideSplash = () => {
    timeline?.kill();
    gsap.killTweensOf(splash);
    splash.classList.add('splash-screen--hidden');
    gsap.set(splash, { autoAlpha: 0 });
  };
  const safetyTimer = window.setTimeout(hideSplash, 1250);
  timeline = gsap.timeline({ onComplete: () => { window.clearTimeout(safetyTimer); hideSplash(); } });
  timeline.fromTo(splash.querySelector('.splash-screen__monogram'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' })
    .to(splash.querySelector('.splash-screen__line'), { width: '4rem', duration: .22, ease: 'power2.inOut' }, '-=.08')
    .to(splash.querySelector('.splash-screen__title'), { autoAlpha: 1, duration: .2 }, '-=.08')
    .to(splash, { autoAlpha: 0, duration: .32, delay: .1, ease: 'power2.inOut' });
}

function hasSeenSplash() {
  try { return sessionStorage.getItem('silvana-lima-splash') === 'seen'; } catch { return false; }
}

function rememberSplash() {
  try { sessionStorage.setItem('silvana-lima-splash', 'seen'); } catch { /* sessionStorage may be blocked */ }
}

function dismissSplash(splash) {
  if (!splash) return;
  splash.classList.add('splash-screen--hidden');
  splash.style.display = 'none';
}
