// Scroll animations and the active link in the top bar.
// The page reads fine without this file; it only adds motion.
(() => {
  window.revealReady = true;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show a hairline under the top bar once the page scrolls
  const bar = document.querySelector('.topbar');
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Replay the DK monogram when you hover it, or scroll back to the top
  const logoPaths = document.querySelectorAll('.logo path');
  let lastDraw = performance.now();
  const replayLogo = () => {
    if (reduceMotion || performance.now() - lastDraw < 1400) return;
    lastDraw = performance.now();
    logoPaths.forEach((path) => {
      path.style.animation = 'none';
      path.getBoundingClientRect(); // forces the browser to reset the animation
      path.style.animation = '';
    });
  };
  document.querySelector('.logo').addEventListener('mouseenter', replayLogo);
  let wasDown = window.scrollY > 300;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) wasDown = true;
    else if (wasDown && window.scrollY < 40) { wasDown = false; replayLogo(); }
  }, { passive: true });

  // Reveal each section's heading and entries as they come into view, in a quick stagger
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealer = new IntersectionObserver((items) => {
      items.forEach((item) => {
        if (item.isIntersecting) {
          item.target.classList.add('in');
          revealer.unobserve(item.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('main > section').forEach((section) => {
      section.querySelectorAll(':scope > h2, .entry, .awards li, :scope > p').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms');
        revealer.observe(el);
      });
    });
  } else {
    document.documentElement.classList.remove('js');
  }

  // Light up the top-bar link for the section being read:
  // the last section whose top has passed 30% of the way down the screen
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links.map((a) => document.getElementById(a.hash.slice(1)));
  const markCurrent = () => {
    const line = window.innerHeight * 0.3;
    let current = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) current = i; });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections.length - 1;
    links.forEach((a, i) => a.toggleAttribute('aria-current', i === current));
  };
  markCurrent();
  window.addEventListener('scroll', markCurrent, { passive: true });
})();
