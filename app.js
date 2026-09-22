/**
 * AUREL ARCHITECTURE STUDIO
 * Native JavaScript Application Logic
 */

// =========================================================================
// CONFIG
// =========================================================================
const CONFIG = {
  // Paste your form endpoint here (e.g. 'https://formspree.io/f/xxxxxxxx').
  // Leave empty to fall back to opening the visitor's email app (mailto:).
  formEndpoint: '',
  contactEmail: 'hello@aurel.studio'
};

// =========================================================================
// PROJECT DATA REGISTRY (REPLACE PLACEHOLDER URLS WITH YOUR OWN IMAGE PATHS)
// =========================================================================
const PROJECTS_DATA = {
  'casa-nera': {
    title: 'CASA NERA',
    location: 'Lagos, Nigeria',
    year: '2026',
    category: 'Private Residence',
    description: 'Casa Nera explores the relationship between heavy architectural mass and natural light. The building uses deep openings, exposed concrete, stone, and controlled landscaping to create a sequence of compressed and open spaces.',
    heroImage: 'https://placehold.co/1800x1000/2a2a2a/ffffff?text=CASA+NERA+-+DETAIL+HERO',
    gallery: [
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=CASA+NERA+-+GALLERY+IMAGE+1',
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=CASA+NERA+-+GALLERY+IMAGE+2',
      'https://placehold.co/1600x900/2a2a2a/ffffff?text=CASA+NERA+-+FULL+WIDTH+IMAGE+3'
    ],
    closingNote: 'A sanctuary designed to weather gracefully in its coastal tropical environment.'
  },
  'villa-07': {
    title: 'VILLA 07',
    location: 'Cape Town, South Africa',
    year: '2025',
    category: 'Residential',
    description: 'Positioned on a steep coastal incline, Villa 07 anchors itself into the granite rock face. Cantilevered concrete planes shield interior spaces from direct sun while framing panoramic views of the Atlantic Ocean.',
    heroImage: 'https://placehold.co/1800x1000/2a2a2a/ffffff?text=VILLA+07+-+DETAIL+HERO',
    gallery: [
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=VILLA+07+-+GALLERY+IMAGE+1',
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=VILLA+07+-+GALLERY+IMAGE+2'
    ],
    closingNote: 'Harmonizing raw verticality with expansive horizontal planes.'
  },
  'the-monolith': {
    title: 'THE MONOLITH',
    location: 'Dubai, UAE',
    year: '2025',
    category: 'Cultural / Hospitality',
    description: 'A structural reflection on sanctuary and shade. The Monolith reimagines traditional desert courtyard architecture through thick rammed-earth exterior walls and internal water courtyards that naturally cool the microclimate.',
    heroImage: 'https://placehold.co/1800x1000/2a2a2a/ffffff?text=THE+MONOLITH+-+DETAIL+HERO',
    gallery: [
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=THE+MONOLITH+-+GALLERY+IMAGE+1',
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=THE+MONOLITH+-+GALLERY+IMAGE+2'
    ],
    closingNote: 'An oasis defined by silence, mass, and shadows.'
  },
  'house-between': {
    title: 'HOUSE BETWEEN',
    location: 'Accra, Ghana',
    year: '2024',
    category: 'Private Residence',
    description: 'Structured as a series of open pavilions connected by covered walkways, House Between blurs the threshold between indoor living spaces and surrounding dense flora.',
    heroImage: 'https://placehold.co/1800x1000/2a2a2a/ffffff?text=HOUSE+BETWEEN+-+DETAIL+HERO',
    gallery: [
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=HOUSE+BETWEEN+-+GALLERY+IMAGE+1',
      'https://placehold.co/1200x800/2a2a2a/ffffff?text=HOUSE+BETWEEN+-+GALLERY+IMAGE+2'
    ],
    closingNote: 'Living within the landscape, rather than alongside it.'
  }
};

const BASE_TITLE = document.title;

/* Escape values before injecting them into innerHTML */
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

/* Pull "WxH" out of a placehold.co-style URL so the detail images can reserve their
   layout space before they load (avoids a layout shift on route change). Returns a
   ready-to-insert width/height attribute string, or '' when the URL doesn't encode
   dimensions — e.g. once these placeholders are replaced with real photos, this just
   quietly does nothing until real dimensions are added. */
const dims = (url) => {
  const match = String(url).match(/\/(\d+)x(\d+)\//);
  return match ? ` width="${match[1]}" height="${match[2]}"` : '';
};

/* Jump without triggering the CSS smooth-scroll animation */
const jumpTo = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });

/* Application Initialization */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavigation();
  initScrollObserver();
  initRouter();
  initContactForm();
});

/* 1. Loader Controller */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setTimeout(() => {
    loader.classList.add('hidden');
  }, reduceMotion ? 0 : 1000);
}

/* 2. Navigation Controller (mobile menu is class-driven, no inline styles) */
function initNavigation() {
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  if (!header || !menuToggle) return;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };

  menuToggle.addEventListener('click', () => {
    setOpen(!header.classList.contains('nav-open'));
  });

  // Close after choosing a link
  header.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Close with Escape and return focus to the toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      menuToggle.focus();
    }
  });

  // Reset when resizing up to desktop
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* 3. Intersection Observer for Subtle Scroll Animations */
function initScrollObserver() {
  const items = document.querySelectorAll('.reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  items.forEach((el) => observer.observe(el));
}

/* 4. Hash Router
 *    #/project/<id>  -> project detail view
 *    anything else   -> home view (and #work, #studio, etc. scroll to sections)
 *    Gives real URLs, a working browser back button, and shareable links.
 */
const routerState = {
  view: 'home',
  savedScroll: null,   // home scroll position saved when a project is opened
  lastProjectId: null,
  firstRoute: true
};

function initRouter() {
  const backBtn = document.getElementById('btn-back-home');

  window.addEventListener('hashchange', route);

  // Any header link (brand, nav, contact) means "go to that place", not "restore my old position"
  document.querySelectorAll('.site-header a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      routerState.savedScroll = null;
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (routerState.savedScroll !== null) {
        history.back();            // returns to the exact place in the grid
      } else {
        location.hash = '#work';   // opened via direct link: no history to go back to
      }
    });
  }

  route();
}

