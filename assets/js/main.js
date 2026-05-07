(function () {
  // --- PRELOADER ---
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      preloader.classList.add('preloader-hidden');
      setTimeout(function () { preloader.style.display = 'none'; }, 1000);
    });
    setTimeout(function () {
      if (!preloader.classList.contains('preloader-hidden')) {
        preloader.classList.add('preloader-hidden');
        setTimeout(function () { preloader.style.display = 'none'; }, 1000);
      }
    }, 5000);
  }
})();

// --- THEME TOGGLE ---
(function () {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  function toggleTheme() {
    var theme = document.documentElement.getAttribute('data-theme');
    var next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  document.querySelectorAll('.theme-toggle, .nav-drawer-theme-btn').forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });
})();

// --- NAVBAR ---
(function () {
  var menu = document.querySelector('#mobile-menu');
  var menuLinks = document.querySelector('.nav-links');
  var navOverlay = document.querySelector('#nav-overlay');
  var nav = document.querySelector('#navbar');

  if (!menu || !menuLinks) return;

  function openNav() {
    menuLinks.classList.add('active');
    menu.classList.add('is-active');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    menuLinks.classList.remove('active');
    menu.classList.remove('is-active');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menu.addEventListener('click', function () {
    if (menuLinks.classList.contains('active')) { closeNav(); } else { openNav(); }
  });

  if (navOverlay) navOverlay.addEventListener('click', closeNav);

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Scroll shadow
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Scroll progress bar
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    });
  }
})();

// --- SCROLL REVEAL ---
(function () {
  var revealVariants = [
    { selector: '.reveal-up', attr: 'data-reveal' },
    { selector: '.reveal-left', attr: 'data-reveal' },
    { selector: '.reveal-right', attr: 'data-reveal' },
    { selector: '.reveal-scale', attr: 'data-reveal' },
    { selector: '.reveal-rotate', attr: 'data-reveal' },
    { selector: '.reveal-stagger', attr: 'data-reveal' }
  ];

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
})();

// --- CONTACT FORM ---
document.addEventListener('DOMContentLoaded', function () {
  var contactForm = document.querySelector('#contactForm');
  if (contactForm && typeof db !== 'undefined') {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('button');
      var originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="label">SENDING...</span>';

      try {
        await db.collection('leads').add({
          name: contactForm.name.value,
          email: contactForm.email.value,
          company: contactForm.company.value || 'N/A',
          topic: contactForm.topic.value || 'N/A',
          message: contactForm.message.value,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        submitBtn.innerHTML = '<span class="label">SENT!</span>';
        contactForm.reset();
        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 5000);
      } catch (error) {
        console.error(error);
        alert('Something went wrong. Please try again later.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

// --- BOOKING MODAL ---
(function () {
  var modal = document.getElementById('bookingModal');
  var closeBtn = document.getElementById('bookingModalClose');
  var consFormBtn = document.getElementById('bookingConsForm');
  if (!modal) return;

  function openModal(e) { e.preventDefault(); modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; }

  document.querySelectorAll('.btn-book').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  if (consFormBtn) {
    consFormBtn.addEventListener('click', function () {
      closeModal();
      var bookSection = document.getElementById('book');
      if (bookSection) {
        setTimeout(function () { bookSection.scrollIntoView({ behavior: 'smooth' }); }, 300);
      }
    });
  }
})();

// --- PRICING TABS ---
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  document.getElementById('panel-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- SCROLL TO TOP ---
(function () {
  var btn = document.querySelector('#scroll-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) { btn.classList.add('show'); } else { btn.classList.remove('show'); }
  });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
