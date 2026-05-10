(function () {

  var PASSWORD_HASH = "773cb99a6510c3f991f053cb887a9ab26f3c9618061d32ebfac268a43143aa89";
  var SESSION_KEY = "p1hub_auth";
  var pendingFiles = [];

  function sha256(str) {
    var buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
      return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function showGate() {
    document.getElementById("passGate").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }

  function showApp() {
    document.getElementById("passGate").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadGalleries();
  }

  // ─── PASSWORD ───
  document.getElementById("passForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("passInput");
    var error = document.getElementById("passError");
    var btn = document.getElementById("passBtn");

    sha256(input.value).then(function (hash) {
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, "1");
        showApp();
      } else {
        error.style.display = "block";
        error.classList.remove("shake");
        void error.offsetWidth;
        error.classList.add("shake");
        btn.classList.add("btn-error");
        setTimeout(function () { btn.classList.remove("btn-error"); }, 500);
      }
    });
  });

  document.getElementById("btnLogout").addEventListener("click", function () {
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById("passInput").value = "";
    document.getElementById("passError").style.display = "none";
    showGate();
  });

  // ─── FILE HANDLING ───
  function handleFiles(files) {
    var preview = document.getElementById("uploadPreview");
    preview.innerHTML = "";
    pendingFiles = [];
    if (!files || files.length === 0) return;
    Array.from(files).forEach(function (file, idx) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      pendingFiles.push(file);
      var card = document.createElement("div");
      card.className = "upload-thumb";
      card.setAttribute("data-file-index", pendingFiles.length - 1);
      if (file.type.startsWith("image/")) {
        var reader = new FileReader();
        reader.onload = function (e) {
          card.innerHTML = '<img src="' + e.target.result + '" alt=""><span class="upload-thumb-name">' + file.name + '</span><div class="upload-progress"><div class="upload-progress-bar"></div></div><span class="upload-status"></span>';
        };
        reader.readAsDataURL(file);
      } else {
        card.innerHTML = '<div class="upload-video-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span class="upload-thumb-name">' + file.name + '</span><div class="upload-progress"><div class="upload-progress-bar"></div></div><span class="upload-status"></span>';
      }
      preview.appendChild(card);
    });
  }

  var dropZone = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");

  dropZone.addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () { handleFiles(this.files); });
  dropZone.addEventListener("dragover", function (e) { e.preventDefault(); dropZone.classList.add("drag-over"); });
  dropZone.addEventListener("dragleave", function () { dropZone.classList.remove("drag-over"); });
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });

  // ─── CREATE GALLERY ───
  document.getElementById("btnCreate").addEventListener("click", function () {
    var clientName = document.getElementById("inputClientName").value.trim();
    var clientEmail = document.getElementById("inputClientEmail").value.trim();
    var price = parseFloat(document.getElementById("inputPrice").value) || 0;
    var nasLink = document.getElementById("inputNasLink").value.trim();
    var stripeLink = document.getElementById("inputStripeLink").value.trim();
    var expiryDays = parseInt(document.getElementById("inputExpiry").value) || 180;

    if (!clientName) { alert("Client name is required"); return; }
    if (pendingFiles.length === 0) { alert("Add at least one photo or video"); return; }

    var btn = document.getElementById("btnCreate");
    var result = document.getElementById("createResult");
    result.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Creating...";

    var galleryId = db.collection("galleries").doc().id;
    var expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    var uploads = [];
    var timestamp = Date.now();

    pendingFiles.forEach(function (file, index) {
      var path = "galleries/" + galleryId + "/" + timestamp + "_" + file.name;
      var task = storage.ref(path).put(file);
      var thumb = document.querySelector('.upload-thumb[data-file-index="' + index + '"]');
      var bar = thumb ? thumb.querySelector(".upload-progress-bar") : null;
      var status = thumb ? thumb.querySelector(".upload-status") : null;

      var p = new Promise(function (resolve, reject) {
        task.on("state_changed",
          function (snap) {
            var pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            if (bar) bar.style.width = pct + "%";
          },
          function (err) {
            if (status) { status.textContent = "Failed"; status.className = "upload-status upload-status--error"; }
            reject(err);
          },
          function () {
            task.snapshot.ref.getDownloadURL().then(function (url) {
              if (bar) bar.style.width = "100%";
              if (status) { status.textContent = "Done"; status.className = "upload-status upload-status--done"; }
              resolve({ url: url, fileName: file.name, type: file.type });
            }).catch(reject);
          }
        );
      });
      uploads.push(p);
    });

    Promise.allSettled(uploads).then(function (results) {
      var photos = [];
      var videos = [];
      results.forEach(function (r) {
        if (r.status === "fulfilled") {
          if (r.value.type.startsWith("video/")) videos.push(r.value);
          else photos.push(r.value);
        }
      });

      db.collection("galleries").doc(galleryId).set({
        clientName: clientName,
        clientEmail: clientEmail,
        price: price,
        nasLink: nasLink,
        stripeLink: stripeLink,
        photos: photos,
        videos: videos,
        expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "active"
      }).then(function () {
        var galleryUrl = window.location.origin + "/hub/gallery.html?id=" + galleryId;
        result.className = "create-result success";
        result.innerHTML = 'Gallery created! <a href="' + galleryUrl + '" target="_blank">' + galleryUrl + '</a>';
        result.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Create Gallery";
        pendingFiles = [];
        document.getElementById("uploadPreview").innerHTML = "";
        fileInput.value = "";
        loadGalleries();
      }).catch(function (err) {
        alert("Error saving gallery: " + err.message);
        btn.disabled = false;
        btn.textContent = "Create Gallery";
      });
    });
  });

  // ─── LOAD GALLERIES ───
  function loadGalleries() {
    db.collection("galleries").orderBy("createdAt", "desc").get().then(function (snap) {
      var list = document.getElementById("galleryList");
      var empty = document.getElementById("emptyState");
      list.innerHTML = "";

      if (snap.empty) {
        list.style.display = "none";
        empty.style.display = "block";
        return;
      }

      list.style.display = "grid";
      empty.style.display = "none";

      snap.forEach(function (doc) {
        var g = doc.data();
        g.id = doc.id;
        var expiresAt = g.expiresAt ? (g.expiresAt.toDate ? g.expiresAt.toDate() : new Date(g.expiresAt)) : null;
        var expired = expiresAt && new Date() > expiresAt;
        var status = expired ? "expired" : g.status || "active";
        var photoCount = (g.photos || []).length + (g.videos || []).length;
        var galleryUrl = window.location.origin + "/hub/gallery.html?id=" + g.id;

        var card = document.createElement("div");
        card.className = "gallery-list-card";
        card.innerHTML =
          '<div class="gallery-list-card-header">' +
            '<h3>' + (g.clientName || "Untitled") + '</h3>' +
            '<span class="gallery-list-status ' + status + '">' + status + '</span>' +
          '</div>' +
          '<p class="gallery-list-meta"><span>' + photoCount + '</span> files' + (g.price ? ' · <span>$' + g.price.toFixed(2) + '</span>' : ' · Free') + '</p>' +
          '<p class="gallery-list-meta">' + (g.clientEmail || "") + '</p>' +
          '<div class="gallery-list-actions">' +
            '<button class="gal-btn gal-btn-copy" data-url="' + galleryUrl + '">Copy Link</button>' +
            '<a class="gal-btn gal-btn-preview" href="' + galleryUrl + '" target="_blank">Preview</a>' +
            '<button class="gal-btn gal-btn-delete" data-id="' + g.id + '">Delete</button>' +
          '</div>';
        list.appendChild(card);
      });

      document.querySelectorAll(".gal-btn-copy").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var url = this.dataset.url;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
              btn.textContent = "Copied!";
              setTimeout(function () { btn.textContent = "Copy Link"; }, 2000);
            });
          } else {
            var tmp = document.createElement("input");
            tmp.value = url;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand("copy");
            document.body.removeChild(tmp);
            btn.textContent = "Copied!";
            setTimeout(function () { btn.textContent = "Copy Link"; }, 2000);
          }
        });
      });

      document.querySelectorAll(".gal-btn-delete").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (confirm("Delete this gallery? This cannot be undone.")) {
            db.collection("galleries").doc(this.dataset.id).delete().then(function () {
              loadGalleries();
            });
          }
        });
      });
    });
  }

  // ─── INIT ───
  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    showApp();
  }

})();
