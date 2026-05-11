(function () {

  var STRIPE_KEY = 'pk_test_placeholder';

  var pricingData = {
    residential: {
      name: "Residential Real Estate Photography",
      description: "Premium listing photography for realtors and homeowners.",
      cards: [
        { name: "Base Stills", tagline: "Photography Only", features: ["Professional HDR Photography", "Custom Property Marketing Website", "24hr Stills Delivery"], prices: [200, 250, 300, 350], sqTiers: [1000, 2000, 3000, 4000] },
        { name: "The Essential", tagline: "Stills + Floor Plan", features: ["Everything in Base Stills", "Marketing 2D Floor Plan"], prices: [280, 330, 380, 430], sqTiers: [1000, 2000, 3000, 4000] },
        { name: "The Pro Package", tagline: "Full Media Suite", features: ["Everything in Essential", "MLS Walkthrough Video", "Vertical Social Reel"], prices: [465, 515, 565, 615], sqTiers: [1000, 2000, 3000, 4000], featured: true },
        { name: "The Signature", tagline: "Complete Package", features: ["Everything in Pro Package", "360\u00B0 Interactive Tour", "6-Month Hosted Link"], prices: [625, 675, 725, 775], sqTiers: [1000, 2000, 3000, 4000] }
      ],
      addons: [
        { name: "Vacant Home Refresh", description: "1 Twilight + 3 Staged Images", price: 115 },
        { name: "Virtual Staging", description: "Per image \u2014 digitally furnished room", price: 40 },
        { name: "Virtual Staging \u2014 3-Pack", description: "Three staged images, bundle discount", price: 100 },
        { name: "Virtual Twilight", description: "Per image \u2014 day-to-dusk sky replacement", price: 30 },
        { name: "360\u00B0 Interactive Tour", description: "Full walkthrough with 6 months hosting", price: 185 },
        { name: "Same-Day Delivery", description: "Expedited to same-day by 8PM (stills only)", price: 50 }
      ]
    },
    str: {
      name: "Short-Term Rental Photography",
      description: "Hospitality media for Airbnb, VRBO, and vacation rentals.",
      cards: [
        { name: "STR Base", tagline: "Hospitality Media", features: ["Wide-Angle Room Coverage", "Curated Amenity Details", "Property Marketing Website"], prices: [295, 350, 425, 495], sqTiers: [1000, 2000, 3000, 4000] },
        { name: "STR Essential", tagline: "Base + Floor Plan", features: ["Everything in STR Base", "Marketing 2D Floor Plan"], prices: [375, 430, 505, 575], sqTiers: [1000, 2000, 3000, 4000], featured: true },
        { name: "STR Performance", tagline: "Full STR Media Suite", features: ["Everything in STR Essential", "MLS Walkthrough Video", "Vertical Social Reel"], prices: [560, 615, 690, 760], sqTiers: [1000, 2000, 3000, 4000] }
      ],
      addons: [
        { name: "Marketing 2D Floor Plan", description: "Professional labeled floor plan", price: 115 },
        { name: "MLS Walkthrough Video", description: "Cinematic horizontal walkthrough", price: 175 },
        { name: "Social Media Reel", description: "Vertical short-form for Instagram/TikTok", price: 155 },
        { name: "Video Bundle", description: "Walkthrough + Reel, bundled savings", price: 275 },
        { name: "Virtual Twilight", description: "Per image \u2014 day-to-dusk sky replacement", price: 35 },
        { name: "Virtual Staging", description: "Per image \u2014 digitally furnished room", price: 45 }
      ]
    },
    construction: {
      name: "Construction Documentation",
      description: "Progress documentation for builders and developers.",
      cards: [
        { name: "Standard Visit", tagline: "Single Progress Visit", features: ["Exterior overview", "Up to 3 designated rooms", "Professional post-editing", "48-hour turnaround"], prices: [300], sqTiers: [0] },
        { name: "Transformation", tagline: "Before & After Package", features: ["Two scheduled visits", "Before & After comparison", "Organized milestone delivery"], prices: [525], sqTiers: [0], featured: true },
        { name: "3-Visit Plan", tagline: "Multi-Visit Coverage", features: ["Three scheduled visits", "Flexible milestone scheduling", "Progress timeline gallery"], prices: [800], sqTiers: [0] },
        { name: "5-Visit Plan", tagline: "Full Documentation", features: ["Five milestone visits", "Comprehensive project coverage", "Final highlight reel", "Full archive delivery"], prices: [1200], sqTiers: [0] }
      ],
      addons: [
        { name: "Project Walkthrough Video", description: "Cinematic 4K walkthrough of the site", price: 200 },
        { name: "Social Highlight Reel", description: "Vertical 30\u201360s reel for social media", price: 200 },
        { name: "360\u00B0 Interactive Capture", description: "Full interactive 360\u00B0 view of project", price: 200 },
        { name: "Standalone Drone Package", description: "Aerial photography and video", price: 200 },
        { name: "Standalone 360\u00B0 Visit", description: "Dedicated 360\u00B0 capture at any milestone", price: 300 }
      ]
    }
  };

  var state = {
    selectedCategory: null,
    selectedPackageIndex: -1,
    addonsOnly: false,
    selectedAddons: {},
    currentPricing: null
  };

  function getEl(id) { return document.getElementById(id); }

  function formatPrice(price) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function getPriceForSqFt(pricesArr, sqTiersArr) {
    var sq = parseInt(getEl('squareFootage').value);
    if (isNaN(sq) || getEl('squareFootage').value.trim() === '') {
      return { price: pricesArr[0], tier: -1, isEstimated: true };
    }
    for (var i = 0; i < sqTiersArr.length; i++) {
      if (sq <= sqTiersArr[i]) {
        return { price: pricesArr[i], tier: i, isEstimated: false };
      }
    }
    return { price: pricesArr[pricesArr.length - 1], tier: pricesArr.length - 1, isEstimated: false };
  }

  function selectCategory(catId) {
    state.selectedCategory = catId;
    state.selectedPackageIndex = -1;
    state.addonsOnly = false;
    state.selectedAddons = {};
    state.currentPricing = [];

    getEl('addonsOnly').checked = false;

    document.querySelectorAll('.category-card').forEach(function (el) {
      el.classList.toggle('selected', el.dataset.cat === catId);
    });

    getEl('section-property').style.display = 'block';
    getEl('section-packages').style.display = 'block';
    getEl('section-addons').style.display = 'block';
    getEl('section-contact').style.display = 'block';

    renderPackages(catId);
    renderAddons(catId);
    updatePricing();
    updateOrderSummary();
  }

  function renderPackages(catId) {
    var data = pricingData[catId];
    if (!data) return;
    var grid = getEl('packageGrid');
    var html = '';
    data.cards.forEach(function (card, idx) {
      var featClass = card.featured ? ' featured' : '';
      html += '<div class="package-card' + featClass + '" id="pkgCard' + idx + '" onclick="selectPackage(' + idx + ')">';
      html += '<div class="package-card-name">' + card.name + '</div>';
      html += '<div class="package-card-tagline">' + card.tagline + '</div>';
      html += '<ul class="package-card-features">';
      card.features.forEach(function (f) { html += '<li>' + f + '</li>'; });
      html += '</ul>';
      html += '<div class="package-card-price" id="pkgPrice' + idx + '"></div>';
      html += '<span class="package-card-price-hint" id="pkgHint' + idx + '"></span>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  function renderAddons(catId) {
    var data = pricingData[catId];
    if (!data) return;
    var grid = getEl('addonGrid');
    var html = '';
    data.addons.forEach(function (addon, idx) {
      html += '<div class="addon-card" id="addonCard' + idx + '" onclick="toggleAddon(' + idx + ')">';
      html += '<input type="checkbox" id="addonCheck' + idx + '" tabindex="-1">';
      html += '<div class="addon-card-body">';
      html += '<span class="addon-card-name">' + addon.name + '</span>';
      html += '<span class="addon-card-desc">' + addon.description + '</span>';
      html += '</div>';
      html += '<span class="addon-card-price">' + formatPrice(addon.price) + '</span>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  function updatePricing() {
    if (!state.selectedCategory) return;
    var data = pricingData[state.selectedCategory];
    if (!data) return;

    state.currentPricing = data.cards.map(function (card) {
      return getPriceForSqFt(card.prices, card.sqTiers);
    });

    var sqEl = getEl('squareFootage');
    var sqVal = sqEl.value.trim();

    data.cards.forEach(function (card, idx) {
      var priceEl = getEl('pkgPrice' + idx);
      var hintEl = getEl('pkgHint' + idx);
      if (!priceEl) return;
      var pricing = state.currentPricing[idx];
      priceEl.textContent = formatPrice(pricing.price);
      if (sqVal === '' || isNaN(parseInt(sqVal))) {
        hintEl.textContent = 'Enter square footage above for exact pricing';
      } else {
        hintEl.textContent = '';
      }
    });

    updateOrderSummary();
  }

  function selectPackage(index) {
    if (state.addonsOnly) return;

    var prevIndex = state.selectedPackageIndex;
    if (prevIndex === index) {
      state.selectedPackageIndex = -1;
    } else {
      state.selectedPackageIndex = index;
    }

    document.querySelectorAll('.package-card').forEach(function (el, i) {
      el.classList.toggle('selected', i === index && !state.addonsOnly);
    });

    updateOrderSummary();
  }

  function toggleAddon(index) {
    state.selectedAddons[index] = !state.selectedAddons[index];

    var card = getEl('addonCard' + index);
    var check = getEl('addonCheck' + index);
    if (card) card.classList.toggle('checked', !!state.selectedAddons[index]);
    if (check) check.checked = !!state.selectedAddons[index];

    updateOrderSummary();
  }

  var savedPackageIndex = -1;

  function toggleAddonsOnly() {
    state.addonsOnly = getEl('addonsOnly').checked;
    if (state.addonsOnly) {
      savedPackageIndex = state.selectedPackageIndex;
      state.selectedPackageIndex = -1;
    } else {
      state.selectedPackageIndex = savedPackageIndex;
      savedPackageIndex = -1;
    }

    document.querySelectorAll('.package-card').forEach(function (el, i) {
      el.classList.remove('selected');
      if (state.addonsOnly) {
        el.classList.add('disabled');
      } else {
        el.classList.remove('disabled');
        if (i === state.selectedPackageIndex) {
          el.classList.add('selected');
        }
      }
    });

    updateOrderSummary();
  }

  function updateOrderSummary() {
    var data = state.selectedCategory ? pricingData[state.selectedCategory] : null;
    var packageLine = getEl('summaryPackage');
    var addonsContainer = getEl('summaryAddons');
    var subtotalEl = getEl('summarySubtotal');
    var depositEl = getEl('summaryDeposit');
    var depositLine = getEl('summaryDepositLine');
    var emptyEl = getEl('summaryEmpty');
    var linesEl = getEl('summaryLines');
    var btnDep = getEl('btnPayDeposit');
    var btnFull = getEl('btnPayFull');

    var packagePrice = 0;
    var packageName = '';
    var addonsTotal = 0;
    var addonLines = '';

    if (data && state.selectedPackageIndex >= 0 && !state.addonsOnly && state.currentPricing[state.selectedPackageIndex]) {
      packageName = data.cards[state.selectedPackageIndex].name;
      packagePrice = state.currentPricing[state.selectedPackageIndex].price;
      getEl('summaryPackageName').textContent = packageName;
      getEl('summaryPackagePrice').textContent = formatPrice(packagePrice);
      packageLine.style.display = 'flex';
    } else {
      packageLine.style.display = 'none';
    }

    if (data) {
      var addonKeys = Object.keys(state.selectedAddons).filter(function (k) { return state.selectedAddons[k]; });
      addonKeys.forEach(function (k) {
        var addon = data.addons[parseInt(k)];
        if (addon) {
          addonsTotal += addon.price;
          addonLines += '<div class="summary-addon-line"><span>' + addon.name + '</span><span>' + formatPrice(addon.price) + '</span></div>';
        }
      });
      addonsContainer.innerHTML = addonLines;
    }

    var subtotal = packagePrice + addonsTotal;

    if (subtotal > 0 || (packageName || addonsTotal > 0)) {
      emptyEl.style.display = 'none';
      linesEl.style.display = 'block';
      subtotalEl.textContent = formatPrice(subtotal);
      depositEl.textContent = formatPrice(Math.round(subtotal / 2));
      depositLine.style.display = packagePrice > 0 ? 'flex' : 'none';
      btnDep.disabled = false;
      btnFull.disabled = false;
    } else {
      emptyEl.style.display = 'block';
      linesEl.style.display = 'none';
      depositLine.style.display = 'none';
      btnDep.disabled = true;
      btnFull.disabled = true;
    }
  }

  function submitOrder(isDeposit) {
    var data = state.selectedCategory ? pricingData[state.selectedCategory] : null;
    if (!data) {
      alert('Please select a service category first.');
      return;
    }

    var clientName = getEl('clientName').value.trim();
    var clientEmail = getEl('clientEmail').value.trim();
    var clientPhone = getEl('clientPhone').value.trim();
    var propertyAddress = getEl('propertyAddress').value.trim();
    var sqFtVal = getEl('squareFootage').value.trim();
    var notes = getEl('orderNotes').value.trim();

    if (!clientName) { alert('Please enter your full name.'); return; }
    if (!clientEmail) { alert('Please enter your email address.'); return; }

    var packageInfo = null;
    if (state.selectedPackageIndex >= 0 && !state.addonsOnly && state.currentPricing[state.selectedPackageIndex]) {
      packageInfo = {
        name: data.cards[state.selectedPackageIndex].name,
        price: state.currentPricing[state.selectedPackageIndex].price
      };
    }

    var selectedAddons = [];
    Object.keys(state.selectedAddons).forEach(function (k) {
      if (state.selectedAddons[k]) {
        var addon = data.addons[parseInt(k)];
        if (addon) selectedAddons.push({ name: addon.name, price: addon.price });
      }
    });

    var packagePrice = packageInfo ? packageInfo.price : 0;
    var addonsTotal = selectedAddons.reduce(function (sum, a) { return sum + a.price; }, 0);
    var subtotal = packagePrice + addonsTotal;
    var total = subtotal;
    var deposit = Math.round(subtotal / 2);

    if (subtotal === 0) {
      alert('Please select a package or at least one add-on service.');
      return;
    }

    var orderData = {
      category: state.selectedCategory,
      categoryName: data.name,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      propertyAddress: propertyAddress,
      squareFootage: sqFtVal ? parseInt(sqFtVal) : null,
      package: packageInfo,
      addons: selectedAddons,
      addonsOnly: state.addonsOnly,
      subtotal: subtotal,
      total: total,
      deposit: deposit,
      notes: notes,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    var btnDep = getEl('btnPayDeposit');
    var btnFull = getEl('btnPayFull');
    btnDep.disabled = true;
    btnFull.disabled = true;
    btnDep.textContent = 'Processing...';
    btnFull.textContent = 'Processing...';

    if (STRIPE_KEY === 'pk_test_placeholder') {
      db.collection('hub_orders').add(orderData).then(function () {
        showSuccess(orderData);
      }).catch(function (err) {
        alert('Error saving order: ' + err.message);
        btnDep.disabled = false;
        btnFull.disabled = false;
        btnDep.textContent = 'Pay Deposit (50%)';
        btnFull.textContent = 'Pay in Full';
      });
    } else {
      var amount = isDeposit ? deposit : total;
      db.collection('hub_orders').add(orderData).then(function (docRef) {
        orderData.id = docRef.id;
        showSuccess(orderData);
      }).catch(function (err) {
        alert('Error saving order: ' + err.message);
        btnDep.disabled = false;
        btnFull.disabled = false;
        btnDep.textContent = 'Pay Deposit (50%)';
        btnFull.textContent = 'Pay in Full';
      });
    }
  }

  function showSuccess(orderData) {
    document.querySelectorAll('.order-section').forEach(function (el) { el.style.display = 'none'; });
    getEl('orderSuccess').style.display = 'block';

    var detailHtml = '';
    detailHtml += '<p><strong>Category:</strong> ' + orderData.categoryName + '</p>';
    if (orderData.package) {
      detailHtml += '<p><strong>Package:</strong> ' + orderData.package.name + ' — ' + formatPrice(orderData.package.price) + '</p>';
    }
    if (orderData.addons && orderData.addons.length > 0) {
      orderData.addons.forEach(function (a) {
        detailHtml += '<p><strong>Add-On:</strong> ' + a.name + ' — ' + formatPrice(a.price) + '</p>';
      });
    }
    detailHtml += '<p><strong>Total:</strong> ' + formatPrice(orderData.total) + '</p>';
    detailHtml += '<p><strong>Name:</strong> ' + orderData.clientName + '</p>';
    detailHtml += '<p><strong>Email:</strong> ' + orderData.clientEmail + '</p>';

    getEl('successOrderDetails').innerHTML = detailHtml;

    getEl('section-contact').style.display = 'none';
    getEl('orderSummary').style.display = 'none';

    if (orderData.id) {
      db.collection('hub_orders').doc(orderData.id).update({ status: 'confirmed' }).catch(function () {});
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    state.selectedCategory = null;
    state.selectedPackageIndex = -1;
    savedPackageIndex = -1;
    state.addonsOnly = false;
    state.selectedAddons = {};
    state.currentPricing = [];

    getEl('propertyAddress').value = '';
    getEl('squareFootage').value = '';
    getEl('clientName').value = '';
    getEl('clientEmail').value = '';
    getEl('clientPhone').value = '';
    getEl('orderNotes').value = '';
    getEl('addonsOnly').checked = false;

    document.querySelectorAll('.category-card').forEach(function (el) { el.classList.remove('selected'); });

    getEl('section-property').style.display = 'none';
    getEl('section-packages').style.display = 'none';
    getEl('section-addons').style.display = 'none';
    getEl('section-contact').style.display = 'none';
    getEl('orderSuccess').style.display = 'none';
    getEl('orderSummary').style.display = 'block';

    getEl('summaryEmpty').style.display = 'block';
    getEl('summaryLines').style.display = 'none';
    getEl('summaryDepositLine').style.display = 'none';
    getEl('btnPayDeposit').disabled = true;
    getEl('btnPayFull').disabled = true;
    getEl('btnPayDeposit').textContent = 'Pay Deposit (50%)';
    getEl('btnPayFull').textContent = 'Pay in Full';

    document.querySelectorAll('.order-section').forEach(function (el) { el.style.display = 'none'; });
    getEl('section-category').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    getEl('stripeNote').innerHTML = STRIPE_KEY === 'pk_test_placeholder'
      ? '\u26A0\uFE0F Stripe not configured. Replace <code>pk_test_placeholder</code> with your live key in <code>hub-order.js</code>.'
      : '';

    getEl('btnPayDeposit').disabled = true;
    getEl('btnPayFull').disabled = true;

    getEl('squareFootage').addEventListener('input', updatePricing);
    getEl('squareFootage').addEventListener('change', updatePricing);
  }

  window.selectCategory = selectCategory;
  window.selectPackage = selectPackage;
  window.toggleAddon = toggleAddon;
  window.toggleAddonsOnly = toggleAddonsOnly;
  window.updatePricing = updatePricing;
  window.submitOrder = submitOrder;
  window.resetForm = resetForm;

  document.addEventListener('DOMContentLoaded', init);

  // ─── THEME TOGGLE ───
  (function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }



})();
