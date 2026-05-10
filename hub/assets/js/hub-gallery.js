(function () {

  var galleryId = new URLSearchParams(window.location.search).get("id");
  var galleryData = null;
  var currentIndex = 0;
  var allMedia = [];

  if (!galleryId) {
    document.getElementById("galLoader").innerHTML = '<div class="gal-expired" style="display:flex"><h2>Invalid Gallery</h2><p>No gallery ID provided.</p></div>';
    return;
  }

  var loader = document.getElementById("galLoader");
  var expired = document.getElementById("galExpired");
  var app = document.getElementById("galApp");
  var payOverlay = document.getElementById("galPayOverlay");
  var grid = document.getElementById("galGrid");

  db.collection("galleries").doc(galleryId).get().then(function (doc) {
    if (!doc.exists) {
      loader.style.display = "none";
      expired.style.display = "flex";
      document.getElementById("expiredText").textContent = "This gallery does not exist.";
      return;
    }

    galleryData = doc.data();
    galleryData.id = doc.id;

    var expiresAt = galleryData.expiresAt ? (galleryData.expiresAt.toDate ? galleryData.expiresAt.toDate() : new Date(galleryData.expiresAt)) : null;
    var isExpired = expiresAt && new Date() > expiresAt;

    if (isExpired) {
      loader.style.display = "none";
      expired.style.display = "flex";
      document.getElementById("expiredText").textContent = "This gallery expired on " + expiresAt.toLocaleDateString() + ". Request reactivation below.";
      return;
    }

    loader.style.display = "none";

    var price = galleryData.price || 0;
    var paid = localStorage.getItem("p1_gallery_paid_" + galleryId) === "1";

    if (price > 0 && !paid) {
      showPaymentGate();
    } else {
      showGallery();
    }
  }).catch(function () {
    loader.style.display = "none";
    expired.style.display = "flex";
    document.getElementById("expiredText").textContent = "Error loading gallery. Please try again.";
  });

  function showPaymentGate() {
    var price = galleryData.price || 0;
    document.getElementById("galPayPrice").textContent = "$" + price.toFixed(2);

    var stripeLink = galleryData.stripeLink || "";
    var payBtn = document.getElementById("galPayBtn");
    if (stripeLink) {
      payBtn.href = stripeLink;
    } else {
      payBtn.href = "#";
      payBtn.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Payment link not yet configured. Please contact Phase One Visuals.");
      });
    }

    payOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  document.getElementById("galPayClose").addEventListener("click", function () {
    payOverlay.style.display = "none";
    document.body.style.overflow = "";
    localStorage.setItem("p1_gallery_paid_" + galleryId, "1");
    showGallery();
  });

  document.getElementById("btnReactivate").addEventListener("click", function () {
    alert("Reactivation request sent. Phase One Visuals will contact you shortly.");
    var btn = document.getElementById("btnReactivate");
    btn.textContent = "Request Sent";
    btn.disabled = true;
  });

  function showGallery() {
    app.style.display = "block";
    payOverlay.style.display = "none";
    document.body.style.overflow = "";

    document.getElementById("galClientName").textContent = galleryData.clientName || "Your Photos";

    var photos = galleryData.photos || [];
    var videos = galleryData.videos || [];
    allMedia = photos.concat(videos.map(function (v) {
      v.isVideo = true;
      return v;
    }));

    document.getElementById("galFooterCount").textContent = allMedia.length + " file" + (allMedia.length !== 1 ? "s" : "");

    // NAS link
    if (galleryData.nasLink) {
      document.getElementById("galNasLink").style.display = "block";
      document.getElementById("nasLink").href = galleryData.nasLink;
    }

    // "Download All" links to NAS if available, otherwise #first
    var dlLink = document.getElementById("galFooterDownload");
    if (galleryData.nasLink) {
      dlLink.href = galleryData.nasLink;
    } else if (allMedia.length > 0) {
      dlLink.href = allMedia[0].url;
      dlLink.removeAttribute("download");
    } else {
      dlLink.style.display = "none";
    }

    // Render grid
    renderGrid();

    // Expiry
    renderExpiry();
  }

  function renderGrid() {
    grid.innerHTML = "";
    if (allMedia.length === 0) {
      grid.innerHTML = '<div class="gal-expired" style="display:flex;height:auto;padding:80px 40px"><h2>No media</h2><p>This gallery is empty.</p></div>';
      return;
    }

    allMedia.forEach(function (media, index) {
      var item = document.createElement("div");
      item.className = "gal-grid-item";

      if (media.isVideo) {
        item.innerHTML =
          '<div class="gal-video-thumb">' +
            '<div class="play-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="var(--gold)"><polygon points="8,5 19,12 8,19"/></svg></div>' +
          '</div>' +
          '<div class="grid-overlay"><span class="grid-filename">' + (media.fileName || "") + '</span></div>';
      } else {
        item.innerHTML =
          '<img src="' + media.url + '" alt="' + (media.fileName || "") + '" loading="lazy">' +
          '<div class="grid-overlay"><span class="grid-filename">' + (media.fileName || "") + '</span></div>';
      }

      item.addEventListener("click", function () { openLightbox(index); });
      grid.appendChild(item);
    });
  }

  function renderExpiry() {
    if (!galleryData.expiresAt) return;
    var expiresAt = galleryData.expiresAt.toDate ? galleryData.expiresAt.toDate() : new Date(galleryData.expiresAt);
    var now = new Date();
    var expired = now > expiresAt;
    var bar = document.getElementById("galExpiryBar");
    bar.style.display = "block";

    if (expired) {
      bar.className = "gal-expiry-bar expired";
      bar.innerHTML = 'Gallery expired on ' + expiresAt.toLocaleDateString() + ' — <strong>Request Reactivation</strong>';
      bar.onclick = function () {
        alert("Reactivation request sent. Phase One Visuals will contact you shortly.");
      };
    } else {
      bar.className = "gal-expiry-bar";
      var daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      bar.textContent = daysLeft + " day" + (daysLeft !== 1 ? "s" : "") + " remaining — Photos expire " + expiresAt.toLocaleDateString();
      bar.onclick = null;
    }
  }

  // ─── LIGHTBOX ───
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbVideo = document.getElementById("lbVideo");
  var lbCounter = document.getElementById("lbCounter");
  var lbDownload = document.getElementById("lbDownload");

  function openLightbox(index) {
    if (index < 0 || index >= allMedia.length) return;
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lbImg.style.display = "none";
    lbVideo.style.display = "none";
    lbImg.src = "";
    lbVideo.src = "";
    document.body.style.overflow = "";
  }

  function navigateLightbox(dir) {
    if (allMedia.length === 0) return;
    currentIndex = (currentIndex + dir + allMedia.length) % allMedia.length;
    renderLightbox();
  }

  function renderLightbox() {
    var media = allMedia[currentIndex];
    if (!media) return;

    lbImg.style.display = "none";
    lbVideo.style.display = "none";

    if (media.isVideo) {
      lbVideo.src = media.url;
      lbVideo.style.display = "block";
    } else {
      lbImg.src = media.url;
      lbImg.style.display = "block";
    }

    lbCounter.textContent = (currentIndex + 1) + " / " + allMedia.length;
    lbDownload.href = media.url;
    lbDownload.setAttribute("download", media.fileName || "photo");
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

})();
