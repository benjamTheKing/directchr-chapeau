(() => {
  const D = window.DCHR;
  const { $, $$, esc, UNIVERS } = D;
  const store = D.boite;
  const MAX = 8;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const wide = matchMedia("(min-width: 1001px)");
  const keyOf = (x) => `${x.u}/${x.h}/${x.k}`;

  document.body.insertAdjacentHTML("beforeend", `<aside class="box is-min" id="boite" data-box aria-label="Boîte d'échantillons">
  <button class="box-toggle" type="button" data-box-toggle aria-expanded="false" aria-controls="box-body">
    <svg class="box-ico" aria-hidden="true"><use href="#i-box"/></svg>
    <span class="box-title">Boîte<span class="x"> d'échantillons</span></span>
    <span class="box-mini" data-mini aria-hidden="true"></span>
    <span class="box-count" data-box-total>${store.count()}/${MAX}</span>
    <svg class="box-chev" aria-hidden="true"><use href="#i-chev"/></svg>
  </button>
  <div class="box-body" id="box-body" data-box-body hidden>
    <div class="box-tray" data-tray></div>
    <p class="box-empty" data-box-empty>Choisissez un échantillon dans l'un des quatre univers : il viendra se ranger dans l'un des huit compartiments.</p>
    <ul class="box-list" data-box-list></ul>
    <p class="box-legend"><span><i></i>disponible dans les quatre univers</span><a href="${D.ROOT}projet/">Projet en cours</a></p>
    <p class="box-idea"><span class="proto-note">Idée</span><span>8 échantillons max · envoi gratuit</span></p>
    <div class="box-cta">
      <button class="btn" type="button" data-box-send>Recevoir ma boîte <svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
      <button class="box-clear" type="button" data-box-clear>Vider</button>
    </div>
  </div>
</aside><p class="vh" data-box-live aria-live="polite"></p>`);

  const boxEl = $("[data-box]");
  const body = $("[data-box-body]", boxEl);
  const toggleBtn = $("[data-box-toggle]", boxEl);
  const tray = $("[data-tray]", boxEl);
  const mini = $("[data-mini]", boxEl);
  const list = $("[data-box-list]", boxEl);
  const emptyEl = $("[data-box-empty]", boxEl);
  const totalEl = $("[data-box-total]", boxEl);
  const liveEl = $("[data-box-live]");
  tray.innerHTML = Array.from({ length: MAX }, (_, i) => `<div class="slot"><span class="slot-n">${String(i + 1).padStart(2, "0")}</span></div>`).join("");
  const slots = $$(".slot", tray);
  mini.innerHTML = "<i></i>".repeat(MAX);
  const minis = $$("i", mini);

  let data = null;
  let items = [];
  let pending = null;
  let autoOpened = false;
  const nodes = new Map();
  const subs = [];

  const resolve = (x) => {
    const p = data ? data.get(x.u, x.h) : null;
    const ci = p ? Math.max(0, p.c.findIndex((c) => c.k === x.k)) : 0;
    return { u: x.u, h: x.h, k: x.k, key: keyOf(x), p, ci };
  };
  const label = (it) => (it.p ? `${it.p.t}, ${it.p.c[it.ci].n}` : `${it.h}, ${it.k}`);
  const uName = (u) => (UNIVERS[u] ? UNIVERS[u].n : u);
  const media = (it) => (it.p ? `<img class="m" src="${esc(D.swatch(it.p, it.ci))}" alt="" decoding="async">` : "");
  const indexOf = (key) => items.findIndex((it) => it.key === key);
  const announce = (msg) => {
    liveEl.textContent = msg;
  };

  const syncCounts = () => {
    [["dchr-boite", store], ["dchr-projet", D.projet]].forEach(([k, s]) => {
      const n = String(s.count());
      $$(`[data-count="${k}"]`).forEach((el) => {
        el.textContent = n;
        el.dataset.n = n;
      });
    });
  };
  const syncButtons = () => {
    const keys = new Set(store.list().map(keyOf));
    $$("[data-sample]").forEach((b) => {
      const on = String(keys.has(b.dataset.sample));
      if (b.dataset.on === on) return;
      b.dataset.on = on;
      b.setAttribute("aria-pressed", on);
      b.innerHTML = on === "true" ? '<svg aria-hidden="true"><use href="#i-check"/></svg>Dans la boîte' : '<svg aria-hidden="true"><use href="#i-plus"/></svg>Échantillon';
    });
  };

  const setOpen = (open) => {
    boxEl.classList.toggle("is-min", !open);
    body.hidden = !open;
    toggleBtn.setAttribute("aria-expanded", String(open));
  };
  toggleBtn.addEventListener("click", () => setOpen(body.hidden));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || body.hidden) return;
    setOpen(false);
    toggleBtn.focus();
  });

  const slotNode = (it) => {
    if (nodes.has(it.key)) return nodes.get(it.key);
    const el = document.createElement("div");
    el.className = "slot-m";
    el.style.setProperty("--u", `var(--u-${it.u})`);
    el.title = `${label(it)} · ${uName(it.u)} · disponible`;
    el.innerHTML = `${media(it)}<i class="slot-st"></i><button class="slot-x" type="button" aria-label="Retirer ${esc(label(it))} de la boîte"><svg aria-hidden="true"><use href="#i-x"/></svg></button>`;
    $(".slot-x", el).addEventListener("click", () => removeKey(it.key));
    nodes.set(it.key, el);
    return el;
  };
  const layoutTray = (fresh) => {
    const live = !body.hidden && !reduce;
    const before = new Map();
    if (live) nodes.forEach((el, k) => before.set(k, el.getBoundingClientRect()));
    nodes.forEach((el, k) => {
      if (indexOf(k) >= 0) return;
      nodes.delete(k);
      if (!live) {
        el.remove();
        return;
      }
      const out = el.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.6)" }], { duration: 200, easing: "ease-in", fill: "forwards" });
      out.onfinish = () => el.remove();
    });
    items.forEach((it, i) => {
      const el = slotNode(it);
      el.classList.toggle("is-wait", it.key === fresh && !reduce);
      if (el.parentNode !== slots[i]) slots[i].append(el);
    });
    if (!live) return;
    items.forEach((it) => {
      const a = before.get(it.key);
      if (!a || it.key === fresh) return;
      const el = nodes.get(it.key);
      const r = el.getBoundingClientRect();
      const dx = a.left - r.left;
      const dy = a.top - r.top;
      if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 420, easing: EASE });
    });
  };

  const listItem = (it) => {
    const name = it.p ? `<a href="${esc(D.productUrl(it.p, it.ci))}">${esc(it.p.t)}</a>` : esc(it.h);
    const col = it.p ? it.p.c[it.ci].n : it.k;
    return `<li style="--u: var(--u-${it.u})"><span class="li-m">${media(it)}</span><span class="li-t"><b>${name}</b><span class="li-s"><i></i>${esc(uName(it.u))} · <em>disponible</em> · ${esc(col)}</span></span><button class="li-x" type="button" data-rm="${esc(it.key)}" aria-label="Retirer ${esc(label(it))} de la boîte"><svg aria-hidden="true"><use href="#i-x"/></svg></button></li>`;
  };

  const render = () => {
    syncCounts();
    syncButtons();
    totalEl.textContent = `${store.count()}/${MAX}`;
    if (!data) return;
    const fresh = pending;
    items = store.list().map(resolve);
    minis.forEach((el, i) => {
      const it = items[i];
      const k = it ? it.key : "";
      if (el.dataset.k !== k) {
        el.dataset.k = k;
        el.innerHTML = it ? media(it) : "";
        el.classList.toggle("is-full", Boolean(it));
      }
      el.classList.toggle("is-wait", Boolean(it) && it.key === fresh && !reduce);
    });
    list.innerHTML = items.map(listItem).join("");
    emptyEl.hidden = items.length > 0;
    layoutTray(fresh);
    subs.forEach((fn) => fn(items));
  };

  const fly = (key, from) => {
    const i = indexOf(key);
    if (i < 0) return;
    const target = body.hidden ? minis[i] : slots[i];
    const land = body.hidden ? minis[i] : nodes.get(key);
    if (!land) return;
    if (reduce || !from || !target) {
      land.classList.remove("is-wait");
      return;
    }
    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    if (!a.width || !b.width) {
      land.classList.remove("is-wait");
      return;
    }
    const size = Math.min(a.width, a.height);
    const x0 = a.left + (a.width - size) / 2;
    const y0 = a.top + (a.height - size) / 2;
    const s = b.width / size;
    const dx = b.left - x0;
    const dy = b.top - y0;
    const g = document.createElement("div");
    g.className = "ghost";
    g.innerHTML = media(items[i]);
    Object.assign(g.style, { left: `${x0}px`, top: `${y0}px`, width: `${size}px`, height: `${size}px` });
    document.body.append(g);
    const anim = g.animate([
      { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
      { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - 70}px) scale(${(1 + s) / 2 + 0.08}) rotate(-7deg)`, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)` },
    ], { duration: 760, easing: "cubic-bezier(0.5, 0, 0.25, 1)" });
    const done = () => {
      g.remove();
      land.classList.remove("is-wait");
      land.animate([{ transform: "scale(0.86)" }, { transform: "scale(1.05)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
    };
    anim.onfinish = done;
    anim.oncancel = done;
  };
  const bump = () => {
    boxEl.classList.remove("is-bump");
    void boxEl.offsetWidth;
    boxEl.classList.add("is-bump");
  };
  const full = () => {
    D.toast("La boîte est pleine : huit échantillons au plus. Retirez-en un pour en ajouter un autre.");
    if (!reduce) boxEl.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 380, easing: "ease-out" });
  };

  const removeKey = (key) => {
    const i = indexOf(key);
    if (i < 0) return;
    const it = items[i];
    const prev = document.activeElement;
    const fromBox = boxEl.contains(prev) && prev !== toggleBtn;
    store.remove(it.u, it.h, it.k);
    if (fromBox) {
      const next = $$(".li-x", list)[Math.min(i, items.length - 1)];
      (next || toggleBtn).focus({ preventScroll: true });
    }
    announce(`${label(it)} retiré de la boîte, ${items.length} sur ${MAX}.`);
  };

  const toggle = (p, ci, from) => {
    const c = p.c[ci] || p.c[0];
    const key = keyOf({ u: p.u, h: p.h, k: c.k });
    if (store.has(p.u, p.h, c.k)) {
      removeKey(key);
      return false;
    }
    if (store.count() >= MAX) {
      full();
      return false;
    }
    if (!autoOpened && wide.matches && body.hidden) setOpen(true);
    autoOpened = true;
    pending = key;
    const ok = store.add({ u: p.u, h: p.h, k: c.k });
    pending = null;
    if (!ok) {
      full();
      return false;
    }
    fly(key, from);
    bump();
    announce(`${p.t}, ${c.n} ajouté à la boîte, ${items.length} sur ${MAX}.`);
    return true;
  };

  document.addEventListener("click", (e) => {
    const opener = e.target.closest('[data-box-open], a[href$="#boite"]');
    if (opener && !boxEl.contains(opener)) {
      e.preventDefault();
      setOpen(true);
      toggleBtn.focus({ preventScroll: true });
      return;
    }
    const b = e.target.closest("[data-sample]");
    if (!b || !data) return;
    e.preventDefault();
    const parts = b.dataset.sample.split("/");
    const p = data.get(parts[0], parts.slice(1, -1).join("/"));
    if (!p) return;
    const ci = Math.max(0, p.c.findIndex((c) => c.k === parts[parts.length - 1]));
    const host = b.closest("[data-fly]");
    toggle(p, ci, (host && $(".vis", host)) || b);
  });
  list.addEventListener("click", (e) => {
    const x = e.target.closest("[data-rm]");
    if (x) removeKey(x.dataset.rm);
  });
  $("[data-box-send]", boxEl).addEventListener("click", () => D.toast(store.count() ? "Prototype : l'envoi des échantillons sera branché sur le compte pro." : "Votre boîte est vide : choisissez d'abord un échantillon."));
  $("[data-box-clear]", boxEl).addEventListener("click", () => {
    if (!store.count()) return;
    store.clear();
    toggleBtn.focus({ preventScroll: true });
    announce("La boîte est vide.");
  });

  store.on(render);
  addEventListener("storage", (e) => {
    if (!e.key || e.key === "dchr-boite" || e.key === "dchr-projet") render();
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) render();
  });
  render();
  D.load().then((d) => {
    data = d;
    render();
    if (location.hash === "#boite") setOpen(true);
  });

  window.MBox = {
    MAX,
    keyOf,
    toggle,
    items: () => items,
    has: (key) => store.list().some((x) => keyOf(x) === key),
    refresh: syncButtons,
    open: () => setOpen(true),
    on: (fn) => {
      subs.push(fn);
      if (data) fn(items);
    },
  };
})();
