(() => {
  const NB = " ";
  const pad = (n) => String(n).padStart(2, "0");
  const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  const fmt = (n) => nf.format(n);
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

  const UNIVERS = {
    textile: { n: "Textile", unit: "ml", sell: "au mètre linéaire", de: "le textile", norms: "M1, B1 ou EN 13773" },
    mural: { n: "Mural", unit: "m²", sell: "au m²", de: "le revêtement mural", norms: "B-s2,d0 ou M1" },
    sol: { n: "Sol", unit: "m²", sell: "au m²", de: "le sol", norms: "Cfl-s1 ou Bfl-s1" },
    mobilier: { n: "Mobilier", unit: "u", sell: "à l'unité", de: "le mobilier", norms: "EN 1021" },
  };
  const UNIT_HINT = {
    textile: "Le textile se vend au mètre linéaire (ml) : indiquez la longueur à couper.",
    mural: "Le revêtement mural se vend au m², pas au mètre linéaire.",
    sol: "Le sol se vend au m² : indiquez la surface à couvrir.",
    mobilier: "Le mobilier se vend à l'unité : indiquez un nombre de pièces.",
  };
  const NORM_KIND = { textile: "textile", mural: "de revêtement mural", sol: "de revêtement de sol", mobilier: "de siège rembourré" };
  const EXAMPLES = [
    { u: "textile", q: "180 ml velours bleu M1", due: "pour le 15/01" },
    { u: "mural", q: "650 m² vinyle B-s2,d0", due: "sous 3 semaines" },
    { u: "sol", q: "420 m² moquette grise Cfl-s1", due: "pour le 20/02" },
    { u: "mobilier", q: "36 fauteuils EN 1021", due: "sous 8 semaines" },
  ];

  const MATERIALS = [
    [/\beffets? cuir\b/, "effet cuir", "textile", "effet-cuir"],
    [/\bvelours\b/, "velours", "textile", "velours"],
    [/\bchenilles?\b/, "chenillé", "textile", "chenilles"],
    [/\bbouclettes?\b/, "bouclette", "textile", "textures"],
    [/\btextures?\b/, "texturé", "textile", "textures"],
    [/\bjacquards?\b/, "jacquard", "textile", "jacquards"],
    [/\boccultan(?:t|ts|te|tes)\b/, "occultant", "textile", "occultants"],
    [/\bvoilages?\b/, "voilage", "textile", "voilages"],
    [/\btweeds?\b/, "tweed", "textile", "tweed"],
    [/\boutdoor\b/, "outdoor", "textile", "outdoor"],
    [/\bmicrofibres?\b/, "microfibre", "textile", "microfibres"],
    [/\bimprimes?\b/, "imprimé", "textile", "imprimes"],
    [/\blin\b/, "lin", "textile", "naturels"],
    [/\btissus? mur(?:al|aux)\b|\btentures? murales?\b/, "tissu mural", "mural"],
    [/\btissus?\b/, "tissu", "textile", null, true],
    [/\bmoquettes?\b/, "moquette", "sol"],
    [/\bdalles?\b/, "dalle", "sol"],
    [/\bparquets?\b/, "parquet", "sol"],
    [/\blvt\b/, "LVT", "sol"],
    [/\bcarrelages?\b|\bcarreaux\b/, "carrelage", "sol"],
    [/\bterrazzos?\b/, "terrazzo", "sol"],
    [/\bgres\b/, "grès", "sol"],
    [/\bsols?\b/, "sol", "sol", null, true],
    [/\bpapiers? peints?\b/, "papier peint", "mural"],
    [/\brevetements? mur(?:al|aux)\b/, "revêtement mural", "mural"],
    [/\bpanneaux? acoustiques?\b/, "panneau acoustique", "mural"],
    [/\bvinyles?\b/, "vinyle", "mural"],
    [/\bpanneaux?\b/, "panneau", "mural"],
    [/\bacoustiques?\b/, "acoustique", "mural"],
    [/\benduits?\b/, "enduit", "mural"],
    [/\blambris\b|\bboiseries?\b/, "lambris", "mural"],
    [/\bfauteuils?\b/, "fauteuil", "mobilier"],
    [/\bchaises?\b/, "chaise", "mobilier"],
    [/\btables?\b/, "table", "mobilier"],
    [/\bgueridons?\b/, "guéridon", "mobilier"],
    [/\btetes? de lits?\b/, "tête de lit", "mobilier"],
    [/\blits?\b/, "lit", "mobilier"],
    [/\bchevets?\b/, "chevet", "mobilier"],
    [/\bbureaux?\b/, "bureau", "mobilier"],
    [/\bcanapes?\b/, "canapé", "mobilier"],
    [/\bbanquettes?\b/, "banquette", "mobilier"],
    [/\btabourets?\b/, "tabouret", "mobilier"],
    [/\btransats?\b|\bbains? de soleil\b/, "transat", "mobilier"],
    [/\bmobiliers?\b/, "mobilier", "mobilier", null, true],
    [/\blaines?\b/, "laine", null],
    [/\bbois\b/, "bois", null],
    [/\b(?:chene|noyer|hetre|frene)s?\b/, "bois massif", null],
    [/\bcuirs?\b/, "cuir", null],
    [/\b(?:metal|metaux|acier|laiton|inox)\b/, "métal", null],
    [/\b(?:pierres?|marbres?)\b/, "pierre", null],
  ].map(([re, l, u, fam = null, generic = false]) => ({ re, l, u, fam, generic }));

  const COLORS = [
    ["blanc", "blanc|blanche|blancs|blanches", "#f4f2ee"],
    ["écru", "ecru|ecrue|ecrus|ecrues", "#ebe2cf"],
    ["ivoire", "ivoires?|cremes?", "#efe8d8"],
    ["beige", "beiges?", "#d5c3a6"],
    ["sable", "sables?", "#d8c9b5"],
    ["grège", "greges?", "#b3a796"],
    ["taupe", "taupes?", "#8c7a6b"],
    ["gris", "gris|grise|grises", "#9b9893"],
    ["anthracite", "anthracites?", "#3b3d40"],
    ["noir", "noire?s?", "#161616"],
    ["bleu", "bleue?s?|marine", "#2e4a6e"],
    ["vert", "verte?s?|kaki|olive|sauge", "#4d6a4b"],
    ["rouge", "rouges?", "#9c2f2a"],
    ["bordeaux", "bordeaux", "#6a2430"],
    ["terracotta", "terracottas?|terre cuite|rouille", "#b4643d"],
    ["orange", "oranges?", "#c8743a"],
    ["jaune", "jaunes?|moutarde|ocre", "#d8b24a"],
    ["brun", "brune?s?|marron|chocolat|cognac|camel", "#6b4a33"],
    ["rose", "roses?", "#dca6a1"],
  ].map(([n, forms, c]) => ({ n, c, re: new RegExp(`\\b(?:${forms})\\b`) }));

  const NORMS = [
    { re: /\ben ?1021(?:-[12])?\b/, l: () => "EN 1021", u: ["mobilier", "textile"], d: "sièges rembourrés" },
    { re: /\ben ?13773\b/, l: () => "EN 13773", u: ["textile"], d: "rideaux et tentures" },
    { re: /\b([bcd])fl-?s1\b/, l: (m) => `${m[1].toUpperCase()}fl-s1`, u: ["sol"], d: "Euroclasse sol" },
    { re: /\b([a-d]2?)-?s([123]) ?,? ?d([012])\b/, l: (m) => `${m[1].toUpperCase()}-s${m[2]},d${m[3]}`, u: ["mural"], d: "Euroclasse mur" },
    { re: /\bm1\b/, l: () => "M1", u: ["textile", "mural"], d: "non inflammable" },
    { re: /\bb1\b/, l: () => "B1", u: ["textile"], d: "DIN 4102" },
    { re: /\br(9|1[0-3])\b/, l: (m) => `R${m[1]}`, u: ["sol"], d: "glissance" },
  ];

  const STOP = new Set(["pour", "le", "la", "les", "de", "du", "des", "en", "et", "a", "au", "aux", "un", "une", "avec", "sans", "x", "d", "l", "classe", "classement", "classee", "classes", "norme", "normes", "feu", "coloris", "couleur", "stock", "metres", "metre", "ml", "m2", "m", "u", "qualite", "qualites", "besoin", "sous", "dans", "semaines", "semaine", "jours", "mois", "ou", "sur", "par", "chez", "tout", "tous", "the"]);

  const NUM = "(\\d{1,3}(?: \\d{3})+|\\d+)(?:[.,](\\d+))?";
  const LEAD = "(?<![\\w.,/-])";
  const RE_QTY = new RegExp(`${LEAD}${NUM}\\s*(metres? lineaires?|metres? carres?|ml|m2|m|metres?|u|unites?|pieces?|pcs)\\b`);
  const RE_NOUN = new RegExp(`${LEAD}${NUM}\\s*(?:x\\s*)?(?=(?:fauteuils?|chaises?|tables?|gueridons?|lits?|tetes? de lits?|chevets?|bureaux?|canapes?|banquettes?|tabourets?|transats?)\\b)`);
  const RE_BARE = new RegExp(`${LEAD}${NUM}(?![\\w/])`);
  const RE_DATE = /(?<![\d/])(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?(?![\d/])/;
  const RE_REL = /\b(sous|dans|d'ici|en)\s+(\d{1,2})\s*(semaines?|jours?|mois)\b/;
  const toNum = (a, b) => parseFloat(`${a.replace(/ /g, "")}${b ? `.${b}` : ""}`);
  const unitOf = (u) => (/^(m2|metres? carres?)$/.test(u) ? "m²" : /^(ml|m|metres?|metres? lineaires?)$/.test(u) ? "ml" : "u");
  const cut = (t, m) => `${t.slice(0, m.index)} ${t.slice(m.index + m[0].length)}`;
  const clean = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’`]/g, "'").replace(/\s+/g, " ");

  const relDays = (d) => {
    const days = Math.round((d - TODAY) / 864e5);
    if (days < 0) return { s: "date passée", warn: true };
    if (days === 0) return { s: "aujourd'hui", warn: true };
    if (days === 1) return { s: "demain", warn: true };
    if (days < 14) return { s: `dans ${days} jours` };
    return { s: `dans ${Math.round(days / 7)} semaines` };
  };

  const parse = (raw) => {
    const p = { raw, empty: !raw.trim(), qty: null, mat: null, mats: [], color: null, norms: [], due: null, u: null, why: "", hint: "", warnQty: false, badNorm: null, rest: "" };
    if (p.empty) return p;
    let t = ` ${clean(raw)} `;

    let m = t.match(RE_DATE);
    if (m) {
      const dd = +m[1];
      const mm = +m[2];
      let yy = m[3] ? +m[3] : TODAY.getFullYear();
      if (yy < 100) yy += 2000;
      const d = new Date(yy, mm - 1, dd);
      if (mm >= 1 && mm <= 12 && d.getDate() === dd) {
        if (!m[3] && d < TODAY) d.setFullYear(yy + 1);
        p.due = { date: d, chip: `${pad(dd)}/${pad(mm)}`, ...relDays(d) };
      }
      t = cut(t, m);
    } else if ((m = t.match(RE_REL))) {
      const n = +m[2];
      const d = new Date(TODAY);
      if (m[3].startsWith("mois")) d.setMonth(d.getMonth() + n);
      else d.setDate(d.getDate() + n * (m[3].startsWith("semaine") ? 7 : 1));
      const unit = m[3].startsWith("mois") ? "mois" : m[3].startsWith("semaine") ? (n > 1 ? "semaines" : "semaine") : (n > 1 ? "jours" : "jour");
      const rel = `${m[1]} ${n} ${unit}`;
      p.due = { date: d, chip: rel, s: rel, rel: true };
      t = cut(t, m);
    }

    if ((m = t.match(RE_QTY))) {
      p.qty = { n: toNum(m[1], m[2]), unit: unitOf(m[3]), src: "typed" };
      t = cut(t, m);
    } else if ((m = t.match(RE_NOUN))) {
      p.qty = { n: toNum(m[1], m[2]), unit: "u", src: "noun" };
      t = cut(t, m);
    }

    NORMS.forEach((def) => {
      let k;
      while ((k = t.match(def.re))) {
        const l = def.l(k);
        if (!p.norms.some((x) => x.l === l)) p.norms.push({ l, u: def.u, d: def.d });
        t = cut(t, k);
      }
    });

    if (!p.qty && (m = t.match(RE_BARE))) {
      p.qty = { n: toNum(m[1], m[2]), unit: null, src: "bare" };
      t = cut(t, m);
    }

    const hits = MATERIALS.map((x) => {
      const k = t.match(x.re);
      return k ? { ...x, i: k.index, len: k[0].length } : null;
    }).filter(Boolean).sort((a, b) => a.i - b.i || b.len - a.len);
    p.mat = hits.find((x) => !x.generic && x.u) || hits.find((x) => !x.generic) || hits[0] || null;
    p.mats = hits.filter((x) => !x.generic && (!p.mat || x.l !== p.mat.l) && !hits.some((y) => y !== x && y.i <= x.i && y.i + y.len >= x.i + x.len && y.len > x.len));

    const colors = COLORS.map((x) => {
      const k = t.match(x.re);
      return k ? { ...x, i: k.index } : null;
    }).filter(Boolean).sort((a, b) => a.i - b.i);
    p.color = colors[0] || null;

    let r = t;
    hits.forEach((x) => { r = r.replace(new RegExp(x.re.source, "g"), " "); });
    colors.forEach((x) => { r = r.replace(new RegExp(x.re.source, "g"), " "); });
    p.rest = r.replace(/[^a-z0-9' -]/g, " ").split(/[\s']+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)).join(" ");

    if (p.mat && p.mat.u) {
      p.u = p.mat.u;
      p.why = `déduit de « ${p.mat.l} »`;
    } else {
      const single = p.norms.find((x) => x.u.length === 1);
      if (single) {
        p.u = single.u[0];
        p.why = `déduit de la norme ${single.l}`;
      } else if (p.qty && p.qty.unit === "ml") {
        p.u = "textile";
        p.why = "déduit de l'unité ml";
      } else if (p.qty && p.qty.unit === "u" && p.qty.src === "typed") {
        p.u = "mobilier";
        p.why = "déduit de l'unité";
      }
    }

    if (p.qty && !p.qty.unit && p.u) {
      p.qty.unit = UNIVERS[p.u].unit;
      p.qty.inferred = true;
    }
    if (p.u && p.qty && p.qty.src === "typed" && p.qty.unit !== UNIVERS[p.u].unit) {
      p.warnQty = true;
      p.hint = UNIT_HINT[p.u];
    } else if (p.u) {
      p.badNorm = p.norms.find((x) => !x.u.includes(p.u)) || null;
      if (p.badNorm) p.hint = `${p.badNorm.l} est un classement ${NORM_KIND[p.badNorm.u[0]]}. Pour ${UNIVERS[p.u].de}, on vise plutôt ${UNIVERS[p.u].norms}.`;
    } else if (p.qty && p.qty.unit === "m²") {
      p.hint = "Au m², précisez la matière (vinyle, moquette, parquet…) pour choisir entre le mural et le sol.";
    }
    p.short = !!(p.u === "textile" && p.qty && p.qty.unit === "ml" && p.qty.n < 3);
    return p;
  };

  const qtyText = (q) => `${fmt(q.n)}${NB}${q.unit || ""}`.trim();

  const chips = (p) => {
    const list = [];
    if (p.qty) list.push({ k: "qty", b: "Quantité", v: qtyText(p.qty), warn: p.warnQty || p.short });
    if (p.mat) list.push({ k: "mat", b: "Matière", v: p.mat.l });
    p.mats.forEach((x) => list.push({ k: `mat-${x.l}`, b: "Matière", v: x.l }));
    if (p.color) list.push({ k: "col", b: "Couleur", v: p.color.n, sw: p.color.c });
    p.norms.forEach((x) => list.push({ k: `norm-${x.l}`, b: "Norme", v: x.l, warn: x === p.badNorm }));
    if (p.due) list.push({ k: "due", b: "Échéance", v: p.due.chip, warn: p.due.warn });
    if (p.u) list.push({ k: "u", b: "Univers", v: UNIVERS[p.u].n, u: p.u, em: "déduit" });
    return list;
  };

  const api = (text) => {
    const p = parse(String(text ?? ""));
    p.unit = p.qty && p.qty.unit ? p.qty.unit : p.u ? UNIVERS[p.u].unit : null;
    p.matiere = p.mat;
    p.couleur = p.color;
    p.norme = p.norms;
    p.echeance = p.due;
    p.univers = p.u;
    p.hints = p.hint ? [p.hint] : [];
    return p;
  };

  window.COMPTOIR_PARSE = Object.assign(api, { UNIVERS, EXAMPLES, MATERIALS, COLORS, NORMS, chips, qtyText, fmt, fmtDate, pad, TODAY, NB });
})();
