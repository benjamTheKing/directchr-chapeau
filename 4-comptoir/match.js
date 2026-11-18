(() => {
  const D = () => window.DCHR;
  const plain = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const MAT = {
    "effet cuir": [{ u: "textile", cat: "effet-cuir" }],
    velours: [{ u: "textile", cat: "velours" }, { u: "textile", ma: "velours" }, { u: "mobilier", ma: "velours" }],
    "chenillé": [{ u: "textile", cat: "chenilles" }],
    bouclette: [{ u: "textile", cat: "textures" }],
    "texturé": [{ u: "textile", cat: "textures" }],
    jacquard: [{ u: "textile", cat: "jacquards" }],
    occultant: [{ u: "textile", cat: "occultants" }],
    voilage: [{ u: "textile", cat: "voilages" }],
    tweed: [{ u: "textile", cat: "tweed" }],
    outdoor: [{ u: "textile", cat: "outdoor" }, { u: "mobilier", cat: "exterieur" }, { u: "sol", cat: "exterieur" }],
    microfibre: [{ u: "textile", cat: "microfibres" }],
    "imprimé": [{ u: "textile", cat: "imprimes" }],
    lin: [{ u: "textile", cat: "naturels" }, { ma: "lin" }],
    tissu: [{ u: "textile" }],
    "tissu mural": [{ u: "mural", cat: "tissus-muraux" }],
    moquette: [{ u: "sol", cat: "moquettes" }, { u: "sol", cat: "dalles-moquette" }],
    dalle: [{ u: "sol", cat: "dalles-moquette" }, { u: "sol", gen: "dalle" }],
    parquet: [{ u: "sol", cat: "parquets" }],
    LVT: [{ u: "sol", cat: "lvt" }],
    carrelage: [{ u: "sol", cat: "carrelages" }, { u: "sol", gen: "gres" }],
    terrazzo: [{ u: "sol", cat: "terrazzo" }],
    "grès": [{ u: "sol", gen: "gres" }],
    sol: [{ u: "sol" }],
    "papier peint": [{ u: "mural", cat: "papiers-peints" }],
    "revêtement mural": [{ u: "mural" }],
    "panneau acoustique": [{ u: "mural", cat: "acoustique" }],
    vinyle: [{ u: "mural", cat: "vinyles" }, { u: "sol", cat: "lvt" }],
    panneau: [{ u: "mural", cat: "acoustique" }, { u: "mural", cat: "lambris" }],
    acoustique: [{ u: "mural", cat: "acoustique" }],
    enduit: [{ u: "mural", cat: "enduits" }],
    lambris: [{ u: "mural", cat: "lambris" }],
    fauteuil: [{ u: "mobilier", cat: "fauteuils" }, { u: "mobilier", gen: "lounge" }],
    chaise: [{ u: "mobilier", gen: "chaise" }, { u: "mobilier", gen: "bistrot" }, { u: "mobilier", gen: "chaise-outdoor" }, { u: "mobilier", cat: "chaises" }],
    table: [{ u: "mobilier", cat: "tables" }, { u: "mobilier", gen: "table" }],
    "guéridon": [{ u: "mobilier", gen: "gueridon" }],
    "tête de lit": [{ u: "mobilier", gen: "tete-de-lit" }],
    lit: [{ u: "mobilier", gen: "lit" }, { u: "mobilier", gen: "tete-de-lit" }],
    chevet: [{ u: "mobilier", gen: "chevet" }],
    bureau: [{ u: "mobilier", gen: "bureau" }],
    "canapé": [{ u: "mobilier", gen: "canape" }, { u: "mobilier", cat: "canapes" }],
    banquette: [{ u: "mobilier", gen: "banquette" }],
    tabouret: [{ u: "mobilier", gen: "tabouret" }],
    transat: [{ u: "mobilier", gen: "transat" }],
    mobilier: [{ u: "mobilier" }],
    laine: [{ ma: "laine" }],
    bois: [{ ma: "bois" }],
    "bois massif": [{ ma: "bois" }],
    cuir: [{ ma: "cuir" }],
    "métal": [{ ma: "metal" }],
    pierre: [{ ma: "pierre" }],
  };

  const COL_FAM = {
    blanc: ["blanc"], "écru": ["blanc", "sable"], ivoire: ["blanc"], beige: ["sable", "blanc"], sable: ["sable"], "grège": ["taupe", "sable"],
    taupe: ["taupe"], gris: ["gris"], anthracite: ["noir"], noir: ["noir"], bleu: ["bleu"], vert: ["vert"], rouge: ["rouge"],
    bordeaux: ["rouge"], terracotta: ["terracotta"], orange: ["terracotta"], jaune: ["jaune"], brun: ["brun"], rose: ["rouge"],
  };

  const famCache = new Map();
  const famOf = (hex) => {
    if (!famCache.has(hex)) famCache.set(hex, D().familyOf(hex));
    return famCache.get(hex);
  };
  const hay = (p) => {
    if (!p._cm) p._cm = plain([p.t, p.catName, p.d, ...p.specs.map((s) => s[1]), ...p.ma, ...p.c.map((c) => c.n)].join(" "));
    return p._cm;
  };

  const ruleScore = (r, p) => {
    if (r.u && r.u !== p.u) return 0;
    if (r.cat && r.cat !== p.cat) return 0;
    if (r.gen && r.gen !== p.gen) return 0;
    if (r.ma && !p.ma.includes(r.ma)) return 0;
    return r.gen ? 60 : r.cat ? 50 : r.ma ? 25 : 6;
  };
  const matScore = (mat, p) => {
    const rules = MAT[mat.l] || (mat.u ? [{ u: mat.u }] : []);
    const best = Math.max(0, ...rules.map((r) => ruleScore(r, p)));
    if (best) return best;
    return mat.generic ? 0 : new RegExp(`\\b${plain(mat.l)}`).test(hay(p)) && (!mat.u || mat.u === p.u) ? 12 : 0;
  };

  const solRank = (s) => {
    const m = plain(s).match(/\b(a1|a2|b|c|d|e)fl(?:-s([12]))?/);
    return m ? { c: ["a1", "a2", "b", "c", "d", "e"].indexOf(m[1]), s: m[2] ? +m[2] : 1 } : null;
  };
  const murRank = (s) => {
    const m = plain(s).match(/\b(a1|a2|b|c|d)(?:-s([123]) ?,? ?d([012]))?(?![a-z0-9])/);
    return m ? { c: ["a1", "a2", "b", "c", "d"].indexOf(m[1]), s: m[2] ? +m[2] : 1, d: m[3] ? +m[3] : 0 } : null;
  };
  const normCheck = (n, p) => {
    const f = plain(p.feu);
    if (/^R\d+$/.test(n.l)) {
      const g = p.specs.find((s) => /glissance/i.test(s[0]));
      const m = g && String(g[1]).match(/R(\d+)/);
      if (!m) return "na";
      return +m[1] >= +n.l.slice(1) ? "ok" : "ko";
    }
    if (!f || f === "–" || f === "-") return "na";
    if (/fl-s1$/.test(n.l)) {
      const a = solRank(f);
      const b = solRank(n.l);
      if (!a || !b) return "na";
      return a.c <= b.c && a.s <= b.s ? "ok" : "ko";
    }
    if (p.u === "mural" && (n.l === "M1" || /^[A-D]2?-s\d,d\d$/.test(n.l))) {
      const a = murRank(f);
      const b = n.l === "M1" ? { c: 2, s: 3, d: 0 } : murRank(n.l);
      if (!a || !b) return "na";
      return a.c <= b.c && a.s <= b.s && a.d <= b.d ? "ok" : "ko";
    }
    if (n.l === "EN 1021") return /en ?1021/.test(f) ? "ok" : "ko";
    if (n.l === "EN 13773") return /en ?13773/.test(f) ? "ok" : "ko";
    return new RegExp(`\\b${plain(n.l)}\\b`).test(f) ? "ok" : "ko";
  };

  const maxDays = (s) => {
    const t = plain(s);
    let m = t.match(/(\d+) a (\d+) semaines/);
    if (m) return +m[2] * 7;
    if ((m = t.match(/(\d+) semaines?/))) return +m[1] * 7;
    if ((m = t.match(/(\d+) jours? ouvres?/))) return Math.ceil((+m[1] * 7) / 5);
    if ((m = t.match(/(\d+) jours?/))) return +m[1];
    return null;
  };
  const leadOf = (p, k) => {
    if (p.u === "mobilier") return k === "ok" ? { t: "Départ du stock", max: null } : { t: p.dl, max: maxDays(p.dl) };
    if (k === "order" && p.u === "textile") return { t: "Délai usine à confirmer", max: null };
    return { t: p.dl || "", max: maxDays(p.dl) };
  };

  const evaluate = (p, need, fams, norms, today) => {
    const DC = D();
    const q = need.qty;
    const qn = q && (!q.unit || q.unit === p.unit) ? q.n : null;
    const target = qn != null ? qn : p.min || 1;
    const cand = p.c.map((c, i) => ({ c, i, inF: fams ? fams.includes(famOf(c.h)) : false, d: need.color ? DC.dist(need.color.c, c.h) : 0 }));
    const inFam = cand.filter((x) => x.inF);
    const pool = inFam.length ? inFam : cand;
    const enough = pool.filter((x) => x.c.s > 0 && x.c.s >= target);
    const best = enough.length
      ? [...enough].sort((a, b) => (need.color ? a.d - b.d : 0) || b.c.s - a.c.s)[0]
      : [...pool].sort((a, b) => b.c.s - a.c.s || a.d - b.d)[0];
    const s = best ? best.c.s : 0;
    let st;
    if (p.u === "mobilier") st = s > 0 && s >= target ? { k: "ok", l: "En stock" } : { k: "order", l: p.dl || "Fabrication 6 à 8 semaines" };
    else if (s > 0 && s >= target) st = { k: "ok", l: qn != null ? "Disponible en un seul coloris" : "En stock" };
    else if (s > 0) st = { k: "part", l: `Partiel : ${DC.qty(s, p.unit)} en stock` };
    else st = { k: "order", l: "Sur commande" };
    const checks = norms.filter((n) => n.u.includes(p.u)).map((n) => ({ l: n.l, r: normCheck(n, p) }));
    const normState = !checks.length ? null : checks.some((x) => x.r === "ko") ? "ko" : checks.some((x) => x.r === "na") ? "na" : "ok";
    const lead = leadOf(p, st.k);
    const dueDays = need.due ? Math.round((need.due.date - today) / 864e5) : null;
    const late = dueDays != null && lead.max != null ? lead.max > dueDays : null;
    return {
      p, ci: best ? best.i : 0, c: best ? best.c : p.c[0], s, st, qn, target,
      inColor: !!(fams && best && best.inF), alt: Math.max(0, enough.length - 1), norm: normState, checks, lead, late, score: 0,
    };
  };

  const run = (need, data, opts = {}) => {
    const DC = D();
    const U = DC.U_ORDER;
    const counts = { all: 0 };
    U.forEach((u) => { counts[u] = 0; });
    const out = { mode: "empty", list: [], counts, notes: [], scope: U.slice(), relaxed: {} };
    if (!need || need.empty || !data) return out;
    const today = opts.today || new Date(new Date().setHours(0, 0, 0, 0));
    const q = need.qty;
    out.scope = need.u ? [need.u] : q && q.unit && q.src !== "bare" ? U.filter((u) => DC.UNIVERS[u].unit === q.unit) : U.slice();
    let pool = data.all.filter((p) => out.scope.includes(p.u));
    const terms = need.rest ? need.rest.split(" ").filter(Boolean) : [];
    const structured = !!(need.mat || need.color || need.norms.length || need.u);

    if (!structured && !terms.length) {
      out.mode = "vague";
      return out;
    }

    let fams = null;
    const norms = need.norms.filter((n) => n !== need.badNorm);
    const ms = new Map();
    let text = null;

    if (structured) {
      out.mode = "need";
      if (need.mat) {
        const hit = pool.filter((p) => {
          const v = matScore(need.mat, p);
          if (v) ms.set(p, v);
          return v > 0;
        });
        if (hit.length) pool = hit;
        else {
          out.notes.push(`Aucun produit « ${need.mat.l} » dans ${need.u ? `le ${DC.UNIVERS[need.u].n.toLowerCase()}` : "le catalogue"} : la recherche est élargie.`);
          out.relaxed.mat = true;
        }
      }
      need.mats.forEach((m) => {
        const hit = pool.filter((p) => matScore(m, p) > 0);
        if (hit.length) {
          pool = hit;
          hit.forEach((p) => ms.set(p, (ms.get(p) || 0) + 12));
        } else out.notes.push(`Aucun produit en ${m.l} dans cette sélection : la matière n'est pas retenue.`);
      });
      if (need.color) {
        fams = COL_FAM[need.color.n] || [DC.familyOf(need.color.c)];
        const hit = pool.filter((p) => p.c.some((c) => fams.includes(famOf(c.h))));
        if (hit.length) pool = hit;
        else {
          out.notes.push(out.scope.length === 1 && out.scope[0] === "mobilier" ? `Aucune finition ${need.color.n} : sur le mobilier, la couleur du garnissage se choisit dans le textile.` : `Aucun coloris ${need.color.n} dans cette sélection : toutes les couleurs sont proposées.`);
          out.relaxed.color = true;
          fams = null;
        }
      }
      if (terms.length) {
        const byTitle = pool.filter((p) => terms.some((t) => plain(p.t).includes(t)));
        if (byTitle.length) {
          pool = byTitle;
          text = "title";
        }
      }
    } else {
      out.mode = "text";
      const found = DC.search(data, terms.join(" "));
      const rank = new Map(found.map((p, i) => [p, i]));
      pool = found.filter((p) => out.scope.includes(p.u));
      pool.forEach((p) => ms.set(p, Math.max(1, 60 - rank.get(p))));
    }

    let list = pool.map((p) => evaluate(p, need, fams, norms, today));
    if (norms.length) {
      const keep = list.filter((x) => x.norm !== "ko");
      const dropped = list.length - keep.length;
      if (keep.length) {
        list = keep;
        if (dropped) out.notes.push(`${dropped} produit${dropped > 1 ? "s" : ""} écarté${dropped > 1 ? "s" : ""} : classement ${norms.map((n) => n.l).join(", ")} non atteint.`);
      } else {
        out.notes.push(`Aucun produit n'affiche ${norms.map((n) => n.l).join(", ")} : les résultats sont donnés sans ce critère.`);
        out.relaxed.norm = true;
      }
      if (list.length && list.every((x) => x.norm === "na")) out.notes.push(`Classement ${norms.map((n) => n.l).join(", ")} non indiqué sur ces produits : à confirmer avec l'usine à la commande.`);
    }

    list.forEach((x) => {
      const p = x.p;
      let sc = ms.get(p) || 0;
      if (x.inColor) sc += 25 - Math.min(15, (need.color ? DC.dist(need.color.c, x.c.h) : 0) / 4);
      if (x.norm === "ok") sc += 15;
      if (x.st.k === "ok") sc += 30;
      else if (x.st.k === "part") sc += Math.min(12, (12 * x.s) / Math.max(1, x.target));
      if (terms.length && text !== "title") sc += terms.filter((t) => hay(p).includes(t)).length * 8;
      if (terms.length && terms.some((t) => plain(p.t).includes(t))) sc += 20;
      if (x.late === false) sc += 4;
      sc += Math.log10(x.s + 1) * 1.5;
      x.score = Math.round(sc * 10) / 10;
    });

    out.list = sortBy(list, "pertinence");
    out.list.forEach((x) => {
      counts.all += 1;
      counts[x.p.u] += 1;
    });
    return out;
  };

  const leadKey = (x) => (x.lead.max != null ? x.lead.max : x.st.k === "order" ? 900 : 0);
  const sortBy = (list, key) => {
    const l = [...list];
    if (key === "stock") return l.sort((a, b) => b.s - a.s || b.score - a.score);
    if (key === "delai") return l.sort((a, b) => leadKey(a) - leadKey(b) || b.score - a.score);
    return l.sort((a, b) => b.score - a.score || b.s - a.s);
  };

  window.COMPTOIR_MATCH = Object.assign(run, { sortBy, evaluate, normCheck, matScore, MAT, COL_FAM, famOf });
})();