function route() {
  const hash = location.hash;
  const match = hash.match(/^#\/project\/([a-z0-9-]+)$/i);

  if (match && PROJECTS_DATA[match[1]]) {
    showProject(match[1]);
    routerState.firstRoute = false;
    return;
  }

  const wasDetail = routerState.view === 'detail';
  const anchorId = hash.startsWith('#/') ? '' : decodeURIComponent(hash.slice(1));
  const target = anchorId ? document.getElementById(anchorId) : null;

  showHome();

  if (wasDetail) {
    if (routerState.savedScroll !== null) {
      jumpTo(routerState.savedScroll);
      focusProjectLink(routerState.lastProjectId);
    } else if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      jumpTo(0);
    }
  } else if (routerState.firstRoute && target) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  routerState.savedScroll = null;
  routerState.firstRoute = false;
}

function setActiveView(name) {
  const home = document.getElementById('view-home');
  const detail = document.getElementById('view-project-detail');
  const showDetail = name === 'detail';

  home.classList.toggle('active-view', !showDetail);
  home.classList.toggle('inactive-view', showDetail);
  detail.classList.toggle('active-view', showDetail);
  detail.classList.toggle('inactive-view', !showDetail);

  routerState.view = name;
}

function showHome() {
  setActiveView('home');
  document.title = BASE_TITLE;
}

function showProject(id) {
  const data = PROJECTS_DATA[id];

  // Remember where we were on the home page so Back can return there
  if (routerState.view === 'home') {
    routerState.savedScroll = window.scrollY;
  }
  routerState.lastProjectId = id;

  renderProjectDetail(data);
  setActiveView('detail');
  document.title = `${data.title.charAt(0)}${data.title.slice(1).toLowerCase()} — AUREL`;
  jumpTo(0);

  // Move focus to the new page heading for keyboard and screen reader users
  const heading = document.querySelector('.detail-title');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

function focusProjectLink(id) {
  if (!id) return;
  const link = document.querySelector(`[data-project-link="${id}"]`);
  if (link) link.focus({ preventScroll: true });
}

function renderProjectDetail(data) {
  const contentContainer = document.getElementById('project-detail-content');
  const title = esc(data.title);

  contentContainer.innerHTML = `
    <header class="detail-header">
      <h1 class="detail-title">${title}</h1>
      <div class="detail-meta-bar">
        <span>${esc(data.location)}</span>
        <span>${esc(data.category)}</span>
        <span>${esc(data.year)}</span>
      </div>
    </header>

    <img class="detail-hero-image" src="${esc(data.heroImage)}" alt="${title} — main view" decoding="async"${dims(data.heroImage)}>

    <div class="detail-description-grid">
      <span class="section-label">PROJECT OVERVIEW</span>
      <div>
        <p class="body-text">${esc(data.description)}</p>
      </div>
    </div>

    <div class="detail-gallery-pair">
      <img src="${esc(data.gallery[0] || data.heroImage)}" alt="${title} — detail view 1" loading="lazy" decoding="async"${dims(data.gallery[0] || data.heroImage)}>
      <img src="${esc(data.gallery[1] || data.heroImage)}" alt="${title} — detail view 2" loading="lazy" decoding="async"${dims(data.gallery[1] || data.heroImage)}>
    </div>

    ${data.gallery[2] ? `<img class="detail-full-image" src="${esc(data.gallery[2])}" alt="${title} — architectural perspective" loading="lazy" decoding="async"${dims(data.gallery[2])}>` : ''}

    <div class="detail-description-grid">
      <span class="section-label">CONCLUSION</span>
      <div>
        <h2 class="editorial-statement">"${esc(data.closingNote)}"</h2>
      </div>
    </div>
  `;
}

/* 5. Contact Form Controller */
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  const button = document.getElementById('submit-button');
  const status = document.getElementById('form-status');
  if (!form || !button || !status) return;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: bots fill this, people never see it
    if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);

    // No endpoint configured: hand off to the visitor's email app
    if (!CONFIG.formEndpoint) {
      const subject = `Inquiry from ${data.get('name')}`;
      const body = [
        `Name: ${data.get('name')}`,
        `Email: ${data.get('email')}`,
        `Project type: ${data.get('project') || '-'}`,
        '',
        data.get('message')
      ].join('\n');

      window.location.href =
        `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus(`Opening your email app. If nothing opens, write to ${CONFIG.contactEmail}.`);
      return;
    }

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'SENDING…';
    setStatus('');

    try {
      const response = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      form.reset();
      button.textContent = 'INQUIRY SENT';
      setStatus('Thank you. Your inquiry has been sent and we will reply by email.');

      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalLabel;
      }, 4000);
    } catch (err) {
      console.error(err);
      button.disabled = false;
      button.textContent = originalLabel;
      setStatus(`Your inquiry was not sent. Try again, or write to ${CONFIG.contactEmail}.`, true);
    }
  });
}
