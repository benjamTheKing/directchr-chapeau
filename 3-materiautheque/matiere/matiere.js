(() => {
  const D = window.DCHR;
  const B = window.MBox;
  const { $, $$, esc, num, UNIVERS, U_ORDER, MATIERES, COLOR_FAMILIES } = D;
  try { localStorage.setItem("dchr-prop", "3-materiautheque"); } catch { }

  const INFO = {
    bois: { tone: "#a67d51", noun: "bois", short: "Parquets, lames et lambris, plateaux et piètements.", txt: "Chêne, noyer, hêtre ou frêne : le bois couvre le sol en parquet, habille le mur en lames et en lambris, et structure chaises, tables et chevets. Il se choisit à la teinte, du frêne blanchi au teinté noir." },
    laine: { tone: "#b9a382", noun: "laine", short: "Tissée, tuftée ou feutrée.", txt: "Tissée en tweed, tuftée en moquette ou pressée en panneaux de feutre, la laine apporte chaleur et silence. Elle vieillit bien et supporte un usage soutenu." },
    velours: { tone: "#6b2f33", noun: "velours", short: "Des assises aux têtes de lit.", txt: "Le velours donne de la profondeur à la couleur : il habille fauteuils, banquettes et têtes de lit. Ses versions techniques tiennent le passage d'un lobby ou d'un restaurant." },
    pierre: { tone: "#cfc8bd", noun: "pierre", short: "Et les matières qui en prennent l'aspect.", txt: "Grès cérame, terrazzo, enduits à la chaux et plateaux minéraux : la pierre et ses aspects tiennent les zones de passage, de l'entrée au spa." },
    cuir: { tone: "#7b4f3b", noun: "cuir", short: "Ses effets au mètre, ses usages en mobilier.", txt: "Effet cuir au mètre pour les assises, cuir sur les banquettes et les fauteuils : une matière qui se nettoie d'un geste et se patine avec le temps." },
    lin: { tone: "#d4c9b6", noun: "lin", short: "Rideaux, voilages et murs tendus.", txt: "Lin, coton et fibres naturelles pour les rideaux, les voilages et les revêtements muraux tendus : une matière mate, qui respire et filtre la lumière." },
    metal: { tone: "#a8864f", noun: "métal", short: "Piètements, structures et accessoires.", txt: "Laiton, acier, bronze et inox : le métal dessine les piètements, les structures et les accessoires du mobilier, en finitions brossées ou thermolaquées." },
    fibre: { tone: "#8f8174", noun: "fibres techniques", short: "Moquettes, occultants et tissus d'extérieur.", txt: "Polyamides, polyesters et fibres recyclées pour les moquettes, les occultants et les tissus d'extérieur : la performance d'abord, au feu, à l'usure et au lavage." },
    tissage: { tone: "#8c7d70", noun: "tissage", short: "Jacquards, bouclettes et imprimés.", txt: "Jacquards, bouclettes et imprimés : le tissage fait le motif et le relief des tissus d'ameublement, des coussins aux rideaux." },
  };
  const KEYS = Object.keys(MATIERES);
  const IN = { textile: "en textile", mural: "au mur", sol: "au sol", mobilier: "en mobilier" };
  const PREP = { textile: "dans le textile", mural: "au mur", sol: "au sol", mobilier: "dans le mobilier" };
  const MAX_CARDS = 12;

  const q = new URLSearchParams(location.search).get("m");
  const m = q && MATIERES[q] ? q : null;
  D.header({ current: m ? `matiere:${m}` : "matiere" });
  D.footer();
  document.title = m ? `Direct CHR — ${MATIERES[m]} · Matériauthèque` : "Direct CHR — Les matières · Matériauthèque";

  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = (v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const labOf = (hex) => {
    const [R, G, Bl] = hexRgb(hex).map(lin);
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const x = f((R * 0.4124 + G * 0.3576 + Bl * 0.1805) / 0.95047);
    const y = f(R * 0.2126 + G * 0.7152 + Bl * 0.0722);
    const z = f((R * 0.0193 + G * 0.1192 + Bl * 0.9505) / 1.08883);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };
  const far = (a, b) => Math.hypot(0.5 * (a[0] - b[0]), 1.4 * (a[1] - b[1]), 1.4 * (a[2] - b[2]));
  const plural = (n, one, many) => `${num(n)} ${n > 1 ? many : one}`;
  const arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

  let data = null;
  const cache = new Map();
  const prods = (u, k) => {
    const id = `${u}/${k}`;
    if (!cache.has(id)) cache.set(id, data.by[u].filter((p) => p.ma.includes(k)));
    return cache.get(id);
  };
  const byStock = (a, b) => b.stock - a.stock || a.t.localeCompare(b.t, "fr");
  const best = (list, tone, avoid) => {
    let out = null;
    let bs = Infinity;
    list.forEach((p) => {
      if (avoid.some((x) => x.p === p)) return;
      p.c.forEach((c, ci) => {
        const lab = labOf(c.h);
        const near = avoid.reduce((a, x) => Math.min(a, far(x.lab, lab)), 99);
        const s = far(lab, tone) - (c.s > 0 ? 4 : 0) + (near < 12 ? 30 : 0);
        if (s < bs) {
          bs = s;
          out = { p, ci, lab };
        }
      });
    });
    return out;
  };
  const mosaic = (k) => {
    const tone = labOf(INFO[k].tone);
    const us = U_ORDER.filter((u) => prods(u, k).length);
    const out = [];
    us.forEach((u) => {
      const x = best(prods(u, k), tone, out);
      if (x) out.push({ ...x, u });
    });
    for (let i = 0; out.length < 4 && us.length && i < 12; i += 1) {
      const u = us[i % us.length];
      const x = best(prods(u, k), tone, out);
      if (x) out.push({ ...x, u });
    }
    return out;
  };
  const counts = (k) => U_ORDER.map((u) => [u, prods(u, k).length]);

  const tileMi = (k) => {
    const cs = counts(k);
    const nU = cs.filter(([, n]) => n).length;
    const total = cs.reduce((a, [, n]) => a + n, 0);
    const label = `${MATIERES[k]} : ${cs.map(([u, n]) => `${UNIVERS[u].n.toLowerCase()} ${n}`).join(", ")}`;
    const cells = mosaic(k).map((x) => `<span class="mi-c" style="--u: var(--u-${x.u})">${D.visual(x.p, x.ci)}<i></i></span>`).join("");
    return `<a class="mi" href="?m=${k}" aria-label="${esc(label)}"><span class="mi-mo">${cells}</span><span class="mi-b"><span class="mi-t">${esc(MATIERES[k])}</span><span class="mi-d">${esc(INFO[k].short)}</span><span class="mi-k">${nU} univers sur 4 · ${plural(total, "réf.", "réf.")}</span><span class="mi-n">${cs.map(([u, n]) => `<span class="mi-u${n ? "" : " is-zero"}" style="--u: var(--u-${u})"><i></i>${UNIVERS[u].n} ${n ? num(n) : "–"}</span>`).join("")}</span></span></a>`;
  };

  const crumbs = (items) => `<nav class="crumbs" aria-label="Fil d'Ariane">${items.map(([t, href], i) => (i === items.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${href}">${esc(t)}</a><span aria-hidden="true">›</span>`)).join("")}</nav>`;

  const main = $("[data-page]");

  const indexShell = () => `<section class="mt-hero"><div class="mt-bg"></div><div class="wrap">
    ${crumbs([["Accueil", "../"], ["Matières"]])}
    <div class="mt-head"><div class="mt-copy">
      <p class="eyebrow">Matériauthèque · ${KEYS.length} matières</p>
      <h1>Neuf matières, <span class="lt">quatre univers.</span></h1>
      <p class="mt-lead">Le bois se pose au sol, au mur et sur le mobilier ; la laine se tisse, se tufte ou se feutre. Choisissez une matière pour comparer ses produits d'un univers à l'autre et composer votre boîte d'échantillons.</p>
    </div></div>
  </div></section>
  <section class="mt-sec"><div class="wrap"><div class="mi-grid" data-fill="grid"></div></div></section>`;

  const fillIndex = () => {
    $('[data-fill="grid"]').innerHTML = KEYS.map(tileMi).join("");
  };

  const detailShell = () => `<section class="mt-hero"><div class="mt-bg"></div><div class="wrap">
    ${crumbs([["Accueil", "../"], ["Matières", "./"], [MATIERES[m]]])}
    <div class="mt-head">
      <div class="mt-copy">
        <p class="eyebrow" data-fill="eyebrow">Matière</p>
        <h1>${esc(MATIERES[m])}</h1>
        <p class="mt-lead">${esc(INFO[m].txt)}</p>
      </div>
      <dl class="mt-facts" data-fill="facts"></dl>
    </div>
    <div class="mt-strip" data-fill="strip" aria-hidden="true"></div>
    <p class="mt-strip-cap" data-fill="cap"></p>
  </div></section>
  <div data-fill="sections"></div>
  <section class="mt-sec mt-others"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Matières</p><h2>Les autres <span class="lt">matières.</span></h2></div><a class="link-arrow" href="../#mur">Revenir au mur d'échantillons ${arrow}</a></div>
    <div class="mi-grid is-sm" data-fill="others"></div>
  </div></section>`;

  const strip = () => {
    const us = U_ORDER.filter((u) => prods(u, m).length);
    const quota = Math.floor(96 / Math.max(1, us.length));
    const out = [];
    us.forEach((u) => {
      const seen = [];
      prods(u, m).forEach((p) => p.c.forEach((c) => {
        const lab = labOf(c.h);
        if (!seen.some((x) => far(x.lab, lab) < 3)) seen.push({ h: c.h, lab, t: `${p.t} · ${c.n} · ${UNIVERS[u].n}` });
      }));
      seen.sort((a, b) => b.lab[0] - a.lab[0]);
      const n = Math.min(quota, seen.length);
      const step = seen.length / Math.max(1, n);
      for (let i = 0; i < n; i += 1) out.push(seen[Math.floor(i * step)]);
    });
    return { us, cols: out.sort((a, b) => b.lab[0] - a.lab[0]) };
  };

  const section = (u) => {
    const list = prods(u, m);
    const fams = COLOR_FAMILIES.map((f) => ({ k: f.k, h: f.h, name: f.n, count: list.filter((p) => p.fams.includes(f.k)).length })).filter((f) => f.count);
    return `<section class="mt-u" id="u-${u}" data-u="${u}" style="--u: var(--u-${u})"><div class="wrap">
      <div class="mt-u-head">
        <div class="mt-u-copy"><p class="eyebrow"><span class="u-dot"></span>${UNIVERS[u].n} · ${esc(UNIVERS[u].unitLong)}</p><h2>${esc(MATIERES[m])} <span class="lt">${IN[u]}</span></h2></div>
        <a class="link-arrow" data-all href="${esc(D.universeUrl(u, { ma: m }))}">Tout voir <span class="mono" data-all-n>${num(list.length)}</span>${arrow}</a>
      </div>
      <div class="mt-chips" role="group" aria-label="${esc(`Filtrer par couleur : ${MATIERES[m]} ${IN[u]}`)}"><button class="mt-chip" type="button" data-fam="" aria-pressed="true"><i class="is-all"></i>Toutes <em>${num(list.length)}</em></button>${fams.map((f) => `<button class="mt-chip" type="button" data-fam="${f.k}" aria-pressed="false"><i style="background:${f.h}"></i>${esc(f.name)} <em>${num(f.count)}</em></button>`).join("")}</div>
      <div class="pc-grid mt-grid" data-grid></div>
      <p class="mt-u-foot" data-foot></p>
    </div></section>`;
  };

  const fillGrid = (sec, fam) => {
    const u = sec.dataset.u;
    const list = prods(u, m).filter((p) => !fam || p.fams.includes(fam)).sort(byStock);
    const shown = list.slice(0, MAX_CARDS);
    $("[data-grid]", sec).innerHTML = shown.map((p) => {
      const ci = fam ? Math.max(0, p.c.findIndex((c) => D.familyOf(c.h) === fam)) : 0;
      const c = p.c[ci];
      return `<div class="mc" data-fly>${D.card(p, { ci })}<button class="smp" type="button" data-sample="${esc(B.keyOf({ u: p.u, h: p.h, k: c.k }))}" aria-pressed="false" aria-label="${esc(`Échantillon ${p.t}, ${c.n}`)}"></button></div>`;
    }).join("");
    const href = D.universeUrl(u, fam ? { ma: m, fam } : { ma: m });
    $("[data-all]", sec).href = href;
    $("[data-all-n]", sec).textContent = num(list.length);
    $("[data-foot]", sec).innerHTML = `<span>${num(shown.length)} sur ${plural(list.length, "produit", "produits")}</span>${list.length > shown.length ? `<a class="link-arrow" href="${esc(href)}">Voir les ${num(list.length)} produits ${arrow}</a>` : ""}`;
    B.refresh();
  };

  const nones = (empties) => (empties.length ? `<section class="mt-none"><div class="wrap"><div class="mt-none-in">${empties.map((u) => {
    const alt = KEYS.filter((k) => k !== m && prods(u, k).length);
    return `<div class="mt-none-u" style="--u: var(--u-${u})"><p class="mt-none-t"><span class="u-dot"></span><b>${UNIVERS[u].n}</b> · pas de ${esc(INFO[m].noun)} ${PREP[u]}</p><p class="mt-none-l">Voir plutôt ${alt.map((k) => `<a href="?m=${k}">${esc(MATIERES[k].toLowerCase())}</a>`).join(", ")}${alt.length ? ", ou " : ""}<a href="${esc(D.universeUrl(u))}">le catalogue ${UNIVERS[u].n}</a>.</p></div>`;
  }).join("")}</div></div></section>` : "");

  const fillDetail = () => {
    const cs = counts(m);
    const present = cs.filter(([, n]) => n).map(([u]) => u);
    const empties = cs.filter(([, n]) => !n).map(([u]) => u);
    const total = cs.reduce((a, [, n]) => a + n, 0);
    $('[data-fill="eyebrow"]').textContent = `Matière · ${present.length} univers sur 4 · ${plural(total, "référence", "références")}`;
    $('[data-fill="facts"]').innerHTML = cs.map(([u, n]) => {
      const cols = prods(u, m).reduce((a, p) => a + p.c.length, 0);
      const dt = n ? `<a href="#u-${u}"><i></i>${UNIVERS[u].n}</a>` : `<span><i></i>${UNIVERS[u].n}</span>`;
      return `<dt style="--u: var(--u-${u})"${n ? "" : ' class="is-zero"'}>${dt}</dt><dd${n ? "" : ' class="is-zero"'}>${n ? `${plural(n, "référence", "références")} · ${num(cols)} coloris` : `pas de ${esc(INFO[m].noun)}`}</dd>`;
    }).join("");
    const st = strip();
    $('[data-fill="strip"]').innerHTML = st.cols.map((c) => `<i style="background:${c.h}" title="${esc(c.t)}"></i>`).join("");
    $('[data-fill="cap"]').textContent = `${plural(st.cols.length, "coloris", "coloris")} du clair au foncé · ${st.us.map((u) => UNIVERS[u].n).join(" · ")}`;
    const host = $('[data-fill="sections"]');
    host.innerHTML = present.map(section).join("") + nones(empties);
    $$(".mt-u", host).forEach((sec) => fillGrid(sec, ""));
    $('[data-fill="others"]').innerHTML = KEYS.filter((k) => k !== m).map(tileMi).join("");
    host.addEventListener("click", (e) => {
      const b = e.target.closest(".mt-chip");
      if (!b) return;
      const sec = b.closest(".mt-u");
      $$(".mt-chip", sec).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      fillGrid(sec, b.dataset.fam);
    });
    if (location.hash && location.hash.startsWith("#u-")) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  };

  main.innerHTML = m ? detailShell() : indexShell();
  D.load().then((d) => {
    data = d;
    if (m) fillDetail();
    else fillIndex();
    B.refresh();
  });
})();
