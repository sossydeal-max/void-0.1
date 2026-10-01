document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const TRACKS = Array.isArray(window.TRACKS) ? window.TRACKS : [];
  const $ = (id) => document.getElementById(id);

  const audio = new Audio();
  audio.volume = 0.8;
  let currentIndex = -1;
  let pendingTrackIndex = -1;

  const els = {
    now: $("nowTitle"),
    time: $("time"),
    progress: $("progress"),
    play: $("play"),
    prev: $("prev"),
    next: $("next"),
    volume: $("volume"),
    search: $("search"),
    cartBtn: $("cartBtn"),
    cartCount: $("cartCount"),
    cartItems: $("cartItems"),
    cartEmpty: $("cartEmpty"),
    cartStatus: $("cartStatus"),
    cartTotal: $("cartTotal"),
    checkout: $("checkoutBtn"),
    licensePicker: $("licensePicker"),
    pickerClose: $("pickerClose"),
    pickerTrack: $("pickerTrack"),
    cartModal: $("cartModal")
  };

  const LICENSES = {
    basic: {
      name: "Basic",
      price: 30,
      source: "Common current lease structure: MP3 delivery, non-exclusive use, limited distribution.",
      items: [
        "MP3 beat file",
        "Non-exclusive license — the beat can still be licensed to other artists",
        "One new song based on the beat",
        "Commercial release subject to the limits written in the final agreement",
        "Producer credit required",
        "No stems / trackouts"
      ]
    },
    premium: {
      name: "Premium",
      price: 50,
      source: "Common current mid-tier lease structure: higher usage limits and higher-quality files.",
      items: [
        "MP3 + WAV",
        "Non-exclusive license",
        "One new song based on the beat",
        "Higher distribution / streaming allowance than Basic",
        "Commercial release and monetization subject to the final agreement",
        "Producer credit required"
      ]
    },
    stems: {
      name: "Stems Premium",
      price: 100,
      source: "Current market examples commonly include MP3 + WAV + trackout stems at this tier.",
      items: [
        "MP3 + WAV + trackout stems",
        "Non-exclusive license",
        "One new song based on the beat",
        "Expanded commercial use and distribution limits",
        "Stems supplied for mixing / mastering",
        "Producer credit required"
      ]
    },
    unlimited: {
      name: "Unlimited",
      price: 150,
      source: "Common current unlimited-lease structure: no numeric streaming/distribution cap while remaining non-exclusive.",
      items: [
        "MP3 + WAV + stems",
        "Non-exclusive license",
        "Unlimited streaming / distribution under the agreement",
        "Unlimited digital use of the resulting song",
        "Commercial monetization permitted subject to the final agreement",
        "Producer credit required"
      ]
    }
  };

  const CART_KEY = "void_xg_cart_v14";
  let cart = [];

  try {
    const saved = localStorage.getItem(CART_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    cart = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    cart = [];
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
  }

  function fmt(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n)) return "0:00";
    return Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0");
  }

  function openLicensePicker(index) {
    if (!TRACKS[index] || !els.licensePicker) return;
    pendingTrackIndex = index;
    els.pickerTrack.textContent = TRACKS[index].title || "Selected beat";
    els.licensePicker.classList.add("open");
    els.licensePicker.setAttribute("aria-hidden", "false");
  }

  function closeLicensePicker() {
    if (!els.licensePicker) return;
    els.licensePicker.classList.remove("open");
    els.licensePicker.setAttribute("aria-hidden", "true");
    pendingTrackIndex = -1;
  }

  function addSelectedBeatToCart(licenseKey) {
    if (pendingTrackIndex < 0) return;
    const track = TRACKS[pendingTrackIndex];
    const license = LICENSES[licenseKey];
    if (!track || !license) return;

    cart.push({
      track: {
        id: track.id,
        title: track.title,
        file: track.file,
        duration: track.duration,
        bpm: track.bpm,
        key: track.key,
        tags: track.tags
      },
      license: licenseKey
    });

    saveCart();
    renderCart("ADDED · " + track.title + " · " + license.name);
    closeLicensePicker();
    // Deliberately stay on the catalog page.
  }

  function renderCart(status = "") {
    if (!els.cartItems) return;

    els.cartItems.innerHTML = "";
    if (els.cartStatus) els.cartStatus.textContent = status;

    els.cartCount.textContent = String(cart.length);

    if (!cart.length) {
      els.cartEmpty.style.display = "block";
      els.cartTotal.textContent = "$0";
      els.checkout.disabled = true;
      els.checkout.style.opacity = ".45";
      return;
    }

    els.cartEmpty.style.display = "none";
    els.checkout.disabled = false;
    els.checkout.style.opacity = "1";

    const line = document.createElement("div");
    line.className = "cart-count-line";
    line.innerHTML =
      "<span>" + cart.length + " ITEM" + (cart.length === 1 ? "" : "S") +
      "</span><span>YOUR SELECTION</span>";
    els.cartItems.appendChild(line);

    let total = 0;

    cart.forEach((item, index) => {
      const t = item.track || {};
      const license = LICENSES[item.license] || LICENSES.basic;
      total += license.price;

      const card = document.createElement("article");
      card.className = "cart-item";
      card.innerHTML = `
        <div class="cart-art"><span></span></div>
        <div class="cart-product">
          <strong class="cart-title"></strong>
          <div class="cart-meta">
            <span>${t.bpm || "—"} BPM</span>
            <span>${fmt(t.duration)}</span>
            <span>${t.tags || "VOID"}</span>
          </div>
          <div class="cart-license-label">LICENSE · ${license.name}</div>
        </div>
        <div class="cart-side">
          <strong>$${license.price}</strong>
          <button class="cart-preview" type="button">PREVIEW</button>
          <button class="cart-remove" type="button">REMOVE</button>
        </div>
      `;

      card.querySelector(".cart-title").textContent = t.title || "Untitled beat";
      card.querySelector(".cart-art span").textContent = t.title || "VOID";

      card.querySelector(".cart-preview").addEventListener("click", () => {
        const i = TRACKS.findIndex(x => String(x.id) === String(t.id));
        if (i >= 0) {
          loadTrack(i, true);
          history.pushState("", document.title, window.location.pathname + window.location.search);
        }
      });

      card.querySelector(".cart-remove").addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        renderCart("REMOVED");
      });

      els.cartItems.appendChild(card);
    });

    els.cartTotal.textContent = "$" + total;
  }

  function loadTrack(index, autoplay = false) {
    const track = TRACKS[index];
    if (!track) return;

    currentIndex = index;
    audio.pause();
    audio.src = track.file;
    audio.load();

    if (els.now) els.now.textContent = track.title;
    if (els.time) els.time.textContent = "0:00 / " + fmt(track.duration);
    if (els.progress) els.progress.value = 0;

    document.querySelectorAll(".track-row").forEach(row => {
      row.classList.toggle("active", Number(row.dataset.i) === index);
    });

    if (autoplay) audio.play().catch(() => {});
  }

  // IMPORTANT: ADD only opens the license picker.
  document.querySelectorAll(".track-row").forEach(row => {
    const index = Number(row.dataset.i);
    const addButton = row.querySelector('[data-action="add-to-cart"], .add');
    const playButton = row.querySelector(".track-play");

    if (addButton) {
      addButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLicensePicker(index);
      });
    }

    if (playButton) {
      playButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        loadTrack(index, true);
      });
    }

    row.addEventListener("click", (event) => {
      if (event.target.closest(".add") || event.target.closest('[data-action="add-to-cart"]')) return;
      if (event.target.closest(".track-play")) return;
      loadTrack(index, true);
    });
  });

  // License choice: this is the ONLY place where the beat enters the cart.
  document.querySelectorAll(".picker-option").forEach(option => {
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const key = option.dataset.license;
      if (key === "exclusive") {
        closeLicensePicker();
        window.open("https://t.me/rollingloudmgmt", "_blank");
        return;
      }

      addSelectedBeatToCart(key);
    });
  });

  els.pickerClose?.addEventListener("click", closeLicensePicker);

  els.licensePicker?.addEventListener("click", (event) => {
    if (event.target === els.licensePicker) closeLicensePicker();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLicensePicker();
  });

  // CART is opened by #cartModal, not by ADD.
  els.cartBtn?.addEventListener("click", () => renderCart());

  // Player.
  els.play?.addEventListener("click", () => {
    if (currentIndex < 0) loadTrack(0, true);
    else if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });
  els.prev?.addEventListener("click", () => {
    if (TRACKS.length) loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, true);
  });
  els.next?.addEventListener("click", () => {
    if (TRACKS.length) loadTrack((currentIndex + 1) % TRACKS.length, true);
  });
  audio.addEventListener("play", () => { if (els.play) els.play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { if (els.play) els.play.textContent = "▶"; });
  audio.addEventListener("timeupdate", () => {
    if (els.progress) els.progress.value = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    if (els.time) els.time.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration || (TRACKS[currentIndex] || {}).duration || 0);
  });
  audio.addEventListener("ended", () => {
    if (TRACKS.length) loadTrack((currentIndex + 1) % TRACKS.length, true);
  });
  els.progress?.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = Number(els.progress.value) / 100 * audio.duration;
  });
  els.volume?.addEventListener("input", () => { audio.volume = Number(els.volume.value); });

  // Search.
  els.search?.addEventListener("input", () => {
    const query = els.search.value.toLowerCase().trim();
    document.querySelectorAll(".track-row").forEach(row => {
      const t = TRACKS[Number(row.dataset.i)] || {};
      const hay = ((t.title || "") + " " + (t.tags || "")).toLowerCase();
      row.style.display = !query || hay.includes(query) ? "grid" : "none";
    });
  });

  // Checkout.
  els.checkout?.addEventListener("click", () => {
    if (!cart.length) return;
    alert("Demo checkout: the selected beat + license are ready for payment. Connect Stripe, ЮKassa or another payment provider for real checkout.");
  });

  // Public API for future payment integration.
  window.VOIDCart = {
    open: () => { window.location.hash = "cartModal"; renderCart(); },
    add: addSelectedBeatToCart,
    chooseLicense: openLicensePicker,
    getItems: () => cart.slice(),
    render: renderCart
  };

  renderCart();
});

