(() => {
  const D = window.DCHR;
  const H = window.HOTEL;
  const { $, $$, esc, nf } = D;
  const { SPACES, ORDER, X, Y, VW, VH } = H;
  const KEYS = D.U_ORDER;
  const UN = (u) => D.UNIVERS[u].n;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let DATA = null;

  H.syncCount();

  const coupe = $("[data-coupe]");
  coupe.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
  coupe.innerHTML = H.full();

  const hud = $("[data-hud]");
  const fiche = $("[data-fiche]");
  const board = $("[data-board]");
  let selected = "chambres";
  let shown = null;

  const show = (id) => {
    if (shown === id) return;
    shown = id;
    coupe.classList.toggle("has-on", !!id);
    $$(".sp", coupe).forEach((g) => g.classList.toggle("is-on", g.dataset.space === id));
    $$("[data-sp]").forEach((el) => el.classList.toggle("is-hot", el.dataset.sp === id));
    if (!id) {
      hud.classList.remove("is-in");
      return;
    }
    const s = SPACES[id];
    hud.innerHTML = `<b>${esc(s.name)}</b>${s.lvl}`;
    hud.style.left = `${((X(s.hud[0]) / VW) * 100).toFixed(2)}%`;
    hud.style.top = `${((Y(s.hud[1]) / VH) * 100).toFixed(2)}%`;
    hud.classList.add("is-in");
  };
  const preview = (id) => show(id || selected);

  const thumbs = (list, s, u) => H.spread(list, s.cats[u], 3).map((p) => `<img src="${esc(D.swatch(p, H.topCi(p)))}" alt="" width="24" height="24" loading="lazy" decoding="async">`).join("");
  const row = (id, u) => {
    const s = SPACES[id];
    const [lbl, feu] = s.u[u];
    const list = DATA ? H.inSpace(DATA, u, id) : null;
    const na = !s.cats[u].length || (list && !list.length);
    const th = list && !na ? thumbs(list, s, u) : "";
    const cnt = list && !na ? `<span class="fr-c"><i></i>${nf.format(list.length)} réf.</span>` : "";
    const inner = `<span class="fr-u"><i></i>${UN(u)}</span><span class="fr-p">${esc(lbl)}</span><span class="fr-th">${th}</span><span class="fr-n"><span>${esc(feu)}</span>${cnt}</span>`;
    const el = na ? `<div class="fr is-na">${inner}</div>` : `<a class="fr" href="${D.universeUrl(u, { es: id })}">${inner}</a>`;
    return `<li style="--u: var(--u-${u})">${el}</li>`;
  };
  const renderFiche = (id, animate) => {
    const s = SPACES[id];
    $("[data-f-lvl]").textContent = `${s.lvl} · ${s.kind}`;
    $("[data-f-name]").textContent = s.name;
    $("[data-f-desc]").textContent = s.desc;
    $("[data-f-rows]").innerHTML = KEYS.map((u) => row(id, u)).join("");
    $("[data-f-cta]").href = `espace/?e=${id}`;
    if (animate && !reduce && fiche.animate) {
      fiche.animate([{ opacity: 0.2, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
  };
  const sync = () => {
    $$(".sp-chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sp === selected)));
    $$(".esp").forEach((c) => c.classList.toggle("is-sel", c.dataset.esp === selected));
  };
  const select = (id) => {
    const changed = id !== selected;
    selected = id;
    renderFiche(id, changed);
    sync();
    show(id);
  };
  const toBoard = (force) => {
    const b = board.getBoundingClientRect();
    if (!force && b.top > 100 && b.bottom < innerHeight) return;
    board.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  coupe.addEventListener("pointerover", (e) => {
    const h = e.target.closest(".hit");
    if (h) preview(h.dataset.space);
  });
  coupe.addEventListener("pointerleave", () => preview(null));
  coupe.addEventListener("click", (e) => {
    const h = e.target.closest(".hit");
    if (h) select(h.dataset.space);
  });
  $$("[data-sp]").forEach((el) => {
    el.addEventListener("pointerenter", () => preview(el.dataset.sp));
    el.addEventListener("pointerleave", () => preview(null));
    el.addEventListener("focus", () => preview(el.dataset.sp));
    el.addEventListener("blur", () => preview(null));
    if (!el.classList.contains("sp-tab")) el.addEventListener("click", () => select(el.dataset.sp));
  });

  const espGrid = $("[data-esp-grid]");
  const swatchCard = (id, u) => {
    const s = SPACES[id];
    if (!DATA) return `<span class="es-ph" aria-hidden="true"></span>`;
    const p = H.spread(H.inSpace(DATA, u, id), s.cats[u], 1)[0];
    if (!p) return `<span class="es-na" style="--u: var(--u-${u})"><span class="es-x"></span><span><b>Hors périmètre</b><small><i></i>${UN(u)}</small></span></span>`;
    const ci = H.topCi(p);
    return `<a href="${D.productUrl(p, ci)}" style="--u: var(--u-${u})"><img src="${esc(D.swatch(p, ci))}" alt="" width="40" height="40" loading="lazy" decoding="async"><span><b>${esc(p.t)}</b><small><i></i>${UN(u)}</small></span></a>`;
  };
  const renderEsp = () => {
    espGrid.innerHTML = ORDER.map((id) => {
      const s = SPACES[id];
      const uni = KEYS.map((u) => {
        const na = !s.cats[u].length;
        const n = DATA ? H.inSpace(DATA, u, id).length : 0;
        const body = `<i></i><span>${esc(s.u[u][2])}</span>${n ? `<small>${nf.format(n)}</small>` : ""}`;
        return `<li style="--u: var(--u-${u})">${na ? `<span class="eu na">${body}</span>` : `<a class="eu" href="${D.universeUrl(u, { es: id })}">${body}</a>`}</li>`;
      }).join("");
      return `<article class="esp" data-esp="${id}">
      <a class="esp-fig" href="espace/?e=${id}" aria-label="Ouvrir l'espace ${esc(s.name)}">
        ${H.mini(id)}
        <span class="esp-lvl">${s.lvl}</span>
      </a>
      <div class="esp-body">
        <div class="esp-title"><h3><a href="espace/?e=${id}">${esc(s.name)}</a></h3><span class="esp-kind">${s.kind}</span></div>
        <div class="esp-sw">${KEYS.map((u) => swatchCard(id, u)).join("")}</div>
        <ul class="esp-u">${uni}</ul>
        <div class="esp-foot">
          <button class="link-arrow" type="button" data-goto="${id}">Voir dans la coupe <svg><use href="#i-up"/></svg></button>
          <a class="link-arrow" href="espace/?e=${id}">Voir l'espace <svg><use href="#i-arrow"/></svg></a>
        </div>
      </div>
    </article>`;
    }).join("");
    sync();
  };
  espGrid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    select(b.dataset.goto);
    toBoard(true);
  });

  renderFiche(selected, false);
  renderEsp();
  if (reduce) show(selected);
  else setTimeout(() => { if (!shown) show(selected); }, 450);

  const fmtCache = {};
  const fmt = (v, d = 0) => {
    fmtCache[d] = fmtCache[d] || new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
    return fmtCache[d].format(v);
  };
  const sgn = (v, d) => `${v < 0 ? "−" : "+"}${fmt(Math.abs(v), d)}`;
  const form = $("[data-metre]");
  const inp = { n: $("#m-n"), s: $("#m-s"), h: $("#m-h"), w: $("#m-w") };
  const OUTS = {
    n: (v) => `${fmt(v)}<small>${v > 1 ? "chambres" : "chambre"}</small>`,
    s: (v) => `${fmt(v)}<small>m²</small>`,
    h: (v) => `${fmt(v, 2)}<small>m</small>`,
    w: (v) => `${fmt(v, 2)}<small>m</small>`,
  };
  const table = (rows) => `<thead><tr><th scope="col"><span class="vh">Poste</span></th><th scope="col" class="n">par ch.</th><th scope="col" class="n">total</th></tr></thead><tbody>${rows.map(([l, a, b]) => `<tr><td>${l}</td><td class="n">${a}</td><td class="n">${b}</td></tr>`).join("")}</tbody>`;
  const tween = (el, to) => {
    const from = el._v ?? to;
    cancelAnimationFrame(el._raf);
    if (reduce || from === to) {
      el._v = to;
      el.textContent = fmt(to);
      return;
    }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 420);
      el._v = from + (to - from) * (1 - (1 - p) ** 3);
      el.textContent = fmt(Math.round(el._v));
      if (p < 1) el._raf = requestAnimationFrame(step);
      else el._v = to;
    };
    el._raf = requestAnimationFrame(step);
  };

  const wallSvg = $("[data-metre-wall]");
  const f1 = (v) => +v.toFixed(1);
  const dim = (ax, ay, bx, by, t, vert, dy = 12) => {
    const tick = (x, y) => `M${f1(x - 3)} ${f1(y + 3)}L${f1(x + 3)} ${f1(y - 3)}`;
    const tx = vert
      ? `<text x="${f1(ax + 12)}" y="${f1((ay + by) / 2)}" transform="rotate(-90 ${f1(ax + 12)} ${f1((ay + by) / 2)})" text-anchor="middle">${t}</text>`
      : `<text x="${f1((ax + bx) / 2)}" y="${f1(ay + dy)}" text-anchor="middle">${t}</text>`;
    return `<g class="dm"><line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}"/><path d="${tick(ax, ay)}${tick(bx, by)}"/>${tx}</g>`;
  };
  const drawWall = (side, h, w) => {
    const k = 36;
    const cx = 160;
    const base = 140;
    const W = side * k;
    const x0 = cx - W / 2;
    const x1 = cx + W / 2;
    const top = base - h * k;
    const ww = Math.min(w, side - 0.3) * k;
    const wx0 = cx - ww / 2;
    const wx1 = cx + ww / 2;
    const wTop = base - 2.3 * k;
    const wBot = base - 0.1 * k;
    const rod = wTop - 0.08 * k;
    const cl0 = Math.max(x0 + 1, wx0 - 0.24 * k);
    const cr1 = Math.min(x1 - 1, wx1 + 0.24 * k);
    const cw = 0.32 * k;
    const rect = (a, b, c, d, cls, fill = "") => `<rect class="${cls}" x="${f1(a)}" y="${f1(b)}" width="${f1(c - a)}" height="${f1(d - b)}"${fill ? ` fill="${fill}"` : ""}/>`;
    wallSvg.innerHTML = `<defs><linearGradient id="mw-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f4"/><stop offset="1" stop-color="#d4e0e3"/></linearGradient></defs>`
      + rect(x0, top, x1, base, "wl")
      + rect(wx0, wTop, wx1, wBot, "win")
      + rect(wx0, wTop, wx1, base - 0.02 * k, "vo", "url(#cp-voilage)")
      + rect(cl0, rod, cl0 + cw, base - 0.02 * k, "cur", "url(#cp-occultant)")
      + rect(cr1 - cw, rod, cr1, base - 0.02 * k, "cur", "url(#cp-occultant)")
      + `<line class="rod" x1="${f1(cl0 - 4)}" y1="${f1(rod)}" x2="${f1(cr1 + 4)}" y2="${f1(rod)}"/>`
      + `<line class="gl" x1="8" y1="${base}" x2="312" y2="${base}"/>`
      + dim(x0, base + 12, x1, base + 12, `√S ≈ ${fmt(side, 2)} m`, false, 13)
      + dim(wx0, (wTop + wBot) / 2, wx1, (wTop + wBot) / 2, `${fmt(w, 2)} m`, false, -5)
      + dim(x1 + 12, base, x1 + 12, top, `${fmt(h, 2)} m`, true);
  };

  let last = null;
  const compute = () => {
    const v = {};
    Object.entries(inp).forEach(([k, el]) => {
      v[k] = parseFloat(el.value);
      el.style.setProperty("--p", `${((v[k] - el.min) / (el.max - el.min)) * 100}%`);
      $(`[data-out="${k}"]`).innerHTML = OUTS[k](v[k]);
    });
    const { n, s, h, w } = v;
    const occ = w * 2 + 0.4;
    const tx = [["Occultant, 2 × l + 0,40", occ], ["Voilage, 2 × l + 0,40", occ], ["Tête de lit", 1.2], ["Plaid", 1.0]];
    const txRoom = tx.reduce((a, [, q]) => a + q, 0);
    const side = Math.sqrt(s);
    const gross = 4 * side * h;
    const win = w * 2.2;
    const door = 0.9 * 2.1;
    const net = gross - win - door;
    const waste = net * 0.1;
    const both = (q) => [fmt(q, 2), fmt(q * n, 1)];
    const signed = (q) => [sgn(q, 2), sgn(q * n, 1)];
    $('[data-t="textile"]').innerHTML = table(tx.map(([l, q]) => [l, ...both(q)]));
    $('[data-t="mural"]').innerHTML = table([
      ["Murs, 4 × √S × H", ...both(gross)],
      ["Fenêtre, l × 2,20", ...signed(-win)],
      ["Porte, 0,90 × 2,10", ...signed(-door)],
      ["Chutes, 10 %", ...signed(waste)],
    ]);
    $('[data-t="sol"]').innerHTML = table([["Surface utile", ...both(s)], ["Chutes, 7 %", ...signed(s * 0.07)]]);
    $('[data-t="mobilier"]').innerHTML = table([["Lit", 1], ["Chevets", 2], ["Bureau", 1], ["Chaise", 1], ["Fauteuil", 1]].map(([l, q]) => [l, fmt(q), fmt(q * n)]));
    tween($('[data-v="textile"]'), Math.ceil(txRoom * n));
    tween($('[data-v="mural"]'), Math.ceil(net * 1.1 * n));
    tween($('[data-v="sol"]'), Math.ceil(s * 1.07 * n));
    tween($('[data-v="mobilier"]'), 6 * n);
    drawWall(side, h, w);
    last = { n, s, h, w, occ, net };
  };
  form.addEventListener("input", compute);
  form.addEventListener("submit", (e) => e.preventDefault());
  compute();

  const CH = "chambres";
  const OPTS = { textile: [], mural: [], sol: [], mobilier: [] };
  const choice = { textile: 0, mural: 0, sol: 0, mobilier: 0 };
  const pool = (u, f) => H.inSpace(DATA, u, CH).filter(f);
  const byStock = (a, b) => b.stock - a.stock;
  const META = {
    textile: (p) => p.feu || (p.cp ? "Coupe dès 3 ml" : p.pack),
    mural: (p) => p.feu,
    sol: (p) => `${p.cat === "parquets" ? "Parquet" : "Moquette"} · ${p.feu}`,
    mobilier: (p) => `${p.c.length} finitions`,
  };
  const buildOpts = () => {
    OPTS.textile = pool("textile", (p) => p.cat === "occultants").sort((a, b) => (b.cp ? 1 : 0) - (a.cp ? 1 : 0) || byStock(a, b)).slice(0, 3);
    OPTS.mural = pool("mural", (p) => p.cat === "vinyles").sort(byStock).slice(0, 3);
    const moq = pool("sol", (p) => p.cat === "moquettes").sort(byStock);
    const par = pool("sol", (p) => p.cat === "parquets").sort(byStock);
    OPTS.sol = [moq[0], par[0], moq[1]].filter(Boolean);
    OPTS.mobilier = pool("mobilier", (p) => p.gen === "lit").sort(byStock).slice(0, 3);
  };
  const chosen = (u) => {
    const p = OPTS[u][choice[u]];
    return p ? { p, ci: H.topCi(p) } : null;
  };
  const extras = () => {
    const t = chosen("textile");
    const m = chosen("mobilier");
    const tHex = t ? t.p.c[t.ci].h : "#8c7a6b";
    const mHex = m ? m.p.c[m.ci].h : "#8b6a50";
    const near = (u, f, hex) => H.nearest(pool(u, f), hex);
    return {
      textile: [
        ["voilage", near("textile", (p) => p.cat === "voilages", "#efe9df"), (v) => v.occ],
        ["tête de lit et plaid", near("textile", (p) => p.cat === "velours" || p.cat === "chenilles", tHex), () => 2.2],
      ],
      mobilier: [
        ["chevets", near("mobilier", (p) => p.gen === "chevet", mHex), () => 2],
        ["bureau", near("mobilier", (p) => p.gen === "bureau", mHex), () => 1],
        ["chaise", near("mobilier", (p) => p.cat === "chaises", mHex), () => 1],
        ["fauteuil", near("mobilier", (p) => p.cat === "fauteuils", mHex), () => 1],
      ],
    };
  };
  const renderPick = (u) => {
    const host = $(`[data-pick="${u}"]`);
    const list = OPTS[u];
    if (!list.length) {
      host.innerHTML = "";
      return;
    }
    const opts = list.map((p, i) => {
      const ci = H.topCi(p);
      const on = i === choice[u];
      return `<label class="po${on ? " is-on" : ""}"><input class="vh" type="radio" name="pk-${u}" value="${i}"${on ? " checked" : ""}>${D.visual(p, ci, { cls: "po-v" })}<span class="po-t">${esc(p.t)}</span><span class="po-m">${esc(META[u](p))}</span></label>`;
    }).join("");
    host.innerHTML = `<p class="pick-h">${u === "mobilier" ? "Lit proposé" : "Produit proposé"}</p><div class="pick-o" role="radiogroup" aria-label="Produit proposé, ${UN(u)}">${opts}</div>${u === "textile" || u === "mobilier" ? `<p class="pick-x" data-x="${u}"></p>` : ""}`;
  };
  const renderExtras = () => {
    const ex = extras();
    ["textile", "mobilier"].forEach((u) => {
      const el = $(`[data-x="${u}"]`);
      if (!el) return;
      const parts = ex[u].filter(([, x]) => x).map(([l, x]) => `${l} ${x.p.t}`);
      el.textContent = parts.length ? `Complété par : ${parts.join(" · ")}${u === "mobilier" ? ", finitions assorties" : ""}.` : "";
    });
  };
  $(".metre-out").addEventListener("change", (e) => {
    const i = e.target.closest('input[type="radio"]');
    if (!i) return;
    const u = i.name.slice(3);
    choice[u] = +i.value;
    $$(`[data-pick="${u}"] .po`).forEach((l, k) => l.classList.toggle("is-on", k === choice[u]));
    renderExtras();
  });

  $("[data-add]").addEventListener("click", () => {
    if (!DATA || !last) {
      H.toast("Le catalogue se charge, réessayez dans un instant.");
      return;
    }
    const { n, s, occ, net } = last;
    const ex = extras();
    const items = [];
    const push = (x, q) => { if (x) items.push(H.line(x.p, x.ci, q)); };
    push(chosen("textile"), occ * n);
    ex.textile.forEach(([, x, f]) => push(x, f(last) * n));
    push(chosen("mural"), net * 1.1 * n);
    push(chosen("sol"), s * 1.07 * n);
    push(chosen("mobilier"), n);
    ex.mobilier.forEach(([, x, f]) => push(x, f(last) * n));
    const fresh = H.put(items);
    const verb = fresh === items.length ? "ajoutées au" : "mises à jour dans le";
    H.toast(`${items.length} lignes ${verb} projet, pour ${fmt(n)} ${n > 1 ? "chambres" : "chambre"}.`, "../projet/", "Voir le projet");
  });

  const fillLive = () => {
    const st = DATA.stats;
    const tot = (k) => KEYS.reduce((a, u) => a + st[u][k], 0);
    $('[data-lc="products"]').textContent = nf.format(tot("products"));
    $('[data-lc="colors"]').textContent = nf.format(tot("colors"));
    $('[data-lc="countries"]').textContent = nf.format(new Set(DATA.all.map((p) => p.o).filter(Boolean)).size);
    KEYS.forEach((u) => {
      $(`[data-lc-u="${u}"]`).textContent = `${nf.format(st[u].products)} réf. · ${D.qty(st[u].stock, D.UNIVERS[u].unit)} en stock`;
      $(`[data-st="${u}"]`).textContent = ` · ${nf.format(st[u].products)} réf.`;
    });
  };

  D.load().then((data) => {
    DATA = data;
    renderFiche(selected, false);
    renderEsp();
    buildOpts();
    KEYS.forEach(renderPick);
    renderExtras();
    fillLive();
  });

  const PH = {
    tout: ["moquette couloir Cfl-s1…", "velours lobby EN 1021…", "fauteuil de chambre…", "vinyle lessivable couloir…", "occultant chambre M1…"],
    textile: ["occultant blanc 280 cm…", "velours lobby EN 1021…", "microfibre spa…"],
    mural: ["vinyle lessivable couloir…", "panneau acoustique restaurant…"],
    sol: ["moquette trafic intense…", "grès antidérapant spa…"],
    mobilier: ["chaise empilable terrasse…", "fauteuil de chambre…"],
  };
  let scope = "tout";
  let ph = 0;
  const inputs = $$("[data-rotate]");
  const setPh = () => inputs.forEach((i) => {
    const list = PH[scope];
    i.placeholder = list[ph % list.length];
  });
  if (!reduce) {
    setInterval(() => {
      if (inputs.some((i) => i === document.activeElement || i.value)) return;
      ph += 1;
      setPh();
    }, 3200);
  }
  $$("[data-scope-select]").forEach((sel) => sel.addEventListener("change", () => {
    scope = sel.value || "tout";
    ph = 0;
    setPh();
  }));
})();
