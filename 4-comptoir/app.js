(() => {
  const DC = window.DCHR;
  const P = window.COMPTOIR_PARSE;
  const M = window.COMPTOIR_MATCH;
  const { $, $$, esc, U_ORDER } = DC;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent;
  const isMac = /mac|iphone|ipad|ipod/i.test(platform);
  const MOD = isMac ? "⌘" : "Ctrl";
  const { fmt, NB, pad, TODAY, fmtDate, UNIVERS } = P;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = (n, one, many) => (n > 1 ? many : one);
  const de = (t) => (/^[aeiouyàâäéèêëîïôöûü]/i.test(t) ? `d'${t}` : `de ${t}`);
  const unitLong = (u) => (u === "ml" ? "mètres linéaires" : u === "m²" ? "mètres carrés" : "unités");

  $$("[data-mod]").forEach((k) => { k.textContent = MOD; });
  const cmdk = $("[data-cmdk]");
  if (cmdk) cmdk.setAttribute("aria-label", `Aller au comptoir (${MOD} K)`);

  const toastEl = $("[data-toast]");
  let toastT;
  const toast = (msg, link) => {
    toastEl.innerHTML = `<span>${esc(msg)}</span>${link ? `<a href="${esc(link.href)}">${esc(link.l)}</a>` : ""}`;
    toastEl.classList.toggle("has-link", !!link);
    toastEl.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-in"), link ? 5200 : 3600);
  };
  const PROJET_LINK = { href: "../projet/", l: "Voir le projet" };

  const hdrCount = () => {
    const n = DC.projet.count();
    $$('[data-count="dchr-projet"]').forEach((el) => {
      el.textContent = n;
      el.dataset.n = n;
    });
  };
  hdrCount();

  let data = null;
  const famName = (hex) => {
    const k = M.famOf(hex);
    const f = DC.COLOR_FAMILIES.find((x) => x.k === k);
    return f ? f.n : "";
  };
  const colorName = (p, c) => (p.u === "textile" ? famName(c.h) : c.n);
  const bestCi = (p, q) => {
    let best = 0;
    p.c.forEach((c, i) => {
      const b = p.c[best];
      const okC = q != null && c.s >= q;
      const okB = q != null && b.s >= q;
      if ((okC && !okB) || (okC === okB && c.s > b.s)) best = i;
    });
    return best;
  };

  const input = $("[data-cmd]");
  const form = $("[data-cmd-form]");
  const tokensEl = $("[data-tokens]");
  const hintEl = $("[data-hint]");
  const clearBtn = $("[data-cmd-clear]");
  const exBtns = $$("[data-ex]");
  const besoin = $("[data-besoin]");
  const visual = $("[data-b-visual]");
  const vVis = $("[data-b-vis]");
  const vLabel = $("[data-b-vlabel]");
  const vColor = $("[data-b-vcolor]");
  const stText = $("[data-st-text]");
  const stSub = $("[data-st-sub]");
  const stWarn = $("[data-st-warn]");
  const stTop = $("[data-b-top]");
  const stActions = $("[data-st-actions]");
  const meterBars = $$("[data-meter] i");
  const meterN = $("[data-meter-n]");
  $("[data-b-ref]").textContent = `BB-${String(TODAY.getFullYear()).slice(2)}${pad(TODAY.getMonth() + 1)}${pad(TODAY.getDate())}-01`;
  const resultsUrl = (v) => `recherche/?q=${encodeURIComponent(v.trim())}`;

  let prevTok = new Set();
  const renderTokens = (p) => {
    const list = P.chips(p);
    if (!list.length) {
      tokensEl.innerHTML = `<span class="empty">${p.empty ? "Quantité, matière, couleur, norme, échéance : repérées pendant la frappe." : "Rien de reconnu pour l'instant."}</span>`;
      prevTok = new Set();
      return;
    }
    const next = new Set();
    tokensEl.innerHTML = list.map((x) => {
      const sig = `${x.k}|${x.v}`;
      next.add(sig);
      const cls = ["tok", x.u ? "tok-u" : "", x.warn ? "is-warn" : "", prevTok.has(sig) ? "" : "pop"].filter(Boolean).join(" ");
      const style = x.u ? ` style="--u: var(--u-${x.u})"` : x.sw ? ` style="--c: ${x.sw}"` : "";
      const lead = x.u ? `<span class="d"></span>` : x.sw ? `<span class="sw"></span>` : "";
      return `<span class="${cls}"${style}><b>${x.b}</b>${lead}${esc(x.v)}${x.em ? ` <em>${x.em}</em>` : ""}</span>`;
    }).join("");
    prevTok = next;
  };

  const flash = (el) => {
    if (reduce || !el.animate) return;
    el.animate([{ backgroundColor: "rgba(216, 201, 181, 0.55)" }, { backgroundColor: "rgba(216, 201, 181, 0)" }], { duration: 900, easing: "ease-out" });
  };
  const setRow = (key, html, sub, warn) => {
    const row = $(`[data-f="${key}"]`, besoin);
    const sig = `${html || ""}|${sub || ""}|${warn ? 1 : 0}`;
    if (row.dataset.sig === sig) return;
    const changed = (row.dataset.v || "") !== (html || "");
    row.dataset.sig = sig;
    row.dataset.v = html || "";
    $(".v", row).innerHTML = html || "—";
    $(".s", row).textContent = sub || "";
    row.classList.toggle("is-empty", !html);
    row.classList.toggle("is-warn", !!warn);
    if (html && changed) flash(row);
  };

  const matRule = (mat) => (M.MAT[mat.l] || []).find((r) => r.cat && (!mat.u || r.u === mat.u));
  const matSub = (mat) => {
    if (mat.generic) return "famille à préciser";
    if (!mat.u) return "dans les quatre univers";
    const r = matRule(mat);
    const c = r && data ? data.stats[r.u].cats.find((x) => x.k === r.cat) : null;
    return c ? `${c.n} · ${fmt(c.count)} ${plural(c.count, "produit", "produits")}` : "";
  };
  const catLink = (p, r) => {
    const rule = p.mat ? matRule(p.mat) : null;
    if (rule && (!p.u || rule.u === p.u)) {
      const c = data.stats[rule.u].cats.find((x) => x.k === rule.cat);
      if (c) return `<a class="link-arrow" href="../${rule.u}/?cat=${encodeURIComponent(rule.cat)}">${esc(c.n)}<svg><use href="#i-arrow"/></svg></a>`;
    }
    const u = p.u || (r.scope.length === 1 ? r.scope[0] : null);
    return u ? `<a class="link-arrow" href="../${u}/">Catalogue ${DC.UNIVERS[u].n.toLowerCase()}<svg><use href="#i-arrow"/></svg></a>` : "";
  };

  let lastVisual = "";
  let lastStatus = "";
  let lastTop = "";
  let topList = [];
  const topHtml = (list) => list.map((x, i) => {
    const url = DC.productUrl(x.p, x.ci);
    const q = x.qn != null ? Math.max(x.qn, x.p.min || 1) : x.p.min || 1;
    return `<li style="--u: var(--u-${x.p.u})">
      <a class="bt-th" href="${url}" tabindex="-1" aria-hidden="true">${DC.visual(x.p, x.ci)}</a>
      <div class="bt-id">
        <a class="bt-t" href="${url}">${esc(x.p.t)}</a>
        <span class="bt-m"><span class="u-dot"></span>${DC.UNIVERS[x.p.u].n} · ${esc(x.c.k)} ${esc(colorName(x.p, x.c))} · ${DC.qty(x.s, x.p.unit)}</span>
        <span class="badge b-${x.st.k}">${esc(x.st.l)}</span>
      </div>
      <button class="bt-add" type="button" data-top-add="${i}" aria-label="Ajouter ${esc(DC.qty(q, x.p.unit))} ${esc(de(x.p.t))}, coloris ${esc(x.c.k)}, au projet" title="Ajouter au projet"><svg class="ico"><use href="#i-plus"/></svg></button>
    </li>`;
  }).join("");

  const renderBon = (p) => {
    const U = p.u ? UNIVERS[p.u] : null;
    const r = data && !p.empty ? M(p, data) : null;
    const top = r && r.list.length ? r.list[0] : null;
    const mats = [p.mat, ...p.mats].filter(Boolean);

    $("[data-b-title]").textContent = p.mat ? cap(`${mats.map((m) => m.l).join(" · ")}${p.color ? ` · ${p.color.n}` : ""}`) : U ? `Besoin ${U.n.toLowerCase()}` : p.empty ? "Nouveau besoin" : "Besoin à préciser";
    const state = $("[data-b-state]");
    const ready = !!(U && p.qty && p.mat);
    state.textContent = p.empty ? "Vide" : ready ? "Prêt" : "Brouillon";
    state.className = `tag${ready ? " is-live" : ""}`;

    setRow("univers", U ? `<i class="u-dot" style="--u: var(--u-${p.u})"></i>${U.n}` : "", U ? `/${p.u} · ${p.why}` : p.mat && !p.mat.u ? "les quatre univers" : "");
    setRow("unite", U ? U.unit : p.qty && p.qty.unit ? p.qty.unit : "", U ? U.sell : p.qty && p.qty.unit ? "univers à préciser" : "");
    const qSub = !p.qty ? "" : p.qty.inferred ? "unité déduite" : p.warnQty ? `attendu en ${U.unit}` : p.short ? "sous le minimum de coupe" : p.qty.src === "noun" ? "compté à l'unité" : "";
    setRow("qty", p.qty ? esc(P.qtyText(p.qty)) : "", qSub, p.warnQty || p.short);
    setRow("matiere", mats.length ? esc(mats.map((m) => m.l).join(" · ")) : "", p.mat ? matSub(p.mat) : "");
    setRow("couleur", p.color ? `<i class="sw" style="--c: ${p.color.c}"></i>${p.color.n}` : "", "");
    setRow("norme", p.norms.map((x) => x.l).join(" · "), p.norms.map((x) => x.d).join(" · "), !!p.badNorm);
    setRow("echeance", p.due ? fmtDate(p.due.date) : "", p.due ? p.due.s : "", p.due && p.due.warn);

    const filled = [p.qty, p.mat, p.color, p.norms.length, p.due, p.u].filter(Boolean).length;
    meterBars.forEach((b, i) => b.classList.toggle("on", i < filled));
    meterN.textContent = `${filled}/6 reconnus`;

    const vKey = top ? `${top.p.u}/${top.p.h}/${top.ci}` : `${p.u}|${p.empty}`;
    if (vKey !== lastVisual) {
      lastVisual = vKey;
      visual.style.setProperty("--u", p.u ? `var(--u-${p.u})` : top ? `var(--u-${top.p.u})` : "var(--ink-3)");
      visual.classList.toggle("has-vis", !!top);
      vVis.innerHTML = top ? DC.visual(top.p, top.ci) : "";
    }
    vLabel.textContent = top
      ? `${DC.UNIVERS[top.p.u].n} · ${top.p.t} · ${top.c.k} ${colorName(top.p, top.c)}`
      : U ? `Direct ${U.n} · /${p.u}` : p.empty ? "En attente de saisie" : "Univers à préciser";
    vColor.hidden = !p.color;
    if (p.color) {
      $("i", vColor).style.setProperty("--c", p.color.c);
      $("span", vColor).textContent = p.color.n;
    }

    let dot = `<span class="st-dot"></span>`;
    let text = "Tapez un besoin ou choisissez un exemple.";
    let sub = "";
    let actions = "";
    topList = [];
    if (!p.empty && !data) {
      text = "Lecture du stock…";
    } else if (!p.empty && r.mode === "vague") {
      text = "Univers à préciser";
      sub = "Ajoutez une matière : velours, vinyle, moquette, fauteuil…";
    } else if (!p.empty && !r.counts.all) {
      text = "Aucun produit ne correspond pour l'instant";
      sub = "Élargissez la ligne ou cherchez dans tout le catalogue.";
      actions = `<a class="link-arrow" href="../recherche/?q=${encodeURIComponent(p.raw.trim())}">Chercher dans tout le catalogue<svg><use href="#i-arrow"/></svg></a>`;
    } else if (!p.empty) {
      const n = r.counts.all;
      const ok = r.list.filter((x) => x.st.k === "ok").length;
      const us = U_ORDER.filter((u) => r.counts[u]);
      dot = `<span class="live-dot"></span>`;
      text = `${fmt(n)} ${plural(n, "produit trouvé", "produits trouvés")} ${us.length === 1 ? `en ${DC.UNIVERS[us[0]].n.toLowerCase()}` : `dans ${us.length} univers`}`;
      sub = `${fmt(ok)} ${p.qty && !(us.length === 1 && us[0] === "mobilier") ? `${plural(ok, "disponible", "disponibles")} en un seul coloris` : "en stock"}${U ? ` · vendu ${U.sell}` : ""}`;
      topList = r.list.slice(0, 3);
      actions = `<a class="btn btn-sm" href="${esc(resultsUrl(p.raw))}">${n > 1 ? `Voir les ${fmt(n)} résultats` : "Voir le résultat"}<svg><use href="#i-arrow"/></svg></a>${catLink(p, r)}`;
    }
    const tKey = topList.map((x) => `${x.p.u}/${x.p.h}/${x.ci}/${x.st.l}/${x.qn}`).join("|");
    if (tKey !== lastTop) {
      lastTop = tKey;
      stTop.innerHTML = topHtml(topList);
      stTop.hidden = !topList.length;
    }
    const sKey = `${dot}|${text}|${sub}|${actions}`;
    if (sKey !== lastStatus) {
      lastStatus = sKey;
      $("[data-st-dot]", besoin).outerHTML = dot.replace("<span ", "<span data-st-dot ");
      stText.textContent = text;
      stSub.textContent = sub;
      stActions.innerHTML = actions;
    }
    stWarn.hidden = !p.short;
    if (p.short) stWarn.innerHTML = `<svg class="ico"><use href="#i-info"/></svg>Coupe à partir de 3${NB}ml`;
  };

  let programmatic = false;
  let justSelected = false;
  const update = () => {
    const p = P(input.value);
    renderTokens(p);
    hintEl.hidden = !p.hint;
    if (p.hint) hintEl.innerHTML = `<svg class="ico"><use href="#i-info"/></svg><span>${esc(p.hint)}</span>`;
    renderBon(p);
    clearBtn.hidden = !input.value;
    const v = input.value.trim().toLowerCase();
    exBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.textContent.trim().toLowerCase() === v)));
  };

  stTop.addEventListener("click", (e) => {
    const b = e.target.closest("[data-top-add]");
    if (!b) return;
    const x = topList[+b.dataset.topAdd];
    if (!x) return;
    const q = x.qn != null ? Math.max(x.qn, x.p.min || 1) : x.p.min || 1;
    DC.projet.add({ u: x.p.u, h: x.p.h, k: x.c.k, q });
    b.classList.add("is-done");
    $("use", b).setAttribute("href", "#i-check");
    setTimeout(() => {
      b.classList.remove("is-done");
      $("use", b).setAttribute("href", "#i-plus");
    }, 1600);
    toast(`${DC.qty(q, x.p.unit)} ${de(x.p.t)}, coloris ${x.c.k}, ajoutés au projet.`, PROJET_LINK);
  });

  const DEMO_KEY = "dchr-comptoir-demo";
  const pickDemo = () => {
    const n = P.EXAMPLES.length;
    let i;
    try {
      const prev = localStorage.getItem(DEMO_KEY);
      i = prev === null ? 1 + Math.floor(Math.random() * (n - 1)) : (+prev + 1) % n;
      localStorage.setItem(DEMO_KEY, String(i));
    } catch {
      i = 1 + Math.floor(Math.random() * (n - 1));
    }
    const ex = P.EXAMPLES[i] || P.EXAMPLES[1];
    return `${ex.q} ${ex.due}`;
  };
  const DEMO = pickDemo();
  let demoT = null;
  const stopDemo = () => {
    if (demoT === null) return;
    clearTimeout(demoT);
    demoT = null;
    input.value = DEMO;
    programmatic = true;
    update();
  };
  const setValue = (v) => {
    if (demoT !== null) {
      clearTimeout(demoT);
      demoT = null;
    }
    input.value = v;
    programmatic = true;
    update();
  };

  input.addEventListener("input", () => {
    if (demoT !== null) {
      clearTimeout(demoT);
      demoT = null;
    }
    programmatic = false;
    justSelected = false;
    update();
  });
  input.addEventListener("pointerdown", stopDemo);
  input.addEventListener("focus", () => {
    stopDemo();
    if (!programmatic) return;
    input.select();
    justSelected = true;
  });
  input.addEventListener("mouseup", (e) => {
    if (!justSelected) return;
    e.preventDefault();
    justSelected = false;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (input.value) {
      setValue("");
      programmatic = false;
    } else {
      input.blur();
    }
  });
  clearBtn.addEventListener("click", () => {
    setValue("");
    programmatic = false;
    input.focus();
  });
  exBtns.forEach((b) => {
    const p = P(b.textContent);
    if (p.u) b.style.setProperty("--u", `var(--u-${p.u})`);
    b.addEventListener("click", () => setValue(b.textContent.trim()));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    stopDemo();
    const v = input.value.trim();
    if (!v) {
      input.focus();
      return;
    }
    location.href = resultsUrl(v);
  });

  const focusCmd = () => {
    stopDemo();
    $("#comptoir").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    input.focus({ preventScroll: true });
    input.select();
  };

  const top = $("[data-cmd-top]");
  top.addEventListener("submit", (e) => {
    e.preventDefault();
    const field = $("input", top);
    const v = field.value.trim();
    if (v) {
      setValue(v);
      programmatic = false;
      field.value = "";
    }
    focusCmd();
  });
  cmdk.addEventListener("click", focusCmd);
  $$("[data-focus-cmd]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    focusCmd();
  }));

  if (reduce) {
    setValue(DEMO);
  } else {
    update();
    let i = 0;
    const tick = () => {
      i += 1;
      input.value = DEMO.slice(0, i);
      programmatic = true;
      update();
      demoT = i < DEMO.length ? setTimeout(tick, DEMO[i] === " " ? 70 : 34 + Math.random() * 38) : null;
    };
    demoT = setTimeout(tick, 650);
  }

  const kpiBox = $("[data-kpis]");
  const stGrid = $("[data-st-grid]");
  const seen = new Set();
  let catSort = "cat";
  let catRows = null;
  let io = null;
  const buildCats = () => {
    catRows = {};
    U_ORDER.forEach((u) => {
      catRows[u] = data.stats[u].cats.map((c) => {
        const list = data.by[u].filter((p) => p.cat === c.k);
        const top = [...list].sort((a, b) => b.stock - a.stock)[0] || null;
        return { ...c, stock: list.reduce((a, p) => a + p.stock, 0), top, ci: top ? bestCi(top, null) : 0 };
      });
    });
  };
  const sortCats = (rows) => (catSort === "stock" ? [...rows].sort((a, b) => b.stock - a.stock)
    : catSort === "n" ? [...rows].sort((a, b) => a.n.localeCompare(b.n, "fr"))
    : rows);
  const renderKpis = () => {
    kpiBox.innerHTML = U_ORDER.map((u) => {
      const s = data.stats[u];
      const U = DC.UNIVERS[u];
      const stock = Math.round(s.stock);
      return `<div class="kpi kpi-u" style="--u: var(--u-${u})">
        <a class="kpi-h" href="../${u}/"><i></i>${U.n}<small>/${u}</small></a>
        <span class="v"><span data-count="${stock}">${fmt(stock)}</span><small>${U.unit}</small></span>
        <span class="l">en stock</span>
        <span class="kpi-sub">${fmt(s.products)} produits · ${fmt(s.colors)} ${u === "mobilier" ? "finitions" : "coloris"}</span>
      </div>`;
    }).join("");
    const products = U_ORDER.reduce((a, u) => a + data.stats[u].products, 0);
    const cats = U_ORDER.reduce((a, u) => a + data.stats[u].cats.length, 0);
    $("[data-stock-status]").textContent = `${fmt(products)} produits · stock par coloris`;
    $("[data-cat-title]").textContent = `${fmt(cats)} catégories · 4 univers`;
  };
  const renderTables = () => {
    stGrid.innerHTML = U_ORDER.map((u) => {
      const U = DC.UNIVERS[u];
      const rows = sortCats(catRows[u]);
      const max = Math.max(1, ...rows.map((r) => r.stock));
      const s = data.stats[u];
      return `<div class="st-card" style="--u: var(--u-${u})">
        <div class="st-head"><h4><i></i>${U.n}<small>/${u} · ${U.unitLong}</small></h4><a class="link-arrow" href="../${u}/">Tout le ${U.n.toLowerCase()}<svg><use href="#i-arrow"/></svg></a></div>
        <div class="fam-wrap"><table class="fam" data-fam="${u}">
          <caption class="vh">${U.n} : nombre de produits et stock par catégorie</caption>
          <thead><tr><th scope="col">Catégorie</th><th scope="col" class="c-ex">Le mieux fourni</th><th scope="col" class="c-n">Produits</th><th scope="col" class="c-bar"><span>Stock</span></th><th scope="col" class="c-pc">${U.unit}</th><th scope="col" class="c-go"><span class="vh">Ouvrir</span></th></tr></thead>
          <tbody data-fam-body>${rows.map((r, i) => {
            const href = `../${u}/?cat=${encodeURIComponent(r.k)}`;
            return `<tr>
              <th scope="row"><a class="fam-name" href="${href}"><span class="fam-vis">${r.top ? DC.visual(r.top, r.ci) : ""}</span><span>${esc(r.n)}</span></a></th>
              <td class="c-ex">${r.top ? esc(r.top.t) : ""}</td>
              <td class="c-n">${fmt(r.count)}</td>
              <td class="c-bar"><span class="bar"><i style="--w: ${(r.stock / max).toFixed(3)}; --d: ${i * 45}ms"></i></span></td>
              <td class="c-pc">${fmt(Math.round(r.stock))}</td>
              <td class="c-go"><a class="go" href="${href}" tabindex="-1" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></a></td>
            </tr>`;
          }).join("")}</tbody>
          <tbody class="fam-total"><tr><th scope="row">Total ${U.n.toLowerCase()}</th><td class="c-ex">${rows.length} catégories</td><td class="c-n">${fmt(s.products)}</td><td class="c-bar"></td><td class="c-pc">${fmt(Math.round(s.stock))}</td><td class="c-go"></td></tr></tbody>
        </table></div>
      </div>`;
    }).join("");
    $$("[data-fam]", stGrid).forEach((t) => {
      if (seen.has(t.dataset.fam) || !io) {
        if (reduce || !io) t.classList.add("is-in");
        else requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("is-in")));
      } else io.observe(t);
    });
  };
  $$("[data-sort]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-sort]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    catSort = b.dataset.sort;
    if (catRows) renderTables();
  }));

  const countUp = () => {
    $$("[data-count]", kpiBox).forEach((el) => {
      const to = +el.dataset.count;
      const t0 = performance.now();
      const dur = 1500;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  const buildStock = () => {
    buildCats();
    renderKpis();
    if (!reduce && "IntersectionObserver" in window) {
      $$("[data-count]", kpiBox).forEach((el) => { el.textContent = "0"; });
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          if (en.target === kpiBox) countUp();
          else {
            seen.add(en.target.dataset.fam);
            en.target.classList.add("is-in");
          }
        });
      }, { threshold: 0.25 });
      io.observe(kpiBox);
    }
    renderTables();
  };

  const tabs = $$('[role="tab"]');
  const openTab = (id, scroll) => {
    const tab = tabs.find((t) => t.dataset.tab === id);
    if (!tab) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      const was = !panel.hidden;
      panel.hidden = !on;
      if (on && !was) {
        panel.classList.remove("is-in");
        void panel.offsetWidth;
        panel.classList.add("is-in");
      }
    });
    if (scroll) {
      $("#espace").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      tab.focus({ preventScroll: true });
    }
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => openTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      const n = tabs.length;
      const k = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      const to = tabs[k % n];
      openTab(to.dataset.tab);
      to.focus();
    });
  });
  $$("[data-goto]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    openTab(a.dataset.goto, true);
  }));

  const KEYS = { r: "reassort", p: "projets", d: "devis", e: "expeditions" };
  const hit = (k) => {
    const b = $(`[data-key="${k}"]`);
    if (!b) return;
    b.classList.add("is-hit");
    setTimeout(() => b.classList.remove("is-hit"), 220);
  };
  const typing = (el) => !!el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));
  document.addEventListener("keydown", (e) => {
    const k = (e.key || "").toLowerCase();
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && k === "k") {
      e.preventDefault();
      focusCmd();
      hit("k");
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || typing(e.target) || !KEYS[k]) return;
    e.preventDefault();
    openTab(KEYS[k], true);
    hit(k);
  });
  $$("[data-key]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.key;
    if (k === "k") focusCmd();
    else openTab(KEYS[k], true);
  }));

  const pjLines = $("[data-pj-lines]");
  const renderPj = () => {
    const list = DC.projet.list();
    const by = {};
    U_ORDER.forEach((u) => { by[u] = { q: 0, refs: 0, names: [] }; });
    list.forEach((x) => {
      const b = by[x.u];
      if (!b) return;
      b.q += x.q || 0;
      b.refs += 1;
      const p = data ? data.get(x.u, x.h) : null;
      if (p && b.names.length < 3 && !b.names.includes(p.t)) b.names.push(p.t);
    });
    const refs = list.length;
    pjLines.innerHTML = U_ORDER.map((u) => {
      const b = by[u];
      const U = DC.UNIVERS[u];
      const more = b.refs > b.names.length && b.names.length ? "…" : "";
      return `<li class="${b.refs ? "" : "is-empty"}" style="--u: var(--u-${u})"><span class="pl-u"><i></i>${U.n}</span><span class="pl-q">${fmt(Math.round(b.q * 10) / 10)} <small>${U.unit}</small></span><span class="pl-bar"><b style="--p: ${refs ? (b.refs / refs).toFixed(3) : 0}"></b></span><span class="pl-s">${b.refs ? `${b.refs} ${plural(b.refs, "référence", "références")}${b.names.length ? ` · ${esc(b.names.join(", "))}${more}` : ""}` : "aucun article pour l'instant"}</span></li>`;
    }).join("");
    $("[data-pj-total]").textContent = `${refs} ${plural(refs, "référence", "références")} · 4 univers · 1 compte`;
    $("[data-pj-sub]").textContent = refs ? "Mis à jour à chaque ajout, depuis le comptoir ou les catalogues" : "Ce que vous ajoutez depuis le comptoir et les catalogues";
  };
  renderPj();
  DC.projet.on(renderPj);
  window.addEventListener("storage", (e) => {
    if (e.key !== "dchr-projet") return;
    renderPj();
    hdrCount();
  });

  const RA = [
    { u: "sol", h: "orne-moquettes", cat: "moquettes", q: 348, d: "06/11/2026", pj: "Rénovation 2ᵉ étage" },
    { u: "textile", h: "cadillac-bo", cat: "occultants", q: 126, d: "03/11/2026", pj: "Rénovation 2ᵉ étage" },
    { u: "mobilier", h: "", cat: "fauteuils", q: 14, d: "28/10/2026", pj: "Lobby et salons" },
    { u: "textile", h: "annecy", cat: "velours", q: 54, d: "22/10/2026", pj: "Rénovation 2ᵉ étage" },
    { u: "mural", h: "baronnies-vinyles", cat: "vinyles", q: 140, d: "14/08/2026", pj: "Restaurant" },
  ];
  const raList = $("[data-ra-lines]");
  const raTotal = $("[data-ra-total]");
  const raCount = $("[data-ra-count]");
  let raItems = [];
  const raStatus = (p, s, v) => {
    if (p.u === "mobilier") return s >= v ? ["ok", "En stock"] : ["order", p.dl];
    if (s >= v) return ["ok", "En stock dans ce coloris"];
    if (s > 0) return ["part", `Partiel : ${DC.qty(s, p.unit)} en stock`];
    return ["order", "Sur commande"];
  };
  const sumRa = () => {
    const by = {};
    raItems.forEach((x) => { by[x.p.unit] = (by[x.p.unit] || 0) + (parseFloat(x.field.value) || 0); });
    raTotal.textContent = ["ml", "m²", "u"].filter((u) => by[u]).map((u) => `${fmt(by[u])}${NB}${u}`).join(" · ") || "—";
    raCount.textContent = String(raItems.length);
  };
  const buildRa = () => {
    const items = RA.map((r) => {
      let p = r.h ? data.get(r.u, r.h) : null;
      if (!p) p = data.by[r.u].filter((x) => x.cat === r.cat).sort((a, b) => b.stock - a.stock)[0];
      if (!p) return null;
      return { r, p, ci: bestCi(p, r.q) };
    }).filter(Boolean);
    raList.innerHTML = items.map((x, i) => {
      const { p, ci, r } = x;
      const c = p.c[ci];
      const min = p.min || 1;
      const U = DC.UNIVERS[p.u];
      const url = DC.productUrl(p, ci);
      return `<li data-ra="${i}" style="--u: var(--u-${p.u})">
        <a class="ra-th" href="${url}" tabindex="-1" aria-hidden="true">${DC.visual(p, ci)}</a>
        <div class="ra-id"><b><a href="${url}">${esc(p.t)}</a> <span class="ra-u"><span class="u-dot"></span>${U.n} · ${esc(p.catName)}</span></b><span class="mono">${DC.qty(r.q, p.unit)} le ${r.d} · ${esc(r.pj)}</span><span class="ra-st"><span class="badge" data-ra-badge></span><span class="mono">${esc(c.k)} ${esc(colorName(p, c))} · ${DC.qty(c.s, p.unit)} en stock</span></span></div>
        <div class="ra-act">
          <span class="stepper"><button type="button" data-dec aria-label="Retirer 1 ${p.unit}"><svg class="ico"><use href="#i-minus"/></svg></button><input type="number" inputmode="numeric" min="${min}" step="1" value="${r.q}" aria-label="Quantité en ${unitLong(p.unit)}, ${esc(p.t)}"><span class="u">${p.unit}</span><button type="button" data-inc aria-label="Ajouter 1 ${p.unit}"><svg class="ico"><use href="#i-plus"/></svg></button></span>
          <button class="btn btn-sm" type="button" data-reorder aria-label="Recommander ${esc(p.t)} dans le même coloris"><svg><use href="#i-repeat"/></svg>Recommander</button>
        </div>
      </li>`;
    }).join("");
    raItems = items.map((x, i) => ({ ...x, row: $(`[data-ra="${i}"]`, raList), field: $(`[data-ra="${i}"] input`, raList) }));
    raItems.forEach((x) => {
      const { p, ci, row, field } = x;
      const min = p.min || 1;
      const dec = $("[data-dec]", row);
      const badgeEl = $("[data-ra-badge]", row);
      const set = (v) => {
        const n = Math.max(min, Math.min(99999, Math.round(v) || min));
        field.value = String(n);
        dec.disabled = n <= min;
        dec.title = n <= min ? `Minimum ${DC.qty(min, p.unit)}` : "";
        const [k, l] = raStatus(p, p.c[ci].s, n);
        badgeEl.className = `badge b-${k}`;
        badgeEl.textContent = l;
        sumRa();
        return n;
      };
      x.set = set;
      set(+field.value);
      dec.addEventListener("click", () => set(+field.value - 1));
      $("[data-inc]", row).addEventListener("click", () => set(+field.value + 1));
      field.addEventListener("input", sumRa);
      field.addEventListener("change", () => {
        const v = parseFloat(String(field.value).replace(",", "."));
        if (!(v >= min)) toast(`Minimum ${DC.qty(min, p.unit)} pour ${p.t} : la quantité est ramenée au minimum.`);
        set(v);
      });
      $("[data-reorder]", row).addEventListener("click", () => {
        const q = set(+field.value);
        DC.projet.add({ u: p.u, h: p.h, k: p.c[ci].k, q });
        toast(`${DC.qty(q, p.unit)} ${de(p.t)}, coloris ${p.c[ci].k}, ajoutés au projet.`, PROJET_LINK);
      });
    });
    sumRa();
  };
  $("[data-reorder-all]").addEventListener("click", () => {
    if (!raItems.length) return;
    raItems.forEach((x) => {
      const q = x.set(+x.field.value);
      DC.projet.add({ u: x.p.u, h: x.p.h, k: x.p.c[x.ci].k, q });
    });
    toast(`${raTotal.textContent} sur ${raItems.length} références, dans les mêmes coloris, ajoutés au projet.`, PROJET_LINK);
  });

  const fillThumbs = () => {
    $$("[data-th]").forEach((el) => {
      const [u, h] = el.dataset.th.split("/");
      const p = data.get(u, h);
      if (p) el.style.setProperty("--c", `url("${DC.swatch(p, bestCi(p, null))}")`);
    });
  };

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-proto]");
    if (b) toast(b.dataset.proto || "Prototype");
  });
  $$(".lang").forEach((b) => b.addEventListener("click", () => toast("Prototype : le choix de la langue sera branché ici.")));

  DC.load().then((d) => {
    data = d;
    lastStatus = "";
    lastTop = "";
    lastVisual = "";
    update();
    buildStock();
    buildRa();
    renderPj();
    fillThumbs();
  }).catch(() => {
    $("[data-stock-status]").textContent = "Stock indisponible";
    stText.textContent = "Le stock n'a pas pu être chargé. Rechargez la page.";
  });
})();
