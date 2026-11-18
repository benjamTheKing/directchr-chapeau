(() => {
  const D = window.DCHR;
  const H = window.HOTEL;
  const { $, $$, esc, nf } = D;
  const KEYS = D.U_ORDER;
  const UN = (u) => D.UNIVERS[u].n;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const key = new URLSearchParams(location.search).get("e");
  const id = H.SPACES[key] ? key : "chambres";
  const s = H.SPACES[id];
  const UPH = ["velours", "chenilles", "textures", "effet-cuir", "jacquards", "tweed", "naturels", "microfibres", "outdoor", "imprimes"];
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

  try { localStorage.setItem("dchr-prop", "2-hotel"); } catch { }
  document.title = `${s.name} · Direct CHR`;
  D.header({ current: `espace:${id}` });
  D.footer();
  H.syncCount();
  document.body.insertAdjacentHTML("afterbegin", `<svg class="ep-defs" width="0" height="0" aria-hidden="true" focusable="false">${H.defs()}</svg>`);

  $("[data-crumb]").textContent = s.name;
  $("[data-lvl]").textContent = `${s.lvl} · ${s.kind}`;
  $("[data-title]").innerHTML = `${esc(s.name)} <span class="lt">${esc(s.tag)}</span>`;
  $("[data-desc]").textContent = s.desc;
  $("[data-cut]").textContent = `${s.name}, ${s.lvl}`;
  $("[data-draw-lvl]").textContent = s.lvl;
  $("[data-uni-title]").innerHTML = `${esc(s.name)}, <span class="lt">univers par univers.</span>`;
  $("[data-amb-base]").textContent = `Quantités de départ pour ${s.amb.base}, minimums de commande compris. Elles s'ajustent ensuite dans le projet.`;

  const req = (lists) => KEYS.map((u) => {
    const [lbl, feu] = s.u[u];
    const n = lists ? lists[u].length : null;
    const na = !s.cats[u].length || n === 0;
    const cnt = n == null ? "" : `${na ? "—" : `${nf.format(n)} réf.`}`;
    return `<li style="--u: var(--u-${u})"><a class="rq${na ? " is-na" : ""}" href="#u-${u}"><span class="rq-u"><i></i>${UN(u)}</span><span class="rq-l">${esc(lbl)}</span><span class="rq-c">${cnt}</span><span class="rq-f">${na ? "" : `<span class="feu">${esc(feu)}</span>`}</span></a></li>`;
  }).join("");
  $("[data-req]").innerHTML = req(null);

  const draw = $("[data-draw]");
  draw.setAttribute("viewBox", H.viewBox(id));
  draw.setAttribute("aria-label", `Coupe de l'espace ${s.name}, habillée avec l'ambiance proposée`);
  const paintDraw = (th, defs) => {
    draw.innerHTML = `<defs>${defs}</defs>${H.group(id, th, true)}${H.CUTS}`;
  };
  paintDraw({}, "");

  $("[data-switch]").innerHTML = H.ORDER.map((k) => {
    const sp = H.SPACES[k];
    const on = k === id;
    return `<a class="ep-tile${on ? " is-cur" : ""}" href="?e=${k}"${on ? ' aria-current="page"' : ""}><span class="esp-fig">${H.mini(k)}<span class="esp-lvl">${sp.lvl}</span></span><span class="ep-tile-b"><b>${esc(sp.name)}</b><small>${esc(sp.kind)}</small><span class="ep-tile-c" data-tc="${k}"></span></span></a>`;
  }).join("");

  let DATA = null;
  let lists = null;
  let leads = [];
  let li = 0;
  let cur = null;

  const role = (u, p) => (u === "mobilier" ? H.GEN_N[p.gen] || p.catName : s.role[u]);
  const pickFor = (u, acc) => {
    if (!s.cats[u].length) return null;
    const pool = (acc[u] || []).filter((x) => x.p.es.includes(id));
    if (!pool.length) return null;
    if (u === "mobilier") {
      const inCat = pool.filter((x) => s.cats[u].includes(x.p.cat));
      return inCat.find((x) => s.gens.includes(x.p.gen)) || inCat[0] || pool[0];
    }
    const cat = s.cats[u].find((k) => pool.some((x) => x.p.cat === k));
    return (cat && pool.find((x) => x.p.cat === cat)) || pool[0];
  };
  const compose = (lead) => {
    const acc = D.accordsFor(lead, DATA, 400);
    const out = { [lead.u]: { p: lead, ci: 0 } };
    KEYS.filter((u) => u !== lead.u).forEach((u) => { out[u] = pickFor(u, acc); });
    return out;
  };
  const leadPool = (u) => {
    if (!s.cats[u].length || !lists[u].length) return [];
    let l = lists[u].filter((p) => s.cats[u].includes(p.cat));
    if (u === "mobilier") {
      const g = l.filter((p) => s.gens.includes(p.gen));
      if (g.length) l = g;
    }
    return H.spread(l.length ? l : lists[u], s.cats[u], 3);
  };
  const buildLeads = () => {
    const order = [s.lead, ...KEYS.filter((u) => u !== s.lead)];
    const per = Object.fromEntries(order.map((u) => [u, leadPool(u)]));
    const out = [];
    for (let i = 0; i < 3; i += 1) order.forEach((u) => { if (per[u][i]) out.push(per[u][i]); });
    return out;
  };

  const tile = (u, x, isLead) => {
    if (!x) {
      return `<article class="amb-t is-na" style="--u: var(--u-${u})"><div class="amb-v"><span class="amb-x"></span></div><div class="amb-b"><span class="amb-r"><span class="u-dot"></span>${UN(u)}</span><b class="amb-n">Hors périmètre</b><span class="amb-m">Rien à prévoir ${esc(s.pour)}.</span></div></article>`;
    }
    const { p, ci } = x;
    const c = p.c[ci];
    const href = D.productUrl(p, ci);
    const tx = cur.textile;
    const fabric = u === "mobilier" && p.garni && tx && UPH.includes(tx.p.cat) ? D.swatch(tx.p, tx.ci) : undefined;
    const q = H.line(p, ci, s.amb.q[u] || 1).q;
    return `<article class="amb-t${isLead ? " is-lead" : ""}" style="--u: var(--u-${u})">
      <a class="amb-v" href="${href}" tabindex="-1" aria-hidden="true">${D.visual(p, ci, { fabric })}${isLead ? '<span class="amb-lead">Départ de l\'accord</span>' : ""}</a>
      <div class="amb-b">
        <span class="amb-r"><span class="u-dot"></span>${esc(role(u, p) === UN(u) ? UN(u) : `${role(u, p)} · ${UN(u)}`)}</span>
        <a class="amb-n" href="${href}">${esc(p.t)}</a>
        <span class="amb-m">${esc(p.catName)} · ${esc(c.n)}</span>
        <span class="amb-q"><b>${D.qty(q, p.unit)}</b>${p.feu && p.feu !== "–" ? `<span class="feu">${esc(p.feu)}</span>` : ""}</span>
      </div>
    </article>`;
  };
  const legend = () => KEYS.filter((u) => cur[u]).map((u) => {
    const { p, ci } = cur[u];
    return `<a class="lg" href="${D.productUrl(p, ci)}" style="--u: var(--u-${u})"><img src="${esc(D.swatch(p, ci))}" alt="" width="30" height="30" loading="lazy" decoding="async"><span><small><span class="u-dot"></span>${esc(role(u, p))}</small><b>${esc(p.t)}</b></span></a>`;
  }).join("");
  const pat = (pid, href, size) => `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${size}" height="${size}"><image href="${esc(href)}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice"/></pattern>`;
  const dress = () => {
    const th = {};
    let defs = "";
    if (cur.mural) {
      th[s.mt] = "url(#ep-mural)";
      defs += pat("ep-mural", D.swatch(cur.mural.p, cur.mural.ci), 24);
    }
    if (cur.sol) {
      th.floor = "url(#ep-sol)";
      defs += pat("ep-sol", D.swatch(cur.sol.p, cur.sol.ci), 16);
    }
    if (cur.textile) {
      th[`t:${s.sw[0]}`] = "url(#ep-textile)";
      defs += pat("ep-textile", D.swatch(cur.textile.p, cur.textile.ci), 30);
    }
    if (cur.mobilier) th.wood = cur.mobilier.p.c[cur.mobilier.ci].h;
    paintDraw(th, defs);
  };
  const renderAmb = (animate) => {
    const lead = leads[li];
    if (!lead) return;
    cur = compose(lead);
    const amb = $("[data-amb]");
    amb.innerHTML = KEYS.map((u) => tile(u, cur[u], u === lead.u)).join("");
    $("[data-amb-pos]").textContent = `Accord ${li + 1} / ${leads.length} · départ ${UN(lead.u).toLowerCase()}`;
    $("[data-legend]").innerHTML = legend();
    dress();
    if (animate && !reduce && amb.animate) {
      amb.animate([{ opacity: 0.3, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: EASE });
      draw.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 420, easing: EASE });
    }
  };
  $("[data-amb-next]").addEventListener("click", () => {
    if (!leads.length) return;
    li = (li + 1) % leads.length;
    renderAmb(true);
  });
  $("[data-amb-add]").addEventListener("click", () => {
    if (!cur) {
      H.toast("Le catalogue se charge, réessayez dans un instant.");
      return;
    }
    const items = KEYS.filter((u) => cur[u]).map((u) => H.line(cur[u].p, cur[u].ci, s.amb.q[u] || 1));
    const fresh = H.put(items);
    const verb = fresh === items.length ? "ajoutés au" : "mis à jour dans le";
    H.toast(`${items.length} produits ${verb} projet · ${s.name}.`, `${D.ROOT}projet/`, "Voir le projet");
  });

  const block = (u) => {
    const list = lists[u];
    const [lbl, feu] = s.u[u];
    const all = D.universeUrl(u, { es: id });
    const head = `<div class="ub-head"><div class="ub-t"><h3><span class="u-dot"></span>${UN(u)} <span class="lt">${esc(lbl)}</span></h3><p class="ub-m"><span>${H.words(list.length)} ${esc(s.pour)}</span>${list.length && feu !== "–" ? `<span class="feu">${esc(feu)}</span>` : ""}</p></div><a class="link-arrow" data-all href="${all}">Tout voir <svg><use href="#i-arrow"/></svg></a></div>`;
    if (!list.length) {
      return `<section class="ub is-empty" id="u-${u}" style="--u: var(--u-${u})">${head}<p class="ub-empty">Hors périmètre : rien à prévoir ${esc(s.pour)} dans cet univers. <a href="${D.universeUrl(u)}">Parcourir tout le catalogue ${UN(u).toLowerCase()}</a></p></section>`;
    }
    const cats = H.catsOf(list, s.cats[u]);
    const chips = `<button class="chip" type="button" data-cat="" aria-pressed="true">Tout <small>${nf.format(list.length)}</small></button>${cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c.k)}" aria-pressed="false">${esc(c.n)} <small>${nf.format(c.count)}</small></button>`).join("")}`;
    return `<section class="ub" id="u-${u}" style="--u: var(--u-${u})" data-ub="${u}">${head}<div class="ub-chips" role="group" aria-label="Catégories ${UN(u).toLowerCase()} ${esc(s.pour)}">${chips}</div><div class="pc-grid ub-grid" data-grid aria-live="polite"></div><a class="link-arrow ub-more" data-more href="${all}"></a></section>`;
  };
  const fill = (sec, cat) => {
    const u = sec.dataset.ub;
    const list = lists[u];
    const sub = cat
      ? H.rank(list.filter((p) => p.cat === cat), s.cats[u], u === "mobilier" ? s.gens : [])
      : H.spread(list, s.cats[u], 8);
    $("[data-grid]", sec).innerHTML = sub.slice(0, 8).map((p) => D.card(p)).join("");
    const href = D.universeUrl(u, cat ? { es: id, cat } : { es: id });
    const n = cat ? sub.length : list.length;
    $("[data-all]", sec).href = href;
    const more = $("[data-more]", sec);
    more.href = href;
    more.innerHTML = `Tout voir · ${H.words(n)} <svg><use href="#i-arrow"/></svg>`;
  };
  const blocksEl = $("[data-blocks]");
  blocksEl.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    const sec = b.closest(".ub");
    $$(".chip", sec).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    fill(sec, b.dataset.cat);
  });

  D.load().then((data) => {
    DATA = data;
    lists = Object.fromEntries(KEYS.map((u) => [u, H.inSpace(data, u, id)]));
    $("[data-req]").innerHTML = req(lists);
    blocksEl.innerHTML = KEYS.map(block).join("");
    $$(".ub[data-ub]", blocksEl).forEach((sec) => fill(sec, ""));
    H.ORDER.forEach((k) => {
      const n = KEYS.reduce((a, u) => a + H.inSpace(data, u, k).length, 0);
      const el = $(`[data-tc="${k}"]`);
      if (el) el.textContent = `${nf.format(n)} réf.`;
    });
    leads = buildLeads();
    li = 0;
    renderAmb(false);
  });
})();
