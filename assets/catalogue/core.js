(() => {
  const SRC = document.currentScript ? document.currentScript.src : location.href;
  const ROOT = new URL("../../", SRC).href;
  const IMG = `${ROOT}assets/img/`;

  const UNIVERS = {
    textile: { n: "Textile", unit: "ml", unitLong: "au mètre linéaire", hex: "#8c7a6b", pitch: "Tissus d'ameublement en stock, coupés à la demande ou en rouleaux." },
    mural: { n: "Mural", unit: "m²", unitLong: "au m²", hex: "#7b8a72", pitch: "Revêtements vinyles, papiers peints, panneaux acoustiques et enduits." },
    sol: { n: "Sol", unit: "m²", unitLong: "au m²", hex: "#a8714c", pitch: "Moquettes, parquets, LVT, grès cérame et sols extérieurs." },
    mobilier: { n: "Mobilier", unit: "u", unitLong: "à l'unité", hex: "#56616d", pitch: "Assises, tables et mobilier de chambre fabriqués sur commande." },
  };
  const U_ORDER = ["textile", "mural", "sol", "mobilier"];
  const SPACES = {
    chambres: { n: "Chambres", lvl: "R+1 à R+3" },
    couloirs: { n: "Couloirs", lvl: "Tous niveaux" },
    lobby: { n: "Lobby", lvl: "RDC" },
    restaurant: { n: "Restaurant & bar", lvl: "RDC" },
    spa: { n: "Spa", lvl: "R-1" },
    terrasse: { n: "Terrasse", lvl: "R+4" },
  };
  const MATIERES = {
    bois: "Le bois", laine: "La laine", velours: "Le velours", pierre: "La pierre", cuir: "Le cuir",
    lin: "Le lin et les fibres naturelles", metal: "Le métal", fibre: "Les fibres techniques", tissage: "Les tissages",
  };
  const FAM = {
    velours: "Velours", chenilles: "Chenillés", jacquards: "Jacquards", textures: "Texturés & bouclettes", outdoor: "Outdoor",
    occultants: "Occultants", voilages: "Voilages", naturels: "Naturels", imprimes: "Imprimés", microfibres: "Microfibres",
    "effet-cuir": "Effet cuir", tweed: "Tweed",
  };
  const FAM_ONE = {
    velours: "Velours", chenilles: "Chenillé", jacquards: "Jacquard", textures: "Texturé", outdoor: "Tissu outdoor",
    occultants: "Occultant", voilages: "Voilage", naturels: "Tissu naturel", imprimes: "Imprimé", microfibres: "Microfibre",
    "effet-cuir": "Effet cuir", tweed: "Tweed",
  };
  const USAGES = { sieges: "Sièges", rideaux: "Rideaux", literie: "Literie", coussins: "Coussins", "pet-friendly": "Animaux acceptés" };
  const CARE = { coupe: "Coupe au mètre", lavable: "Lavable", "easy-clean": "Easy clean", recycle: "Recyclé", deperlant: "Déperlant", "deperlant-sur-demande": "Déperlant sur demande", occultant: "Occultant", acoustique: "Acoustique", eco: "Éco-conçu" };
  const COLOR_FAMILIES = [
    { k: "blanc", n: "Blanc cassé", h: "#ece6da" }, { k: "sable", n: "Sable", h: "#cdb592" }, { k: "taupe", n: "Taupe", h: "#8c7d70" },
    { k: "brun", n: "Brun", h: "#6b4a33" }, { k: "terracotta", n: "Terracotta", h: "#b0613f" }, { k: "rouge", n: "Rouge", h: "#8e2f33" },
    { k: "jaune", n: "Jaune", h: "#c9a24a" }, { k: "vert", n: "Vert", h: "#6d7a55" }, { k: "bleu", n: "Bleu", h: "#4e6a86" },
    { k: "gris", n: "Gris", h: "#9a9894" }, { k: "noir", n: "Anthracite", h: "#35363a" },
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("fr-FR");
  const num = (n, d = 0) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const qty = (n, unit) => `${unit === "ml" || unit === "m²" ? num(n, n % 1 ? 1 : 0) : nf.format(n)} ${unit}`;

  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgbHex = (r, g, b) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
  const mix = (a, b, t) => {
    const x = hexRgb(a);
    const y = hexRgb(b);
    return rgbHex(...x.map((v, i) => v + (y[i] - v) * t));
  };
  const shade = (h, k) => mix(h, "#000000", 1 - k);
  const tint = (h, k) => mix(h, "#ffffff", k);
  const toHsl = (hex) => {
    let [r, g, b] = hexRgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l * 100];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s * 100, l * 100];
  };
  const hsl = (h, s, l) => {
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return 255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    };
    return rgbHex(f(0), f(8), f(4));
  };
  const lab = (hex) => {
    const lin = (v) => {
      const c = v / 255;
      return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
    };
    const [R, G, B] = hexRgb(hex).map(lin);
    const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  };
  const dist = (a, b) => {
    const x = lab(a);
    const y = lab(b);
    return Math.hypot((x[0] - y[0]) * 0.8, x[1] - y[1], x[2] - y[2]);
  };
  const familyOf = (hex) => {
    if (!hex) return null;
    let best = null;
    let bd = Infinity;
    COLOR_FAMILIES.forEach((c) => {
      const d = dist(hex, c.h);
      if (d < bd) { bd = d; best = c.k; }
    });
    return best;
  };
  const hashOf = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return Math.abs(h) % 997 + 1;
  };
  const rng = (s) => {
    let seed = s;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  };
  const range = (from, to, step) => {
    const out = [];
    for (let v = from; v < to - 1e-6; v += step) out.push(v);
    return out;
  };
  const f1 = (n) => n.toFixed(1);

  const layer = (id, freq, oct, seed, color, k, off, type = "fractalNoise") => {
    const [r, g, b] = hexRgb(color).map((v) => (v / 255).toFixed(3));
    return {
      def: `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="${type}" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}"/><feColorMatrix values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${k} ${off}"/></filter>`,
      use: `<rect width="100" height="100" filter="url(#${id})"/>`,
    };
  };
  const doc = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;
  const compose = (base, layers, under = "", over = "") => doc(layers.map((l) => l.def).join(""), `<rect width="100" height="100" fill="${base}"/>${under}${layers.map((l) => l.use).join("")}${over}`);

  const planks = (base, s, rowH, minW, varW, joints = true) => {
    const [h, sat, l] = toHsl(base);
    const r = rng(s);
    let p = "";
    range(0, 100, rowH).forEach((y) => {
      let x = -r() * minW;
      while (x < 100) {
        const w = minW + r() * varW;
        p += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(rowH)}" fill="${hsl(h, sat, Math.max(8, Math.min(92, l + (r() - 0.5) * 9)))}"${joints ? ' stroke="rgba(30,18,8,.3)" stroke-width=".35"' : ""}/>`;
        x += w;
      }
    });
    return compose("#000", [
      layer("g", "0.012 0.42", 3, s, shade(base, 0.62), 1.7, -0.7),
      layer("k", "0.02 0.6", 2, s + 4, tint(base, 0.35), 1.4, -0.62),
    ], p);
  };

  const GEN = {
    moquette: (c, s) => compose(c.h, [
      layer("m", 0.03, 3, s + 2, shade(c.h, 0.88), 1.0, -0.42),
      layer("a", 0.95, 2, s, tint(c.h, 0.4), 1.1, -0.38),
      layer("b", 1.2, 2, s + 9, shade(c.h, 0.6), 1.2, -0.5),
    ]),
    dalle: (c, s) => compose(c.h, [
      layer("a", "0.9 0.15", 2, s, tint(c.h, 0.35), 1.1, -0.4),
      layer("b", 1.1, 2, s + 3, shade(c.h, 0.6), 1.2, -0.5),
    ], "", `<path d="M0 50H100M50 0V100" stroke="${shade(c.h, 0.7)}" stroke-width=".8"/><rect x="0" y="0" width="50" height="50" fill="#fff" opacity=".05"/><rect x="50" y="50" width="50" height="50" fill="#fff" opacity=".05"/>`),
    parquet: (c, s) => planks(c.h, s, 11, 34, 34),
    lvt: (c, s) => planks(c.h, s, 16, 44, 30),
    hongrie: (c, s) => {
      const [h, sat, l] = toHsl(c.h);
      const r = rng(s);
      let p = "";
      const cw = 12.5;
      const ph = 8;
      range(0, 100, cw).forEach((x, i) => {
        const a = i % 2 ? 6 : 0;
        const b = i % 2 ? 0 : 6;
        range(-14, 112, ph).forEach((y) => {
          p += `<polygon points="${x},${y + a} ${x + cw},${y + b} ${x + cw},${y + b + ph} ${x},${y + a + ph}" fill="${hsl(h, sat, Math.max(8, Math.min(92, l + (r() - 0.5) * 12)))}" stroke="rgba(50,28,10,.35)" stroke-width=".4"/>`;
        });
      });
      return compose("#000", [layer("g", "0.05 0.5", 2, s, shade(c.h, 0.6), 1.2, -0.55)], p);
    },
    composite: (c, s) => {
      let p = "";
      range(0, 100, 14).forEach((y) => {
        p += `<rect x="0" y="${y}" width="100" height="12.6" fill="${c.h}"/>`;
        range(y + 2, y + 12, 1.6).forEach((g) => { p += `<rect x="0" y="${f1(g)}" width="100" height=".5" fill="${shade(c.h, 0.78)}"/>`; });
      });
      return compose(shade(c.h, 0.4), [layer("g", "0.008 0.5", 2, s, shade(c.h, 0.7), 1.0, -0.45)], p);
    },
    gres: (c, s) => compose(c.h, [
      layer("m", 0.04, 4, s, tint(c.h, 0.12), 1.5, -0.55),
      layer("a", 0.7, 3, s + 5, tint(c.h, 0.3), 1.1, -0.45),
      layer("b", 0.9, 2, s + 8, shade(c.h, 0.6), 1.2, -0.5),
    ], "", `<path d="M0 50H100M60 0V50M24 50V100" stroke="${tint(c.h, 0.32)}" stroke-width="1.2"/><path d="M0 51.1H100M61.1 0V50M25.1 50V100" stroke="rgba(0,0,0,.25)" stroke-width=".5"/>`),
    terrazzo: (c, s) => {
      const r = rng(s);
      const cols = ["#b9a58e", "#8c7a6b", "#d2c3ad", "#6f6a63", "#a8714c", "#c9b8a2", "#4f4a45", shade(c.h, 0.6), tint(c.h, 0.5)];
      let p = "";
      for (let i = 0; i < 120; i += 1) {
        const x = r() * 100;
        const y = r() * 100;
        const sz = 0.6 + r() * 3.2;
        const col = cols[Math.floor(r() * cols.length)];
        const n = 3 + Math.floor(r() * 3);
        const pts = range(0, n, 1).map((k) => {
          const ang = (k / n) * Math.PI * 2 + r() * 0.8;
          const rr = sz * (0.6 + r() * 0.5);
          return `${f1(x + Math.cos(ang) * rr)},${f1(y + Math.sin(ang) * rr)}`;
        }).join(" ");
        p += `<polygon points="${pts}" fill="${col}"/>`;
      }
      return compose(c.h, [layer("n", 0.8, 2, s, shade(c.h, 0.8), 0.6, -0.25)], "", p);
    },
    enduit: (c, s) => compose(c.h, [
      layer("a", "0.02 0.03", 4, s, shade(c.h, 0.82), 1.6, -0.6),
      layer("b", 0.06, 3, s + 7, tint(c.h, 0.5), 1.1, -0.47),
      layer("c", 0.9, 1, s + 3, shade(c.h, 0.7), 0.5, -0.2),
    ]),
    vinyle: (c, s) => compose(c.h, [
      layer("a", "0.9 0.03", 2, s, shade(c.h, 0.82), 1.6, -0.62),
      layer("b", "0.03 0.9", 2, s + 3, tint(c.h, 0.4), 1.4, -0.58),
    ]),
    toile: (c, s) => compose(c.h, [
      layer("a", "1.4 0.05", 1, s, shade(c.h, 0.8), 1.5, -0.6),
      layer("b", "0.05 1.4", 1, s + 3, shade(c.h, 0.84), 1.5, -0.6),
      layer("c", 0.02, 3, s + 5, tint(c.h, 0.3), 1.0, -0.45),
    ]),
    papier: (c, s) => {
      const ink = c.ink || shade(c.h, 0.55);
      const variant = s % 4;
      let p = "";
      if (variant === 0) {
        range(0, 110, 20).forEach((y, j) => range(j % 2 ? -8 : 0, 110, 16).forEach((x) => { p += `M${x + 2} ${y + 18}v-9a6 6 0 0 1 12 0v9z`; }));
      } else if (variant === 1) {
        range(-10, 110, 14).forEach((y, j) => range(j % 2 ? -7 : 0, 110, 14).forEach((x) => { p += `M${x + 7} ${y}l7 7l-7 7l-7 -7z`; }));
      } else if (variant === 2) {
        range(0, 110, 12).forEach((x) => { p += `M${x} 0V100M${x + 3} 0V100`; });
      } else {
        range(-10, 110, 12).forEach((y) => { p += `M0 ${y}q6.25 -6 12.5 0t12.5 0t12.5 0t12.5 0t12.5 0t12.5 0t12.5 0t12.5 0`; });
      }
      return doc("", `<rect width="100" height="100" fill="${c.h}"/><path d="${p}" fill="${variant < 2 ? shade(c.h, 0.94) : "none"}" stroke="${ink}" stroke-width="${variant === 2 ? 0.8 : 1}"/>`);
    },
    feutre: (c, s) => {
      let p = "";
      range(14.3, 100, 14.3).forEach((x) => {
        p += `<rect x="${f1(x - 0.9)}" y="0" width="1.8" height="100" fill="${shade(c.h, 0.5)}"/><rect x="${f1(x + 0.9)}" y="0" width=".5" height="100" fill="${tint(c.h, 0.18)}"/>`;
      });
      return compose(c.h, [
        layer("a", 0.6, 3, s, tint(c.h, 0.3), 1.2, -0.52),
        layer("b", 0.9, 2, s + 4, shade(c.h, 0.7), 1.1, -0.45),
      ], "", p);
    },
    lames: (c, s) => {
      const [h, sat, l] = toHsl(c.h);
      const r = rng(s);
      let p = "";
      range(0, 100, 9).forEach((x) => { p += `<rect x="${x + 0.8}" y="0" width="7.4" height="100" fill="${hsl(h, sat, Math.max(10, Math.min(85, l + (r() - 0.5) * 10)))}"/>`; });
      return compose("#1f1a16", [layer("g", "0.5 0.012", 3, s, shade(c.h, 0.5), 1.5, -0.62)], p);
    },
    lambris: (c, s) => {
      let p = "";
      range(0, 100, 20).forEach((x) => { p += `<rect x="${x + 3}" y="6" width="14" height="40" rx=".6" fill="none" stroke="${shade(c.h, 0.78)}" stroke-width=".9"/><rect x="${x + 3}" y="54" width="14" height="40" rx=".6" fill="none" stroke="${shade(c.h, 0.78)}" stroke-width=".9"/><rect x="${x + 3.9}" y="6.9" width="12.2" height="38.2" fill="none" stroke="${tint(c.h, 0.35)}" stroke-width=".5"/>`; });
      return compose(c.h, [layer("a", "0.02 0.4", 2, s, shade(c.h, 0.88), 0.8, -0.35)], "", p);
    },
    placage: (c, s) => compose(c.h, [
      layer("a", "0.008 0.07", 4, s, shade(c.h, 0.55), -5, 0.95, "turbulence"),
      layer("b", "0.01 0.3", 3, s + 4, tint(c.h, 0.25), 1.4, -0.58),
    ]),
    metal: (c, s) => {
      const light = tint(c.h, 0.45);
      const a = layer("a", "0.004 0.9", 2, s, tint(light, 0.2), 1.2, -0.52);
      const b = layer("b", "0.006 1.2", 2, s + 2, shade(c.h, 0.55), 1.4, -0.55);
      return doc(
        `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c.h, 0.82)}"/><stop offset=".38" stop-color="${light}"/><stop offset=".62" stop-color="${c.h}"/><stop offset="1" stop-color="${shade(c.h, 0.7)}"/></linearGradient>${a.def}${b.def}`,
        `<rect width="100" height="100" fill="url(#g)"/>${a.use}${b.use}`,
      );
    },
    laque: (c) => doc(
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tint(c.h, 0.16)}"/><stop offset=".55" stop-color="${c.h}"/><stop offset="1" stop-color="${shade(c.h, 0.78)}"/></linearGradient><radialGradient id="h" cx=".22" cy=".18" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
      `<rect width="100" height="100" fill="url(#g)"/><rect width="100" height="100" fill="url(#h)"/>`,
    ),
  };

  const svgCache = new Map();
  const swatchUrl = (gen, c, seed) => {
    const key = `${gen}|${c.h}|${c.ink || ""}|${seed}`;
    if (!svgCache.has(key)) {
      const fn = GEN[gen] || GEN.vinyle;
      svgCache.set(key, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fn(c, seed))}`);
    }
    return svgCache.get(key);
  };

  const FURN_FABRIC = (p) => {
    if (p.cat === "exterieur") return `${IMG}outdoor.jpg`;
    if (p.ma.includes("cuir")) return `${IMG}cuir.jpg`;
    if (p.ma.includes("laine")) return `${IMG}texture.jpg`;
    if (p.ma.includes("velours")) return `${IMG}velours.jpg`;
    return `${IMG}chenille.jpg`;
  };
  let uid = 0;
  const leg = (x1, y1, x2, y2, w = 2.6) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="var(--fr)" stroke-width="${w}" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#1d1b19" stroke-width="${w + 1.2}" stroke-linecap="round" opacity=".18"/>`;
  const FURN = {
    chaise: () => `${leg(45, 60, 43, 88)}${leg(75, 60, 77, 88)}${leg(52, 60, 51, 84, 2)}${leg(68, 60, 69, 84, 2)}<path class="up" d="M45 20Q60 15 75 20L74 54H46Z"/><path class="up" d="M41 54H79Q81 54 81 57V61H39V57Q39 54 41 54Z"/>`,
    bistrot: () => `<path d="M47 56C44 36 46 20 60 18C74 20 76 36 73 56" fill="none" stroke="var(--fr)" stroke-width="3"/><path d="M51 54C50 40 52 28 60 26C68 28 70 40 69 54" fill="none" stroke="var(--fr)" stroke-width="2"/>${leg(46, 60, 42, 89)}${leg(74, 60, 78, 89)}${leg(54, 60, 53, 87, 2)}${leg(66, 60, 67, 87, 2)}<ellipse cx="60" cy="74" rx="15" ry="2" fill="none" stroke="var(--fr)" stroke-width="1.8"/><path class="up" d="M41 55H79V61H41Z"/>`,
    tabouret: () => `${leg(47, 40, 42, 92)}${leg(73, 40, 78, 92)}${leg(55, 40, 54, 90, 2)}${leg(65, 40, 66, 90, 2)}<path d="M44 72H76" stroke="var(--fr)" stroke-width="2.4"/><path class="up" d="M44 32H76Q79 32 79 35V40H41V35Q41 32 44 32Z"/>`,
    fauteuil: () => `${leg(34, 76, 33, 88)}${leg(86, 76, 87, 88)}<path class="up" d="M38 28Q60 20 82 28L82 60H38Z"/><path class="up" d="M30 46Q30 42 34 42H40V78H30Z"/><path class="up" d="M80 42H86Q90 42 90 46V78H80Z"/><path class="up" d="M38 58H82Q84 58 84 61V76H36V61Q36 58 38 58Z"/>`,
    lounge: () => `${leg(30, 74, 28, 88)}${leg(90, 74, 92, 88)}<path class="up" d="M34 36Q60 30 86 36L86 62H34Z"/><path class="up" d="M32 60H88Q90 60 90 63V72H30V63Q30 60 32 60Z"/><path d="M26 52H38V74H26ZM82 52H94V74H82Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>`,
    canape: () => `${leg(16, 74, 15, 86)}${leg(104, 74, 105, 86)}<path class="up" d="M18 34H102V60H18Z"/><path d="M46 34V60M74 34V60" stroke="#1d1b19" stroke-width=".6" opacity=".5"/><path class="up" d="M10 44Q10 40 14 40H20V76H10Z"/><path class="up" d="M100 40H106Q110 40 110 44V76H100Z"/><path class="up" d="M18 58H102V74H18Z"/><path d="M46 58V74M74 58V74" stroke="#1d1b19" stroke-width=".6" opacity=".5"/>`,
    banquette: () => `<path d="M8 76H112V88H8Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path class="up" d="M10 24H110V60H10Z"/>${range(20, 110, 12.5).map((x) => `<circle cx="${x}" cy="36" r=".9" fill="#1d1b19" opacity=".55"/><circle cx="${x + 6.25}" cy="48" r=".9" fill="#1d1b19" opacity=".55"/>`).join("")}<path class="up" d="M8 58H112V76H8Z"/>`,
    table: () => `<path d="M14 38H106V44H14Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>${leg(20, 44, 20, 88, 3)}${leg(100, 44, 100, 88, 3)}${leg(30, 44, 30, 84, 2)}${leg(90, 44, 90, 84, 2)}`,
    gueridon: () => `<path d="M28 40H92V45H28Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path d="M58 45H62V84H58Z" fill="var(--fr)" stroke="#1d1b19" stroke-width=".8"/><path d="M42 84H78V88H42Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>`,
    "table-basse": () => `<path d="M12 58H108V64H12Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>${leg(20, 64, 18, 86, 2.4)}${leg(100, 64, 102, 86, 2.4)}${leg(32, 64, 32, 82, 1.8)}${leg(88, 64, 88, 82, 1.8)}`,
    "mange-debout": () => `<path d="M34 22H86V27H34Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path d="M58.5 27H61.5V84H58.5Z" fill="var(--fr)" stroke="#1d1b19" stroke-width=".8"/><path d="M40 84H80V88H40Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>`,
    lit: () => `<path class="up" d="M16 18H104V66H16Z"/>${range(26, 104, 13).map((x) => `<path d="M${x} 22V62" stroke="#1d1b19" stroke-width=".5" opacity=".35"/>`).join("")}<path d="M10 60H110V72H10Z" fill="#f4f0e8" stroke="#1d1b19" stroke-width="1"/><path d="M10 72H110V82H10Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>${leg(14, 82, 14, 88)}${leg(106, 82, 106, 88)}<path d="M24 52H54V60H24ZM66 52H96V60H66Z" fill="#ece5d8" stroke="#1d1b19" stroke-width=".8"/>`,
    "tete-de-lit": () => `<path class="up" d="M10 20H110V80H10Z"/>${range(22, 110, 14).map((x) => `<circle cx="${x}" cy="38" r="1" fill="#1d1b19" opacity=".55"/><circle cx="${x + 7}" cy="54" r="1" fill="#1d1b19" opacity=".55"/><circle cx="${x}" cy="70" r="1" fill="#1d1b19" opacity=".55"/>`).join("")}<path d="M10 80H110" stroke="#1d1b19" stroke-width="1.2"/>`,
    chevet: () => `<path d="M36 34H84V68H36Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path d="M38 48H82" stroke="#1d1b19" stroke-width=".7" opacity=".6"/><path d="M56 41H64" stroke="#1d1b19" stroke-width="1.6" stroke-linecap="round"/>${leg(40, 68, 39, 86, 2.2)}${leg(80, 68, 81, 86, 2.2)}`,
    bureau: () => `<path d="M12 36H108V42H12Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path d="M70 42H104V54H70Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/><path d="M83 48H91" stroke="#1d1b19" stroke-width="1.4" stroke-linecap="round"/>${leg(16, 42, 16, 88, 2.6)}${leg(104, 54, 104, 88, 2.6)}`,
    "porte-bagages": () => `<path d="M22 50H98" stroke="var(--fr)" stroke-width="3.4"/><path d="M30 50L44 86M44 50L30 86M76 50L90 86M90 50L76 86" stroke="var(--fr)" stroke-width="2.4"/>${[34, 50, 66, 82].map((x) => `<path d="M${x} 46H${x + 6}V54H${x}Z" fill="#6b4a35" stroke="#1d1b19" stroke-width=".6"/>`).join("")}`,
    transat: () => `<path d="M14 72L96 72L108 40" fill="none" stroke="var(--fr)" stroke-width="3"/><path class="up" d="M16 66H92L104 38L110 40L98 72H16Z"/>${leg(20, 72, 20, 86, 2.6)}${leg(88, 72, 88, 86, 2.6)}<circle cx="96" cy="86" r="3" fill="var(--fr)" stroke="#1d1b19" stroke-width=".8"/>`,
    "chaise-outdoor": () => `${leg(44, 58, 40, 88)}${leg(76, 58, 80, 88)}<path d="M44 20Q60 16 76 20V56H44Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>${range(26, 54, 6).map((y) => `<path d="M47 ${y}H73" stroke="#fff" stroke-width="1.4" opacity=".55"/>`).join("")}<path d="M40 54H80V60H40Z" fill="var(--fr)" stroke="#1d1b19" stroke-width="1"/>`,
  };
  const furniture = (p, c, fabric) => {
    const id = `uph${(uid += 1)}`;
    const fab = fabric || FURN_FABRIC(p);
    const draw = (FURN[p.gen] || FURN.chaise)();
    return `<svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid meet" style="--fr:${c.h}" aria-hidden="true"><defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="11" height="11"><image href="${esc(fab)}" width="11" height="11" preserveAspectRatio="xMidYMid slice"/></pattern></defs><ellipse cx="60" cy="90" rx="46" ry="3" fill="#000" opacity=".06"/><g fill="url(#${id})" stroke="#1d1b19" stroke-width="1" stroke-linejoin="round">${draw.replaceAll('class="up"', `fill="url(#${id})"`)}</g></svg>`;
  };

  const visual = (p, ci = 0, opts = {}) => {
    const c = p.c[Math.min(ci, p.c.length - 1)] || { h: "#cccccc" };
    const cls = `vis${p.u === "mobilier" ? " is-mob" : ""}${opts.cls ? ` ${opts.cls}` : ""}`;
    const style = opts.style ? ` style="${opts.style}"` : "";
    if (p.u === "textile") return `<div class="${cls}"${style}><img src="${esc(c.img || p.img)}" alt="${esc(`${p.t}, coloris ${c.k}`)}" loading="lazy" decoding="async"></div>`;
    if (p.u === "mobilier") return `<div class="${cls}"${style}>${furniture(p, c, opts.fabric)}</div>`;
    return `<div class="${cls}"${style}><img src="${swatchUrl(p.gen, c, hashOf(p.h + c.k))}" alt="${esc(`${p.t}, ${c.n}`)}" loading="lazy" decoding="async"></div>`;
  };
  const finishGen = (c) => {
    if (/laque/i.test(c.n)) return "laque";
    if (/acier|inox|laiton|bronze/i.test(c.n)) return "metal";
    if (/ch[eê]ne|noyer|h[eê]tre|fr[eê]ne|teint/i.test(c.n)) return "placage";
    return "laque";
  };
  const swatch = (p, ci = 0) => {
    const c = p.c[ci];
    if (p.u === "textile") return c.img || p.img;
    if (p.u === "mobilier") return swatchUrl(finishGen(c), c, hashOf(p.h + c.k));
    return swatchUrl(p.gen, c, hashOf(p.h + c.k));
  };

  const derivedSpaces = (t) => {
    const es = new Set();
    if (t.us?.includes("rideaux") || ["occultants", "voilages"].includes(t.f)) { es.add("chambres"); es.add("couloirs"); }
    if (t.us?.includes("literie")) es.add("chambres");
    if (t.f === "outdoor" || t.ca?.includes("deperlant")) { es.add("terrasse"); es.add("spa"); }
    if (t.us?.includes("sieges")) {
      if ((t.md || 0) >= 40000) { es.add("restaurant"); es.add("lobby"); } else { es.add("chambres"); es.add("lobby"); }
    }
    if (t.f === "effet-cuir") es.add("restaurant");
    if (t.f === "microfibres" && t.ca?.includes("easy-clean")) es.add("spa");
    if (!es.size) es.add("chambres");
    return [...es];
  };
  const derivedMatieres = (t) => {
    const m = new Set();
    const cm = (t.cm || "").toLowerCase();
    if (["velours", "chenilles"].includes(t.f)) m.add("velours");
    if (t.f === "tweed" || /laine|wool/.test(cm)) m.add("laine");
    if (t.f === "naturels" || /\blin\b|coton|cotton/.test(cm)) m.add("lin");
    if (t.f === "effet-cuir") m.add("cuir");
    if (["jacquards", "textures", "imprimes"].includes(t.f)) m.add("tissage");
    if (["outdoor", "microfibres", "occultants", "voilages"].includes(t.f) && !m.size) m.add("fibre");
    if (!m.size) m.add("tissage");
    return [...m];
  };
  const fromTextile = (t) => {
    const fam = FAM_ONE[t.f] || "Tissu";
    const specs = [];
    if (t.cm) specs.push(["Composition", t.cm]);
    if (t.lz) specs.push(["Laize", `${t.lz} cm`]);
    if (t.md) specs.push(["Résistance", `${nf.format(t.md)} tours Martindale`]);
    if (t.gr) specs.push(["Grammage", `${nf.format(t.gr)} g/m²`]);
    if (t.us?.length) specs.push(["Usages", t.us.map((u) => USAGES[u] || u).join(", ")]);
    if (t.ca?.length) specs.push(["Entretien", t.ca.map((u) => CARE[u] || u).join(", ")]);
    if (t.ce) specs.push(["Certifications", Array.isArray(t.ce) ? t.ce.join(", ") : t.ce]);
    if (t.rl) specs.push(["Rouleau", `${t.rl} m`]);
    if (t.g) specs.push(["Gamme", t.g]);
    const feu = Array.isArray(t.fe) ? t.fe.join(" · ") : t.fe;
    return {
      u: "textile", h: t.h, t: t.t, cat: t.f, catName: FAM[t.f] || t.f,
      d: `${fam}${t.cm ? `, ${t.cm}` : ""}${t.lz ? `. Laize ${t.lz} cm` : ""}.`,
      unit: "ml", min: t.cp ? 3 : (t.rl || 30), pack: t.cp ? "Coupe à partir de 3 ml" : `Rouleau entier de ${t.rl || 30} m`,
      feu: feu || "", specs, es: derivedSpaces(t), ma: derivedMatieres(t), gen: "photo", img: t.i ? `https:${t.i}` : "",
      c: (t.c || []).map((c) => ({ k: c.k, n: `Coloris ${c.k}`, h: c.h || "#cccccc", s: c.s || 0, img: c.i ? `https:${c.i}` : "" })),
      o: t.o, dl: "Expédié par l'usine", n: !!t.n, md: t.md, us: t.us || [], cp: t.cp,
    };
  };

  let dataPromise = null;
  const load = () => {
    if (dataPromise) return dataPromise;
    dataPromise = Promise.all([
      fetch(`${ROOT}assets/data/textile.json`).then((r) => r.json()),
      fetch(`${ROOT}assets/data/demo.json`).then((r) => r.json()),
    ]).then(([tx, demo]) => {
      const textile = tx.products.map(fromTextile);
      const others = demo.products;
      const all = [...textile, ...others];
      all.forEach((p) => {
        p.stock = p.c.reduce((a, c) => a + (c.s || 0), 0);
        p.fams = [...new Set(p.c.map((c) => familyOf(c.h)))];
      });
      const by = {};
      U_ORDER.forEach((u) => { by[u] = all.filter((p) => p.u === u); });
      const index = new Map(all.map((p) => [`${p.u}/${p.h}`, p]));
      return { all, by, get: (u, h) => index.get(`${u}/${h}`), stats: stats(by) };
    });
    return dataPromise;
  };
  const stats = (by) => {
    const out = {};
    U_ORDER.forEach((u) => {
      const list = by[u];
      const cats = {};
      list.forEach((p) => { cats[p.cat] = cats[p.cat] || { k: p.cat, n: p.catName, count: 0 }; cats[p.cat].count += 1; });
      out[u] = { products: list.length, colors: list.reduce((a, p) => a + p.c.length, 0), stock: list.reduce((a, p) => a + p.stock, 0), cats: Object.values(cats) };
    });
    return out;
  };

  const productUrl = (p, ci) => `${ROOT}${p.u}/?p=${encodeURIComponent(p.h)}${ci ? `&c=${encodeURIComponent(p.c[ci].k)}` : ""}`;
  const universeUrl = (u, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return `${ROOT}${u}/${q ? `?${q}` : ""}`;
  };
  const stockLabel = (p) => {
    if (p.u === "mobilier") {
      const any = p.c.some((c) => c.s > 0);
      return any ? `<span class="ok">● en stock</span>` : `<span>${esc(p.dl)}</span>`;
    }
    return p.stock > 0 ? `<span class="ok">● ${qty(p.stock, p.unit)} en stock</span>` : "<span>sur commande</span>";
  };
  const card = (p, opts = {}) => {
    const ci = opts.ci || 0;
    const sw = p.c.slice(0, 6).map((c) => `<i style="background:${c.h}"></i>`).join("");
    const more = p.c.length > 6 ? `<em>+${p.c.length - 6}</em>` : "";
    return `<a class="pc u-${p.u}" href="${opts.href || productUrl(p, ci)}" data-u="${p.u}" data-h="${esc(p.h)}">
      <div style="position:relative">${visual(p, ci)}${p.n ? '<span class="pc-tag">Nouveau</span>' : ""}<span class="pc-sw">${sw}${more}</span></div>
      <div class="pc-b">
        <span class="pc-u"><span class="u-dot"></span>${UNIVERS[p.u].n} · ${esc(p.catName)}</span>
        <b class="pc-t">${esc(p.t)}</b>
        <span class="pc-d">${esc(p.d)}</span>
        <span class="pc-m">${p.feu && p.feu !== "–" ? `<span>${esc(p.feu)}</span>` : ""}<span>${UNIVERS[p.u].unitLong}</span>${stockLabel(p)}</span>
      </div>
    </a>`;
  };

  const store = (key, max) => {
    const read = () => {
      try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
    };
    const write = (v) => {
      try { localStorage.setItem(key, JSON.stringify(v)); } catch { }
      document.dispatchEvent(new CustomEvent(`dchr:${key}`, { detail: v }));
      $$(`[data-count="${key}"]`).forEach((el) => { el.textContent = v.length; el.dataset.n = v.length; });
    };
    return {
      list: read,
      count: () => read().length,
      has: (u, h, k) => read().some((x) => x.u === u && x.h === h && (k == null || x.k === k)),
      add: (item) => {
        const v = read();
        const i = v.findIndex((x) => x.u === item.u && x.h === item.h && x.k === item.k);
        if (i >= 0) {
          if (item.q != null) v[i].q = (v[i].q || 0) + item.q;
        } else {
          if (max && v.length >= max) return false;
          v.push({ ...item, at: Date.now() });
        }
        write(v);
        return true;
      },
      set: (item) => {
        const v = read();
        const i = v.findIndex((x) => x.u === item.u && x.h === item.h && x.k === item.k);
        if (i >= 0) v[i] = { ...v[i], ...item };
        write(v);
      },
      remove: (u, h, k) => write(read().filter((x) => !(x.u === u && x.h === h && (k == null || x.k === k)))),
      clear: () => write([]),
      on: (fn) => document.addEventListener(`dchr:${key}`, (e) => fn(e.detail)),
    };
  };
  const projet = store("dchr-projet");
  const boite = store("dchr-boite", 8);

  const PROPS = {
    "1-plan": "Le plan", "2-hotel": "L'hôtel en coupe", "3-materiautheque": "La matériauthèque", "4-comptoir": "Le comptoir",
  };
  const prop = () => {
    const q = new URLSearchParams(location.search).get("prop");
    if (q && PROPS[q]) {
      try { localStorage.setItem("dchr-prop", q); } catch { }
      return q;
    }
    try { return localStorage.getItem("dchr-prop") || "1-plan"; } catch { return "1-plan"; }
  };

  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></symbol>
</svg>`;

  const navFor = (pr, current) => {
    const uniTabs = (ring) => U_ORDER.map((u) => `<a class="uni-tab${current === u ? " is-current" : ""}" style="--u: var(--u-${u})" href="${universeUrl(u)}"><span class="d${ring ? " ring" : ""}"></span>${UNIVERS[u].n}${ring ? "" : ` <span class="p">/${u}</span>`}</a>`).join("");
    if (pr === "2-hotel") {
      return `${Object.entries(SPACES).map(([k, s]) => `<a class="uni-tab${current === `espace:${k}` ? " is-current" : ""}" href="${ROOT}2-hotel/espace/?e=${k}">${s.n}</a>`).join("")}<span class="nav-sep"></span>${uniTabs(true)}`;
    }
    if (pr === "3-materiautheque") {
      return `<a class="uni-tab" href="${ROOT}3-materiautheque/#nuancier">Nuancier</a><a class="uni-tab${String(current).startsWith("matiere") ? " is-current" : ""}" href="${ROOT}3-materiautheque/matiere/">Matières</a><a class="uni-tab" href="${ROOT}3-materiautheque/#boite">Boîte d'échantillons <span class="hdr-count" data-count="dchr-boite" data-n="${boite.count()}">${boite.count()}</span></a><span class="nav-sep"></span>${uniTabs(true)}`;
    }
    if (pr === "4-comptoir") {
      return `<a class="uni-tab${current === "recherche" ? " is-current" : ""}" href="${ROOT}4-comptoir/">Rechercher</a><a class="uni-tab" href="${ROOT}4-comptoir/#espace-pro">Mes projets</a><a class="uni-tab" href="${ROOT}4-comptoir/#espace-pro">Devis</a><a class="uni-tab" href="${ROOT}4-comptoir/#espace-pro">Expéditions</a><a class="uni-tab" href="${ROOT}4-comptoir/#espace-pro">Réassort</a><span class="nav-sep"></span>${uniTabs(true)}`;
    }
    return `${uniTabs(false)}<span class="nav-sep"></span><a class="uni-tab" href="${ROOT}1-plan/#espaces">Par espace</a><a class="uni-tab" href="${ROOT}1-plan/#accords">Accords</a>`;
  };
  const searchUrl = (pr) => (pr === "4-comptoir" ? `${ROOT}4-comptoir/recherche/` : `${ROOT}recherche/`);
  const header = (opts = {}) => {
    const pr = prop();
    const host = $("[data-dchr-header]");
    if (!host) return;
    if (!$("#i-search")) document.body.insertAdjacentHTML("afterbegin", SPRITE);
    host.outerHTML = `<div class="topbar"><div class="topbar-track"><span>Centrale d'achat CHR</span><span class="dot-sep"></span><span>Direct fabricant, sans intermédiaire</span><span class="dot-sep"></span><span>Un compte pro pour les quatre univers</span><span class="dot-sep"></span><span>Boutique réservée aux professionnels</span></div></div>
<header class="hdr">
  <div class="wrap">
    <div class="hdr-row">
      <a class="logo" href="${ROOT}${pr}/" aria-label="Direct CHR, accueil"><span class="logo-a">DIRECT</span><span class="logo-rule"></span><span class="logo-b">${opts.logo || "CHR"}</span></a>
      <form class="search" action="${searchUrl(pr)}" role="search">
        <svg class="search-ico"><use href="#i-search"/></svg>
        <label class="vh" for="dchr-q">Rechercher dans les quatre catalogues</label>
        <input id="dchr-q" name="q" type="search" autocomplete="off" placeholder="${pr === "4-comptoir" ? "180 ml velours bleu M1…" : "velours bleu, moquette Cfl-s1, fauteuil…"}" value="${esc(opts.q || "")}">
        <span class="scope">
          <label class="vh" for="dchr-scope">Univers</label>
          <select id="dchr-scope" name="u"><option value="">Tout</option>${U_ORDER.map((u) => `<option value="${u}"${opts.scope === u ? " selected" : ""}>${UNIVERS[u].n}</option>`).join("")}</select>
          <svg><use href="#i-chev"/></svg>
        </span>
      </form>
      <div class="hdr-actions">
        <button class="icon-btn lang" type="button"><svg><use href="#i-globe"/></svg><span class="t">Français</span></button>
        <a class="icon-btn" href="${ROOT}projet/" aria-label="Projet en cours"><svg><use href="#i-bag"/></svg><span class="t">Projet</span><span class="hdr-count" data-count="dchr-projet" data-n="${projet.count()}">${projet.count()}</span></a>
        <a class="btn btn-sm" href="${ROOT}${pr}/">Inscription</a>
      </div>
    </div>
    <nav class="nav" aria-label="Navigation">
      <div class="nav-scroll">${navFor(pr, opts.current)}</div>
      <span class="nav-live"><span class="live-dot"></span>4 univers en ligne</span>
    </nav>
  </div>
</header>`;
  };
  const footer = () => {
    const host = $("[data-dchr-footer]");
    if (!host) return;
    const pr = prop();
    host.outerHTML = `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <span class="logo"><span class="logo-a">DIRECT</span><span class="logo-rule"></span><span class="logo-b">CHR</span></span>
        <p class="foot-pitch">Centrale d'achat pour l'hôtellerie et la restauration, en direct des fabricants européens. Boutique réservée aux professionnels.</p>
      </div>
      <div>
        <h4>Univers</h4>
        <ul>${U_ORDER.map((u) => `<li><a class="u-link" style="--u: var(--u-${u})" href="${universeUrl(u)}"><i></i>Direct ${UNIVERS[u].n} <small>/${u}</small></a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Centrale</h4>
        <ul><li><a href="${ROOT}${pr}/">Accueil · ${esc(PROPS[pr])}</a></li><li><a href="${ROOT}projet/">Projet en cours</a></li><li><a href="${ROOT}recherche/">Rechercher</a></li><li><span class="mono">info@directchr.com</span></li></ul>
      </div>
      <div>
        <h4>Conditions</h4>
        <ul><li>Coupe à partir de 3 ml</li><li>Livraison offerte dès 2 500 € HT</li><li>Expédié par l'usine</li></ul>
      </div>
    </div>
    <div class="foot-bottom"><span>© 2026 Direct CHR · prototype local</span><span>directchr.com · /textile · /mural · /sol · /mobilier</span></div>
  </div>
</footer>`;
  };

  let toastT;
  const toast = (msg) => {
    let el = $("[data-toast]");
    if (!el) {
      document.body.insertAdjacentHTML("beforeend", '<div class="toast" data-toast role="status" aria-live="polite"></div>');
      el = $("[data-toast]");
    }
    el.textContent = msg;
    el.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("is-in"), 3200);
  };

  const accordsFor = (p, data, n = 3) => {
    const base = p.c[0]?.h || "#999999";
    const out = {};
    U_ORDER.filter((u) => u !== p.u).forEach((u) => {
      out[u] = data.by[u]
        .map((q) => {
          const shared = q.es.filter((e) => p.es.includes(e)).length;
          let best = 0;
          let bd = Infinity;
          q.c.forEach((c, i) => {
            const d = dist(base, c.h);
            if (d < bd) { bd = d; best = i; }
          });
          return { p: q, ci: best, score: shared * 30 - Math.min(bd, 60) + (q.stock > 0 ? 5 : 0) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, n);
    });
    return out;
  };

  const search = (data, q, scope) => {
    const terms = String(q || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter((t) => t.length > 1);
    const list = scope ? data.by[scope] : data.all;
    if (!terms.length) return list.slice();
    const scored = list
      .map((p) => {
        if (!p._s) p._s = [p.t, p.catName, p.d, p.feu, UNIVERS[p.u].n, ...p.specs.map((s) => s[1]), ...p.c.map((c) => c.n), ...p.es.map((e) => SPACES[e]?.n || e), ...p.ma, ...p.fams.map((f) => COLOR_FAMILIES.find((c) => c.k === f)?.n || "")].join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        const hits = terms.filter((t) => p._s.includes(t)).length;
        const title = terms.some((t) => p.t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(t)) ? 2 : 0;
        return { p, all: hits === terms.length, score: hits * 3 + title + (hits === terms.length ? 5 : 0) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const full = scored.filter((x) => x.all);
    return (full.length ? full : scored).map((x) => x.p);
  };

  window.DCHR = {
    ROOT, IMG, UNIVERS, U_ORDER, SPACES, MATIERES, FAM, COLOR_FAMILIES, PROPS,
    $, $$, esc, num, nf, qty, mix, shade, tint, toHsl, hsl, dist, familyOf,
    load, visual, swatch, card, productUrl, universeUrl, stockLabel, accordsFor, search,
    projet, boite, prop, header, footer, toast,
  };
})();
