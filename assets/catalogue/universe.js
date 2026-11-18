(() => {
  const D = window.DCHR;
  if (!D) return;
  const { $, $$, esc, num, nf, qty, UNIVERS, U_ORDER, SPACES, MATIERES, COLOR_FAMILIES, ROOT } = D;
  const PAGE = document.body.dataset.page || "univers";
  const U = document.body.dataset.univers || "";
  const PER = 24;

  const PATHS = {
    arrow: "M5 12h14M13 6l6 6-6 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    x: "M6 6l12 12M18 6 6 18",
    sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    box: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10",
    bag: "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
    warn: "M12 4 2.5 20h19zM12 10v4M12 17v.5",
    truck: "M2 7h12v9H2zM14 10h4l3 3v3h-7M6 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5",
    pencil: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
    chev: "m6 9 6 6 6-6",
    check: "m5 12 5 5 9-10",
  };
  const ic = (k, cls = "") => `<svg class="ico${cls ? ` ${cls}` : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[k]}"/></svg>`;

  const qp = () => new URLSearchParams(location.search);
  const home = () => `${ROOT}${D.prop()}/`;
  const uName = (u) => UNIVERS[u].n;
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const termsOf = (q) => norm(q).split(/\s+/).filter((t) => t.length > 1);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  const hdrH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr-h")) || 119;
  const scrollToEl = (el, gap = 12) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - hdrH() - gap;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? "auto" : "smooth" });
  };

  const colWord = (p, n = 1) => (p.u === "mobilier" ? (n > 1 ? "finitions" : "finition") : "coloris");
  const colLabel = (p, c) => (p.u === "textile" ? `Coloris ${c.k}` : `${c.n} ${c.k}`);
  const colInline = (p, c) => (p.u === "textile" ? `coloris ${c.k}` : `${c.n} ${c.k}`);
  const colRef = (p, c) => (p.u === "mobilier" ? `de la finition ${c.n} ${c.k}` : p.u === "textile" ? `du coloris ${c.k}` : `du coloris ${c.n} ${c.k}`);
  const famOf = (c) => {
    if (c._f === undefined) c._f = D.familyOf(c.h);
    return c._f;
  };
  const famRow = (k) => COLOR_FAMILIES.find((f) => f.k === k) || { k, n: k, h: "#cccccc" };
  const matLabel = (k) => {
    const s = String(MATIERES[k] || k).replace(/^(les|le|la|l')\s*/i, "");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const feuList = (p) => (p.feu && p.feu !== "–" ? p.feu.split(" · ").map((s) => s.trim()).filter(Boolean) : []);
  const stepOf = (p) => (p.u === "textile" ? (p.cp ? 0.5 : p.min) : 1);
  const minOf = (p) => Math.max(stepOf(p), p.min || 1);
  const snap = (p, v) => {
    const st = stepOf(p);
    const x = Math.max(minOf(p), Number.isFinite(v) ? v : minOf(p));
    return Math.round(Math.ceil(x / st - 1e-9) * st * 100) / 100;
  };
  const parseNum = (s) => parseFloat(String(s ?? "").replace(/\s/g, "").replace(",", "."));
  const fq = (v) => num(v, v % 1 ? 1 : 0);
  const minNote = (p) => {
    if (p.u === "textile") return p.cp ? `Coupe dès ${fq(p.min)} ml, par pas de 0,5 ml` : `Par rouleau entier de ${fq(p.min)} m`;
    if (p.u === "mobilier") return p.min > 1 ? `À partir de ${p.min} pièces` : "À l'unité, dès 1 pièce";
    return `Minimum ${qty(p.min, p.unit)}, par pas de 1 m²`;
  };
  const stockOf = (p, c) => {
    if (c.s > 0) return `<span class="ok">● ${qty(c.s, p.unit)} en stock</span>`;
    return p.u === "mobilier" ? `<span class="wait">● ${esc(p.dl)}</span>` : '<span class="wait">● Sur commande · délai usine</span>';
  };
  const bestCi = (p, o = {}) => {
    const fam = o.fam || [];
    const min = o.min || 0;
    const ok = p.c.map((c) => (!fam.length || fam.includes(famOf(c))) && (!min || (c.s || 0) >= min));
    const terms = o.q ? termsOf(o.q) : [];
    const hit = (c) => terms.some((t) => norm(c.n).includes(t) || norm(famRow(famOf(c)).n).includes(t));
    let i = terms.length ? p.c.findIndex((c, j) => ok[j] && hit(c)) : -1;
    if (i < 0) i = ok.indexOf(true);
    if (i < 0 && fam.length) i = p.c.findIndex((c) => fam.includes(famOf(c)));
    return Math.max(0, i);
  };

  const FAB_ML = { chaise: 1.5, bistrot: 1, tabouret: 1, fauteuil: 3, lounge: 3.5, canape: 8, banquette: 6, lit: 5, "tete-de-lit": 4, transat: 2.5 };
  const CAT_ML = { chaises: 1.5, fauteuils: 3, canapes: 8, chambre: 4, exterieur: 3 };
  const fabPer = (m) => FAB_ML[m.gen] || CAT_ML[m.cat] || 2;
  const fabImg = (t, i) => t.c[i].img || t.img;
  const fabKey = (f) => `${f.t.h}:${f.t.c[f.ci].k}`;
  const withFab = (url, f) => (f ? `${url}${url.includes("?") ? "&" : "?"}tissu=${encodeURIComponent(fabKey(f))}` : url);
  const defaultFabric = (m) => {
    if (m.cat === "exterieur") return `${D.IMG}outdoor.jpg`;
    if (m.ma.includes("cuir")) return `${D.IMG}cuir.jpg`;
    if (m.ma.includes("laine")) return `${D.IMG}texture.jpg`;
    if (m.ma.includes("velours")) return `${D.IMG}velours.jpg`;
    return `${D.IMG}chenille.jpg`;
  };
  const parseFab = (data, s) => {
    if (!s) return null;
    const i = s.lastIndexOf(":");
    if (i < 1) return null;
    const t = data.get("textile", s.slice(0, i));
    const ci = t ? t.c.findIndex((c) => c.k === s.slice(i + 1)) : -1;
    return t && ci >= 0 ? { t, ci } : null;
  };
  let seatCache = null;
  const seatFabrics = (data) => {
    if (seatCache) return seatCache;
    const all = data.by.textile.filter((t) => t.us && t.us.includes("sieges"));
    const strong = all.filter((t) => (t.md || 0) >= 30000);
    const src = strong.length >= 24 ? strong : all;
    const used = new Set();
    const out = [];
    for (let round = 0; round < 4 && out.length < 24; round += 1) {
      COLOR_FAMILIES.forEach((f) => {
        if (out.length >= 24) return;
        let best = null;
        src.forEach((t) => {
          if (used.has(t.h)) return;
          t.c.forEach((c, i) => {
            if (famOf(c) !== f.k || !fabImg(t, i)) return;
            if (!best || (c.s || 0) > (best.t.c[best.ci].s || 0)) best = { t, ci: i };
          });
        });
        if (best) {
          used.add(best.t.h);
          out.push(best);
        }
      });
    }
    const rank = (o) => COLOR_FAMILIES.findIndex((f) => f.k === famOf(o.t.c[o.ci]));
    seatCache = out.sort((a, b) => rank(a) - rank(b));
    return seatCache;
  };
  const pickGarni = (data, t) => {
    const order = ["fauteuil", "chaise", "canape", "tete-de-lit", "banquette", "lounge", "bistrot"];
    const pool = data.by.mobilier.filter((m) => m.garni);
    const shared = (m) => m.es.filter((e) => t.es.includes(e)).length;
    const out = [];
    order.forEach((g) => {
      if (out.length >= 4) return;
      const m = pool.filter((x) => x.gen === g).sort((a, b) => shared(b) - shared(a))[0];
      if (m) out.push(m);
    });
    return out;
  };

  const say = (msg, href, label) => {
    D.toast(msg);
    const el = $("[data-toast]");
    if (!el) return;
    el.classList.toggle("has-link", !!href);
    if (href) el.innerHTML = `<span>${esc(msg)}</span><a href="${href}">${esc(label)}</a>`;
  };
  const keepFocus = (fn) => {
    const a = document.activeElement;
    const key = a && a.dataset ? a.dataset.fk : null;
    const pos = a && typeof a.selectionStart === "number" ? a.selectionStart : null;
    fn();
    if (!key) return;
    const b = $$("[data-fk]").find((el) => el.dataset.fk === key);
    if (!b || b === document.activeElement) return;
    b.focus({ preventScroll: true });
    if (pos != null && typeof b.setSelectionRange === "function") {
      try { b.setSelectionRange(pos, pos); } catch { }
    }
  };

  const lockup = (u, cls = "") => `<span class="logo${cls ? ` ${cls}` : ""}"><span class="logo-a">DIRECT</span><span class="logo-rule"></span><span class="logo-b">${uName(u)}</span></span>`;
  const crumbs = (items) => `<nav class="crumbs" aria-label="Fil d'Ariane">${items.map(([label, href], i) => `${i ? '<span aria-hidden="true">›</span>' : ""}${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join("")}</nav>`;
  const stepper = (p, v, fk) => `<div class="qty" data-qty><button type="button" data-dec data-fk="${fk}|dec" aria-label="Diminuer la quantité" aria-disabled="${v <= minOf(p)}">${ic("minus")}</button><input type="text" inputmode="decimal" value="${fq(v)}" data-qin data-fk="${fk}|in" aria-label="Quantité en ${esc(p.unit)}" autocomplete="off"><span class="u">${esc(p.unit)}</span><button type="button" data-inc data-fk="${fk}|inc" aria-label="Augmenter la quantité">${ic("plus")}</button></div>`;
  const uniCard = (data, u) => {
    const st = data.stats[u];
    const picks = st.cats.slice(0, 3).map((c) => data.by[u].filter((p) => p.cat === c.k).sort((a, b) => b.stock - a.stock)[0]).filter(Boolean);
    return `<a class="uc u-${u}" href="${D.universeUrl(u)}">
      <span class="uc-pl">${picks.map((p) => `<span class="uc-t">${D.visual(p, 0)}<span class="lbl">${esc(p.catName)}</span></span>`).join("")}</span>
      <span class="uc-b">
        ${lockup(u, "logo-sm")}
        <span class="uc-path"><span class="u-dot"></span>directchr.com/${u}</span>
        <span class="uc-p">${esc(UNIVERS[u].pitch)}</span>
        <span class="uc-k">${nf.format(st.products)} produits · ${nf.format(st.colors)} ${u === "mobilier" ? "finitions" : "coloris"} · ${UNIVERS[u].unitLong}</span>
        <span class="link-arrow">Entrer ${ic("arrow")}</span>
      </span>
    </a>`;
  };
  const fabCard = (m, img, href, meta) => `<a class="pc u-mobilier" href="${href}" data-u="mobilier" data-h="${esc(m.h)}">
      <div class="pc-v">${D.visual(m, 0, { fabric: img })}<span class="pc-tag">Garni</span></div>
      <div class="pc-b">
        <span class="pc-u"><span class="u-dot"></span>Mobilier · ${esc(m.catName)}</span>
        <b class="pc-t">${esc(m.t)}</b>
        <span class="pc-d">${esc(m.dims || m.d)}</span>
        <span class="pc-m">${meta}</span>
      </div>
    </a>`;

  const readState = () => {
    const sp = qp();
    const multi = (k, split) => [...new Set(sp.getAll(k).flatMap((v) => (split ? v.split(",") : [v])).map((v) => v.trim()).filter(Boolean))];
    const min = parseNum(sp.get("min"));
    const sort = sp.get("sort");
    return {
      cat: sp.get("cat") || "",
      q: (sp.get("q") || "").trim(),
      fam: multi("fam", true),
      feu: multi("feu", false),
      es: multi("es", true),
      ma: multi("ma", true),
      min: Number.isFinite(min) && min > 0 ? min : 0,
      mto: sp.get("fab") === "1",
      nw: sp.get("new") === "1",
      sort: ["stock", "nom", "nouveautes"].includes(sort) ? sort : "",
    };
  };
  const toQuery = (s) => {
    const sp = new URLSearchParams();
    if (s.cat) sp.set("cat", s.cat);
    if (s.q) sp.set("q", s.q);
    ["fam", "feu", "es", "ma"].forEach((k) => s[k].forEach((v) => sp.append(k, v)));
    if (s.min > 0) sp.set("min", String(s.min));
    if (s.mto) sp.set("fab", "1");
    if (s.nw) sp.set("new", "1");
    if (s.sort) sp.set("sort", s.sort);
    const str = sp.toString();
    return str ? `?${str}` : "";
  };
  const interleave = (arr) => {
    const g = new Map();
    arr.forEach((p) => {
      if (!g.has(p.cat)) g.set(p.cat, []);
      g.get(p.cat).push(p);
    });
    const cols = [...g.values()];
    const out = [];
    for (let i = 0; out.length < arr.length; i += 1) cols.forEach((c) => { if (c[i]) out.push(c[i]); });
    return out;
  };

  const listing = (data, host) => {
    const u = U;
    const st = data.stats[u];
    const list = data.by[u];
    const isMob = u === "mobilier";
    const unit = UNIVERS[u].unit;
    const S = readState();
    let shown = (history.state && history.state.shown) || PER;
    let cur = [];

    const present = (get) => {
      const m = new Map();
      list.forEach((p) => get(p).forEach((v) => m.set(v, (m.get(v) || 0) + 1)));
      return m;
    };
    const GET = { fam: (p) => p.fams, feu: feuList, es: (p) => p.es, ma: (p) => p.ma };
    const OPTS = {
      fam: COLOR_FAMILIES.map((f) => f.k).filter((k) => present(GET.fam).has(k)),
      feu: [...present(GET.feu).entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]),
      es: Object.keys(SPACES).filter((k) => present(GET.es).has(k)),
      ma: Object.keys(MATIERES).filter((k) => present(GET.ma).has(k)),
    };
    const LBL = { fam: (v) => famRow(v).n, feu: (v) => v, es: (v) => (SPACES[v] ? SPACES[v].n : v), ma: matLabel };
    const catName = (k) => (st.cats.find((c) => c.k === k) || { n: k }).n;
    const origins = new Set(list.map((p) => p.o).filter(Boolean));
    const minOn = () => S.min > 0 && !(isMob && S.mto);
    const pool = () => (S.q ? D.search(data, S.q, u) : list);
    const pass = (p, skip) => {
      if (skip !== "cat" && S.cat && p.cat !== S.cat) return false;
      if (skip !== "fam" && S.fam.length && !S.fam.some((f) => p.fams.includes(f))) return false;
      if (skip !== "feu" && S.feu.length && !S.feu.some((f) => feuList(p).includes(f) || String(p.feu || "").includes(f))) return false;
      if (skip !== "es" && S.es.length && !S.es.some((e) => p.es.includes(e))) return false;
      if (skip !== "ma" && S.ma.length && !S.ma.some((m) => p.ma.includes(m))) return false;
      if (skip !== "min" && minOn() && !p.c.some((c) => (c.s || 0) >= S.min)) return false;
      if (skip !== "new" && S.nw && !p.n) return false;
      return true;
    };
    const tally = (base, key, get) => {
      const m = new Map();
      base.forEach((p) => { if (pass(p, key)) get(p).forEach((v) => m.set(v, (m.get(v) || 0) + 1)); });
      return m;
    };
    const order = (r) => {
      if (S.sort === "stock") return r.sort((a, b) => b.stock - a.stock);
      if (S.sort === "nom") return r.sort((a, b) => a.t.localeCompare(b.t, "fr"));
      if (S.sort === "nouveautes") return r.sort((a, b) => (b.n ? 1 : 0) - (a.n ? 1 : 0) || b.stock - a.stock);
      return S.q ? r : interleave(r);
    };
    const cardOf = (p) => D.card(p, { ci: bestCi(p, { fam: S.fam, min: minOn() ? S.min : 0, q: S.q }) });

    const kpis = [
      [nf.format(st.products), "produits"],
      [nf.format(st.colors), isMob ? "finitions" : "coloris"],
      [nf.format(st.stock), isMob ? "pièces en stock" : `${unit} en stock`],
      [nf.format(origins.size), "pays d'usine"],
    ];
    const tiles = st.cats.slice(0, 6).map((c) => {
      const p = list.filter((x) => x.cat === c.k).sort((a, b) => b.stock - a.stock)[0];
      return p ? `<a class="uh-tile" href="${D.universeUrl(u, { cat: c.k })}" data-cat="${esc(c.k)}">${D.visual(p, 0)}<span class="lbl">${esc(c.n)}</span></a>` : "";
    }).join("");
    const minLabel = isMob ? "Pièces nécessaires dans une même finition" : "Quantité nécessaire dans un même coloris";
    const minHint = isMob
      ? "Garde les modèles dont au moins une finition a ce nombre de pièces en stock."
      : `Garde les produits dont au moins un coloris a ${u === "textile" ? "ce métrage" : "cette surface"} en stock.`;
    const minEx = { textile: "120", mural: "300", sol: "250", mobilier: "40" }[u];
    const phQ = { textile: "velours, bouclette, coloris 500…", mural: "vinyle, lessivable, B-s1…", sol: "moquette, chêne, Cfl-s1…", mobilier: "fauteuil, noyer, acier…" }[u];
    const SORTS = [["", "Pertinence"], ["stock", "Stock décroissant"], ["nom", "Nom A–Z"], ["nouveautes", "Nouveautés"]];

    host.innerHTML = `
<section class="uh u-${u}">
  <div class="uh-bg" aria-hidden="true"></div>
  <div class="wrap uh-in">
    <div class="uh-copy">
      ${crumbs([["Accueil", home()], [uName(u)]])}
      <h1 class="u-lockup-h" aria-label="Direct ${uName(u)}">${lockup(u, "u-lockup")}</h1>
      <p class="uh-path"><span class="u-dot"></span>directchr.com/${u}<span class="sep">/</span>${UNIVERS[u].unitLong}<span class="sep">/</span>expédié par l'usine</p>
      <p class="uh-pitch">${esc(UNIVERS[u].pitch)}</p>
      <div class="kpis">${kpis.map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      ${OPTS.feu.length ? `<p class="uh-norms"><span class="eyebrow">Feu</span>${OPTS.feu.slice(0, 4).map((f) => `<span class="feu">${esc(f)}</span>`).join("")}</p>` : ""}
    </div>
    <div class="uh-pl" role="group" aria-label="Catégories">${tiles}</div>
  </div>
</section>
<div class="wrap cat-wrap">
  <div class="cchips" role="group" aria-label="Catégories" data-cats></div>
  <div class="cat-lay">
    <aside class="flt" id="flt" aria-label="Filtres">
      <div class="flt-head"><b>Filtres</b><button class="flt-x" type="button" data-close data-x aria-label="Fermer les filtres">${ic("x")}</button></div>
      <div class="flt-body">
        <div class="flt-g">
          <label class="flt-h" for="f-q">Rechercher dans ${uName(u)}</label>
          <div class="fld">${ic("search")}<input id="f-q" type="search" data-fk="q" autocomplete="off" enterkeyhint="search" placeholder="${esc(phQ)}" value="${esc(S.q)}"></div>
        </div>
        <fieldset class="flt-g"><legend class="flt-h">Couleur</legend><div class="opts opts-c" data-facet="fam"></div></fieldset>
        ${OPTS.feu.length || S.feu.length ? '<fieldset class="flt-g"><legend class="flt-h">Classement feu</legend><div class="opts" data-facet="feu"></div></fieldset>' : ""}
        <fieldset class="flt-g"><legend class="flt-h">Espace</legend><div class="opts" data-facet="es"></div></fieldset>
        <fieldset class="flt-g"><legend class="flt-h">Matière</legend><div class="opts" data-facet="ma"></div></fieldset>
        <div class="flt-g">
          <label class="flt-h" for="f-min">${minLabel}</label>
          <div class="fld"><input id="f-min" type="text" inputmode="decimal" data-fk="min" autocomplete="off" placeholder="ex. ${minEx}" value="${S.min ? fq(S.min) : ""}"><span class="u">${isMob ? "pièces" : unit}</span></div>
          <p class="flt-n">${minHint}</p>
          ${isMob ? `<label class="opt opt-t"><input type="checkbox" data-mto data-fk="mto"${S.mto ? " checked" : ""}><span class="ol">Fabrication sur commande acceptée</span></label><p class="flt-n">Chaque modèle est fabriqué à la demande en 6 à 8 semaines : le stock n'est alors plus un critère.</p>` : ""}
        </div>
        <div class="flt-g"><label class="opt opt-t"><input type="checkbox" data-new data-fk="new"${S.nw ? " checked" : ""}><span class="ol">Nouveautés uniquement</span><span class="n" data-new-n></span></label></div>
      </div>
      <div class="flt-foot"><button class="btn btn-ghost btn-sm" type="button" data-clear>Tout effacer</button><button class="btn btn-sm" type="button" data-close data-see>Voir les produits</button></div>
    </aside>
    <section class="res" aria-label="Résultats" data-top>
      <div class="res-bar">
        <button class="btn btn-ghost btn-sm flt-open" type="button" data-open aria-controls="flt" aria-expanded="false">${ic("sliders")}Filtres<span class="hdr-count" data-nf data-n="0">0</span></button>
        <p class="res-count" data-count aria-live="polite"></p>
        <label class="sort"><span class="sort-l">Trier</span><select data-sort data-fk="sort" aria-label="Trier les produits">${SORTS.map(([v, l]) => `<option value="${v}"${S.sort === v ? " selected" : ""}>${l}</option>`).join("")}</select>${ic("chev")}</label>
      </div>
      <div class="act" data-act></div>
      <div class="pc-grid" data-grid></div>
      <div class="res-empty" data-empty hidden>
        <p class="eyebrow">Aucun résultat</p>
        <h2>Aucun produit ne correspond à ces filtres.</h2>
        <p>Retirez un filtre, baissez la quantité demandée ou lancez la recherche dans les quatre univers.</p>
        <div class="res-empty-a"><button class="btn btn-sm" type="button" data-clear>Tout effacer</button><a class="btn btn-ghost btn-sm" data-all href="${ROOT}recherche/">Chercher dans les quatre univers</a></div>
      </div>
      <div class="more" data-more></div>
    </section>
  </div>
</div>
<div class="flt-scrim" data-close data-scrim></div>`;

    const E = {
      cats: $("[data-cats]", host), act: $("[data-act]", host), grid: $("[data-grid]", host), more: $("[data-more]", host),
      count: $("[data-count]", host), nf: $("[data-nf]", host), see: $("[data-see]", host), q: $("#f-q", host), min: $("#f-min", host),
      nw: $("[data-new]", host), mto: $("[data-mto]", host), sort: $("[data-sort]", host), newN: $("[data-new-n]", host),
      empty: $("[data-empty]", host), all: $("[data-all]", host), top: $("[data-top]", host),
      flt: $("#flt", host), scrim: $("[data-scrim]", host), open: $("[data-open]", host),
    };

    const opt = (k, v, n) => {
      const on = S[k].includes(v);
      const id = `f-${k}-${norm(v).replace(/[^a-z0-9]+/g, "-")}`;
      const sw = k === "fam" ? `<span class="sw" style="--c:${famRow(v).h}"></span>` : "";
      const lvl = k === "es" && SPACES[v] ? `<small>${esc(SPACES[v].lvl)}</small>` : "";
      return `<label class="opt${k === "fam" ? " opt-c" : ""}${!n && !on ? " is-zero" : ""}" for="${id}"><input id="${id}" type="checkbox" data-f="${k}" value="${esc(v)}" data-fk="${esc(`${k}:${v}`)}"${on ? " checked" : ""}>${sw}<span class="ol">${esc(LBL[k](v))}${lvl}</span><span class="n">${n}</span></label>`;
    };
    const actives = () => {
      const a = [];
      if (S.cat) a.push(["cat", S.cat, catName(S.cat)]);
      if (S.q) a.push(["q", S.q, `« ${S.q} »`]);
      S.fam.forEach((v) => a.push(["fam", v, famRow(v).n, famRow(v).h]));
      S.feu.forEach((v) => a.push(["feu", v, `Feu ${v}`]));
      S.es.forEach((v) => a.push(["es", v, LBL.es(v)]));
      S.ma.forEach((v) => a.push(["ma", v, matLabel(v)]));
      if (minOn()) a.push(["min", "", `${isMob ? `${fq(S.min)} pièces` : qty(S.min, unit)} min. par ${colWord({ u })}`]);
      if (isMob && S.mto) a.push(["mto", "", "Fabrication sur commande"]);
      if (S.nw) a.push(["new", "", "Nouveautés"]);
      return a;
    };
    const drawMore = () => {
      const n = Math.min(shown, cur.length);
      E.more.innerHTML = cur.length > PER
        ? `<p class="more-t">${nf.format(n)} sur ${nf.format(cur.length)}</p><span class="more-bar" aria-hidden="true"><i style="width:${((n / cur.length) * 100).toFixed(1)}%"></i></span>${cur.length > shown ? '<button class="btn btn-ghost" type="button" data-more-btn data-fk="more">Voir plus</button>' : ""}`
        : "";
    };
    const render = () => keepFocus(() => {
      const base = pool();
      const catN = tally(base, "cat", (p) => [p.cat]);
      const allN = base.filter((p) => pass(p, "cat")).length;
      E.cats.innerHTML = `<button class="cchip" type="button" data-cat="" data-fk="cat:" aria-pressed="${!S.cat}">Tout <em>${allN}</em></button>${st.cats.map((c) => `<button class="cchip${catN.get(c.k) || S.cat === c.k ? "" : " is-zero"}" type="button" data-cat="${esc(c.k)}" data-fk="${esc(`cat:${c.k}`)}" aria-pressed="${S.cat === c.k}">${esc(c.n)} <em>${catN.get(c.k) || 0}</em></button>`).join("")}`;
      ["fam", "feu", "es", "ma"].forEach((k) => {
        const box = $(`[data-facet="${k}"]`, host);
        if (!box) return;
        const n = tally(base, k, GET[k]);
        const vals = [...OPTS[k], ...S[k].filter((v) => !OPTS[k].includes(v))];
        box.innerHTML = vals.map((v) => opt(k, v, n.get(v) || 0)).join("");
        box.closest(".flt-g").hidden = !vals.length;
      });
      E.newN.textContent = base.filter((p) => pass(p, "new") && p.n).length;
      E.min.disabled = isMob && S.mto;
      cur = order(base.filter((p) => pass(p, "")));
      const a = actives();
      E.act.innerHTML = a.length
        ? `${a.map(([k, v, l, h]) => `<button class="act-chip" type="button" data-rm="${k}" data-v="${esc(v)}" data-fk="${esc(`rm:${k}:${v}`)}">${h ? `<span class="sw" style="--c:${h}"></span>` : ""}<span>${esc(l)}</span>${ic("x")}<span class="vh">Retirer ce filtre</span></button>`).join("")}<button class="act-clear" type="button" data-clear data-fk="clear">Tout effacer</button>`
        : "";
      E.nf.textContent = a.length;
      E.nf.dataset.n = a.length;
      E.count.innerHTML = `<b>${nf.format(cur.length)}</b> ${cur.length > 1 ? "produits" : "produit"}${S.cat ? `<span class="res-cat"> · ${esc(catName(S.cat))}</span>` : ""}`;
      E.see.textContent = cur.length ? `Voir ${cur.length > 1 ? `les ${nf.format(cur.length)} produits` : "le produit"}` : "Aucun produit";
      shown = Math.max(PER, Math.min(shown, Math.ceil(cur.length / PER) * PER));
      E.grid.innerHTML = cur.slice(0, shown).map(cardOf).join("");
      E.grid.hidden = !cur.length;
      E.empty.hidden = !!cur.length;
      E.all.href = `${ROOT}recherche/${S.q ? `?q=${encodeURIComponent(S.q)}` : ""}`;
      drawMore();
    });
    const commit = (push, toTop) => {
      shown = PER;
      const url = `${location.pathname}${toQuery(S)}`;
      if (push) history.pushState({ shown }, "", url);
      else history.replaceState({ shown }, "", url);
      render();
      if (toTop && !E.flt.classList.contains("is-open") && E.top.getBoundingClientRect().top < hdrH()) {
        window.scrollTo(0, E.top.getBoundingClientRect().top + window.scrollY - hdrH() - 12);
      }
    };
    const syncInputs = () => {
      E.q.value = S.q;
      E.min.value = S.min ? fq(S.min) : "";
      E.nw.checked = S.nw;
      if (E.mto) E.mto.checked = S.mto;
      E.sort.value = S.sort;
    };
    const clearAll = () => {
      Object.assign(S, { cat: "", q: "", fam: [], feu: [], es: [], ma: [], min: 0, mto: false, nw: false });
      syncInputs();
    };
    const more = () => {
      const from = shown;
      shown += PER;
      E.grid.insertAdjacentHTML("beforeend", cur.slice(from, shown).map(cardOf).join(""));
      history.replaceState({ ...(history.state || {}), shown }, "");
      drawMore();
      const first = E.grid.children[from];
      if (first) first.focus({ preventScroll: true });
    };

    const mq = window.matchMedia("(max-width: 900px)");
    const setOpen = (on) => {
      if (on && !mq.matches) return;
      const was = E.flt.classList.contains("is-open");
      E.flt.classList.toggle("is-open", on);
      E.scrim.classList.toggle("is-open", on);
      E.open.setAttribute("aria-expanded", String(on));
      document.documentElement.classList.toggle("dchr-lock", on);
      if (on) setTimeout(() => { const x = $("[data-x]", E.flt); if (x) x.focus(); }, 40);
      else if (was) E.open.focus({ preventScroll: true });
    };
    mq.addEventListener("change", () => { if (!mq.matches) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && E.flt.classList.contains("is-open")) setOpen(false); });

    host.addEventListener("click", (e) => {
      const t = e.target;
      const cat = t.closest("[data-cat]");
      if (cat) {
        e.preventDefault();
        const v = cat.dataset.cat;
        const tile = cat.classList.contains("uh-tile");
        if (S.cat !== v) {
          S.cat = v;
          commit(true, !tile);
        }
        if (tile) scrollToEl(E.cats, 8);
        return;
      }
      const rm = t.closest("[data-rm]");
      if (rm) {
        const k = rm.dataset.rm;
        const v = rm.dataset.v;
        if (k === "cat") S.cat = "";
        else if (k === "q") { S.q = ""; E.q.value = ""; }
        else if (k === "min") { S.min = 0; E.min.value = ""; }
        else if (k === "mto") { S.mto = false; if (E.mto) E.mto.checked = false; }
        else if (k === "new") { S.nw = false; E.nw.checked = false; }
        else S[k] = S[k].filter((x) => x !== v);
        commit(true, true);
        return;
      }
      if (t.closest("[data-clear]")) {
        clearAll();
        commit(true, true);
        return;
      }
      if (t.closest("[data-open]")) {
        setOpen(true);
        return;
      }
      if (t.closest("[data-close]")) {
        const see = t.closest("[data-see]");
        setOpen(false);
        if (see) scrollToEl(E.top, 8);
        return;
      }
      if (t.closest("[data-more-btn]")) {
        more();
        return;
      }
      if (t.closest(".pc")) history.replaceState({ ...(history.state || {}), shown, y: window.scrollY }, "");
    });
    host.addEventListener("change", (e) => {
      const t = e.target;
      if (t.matches("[data-f]")) {
        const k = t.dataset.f;
        S[k] = t.checked ? [...new Set([...S[k], t.value])] : S[k].filter((x) => x !== t.value);
        commit(true, true);
      } else if (t.matches("[data-new]")) {
        S.nw = t.checked;
        commit(true, true);
      } else if (t.matches("[data-mto]")) {
        S.mto = t.checked;
        commit(true, true);
      } else if (t.matches("[data-sort]")) {
        S.sort = t.value;
        commit(true, true);
      }
    });
    E.q.addEventListener("input", debounce(() => {
      const v = E.q.value.trim();
      if (v === S.q) return;
      S.q = v;
      commit(false);
    }, 220));
    E.q.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        S.q = E.q.value.trim();
        commit(false);
        if (E.flt.classList.contains("is-open")) {
          setOpen(false);
          scrollToEl(E.top, 8);
        }
      }
    });
    E.min.addEventListener("input", debounce(() => {
      const v = parseNum(E.min.value);
      const next = Number.isFinite(v) && v > 0 ? v : 0;
      if (next === S.min) return;
      S.min = next;
      commit(false);
    }, 320));
    window.addEventListener("popstate", (e) => {
      Object.assign(S, readState());
      shown = (e.state && e.state.shown) || PER;
      syncInputs();
      render();
    });

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    render();
    const y = history.state && history.state.y;
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));
  };

  const product = (data, host, handle) => {
    const u = U;
    const p = data.get(u, handle);
    if (!p) {
      document.title = `Produit introuvable · ${uName(u)} · Direct CHR`;
      host.innerHTML = `<div class="wrap pp-none">${crumbs([["Accueil", home()], [uName(u), D.universeUrl(u)], ["Produit introuvable"]])}<h1 class="pg-h1">Produit introuvable. <span class="lt">Il a peut-être changé de nom.</span></h1><p>La référence « ${esc(handle)} » n'existe pas dans le catalogue ${uName(u)}.</p><a class="btn" href="${D.universeUrl(u)}">Voir le catalogue ${uName(u)} ${ic("arrow")}</a></div>`;
      return;
    }
    const sp = qp();
    const isMob = u === "mobilier";
    const isTx = u === "textile";
    const garni = isMob && !!p.garni;
    let ci = Math.max(0, p.c.findIndex((c) => c.k === sp.get("c")));
    let q = snap(p, p.min);
    let fabNeed = 0;
    const fabs = garni ? seatFabrics(data).slice() : [];
    let fab = garni ? parseFab(data, sp.get("tissu")) : null;
    if (fab) {
      const found = fabs.find((o) => o.t === fab.t && o.ci === fab.ci);
      if (found) fab = found;
      else fabs.unshift(fab);
    }
    const cover = isTx && p.us && p.us.includes("sieges") ? pickGarni(data, p) : [];
    document.title = `${p.t} · ${uName(u)} · Direct CHR`;
    const feus = feuList(p);
    const showDl = p.dl && p.dl !== "Expédié par l'usine";

    host.innerHTML = `
<div class="wrap pp u-${u}">
  ${crumbs([["Accueil", home()], [uName(u), D.universeUrl(u)], [p.catName, D.universeUrl(u, { cat: p.cat })], [p.t]])}
  <div class="pp-grid">
    <div class="pp-media">
      <div class="pp-frame${isMob ? " is-mob" : ""}" data-frame></div>
      <div class="pp-cols">
        <div class="pp-cols-h"><span class="eyebrow">${p.c.length} ${colWord(p, p.c.length)}</span><span class="mono" data-cur></span></div>
        <div class="pp-sw" role="group" aria-label="Choisir ${isMob ? "la finition" : "le coloris"}" data-sws>${p.c.map((c, i) => `<button class="swb" type="button" data-ci="${i}" aria-pressed="${i === ci}" aria-label="${esc(`${colLabel(p, c)}, ${c.s > 0 ? `${qty(c.s, p.unit)} en stock` : "sur commande"}`)}"><img src="${D.swatch(p, i)}" alt="" loading="lazy" decoding="async"><span class="k">${esc(isTx ? c.k : c.n)}</span><span class="s${c.s > 0 ? " ok" : ""}">${c.s > 0 ? qty(c.s, p.unit) : "sur commande"}</span></button>`).join("")}</div>
      </div>
    </div>
    <div class="pp-info">
      <p class="pp-u"><span class="u-dot"></span><a href="${D.universeUrl(u)}">${uName(u)}</a><span aria-hidden="true">·</span><a href="${D.universeUrl(u, { cat: p.cat })}">${esc(p.catName)}</a></p>
      <h1 class="pp-title">${esc(p.t)}<span class="lt" data-lt></span></h1>
      <p class="pp-d">${esc(p.d)}</p>
      ${feus.length || p.n ? `<div class="pp-badges">${feus.map((f) => `<span class="feu">${esc(f)}</span>`).join("")}${p.n ? '<span class="tag">Nouveauté</span>' : ""}</div>` : ""}
      <p class="pp-stock" data-stock></p>
      <dl class="kv">
        <dt>Conditionnement</dt><dd>${esc(p.pack)}</dd>
        ${showDl ? `<dt>Délai</dt><dd>${esc(p.dl)}</dd>` : ""}
        <dt>Expédition</dt><dd>Expédié par l'usine, en direct</dd>
        <dt>Origine</dt><dd>${esc(p.o || "Europe")}</dd>
      </dl>
      ${garni ? `<section class="garni" aria-labelledby="garni-h">
        <div class="garni-h"><h2 id="garni-h">Choisir le tissu</h2><a class="link-arrow" href="${D.universeUrl("textile", { q: "sièges" })}">Tous les tissus sièges ${ic("arrow")}</a></div>
        <p class="fine">Assise et dossier se recouvrent avec les tissus Direct Textile. Sélection de tissus pour sièges, classés par couleur.</p>
        <div class="fab-row" role="group" aria-label="Tissus pour garnir ce modèle" data-fabs>
          <button class="fab" type="button" data-fabi="-1" aria-pressed="${!fab}"><img src="${defaultFabric(p)}" alt="" loading="lazy" decoding="async"><b>Tissu d'origine</b><span>présentation</span></button>
          ${fabs.map((o, i) => `<button class="fab" type="button" data-fabi="${i}" aria-pressed="${fab === o}" aria-label="${esc(`${o.t.t}, coloris ${o.t.c[o.ci].k}`)}"><img src="${esc(fabImg(o.t, o.ci))}" alt="" loading="lazy" decoding="async"><b>${esc(o.t.t)}</b><span>coloris ${esc(o.t.c[o.ci].k)}</span></button>`).join("")}
        </div>
        <div class="garni-out" data-garni-out aria-live="polite"></div>
      </section>` : ""}
      <div class="pp-buy">
        <div class="pp-qrow">
          <span class="pp-ql">Quantité</span>
          ${stepper(p, q, "pp")}
          <span class="pp-qn">${minNote(p)}</span>
        </div>
        <p class="warn" data-warn hidden>${ic("warn")}<span></span></p>
        <div class="pp-btns">
          <button class="btn" type="button" data-add>${ic("bag")}Ajouter au projet</button>
          <button class="btn btn-ghost" type="button" data-sample>${ic("box")}Commander un échantillon</button>
        </div>
        <p class="pp-price">${ic("lock")}<span>Prix pro après connexion</span><a href="${home()}">Se connecter</a></p>
        <p class="pp-inproj" data-inproj></p>
      </div>
      <section class="pp-blk" aria-labelledby="tech-h">
        <h2 class="pp-h2" id="tech-h">Fiche technique</h2>
        <dl class="kv kv-tech">${p.specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}${p.feu && p.feu !== "–" && !p.specs.some(([k]) => /feu/i.test(k)) ? `<dt>Classement feu</dt><dd>${esc(p.feu)}</dd>` : ""}</dl>
      </section>
      ${p.es.length ? `<section class="pp-blk" aria-labelledby="es-h"><h2 class="pp-h2" id="es-h">Espaces</h2><div class="lchips">${p.es.map((e) => `<a class="lchip" href="${D.universeUrl(u, { es: e })}">${esc(SPACES[e] ? SPACES[e].n : e)}<small>${esc(SPACES[e] ? SPACES[e].lvl : "")}</small></a>`).join("")}</div></section>` : ""}
      ${p.ma.length ? `<section class="pp-blk" aria-labelledby="ma-h"><h2 class="pp-h2" id="ma-h">Matières</h2><div class="lchips">${p.ma.map((m) => `<a class="lchip" href="${D.universeUrl(u, { ma: m })}">${esc(matLabel(m))}</a>`).join("")}</div></section>` : ""}
    </div>
  </div>
</div>
${cover.length ? `<section class="pp-sec pp-cover">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Textile × Mobilier</p><h2>À recouvrir <span class="lt">avec ce tissu.</span></h2><p>Les assises garnies du catalogue Mobilier se recouvrent avec ${esc(p.t)}. Aperçu avec le <span data-cover-k></span>, métrage indicatif par pièce.</p></div><a class="link-arrow" href="${D.universeUrl("mobilier", { q: "garni" })}">Tout le mobilier garni ${ic("arrow")}</a></div>
    <div class="pc-grid cover-grid" data-cover></div>
  </div>
</section>` : ""}
<section class="pp-sec section-sunk pp-acc" aria-labelledby="acc-h">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Un magasin, quatre univers</p><h2 id="acc-h">Pour aller avec <span class="lt">dans les trois autres univers.</span></h2><p>Mêmes espaces, couleur proche <span data-acc-ref></span>. Tout s'ajoute au même projet, avec un seul compte pro.</p></div></div>
    <div class="acc" data-acc></div>
  </div>
</section>`;

    const $h = (s) => $(s, host);
    const E = {
      frame: $h("[data-frame]"), cur: $h("[data-cur]"), lt: $h("[data-lt]"), stock: $h("[data-stock]"), warn: $h("[data-warn]"),
      qty: $h("[data-qty]"), qin: $h("[data-qin]"), out: $h("[data-garni-out]"), inproj: $h("[data-inproj]"),
      acc: $h("[data-acc]"), accRef: $h("[data-acc-ref]"), cover: $h("[data-cover]"), coverK: $h("[data-cover-k]"),
    };
    const frame = () => {
      const c = p.c[ci];
      const rows = [["Réf.", p.h], [isMob ? "Finition" : "Coloris", isTx ? c.k : `${c.k} · ${c.n}`], ["Teinte", c.h]];
      if (isMob && p.dims) rows.push(["Cotes", p.dims]);
      if (fab) rows.push(["Tissu", `${fab.t.t} ${fab.t.c[fab.ci].k}`]);
      return `${D.visual(p, ci, fab ? { fabric: fabImg(fab.t, fab.ci) } : {})}${p.n ? '<span class="pc-tag">Nouveau</span>' : ""}<span class="pp-cart" aria-hidden="true">${rows.map(([a, b]) => `<span>${esc(a)}</span><span>${esc(b)}</span>`).join("")}</span>`;
    };
    const garniOut = () => {
      if (!fab) return `<p class="go-empty">Choisissez un tissu : le modèle est redessiné avec, et le métrage est calculé pour ${nf.format(q)} ${q > 1 ? "pièces" : "pièce"}.</p>`;
      const t = fab.t;
      const c = t.c[fab.ci];
      const per = fabPer(p);
      const raw = Math.round(per * q * 100) / 100;
      fabNeed = snap(t, raw);
      const st = c.s >= fabNeed ? `<span class="ok">● ${qty(c.s, "ml")} en stock</span>` : c.s > 0 ? `<span class="wait">● ${qty(c.s, "ml")} en stock, délai usine pour le reste</span>` : '<span class="wait">● Sur commande · délai usine</span>';
      return `<span class="go-mini">${D.visual(p, ci, { fabric: fabImg(t, fab.ci) })}</span>
        <span class="go-t">
          <b>Garni avec ${esc(t.t)} coloris ${esc(c.k)}</b>
          <span class="go-calc">${fq(per)} ml par pièce × ${nf.format(q)} = ${qty(raw, "ml")}${fabNeed > raw ? ` → ${qty(fabNeed, "ml")} (${t.cp ? "coupe minimum" : "rouleau entier"})` : ""}</span>
          <span class="go-st">${st}</span>
          <span class="go-a"><button class="btn btn-sm" type="button" data-fab-add data-fk="fabadd">${ic("bag")}Ajouter le tissu au projet</button><a class="link-arrow" href="${D.productUrl(t, fab.ci)}">Fiche du tissu ${ic("arrow")}</a></span>
        </span>`;
    };
    const updQty = () => {
      const c = p.c[ci];
      let msg = "";
      if (c.s > 0 && q > c.s) msg = `<b>Au-delà du stock : délai usine.</b> ${qty(c.s, p.unit)} disponibles tout de suite, le reste suit le délai de fabrication.`;
      else if (!c.s) msg = isMob ? `<b>Fabrication sur commande.</b> ${esc(p.dl)}, expédié par l'usine.` : `<b>Au-delà du stock : délai usine.</b> Ce coloris est produit à la commande.`;
      E.warn.hidden = !msg;
      $("span", E.warn).innerHTML = msg;
      $("[data-dec]", E.qty).setAttribute("aria-disabled", String(q <= minOf(p)));
      if (E.out) E.out.innerHTML = garniOut();
    };
    const drawInProj = () => {
      const c = p.c[ci];
      const it = D.projet.list().find((x) => x.u === u && x.h === p.h && x.k === c.k);
      const parts = [];
      if (it) parts.push(`Déjà au projet : ${qty(it.q, p.unit)} dans ce${isMob ? "tte" : ""} ${colWord(p)}`);
      if (D.boite.has(u, p.h, c.k)) parts.push("échantillon dans la boîte");
      E.inproj.innerHTML = parts.length ? `${ic("check")}<span>${parts.join(" · ")}</span><a href="${ROOT}projet/">Voir le projet</a>` : "";
    };
    const drawAcc = () => {
      const base = fab ? fab.t.c[fab.ci].h : p.c[ci].h;
      const res = D.accordsFor({ ...p, c: [{ h: base }] }, data, 3);
      E.accRef.textContent = fab ? `du tissu ${fab.t.t} coloris ${fab.t.c[fab.ci].k}` : colRef(p, p.c[ci]);
      E.acc.innerHTML = U_ORDER.filter((x) => x !== u).map((x) => `<div class="acc-row u-${x}">
          <div class="acc-h">
            ${lockup(x, "logo-sm")}
            <span class="acc-p"><span class="u-dot"></span>directchr.com/${x}</span>
            <span class="acc-n">Vendu ${UNIVERS[x].unitLong}</span>
            <a class="link-arrow" href="${D.universeUrl(x)}">Voir ${uName(x)} ${ic("arrow")}</a>
          </div>
          <div class="acc-grid">${(res[x] || []).map((r) => D.card(r.p, { ci: r.ci })).join("")}</div>
        </div>`).join("");
    };
    const drawCover = () => {
      if (!E.cover) return;
      const c = p.c[ci];
      const f = { t: p, ci };
      E.coverK.textContent = `coloris ${c.k}`;
      E.cover.innerHTML = cover.map((m) => fabCard(m, fabImg(p, ci), withFab(D.productUrl(m), f), `<span>${fq(fabPer(m))} ml par pièce</span>${m.feu && m.feu !== "–" ? `<span>${esc(m.feu)}</span>` : ""}`)).join("");
    };
    const syncUrl = () => {
      const s = qp();
      s.set("p", p.h);
      s.set("c", p.c[ci].k);
      if (fab) s.set("tissu", fabKey(fab));
      else s.delete("tissu");
      history.replaceState(history.state, "", `${location.pathname}?${s.toString()}`);
    };
    const updColor = () => {
      const c = p.c[ci];
      E.frame.innerHTML = frame();
      E.cur.textContent = colLabel(p, c);
      E.lt.textContent = colLabel(p, c);
      $$("[data-ci]", host).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.ci === ci)));
      $$("[data-fabi]", host).forEach((b) => {
        const i = +b.dataset.fabi;
        b.setAttribute("aria-pressed", String(i < 0 ? !fab : fabs[i] === fab));
      });
      E.stock.innerHTML = `${stockOf(p, c)}<span class="sep">·</span><span>${esc(colLabel(p, c))}</span>${c.s > 0 && showDl ? `<span class="sep">·</span><span>${esc(p.dl)}</span>` : ""}`;
      drawCover();
      drawAcc();
      updQty();
      drawInProj();
      syncUrl();
    };
    const setQ = (v) => {
      q = snap(p, v);
      E.qin.value = fq(q);
      updQty();
    };

    E.qty.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dec],[data-inc]");
      if (!b || b.getAttribute("aria-disabled") === "true") return;
      setQ(q + (b.hasAttribute("data-inc") ? 1 : -1) * stepOf(p));
    });
    E.qin.addEventListener("change", () => setQ(parseNum(E.qin.value)));
    E.qin.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setQ(parseNum(E.qin.value));
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setQ(q + (e.key === "ArrowUp" ? 1 : -1) * stepOf(p));
      }
    });
    $h("[data-sws]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-ci]");
      if (!b) return;
      ci = +b.dataset.ci;
      updColor();
    });
    const fabRow = $h("[data-fabs]");
    if (fabRow) {
      fabRow.addEventListener("click", (e) => {
        const b = e.target.closest("[data-fabi]");
        if (!b) return;
        const i = +b.dataset.fabi;
        fab = i < 0 ? null : fabs[i];
        updColor();
      });
    }
    host.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest("[data-add]")) {
        const c = p.c[ci];
        D.projet.add({ u, h: p.h, k: c.k, q });
        if (fab) D.projet.set({ u, h: p.h, k: c.k, f: fabKey(fab) });
        say(`${p.t}, ${colInline(p, c)} : ${qty(q, p.unit)} ajouté${q > 1 ? "s" : ""} au projet.`, `${ROOT}projet/`, "Voir le projet");
      } else if (t.closest("[data-sample]")) {
        const c = p.c[ci];
        if (D.boite.has(u, p.h, c.k)) say(`Cet échantillon est déjà dans la boîte (${D.boite.count()}/8).`, `${ROOT}projet/#boite`, "Voir la boîte");
        else if (!D.boite.add({ u, h: p.h, k: c.k })) say("La boîte d'échantillons est pleine : 8 au maximum.", `${ROOT}projet/#boite`, "Gérer la boîte");
        else say(`Échantillon ajouté : ${p.t}, ${colInline(p, c)} (${D.boite.count()}/8).`, `${ROOT}projet/#boite`, "Voir la boîte");
      } else if (t.closest("[data-fab-add]") && fab) {
        const c = fab.t.c[fab.ci];
        D.projet.add({ u: "textile", h: fab.t.h, k: c.k, q: fabNeed });
        say(`${fab.t.t}, coloris ${c.k} : ${qty(fabNeed, "ml")} ajoutés au projet.`, `${ROOT}projet/`, "Voir le projet");
      }
    });
    D.projet.on(drawInProj);
    D.boite.on(drawInProj);
    updColor();
  };

  const projet = (data, host) => {
    const KEY = "dchr-projet-nom";
    const getName = () => {
      try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
    };
    const setName = (v) => {
      try {
        if (v) localStorage.setItem(KEY, v);
        else localStorage.removeItem(KEY);
      } catch { }
    };
    document.title = "Projet en cours · Direct CHR";
    host.innerHTML = `<div class="wrap pj">
      ${crumbs([["Accueil", home()], ["Projet en cours"]])}
      <header class="pj-head">
        <h1 class="pg-h1">Projet en cours</h1>
        <label class="pj-name"><span class="vh">Nom du projet</span><input type="text" data-name maxlength="60" placeholder="Mon projet" value="${esc(getName() || "Mon projet")}" autocomplete="off" spellcheck="false">${ic("pencil")}</label>
        <p class="pj-lead">Un seul compte pro pour les quatre univers : tissus, revêtements muraux, sols et mobilier dans le même projet, un seul devis, et chaque ligne expédiée en direct par son usine.</p>
      </header>
      <div data-body></div>
    </div>`;
    const body = $("[data-body]", host);
    const nameIn = $("[data-name]", host);
    const nameNow = () => nameIn.value.trim() || "Mon projet";
    nameIn.addEventListener("input", () => {
      setName(nameIn.value.trim());
      const t = $("[data-sum-name]", host);
      if (t) t.textContent = nameNow();
    });
    nameIn.addEventListener("blur", () => { if (!nameIn.value.trim()) nameIn.value = "Mon projet"; });
    nameIn.addEventListener("keydown", (e) => { if (e.key === "Enter") nameIn.blur(); });

    const resolve = (it) => {
      const p = data.get(it.u, it.h);
      if (!p) return null;
      const ci = Math.max(0, p.c.findIndex((c) => c.k === it.k));
      return { it, p, ci, c: p.c[ci] };
    };
    const status = (p, c, q) => {
      if (c.s >= q) return `<span class="pj-st ok">● En stock · ${qty(c.s, p.unit)} disponibles</span>`;
      if (c.s > 0) return `<span class="pj-st wait">● Stock partiel · ${qty(c.s, p.unit)} disponibles, délai usine pour le reste</span>`;
      return `<span class="pj-st wait">● ${p.u === "mobilier" ? esc(p.dl) : "Sur commande · délai usine"}</span>`;
    };
    const lineHtml = ({ it, p, ci, c }) => {
      const q = snap(p, it.q || p.min);
      const f = p.u === "mobilier" ? parseFab(data, it.f) : null;
      const href = withFab(D.productUrl(p, ci), f);
      const th = p.u === "mobilier" ? D.visual(p, ci, f ? { fabric: fabImg(f.t, f.ci) } : {}) : `<img src="${D.swatch(p, ci)}" alt="" loading="lazy" decoding="async">`;
      const fk = `${p.u}|${p.h}|${c.k}`;
      return `<li class="pj-line" data-line data-u="${p.u}" data-h="${esc(p.h)}" data-k="${esc(c.k)}">
        <a class="pj-th${p.u === "mobilier" ? " is-mob" : ""}" href="${href}" tabindex="-1" aria-hidden="true">${th}</a>
        <div class="pj-info">
          <a class="pj-n" href="${href}">${esc(p.t)}</a>
          <span class="pj-m">${esc(colLabel(p, c))} · ${esc(p.catName)}${f ? ` · garni ${esc(f.t.t)} ${esc(f.t.c[f.ci].k)}` : ""}</span>
          ${status(p, c, q)}
          <span class="pj-o">Expédié par l'usine · ${esc(p.o || "Europe")}</span>
        </div>
        <div class="pj-q">${stepper(p, q, fk)}<span class="pj-qn">${minNote(p)}</span></div>
        <button class="pj-rm" type="button" data-rm data-fk="${esc(`${fk}|rm`)}" aria-label="Retirer ${esc(p.t)} du projet">${ic("x")}</button>
      </li>`;
    };
    const boxHtml = (box) => `<section class="pj-box" id="boite" aria-labelledby="boite-h">
      <div class="pj-box-h"><h2 id="boite-h">Boîte d'échantillons</h2><span class="mono">${box.length}/8</span></div>
      ${box.length ? `<ul class="pj-box-l">${box.map(({ p, ci, c }) => `<li class="u-${p.u}"><a href="${D.productUrl(p, ci)}"><img src="${D.swatch(p, ci)}" alt="" loading="lazy" decoding="async"><span><b>${esc(p.t)}</b><small><span class="u-dot"></span>${uName(p.u)} · ${esc(colLabel(p, c))}</small></span></a><button type="button" data-brm data-u="${p.u}" data-h="${esc(p.h)}" data-k="${esc(c.k)}" data-fk="${esc(`box|${p.u}|${p.h}|${c.k}`)}" aria-label="Retirer l'échantillon ${esc(p.t)}">${ic("x")}</button></li>`).join("")}</ul>` : ""}
      <p class="fine">${box.length ? "Huit échantillons au maximum, tous univers confondus." : "Vide pour l'instant. Ajoutez jusqu'à 8 échantillons depuis les fiches produit, tous univers confondus."}</p>
    </section>`;
    const draw = () => keepFocus(() => {
      const items = D.projet.list().map(resolve).filter(Boolean);
      const box = D.boite.list().map(resolve).filter(Boolean);
      if (!items.length) {
        body.innerHTML = `<div class="pj-empty">
          <div class="pj-empty-h"><p class="eyebrow">Projet vide</p><h2>Rien pour l'instant. <span class="lt">Commencez par un univers.</span></h2><p>Tissus, revêtements, sols et mobilier s'ajoutent au même projet. Un seul compte pro couvre les quatre univers.</p></div>
          <div class="uc-grid">${U_ORDER.map((u) => uniCard(data, u)).join("")}</div>
          ${box.length ? boxHtml(box) : ""}
        </div>`;
        return;
      }
      const groups = U_ORDER.map((u) => {
        const rows = items.filter((x) => x.p.u === u);
        return { u, rows, sum: rows.reduce((a, x) => a + snap(x.p, x.it.q || x.p.min), 0) };
      }).filter((g) => g.rows.length);
      const origins = [...new Set(items.map((x) => x.p.o).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
      body.innerHTML = `<div class="pj-grid">
        <div class="pj-lines">${groups.map((g) => `<section class="pj-grp u-${g.u}" aria-labelledby="grp-${g.u}">
            <div class="pj-grp-h"><h2 id="grp-${g.u}"><span class="u-dot"></span>${uName(g.u)}<small>${g.rows.length} ligne${g.rows.length > 1 ? "s" : ""}</small></h2><span class="pj-sub">${qty(g.sum, UNIVERS[g.u].unit)}</span></div>
            <ul class="pj-ul">${g.rows.map(lineHtml).join("")}</ul>
          </section>`).join("")}
          <a class="link-arrow pj-more" href="${home()}">Continuer dans les quatre univers ${ic("arrow")}</a>
        </div>
        <div class="pj-side">
          <aside class="pj-sum" aria-labelledby="sum-h">
            <div class="pj-sum-h"><p class="eyebrow">Récapitulatif</p><h2 id="sum-h" data-sum-name>${esc(nameNow())}</h2></div>
            <dl class="kv pj-kv">
              <dt>Univers</dt><dd><span class="pj-dots">${U_ORDER.map((u) => `<span class="u-dot u-${u}${groups.some((g) => g.u === u) ? "" : " is-off"}"></span>`).join("")}</span>${groups.length} sur 4</dd>
              <dt>Lignes</dt><dd>${items.length}</dd>
              <dt>Usines</dt><dd>${origins.length}</dd>
              ${groups.map((g) => `<dt>${uName(g.u)}</dt><dd>${qty(g.sum, UNIVERS[g.u].unit)}</dd>`).join("")}
            </dl>
            <p class="pj-orig">Usines en ${esc(origins.join(", "))}</p>
            <ul class="pj-notes">
              <li>${ic("truck")}<span>Livraison offerte dès 2 500 € HT</span></li>
              <li>${ic("lock")}<span>Prix pro après connexion</span></li>
              <li>${ic("user")}<span>Un compte pro pour les quatre univers</span></li>
            </ul>
            <div class="pj-cta">
              <button class="btn" type="button" data-devis data-fk="devis">Demander un devis ${ic("arrow")}</button>
              <button class="pj-clear" type="button" data-clear-all data-fk="clear-all">Vider le projet</button>
            </div>
          </aside>
          ${boxHtml(box)}
        </div>
      </div>`;
    });
    const lineOf = (el) => {
      const line = el.closest("[data-line]");
      if (!line) return null;
      const { u, h, k } = line.dataset;
      const p = data.get(u, h);
      const it = D.projet.list().find((x) => x.u === u && x.h === h && x.k === k);
      return p ? { u, h, k, p, it } : null;
    };
    body.addEventListener("click", (e) => {
      const t = e.target;
      const step = t.closest("[data-dec],[data-inc]");
      if (step) {
        const L = lineOf(step);
        if (!L || step.getAttribute("aria-disabled") === "true") return;
        const cur = snap(L.p, L.it ? L.it.q : L.p.min);
        D.projet.set({ u: L.u, h: L.h, k: L.k, q: snap(L.p, cur + (step.hasAttribute("data-inc") ? 1 : -1) * stepOf(L.p)) });
        return;
      }
      const rm = t.closest("[data-rm]");
      if (rm) {
        const L = lineOf(rm);
        if (!L) return;
        D.projet.remove(L.u, L.h, L.k);
        say(`${L.p.t} retiré du projet.`);
        return;
      }
      const brm = t.closest("[data-brm]");
      if (brm) {
        D.boite.remove(brm.dataset.u, brm.dataset.h, brm.dataset.k);
        return;
      }
      if (t.closest("[data-devis]")) {
        say("Prototype : la demande de devis sera envoyée à l'équipe.");
        return;
      }
      const clr = t.closest("[data-clear-all]");
      if (clr) {
        if (clr.dataset.armed) {
          D.projet.clear();
          say("Projet vidé.");
          return;
        }
        clr.dataset.armed = "1";
        clr.textContent = "Confirmer : tout retirer";
        clr.classList.add("is-armed");
        setTimeout(() => {
          if (!clr.isConnected) return;
          delete clr.dataset.armed;
          clr.textContent = "Vider le projet";
          clr.classList.remove("is-armed");
        }, 3500);
      }
    });
    body.addEventListener("change", (e) => {
      const inp = e.target.closest("[data-qin]");
      if (!inp) return;
      const L = lineOf(inp);
      if (!L) return;
      D.projet.set({ u: L.u, h: L.h, k: L.k, q: snap(L.p, parseNum(inp.value)) });
    });
    body.addEventListener("keydown", (e) => {
      const inp = e.target.closest("[data-qin]");
      if (inp && e.key === "Enter") {
        e.preventDefault();
        inp.blur();
      }
    });
    D.projet.on(draw);
    D.boite.on(draw);
    draw();
    if (location.hash === "#boite") requestAnimationFrame(() => scrollToEl($("#boite"), 16));
  };

  const POPULAR = ["velours bleu", "bouclette", "occultant", "lessivable", "papier peint", "acoustique", "moquette", "Cfl-s1", "terrazzo", "noyer", "fauteuil", "outdoor"];
  const recherche = (data, host) => {
    const sp = qp();
    const q = (sp.get("q") || "").trim();
    const scope = U_ORDER.includes(sp.get("u")) ? sp.get("u") : "";
    const sUrl = (o) => {
      const s = new URLSearchParams();
      if (o.q) s.set("q", o.q);
      if (o.u) s.set("u", o.u);
      const x = s.toString();
      return `${ROOT}recherche/${x ? `?${x}` : ""}`;
    };
    const form = `<form class="sr-form" action="${ROOT}recherche/" role="search">${ic("search", "sr-ico")}<label class="vh" for="sr-q">Rechercher dans les quatre univers</label><input id="sr-q" name="q" type="search" value="${esc(q)}" placeholder="velours bleu, moquette Cfl-s1, fauteuil…" autocomplete="off" enterkeyhint="search"><span class="sr-scope"><label class="vh" for="sr-u">Univers</label><select id="sr-u" name="u"><option value="">Tous les univers</option>${U_ORDER.map((u) => `<option value="${u}"${scope === u ? " selected" : ""}>${uName(u)}</option>`).join("")}</select>${ic("chev")}</span><button class="btn" type="submit">Rechercher</button></form>`;
    const pop = `<div class="pop"><span class="eyebrow">Recherches fréquentes</span>${POPULAR.map((t) => `<a class="pop-a" href="${sUrl({ q: t, u: scope })}">${esc(t)}</a>`).join("")}</div>`;
    const cardsOf = (arr) => arr.map((p) => D.card(p, { ci: bestCi(p, { q }) })).join("");
    const unis = `<div class="uc-grid">${U_ORDER.map((u) => uniCard(data, u)).join("")}</div>`;

    if (!q) {
      document.title = "Recherche · Direct CHR";
      host.innerHTML = `<div class="wrap sr">
        ${crumbs([["Accueil", home()], ["Recherche"]])}
        <header class="sr-head"><h1 class="pg-h1">Rechercher <span class="lt">dans les quatre univers.</span></h1>${form}${pop}</header>
        <div class="section-head sr-uh"><div><p class="eyebrow">Ou parcourir</p><h2>Quatre univers, <span class="lt">un seul projet.</span></h2></div></div>
        ${unis}
      </div>`;
      return;
    }
    const all = D.search(data, q, null);
    const by = {};
    U_ORDER.forEach((u) => { by[u] = all.filter((p) => p.u === u); });
    const nUni = U_ORDER.filter((u) => by[u].length).length;
    document.title = `${q} · Recherche · Direct CHR`;
    const tabs = `<nav class="tabs" aria-label="Résultats par univers"><a class="tab" href="${sUrl({ q })}"${scope ? "" : ' aria-current="page"'}>Tout <em>${nf.format(all.length)}</em></a>${U_ORDER.map((u) => `<a class="tab u-${u}${by[u].length ? "" : " is-zero"}" href="${sUrl({ q, u })}"${scope === u ? ' aria-current="page"' : ""}><span class="u-dot"></span>${uName(u)} <em>${nf.format(by[u].length)}</em></a>`).join("")}</nav>`;
    const lead = all.length ? `${nf.format(all.length)} résultat${all.length > 1 ? "s" : ""} dans ${nUni} univers` : "aucun résultat";
    const head = `${crumbs([["Accueil", home()], ["Recherche", sUrl({})], [q]])}<header class="sr-head"><h1 class="pg-h1">« ${esc(q)} » <span class="lt">${lead}.</span></h1>${form}</header>${tabs}`;
    let bodyHtml = "";
    if (!all.length) {
      bodyHtml = `<div class="sr-empty">
        <h2>Aucun résultat pour « ${esc(q)} ».</h2>
        <ul>
          <li>Vérifiez l'orthographe ou essayez un mot plus court : velours, moquette, chêne.</li>
          <li>Cherchez par couleur (bleu, sable, anthracite), par espace (chambres, terrasse) ou par norme feu (Cfl-s1, B-s1, 1021).</li>
          <li>Ou parcourez directement un univers ci-dessous.</li>
        </ul>
        ${pop}
      </div>${unis}`;
    } else if (scope && !by[scope].length) {
      bodyHtml = `<div class="sr-empty"><h2>Rien dans ${uName(scope)} pour « ${esc(q)} ».</h2><p>${nf.format(all.length)} résultat${all.length > 1 ? "s" : ""} dans les autres univers.</p><div class="sr-empty-a"><a class="btn btn-sm" href="${sUrl({ q })}">Voir ${all.length > 1 ? `les ${nf.format(all.length)} résultats` : "le résultat"} ${ic("arrow")}</a><a class="btn btn-ghost btn-sm" href="${D.universeUrl(scope)}">Parcourir ${uName(scope)}</a></div></div>`;
    } else if (scope) {
      bodyHtml = `<section class="sr-grp u-${scope}">
        <div class="sr-grp-h"><h2><span class="u-dot"></span>${uName(scope)} <em>${nf.format(by[scope].length)}</em></h2><a class="link-arrow" href="${D.universeUrl(scope, { q })}">Voir tout dans ${uName(scope)}, avec les filtres ${ic("arrow")}</a></div>
        <div class="pc-grid" data-grid>${cardsOf(by[scope].slice(0, PER))}</div>
        <div class="more" data-more></div>
      </section>`;
    } else {
      bodyHtml = `${U_ORDER.filter((u) => by[u].length).map((u) => `<section class="sr-grp u-${u}">
          <div class="sr-grp-h"><h2><span class="u-dot"></span>${uName(u)} <em>${nf.format(by[u].length)}</em></h2><a class="link-arrow" href="${D.universeUrl(u, { q })}">Voir tout dans ${uName(u)} ${ic("arrow")}</a></div>
          <div class="pc-grid sr-grid">${cardsOf(by[u].slice(0, 8))}</div>
          ${by[u].length > 8 ? `<a class="sr-all" href="${sUrl({ q, u })}">${nf.format(by[u].length - 8)} autre${by[u].length - 8 > 1 ? "s" : ""} résultat${by[u].length - 8 > 1 ? "s" : ""} en ${uName(u)} ${ic("arrow")}</a>` : ""}
        </section>`).join("")}${nUni < 4 ? `<p class="sr-none">Aucun résultat en ${U_ORDER.filter((u) => !by[u].length).map(uName).join(", ")}.</p>` : ""}`;
    }
    host.innerHTML = `<div class="wrap sr">${head}${bodyHtml}</div>`;
    if (scope && by[scope].length) {
      const list = by[scope];
      let shown = PER;
      const grid = $("[data-grid]", host);
      const moreEl = $("[data-more]", host);
      const drawMore = () => {
        const n = Math.min(shown, list.length);
        moreEl.innerHTML = list.length > PER ? `<p class="more-t">${nf.format(n)} sur ${nf.format(list.length)}</p><span class="more-bar" aria-hidden="true"><i style="width:${((n / list.length) * 100).toFixed(1)}%"></i></span>${list.length > shown ? '<button class="btn btn-ghost" type="button" data-more-btn>Voir plus</button>' : ""}` : "";
      };
      moreEl.addEventListener("click", (e) => {
        if (!e.target.closest("[data-more-btn]")) return;
        const from = shown;
        shown += PER;
        grid.insertAdjacentHTML("beforeend", cardsOf(list.slice(from, shown)));
        drawMore();
        const first = grid.children[from];
        if (first) first.focus({ preventScroll: true });
      });
      drawMore();
    }
  };

  const host = $("#cp");
  if (!host) return;
  const sp0 = qp();
  if (PAGE === "recherche") D.header({ current: "recherche", q: sp0.get("q") || "", scope: sp0.get("u") || "" });
  else if (PAGE === "projet") D.header({ current: "projet" });
  else D.header({ current: U });
  D.footer();
  D.load().then((data) => {
    if (PAGE === "projet") projet(data, host);
    else if (PAGE === "recherche") recherche(data, host);
    else if (UNIVERS[U]) {
      const h = sp0.get("p");
      if (h) product(data, host, h);
      else listing(data, host);
    }
    host.removeAttribute("aria-busy");
  }).catch(() => {
    host.innerHTML = '<div class="wrap cp-err"><p class="eyebrow">Catalogue indisponible</p><p>Le catalogue n\'a pas pu être chargé. Lancez le serveur local, puis rechargez la page.</p></div>';
  });
})();