const LICENSE_INFO = {
  "Basic": {
    price: "$30",
    subtitle: "NON-EXCLUSIVE · MP3 LEASE",
    sections: [
      ["FILES", ["MP3"]],
      ["RIGHTS", [
        "Use the beat in one new song.",
        "Commercial release on streaming platforms and social media.",
        "Live performance and promotional use.",
        "Monetization of the finished song is permitted within the limits below."
      ]],
      ["LIMITS", [
        "Up to 100,000 streams.",
        "Up to 5,000 paid/download copies.",
        "1 music video."
      ]],
      ["NOT INCLUDED", [
        "WAV or stems.",
        "Exclusive rights.",
        "Resale or transfer of the beat itself."
      ]]
    ]
  },
  "Premium": {
    price: "$50",
    subtitle: "NON-EXCLUSIVE · MP3 + WAV",
    sections: [
      ["FILES", ["MP3", "WAV"]],
      ["RIGHTS", [
        "Use the beat in one new song.",
        "Commercial release and monetization.",
        "Streaming platforms, social media and live performance.",
        "Monetized music video use."
      ]],
      ["LIMITS", [
        "Up to 500,000 streams.",
        "Up to 10,000 paid/download copies.",
        "Up to 2 music videos."
      ]],
      ["NOT INCLUDED", [
        "Stems.",
        "Exclusive rights.",
        "Resale or transfer of the beat itself."
      ]]
    ]
  },
  "Stems Premium": {
    price: "$100",
    subtitle: "NON-EXCLUSIVE · MP3 + WAV + STEMS",
    sections: [
      ["FILES", ["MP3", "WAV", "STEMS"]],
      ["RIGHTS", [
        "Use the beat in one new song.",
        "Full commercial release and monetization.",
        "Streaming platforms, social media and live performance.",
        "Monetized music videos.",
        "Access to stems for mixing and production."
      ]],
      ["LIMITS", [
        "Up to 1,000,000 streams.",
        "Up to 50,000 paid/download copies.",
        "Up to 3 music videos."
      ]],
      ["NOT INCLUDED", [
        "Exclusive rights or ownership of the instrumental.",
        "Resale or transfer of the beat itself."
      ]]
    ]
  },
  "Unlimited": {
    price: "$150",
    subtitle: "NON-EXCLUSIVE · MP3 + WAV + STEMS",
    sections: [
      ["FILES", ["MP3", "WAV", "STEMS"]],
      ["RIGHTS", [
        "Use the beat in one new song.",
        "Commercial release and monetization.",
        "Unlimited streaming and sales/downloads.",
        "Unlimited music video use.",
        "Live performance and promotional use.",
        "Stems included for mixing and production."
      ]],
      ["LIMITS", [
        "No stream limit.",
        "No sales/download limit.",
        "No music-video limit."
      ]],
      ["IMPORTANT", [
        "This license remains non-exclusive.",
        "The beat may be licensed to other artists.",
        "The producer retains ownership of the instrumental.",
        "The purchase grants usage rights, not ownership of the beat."
      ]]
    ]
  }
};

