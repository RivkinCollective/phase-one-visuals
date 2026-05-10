(function () {

  const PASSWORD_HASH = "773cb99a6510c3f991f053cb887a9ab26f3c9618061d32ebfac268a43143aa89";
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

  var pendingFiles = [];

  function handleFileSelect(files) {
    var preview = document.getElementById("uploadPreview");
    preview.innerHTML = "";
    pendingFiles = [];
    if (!files || files.length === 0) {
      preview.classList.remove("has-files");
      return;
    }
    preview.classList.add("has-files");
    Array.from(files).forEach(function (file, idx) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      pendingFiles.push(file);
      var card = document.createElement("div");
      card.className = "upload-thumb";
      card.setAttribute("data-file-index", pendingFiles.length - 1);
      if (file.type.startsWith("image/")) {
        var reader = new FileReader();
        reader.onload = function (e) {
          card.innerHTML = '<img src="' + e.target.result + '" alt="' + file.name + '"><span class="upload-thumb-name">' + file.name + '</span><div class="upload-progress"><div class="upload-progress-bar"></div></div><span class="upload-status"></span>';
        };
        reader.readAsDataURL(file);
      } else {
        card.innerHTML = '<div class="upload-video-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span class="upload-thumb-name">' + file.name + '</span><div class="upload-progress"><div class="upload-progress-bar"></div></div><span class="upload-status"></span>';
      }
      preview.appendChild(card);
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

      if (!input || !input.value) return;

      function handleSuccess() {
        sessionStorage.setItem(SESSION_KEY, "1");
        showUnlockedState();
        setTimeout(function () { renderAllPackages(); window._packagesRendered = true; }, 600);
      }

      function handleFailure() {
        errorEl.style.display = "block";
        errorEl.classList.remove("shake");
        void errorEl.offsetWidth;
        errorEl.classList.add("shake");
        submitBtn.classList.add("btn-error");
        setTimeout(function () { submitBtn.classList.remove("btn-error"); }, 600);
      }

      // Try SHA-256; fall back to plaintext if crypto API unavailable
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        sha256(input.value).then(function (hash) {
          if (hash === PASSWORD_HASH) {
            handleSuccess();
          } else {
            handleFailure();
          }
        }).catch(function () {
          // crypto failed — fall back to plaintext
          if (input.value === "Benson123!") {
            handleSuccess();
          } else {
            handleFailure();
          }
        });
      } else {
        if (input.value === "Benson123!") {
          handleSuccess();
        } else {
          handleFailure();
        }
      }
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
      if (pendingFiles.length === 0) return;

      var btn = document.getElementById("btnUpload");
      var original = btn.textContent;
      btn.textContent = "Uploading...";
      btn.disabled = true;

      var projectId = (document.getElementById("projectNameInput") ? document.getElementById("projectNameInput").value.trim() : "") || "default";
      var timestamp = Date.now();
      var uploadPromises = [];

      pendingFiles.forEach(function (file, index) {
        var path = "projects/" + projectId + "/" + timestamp + "_" + file.name;
        var uploadTask = storage.ref(path).put(file);

        var thumb = document.querySelector('.upload-thumb[data-file-index="' + index + '"]');
        var progressBar = thumb ? thumb.querySelector(".upload-progress-bar") : null;
        var statusEl = thumb ? thumb.querySelector(".upload-status") : null;

        var promise = new Promise(function (resolve, reject) {
          uploadTask.on("state_changed",
            function (snapshot) {
              var pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (progressBar) progressBar.style.width = pct + "%";
            },
            function (error) {
              if (statusEl) { statusEl.textContent = "Failed"; statusEl.className = "upload-status upload-status--error"; }
              reject(error);
            },
            function () {
              uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
                if (progressBar) progressBar.style.width = "100%";
                if (statusEl) { statusEl.textContent = "Done"; statusEl.className = "upload-status upload-status--done"; }
                db.collection("hub_media").add({
                  fileName: file.name,
                  url: url,
                  contentType: file.type,
                  size: file.size,
                  projectId: projectId,
                  uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () { resolve(url); }).catch(function () { resolve(url); });
              }).catch(function (err) { reject(err); });
            }
          );
        });

        uploadPromises.push(promise);
      });

      Promise.allSettled(uploadPromises).then(function (results) {
        var succeeded = results.filter(function (r) { return r.status === "fulfilled"; }).length;
        var failed = results.filter(function (r) { return r.status === "rejected"; }).length;
        btn.textContent = original;
        btn.disabled = false;
        var msg = succeeded + " file(s) uploaded successfully";
        if (failed > 0) msg += ", " + failed + " failed";
        var summary = document.createElement("div");
        summary.className = "upload-success";
        summary.textContent = msg;
        document.getElementById("uploadPreview").appendChild(summary);
        pendingFiles = [];
        fileInput.value = "";
      });
    });

    // ─── PROJECT MANAGEMENT ───
    var projectModal = document.getElementById("projectModal");
    var editingProjectId = null;

    function openProjectModal(project) {
      editingProjectId = project ? project.id : null;
      document.getElementById("projectModalTitle").textContent = project ? "Edit Project" : "New Project";
      document.getElementById("btnSaveProject").textContent = project ? "Save Changes" : "Create Project";
      document.getElementById("inputProjectName").value = project ? project.name || "" : "";
      document.getElementById("inputClientName").value = project ? project.clientName || "" : "";
      document.getElementById("inputClientEmail").value = project ? project.clientEmail || "" : "";
      document.getElementById("inputProjectPrice").value = project ? project.price || 0 : 0;
      document.getElementById("inputProjectExpiry").value = project ? project.expiryDays || 180 : 180;
      document.getElementById("inputStripeLink").value = project ? project.stripeLink || "" : "";
      projectModal.style.display = "flex";
    }

    function closeProjectModal() {
      projectModal.style.display = "none";
      editingProjectId = null;
    }

    function loadProjects() {
      db.collection("hub_projects").orderBy("createdAt", "desc").get().then(function (snapshot) {
        var list = document.getElementById("projectsList");
        var empty = document.getElementById("projectsEmpty");

        if (snapshot.empty) {
          list.innerHTML = "";
          list.style.display = "none";
          empty.style.display = "block";
          return;
        }

        empty.style.display = "none";
        list.style.display = "grid";
        list.innerHTML = "";

        snapshot.forEach(function (doc) {
          var p = doc.data();
          p.id = doc.id;
          var expiresAt = p.expiresAt ? (p.expiresAt.toDate ? p.expiresAt.toDate() : new Date(p.expiresAt)) : null;
          var expired = expiresAt && new Date() > expiresAt;
          var status = expired ? "expired" : (p.status || "active");
          var statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

          var card = document.createElement("div");
          card.className = "project-row";
          card.innerHTML =
            '<div class="project-row-header">' +
              '<span class="project-row-name">' + (p.name || "Untitled") + '</span>' +
              '<span class="project-row-status ' + status + '">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="project-row-meta">' +
              '<div class="project-meta-item"><strong>Client</strong>' + (p.clientName || "—") + '</div>' +
              '<div class="project-meta-item"><strong>Email</strong>' + (p.clientEmail || "—") + '</div>' +
              '<div class="project-meta-item"><strong>Price</strong>' + (p.price ? "$" + p.price.toFixed(2) : "Free") + '</div>' +
              '<div class="project-meta-item"><strong>Photos</strong>' + (p.photos ? p.photos.length : 0) + '</div>' +
            '</div>' +
            '<div class="project-row-actions">' +
              '<button class="project-action-btn edit-project" data-id="' + p.id + '">Edit</button>' +
              '<button class="project-action-btn danger delete-project" data-id="' + p.id + '">Delete</button>' +
            '</div>';

          list.appendChild(card);
        });

        document.querySelectorAll(".edit-project").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var id = this.dataset.id;
            db.collection("hub_projects").doc(id).get().then(function (d) {
              if (d.exists) openProjectModal({ id: id, ...d.data() });
            });
          });
        });

        document.querySelectorAll(".delete-project").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var id = this.dataset.id;
            if (confirm("Delete this project? This cannot be undone.")) {
              db.collection("hub_projects").doc(id).delete().then(function () {
                loadProjects();
              });
            }
          });
        });
      }).catch(function () {
        document.getElementById("projectsEmpty").style.display = "block";
        document.getElementById("projectsList").style.display = "none";
      });
    }

    document.getElementById("btnNewProject").addEventListener("click", function () { openProjectModal(null); });
    document.getElementById("btnNewProjectEmpty").addEventListener("click", function () { openProjectModal(null); });
    document.getElementById("btnCloseProjectModal").addEventListener("click", closeProjectModal);
    document.getElementById("btnCancelProject").addEventListener("click", closeProjectModal);

    document.getElementById("btnSaveProject").addEventListener("click", function () {
      var btn = document.getElementById("btnSaveProject");
      btn.disabled = true;
      btn.textContent = "Saving...";

      var name = document.getElementById("inputProjectName").value.trim();
      var clientName = document.getElementById("inputClientName").value.trim();
      var clientEmail = document.getElementById("inputClientEmail").value.trim();
      var price = parseFloat(document.getElementById("inputProjectPrice").value) || 0;
      var expiryDays = parseInt(document.getElementById("inputProjectExpiry").value) || 0;
      var stripeLink = document.getElementById("inputStripeLink").value.trim();

      if (!name) { alert("Project name is required"); btn.disabled = false; btn.textContent = editingProjectId ? "Save Changes" : "Create Project"; return; }

      var projectData = {
        name: name,
        clientName: clientName,
        clientEmail: clientEmail,
        price: price,
        expiryDays: expiryDays,
        stripeLink: stripeLink,
        status: "active",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (expiryDays > 0) {
        var exp = new Date();
        exp.setDate(exp.getDate() + expiryDays);
        projectData.expiresAt = firebase.firestore.Timestamp.fromDate(exp);
      }

      var savePromise;
      if (editingProjectId) {
        savePromise = db.collection("hub_projects").doc(editingProjectId).update(projectData);
      } else {
        projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        projectData.photos = [];
        savePromise = db.collection("hub_projects").add(projectData);
      }

      savePromise.then(function (ref) {
        var projectId = editingProjectId || (ref.id || "");

        if (clientEmail) {
          db.collection("hub_clients").where("email", "==", clientEmail).limit(1).get().then(function (snap) {
            if (snap.empty) {
              db.collection("hub_clients").add({
                email: clientEmail,
                name: clientName,
                projectIds: [projectId],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            } else {
              var clientDoc = snap.docs[0];
              var ids = clientDoc.data().projectIds || [];
              if (ids.indexOf(projectId) === -1) {
                ids.push(projectId);
                clientDoc.ref.update({ projectIds: ids, name: clientName || clientDoc.data().name });
              }
            }
          }).catch(function () {});
        }

        if (stripeLink) HubPayment.setStripeLink(stripeLink);

        closeProjectModal();
        loadProjects();
        btn.disabled = false;
        btn.textContent = editingProjectId ? "Save Changes" : "Create Project";
      }).catch(function (err) {
        alert("Error saving project: " + err.message);
        btn.disabled = false;
        btn.textContent = editingProjectId ? "Save Changes" : "Create Project";
      });
    });

    projectModal.addEventListener("click", function (e) {
      if (e.target === projectModal) closeProjectModal();
    });

    // Load projects when tab is switched to
    var origSwitchTab = switchTab;
    switchTab = function (tabId) {
      origSwitchTab(tabId);
      if (tabId === "projects") loadProjects();
    };

  });

})();
