// --- CONTACT FORM SUBMISSION ---
window.addEventListener('load', () => {
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    preloader.classList.add('preloader-hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const constructionForm = document.querySelector('#constructionForm');

  if (constructionForm && typeof db !== 'undefined') {
    constructionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = constructionForm.querySelector('.cf-submit');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>SENDING...</span>';

      const services = [];
      constructionForm.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        services.push(cb.value);
      });

      const formData = {
        name: constructionForm.name.value,
        email: constructionForm.email.value,
        phone: constructionForm.phone.value || 'N/A',
        company: constructionForm.company.value || 'N/A',
        projectType: constructionForm.projectType.value,
        location: constructionForm.location.value || 'N/A',
        services: services,
        timeline: constructionForm.timeline.value || 'N/A',
        visitCount: constructionForm.visitCount.value || 'N/A',
        details: constructionForm.details.value || '',
        source: 'construction',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        await db.collection('leads').add(formData);
        submitBtn.innerHTML = '<span>INQUIRY SENT!</span>';
        submitBtn.classList.add('success');
        constructionForm.reset();
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          submitBtn.classList.remove('success');
        }, 4000);
      } catch (error) {
        console.error("Error submitting construction inquiry: ", error);
        var errMsg = "Something went wrong. Please try again or email info@phaseonevisuals.com.";
        if (error && error.code === 'permission-denied') {
          errMsg = "Submission blocked by security rules. Please try again later or email info@phaseonevisuals.com.";
        } else if (error && error.message) {
          errMsg = error.message + " Please try again or email info@phaseonevisuals.com.";
        }
        alert(errMsg);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }
});

// --- EXISTING LOGIC ---
// Theme Toggle Logic
const themeToggle = document.querySelector('#theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

//navbar
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('#nav-overlay');

if (menu && menuLinks) {
  function openNav() {
    menuLinks.classList.add('active');
    menu.classList.add('is-active');
    if (navOverlay) navOverlay.classList.add('active');
  }

  function closeNav() {
    menuLinks.classList.remove('active');
    menu.classList.remove('is-active');
    if (navOverlay) navOverlay.classList.remove('active');
  }

  menu.addEventListener('click', function () {
    if (menuLinks.classList.contains('active')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  // Close menu and reset icon when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

// --- BOOKING MODAL ---
(function () {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('bookingModalClose');
  const consFormBtn = document.getElementById('bookingConsForm');

  if (!modal) return;

  function openModal(e) {
    e.preventDefault();
    var scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarW + 'px';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  document.querySelectorAll('.btn-book, .btn-book-trigger').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (consFormBtn) {
    consFormBtn.addEventListener('click', function () {
      closeModal();
      setTimeout(function () {
        openConstructionForm();
      }, 300);
    });
  }
})();

// --- CONSTRUCTION FORM MODAL ---
(function () {
  const cfModal = document.getElementById('constructionFormModal');
  const cfCloseBtn = document.getElementById('constructionFormClose');

  if (!cfModal) return;

  window.openConstructionForm = function () {
    var scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    cfModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarW + 'px';
  };

  function closeConstructionForm() {
    cfModal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  if (cfCloseBtn) {
    cfCloseBtn.addEventListener('click', closeConstructionForm);
  }

  cfModal.addEventListener('click', function (e) {
    if (e.target === cfModal) closeConstructionForm();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cfModal.classList.contains('active')) {
      closeConstructionForm();
    }
  });
})();



//process section
const targets = document.querySelectorAll('.step, .step-connector');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

targets.forEach(el => observer.observe(el));

// Pricing tab switcher with toggle
let activeTab = null;
function switchTab(tab, btn) {
  if (activeTab === tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    activeTab = null;
    return;
  }
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  activeTab = tab;
}

// Swipe navigation for pricing tabs
(function initPricingSwipe() {
  var pricingEl = document.querySelector('.pricing-section');
  if (!pricingEl) return;
  var tabOrder = ['residential', 'str', 'construction'];
  var startX = 0;
  var startY = 0;

  pricingEl.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  pricingEl.addEventListener('touchend', function(e) {
    if (e.target.closest('.pricing-table-wrapper')) return;
    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;
    var dx = endX - startX;
    var dy = endY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    var currentIdx = tabOrder.indexOf(activeTab);
    if (currentIdx === -1) return;
    if (dx < 0 && currentIdx < tabOrder.length - 1) {
      // swipe left -> next tab
      var nextTab = tabOrder[currentIdx + 1];
      switchTab(nextTab, document.getElementById('tab-' + nextTab) || document.querySelector('.tab-btn[onclick*="' + nextTab + '"]'));
    } else if (dx > 0 && currentIdx > 0) {
      // swipe right -> previous tab
      var prevTab = tabOrder[currentIdx - 1];
      switchTab(prevTab, document.getElementById('tab-' + prevTab) || document.querySelector('.tab-btn[onclick*="' + prevTab + '"]'));
    }
  });
})();

// Scroll to Top Logic
const scrollTopBtn = document.querySelector('#scroll-to-top');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Scroll arrow — precise positioning that accounts for navbar
(function () {
  var scrollLink = document.querySelector('a[href="#process"]');
  if (!scrollLink) return;
  scrollLink.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.getElementById('process');
    var nav = document.getElementById('navbar');
    if (!target) return;
    var navHeight = nav ? nav.getBoundingClientRect().height : 60;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
})();

// Google Places Autocomplete for construction form location
(function initAddressAutocomplete() {
  var locationInput = document.getElementById('cf-location');
  if (!locationInput) return;
  var check = setInterval(function () {
    if (window.google && google.maps && google.maps.places) {
      clearInterval(check);
      var autocomplete = new google.maps.places.Autocomplete(locationInput, {
        types: ['geocode'],
        componentRestrictions: { country: 'us' }
      });
      autocomplete.setFields(['formatted_address', 'geometry']);
    }
  }, 300);
  setTimeout(function () { clearInterval(check); }, 8000);
})();