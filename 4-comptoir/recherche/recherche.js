(() => {
  const DC = window.DCHR;
  const P = window.COMPTOIR_PARSE;
  const M = window.COMPTOIR_MATCH;
  const { $, $$, esc, UNIVERS, U_ORDER } = DC;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE = 24;
  const CAP = 6;
  const SORTS = ["pertinence", "stock", "delai"];
  const VIEWS = ["liste", "grille"];
  const VIEW_KEY = "dchr-comptoir-vue";
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = (n, one, many) => (n > 1 ? many : one);
  const de = (t) => (/^[aeiouyàâäéèêëîïôöûü]/i.test(t) ? `d'${t}` : `de ${t}`);

  try { localStorage.setItem("dchr-prop", "4-comptoir"); } catch { }

  const prefView = () => {
    try { return VIEWS.includes(localStorage.getItem(VIEW_KEY)) ? localStorage.getItem(VIEW_KEY) : "liste"; } catch { return "liste"; }
  };
  const readUrl = () => {
    const sp = new URLSearchParams(location.search);
    const u = sp.get("u");
    return {
      q: (sp.get("q") || "").trim(),
      u: U_ORDER.includes(u) ? u : "all",
      tri: SORTS.includes(sp.get("tri")) ? sp.get("tri") : "pertinence",
      vue: VIEWS.includes(sp.get("vue")) ? sp.get("vue") : prefView(),
    };
  };
  const state = { ...readUrl(), pages: {} };

  DC.header({ current: "recherche", q: state.q, scope: state.u === "all" ? "" : state.u });
  DC.footer();

  const input = $("[data-cmd]");
  const form = $("[data-cmd-form]");
  const tokensEl = $("[data-tokens]");
  const hintEl = $("[data-hint]");
  const clearBtn = $("[data-cmd-clear]");
  const runLabel = $("[data-run-label]");
  const besoin = $("[data-besoin]");
  const meterBars = $$("[data-meter] i");
  const meterN = $("[data-meter-n]");
  const sumEl = $("[data-bb-sum]");
  const tabsEl = $("[data-tabs]");
  const resEl = $("[data-results]");
  const countEl = $("[data-count-line]");
  const staleEl = $("[data-stale]");
  const notesEl = $("[data-notes]");
  const emptyEl = $("[data-empty]");
  const footEl = $("[data-foot]");
  const sortBtns = $$("[data-sort]");
  const viewBtns = $$("[data-view]");
  const toastEl = $("[data-toast]");
  $("[data-b-ref]").textContent = `BB-${String(P.TODAY.getFullYear()).slice(2)}${P.pad(P.TODAY.getMonth() + 1)}${P.pad(P.TODAY.getDate())}-01`;

  let toastT;
  const toast = (msg, link) => {
    toastEl.innerHTML = `<span>${esc(msg)}</span>${link ? `<a href="${esc(link.href)}">${esc(link.l)}</a>` : ""}`;
    toastEl.classList.toggle("has-link", !!link);
    toastEl.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-in"), link ? 5200 : 3600);
  };

  let data = null;
  let res = null;
  let need = null;
  let lastQ = null;
  let uid = 0;

  const famName = (hex) => {
    const k = M.famOf(hex);
    const f = DC.COLOR_FAMILIES.find((x) => x.k === k);
    return f ? f.n : "";
  };
  const colorName = (p, c) => (p.u === "textile" ? famName(c.h) : c.n);
  const dueShort = () => (need && need.due ? `${P.pad(need.due.date.getDate())}/${P.pad(need.due.date.getMonth() + 1)}` : "");
  const okLabel = (n, withQty, us) => (withQty && !(us && us.length && us.every((u) => u === "mobilier")) ? `${plural(n, "disponible", "disponibles")} en un seul coloris` : "en stock");
  const usOf = (list) => [...new Set(list.map((x) => x.p.u))];

  const catCount = (u, k) => {
    if (!data) return null;
    const c = data.stats[u].cats.find((x) => x.k === k);
    return c ? c : null;
  };
  const matSub = (mat) => {
    if (mat.generic) return "famille à préciser";
    if (!mat.u) return "dans les quatre univers";
    const rule = (M.MAT[mat.l] || []).find((r) => r.cat && r.u === mat.u);
    const c = rule ? catCount(rule.u, rule.cat) : null;
    return c ? `${c.n} · ${c.count} ${plural(c.count, "produit", "produits")}` : `/${mat.u}`;
  };

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

  const setRow = (key, html, sub, warn) => {
    const row = $(`[data-f="${key}"]`, besoin);
    $(".v", row).innerHTML = html || "—";
    $(".s", row).textContent = sub || "";
    row.classList.toggle("is-empty", !html);
    row.classList.toggle("is-warn", !!warn);
  };

  const sumText = (p, r) => {
    if (p.empty) return { t: "Décrivez un besoin pour lancer la recherche." };
    if (!data) return { t: "Chargement du stock…" };
    if (r.mode === "vague") return { t: "Précisez une matière ou un univers." };
    const n = r.counts.all;
    if (!n) return { t: "Aucun produit ne correspond pour l'instant." };
    const ok = r.list.filter((x) => x.st.k === "ok").length;
    return { t: `${n} ${plural(n, "produit correspond", "produits correspondent")} · ${ok} ${okLabel(ok, !!p.qty, usOf(r.list))}`, live: ok > 0 };
  };

  const renderBon = (p, r) => {
    const U = p.u ? P.UNIVERS[p.u] : null;
    const mats = [p.mat, ...p.mats].filter(Boolean);
    $("[data-b-title]").textContent = p.mat ? cap(`${mats.map((m) => m.l).join(" · ")}${p.color ? ` · ${p.color.n}` : ""}`) : U ? `Besoin ${U.n.toLowerCase()}` : p.empty ? "Nouveau besoin" : "Besoin à préciser";
    const st = $("[data-b-state]");
    const ready = U && p.qty && p.mat;
    st.textContent = p.empty ? "Vide" : ready ? "Prêt" : "Brouillon";
    st.className = `tag${ready ? " is-live" : ""}`;
    setRow("univers", U ? `<i class="u-dot" style="--u: var(--u-${p.u})"></i>${U.n}` : "", U ? `${U.sell} · ${p.why}` : p.mat && !p.mat.u ? "les quatre univers" : "");
    const qSub = !p.qty ? "" : p.qty.inferred ? "unité déduite" : p.warnQty ? `attendu en ${U.unit}` : p.short ? "sous le minimum de coupe" : p.qty.src === "noun" ? "compté à l'unité" : "";
    setRow("qty", p.qty ? esc(P.qtyText(p.qty)) : "", qSub, p.warnQty || p.short);
    setRow("matiere", mats.length ? esc(mats.map((m) => m.l).join(" · ")) : "", p.mat ? matSub(p.mat) : "");
    setRow("couleur", p.color ? `<i class="sw" style="--c: ${p.color.c}"></i>${p.color.n}` : "", "");
    setRow("norme", p.norms.map((x) => x.l).join(" · "), p.norms.map((x) => x.d).join(" · "), !!p.badNorm);
    setRow("echeance", p.due ? P.fmtDate(p.due.date) : "", p.due ? p.due.s : "", p.due && p.due.warn);
    const filled = [p.qty, p.mat, p.color, p.norms.length, p.due, p.u].filter(Boolean).length;
    meterBars.forEach((b, i) => b.classList.toggle("on", i < filled));
    meterN.textContent = `${filled}/6 reconnus`;
    const s = sumText(p, r);
    sumEl.innerHTML = `<span class="${s.live ? "live-dot" : "st-dot"}"></span><span>${esc(s.t)}</span>`;
  };

  const renderLive = () => {
    const v = input.value;
    const p = P(v);
    renderTokens(p);
    hintEl.hidden = !p.hint;
    if (p.hint) hintEl.innerHTML = `<svg class="ico"><use href="#i-info"/></svg><span>${esc(p.hint)}</span>`;
    renderBon(p, data ? M(p, data) : null);
    clearBtn.hidden = !v;
    const stale = lastQ !== null && v.trim() !== lastQ;
    staleEl.hidden = !stale;
    resEl.classList.toggle("is-stale", stale);
    runLabel.textContent = stale ? "Actualiser" : "Chercher";
  };

  const writeUrl = (push) => {
    const sp = new URLSearchParams();
    if (state.q) sp.set("q", state.q);
    if (state.u !== "all") sp.set("u", state.u);
    if (state.tri !== "pertinence") sp.set("tri", state.tri);
    if (state.vue !== "liste") sp.set("vue", state.vue);
    const qs = sp.toString();
    history[push ? "pushState" : "replaceState"](null, "", `${location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const catUrl = (g) => {
    const params = {};
    const cats = [...new Set(g.items.map((x) => x.p.cat))];
    if (cats.length === 1) params.cat = cats[0];
    if (need.color && !res.relaxed.color) {
      const f = M.COL_FAM[need.color.n];
      if (f) params.fam = f[0];
    }
    if (need.qty && (!need.qty.unit || need.qty.unit === UNIVERS[g.u].unit)) params.min = need.qty.n;
    return DC.universeUrl(g.u, params);
  };

  const badge = (x) => `<span class="badge b-${x.st.k}">${esc(x.st.l)}</span>`;
  const inProj = (x) => `<span class="rl-in" data-in="${esc(`${x.p.u}/${x.p.h}/${x.c.k}`)}"></span>`;
  const addForm = (x, compact) => {
    const p = x.p;
    const id = `qa-${(uid += 1)}`;
    const min = p.min || 1;
    const qv = x.qn != null ? Math.max(x.qn, min) : min;
    const unitLong = p.unit === "ml" ? "mètres linéaires" : p.unit === "m²" ? "mètres carrés" : "unités";
    return `<form class="rl-a${compact ? " is-compact" : ""}" data-add data-u="${p.u}" data-h="${esc(p.h)}" data-k="${esc(x.c.k)}">
      <label class="vh" for="${id}">Quantité en ${unitLong}, ${esc(p.t)}, coloris ${esc(x.c.k)}</label>
      <span class="qf"><input id="${id}" type="number" inputmode="decimal" min="${min}" step="${p.unit === "u" ? 1 : "any"}" value="${qv}"><span class="u">${p.unit}</span></span>
      <button class="btn btn-sm" type="submit"><svg><use href="#i-plus"/></svg><span data-l>Ajouter au projet</span></button>
      ${compact ? "" : `<a class="go-l" href="${DC.productUrl(p, x.ci)}" aria-label="Fiche produit ${esc(p.t)}"><svg class="ico"><use href="#i-arrow"/></svg></a>`}
    </form>`;
  };
  const feuCell = (x) => {
    const p = x.p;
    const feu = p.feu && p.feu !== "–" ? `<span class="feu">${esc(p.feu)}</span>` : `<span class="feu feu-na">Feu non indiqué</span>`;
    const chk = x.checks.map((c) => (c.r === "ok" ? `<span class="nchk is-ok"><svg class="ico"><use href="#i-check"/></svg>${esc(c.l)}</span>` : `<span class="nchk">${esc(c.l)} à confirmer</span>`)).join("");
    const late = x.late === true ? `<span class="late">au-delà du ${dueShort()}</span>` : x.late === false ? `<span class="ontime">avant le ${dueShort()}</span>` : "";
    return `<div class="rl-f"><span class="rl-feu">${feu}${chk}</span><span class="rl-dl">${esc(x.lead.t)}${late}</span><span class="rl-o">Fabriqué en ${esc(p.o)}</span></div>`;
  };
  const row = (x) => {
    const p = x.p;
    const url = DC.productUrl(p, x.ci);
    const word = p.u === "mobilier" ? ["autre finition suffit", "autres finitions suffisent", "finition", "finitions"] : ["autre coloris suffit", "autres coloris suffisent", "coloris", "coloris"];
    const alt = x.alt ? `+${x.alt} ${plural(x.alt, word[0], word[1])}` : `${p.c.length} ${plural(p.c.length, word[2], word[3])} au catalogue`;
    return `<li class="rl-row" style="--u: var(--u-${p.u})">
      <a class="rl-th" href="${url}" tabindex="-1" aria-hidden="true">${DC.visual(p, x.ci)}</a>
      <div class="rl-p">
        <span class="rl-u"><span class="u-dot"></span>${UNIVERS[p.u].n} · ${esc(p.catName)}${p.n ? ' <span class="rl-new">Nouveau</span>' : ""}</span>
        <a class="rl-t" href="${url}">${esc(p.t)}</a>
        <span class="rl-pack">${esc(p.pack || "")}</span>
        ${inProj(x)}
      </div>
      <div class="rl-c"><i class="rl-sw" style="--c: ${esc(x.c.h)}"></i><span class="rl-cn"><b>${esc(x.c.k)}</b> ${esc(colorName(p, x.c))}<small>${alt}</small></span></div>
      <div class="rl-s">${badge(x)}<span class="rl-stock"><b>${DC.qty(x.s, p.unit)}</b> ${p.u === "mobilier" ? "dans cette finition" : "dans ce coloris"}</span></div>
      ${feuCell(x)}
      ${addForm(x, false)}
    </li>`;
  };
  const listHead = `<li class="rl-h" aria-hidden="true"><span></span><span>Produit</span><span>Coloris ou finition</span><span>Disponibilité</span><span>Feu · délai · origine</span><span>Quantité</span></li>`;
  const gridItem = (x) => `<div class="rq-gi" style="--u: var(--u-${x.p.u})">${DC.card(x.p, { ci: x.ci })}<div class="rq-ga">${badge(x)}<span class="rl-stock"><b>${DC.qty(x.s, x.p.unit)}</b> en ${esc(x.c.k)}</span>${inProj(x)}${addForm(x, true)}</div></div>`;

  const renderGroup = (g, multi) => {
    const U = UNIVERS[g.u];
    const shown = multi ? CAP : (state.pages[g.u] || 1) * PAGE;
    const items = g.items.slice(0, shown);
    const rest = g.items.length - items.length;
    const ok = g.items.filter((x) => x.st.k === "ok").length;
    const head = `<div class="rg-head" style="--u: var(--u-${g.u})">
      <h2><span class="u-dot"></span>${U.n}<span class="n">${g.items.length}</span></h2>
      <span class="rg-meta">${ok} ${okLabel(ok, !!(need.qty && (!need.qty.unit || need.qty.unit === U.unit)), [g.u])} · vendu ${U.unitLong}</span>
      <a class="link-arrow" href="${catUrl(g)}">Ouvrir dans le catalogue ${U.n.toLowerCase()}<svg><use href="#i-arrow"/></svg></a>
    </div>`;
    const body = state.vue === "grille"
      ? `<div class="pc-grid rq-grid">${items.map(gridItem).join("")}</div>`
      : `<ul class="rl">${listHead}${items.map(row).join("")}</ul>`;
    let more = "";
    if (rest > 0 && multi) more = `<button class="btn btn-sm btn-ghost rg-more" type="button" data-tab-go="${g.u}">Voir les ${g.items.length} résultats ${U.n.toLowerCase()}<svg><use href="#i-arrow"/></svg></button>`;
    else if (rest > 0) more = `<button class="btn btn-sm btn-ghost rg-more" type="button" data-more="${g.u}">Afficher ${Math.min(PAGE, rest)} de plus <span class="mono">${items.length}/${g.items.length}</span></button>`;
    return `<section class="rg" aria-label="${U.n}">${head}${body}${more}</section>`;
  };

  const renderTabs = () => {
    const c = res ? res.counts : null;
    const items = [["all", "Tout"], ...U_ORDER.map((u) => [u, UNIVERS[u].n])];
    tabsEl.innerHTML = items.map(([k, l]) => {
      const n = c ? c[k] : 0;
      const sel = state.u === k;
      const dis = !!c && k !== "all" && !n;
      return `<button class="rq-tab" type="button" role="tab" id="tab-${k}" aria-selected="${sel}" aria-controls="rq-panel" tabindex="${sel ? 0 : -1}" data-tab="${k}"${dis ? " disabled" : ""}${k !== "all" ? ` style="--u: var(--u-${k})"` : ""}>${k !== "all" ? '<span class="u-dot"></span>' : ""}${l}<span class="n">${c ? n : "…"}</span></button>`;
    }).join("");
    resEl.setAttribute("aria-labelledby", `tab-${state.u}`);
  };

  const exChips = () => P.EXAMPLES.map((x) => `<button class="ex" type="button" data-ex style="--u: var(--u-${x.u})">${esc(x.q)}</button>`).join("");
  const emptyHtml = (kind) => {
    const title = kind === "empty" ? "Décrivez votre besoin" : kind === "vague" ? "Précisez ce qu'il faut chercher" : `Aucun produit pour « ${esc(lastQ)} »`;
    const text = kind === "empty"
      ? "Une ligne suffit : quantité, matière, couleur, norme feu et échéance."
      : kind === "vague"
        ? "La quantité est lue, mais pas la matière ni l'univers. Ajoutez par exemple velours, vinyle, moquette ou fauteuil."
        : "Essayez une formulation plus large ou l'un des exemples ci-dessous.";
    const href = `../../recherche/${lastQ ? `?q=${encodeURIComponent(lastQ)}` : ""}`;
    return `<div class="rq-empty-in"><h2>${title}</h2><p>${text}</p><div class="examples" role="group" aria-label="Exemples de besoins"><span class="eyebrow">Exemples</span>${exChips()}</div><a class="btn btn-sm btn-ghost" href="${href}">Chercher dans tout le catalogue<svg><use href="#i-arrow"/></svg></a></div>`;
  };

  const updateInProj = () => {
    const sum = new Map();
    DC.projet.list().forEach((x) => {
      const k = `${x.u}/${x.h}/${x.k}`;
      sum.set(k, (sum.get(k) || 0) + (x.q || 0));
    });
    $$("[data-in]", resEl).forEach((el) => {
      const k = el.dataset.in;
      const q = sum.get(k);
      const unit = UNIVERS[k.split("/")[0]].unit;
      el.textContent = q ? `Au projet : ${DC.qty(q, unit)}` : "";
      el.hidden = !q;
    });
  };

  const renderResults = () => {
    renderTabs();
    sortBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sort === state.tri)));
    viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === state.vue)));
    if (!res) return;
    const notes = [...res.notes];
    if (res.mode === "text") notes.unshift("Aucun critère reconnu : la recherche porte sur les noms et les descriptions des quatre univers.");
    notesEl.hidden = !notes.length;
    notesEl.innerHTML = notes.map((n) => `<li><svg class="ico"><use href="#i-info"/></svg><span>${esc(n)}</span></li>`).join("");
    const kind = res.mode === "empty" || res.mode === "vague" ? res.mode : !res.counts.all ? "none" : "";
    emptyEl.hidden = !kind;
    footEl.hidden = !!kind;
    if (kind) {
      emptyEl.innerHTML = emptyHtml(kind);
      resEl.innerHTML = "";
      countEl.textContent = kind === "none" ? "0 résultat" : "";
      return;
    }
    const all = state.u === "all" ? res.list : res.list.filter((x) => x.p.u === state.u);
    const list = M.sortBy(all, state.tri);
    const groups = U_ORDER.map((u) => ({ u, items: list.filter((x) => x.p.u === u) })).filter((g) => g.items.length);
    const multi = state.u === "all" && groups.length > 1;
    uid = 0;
    resEl.innerHTML = groups.map((g) => renderGroup(g, multi)).join("");
    const n = list.length;
    const ok = list.filter((x) => x.st.k === "ok").length;
    countEl.innerHTML = `<b>${n}</b> ${plural(n, "résultat", "résultats")} pour « ${esc(lastQ)} »${state.u !== "all" ? ` en ${UNIVERS[state.u].n.toLowerCase()}` : ""} · ${ok} ${okLabel(ok, !!need.qty, usOf(list))}`;
    footEl.innerHTML = `Pas ce qu'il faut ? <a class="link-arrow" href="../../recherche/?q=${encodeURIComponent(lastQ)}">Chercher « ${esc(lastQ)} » dans tout le catalogue<svg><use href="#i-arrow"/></svg></a>`;
    updateInProj();
  };

  const syncHeader = () => {
    const hq = $("#dchr-q");
    if (hq) hq.value = state.q;
  };

  const run = (mode) => {
    state.q = input.value.trim();
    lastQ = state.q;
    need = P(state.q);
    res = data ? M(need, data) : null;
    state.pages = {};
    if (res && state.u !== "all" && !res.counts[state.u]) state.u = "all";
    if (mode) writeUrl(mode === "push");
    syncHeader();
    renderLive();
    renderResults();
  };

  const scrollToResults = () => {
    const top = $("#resultats").getBoundingClientRect().top;
    if (top < 0) $("#resultats").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  const setTab = (u, focus) => {
    if (state.u === u) return;
    state.u = u;
    writeUrl(false);
    renderResults();
    if (focus) {
      const t = $(`#tab-${u}`);
      if (t) t.focus();
    }
  };

  input.value = state.q;
  renderLive();
  renderTabs();

  input.addEventListener("input", renderLive);
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (input.value) {
      input.value = "";
      renderLive();
    } else input.blur();
  });
  clearBtn.addEventListener("click", () => {
    input.value = "";
    renderLive();
    input.focus();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim() && !lastQ) {
      input.focus();
      return;
    }
    run(input.value.trim() === lastQ ? "replace" : "push");
    scrollToResults();
  });

  tabsEl.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]");
    if (t && !t.disabled) setTab(t.dataset.tab);
  });
  tabsEl.addEventListener("keydown", (e) => {
    const tabs = $$("[data-tab]:not([disabled])", tabsEl);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = tabs.length;
    const k = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault();
    setTab(tabs[k % n].dataset.tab, true);
  });
  sortBtns.forEach((b) => b.addEventListener("click", () => {
    state.tri = b.dataset.sort;
    writeUrl(false);
    renderResults();
  }));
  viewBtns.forEach((b) => b.addEventListener("click", () => {
    state.vue = b.dataset.view;
    try { localStorage.setItem(VIEW_KEY, state.vue); } catch { }
    writeUrl(false);
    renderResults();
  }));

  document.addEventListener("click", (e) => {
    const ex = e.target.closest("[data-ex]");
    if (ex) {
      input.value = ex.textContent.trim();
      run("push");
      return;
    }
    const go = e.target.closest("[data-tab-go]");
    if (go) {
      setTab(go.dataset.tabGo);
      scrollToResults();
      return;
    }
    const more = e.target.closest("[data-more]");
    if (more) {
      const u = more.dataset.more;
      state.pages[u] = (state.pages[u] || 1) + 1;
      renderResults();
    }
  });

  resEl.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-add]");
    if (!f || !data) return;
    e.preventDefault();
    const p = data.get(f.dataset.u, f.dataset.h);
    if (!p) return;
    const k = f.dataset.k;
    const field = $("input", f);
    const min = p.min || 1;
    let v = parseFloat(String(field.value).replace(",", "."));
    let note = "";
    if (!(v > 0)) v = min;
    if (v < min) {
      v = min;
      note = `, minimum ${DC.qty(min, p.unit)}`;
    }
    if (p.unit === "u") v = Math.ceil(v);
    else v = Math.round(v * 10) / 10;
    field.value = String(v);
    DC.projet.add({ u: p.u, h: p.h, k, q: v });
    const btn = $("button", f);
    const l = $("[data-l]", btn);
    btn.classList.add("is-done");
    $("use", btn).setAttribute("href", "#i-check");
    l.textContent = "Ajouté";
    setTimeout(() => {
      btn.classList.remove("is-done");
      $("use", btn).setAttribute("href", "#i-plus");
      l.textContent = "Ajouter au projet";
    }, 1800);
    toast(`${DC.qty(v, p.unit)} ${de(p.t)}, coloris ${k}, ajoutés au projet${note}.`, { href: "../../projet/", l: "Voir le projet" });
  });
  DC.projet.on(updateInProj);

  document.addEventListener("keydown", (e) => {
    const k = (e.key || "").toLowerCase();
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && k === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  window.addEventListener("popstate", () => {
    Object.assign(state, readUrl());
    input.value = state.q;
    run(null);
  });

  DC.load().then((d) => {
    data = d;
    run("replace");
    if (!state.q) input.focus({ preventScroll: true });
  }).catch(() => {
    resEl.innerHTML = `<p class="rq-loading">Le stock n'a pas pu être chargé. Rechargez la page.</p>`;
  });
})();
