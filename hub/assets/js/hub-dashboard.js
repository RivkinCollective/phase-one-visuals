(function () {

  const PASSWORD_HASH = "8cbd7d06e6e9a1a0e1ccfa9e5e5b5d1e9b3c3e2f1a0b9c8d7e6f5a4b3c2d1e0f";
  const SESSION_KEY = "p1hub_authenticated";

  const staticData = {
    residential: {
      categoryName: "Residential Real Estate Photography",
      displayType: "cards+table",
      cards: [
        { name: "Base Stills", tagline: "Photography Only", features: ["Professional HDR Photography", "Custom Property Marketing Website", "24hr Stills Delivery"] },
        { name: "The Essential", tagline: "Stills + Floor Plan", features: ["Everything in Base Stills", "Marketing 2D Floor Plan"] },
        { name: "The Pro Package", tagline: "Full Media Suite", features: ["Everything in Essential", "MLS Walkthrough Video", "Vertical Social Reel"], featured: true },
        { name: "The Signature", tagline: "Complete Package", features: ["Everything in Pro Package", "360° Interactive Tour", "6-Month Hosted Link"] }
      ],
      table: {
        headers: ["Property Size", "Base Stills", "The Essential", "The Pro Package", "The Signature"],
        rows: [
          { cells: ["0 – 1,000 sq ft", "$200", "$280", "$465", "$625"] },
          { cells: ["1,001 – 2,000 sq ft", "$250", "$330", "$515", "$675"] },
          { cells: ["2,001 – 3,000 sq ft", "$300", "$380", "$565", "$725"] },
          { cells: ["3,001 – 4,000 sq ft", "$350", "$430", "$615", "$775"] }
        ]
      },
      addons: [
        { name: "Vacant Home Refresh (1 Twilight + 3 Staged Images)", price: "$115" },
        { name: "Virtual Staging — per image", price: "$40" },
        { name: "Virtual Staging — 3-image set", price: "$100" },
        { name: "Virtual Twilight — per image", price: "$30" },
        { name: "360° Interactive Tour (6-month hosting)", price: "$185" },
        { name: "Same-Day Delivery (Stills only, by 8PM)", price: "$50" }
      ]
    },
    str: {
      categoryName: "Short-Term Rental Photography",
      displayType: "cards+table",
      cards: [
        { name: "STR Base", tagline: "Hospitality Media", features: ["Wide-Angle Room Coverage", "Curated Amenity Details", "Property Marketing Website"] },
        { name: "STR Essential", tagline: "Base + Floor Plan", features: ["Everything in STR Base", "Marketing 2D Floor Plan"], featured: true },
        { name: "STR Performance", tagline: "Full STR Media Suite", features: ["Everything in STR Essential", "MLS Walkthrough Video", "Vertical Social Reel"] }
      ],
      table: {
        headers: ["Property Size", "STR Base", "STR Essential", "STR Performance"],
        rows: [
          { cells: ["0 – 1,000 sq ft", "$295", "$375", "$560"] },
          { cells: ["1,001 – 2,000 sq ft", "$350", "$430", "$615"] },
          { cells: ["2,001 – 3,000 sq ft", "$425", "$505", "$690"] },
          { cells: ["3,001 – 4,000 sq ft", "$495", "$575", "$760"] }
        ]
      },
      addons: [
        { name: "Marketing 2D Floor Plan", price: "$115" },
        { name: "MLS Walkthrough Video (Horizontal)", price: "$175" },
        { name: "Social Media Reel (Vertical)", price: "$155" },
        { name: "Video Bundle (Walkthrough + Reel)", price: "$275" },
        { name: "Virtual Twilight — per image", price: "$35" },
        { name: "Virtual Staging — per image", price: "$45" }
      ]
    },
    construction: {
      categoryName: "Construction Documentation",
      displayType: "cards+table",
      cards: [
        { name: "Standard Visit", tagline: "Single Progress Visit", features: ["Exterior overview", "Up to 3 designated rooms", "Professional post-editing", "Secure digital delivery", "48-hour turnaround"] },
        { name: "Best Value", tagline: "Transformation Package", features: ["Two scheduled visits", "Before & After comparison formatting", "Organized milestone delivery"], featured: true },
        { name: "Multi-Visit", tagline: "3-Visit Plan", features: ["Three scheduled visits", "Standard scope per visit", "Flexible milestone scheduling"] },
        { name: "Full Documentation", tagline: "5-Visit Plan", features: ["Five milestone visits", "Comprehensive project coverage", "Standard scope per visit"] }
      ],
      table: {
        headers: ["Plan Type", "Standard Visit", "Transformation", "3-Visit Plan", "5-Visit Plan"],
        rows: [
          { cells: ["Number of Visits", "1 Visit", "2 Visits", "3 Visits", "5 Visits"] },
          { cells: ["Base Price", "$300", "$525", "$800", "$1,200"] },
          { cells: ["Additional Rooms", "$50 / room", "$50 / room", "$50 / room", "$50 / room"] }
        ]
      },
      addons: [
        { name: "Project Walkthrough Video (4K Horizontal)", price: "$200" },
        { name: "Social Highlight Reel (Vertical 30–60s)", price: "$200" },
        { name: "360° Interactive Capture", price: "$200" },
        { name: "Standalone 360° Visit", price: "$300" }
      ]
    }
  };

  function sha256(str) {
    var buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
      return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function showLockedState() {
    document.getElementById("passwordGate").style.display = "flex";
    document.getElementById("appDashboard").style.display = "none";
  }

  function showUnlockedState() {
    var gate = document.getElementById("passwordGate");
    gate.style.opacity = "0";
    gate.style.pointerEvents = "none";
    setTimeout(function () {
      gate.style.display = "none";
      var dash = document.getElementById("appDashboard");
      dash.style.display = "flex";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          dash.classList.add("visible");
        });
      });
    }, 500);
  }

  function switchTab(tabId) {
    document.querySelectorAll(".sidebar-nav-item").forEach(function (el) { el.classList.remove("active"); });
    document.querySelectorAll(".tab-panel").forEach(function (el) { el.classList.remove("active"); });

    var targetItem = document.querySelector('[data-tab="' + tabId + '"]');
    if (targetItem) targetItem.classList.add("active");

    var targetPanel = document.getElementById("tab-" + tabId);
    if (targetPanel) targetPanel.classList.add("active");

    if (tabId === "packages" && !window._packagesRendered) {
      renderAllPackages();
      window._packagesRendered = true;
    }
  }

  function renderAllPackages() {
    Object.keys(staticData).forEach(function (catId) {
      renderPackageCategory(catId, staticData[catId]);
    });
  }

  function renderPackageCategory(catId, data) {
    var container = document.getElementById("packages-" + catId);
    if (!container) return;

    var html = '<div class="pricing-section-block">';
    html += '<h2 class="hub-category-heading">' + data.categoryName + '</h2>';

    if (data.cards && data.cards.length > 0) {
      html += '<div class="hub-card-grid">';
      data.cards.forEach(function (pkg) {
        var featuredClass = pkg.featured ? ' hub-card--featured' : '';
        var badge = pkg.featured ? '<span class="hub-card-badge">Featured</span>' : '';
        html += '<div class="hub-card' + featuredClass + '">';
        html += badge;
        html += '<div class="hub-card-name">' + pkg.name + '</div>';
        html += '<div class="hub-card-tagline">' + pkg.tagline + '</div>';
        html += '<ul class="hub-card-features">';
        pkg.features.forEach(function (f) { html += '<li>' + f + '</li>'; });
        html += '</ul>';
        html += '<button class="hub-card-edit" aria-label="Edit package"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>';
        html += '</div>';
      });
      html += '</div>';
    }

    if (data.table && data.table.headers) {
      html += '<div class="hub-table-wrap">';
      html += '<table class="hub-pricing-table">';
      html += '<thead><tr>';
      data.table.headers.forEach(function (h, i) {
        var goldClass = i === 2 ? ' hub-col-gold' : '';
        html += '<th class="' + (i === 0 ? 'hub-col-label' : '') + goldClass + '">' + h + '<button class="hub-cell-edit" aria-label="Edit header"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></th>';
      });
      html += '</tr></thead><tbody>';
      data.table.rows.forEach(function (row) {
        html += '<tr>';
        (row.cells || []).forEach(function (cell, i) {
          var cellClass = i === 0 ? 'hub-col-label' : 'hub-price-cell';
          var goldClass = i === 2 ? ' hub-col-gold' : '';
          html += '<td class="' + cellClass + goldClass + '">' + cell + '<button class="hub-cell-edit" aria-label="Edit cell"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    }

    if (data.addons && data.addons.length > 0) {
      var label = catId === 'construction' ? 'Visual Add-Ons' : 'Add-On Services';
      html += '<div class="hub-addons-section">';
      html += '<h4 class="hub-addons-title">' + label + '</h4>';
      html += '<div class="hub-addons-grid">';
      data.addons.forEach(function (a) {
        html += '<div class="hub-addon-chip">';
        html += '<span class="hub-addon-name">' + a.name + '</span>';
        html += '<span class="hub-addon-price">' + a.price + '</span>';
        html += '<button class="hub-cell-edit" aria-label="Edit add-on"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function handleFileSelect(files) {
    var preview = document.getElementById("uploadPreview");
    preview.innerHTML = "";
    if (!files || files.length === 0) {
      preview.classList.remove("has-files");
      return;
    }
    preview.classList.add("has-files");
    Array.from(files).forEach(function (file) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var card = document.createElement("div");
        card.className = "upload-thumb";
        card.innerHTML = '<img src="' + e.target.result + '" alt="' + file.name + '"><span class="upload-thumb-name">' + file.name + '</span>';
        preview.appendChild(card);
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        var card = document.createElement("div");
        card.className = "upload-thumb upload-thumb--video";
        card.innerHTML = '<div class="upload-video-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span class="upload-thumb-name">' + file.name + '</span>';
        preview.appendChild(card);
      }
    });
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    var dash = document.getElementById("appDashboard");
    dash.classList.remove("visible");
    dash.style.display = "none";
    var gate = document.getElementById("passwordGate");
    gate.style.display = "flex";
    gate.style.opacity = "1";
    gate.style.pointerEvents = "auto";
    document.getElementById("passwordInput").value = "";
    document.getElementById("passwordError").style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", function () {

    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      var gate = document.getElementById("passwordGate");
      gate.style.display = "none";
      var dash = document.getElementById("appDashboard");
      dash.style.display = "flex";
      dash.classList.add("visible");
      setTimeout(function () { renderAllPackages(); window._packagesRendered = true; }, 100);
    }

    document.getElementById("passwordForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("passwordInput");
      var errorEl = document.getElementById("passwordError");
      var submitBtn = document.getElementById("passwordSubmit");

      sha256(input.value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem(SESSION_KEY, "1");
          showUnlockedState();
          setTimeout(function () { renderAllPackages(); window._packagesRendered = true; }, 600);
        } else {
          errorEl.style.display = "block";
          errorEl.classList.remove("shake");
          void errorEl.offsetWidth;
          errorEl.classList.add("shake");
          submitBtn.classList.add("btn-error");
          setTimeout(function () { submitBtn.classList.remove("btn-error"); }, 600);
        }
      });
    });

    document.querySelectorAll(".sidebar-nav-item").forEach(function (item) {
      item.addEventListener("click", function () {
        switchTab(this.dataset.tab);
      });
    });

    document.getElementById("btnLogout").addEventListener("click", function () {
      logout();
    });

    var dropZone = document.getElementById("uploadDropZone");
    var fileInput = document.getElementById("fileInput");

    dropZone.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () { handleFileSelect(this.files); });

    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", function () {
      dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      handleFileSelect(e.dataTransfer.files);
    });

    document.getElementById("btnUpload").addEventListener("click", function () {
      var files = fileInput.files;
      if (!files || files.length === 0) return;

      var preview = document.getElementById("uploadPreview");
      var count = preview.querySelectorAll(".upload-thumb").length;
      var btn = document.getElementById("btnUpload");
      var original = btn.textContent;
      btn.textContent = "Uploading...";
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        preview.innerHTML = '<div class="upload-success">' + count + ' file(s) staged. Upload will be enabled in Phase 3.</div>';
        preview.classList.add("has-files");
        fileInput.value = "";
      }, 1500);
    });

  });

})();