function showLicenseInfo(name) {
  const info = LICENSE_INFO[name];
  if (!info) return;

  let modal = document.getElementById("licenseInfoModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "licenseInfoModal";
    modal.className = "license-info-modal";
    document.body.appendChild(modal);
  }

  const sections = info.sections.map(([title, items]) => `
    <section class="license-info-section">
      <h4>${title}</h4>
      ${items.length === 1 && title === "FILES"
        ? `<div class="license-file-list">${items.map(x => `<span>${x}</span>`).join("")}</div>`
        : `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`
      }
    </section>
  `).join("");

  modal.innerHTML = `
    <div class="license-info-backdrop" data-license-close></div>
    <div class="license-info-card" role="dialog" aria-modal="true" aria-label="${name} license">
      <button class="license-info-close" data-license-close aria-label="Close">×</button>
      <div class="license-info-kicker">LICENSE DETAILS</div>
      <div class="license-info-head">
        <div>
          <h3>${name.toUpperCase()} LICENSE</h3>
          <p>${info.subtitle}</p>
        </div>
        <strong>${info.price}</strong>
      </div>
      <div class="license-info-body">${sections}</div>
      <div class="license-info-footer">
        <span>Rights are granted for the finished song, not ownership of the instrumental.</span>
        <button class="license-info-ok" data-license-close>CLOSE</button>
      </div>
    </div>
  `;

  modal.querySelectorAll("[data-license-close]").forEach(el => {
    el.addEventListener("click", () => modal.remove());
  });
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", esc);
    }
  });
}


