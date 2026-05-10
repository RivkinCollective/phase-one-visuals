(function () {

  var currentPhotos = [];
  var currentIndex = 0;
  var currentProject = null;

  // ─── DOM refs ───
  var gateEl = document.getElementById("galleryGate");
  var appEl = document.getElementById("galleryApp");
  var emailForm = document.getElementById("emailForm");
  var emailInput = document.getElementById("emailInput");
  var emailError = document.getElementById("emailError");
  var emailSent = document.getElementById("emailSent");
  var emailSubmit = document.getElementById("emailSubmit");
  var projectsEl = document.getElementById("galleryProjects");
  var gridEl = document.getElementById("galleryGrid");
  var emptyEl = document.getElementById("galleryEmpty");
  var expiryEl = document.getElementById("galleryExpiry");
  var clientEmailEl = document.getElementById("clientEmail");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxVideo = document.getElementById("lightboxVideo");
  var lightboxCounter = document.getElementById("lightboxCounter");
  var lightboxDownload = document.getElementById("lightboxDownload");

  // ─── SHOW / HIDE ───
  function showGate() {
    gateEl.style.display = "flex";
    appEl.style.display = "none";
  }

  function showApp() {
    gateEl.style.display = "none";
    appEl.style.display = "flex";
  }

  // ─── MAGIC LINK AUTH ───
  emailForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    if (!email) return;

    emailError.style.display = "none";
    emailSent.style.display = "none";
    emailSubmit.disabled = true;
    emailSubmit.textContent = "Sending...";

    var actionCodeSettings = {
      url: window.location.origin + "/hub/gallery.html",
      handleCodeInApp: true
    };

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
      .then(function () {
        window.localStorage.setItem("emailForSignIn", email);
        emailSent.style.display = "block";
        emailSubmit.textContent = "Send Magic Link";
        emailSubmit.disabled = false;
      })
      .catch(function (error) {
        emailError.textContent = error.message || "Failed to send link. Try again.";
        emailError.style.display = "block";
        emailSubmit.textContent = "Send Magic Link";
        emailSubmit.disabled = false;
      });
  });

  // ─── COMPLETE SIGN-IN ───
  function completeEmailSignIn() {
    if (!auth.isSignInWithEmailLink(window.location.href)) return false;

    var email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      email = window.prompt("Please enter your email to confirm sign-in:");
      if (!email) return false;
    }

    auth.signInWithEmailLink(email, window.location.href)
      .then(function () {
        window.localStorage.removeItem("emailForSignIn");
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch(function (error) {
        emailError.textContent = "Sign-in failed. Request a new link.";
        emailError.style.display = "block";
      });

    return true;
  }

  // ─── LOAD CLIENT DATA ───
  function loadClientData(user) {
    clientEmailEl.textContent = user.email;

    db.collection("hub_clients").where("email", "==", user.email).limit(1).get()
      .then(function (snapshot) {
        if (snapshot.empty) {
          showNoProjects();
          return;
        }

        var clientDoc = snapshot.docs[0];
        var projectIds = clientDoc.data().projectIds || [];

        if (projectIds.length === 0) {
          showNoProjects();
          return;
        }

        loadProjects(projectIds);
      })
      .catch(function () {
        showNoProjects();
      });
  }

  function showNoProjects() {
    projectsEl.innerHTML = "";
    gridEl.innerHTML = "";
    projectsEl.style.display = "none";
    gridEl.style.display = "none";
    emptyEl.style.display = "block";
    expiryEl.style.display = "none";
  }

  function loadProjects(projectIds) {
    var promises = projectIds.map(function (id) {
      return db.collection("hub_projects").doc(id).get();
    });

    Promise.all(promises).then(function (docs) {
      var projects = [];
      docs.forEach(function (doc) {
        if (doc.exists) {
          projects.push({ id: doc.id, ...doc.data() });
        }
      });

      if (projects.length === 0) {
        showNoProjects();
        return;
      }

      emptyEl.style.display = "none";
      renderProjects(projects);
    }).catch(function () {
      showNoProjects();
    });
  }

  function renderProjects(projects) {
    projectsEl.style.display = "grid";
    projectsEl.innerHTML = "";

    projects.forEach(function (project) {
      var photos = project.photos || [];
      var previewUrl = photos.length > 0 ? photos[0].url || photos[0] : null;
      var photoCount = photos.length;

      var card = document.createElement("div");
      card.className = "gallery-project-card";

      var previewHtml = "";
      if (previewUrl && typeof previewUrl === "string") {
        previewHtml = '<img src="' + previewUrl + '" alt="' + (project.name || "") + '" loading="lazy">';
      } else if (previewUrl && previewUrl.url) {
        previewHtml = '<img src="' + previewUrl.url + '" alt="' + (project.name || "") + '" loading="lazy">';
      } else {
        previewHtml = '<svg class="preview-fallback" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      }

      card.innerHTML =
        '<div class="gallery-project-card-preview">' + previewHtml + '</div>' +
        '<div class="gallery-project-card-body">' +
          '<h3>' + (project.name || "Untitled Project") + '</h3>' +
          '<p>' + (project.description || "") + '</p>' +
          '<span class="photo-count">' + photoCount + ' photo' + (photoCount !== 1 ? "s" : "") + '</span>' +
        '</div>';

      card.addEventListener("click", function () {
        currentProject = project;
        openProjectGallery(project);
      });

      projectsEl.appendChild(card);
    });
  }

  function openProjectGallery(project) {
    projectsEl.style.display = "none";
    gridEl.style.display = "columns";

    var photos = (project.photos || []).map(function (p) {
      if (typeof p === "string") return { url: p, fileName: p.split("/").pop().split("?")[0] };
      return p;
    });

    currentPhotos = photos;

    var currentEmail = auth.currentUser ? auth.currentUser.email : "";

    if (project.price && project.price > 0) {
      HubPayment.checkProjectPayment(project.clientId || currentEmail, project.id)
        .then(function (paid) {
          if (!paid) {
            showPaymentGate(project);
            return;
          }
          renderGallery();
        })
        .catch(function () {
          showPaymentGate(project);
        });
    } else {
      renderGallery();
    }

    function renderGallery() {
      document.getElementById("paymentOverlay").style.display = "none";
      if (photos.length === 0) {
        gridEl.innerHTML = "";
        return;
      }
      gridEl.innerHTML = "";
      photos.forEach(function (photo, index) {
        var item = document.createElement("div");
        item.className = "gallery-grid-item";
        item.innerHTML =
          '<img src="' + photo.url + '" alt="' + (photo.fileName || "") + '" loading="lazy">' +
          '<div class="grid-item-overlay"><span class="grid-item-filename">' + (photo.fileName || "") + '</span></div>';
        item.addEventListener("click", function () { openLightbox(index); });
        gridEl.appendChild(item);
      });
    }

    function showPaymentGate(project) {
      document.getElementById("paymentOverlay").style.display = "flex";
      document.getElementById("paymentPrice").textContent = "$" + project.price.toFixed(2);
      var link = HubPayment.getStripeLink();
      var payBtn = document.getElementById("paymentBtn");
      if (link) {
        payBtn.href = link + "?client_reference_id=" + encodeURIComponent(currentEmail) + "&metadata[projectId]=" + encodeURIComponent(project.id);
      } else {
        payBtn.href = "#";
        payBtn.addEventListener("click", function (e) {
          e.preventDefault();
          alert("Payment gateway not yet configured. Please contact us to set up payment.");
        });
      }
      if (photos.length > 0) {
        gridEl.innerHTML = "";
        photos.slice(0, 4).forEach(function (photo) {
          var item = document.createElement("div");
          item.className = "gallery-grid-item";
          item.style.opacity = "0.3";
          item.style.pointerEvents = "none";
          item.innerHTML = '<img src="' + photo.url + '" alt="" loading="lazy">';
          gridEl.appendChild(item);
        });
      }
    }

    renderExpiry(project);
  }

  function renderExpiry(project) {
    if (!project.expiresAt) return;

    var expiresAt = project.expiresAt.toDate ? project.expiresAt.toDate() : new Date(project.expiresAt);
    var now = new Date();
    var expired = now > expiresAt;

    expiryEl.style.display = "block";

    if (expired) {
      expiryEl.className = "gallery-expiry expired";
      expiryEl.innerHTML = 'Gallery expired on ' + expiresAt.toLocaleDateString() + ' — <strong>Request Reactivation</strong>';
    } else {
      expiryEl.className = "gallery-expiry";
      var daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      expiryEl.textContent = daysLeft + " day" + (daysLeft !== 1 ? "s" : "") + " remaining — Photos expire " + expiresAt.toLocaleDateString();
    }

    expiryEl.onclick = function () {
      alert("Reactivation request sent. We'll contact you shortly.");
    };
  }

  // ─── LIGHTBOX ───
  function openLightbox(index) {
    if (index < 0 || index >= currentPhotos.length) return;
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.style.display = "none";
    lightboxVideo.style.display = "none";
    lightboxImg.src = "";
    lightboxVideo.src = "";
    document.body.style.overflow = "";
  }

  function navigateLightbox(direction) {
    if (currentPhotos.length === 0) return;
    currentIndex = (currentIndex + direction + currentPhotos.length) % currentPhotos.length;
    renderLightbox();
  }

  function renderLightbox() {
    var photo = currentPhotos[currentIndex];
    if (!photo) return;

    var url = photo.url;
    var isVideo = /\.(mp4|webm|mov)/i.test(url);

    lightboxImg.style.display = "none";
    lightboxVideo.style.display = "none";

    if (isVideo) {
      lightboxVideo.src = url;
      lightboxVideo.style.display = "block";
    } else {
      lightboxImg.src = url;
      lightboxImg.style.display = "block";
    }

    lightboxCounter.textContent = (currentIndex + 1) + " / " + currentPhotos.length;
    lightboxDownload.href = url;
    lightboxDownload.setAttribute("download", photo.fileName || "photo");
  }

  document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  document.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);
  document.querySelector(".lightbox-prev").addEventListener("click", function () { navigateLightbox(-1); });
  document.querySelector(".lightbox-next").addEventListener("click", function () { navigateLightbox(1); });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });

  // ─── LOGOUT ───
  document.getElementById("btnGalleryLogout").addEventListener("click", function () {
    auth.signOut().then(function () {
      showGate();
      window.localStorage.removeItem("emailForSignIn");
    });
  });

  // ─── INIT ───
  auth.onAuthStateChanged(function (user) {
    if (user) {
      showApp();
      loadClientData(user);
    } else {
      if (!completeEmailSignIn()) {
        showGate();
      }
    }
  });

})();
