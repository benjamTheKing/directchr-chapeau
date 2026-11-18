(() => {
  const D = window.DCHR;
  const IMG = (k) => `${D.IMG}${k}.jpg`;

  const PHOTOS = {
    occultant: ["Cadillac BO", "Occultant", "occultants"],
    voilage: ["Ancona", "Voilage", "voilages"],
    velours: ["Annecy", "Velours", "velours"],
    texture: ["Alpe d'Huez", "Bouclette", "textures"],
    cuir: ["Genève", "Effet cuir", "effet-cuir"],
    chenille: ["Aix-les-Bains", "Chenillé", "chenilles"],
    jacquard: ["Abelia", "Jacquard", "jacquards"],
    tweed: ["Sète", "Tweed", "tweed"],
    microfibre: ["Cahuzac", "Microfibre", "microfibres"],
    outdoor: ["Acapulco", "Outdoor", "outdoor"],
    imprime: ["Bloom", "Imprimé", "imprimes"],
  };

  const SPACES = {
    chambres: {
      lead: "mural", name: "Chambres", lvl: "R+1 à R+3", kind: "Locaux à sommeil", pour: "pour les chambres", tag: "Le calme avant tout.",
      desc: "Le classement feu le plus exigeant de l'hôtel, et le calme avant tout : occulter, feutrer, dormir.",
      sw: ["occultant", "voilage"],
      u: {
        textile: ["Occultants, voilages, tête de lit", "M1 · EN 13773", "Occultants, voilages"],
        mural: ["Vinyle lessivable, panneaux tête de lit", "C-s3,d0", "Vinyle lessivable"],
        sol: ["Moquette en lés, parquet", "Dfl-s1", "Moquette en lés"],
        mobilier: ["Lit, chevets, fauteuil, bureau", "EN 1021-1 et -2", "Lit, chevets, fauteuil"],
      },
      cats: {
        textile: ["occultants", "voilages", "velours"],
        mural: ["vinyles", "papiers-peints", "lambris"],
        sol: ["moquettes", "parquets", "dalles-moquette"],
        mobilier: ["chambre", "fauteuils"],
      },
      gens: ["lit", "tete-de-lit"],
      role: { textile: "Rideaux", mural: "Murs", sol: "Sol" },
      mt: "wall",
      amb: { base: "une chambre type de 19 m², fenêtre de 2,40 m", q: { textile: 6, mural: 44, sol: 21, mobilier: 1 } },
      th: { wall: "#ece4d7", floor: "url(#cp-moquette)", wood: "#8b6a50" },
      hud: [4.5, 13.05], box: [-0.15, 4.25, 8.85, 7.85],
    },
    couloirs: {
      lead: "sol", name: "Couloirs", lvl: "R-1 à R+4", kind: "Circulations", pour: "pour les couloirs", tag: "Le trafic sans les traces.",
      desc: "Valises, chariots, passages jour et nuit : les matières encaissent le trafic sans marquer.",
      sw: ["jacquard", "tweed"],
      u: {
        textile: ["Tentures", "M1", "Tentures"],
        mural: ["Vinyle haute résistance", "B-s2,d0", "Vinyle haute résistance"],
        sol: ["Moquette trafic intense", "Cfl-s1", "Moquette trafic intense"],
        mobilier: ["Consoles, banquettes", "EN 1021-1 et -2", "Consoles, banquettes"],
      },
      cats: {
        textile: ["velours", "chenilles", "tweed"],
        mural: ["vinyles", "acoustique", "tissus-muraux"],
        sol: ["moquettes", "dalles-moquette", "lvt"],
        mobilier: ["canapes"],
      },
      gens: ["banquette", "canape"],
      role: { textile: "Tentures", mural: "Murs", sol: "Sol" },
      mt: "wall",
      amb: { base: "un étage de couloir de 30 m sur 1,60 m", q: { textile: 12, mural: 160, sol: 50, mobilier: 2 } },
      th: { wall: "url(#cp-vinyle)", floor: "url(#cp-runner)", wood: "#6e5240", shaft: "#e2ded6" },
      hud: [11.6, 12.6], box: [8.55, 4.25, 14.45, 7.85],
    },
    lobby: {
      lead: "mobilier", name: "Lobby", lvl: "RDC", kind: "Réception, salons", pour: "pour le lobby", tag: "La première impression.",
      desc: "La première impression de l'hôtel : matières nobles, acoustique maîtrisée, assises très sollicitées.",
      sw: ["velours", "texture"],
      u: {
        textile: ["Velours, effet cuir, bouclettes", "M1 · EN 1021", "Velours, bouclettes"],
        mural: ["Panneaux acoustiques, lames bois", "B-s2,d0", "Panneaux acoustiques"],
        sol: ["Terrazzo, pierre, tapis", "Cfl-s1", "Terrazzo, tapis"],
        mobilier: ["Canapés, fauteuils, banque d'accueil", "EN 1021-1 et -2", "Canapés, fauteuils"],
      },
      cats: {
        textile: ["velours", "effet-cuir", "textures"],
        mural: ["acoustique", "lambris", "tissus-muraux"],
        sol: ["terrazzo", "parquets", "carrelages"],
        mobilier: ["canapes", "fauteuils", "tables"],
      },
      gens: ["canape", "lounge", "fauteuil"],
      role: { textile: "Assises", mural: "Panneaux", sol: "Sol" },
      mt: "panel",
      amb: { base: "un lobby de 120 m² avec deux salons", q: { textile: 30, mural: 40, sol: 125, mobilier: 2 } },
      th: { wall: "#e8e1d5", panel: "url(#cp-lames)", floor: "url(#cp-terrazzo)", wood: "#5c4637", stone: "#d6cdbf", rug: "#a89a86" },
      hud: [4.6, 2.45], box: [-0.15, -0.35, 8.85, 4.65],
    },
    restaurant: {
      lead: "textile", name: "Restaurant & bar", lvl: "RDC", kind: "Salle et comptoir", pour: "pour le restaurant et le bar", tag: "La rotation au quotidien.",
      desc: "Des assises à forte rotation, des taches et des nettoyages tous les jours.",
      sw: ["cuir", "chenille"],
      u: {
        textile: ["Banquettes, chaises", "Martindale ≥ 50 000", "Banquettes, chaises"],
        mural: ["Acoustique, papier peint vinyle", "B-s2,d0", "Papier peint vinyle"],
        sol: ["LVT, parquet vitrifié", "Cfl-s1 · R10", "LVT, parquet"],
        mobilier: ["Chaises, tables, mange-debout", "EN 1021-1 et -2", "Chaises, tables"],
      },
      cats: {
        textile: ["effet-cuir", "chenilles", "velours"],
        mural: ["acoustique", "papiers-peints", "vinyles"],
        sol: ["lvt", "parquets", "terrazzo"],
        mobilier: ["chaises", "tables"],
      },
      gens: ["chaise", "bistrot"],
      role: { textile: "Banquettes", mural: "Murs", sol: "Sol" },
      mt: "panel",
      amb: { base: "une salle de 60 couverts, 110 m²", q: { textile: 40, mural: 30, sol: 115, mobilier: 60 } },
      th: { wall: "#e6e4da", panel: "url(#cp-arches)", floor: "url(#cp-parquet)", wood: "#7a5a43", stone: "#cfc8bc" },
      hud: [18.6, 2.45], box: [14.15, -0.35, 23.15, 4.65],
    },
    spa: {
      lead: "sol", name: "Spa", lvl: "R-1", kind: "Zones humides", pour: "pour le spa", tag: "Tout sèche, rien ne bouge.",
      desc: "Vapeur, chlore et pieds nus : tout doit sécher vite et rester imputrescible.",
      sw: ["microfibre", "outdoor"],
      u: {
        textile: ["Microfibres, outdoor déperlant", "M1 · anti-humidité", "Microfibres"],
        mural: ["Enduits, panneaux hydrofuges", "B-s2,d0", "Enduits hydrofuges"],
        sol: ["Grès antidérapant", "Pieds nus classe C", "Grès antidérapant"],
        mobilier: ["Transats, banquettes imputrescibles", "Matériaux imputrescibles", "Transats"],
      },
      cats: {
        textile: ["microfibres", "outdoor", "effet-cuir"],
        mural: ["enduits"],
        sol: ["carrelages", "exterieur", "lvt"],
        mobilier: ["exterieur"],
      },
      gens: ["transat"],
      role: { textile: "Transats", mural: "Murs", sol: "Sol" },
      mt: "wall",
      amb: { base: "un spa de 80 m², bassin compris", q: { textile: 20, mural: 60, sol: 85, mobilier: 6 } },
      th: { wall: "url(#cp-enduit)", floor: "url(#cp-gres)", wood: "#c49c6e" },
      hud: [4.3, -1.8], box: [-0.15, -4.95, 8.85, -0.2],
    },
    terrasse: {
      lead: "mobilier", name: "Terrasse", lvl: "R+4", kind: "Extérieur", pour: "pour la terrasse", tag: "Toute la saison dehors.",
      desc: "Soleil, pluie et gel : des toiles et des structures traitées pour rester dehors toute la saison.",
      sw: ["outdoor", "imprime"],
      u: {
        textile: ["Toiles outdoor, coussins", "Tenue UV", "Toiles outdoor"],
        mural: ["Hors périmètre", "–", "Hors périmètre"],
        sol: ["Lames composite, dalles sur plots", "R11", "Lames composite"],
        mobilier: ["Mobilier outdoor empilable", "Traité UV, empilable", "Mobilier empilable"],
      },
      cats: {
        textile: ["outdoor", "effet-cuir"],
        mural: [],
        sol: ["exterieur", "carrelages"],
        mobilier: ["exterieur", "chaises"],
      },
      gens: ["transat", "chaise-outdoor", "lounge"],
      role: { textile: "Toiles", mural: "Murs", sol: "Sol" },
      mt: "wall",
      amb: { base: "une terrasse de 100 m²", q: { textile: 30, mural: 0, sol: 105, mobilier: 12 } },
      th: { floor: "url(#cp-deck)", wood: "#9a7a5c" },
      hud: [3.0, 16.75], box: [-0.15, 13.85, 8.85, 17.3],
    },
  };
  const ORDER = ["chambres", "couloirs", "lobby", "restaurant", "spa", "terrasse"];
  const GEN_N = {
    lit: "Lit", "tete-de-lit": "Tête de lit", chevet: "Chevet", bureau: "Bureau", "porte-bagages": "Porte-bagages",
    chaise: "Chaise", bistrot: "Chaise bistrot", tabouret: "Tabouret", fauteuil: "Fauteuil", lounge: "Fauteuil lounge",
    canape: "Canapé", banquette: "Banquette", table: "Table", gueridon: "Guéridon", "table-basse": "Table basse",
    "mange-debout": "Mange-debout", transat: "Transat", "chaise-outdoor": "Chaise",
  };
  const MAT = {
    soft: "#f5f1ea", metal: "#c6c0b6", glass: "url(#cp-glass)", water: "url(#cp-water)", bottle: "#a3b1a1",
    shaft: "#e8e5df", stone: "#d8d0c4", plant: "#7b8a72", rug: "#b3a591", wall: "#eeeae3", panel: "#e0d9cd",
    floor: "#cfc8bd", wood: "#7a5a43",
  };

  const K = 20;
  const OX = 5.8;
  const OZ = 17.6;
  const VW = 608;
  const VH = 452;
  const FL = 0.12;
  const X = (x) => +((x + OX) * K).toFixed(1);
  const Y = (z) => +((OZ - z) * K).toFixed(1);
  const r = (x0, z0, x1, z1) => `M${X(x0)} ${Y(z0)}H${X(x1)}V${Y(z1)}H${X(x0)}Z`;
  const pl = (pts, close = true) => pts.map(([x, z], i) => `${i ? "L" : "M"}${X(x)} ${Y(z)}`).join("") + (close ? "Z" : "");
  const ln = (...c) => {
    let s = "";
    for (let i = 0; i + 3 < c.length; i += 4) s += `M${X(c[i])} ${Y(c[i + 1])}L${X(c[i + 2])} ${Y(c[i + 3])}`;
    return s;
  };
  const range = (from, to, step) => {
    const out = [];
    for (let v = from; v < to - 1e-6; v += step) out.push(+v.toFixed(3));
    return out;
  };
  const oct = (cx, cz, rx, rz) => pl(range(0, 8, 1).map((i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz];
  }));

  const G = Object.fromEntries(ORDER.map((id) => [id, []]));
  const T = Object.fromEntries(ORDER.map((id) => [id, []]));
  const CUT = [];
  const GZ = [];

  const bedroom = (xa, xb, z, dir, num) => {
    const w = xb - xa;
    const A = (d) => (dir > 0 ? xa + d : xb - d);
    const R = (d0, h0, d1, h1) => r(Math.min(A(d0), A(d1)), z + h0, Math.max(A(d0), A(d1)), z + h1);
    const Q = (pts) => pl(pts.map(([d, h]) => [A(d), z + h]));
    const N = (...c) => ln(...c.map((v, i) => (i % 2 ? z + v : A(v))));
    const pillow = (d0, d1, h0, h1) => Q([[d0 + 0.05, h0], [d1 - 0.05, h0], [d1, h0 + 0.05], [d1, h1 - 0.04], [d1 - 0.07, h1], [d0 + 0.07, h1], [d0, h1 - 0.04], [d0, h0 + 0.05]]);
    G.chambres.push(
      [R(0, 0, w, 2.9), "wall"],
      [R(2.98, 0.7, 3.82, 2.42), "glass"],
      [N(3.4, 0.7, 3.4, 2.42, 2.9, 0.68, 3.9, 0.68), null],
      [R(2.92, 0.16, 3.88, 2.58), "t:voilage", "sheer"],
      [R(2.7, 0.14, 3.0, 2.6), "t:occultant"],
      [R(3.8, 0.14, 4.04, 2.6), "t:occultant"],
      [N(2.8, 0.2, 2.8, 2.56, 2.9, 0.2, 2.9, 2.56, 3.88, 0.2, 3.88, 2.56, 3.96, 0.2, 3.96, 2.56), "~"],
      [N(2.62, 2.64, 4.08, 2.64), null],
      [R(0.16, 0.36, 2.16, 1.36), "t:velours"],
      [N(0.83, 0.42, 0.83, 1.3, 1.49, 0.42, 1.49, 1.3, 0.22, 0.86, 2.1, 0.86), "~"],
      [pillow(0.36, 1.1, 0.6, 0.9), "soft"],
      [pillow(1.22, 1.96, 0.6, 0.9), "soft"],
      [N(0.34, FL, 0.34, 0.18, 1.98, FL, 1.98, 0.18), null],
      [R(0.26, 0.18, 2.06, 0.42), "wood"],
      [Q([[0.2, 0.42], [2.12, 0.42], [2.1, 0.7], [0.22, 0.7]]), "soft"],
      [R(0.2, 0.46, 2.12, 0.6), "t:tweed"],
      [R(2.24, FL, 2.62, 0.56), "wood"],
      [N(2.24, 0.4, 2.62, 0.4), "~"],
      [N(2.43, 0.56, 2.43, 0.8), null],
      [Q([[2.31, 0.8], [2.55, 0.8], [2.51, 1.0], [2.35, 1.0]]), "soft"],
      [N(3.07, FL, 3.08, 0.22, 3.73, FL, 3.72, 0.22), null],
      [Q([[3.0, 0.22], [3.8, 0.22], [3.8, 0.62], [3.72, 0.66], [3.7, 0.84], [3.1, 0.84], [3.08, 0.66], [3.0, 0.62]]), "t:chenille"],
      [N(3.1, 0.46, 3.7, 0.46, 3.1, 0.46, 3.1, 0.66, 3.7, 0.46, 3.7, 0.66), "~"],
      [R(0, 0, w, FL), "floor"],
    );
    T.chambres.push([dir > 0 ? xa + 0.18 : xb - 0.18, z + 1.6, `CH. ${num}`, dir > 0 ? "" : "end"]);
  };

  const lounger = (o, x, zb, tex) => o.push(
    [ln(x + 0.1, zb, x + 0.1, zb + 0.27, x + 1.2, zb, x + 1.2, zb + 0.27), null],
    [r(x, zb + 0.26, x + 1.3, zb + 0.31), "wood"],
    [pl([[x, zb + 0.31], [x + 1.3, zb + 0.31], [x + 1.86, zb + 0.86], [x + 1.78, zb + 0.94], [x + 1.24, zb + 0.43], [x, zb + 0.43]]), tex],
  );

  const parasol = (o, cx, zb) => o.push(
    [r(cx - 0.25, zb, cx + 0.25, zb + 0.07), "metal"],
    [ln(cx, zb + 0.07, cx, zb + 2.55), null],
    [pl([[cx - 1.5, zb + 2.02], [cx, zb + 2.55], [cx + 1.5, zb + 2.02]]), "t:outdoor"],
    [ln(cx, zb + 2.55, cx - 0.75, zb + 2.02, cx, zb + 2.55, cx + 0.75, zb + 2.02), "~"],
    [r(cx - 1.5, zb + 1.92, cx + 1.5, zb + 2.02), "t:outdoor"],
  );

  const lobby = () => {
    const o = G.lobby;
    o.push([r(0.3, 0, 8.7, 4.3), "wall"], [r(0.7, 0.4, 4.3, 3.8), "panel"]);
    o.push([range(0.94, 4.3, 0.24).map((x) => ln(x, 0.4, x, 3.8)).join(""), "~"]);
    [5.7, 7.1].forEach((cx) => o.push(
      [ln(cx, 4.3, cx, 3.25), null],
      [pl([[cx - 0.24, 3.0], [cx + 0.24, 3.0], [cx + 0.1, 3.25], [cx - 0.1, 3.25]]), "soft"],
    ));
    o.push(
      [r(1.0, FL, 3.9, 1.06), "wood"],
      [range(1.18, 3.9, 0.18).map((x) => ln(x, FL + 0.06, x, 1.0)).join(""), "~"],
      [r(0.92, 1.06, 3.98, 1.14), "stone"],
      [ln(3.3, 1.14, 3.3, 1.42), null],
      [pl([[3.16, 1.42], [3.44, 1.42], [3.38, 1.62], [3.22, 1.62]]), "soft"],
      [r(4.5, FL, 8.4, FL + 0.04), "rug"],
      [r(5.05, 0.5, 7.75, 1.0), "t:velours"],
      [ln(6.4, 0.54, 6.4, 0.96), "~"],
      [ln(5.0, FL + 0.04, 5.0, 0.2, 7.8, FL + 0.04, 7.8, 0.2), null],
      [r(4.9, 0.2, 7.9, 0.5), "t:velours"],
      [ln(6.4, 0.24, 6.4, 0.46), "~"],
      [r(4.84, 0.2, 5.18, 0.74), "t:velours"],
      [r(7.62, 0.2, 7.96, 0.74), "t:velours"],
      [ln(5.85, FL + 0.04, 5.85, 0.4, 6.95, FL + 0.04, 6.95, 0.4), null],
      [r(5.75, 0.4, 7.05, 0.46), "stone"],
      [pl([[8.04, FL + 0.04], [8.46, FL + 0.04], [8.52, 0.2], [8.52, 0.46], [8.44, 0.54], [8.06, 0.54], [7.98, 0.46], [7.98, 0.2]]), "t:texture"],
      [r(0.3, 0, 8.7, FL), "floor"],
    );
    T.lobby.push([0.72, 3.98, "LOBBY · RÉCEPTION"]);
  };

  const restaurant = () => {
    const o = G.restaurant;
    o.push([r(14.3, 0, 22.7, 4.3), "wall"], [r(17.9, 0.62, 22.4, 3.7), "panel"]);
    [1.75, 2.3, 2.85].forEach((zs, j) => {
      range(14.86, 17.2, 0.34).forEach((x, i) => {
        const h = 0.2 + ((i * 7 + j * 3) % 5) * 0.035;
        o.push([pl([[x - 0.05, zs], [x + 0.05, zs], [x + 0.05, zs + h], [x + 0.02, zs + h + 0.04], [x + 0.02, zs + h + 0.1], [x - 0.02, zs + h + 0.1], [x - 0.02, zs + h + 0.04], [x - 0.05, zs + h]]), "bottle"]);
      });
      o.push([ln(14.7, zs, 17.3, zs), null]);
    });
    o.push(
      [r(14.7, FL, 17.3, 1.06), "wood"],
      [range(14.88, 17.3, 0.18).map((x) => ln(x, FL + 0.06, x, 1.0)).join(""), "~"],
      [r(14.62, 1.06, 17.38, 1.13), "stone"],
    );
    [15.15, 16.0, 16.85].forEach((x) => o.push(
      [ln(x - 0.16, FL, x - 0.1, 0.74, x + 0.16, FL, x + 0.1, 0.74, x - 0.14, 0.36, x + 0.14, 0.36), null],
      [r(x - 0.21, 0.74, x + 0.21, 0.82), "t:cuir"],
    ));
    o.push(
      [r(18.05, 0.5, 22.35, 1.12), "t:cuir"],
      [range(18.6, 22.3, 0.55).map((x) => ln(x, 0.56, x, 1.06)).join(""), "~"],
      [r(17.95, FL, 22.45, 0.4), "wood"],
      [r(17.95, 0.4, 22.45, 0.52), "t:cuir"],
    );
    [19.1, 21.25].forEach((cx) => o.push(
      [ln(cx, 4.3, cx, 2.56), null],
      [oct(cx, 2.42, 0.15, 0.15), "soft"],
      [ln(cx, 0.74, cx, FL + 0.02, cx - 0.24, FL + 0.02, cx + 0.24, FL + 0.02), null],
      [r(cx - 0.42, 0.74, cx + 0.42, 0.79), "wood"],
    ));
    o.push(
      [ln(19.95, FL, 19.95, 0.44, 20.41, FL, 20.41, 0.44), null],
      [r(19.92, 0.5, 20.44, 0.96), "t:chenille"],
      [r(19.88, 0.44, 20.48, 0.5), "t:chenille"],
      [r(14.3, 0, 22.7, FL), "floor"],
    );
    T.restaurant.push([14.62, 3.98, "RESTAURANT · BAR"]);
  };

  const spa = () => {
    const o = G.spa;
    const zb = -3.2 + FL;
    const wave = (z0, x0, x1) => pl(range(x0, x1 + 0.01, 0.2).map((x, i) => [x, z0 + (i % 2 ? 0.035 : -0.035)]), false);
    o.push(
      [r(0.3, -3.2, 8.7, -0.3), "wall"],
      [r(14.3, -3.2, 22.7, -0.3), "wall"],
      [pl([[1.4, -3.34], [7.2, -3.34], [7.2, -4.5], [1.4, -4.5]]), "water"],
      [wave(-3.37, 1.5, 7.1) + wave(-3.64, 2.2, 6.0) + wave(-3.92, 3.0, 5.2), "~"],
      [ln(6.9, -4.3, 6.9, -2.62, 6.9, -2.62, 7.45, -2.62, 7.45, -2.62, 7.45, zb, 6.9, -4.0, 7.2, -4.0, 6.9, -3.7, 7.2, -3.7), null],
      [r(0.3, -3.2, 1.4, zb), "floor"],
      [r(7.2, -3.2, 8.7, zb), "floor"],
      [ln(8.25, zb, 8.25, -0.95, 8.25, -0.95, 8.0, -0.95), null],
      [pl([[7.86, -0.95], [8.14, -0.95], [8.1, -1.05], [7.9, -1.05]]), "metal"],
      [r(14.3, -3.2, 22.7, zb), "floor"],
    );
    lounger(o, 14.8, zb, "t:microfibre");
    lounger(o, 16.95, zb, "t:microfibre");
    o.push(
      [r(19.7, zb, 22.5, -0.95), "wood"],
      [range(-2.9, -1.0, 0.2).map((z) => ln(19.7, z, 22.5, z)).join(""), "~"],
      [r(20.05, -3.02, 20.75, -1.15), "glass"],
      [ln(20.66, -2.2, 20.66, -1.95), null],
    );
    T.spa.push([0.62, -0.62, "SPA · PISCINE"], [14.62, -0.62, "SPA · SAUNA"]);
  };

  const terrasse = () => {
    const o = G.terrasse;
    const zb = 14.2 + FL;
    o.push([r(0.3, 14.2, 8.7, zb), "floor"], [r(14.3, 14.2, 22.7, zb), "floor"]);
    lounger(o, 0.8, zb, "t:outdoor");
    lounger(o, 3.0, zb, "t:outdoor");
    parasol(o, 6.5, zb);
    const chair = (x0, x1, bx, lean) => o.push(
      [ln(x0 + 0.05, zb, x0 + 0.05, zb + 0.44, x1 - 0.05, zb, x1 - 0.05, zb + 0.44, bx, zb + 0.44, bx + lean, zb + 0.96), null],
      [r(x0, zb + 0.44, x1, zb + 0.51), "t:outdoor"],
    );
    o.push([ln(17.2, zb, 17.2, zb + 0.72, 16.95, zb + 0.01, 17.45, zb + 0.01), null], [r(16.7, zb + 0.72, 17.7, zb + 0.77), "wood"]);
    chair(15.9, 16.42, 15.92, -0.08);
    chair(17.98, 18.5, 18.48, 0.08);
    parasol(o, 17.2, zb);
    o.push(
      [pl([[20.5, zb + 0.55], [20.55, zb + 0.95], [20.8, zb + 1.22], [21.15, zb + 1.42], [21.6, zb + 1.34], [21.95, zb + 1.12], [22.15, zb + 0.84], [22.2, zb + 0.55]]), "plant"],
      [ln(21.3, zb + 0.55, 21.1, zb + 1.2, 21.3, zb + 0.55, 21.7, zb + 1.15, 21.3, zb + 0.55, 21.35, zb + 1.38), "~"],
      [r(20.4, zb, 22.3, zb + 0.55), "wood"],
    );
    T.terrasse.push([0.62, 15.78, "TERRASSE · ROOFTOP"]);
  };

  const LEVELS = [[-3.2, -0.3], [0, 4.3], [4.6, 7.5], [7.8, 10.7], [11.0, 13.9], [14.2, 16.9]];
  const couloirs = () => {
    const o = G.couloirs;
    o.push([r(13.15, -4.4, 14.1, 16.9), "shaft"], [r(10.5, -3.2, 13.0, 16.9), "wall"]);
    LEVELS.forEach(([z, zc], i) => {
      o.push([r(8.9, z, 10.5, zc), "wall"]);
      if (i === 0) {
        o.push([r(9.05, z + FL, 10.4, z + 0.38), "wood"], [r(9.05, z + 0.38, 10.4, z + 0.5), "t:tweed"], [r(9.12, z + 0.5, 10.33, z + 0.86), "t:tweed"]);
      }
      if (i === 1) {
        o.push(
          [oct(9.72, 1.75, 0.46, 0.46), "glass"],
          [ln(9.12, FL, 9.12, 0.82, 10.33, FL, 10.33, 0.82), null],
          [r(9.05, 0.82, 10.4, 0.88), "wood"],
          [ln(10.12, 0.88, 10.12, 1.12), null],
          [pl([[10.0, 1.12], [10.24, 1.12], [10.2, 1.3], [10.04, 1.3]]), "soft"],
        );
      }
      if (i >= 2 && i <= 4) {
        o.push(
          [r(9.05, z + FL, 9.85, z + 2.1), "wood"],
          [r(9.15, z + 0.32, 9.75, z + 1.96), "~"],
          [ln(9.7, z + 1.0, 9.7, z + 1.14), null],
          [pl([[9.38, z + 2.3], [9.52, z + 2.3], [9.5, z + 2.48], [9.4, z + 2.48]]), "soft"],
          [r(9.98, z + FL + 0.02, 10.42, z + 2.6), "t:jacquard"],
          [ln(10.09, z + 0.2, 10.09, z + 2.56, 10.2, z + 0.2, 10.2, z + 2.56, 10.31, z + 0.2, 10.31, z + 2.56), "~"],
          [ln(9.94, z + 2.64, 10.46, z + 2.64), null],
        );
      }
      o.push([r(8.9, z, 10.5, z + FL), "floor"]);
    });
    [[-3.2, 0], [0, 4.6], [4.6, 7.8], [7.8, 11.0], [11.0, 14.2]].forEach(([z0, z1]) => {
      const zm = (z0 + z1) / 2;
      const n = Math.round((zm - z0) / 0.175);
      const rh = (zm - z0) / n;
      const t = 2.0 / n;
      const up = [[10.5, z0]];
      const back = [[12.5, zm]];
      for (let i = 0; i < n; i += 1) {
        up.push([10.5 + i * t, z0 + (i + 1) * rh], [10.5 + (i + 1) * t, z0 + (i + 1) * rh]);
        back.push([12.5 - i * t, zm + (i + 1) * rh], [12.5 - (i + 1) * t, zm + (i + 1) * rh]);
      }
      CUT.push(pl([...up, [13.0, zm], [13.0, zm - 0.24], [12.5, zm - 0.24], [10.5, z0 - 0.3]]));
      o.push([pl(back, false) + ln(12.5, zm - 0.2, 10.5, z1 - 0.2, 12.5, zm + 0.9, 10.5, z1 + 0.9), null]);
    });
    o.push(
      [ln(13.3, 10.1, 13.3, 16.6, 13.95, 10.1, 13.95, 16.6), null],
      [r(13.25, 7.86, 14.0, 10.1), "metal"],
      [ln(13.625, 7.9, 13.625, 10.04), "~"],
      [r(13.28, 16.6, 13.98, 16.86), "metal"],
    );
    T.couloirs.push([13.75, 12.3, "CIRCULATIONS", "middle", true]);
  };

  const structure = () => {
    CUT.push(pl([[0, -3.2], [1.4, -3.2], [1.4, -4.5], [7.2, -4.5], [7.2, -3.2], [13.15, -3.2], [13.15, -4.4], [14.1, -4.4], [14.1, -3.2], [23, -3.2], [23, -3.75], [14.4, -3.75], [14.4, -4.7], [12.85, -4.7], [12.85, -3.75], [7.5, -3.75], [7.5, -4.8], [1.1, -4.8], [1.1, -3.75], [0, -3.75]]));
    CUT.push(r(0, -3.75, 0.3, 0), r(22.7, -3.75, 23, 0), r(0, 3.6, 0.3, 14.7), r(22.7, 3.6, 23, 14.7));
    [0, 4.6, 7.8, 11.0, 14.2].forEach((z) => CUT.push(r(0, z - 0.3, 10.5, z), r(14.1, z - 0.3, 23, z)));
    CUT.push(r(4.4, 4.3, 4.6, 13.9), r(18.4, 4.3, 18.6, 13.9), r(13.0, -3.2, 13.15, 16.9), r(8.5, 16.9, 14.5, 17.2));
    const doors = [[-3.2, -1.1], [0, 3.0], [4.6, 6.7], [7.8, 9.9], [11.0, 13.1], [14.2, 16.3]];
    [[8.7, 8.9, doors], [14.1, 14.3, doors.map(([g0, g1], i) => [g0, i === 1 ? 2.1 : g1])]].forEach(([x0, x1, gaps]) => {
      let s = -3.2;
      gaps.forEach(([g0, g1]) => {
        if (g0 > s) CUT.push(r(x0, s, x1, g0));
        s = g1;
      });
      CUT.push(r(x0, s, x1, 16.9));
    });
    GZ.push(ln(0.09, 0, 0.09, 3.6, 0.21, 0, 0.21, 3.6, 0, 2.7, 0.3, 2.7, 22.79, 0, 22.79, 3.6, 22.91, 0, 22.91, 3.6, 22.7, 2.7, 23, 2.7));
    GZ.push(ln(0.15, 14.7, 0.15, 15.3, 0.02, 15.3, 0.4, 15.3, 22.85, 14.7, 22.85, 15.3, 22.6, 15.3, 22.98, 15.3));
  };

  const earth = () => {
    let s = "";
    const zone = (xa, xb, za, zb) => {
      const H = zb - za;
      for (let c = xa - H; c < xb; c += 0.42) {
        let x0 = c;
        let z0 = za;
        let x1 = c + H;
        let z1 = zb;
        if (x0 < xa) { z0 += xa - x0; x0 = xa; }
        if (x1 > xb) { z1 -= x1 - xb; x1 = xb; }
        if (x1 > x0) s += ln(x0, z0, x1, z1);
      }
    };
    zone(-0.9, 0, -4.1, 0);
    zone(23, 23.9, -4.1, 0);
    return `<path class="earth" d="${s}"/><path class="gl" d="${ln(-1.0, 0, 0, 0, 23, 0, 24.3, 0)}"/>`;
  };

  const LV = [["R+4", 14.2, "+14,20"], ["R+3", 11.0, "+11,00"], ["R+2", 7.8, "+7,80"], ["R+1", 4.6, "+4,60"], ["RDC", 0, "±0,00"], ["R-1", -3.2, "−3,20"]];
  const levels = () => LV.map(([n, z, a]) => `<path class="lvl" d="${ln(-5.6, z, -0.12, z)}"/><path class="lvm" d="${pl([[-1.46, z + 0.34], [-1.14, z + 0.34], [-1.3, z]])}"/><text class="lv" x="${X(-5.6)}" y="${Y(z + 0.14)}">${n}</text><text class="lz" x="${X(-1.65)}" y="${Y(z + 0.14)}" text-anchor="end">${a}</text>`).join("");

  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  let DEFS = "";
  const defs = () => {
    if (DEFS) return DEFS;
    const tile = (id, w, h, body) => `<pattern id="cp-${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}">${body}</pattern>`;
    const photo = Object.keys(PHOTOS).map((k) => tile(k, 44, 44, `<image href="${IMG(k)}" width="44" height="44" preserveAspectRatio="xMidYMid slice"/>`)).join("");
    const cols = ["#b9a58e", "#8c7a6b", "#d2c3ad", "#6f6a63", "#a8714c", "#4f4a45"];
    let chips = "";
    for (let i = 0; i < 40; i += 1) {
      const x = (rnd() * 30).toFixed(1);
      const y = (rnd() * 30).toFixed(1);
      const s = 0.4 + rnd() * 1.1;
      chips += `<rect x="${x}" y="${y}" width="${s.toFixed(1)}" height="${(s * 0.8).toFixed(1)}" fill="${cols[i % cols.length]}" transform="rotate(${Math.round(rnd() * 90)} ${x} ${y})"/>`;
    }
    DEFS = `<defs>${photo}`
      + tile("moquette", 4, 4, `<rect width="4" height="4" fill="#8f8172"/><rect width="1" height="1" fill="#a39584"/><rect x="2" y="2" width="1" height="1" fill="#7c6f61"/>`)
      + tile("runner", 6, 4, `<rect width="6" height="4" fill="#5e554d"/><rect width="1.2" height="4" fill="#8c7a6b"/>`)
      + tile("vinyle", 6, 20, `<rect width="6" height="20" fill="#dcd5c9"/><rect width="0.7" height="20" fill="#cfc7ba"/>`)
      + tile("lames", 9.6, 40, `<rect width="9.6" height="40" fill="#3e2f25"/><rect x="0.5" width="4.1" height="40" fill="#b38d66"/><rect x="5.3" width="4.1" height="40" fill="#a7805b"/>`)
      + tile("terrazzo", 30, 30, `<rect width="30" height="30" fill="#ebe5db"/>${chips}`)
      + tile("arches", 16, 22, `<rect width="16" height="22" fill="#dfe2d7"/><path d="M2 21v-10a6 6 0 0 1 12 0v10" fill="none" stroke="#97a28d" stroke-width="1"/>`)
      + tile("parquet", 14, 4, `<rect width="14" height="4" fill="#a77a52"/><rect width="0.7" height="4" fill="#6d4a30"/>`)
      + tile("gres", 6, 4, `<rect width="6" height="4" fill="#dcd6cc"/><rect width="0.6" height="4" fill="#b3ab9f"/>`)
      + tile("deck", 3.2, 4, `<rect width="3.2" height="4" fill="#8a7663"/><rect width="0.6" height="4" fill="#5b4b3e"/>`)
      + `<filter id="cp-fe" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 0.45 0 0 0 0 0.41 0 0 0 0 0.36 0 0 0 0.5 0"/></filter>`
      + tile("enduit", 200, 160, `<rect width="200" height="160" fill="#e6dfd4"/><rect width="200" height="160" filter="url(#cp-fe)"/>`)
      + `<linearGradient id="cp-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f4"/><stop offset="1" stop-color="#d4e0e3"/></linearGradient>`
      + `<linearGradient id="cp-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcdde2"/><stop offset="1" stop-color="#86b9c3"/></linearGradient></defs>`;
    return DEFS;
  };

  const fillOf = (m, th) => th[m] || (m.startsWith("t:") ? `url(#cp-${m.slice(2)})` : MAT[m]);
  const paint = (items, th) => items.map(([d, m, cls]) => {
    if (m === null) return `<path class="ln" d="${d}"/>`;
    if (m === "~") return `<path class="tx" d="${d}"/>`;
    const k = cls ? ` ${cls}` : "";
    return `<path class="b${k}" d="${d}"/><path class="c${k}" d="${d}" fill="${fillOf(m, th)}"/><path class="o" d="${d}"/>`;
  }).join("");
  const label = ([x, z, t, anchor, rot]) => (rot
    ? `<text class="rl" x="${X(x)}" y="${Y(z)}" text-anchor="middle" transform="rotate(-90 ${X(x)} ${Y(z)})">${t}</text>`
    : `<text class="rl" x="${X(x)}" y="${Y(z)}"${anchor ? ` text-anchor="${anchor}"` : ""}>${t}</text>`);

  structure();
  [4.6, 7.8, 11.0].forEach((z, f) => {
    bedroom(0.3, 4.4, z, 1, `${f + 1}01`);
    bedroom(4.6, 8.7, z, 1, `${f + 1}02`);
    bedroom(14.3, 18.4, z, -1, `${f + 1}03`);
    bedroom(18.6, 22.7, z, -1, `${f + 1}04`);
  });
  lobby();
  restaurant();
  spa();
  terrasse();
  couloirs();

  const group = (id, th = {}, on = false) => `<g class="sp${on ? " is-on" : ""}" data-space="${id}">${paint(G[id], { ...SPACES[id].th, ...th })}${T[id].map(label).join("")}</g>`;
  const GROUP = Object.fromEntries(ORDER.map((id) => [id, group(id)]));
  const CUTS = `<g>${CUT.map((d) => `<path class="cut" d="${d}"/>`).join("")}<path class="gz" d="${GZ.join("")}"/></g>`;
  const HITS = {
    terrasse: [[-0.2, 13.9, 8.7, 17.6], [14.3, 13.9, 23.2, 17.6]],
    chambres: [[-0.2, 4.3, 8.7, 13.9], [14.3, 4.3, 23.2, 13.9]],
    lobby: [[-0.2, -0.3, 8.7, 4.3]],
    restaurant: [[14.3, -0.3, 23.2, 4.3]],
    spa: [[-0.2, -5.0, 8.7, -0.3], [14.3, -5.0, 23.2, -0.3]],
    couloirs: [[8.7, -5.0, 14.3, 17.6]],
  };
  const full = () => defs() + earth()
    + ["spa", "lobby", "restaurant", "chambres", "couloirs", "terrasse"].map((id) => GROUP[id]).join("")
    + CUTS + levels()
    + Object.entries(HITS).map(([id, list]) => list.map((b) => `<path class="hit" data-space="${id}" d="${r(...b)}"/>`).join("")).join("");
  const viewBox = (id) => {
    const [x0, z0, x1, z1] = SPACES[id].box;
    return [X(x0), Y(z1), X(x1) - X(x0), Y(z0) - Y(z1)].map((v) => +v.toFixed(1)).join(" ");
  };
  const mini = (id) => `<svg class="coupe coupe-mini" viewBox="${viewBox(id)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${GROUP[id]}${CUTS}</svg>`;

  const inSpace = (data, u, id) => data.by[u].filter((p) => p.es.includes(id));
  const rank = (list, cats = [], gens = []) => list.slice().sort((a, b) => {
    const ca = cats.indexOf(a.cat);
    const cb = cats.indexOf(b.cat);
    const ra = ca < 0 ? 99 : ca;
    const rb = cb < 0 ? 99 : cb;
    if (ra !== rb) return ra - rb;
    const ga = gens.includes(a.gen) ? 0 : 1;
    const gb = gens.includes(b.gen) ? 0 : 1;
    if (ga !== gb) return ga - gb;
    if (!!a.n !== !!b.n) return a.n ? -1 : 1;
    return b.stock - a.stock;
  });
  const spread = (list, cats, n) => {
    const lanes = new Map();
    rank(list, cats).forEach((p) => {
      if (!lanes.has(p.cat)) lanes.set(p.cat, []);
      lanes.get(p.cat).push(p);
    });
    const ls = [...lanes.values()];
    const out = [];
    for (let i = 0; out.length < n && ls.some((l) => l.length > i); i += 1) {
      ls.forEach((l) => { if (l[i] && out.length < n) out.push(l[i]); });
    }
    return out;
  };
  const catsOf = (list, cats = []) => {
    const m = new Map();
    list.forEach((p) => {
      if (!m.has(p.cat)) m.set(p.cat, { k: p.cat, n: p.catName, count: 0 });
      m.get(p.cat).count += 1;
    });
    return [...m.values()].sort((a, b) => {
      const ia = cats.indexOf(a.k);
      const ib = cats.indexOf(b.k);
      const ra = ia < 0 ? 99 : ia;
      const rb = ib < 0 ? 99 : ib;
      return ra - rb || b.count - a.count;
    });
  };
  const topCi = (p) => p.c.reduce((b, c, i) => ((c.s || 0) > (p.c[b].s || 0) ? i : b), 0);
  const nearest = (list, hex) => {
    let best = null;
    let bd = Infinity;
    list.forEach((p) => p.c.forEach((c, ci) => {
      const d = D.dist(c.h, hex) - (c.s > 0 ? 4 : 0);
      if (d < bd) { bd = d; best = { p, ci }; }
    }));
    return best;
  };
  const words = (n) => (n ? `${D.nf.format(n)} ${n > 1 ? "références" : "référence"}` : "Aucune référence");
  const line = (p, ci, q) => ({ u: p.u, h: p.h, k: p.c[ci].k, q: Math.max(p.min || 1, Math.ceil(q)) });
  const put = (items) => {
    let fresh = 0;
    items.forEach((it) => {
      if (D.projet.has(it.u, it.h, it.k)) D.projet.set(it);
      else {
        D.projet.add(it);
        fresh += 1;
      }
    });
    return fresh;
  };
  const syncCount = () => {
    const n = D.projet.count();
    D.$$('[data-count="dchr-projet"]').forEach((el) => {
      el.textContent = n;
      el.dataset.n = n;
    });
  };
  addEventListener("storage", (e) => { if (e.key === "dchr-projet") syncCount(); });

  let toastT;
  const toast = (msg, href, linkLabel) => {
    let el = D.$("[data-toast]");
    if (!el) {
      document.body.insertAdjacentHTML("beforeend", '<div class="toast" data-toast role="status" aria-live="polite"></div>');
      el = D.$("[data-toast]");
    }
    el.innerHTML = `${D.esc(msg)}${href ? `<a href="${href}">${D.esc(linkLabel || "Voir")}</a>` : ""}`;
    el.classList.toggle("has-link", !!href);
    el.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("is-in"), href ? 5600 : 3600);
  };

  window.HOTEL = {
    PHOTOS, SPACES, ORDER, GEN_N, IMG, VW, VH, X, Y, r,
    defs, full, group, GROUP, CUTS, viewBox, mini,
    inSpace, rank, spread, catsOf, topCi, nearest, words, line, put, syncCount, toast,
  };
})();