// READ LICENSE — deliberately kept outside the main app init so it works
// even if another part of the site fails to initialize.
window.showLicenseInfo = function(name) {
  const info = LICENSE_INFO[name];
  if (!info) return;

  const old = document.getElementById("licenseInfoModal");
  if (old) old.remove();

  const modal = document.createElement("div");
  modal.id = "licenseInfoModal";
  modal.className = "license-info-modal";

  const sections = info.sections.map(([title, items]) => `
    <section class="license-info-section">
      <h4>${title}</h4>
      ${title === "FILES"
        ? `<div class="license-file-list">${items.map(x => `<span>${x}</span>`).join("")}</div>`
        : `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`}
    </section>
  `).join("");

  modal.innerHTML = `
    <div class="license-info-backdrop" data-license-close></div>
    <div class="license-info-card" role="dialog" aria-modal="true">
      <button class="license-info-close" type="button" data-license-close aria-label="Close">×</button>
      <div class="license-info-kicker">FULL LICENSE INFORMATION</div>
      <div class="license-info-head">
        <div>
          <h3>${name.toUpperCase()} LICENSE</h3>
          <p>${info.subtitle}</p>
        </div>
        <strong>${info.price}</strong>
      </div>
      <div class="license-info-body">
        ${sections}
        <section class="license-info-section">
          <h4>GENERAL TERMS</h4>
          <ul>
            <li>This is a non-exclusive license unless an exclusive agreement is separately signed.</li>
            <li>The producer retains ownership and copyright in the instrumental.</li>
            <li>The license covers the finished song created with the beat; it does not transfer ownership of the beat.</li>
            <li>The beat itself may not be resold, sublicensed, uploaded as a standalone instrumental, or transferred to another artist.</li>
            <li>The license is for one new song based on the selected beat.</li>
            <li>Any publishing, songwriter splits, Content ID arrangements, samples/clearances, or special sync rights must be agreed separately where applicable.</li>
          </ul>
        </section>
        <section class="license-info-section">
          <h4>BEFORE PURCHASE</h4>
          <ul>
            <li>Check that the selected tier includes the file format and usage limits you need.</li>
            <li>If you need exclusive rights, contact the producer instead of purchasing a non-exclusive lease.</li>
            <li>By purchasing, the customer accepts the terms shown for the selected license.</li>
          </ul>
        </section>
      </div>
      <div class="license-info-footer">
        <span>VOID by xg.com · License terms shown here apply to the selected tier.</span>
        <button class="license-info-ok" type="button" data-license-close>CLOSE</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelectorAll("[data-license-close]").forEach(btn => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      modal.remove();
    });
  });
  modal.querySelector(".license-info-card").addEventListener("click", e => e.stopPropagation());
};

document.addEventListener("click", function(event) {
  const btn = event.target.closest("button[data-read-license]");
  if (!btn) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.showLicenseInfo(btn.dataset.readLicense || btn.dataset.license);
}, true);
