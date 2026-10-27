/* =====================================================================
   App logic: language switch, 3D scene, services, modal, inquiry form
   Uploads go to Google Drive as  Client Name / Service Name / files
   ===================================================================== */
(() => {
  const S = window.SITE, SV = window.SERVICES, T = window.I18N;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");

  /* ---------- language ---------- */
  let lang = (() => {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q === "ar" || q === "en") return q;
      return localStorage.getItem("lang") === "ar" ? "ar" : "en";
    } catch { return "en"; }
  })();
  const AR = () => lang === "ar";
  const t = (k, vars) => {
    let s = (T[lang] && T[lang][k]) ?? T.en[k] ?? k;
    if (vars) for (const v in vars) s = s.split(`{${v}}`).join(vars[v]);
    return s;
  };
  const title = s => AR() ? s.ar : s.title;
  const altTitle = s => AR() ? s.title : s.ar;
  const subName = u => AR() ? u.ar : u.name;
  const blurb = s => AR() ? (s.blurbAr || s.blurb) : s.blurb;
  const doc = d => Array.isArray(d) ? (AR() ? d[1] : d[0]) : d;
  const docEn = d => Array.isArray(d) ? d[0] : d;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- icons ---------- */
  const P = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    register: P('<path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4M8 12h8M8 16h5"/>'),
    shield: P('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    building: P('<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01"/>'),
    car: P('<path d="M5 16 6.5 9.5A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="12" width="18" height="6" rx="2"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>'),
    globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    umbrella: P('<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v6a2 2 0 0 0 4 0"/>'),
    calc: P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>'),
    badge: P('<rect x="4" y="5" width="16" height="15" rx="2"/><circle cx="12" cy="11" r="2.5"/><path d="M8 17c1-2 7-2 8 0M9 5V3h6v2"/>'),
    family: P('<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20c.5-4 3-6 5.5-6s5 2 5.5 6M14 20c.3-3 1.6-4.5 3-4.5s2.8 1.5 3.3 4.5"/>'),
    spark: P('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    permit: P('<path d="M7 3h10v18l-5-3-5 3z"/><path d="M10 9h4M10 12h4"/>'),
    pen: P('<path d="m15 4 5 5L9 20H4v-5z"/><path d="m13 6 5 5"/>')
  };

  /* ---------- static bits ---------- */
  $("#cPhone").textContent = S.phone; $("#cPhone").href = "tel:" + S.phone.replace(/\s/g, "");
  $("#cWa").textContent = S.whatsappDisplay || S.phone;
  $("#cEmail").textContent = S.email; $("#cEmail").href = "mailto:" + S.email;
  $("#year").textContent = new Date().getFullYear();
  const stats = $$("[data-count]");
  stats[0].dataset.count = SV.length;
  stats[1].dataset.count = SV.reduce((n, s) => n + s.subs.length, 0);
  const mq = SV.map(s => `<span>${s.title} <span class="ar">${s.ar}</span><i></i></span>`).join("");
  $("#marquee").innerHTML = mq + mq;

  /* ---------- service cards ---------- */
  const grid = $("#servicesGrid");
  let cardsShown = false;
  function renderCards() {
    grid.innerHTML = SV.map((s, i) => `
      <article class="card reveal${cardsShown ? " in" : ""}" style="--c:${s.color}" data-id="${s.id}" tabindex="0" role="button" aria-label="${esc(title(s))}">
        <span class="card-num">${pad(i + 1)}</span>
        <div class="card-icon">${ICONS[s.icon] || ICONS.register}</div>
        <h3>${esc(title(s))}</h3>
        <p class="alt ${AR() ? "" : "ar"}">${esc(altTitle(s))}</p>
        <p>${esc(blurb(s))}</p>
        <div class="card-foot"><span>${t("card.tx", { n: s.subs.length })}</span><b>${t("card.view")}</b></div>
      </article>`).join("") + `<p class="no-results" hidden>${t("svc.none")}</p>`;
    if (!cardsShown) $$(".card").forEach(c => io.observe(c));
    filterCards();
  }
  grid.addEventListener("pointermove", e => {
    const card = e.target.closest(".card");
    if (!card || reduced || e.pointerType === "touch") return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", `${(x - .5) * 16}deg`);
    card.style.setProperty("--rx", `${(.5 - y) * 14}deg`);
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });
  grid.addEventListener("pointerout", e => {
    const card = e.target.closest(".card");
    if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
  });
  grid.addEventListener("click", e => { const c = e.target.closest(".card"); c && openModal(c.dataset.id); });
  grid.addEventListener("keydown", e => {
    const c = e.target.closest(".card");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(c.dataset.id); }
  });

  function filterCards() {
    const q = $("#search").value.trim().toLowerCase();
    let shown = 0;
    $$(".card").forEach(c => {
      const s = SV.find(x => x.id === c.dataset.id);
      const hay = [s.title, s.ar, s.blurb, s.blurbAr, ...s.subs.flatMap(u => [u.name, u.ar, ...u.docs.flat()])].join(" ").toLowerCase();
      const ok = !q || hay.includes(q);
      c.classList.toggle("hidden", !ok); ok && shown++;
    });
    const nr = $(".no-results"); if (nr) nr.hidden = shown > 0;
  }
  $("#search").addEventListener("input", filterCards);

  /* ---------- modal ---------- */
  const modal = $("#modal");
  let current = null, currentSub = 0;
  function openModal(id) {
    current = SV.find(s => s.id === id); currentSub = 0;
    renderModal();
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function renderModal() {
    if (!current) return;
    $(".modal-card").style.setProperty("--c", current.color);
    $("#mIcon").innerHTML = ICONS[current.icon];
    $("#mTitle").textContent = title(current);
    const alt = $("#mAlt"); alt.textContent = altTitle(current); alt.className = "alt" + (AR() ? "" : " ar");
    $("#mBlurb").textContent = blurb(current);
    $("#mTabs").innerHTML = current.subs.map((u, i) => `<button class="tab" type="button" data-i="${i}">${esc(subName(u))}</button>`).join("");
    renderDocs();
  }
  function renderDocs() {
    $("#mDocs").innerHTML = current.subs[currentSub].docs.map((d, i) => `<li style="animation-delay:${i * 40}ms">${esc(doc(d))}</li>`).join("");
    $$(".tab").forEach(b => b.classList.toggle("active", +b.dataset.i === currentSub));
  }
  $("#mTabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) { currentSub = +b.dataset.i; renderDocs(); } });
  const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
  $$("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => e.key === "Escape" && closeModal());
  $("#mApply").addEventListener("click", () => {
    closeModal();
    fService.value = current.id; fillSubs(); fSub.value = String(currentSub); renderUploads();
    $("#apply").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- inquiry form ---------- */
  const form = $("#inquiryForm"), fService = $("#fService"), fSub = $("#fSub");
  const extra = $("#extraFiles");
  const svc = () => SV.find(x => x.id === fService.value);
  const sub = () => { const s = svc(); return s ? (s.subs[+fSub.value] || s.subs[0]) : null; };

  function fillServiceOptions() {
    const v = fService.value;
    fService.innerHTML = `<option value="" disabled ${v ? "" : "selected"}>${t("f.choose")}</option>` +
      SV.map(s => `<option value="${s.id}">${esc(title(s))}</option>`).join("") +
      `<option value="other">${t("f.other")}</option>`;
    if (v) fService.value = v;
  }
  function fillSubs() {
    const v = fSub.value, s = svc();
    fSub.innerHTML = s
      ? s.subs.map((u, i) => `<option value="${i}">${esc(subName(u))}</option>`).join("")
      : `<option value="other">${t("f.general")}</option>`;
    if (v && [...fSub.options].some(o => o.value === v)) fSub.value = v;
  }
  function renderChecklist() {
    const cl = $("#checklistCard"), s = svc(), u = sub();
    if (!s) {
      cl.innerHTML = `<h4>${t("cl.title")}</h4><p class="muted small">${t(fService.value === "other" ? "cl.other" : "cl.empty")}</p>`;
      return;
    }
    cl.style.setProperty("--c", s.color);
    cl.innerHTML = `<h4>${esc(subName(u))}</h4><ol>${u.docs.map(d => `<li>${esc(doc(d))}</li>`).join("")}</ol>`;
  }
  // one upload slot per required document (re-built only when service/transaction changes)
  function renderUploads() {
    const box = $("#uploads"), u = sub();
    renderChecklist();
    if (!u) { box.innerHTML = ""; updateSize(); return; }
    box.innerHTML = `<p class="uploads-title">${t("up.title")}</p>` +
      u.docs.map((d, i) => `
        <label class="up" data-i="${i}">
          <span class="up-ic">${i + 1}</span>
          <span class="up-txt"><span class="up-label">${esc(doc(d))}</span><small>${t("up.hint")}</small></span>
          <input type="file" name="Document ${i + 1}" data-i="${i}" multiple accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx" />
        </label>`).join("");
    updateSize();
  }
  // language change: relabel without losing chosen files
  function relabelUploads() {
    const u = sub(); if (!u) return;
    const ttl = $(".uploads-title"); if (ttl) ttl.textContent = t("up.title");
    $$(".up").forEach(up => {
      const i = +up.dataset.i, inp = $("input", up);
      $(".up-label", up).textContent = doc(u.docs[i]);
      $("small", up).textContent = fileHint(inp);
    });
    dropHint();
  }
  const fileHint = inp => !inp.files.length ? t("up.hint") : inp.files.length === 1 ? inp.files[0].name : t("up.n", { n: inp.files.length });
  const dropHint = () => $("[data-drop] p").textContent = extra.files.length ? t("drop.n", { n: extra.files.length }) : t("drop");

  fService.addEventListener("change", () => { fSub.value = ""; fillSubs(); renderUploads(); });
  fSub.addEventListener("change", renderUploads);

  form.addEventListener("change", e => {
    const inp = e.target;
    if (inp.type !== "file") return;
    const up = inp.closest(".up");
    if (up) {
      up.classList.toggle("has", inp.files.length > 0);
      $("small", up).textContent = fileHint(inp);
      $(".up-ic", up).textContent = inp.files.length ? "✓" : +up.dataset.i + 1;
    }
    if (inp === extra) dropHint();
    updateSize();
  });
  const drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, () => drop.classList.add("over")));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove("over")));

  const allFiles = () => $$("input[type=file]", form).flatMap(i => [...i.files]);
  const totalMB = () => allFiles().reduce((a, f) => a + f.size, 0) / 1048576;
  function updateSize() {
    const mb = totalMB(), el = $("#sizeInfo");
    el.textContent = t("f.size", { a: mb.toFixed(1), b: S.maxUploadMB });
    el.style.color = mb > S.maxUploadMB ? "#ff6b6b" : "";
  }

  // file names in Drive: "01 - Recent judicial record.pdf", "Extra - scan.jpg"
  const safe = s => String(s).replace(/[\\/:*?"<>|#%]+/g, " ").replace(/\s+/g, " ").trim();
  const shortLabel = s => { s = safe(s); return s.length > 60 ? s.slice(0, 60).replace(/\s+\S*$/, "") : s; };
  const ext = n => { const i = n.lastIndexOf("."); return i > 0 ? n.slice(i).toLowerCase() : ""; };
  // collect chosen files with tidy names: "01 - Recent judicial record.pdf", "Extra - scan.jpg"
  function collectFiles() {
    const u = sub(), list = [];
    $$(".up input", form).forEach(inp => {
      const i = +inp.dataset.i;
      const label = u ? shortLabel(docEn(u.docs[i])) : "Document";
      [...inp.files].forEach((f, k) => list.push({ f, docIndex: i, label: u ? u.docs[i] : ["Document", "مستند"],
        name: `${pad(i + 1)} - ${label}${inp.files.length > 1 ? ` (${k + 1})` : ""}${ext(f.name)}` }));
    });
    [...extra.files].forEach(f => list.push({ f, docIndex: null, label: ["Extra file", "ملف إضافي"], name: `Extra - ${safe(f.name)}` }));
    return list;
  }

  form.addEventListener("submit", async e => {
    if (!form.reportValidity()) { e.preventDefault(); return; }
    if (totalMB() > S.maxUploadMB) { e.preventDefault(); return toast(t("toast.big", { b: S.maxUploadMB }), true); }
    const s = svc(), u = sub();
    const svcEn = s ? s.title : "Other";
    const subEn = u ? u.name : "General inquiry";
    const useAccount = !!(window.Account && Account.enabled);

    /* --- fallback: email via FormSubmit until the Google script is connected --- */
    if (!useAccount) {
      $("#fSubject").value = `New inquiry: ${svcEn} — ${subEn} (${form.Name.value})`;
      fService.options[fService.selectedIndex].value = svcEn;
      fSub.options[fSub.selectedIndex].value = subEn;
      $("#fNext").value = location.origin + location.pathname + "?sent=1#apply";
      form.action = `https://formsubmit.co/${S.email}`;
      setBusy(true);
      return; // native submit continues
    }

    e.preventDefault();
    if (form._honey.value) return;

    // accounts on: the client must be logged in so the file appears in their dashboard
    let user = null;
    if (useAccount) {
      try { user = await Account.requireUser(); } catch { return; }
    }

    const meta = {
      name: form.Name.value.trim(),
      phone: form.Phone.value.trim(),
      email: form.email.value.trim() || (user && user.email) || "",
      contact: $("#fPref").value,
      service: svcEn, serviceAr: s ? s.ar : "", serviceId: s ? s.id : "other",
      transaction: subEn, transactionAr: u ? u.ar : "", subIndex: s ? +fSub.value : null,
      notes: form.Message.value.trim(),
      lang,
      account: user ? user.email : ""
    };
    const list = collectFiles();
    setBusy(true);
    try {
      // Google script: saves to Drive (Client Name / Service / files), logs it in the tracking sheet
      await Account.saveInquiry(meta, list, progress);
      progress(100);
      toast(t("toast.okAccount"));
      resetForm();
      Account.openDashboard();
    } catch (err) {
      console.error(err);
      toast(t("toast.fail"), true);
    } finally {
      setBusy(false);
    }
  });

  function setBusy(b) {
    const btn = $("#submitBtn");
    btn.disabled = b;
    btn.textContent = t(b ? "f.sending" : "f.send");
    $("#progress").hidden = !b || !(window.Account && Account.enabled);
    if (!b) progress(0);
  }
  const progress = p => $("#progress span").style.width = p + "%";
  function resetForm() {
    form.reset();
    fService.value = ""; fillServiceOptions(); fillSubs(); renderUploads(); dropHint(); updateSize();
    window.Account && Account.prefill && Account.prefill();
  }

  if (new URLSearchParams(location.search).get("sent")) {
    setTimeout(() => toast(t("toast.ok")), 900);
    history.replaceState(null, "", location.pathname + "#apply");
  }
  function toast(msg, err) {
    const el = $("#toast");
    el.textContent = msg; el.classList.toggle("err", !!err); el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 5000);
  }

  /* ---------- apply language to everything ---------- */
  function applyLang() {
    const h = document.documentElement;
    h.lang = lang; h.dir = AR() ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
    $$("[data-i18n-ph]").forEach(e => e.placeholder = t(e.dataset.i18nPh));
    $("#langBtn").textContent = t("lang.toggle");
    $$("[data-brand]").forEach(e => e.textContent = AR() ? S.brandAr : S.brand);
    $$("[data-brand-ar]").forEach(e => { e.textContent = AR() ? S.brand : S.brandAr; e.classList.toggle("ar", !AR()); });
    document.title = `${AR() ? S.brandAr : S.brand} — ${t("meta.title")}`;
    $("#cAddr").textContent = AR() ? (S.addressAr || S.address) : S.address;
    $("#cHours").textContent = AR() ? (S.hoursAr || S.hours) : S.hours;
    $$("[data-wa]").forEach(a => { a.href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(t("wa.msg", { brand: S.brand }))}`; a.target = "_blank"; a.rel = "noopener"; });
    renderCards();
    fillServiceOptions(); fillSubs(); renderChecklist(); relabelUploads(); updateSize();
    if (modal.classList.contains("open")) renderModal();
    AM.onLang.forEach(fn => { try { fn(); } catch (err) { console.error(err); } });
    if (!$("#submitBtn").disabled) $("#submitBtn").textContent = t("f.send");
    try { localStorage.setItem("lang", lang); } catch {}
    sceneSide && sceneSide();
  }
  $("#langBtn").addEventListener("click", () => { lang = AR() ? "en" : "ar"; cardsShown = true; applyLang(); });

  /* ---------- light / dark theme ---------- */
  const isLight = () => document.documentElement.dataset.theme === "light";
  let onTheme = null;
  $("#themeBtn").addEventListener("click", () => {
    const next = isLight() ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    onTheme && onTheme();
  });

  /* ---------- nav ---------- */
  const nav = $(".nav");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("hide", y > lastY && y > 300 && !nav.classList.contains("open"));
    lastY = y;
  }, { passive: true });
  $("#burger").addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  /* ---------- reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const idx = $$(".card").indexOf(el);
    el.style.transitionDelay = idx >= 0 ? `${(idx % 4) * 70}ms` : "";
    el.classList.add("in");
    setTimeout(() => (el.style.transitionDelay = ""), 1200);
    io.unobserve(el);
    if (idx >= 0 && $$(".card:not(.in)").length === 0) cardsShown = true;
  }), { threshold: .12 });
  $$(".section-head, .step, .faq details, .contact-card, .form, .apply-side").forEach(el => { el.classList.add("reveal"); io.observe(el); });

  function countUp() {
    stats.forEach(el => {
      const end = +el.dataset.count, t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        p < 1 && requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  addEventListener("load", () => setTimeout(() => {
    $("#loader").classList.add("done");
    document.body.classList.add("ready");
    countUp();
  }, 500));

  /* =====================================================================
     THREE.JS SCENE — glowing core orbited by floating 3D "documents"
     ===================================================================== */
  let sceneSide = null;
  // shared helpers for account.js (log in / dashboard)
  const AM = window.AM = {
    t, esc, pad, safe, ext, toast, ICONS, SV, S,
    isAR: AR, lang: () => lang,
    title, subName, doc,
    onLang: [],
    closeServiceModal: closeModal
  };
  applyLang();
  if (!window.THREE) return;

  const canvas = $("#scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060914, 0.045);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  const world = new THREE.Group(); scene.add(world);

  const ambient = new THREE.AmbientLight(0x8899ff, 0.35); scene.add(ambient);
  const l1 = new THREE.PointLight(0x2ee6a8, 2.2, 30); l1.position.set(-4, 3, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0xf5c46b, 2.0, 30); l2.position.set(5, -2, 4); scene.add(l2);
  const l3 = new THREE.PointLight(0x8b7bff, 1.4, 30); l3.position.set(0, 5, -4); scene.add(l3);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshStandardMaterial({ color: 0x0d1630, metalness: .9, roughness: .15, flatShading: true, emissive: 0x0b3b2e, emissiveIntensity: .6 })
  );
  world.add(core);
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.9, 1)),
    new THREE.LineBasicMaterial({ color: 0x2ee6a8, transparent: true, opacity: .45 })
  );
  world.add(shell);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x2ee6a8, transparent: true, opacity: .05, side: THREE.BackSide })
  );
  world.add(halo);
  const rings = [0xf5c46b, 0x2ee6a8, 0x8b7bff].map((c, i) => {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(2.7 + i * .55, .012, 8, 160),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55 - i * .12 })
    );
    r.rotation.set(Math.PI / 2 + (i - 1) * .5, i * .4, 0);
    world.add(r); return r;
  });

  function docTexture(s, i) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 340;
    const g = c.getContext("2d");
    const grd = g.createLinearGradient(0, 0, 256, 340);
    grd.addColorStop(0, "#141d3a"); grd.addColorStop(1, "#0a0f22");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 340);
    g.strokeStyle = s.color; g.lineWidth = 4; g.strokeRect(2, 2, 252, 336);
    g.fillStyle = s.color; g.fillRect(176, 22, 60, 8);
    g.font = "600 28px 'Noto Kufi Arabic', sans-serif"; g.textAlign = "right"; g.direction = "rtl";
    wrap(g, s.ar, 236, 80, 214, 40);
    g.direction = "ltr"; g.textAlign = "left";
    g.fillStyle = "rgba(255,255,255,.18)";
    for (let k = 0; k < 5; k++) g.fillRect(20, 196 + k * 20, 216 - (k % 3) * 40, 6);
    g.strokeStyle = s.color; g.lineWidth = 3; g.globalAlpha = .8;
    g.beginPath(); g.arc(200, 300, 22, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(200, 300, 14, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1; g.font = "700 14px Manrope, sans-serif"; g.fillStyle = s.color;
    g.fillText(pad(i + 1), 20, 312);
    const tx = new THREE.CanvasTexture(c); tx.anisotropy = 4; return tx;
  }
  function wrap(g, text, x, y, maxW, lh) {
    const words = text.split(" "); let line = "";
    g.fillStyle = "#eef2ff";
    words.forEach(w => {
      const test = line ? line + " " + w : w;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh; }
      else line = test;
    });
    g.fillText(line, x, y);
  }

  const docs = [];
  const docGeo = new THREE.BoxGeometry(1.05, 1.4, .03);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    SV.forEach((s, i) => {
      const tex = docTexture(s, i);
      const side = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.color), metalness: .4, roughness: .4, emissive: new THREE.Color(s.color), emissiveIntensity: .25 });
      const face = new THREE.MeshStandardMaterial({ map: tex, metalness: .2, roughness: .5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .55 });
      const m = new THREE.Mesh(docGeo, [side, side, side, side, face, face]);
      const pivot = new THREE.Group();
      pivot.rotation.set((Math.random() - .5) * 1.1, 0, (Math.random() - .5) * .8);
      const radius = 3.0 + (i % 3) * .6;
      m.userData = { a: (i / SV.length) * Math.PI * 2, speed: .08 + Math.random() * .07, radius, bob: Math.random() * 6, spin: (Math.random() - .5) * .6 };
      pivot.add(m); world.add(pivot); docs.push(m);
    });
  });

  const N = innerWidth < 760 ? 700 : 1600;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const pal = [0x2ee6a8, 0xf5c46b, 0x8b7bff, 0xffffff].map(c => new THREE.Color(c));
  for (let i = 0; i < N; i++) {
    const r = 4 + Math.random() * 22, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * .6, r * Math.sin(ph) * Math.sin(th) - 4], i * 3);
    const c = pal[(Math.random() * pal.length) | 0]; col.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: .05, vertexColors: true, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  // the 3D object sits opposite the text: right in English, left in Arabic
  let baseX = 0;
  sceneSide = () => {
    const wide = innerWidth > 960;
    baseX = wide ? (AR() ? -3.9 : 3.9) : 0;
    world.scale.setScalar(wide ? .9 : .8);
  };
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    sceneSide();
  }
  addEventListener("resize", resize); resize();

  // recolour the scene for light / dark
  function sceneTheme() {
    const L = isLight();
    scene.fog.color.set(L ? 0xf5f1e8 : 0x060914);
    ambient.intensity = L ? 0.95 : 0.35;
    core.material.color.set(L ? 0xdff3ea : 0x0d1630);
    core.material.emissive.set(L ? 0x0b5c45 : 0x0b3b2e);
    core.material.emissiveIntensity = L ? 0.22 : 0.6;
    shell.material.color.set(L ? 0x0b9b6f : 0x2ee6a8);
    shell.material.opacity = L ? 0.6 : 0.45;
    halo.material.color.set(L ? 0x0b9b6f : 0x2ee6a8);
    rings[0].material.color.set(L ? 0xb97a0c : 0xf5c46b);
    rings[1].material.color.set(L ? 0x0b9b6f : 0x2ee6a8);
    rings[2].material.color.set(L ? 0x5b4bea : 0x8b7bff);
    stars.material.blending = L ? THREE.NormalBlending : THREE.AdditiveBlending;
    stars.material.opacity = L ? 0.5 : 0.85;
    stars.material.size = L ? 0.06 : 0.05;
    stars.material.needsUpdate = true;
  }
  onTheme = sceneTheme; sceneTheme();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
  let scrollP = 0;
  addEventListener("scroll", () => { scrollP = Math.min(1, scrollY / innerHeight); }, { passive: true });

  const clock = new THREE.Clock();
  let visible = true;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));
  let wx = baseX;

  (function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const tm = clock.getElapsedTime(), sp = reduced ? .15 : 1;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    wx += (baseX * (1 - scrollP * .6) - wx) * .06;   // glides across when language flips
    world.position.x = wx;
    world.position.y = scrollP * 1.5;
    world.rotation.y = mouse.x * .6 + tm * .05 * sp + scrollP * 1.2;
    world.rotation.x = mouse.y * .35 + scrollP * .35;
    camera.position.z = 11 + scrollP * 3;

    core.rotation.x = tm * .25 * sp; core.rotation.y = tm * .35 * sp;
    shell.rotation.y = -tm * .15 * sp; shell.rotation.z = tm * .1 * sp;
    core.scale.setScalar(1 + Math.sin(tm * 2) * .03);
    halo.material.opacity = .04 + Math.sin(tm * 1.5) * .02;
    rings.forEach((r, i) => (r.rotation.z = tm * (.1 + i * .05) * (i % 2 ? -1 : 1) * sp));

    docs.forEach(m => {
      const u = m.userData;
      u.a += u.speed * .01 * sp;
      m.position.set(Math.cos(u.a) * u.radius, Math.sin(tm * .8 + u.bob) * .25, Math.sin(u.a) * u.radius);
      m.lookAt(camera.position);
      m.rotateY(Math.sin(tm * .5 + u.bob) * .25 + u.spin);
    });
    stars.rotation.y = tm * .01 * sp;
    // full strength on the hero, a soft backdrop behind the content sections
    canvas.style.opacity = (innerWidth > 960 ? 1 : .3) * (1 - scrollP * (isLight() ? .85 : .75));
    renderer.render(scene, camera);
  })();
})();
