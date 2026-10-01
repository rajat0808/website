(() => {
  'use strict';
  const section = document.getElementById('instagram-reels');
  if (!section) return;
  const track = section.querySelector('.instagram-reels__track');
  const status = section.querySelector('[data-reels-status]');
  const retry = section.querySelector('[data-reels-retry]');
  const savedCount = Number(section.getAttribute('data-saved-reels')) || 0;
  const maxReels = window.matchMedia('(max-width: 640px)').matches ? 18 : 24;
  const seen = new Set();
  const cursors = new Set();
  let after = null;
  let started = false;

  const scroller = section.querySelector('.instagram-reels__scroller');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let loopWidth = 0;
  let visible = false;
  let hovering = false;
  let touching = false;
  let resumeAt = 0;
  let lastFrame = 0;

  function refreshLoop() {
    track.querySelectorAll('[data-reel-clone]').forEach(node => node.remove());
    loopWidth = 0;
    const originals = Array.from(track.children);
    if (!originals.length || reducedMotion.matches || track.scrollWidth <= scroller.clientWidth) return;
    // Repeat only enough cards to fill the viewport at the loop boundary.
    const count = Math.min(originals.length, Math.ceil(scroller.clientWidth / originals[0].getBoundingClientRect().width) + 1);
    for (const item of originals.slice(0, count)) {
      const clone = item.cloneNode(true);
      clone.setAttribute('data-reel-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      track.append(clone);
    }
    loopWidth = track.querySelector('[data-reel-clone]').getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
  }
  function moveReel(direction) {
    const first = track.querySelector('.instagram-reel');
    if (!first) return;
    const step = first.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    resumeAt = performance.now() + 3000;
    if (loopWidth > 0) {
      if (direction < 0 && scroller.scrollLeft < step) scroller.scrollLeft += loopWidth;
      else if (direction > 0 && scroller.scrollLeft >= loopWidth) scroller.scrollLeft -= loopWidth;
    }
    scroller.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  section.querySelector('[data-reels-prev]')?.addEventListener('click', () => moveReel(-1));
  section.querySelector('[data-reels-next]')?.addEventListener('click', () => moveReel(1));
  scroller.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovering = true; });
  scroller.addEventListener('pointerleave', () => { hovering = false; });
  scroller.addEventListener('pointerdown', () => { touching = true; });
  window.addEventListener('pointerup', () => { touching = false; resumeAt = performance.now() + 1500; });
  window.addEventListener('pointercancel', () => { touching = false; resumeAt = performance.now() + 1500; });
  scroller.addEventListener('wheel', () => { resumeAt = performance.now() + 1500; }, { passive: true });
  reducedMotion.addEventListener('change', refreshLoop);
  if ('ResizeObserver' in window) new ResizeObserver(refreshLoop).observe(scroller);
  else window.addEventListener('resize', refreshLoop);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(scroller);
  } else visible = true;
  function animate(time) {
    const elapsed = Math.min(time - (lastFrame || time), 50);
    lastFrame = time;
    if (visible && !document.hidden && !reducedMotion.matches && !hovering && !touching && time >= resumeAt && !scroller.matches(':focus-within') && loopWidth > 0) {
      scroller.scrollLeft += elapsed * 0.087; // Match the other sliders: 1.45 px/frame at 60 Hz.
      if (scroller.scrollLeft >= loopWidth) scroller.scrollLeft -= loopWidth;
    }
    requestAnimationFrame(animate);
  }
  refreshLoop();
  requestAnimationFrame(animate);

  function card(reel) {
    const url = new URL(reel.permalink);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null;
    const link = document.createElement('a');
    link.className = 'instagram-reel';
    link.setAttribute('data-reel-id', reel.id);
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const caption = reel.caption || 'Sindh Emporio reel';
    link.setAttribute('aria-label', `${caption.slice(0, 160)} — open this reel on Instagram in a new tab`);
    const img = document.createElement('img');
    img.alt = caption.slice(0, 160);
    img.loading = 'lazy';
    img.decoding = 'async';
    const fallback = 'assets/hero-backdrop.webp';
    img.src = typeof reel.thumbnail_url === 'string' && reel.thumbnail_url.startsWith('https://') ? reel.thumbnail_url : fallback;
    img.addEventListener('error', () => { img.src = fallback; }, { once: true });
    link.append(img);
    return link;
  }

  async function load() {
    retry.hidden = true;
    section.setAttribute('aria-busy', 'true');
    status.textContent = seen.size ? `Loading more reels… (${seen.size} loaded)` : savedCount ? `${savedCount} reels · Select a reel to watch on Instagram.` : 'Loading Instagram reels…';
    try {
      do {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        let data;
        try {
          const query = after ? `?after=${encodeURIComponent(after)}` : '';
          const response = await fetch(`api/instagram-reels.php${query}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Instagram unavailable');
          data = await response.json();
          if (!Array.isArray(data.reels)) throw new Error('Invalid response');
        } finally {
          clearTimeout(timeout);
        }
        const fragment = document.createDocumentFragment();
        for (const reel of data.reels) {
          if (seen.size >= maxReels) break;
          if (!reel.id || seen.has(reel.id)) continue;
          const element = card(reel);
          if (!element) continue;
          seen.add(reel.id);
          fragment.append(element);
        }
        if (!started) {
          track.replaceChildren();
          section.classList.add('instagram-reels--live');
          started = true;
        }
        track.querySelectorAll('[data-reel-clone]').forEach(node => node.remove());
        track.append(fragment);
        refreshLoop();
        const next = data.after;
        if (next && (typeof next !== 'string' || cursors.has(next))) throw new Error('Invalid pagination');
        after = seen.size >= maxReels ? null : next || null;
        if (after) cursors.add(after);
        status.textContent = `Loading more reels… (${seen.size} loaded)`;
      } while (after);
      status.textContent = seen.size ? `${seen.size} reels · Select a reel to watch on Instagram.` : 'No reels are available yet. Visit us on Instagram.';
    } catch (_) {
      status.textContent = seen.size ? `${seen.size} reels loaded. More reels could not be loaded.` : savedCount ? `${savedCount} saved reels · Select a reel to watch on Instagram.` : 'Live reels are temporarily unavailable. Visit us on Instagram.';
      retry.hidden = !seen.size && savedCount > 0;
    } finally {
      section.setAttribute('aria-busy', 'false');
    }
  }
  retry.addEventListener('click', load);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: '400px' });
    observer.observe(section);
  } else {
    load();
  }
})();
