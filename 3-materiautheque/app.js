(() => {
  const D = window.DCHR;
  const B = window.MBox;
  const { $, $$, esc, num, UNIVERS, U_ORDER, MATIERES, COLOR_FAMILIES } = D;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const PER = 16;

  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = (v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const labOf = (hex) => {
    const [R, G, B2] = hexRgb(hex).map(lin);
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const x = f((R * 0.4124 + G * 0.3576 + B2 * 0.1805) / 0.95047);
    const y = f(R * 0.2126 + G * 0.7152 + B2 * 0.0722);
    const z = f((R * 0.0193 + G * 0.1192 + B2 * 0.9505) / 1.08883);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };
  const far = (a, b) => Math.hypot(0.5 * (a[0] - b[0]), 1.4 * (a[1] - b[1]), 1.4 * (a[2] - b[2]));
  const rng = (s) => {
    let seed = s;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  };
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const loaded = (img) => (img.complete ? Promise.resolve() : new Promise((res) => {
    img.addEventListener("load", res, { once: true });
    img.addEventListener("error", res, { once: true });
  }));

  const FAMS = COLOR_FAMILIES.map((f) => ({ ...f, lab: labOf(f.h) }));
  const FAM_LAB = Object.fromEntries(FAMS.map((f) => [f.k, f.lab]));
  const FAM_ORDER = FAMS.map((f) => f.k);

  const pickWall = (data) => {
    const picked = [];
    const total = Object.fromEntries(FAM_ORDER.map((k) => [k, 0]));
    U_ORDER.forEach((u) => {
      const cats = data.stats[u].cats.map((cat) => data.by[u].filter((p) => p.cat === cat.k).flatMap((p) => p.c.map((c, ci) => ({ p, ci, c, u, hex: c.h, lab: labOf(c.h), fam: D.familyOf(c.h) }))));
      const mine = [];
      const own = Object.fromEntries(FAM_ORDER.map((k) => [k, 0]));
      const used = new Set();
      let strict = true;
      let guard = 0;
      while (mine.length < PER && guard < 60) {
        guard += 1;
        let added = 0;
        cats.forEach((list) => {
          if (mine.length >= PER) return;
          const cands = list.filter((x) => !used.has(x.p));
          if (!cands.length) return;
          const need = (k) => total[k] + 2 * own[k];
          const fams = [...new Set(cands.map((x) => x.fam))].sort((a, b) => need(a) - need(b) || FAM_ORDER.indexOf(a) - FAM_ORDER.indexOf(b));
          let best = null;
          fams.some((fam) => {
            let bs = Infinity;
            cands.filter((x) => x.fam === fam).forEach((x) => {
              const near = mine.reduce((m, y) => Math.min(m, far(y.lab, x.lab)), 99);
              if (strict && near < 9) return;
              const all = picked.reduce((m, y) => Math.min(m, far(y.lab, x.lab)), 99);
              const s = far(x.lab, FAM_LAB[fam]) - (x.c.s > 0 ? 3 : 0) + (all < 4 ? 8 : 0) - (strict ? 0 : Math.min(near, 30));
              if (s < bs) {
                bs = s;
                best = x;
              }
            });
            return Boolean(best);
          });
          if (!best) return;
          mine.push(best);
          used.add(best.p);
          own[best.fam] += 1;
          added += 1;
        });
        if (!added) strict = false;
      }
      mine.forEach((x) => { total[x.fam] += 1; });
      picked.push(...mine);
    });
    return picked;
  };

  const wall = $("[data-wall]");
  wall.innerHTML = '<span class="tile tile-ph"></span>'.repeat(PER * U_ORDER.length);
  let tiles = [];
  let data = null;

  const tileHtml = (t) => `<div class="tile" data-i="${t.i}" style="--u: var(--u-${t.u})"><button class="tile-b" type="button" aria-pressed="false" aria-label="${esc(`${t.p.t}, ${t.c.n}, ${UNIVERS[t.u].n}`)}"><span class="tile-m"><img class="m" src="${esc(t.src)}" alt="" decoding="async"></span><span class="tile-cap"><i></i><b>${esc(t.p.t)}</b><em>${esc(t.c.n)} · ${UNIVERS[t.u].n}</em></span><span class="tile-add" aria-hidden="true"><svg><use href="#i-plus"/></svg></span><span class="tile-n" aria-hidden="true"></span></button><a class="tile-go" href="${esc(t.href)}" aria-label="${esc(`Fiche ${t.p.t}, ${t.c.n}`)}"><svg aria-hidden="true"><use href="#i-out"/></svg></a></div>`;

  let rows = 4;
  const readRows = () => parseInt(getComputedStyle(wall).getPropertyValue("--rows"), 10) || 4;
  const light = (a, b) => b.lab[0] - a.lab[0];
  const byColour = (list) => {
    const s = [...list].sort(light);
    const out = [];
    for (let i = 0; i < s.length; i += rows) out.push(...s.slice(i, i + rows).sort((a, b) => b.lab[2] - a.lab[2]));
    return out;
  };
  const byUnivers = (list) => U_ORDER.flatMap((u) => list.filter((t) => t.u === u).sort(light));

  const place = (seq, animate) => {
    const focused = document.activeElement;
    const first = animate ? new Map(seq.map((t) => [t, t.el.getBoundingClientRect()])) : null;
    seq.forEach((t) => t.el.getAnimations().forEach((a) => a.cancel()));
    wall.append(...seq.map((t) => t.el));
    if (focused && wall.contains(focused) && document.activeElement !== focused) focused.focus({ preventScroll: true });
    if (!first) return;
    const last = seq.map((t) => t.el.getBoundingClientRect());
    seq.forEach((t, i) => {
      const a = first.get(t);
      const b = last[i];
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      t.el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 760, delay: Math.min(i * 9, 320), easing: EASE, fill: "backwards" });
    });
  };

  const state = { chip: null, unis: new Set(U_ORDER), sort: "couleur" };
  const inChip = (t, c) => t.fam === c.k;
  const isOn = (t) => state.unis.has(t.u) && (!state.chip || inChip(t, state.chip));
  const sumEl = $("[data-summary]");
  const statusEl = $("[data-sort-status]");
  const gradEl = $("[data-grad]");
  const resEl = $("[data-res]");
  let sorted = false;

  const plural = (n, one, many) => `${num(n)} ${n > 1 ? many : one}`;
  const renderSummary = (on) => {
    const counts = U_ORDER.filter((u) => state.unis.has(u)).map((u) => [u, on.filter((t) => t.u === u).length]);
    if (state.chip) counts.sort((a, b) => b[1] - a[1]);
    const head = state.chip ? `<b>${esc(state.chip.n)}</b>` : `<b>${plural(on.length, "échantillon", "échantillons")}</b>`;
    sumEl.innerHTML = head + counts.map(([u, n]) => `<span class="sum-u${n ? "" : " is-zero"}" style="--u: var(--u-${u})"><i></i>${n} ${u}</span>`).join("");
  };
  const renderRes = () => {
    if (!data) return;
    const f = state.chip;
    const all = U_ORDER.reduce((a, u) => a + data.stats[u].products, 0);
    const links = U_ORDER.map((u) => {
      const n = f ? data.by[u].filter((p) => p.fams.includes(f.k)).length : data.stats[u].products;
      const head = `<span class="nu-go-u"><i></i>${UNIVERS[u].n}</span>`;
      if (!n) return `<span class="nu-go is-zero" style="--u: var(--u-${u})">${head}<span class="nu-go-n">Aucun produit dans cette teinte</span></span>`;
      const label = f ? (n > 1 ? `Voir les ${num(n)} produits` : "Voir le produit") : plural(n, "référence", "références");
      return `<a class="nu-go" style="--u: var(--u-${u})" href="${esc(f ? D.universeUrl(u, { fam: f.k }) : D.universeUrl(u))}">${head}<span class="nu-go-n">${label}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a>`;
    }).join("");
    resEl.innerHTML = `<p class="nu-res-t">${f ? `<b>${esc(f.n)}</b> dans les quatre catalogues` : `<b>${plural(all, "référence", "références")}</b> dans les quatre catalogues`}</p><div class="nu-res-l">${links}</div>`;
  };
  const apply = (animate) => {
    renderRes();
    if (!tiles.length) return;
    const on = tiles.filter(isOn);
    const off = tiles.filter((t) => !isOn(t));
    const sorter = state.sort === "univers" ? byUnivers : byColour;
    tiles.forEach((t) => t.el.classList.toggle("is-out", !isOn(t)));
    place([...sorter(on), ...sorter(off)], animate && !reduce);
    renderSummary(on);
    const g = [...on].sort(light).map((t) => t.hex);
    gradEl.style.background = g.length > 1 ? `linear-gradient(90deg, ${g.join(", ")})` : g[0] || "";
    if (sorted) statusEl.textContent = state.sort === "univers" ? "Par univers, puis du clair au foncé" : "Du plus clair au plus foncé";
  };

  const chipsEl = $("[data-chips]");
  const stripe = FAMS.map((c, i) => `${c.h} ${((i / FAMS.length) * 100).toFixed(2)}% ${(((i + 1) / FAMS.length) * 100).toFixed(2)}%`).join(", ");
  chipsEl.innerHTML = `<button class="chip" type="button" data-chip="" aria-pressed="true" style="--c: linear-gradient(90deg, ${stripe})"><span class="chip-c"></span><span class="chip-t">Tout</span></button>${FAMS.map((c) => `<button class="chip" type="button" data-chip="${c.k}" aria-pressed="false" style="--c: ${c.h}"><span class="chip-c"></span><span class="chip-t">${esc(c.n)}</span></button>`).join("")}`;
  const syncChips = () => $$(".chip", chipsEl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.chip === (state.chip ? state.chip.k : ""))));
  chipsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    const k = b.dataset.chip;
    state.chip = !k || (state.chip && state.chip.k === k) ? null : FAMS.find((c) => c.k === k);
    syncChips();
    apply(true);
  });

  const uniBtns = $$(".u-tog");
  const syncUnis = () => uniBtns.forEach((b) => b.setAttribute("aria-pressed", String(state.unis.has(b.dataset.u))));
  uniBtns.forEach((b) => b.addEventListener("click", () => {
    const u = b.dataset.u;
    if (!state.unis.has(u)) state.unis.add(u);
    else if (state.unis.size === 1) state.unis = new Set(U_ORDER);
    else state.unis.delete(u);
    syncUnis();
    apply(true);
  }));

  $$("[data-sort]").forEach((b) => b.addEventListener("click", () => {
    state.sort = b.dataset.sort;
    $$("[data-sort]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    apply(true);
  }));

  wall.addEventListener("click", (e) => {
    const b = e.target.closest(".tile-b");
    if (!b) return;
    const t = tiles[Number(b.parentNode.dataset.i)];
    if (t) B.toggle(t.p, t.ci, $(".tile-m", t.el));
  });

  ["(max-width: 980px)", "(max-width: 560px)"].forEach((q) => matchMedia(q).addEventListener("change", () => {
    rows = readRows();
    apply(false);
  }));

  const kitEl = $("[data-kit]");
  const kitCap = $("[data-kit-cap]");
  const TILT = [-2.5, 1.5, -1, 2.2, 1.2, -2, 2.6, -1.4];
  let kitSig = "";
  let kitDemo = [];
  const renderKit = (items) => {
    const list = items.length ? items.filter((it) => it.p).map((it) => ({ u: it.u, src: D.swatch(it.p, it.ci), key: it.key })) : kitDemo;
    const sig = items.length ? list.map((x) => x.key).join() : "demo";
    if (sig === kitSig) return;
    kitSig = sig;
    kitEl.innerHTML = Array.from({ length: B.MAX }, (_, i) => {
      const x = list[i];
      return `<div class="kc">${x ? `<div class="kc-m" style="--r: ${TILT[i]}deg; --u: var(--u-${x.u})"><img class="m" src="${esc(x.src)}" alt=""></div>` : ""}</div>`;
    }).join("");
    kitCap.textContent = items.length ? `Votre boîte · ${plural(items.length, "échantillon", "échantillons")} sur ${B.MAX}` : "Exemple de boîte · elle se remplit avec vos choix";
  };

  const ROWS = [
    { k: "bois", tone: "#a67d51", d: "Parquets, lames et lambris, plateaux et piètements." },
    { k: "laine", tone: "#b9a382", d: "Tissée, tuftée ou feutrée." },
    { k: "velours", tone: "#6b2f33", d: "Des assises aux têtes de lit." },
    { k: "pierre", tone: "#cfc8bd", d: "Et les matières qui en prennent l'aspect." },
    { k: "lin", tone: "#d4c9b6", d: "Rideaux, voilages et murs tendus." },
    { k: "fibre", tone: "#8f8174", d: "Moquettes, occultants et tissus d'extérieur." },
  ];
  const NOUN = { bois: "bois", laine: "laine", velours: "velours", pierre: "pierre", lin: "lin", fibre: "fibres techniques" };
  const PREP = { textile: "dans le textile", mural: "au mur", sol: "au sol", mobilier: "dans le mobilier" };
  const pickFor = (u, m, tone) => {
    const t = labOf(tone);
    let best = null;
    let bs = Infinity;
    data.by[u].filter((p) => p.ma.includes(m)).forEach((p) => p.c.forEach((c, ci) => {
      const s = far(labOf(c.h), t) - (c.s > 0 ? 4 : 0) - (p.n ? 2 : 0);
      if (s < bs) {
        bs = s;
        best = { p, ci };
      }
    }));
    return best;
  };
  const cell = (u, row) => {
    const head = `<span class="mx-u"><i></i>${UNIVERS[u].n}</span>`;
    const pick = pickFor(u, row.k, row.tone);
    if (!pick) return `<div class="mx-cell is-na" style="--u: var(--u-${u})">${head}<div class="mx-sw is-na" aria-hidden="true">–</div><div class="mx-t"><p class="mx-n na">Pas de ${NOUN[row.k]} ${PREP[u]}</p></div></div>`;
    const { p, ci } = pick;
    const c = p.c[ci];
    const href = esc(D.productUrl(p, ci));
    return `<div class="mx-cell" data-fly style="--u: var(--u-${u})">${head}<a class="mx-sw" href="${href}" tabindex="-1" aria-hidden="true">${D.visual(p, ci)}</a><div class="mx-t"><a class="mx-n" href="${href}">${esc(p.t)}</a><p class="mx-d">${esc(c.n)} · ${esc(UNIVERS[u].unitLong)}</p></div><div class="mx-act"><button class="smp" type="button" data-sample="${esc(B.keyOf({ u, h: p.h, k: c.k }))}" aria-pressed="false" aria-label="${esc(`Échantillon ${p.t}, ${c.n}`)}"></button><a class="mx-link" href="${esc(D.universeUrl(u, { cat: p.cat }))}"><span>${esc(p.catName)}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div></div>`;
  };
  const renderMatrix = () => {
    $("[data-mx]").insertAdjacentHTML("beforeend", ROWS.map((row) => {
      const counts = U_ORDER.map((u) => data.by[u].filter((p) => p.ma.includes(row.k)).length);
      const nU = counts.filter(Boolean).length;
      const total = counts.reduce((a, n) => a + n, 0);
      const href = `matiere/?m=${row.k}`;
      return `<article class="mx-row"><div class="mx-fam"><h3><a href="${href}">${esc(MATIERES[row.k])}</a></h3><p>${esc(row.d)}</p><span class="mono">${nU} univers sur 4 · ${plural(total, "référence", "références")}</span><a class="mx-more" href="${href}">La page matière <svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div>${U_ORDER.map((u) => cell(u, row)).join("")}</article>`;
    }).join(""));
  };

  const renderFacts = () => {
    let refs = 0;
    let cols = 0;
    U_ORDER.forEach((u) => {
      const s = data.stats[u];
      refs += s.products;
      cols += s.colors;
      const el = $(`[data-fact="${u}"]`);
      if (el) el.textContent = `${plural(s.products, "référence", "références")} · ${num(s.colors)} coloris`;
    });
    const all = $("[data-fact-all]");
    if (all) all.textContent = `${plural(refs, "référence", "références")} · ${num(cols)} coloris · ${U_ORDER.length} univers`;
  };

  const build = () => {
    renderFacts();
    tiles = pickWall(data).map((x, i) => ({ ...x, i, key: B.keyOf({ u: x.u, h: x.p.h, k: x.c.k }), src: D.swatch(x.p, x.ci), href: D.productUrl(x.p, x.ci) }));
    wall.innerHTML = tiles.map(tileHtml).join("");
    tiles.forEach((t) => {
      t.el = wall.children[t.i];
      t.btn = $(".tile-b", t.el);
      t.num = $(".tile-n", t.el);
    });
    const byU = Object.fromEntries(U_ORDER.map((u) => [u, tiles.filter((t) => t.u === u)]));
    kitDemo = [0, 6].flatMap((j) => U_ORDER.map((u) => byU[u][j]).filter(Boolean)).map((t) => ({ u: t.u, src: t.src }));
    rows = readRows();
    if (reduce) {
      sorted = true;
      apply(false);
    } else {
      const r = rng(42);
      const mixed = [...tiles];
      for (let i = mixed.length - 1; i > 0; i -= 1) {
        const j = Math.floor(r() * (i + 1));
        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
      }
      place(mixed, false);
      mixed.forEach((t, i) => t.el.style.setProperty("--d", `${i * 12}ms`));
      tiles.forEach((t) => t.el.classList.toggle("is-out", !isOn(t)));
      renderSummary(tiles.filter(isOn));
      renderRes();
      Promise.all([Promise.race([Promise.all(tiles.map((t) => loaded($("img", t.el)))), wait(2500)]), wait(1100)]).then(() => {
        sorted = true;
        apply(true);
      });
    }
    renderMatrix();
    B.on((items) => {
      const keys = items.map((it) => it.key);
      tiles.forEach((t) => {
        const i = keys.indexOf(t.key);
        t.el.classList.toggle("is-on", i >= 0);
        t.btn.setAttribute("aria-pressed", String(i >= 0));
        t.num.textContent = i >= 0 ? String(i + 1) : "";
      });
      renderKit(items);
    });
    B.refresh();
  };

  D.load().then((d) => {
    data = d;
    build();
  });

  $("[data-signup]").addEventListener("click", () => D.toast("Prototype : l'ouverture du compte pro sera branchée ici, un seul compte pour les quatre univers."));

  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    const tab = $(`[data-spy="${en.target.id}"]`);
    if (tab) tab.classList.toggle("is-hot", en.isIntersecting);
  }), { rootMargin: "-40% 0px -55% 0px" });
  ["mur", "matieres"].forEach((id) => spy.observe(document.getElementById(id)));

  const PH = {
    "": ["velours bleu non feu M1…", "moquette Cfl-s1 trafic intense…", "enduit à la chaux sauge…", "fauteuil velours pour lobby…"],
    textile: ["velours bleu non feu M1…", "occultant blanc 280 cm…", "bouclette écrue Martindale 50 000…"],
    mural: ["vinyle lessivable B-s2,d0…", "panneau acoustique chêne…"],
    sol: ["moquette Cfl-s1 trafic intense…", "parquet point de Hongrie…"],
    mobilier: ["chaise empilable hêtre…", "fauteuil de chambre à recouvrir…"],
  };
  let scope = "";
  let phIndex = 0;
  const input = $("[data-rotate]");
  const setPlaceholder = () => {
    const ph = PH[scope] || PH[""];
    input.placeholder = ph[phIndex % ph.length];
  };
  if (!reduce) {
    setInterval(() => {
      if (input === document.activeElement || input.value) return;
      phIndex += 1;
      setPlaceholder();
    }, 3200);
  }
  $("[data-scope-select]").addEventListener("change", (e) => {
    scope = e.target.value;
    phIndex = 0;
    setPlaceholder();
  });
})();
