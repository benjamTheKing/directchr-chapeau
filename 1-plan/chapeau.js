(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const UNIVERS = { textile: "Textile", mural: "Mural", sol: "Sol", mobilier: "Mobilier" };

  const C30 = Math.cos(Math.PI / 6);
  const S = 30;
  const W = 10.95;
  const D = 10;
  const H = 6.43;

  const DEFAULT_PAL = {
    oak: "#c9a27a", rug: "#d6cdbf", wallA: "#ece6dc", wallB: "#e3dccf", panel: "#b39470",
    glass: "#e8eef0", linen: "#f5f1ea", pillow: "#e8e1d4", wood: "#6e5240", woodDark: "#4c392c",
    brass: "#b38f5a", shade: "#efe7da",
  };

  const seg = (a, b) => [a, b];
  const range = (from, to, step) => {
    const out = [];
    for (let v = from; v < to - 1e-6; v += step) out.push(v);
    return out;
  };

  const SCENE = [
    { layer: "mural", k: "wallA", b: [-0.2, W, -0.2, 0, 0, H], faces: { t: "cap", x: "cap" }, flat: true,
      tex: () => [seg([0, 0, 0.28], [W, 0, 0.28])] },
    { layer: "mural", k: "wallB", b: [-0.2, 0, 0, D, 0, H], faces: { t: "cap", y: "cap" }, flat: true,
      tex: () => [seg([0, 0, 0.28], [0, 3.4, 0.28]), seg([0, 6.2, 0.28], [0, D, 0.28])] },
    { layer: "sol", k: "oak", b: [0, W, 0, D, -0.2, 0], faces: { x: "cap", y: "cap" }, flat: true,
      tex: () => {
        const out = [];
        const row = 0.62;
        range(row, D, row).forEach((y) => out.push(seg([0, y, 0], [W, y, 0])));
        range(0, D, row).forEach((y, k) => {
          range(((k * 1.73) % 2.9) + 0.4, W, 2.9).forEach((x) => out.push(seg([x, y, 0], [x, Math.min(y + row, D), 0])));
        });
        return out;
      } },
    { layer: "sol", k: "rug", b: [1.0, 8.7, 5.85, 9.6, 0, 0.05], flat: true,
      tex: ([x0, x1, y0, y1, , z1]) => {
        const i = 0.38;
        return [
          seg([x0 + i, y0 + i, z1], [x1 - i, y0 + i, z1]), seg([x1 - i, y0 + i, z1], [x1 - i, y1 - i, z1]),
          seg([x1 - i, y1 - i, z1], [x0 + i, y1 - i, z1]), seg([x0 + i, y1 - i, z1], [x0 + i, y0 + i, z1]),
        ];
      } },
    { layer: "mural", k: "panel", b: [1.4, 7.6, 0, 0.12, 0, 3.7],
      tex: ([x0, x1, , y1, z0, z1]) => range(x0 + 0.31, x1, 0.31).map((x) => seg([x, y1, z0], [x, y1, z1])) },
    { layer: "none", cls: "glass", k: "glass", b: [0, 0.04, 3.4, 6.2, 1.1, 5.7], flat: true,
      tex: () => [seg([0.04, 4.8, 1.1], [0.04, 4.8, 5.7]), seg([0.04, 3.4, 4.3], [0.04, 6.2, 4.3])] },
    { layer: "textile", pat: "fabric", b: [0.04, 0.34, 2.5, 3.4, 0.06, 6.2],
      tex: ([, x1, y0, y1, z0, z1]) => range(y0 + 0.18, y1, 0.2).map((y) => seg([x1, y, z0], [x1, y, z1])) },
    { layer: "textile", pat: "fabric", b: [0.04, 0.34, 6.2, 7.1, 0.06, 6.2],
      tex: ([, x1, y0, y1, z0, z1]) => range(y0 + 0.18, y1, 0.2).map((y) => seg([x1, y, z0], [x1, y, z1])) },
    { layer: "textile", pat: "fabric", b: [2.0, 7.0, 0.12, 0.45, 0, 2.9],
      tex: ([x0, x1, , y1, , z1]) => range(x0 + 0.42, x1, 0.42).map((x) => seg([x, y1, 0.55], [x, y1, z1])) },
    { layer: "mobilier", k: "wood", b: [0.7, 1.85, 0.15, 1.25, 0, 1.05],
      tex: ([x0, x1, y0, y1]) => [seg([x1, y0, 0.62], [x1, y1, 0.62]), seg([x0, y1, 0.62], [x1, y1, 0.62])] },
    { layer: "mobilier", k: "brass", b: [1.12, 1.42, 0.55, 0.85, 1.05, 1.7] },
    { layer: "mobilier", k: "shade", b: [0.95, 1.6, 0.38, 1.02, 1.7, 2.2] },
    { layer: "mobilier", k: "woodDark", b: [2.2, 6.8, 0.45, 5.7, 0, 0.5] },
    { layer: "textile", k: "linen", b: [2.3, 6.7, 0.45, 5.6, 0.5, 1.1],
      tex: ([x0, x1, , , , z1]) => [seg([x0, 1.85, z1], [x1, 1.85, z1])] },
    { layer: "textile", k: "pillow", b: [2.55, 4.35, 0.6, 1.35, 1.1, 1.5] },
    { layer: "textile", k: "pillow", b: [4.65, 6.45, 0.6, 1.35, 1.1, 1.5] },
    { layer: "textile", pat: "fabric", b: [2.25, 6.75, 4.1, 5.05, 0.72, 1.17] },
    { layer: "mobilier", k: "wood", b: [7.15, 8.3, 0.15, 1.25, 0, 1.05],
      tex: ([x0, x1, y0, y1]) => [seg([x1, y0, 0.62], [x1, y1, 0.62]), seg([x0, y1, 0.62], [x1, y1, 0.62])] },
    { layer: "mobilier", k: "brass", b: [7.58, 7.88, 0.55, 0.85, 1.05, 1.7] },
    { layer: "mobilier", k: "shade", b: [7.4, 8.05, 0.38, 1.02, 1.7, 2.2] },
    { layer: "mobilier", k: "wood", b: [0.6, 2.45, 6.6, 8.45, 0, 0.35] },
    { layer: "textile", pat: "fabric", b: [0.6, 0.98, 6.85, 8.2, 0.35, 1.8] },
    { layer: "mobilier", k: "wood", b: [0.6, 2.45, 6.6, 6.85, 0.35, 1.12] },
    { layer: "textile", pat: "fabric", b: [0.98, 2.45, 6.85, 8.2, 0.35, 0.8] },
    { layer: "mobilier", k: "wood", b: [0.6, 2.45, 8.2, 8.45, 0.35, 1.12] },
    { layer: "mobilier", k: "woodDark", b: [4.5, 6.1, 7.1, 8.1, 0, 0.38] },
    { layer: "mobilier", k: "wood", b: [4.3, 6.3, 6.9, 8.3, 0.38, 0.48] },
  ];

  const ANCHORS = {
    textile: { p: [0.34, 2.95, 4.7], dx: 14, side: "right" },
    mural: { p: [9.4, 0, 5.0], dx: -14, side: "left" },
    sol: { p: [9.6, 8.4, 0], dx: -14, side: "left" },
    mobilier: { p: [5.3, 7.6, 0.48], dx: 14, side: "right" },
  };

  function buildRoom(svg, { prefix, fabric, pal = DEFAULT_PAL, cotes = true }) {
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const iso = (x, y, z) => {
      const X = (x - y) * C30 * S;
      const Y = ((x + y) * 0.5 - z) * S;
      if (X < box.x0) box.x0 = X;
      if (X > box.x1) box.x1 = X;
      if (Y < box.y0) box.y0 = Y;
      if (Y > box.y1) box.y1 = Y;
      return [X, Y];
    };
    const f1 = (n) => n.toFixed(1);
    const pts = (list) => list.map((p) => iso(...p).map(f1).join(",")).join(" ");
    const faces = ([x0, x1, y0, y1, z0, z1]) => ({
      t: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      x: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],
      y: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
    });

    const order = {};
    let out = "";
    SCENE.forEach((it) => {
      const n = (order[it.layer] = (order[it.layer] ?? -1) + 1);
      const f = faces(it.b);
      const roles = { t: "c", x: "c", y: "c", ...it.faces };
      const paint = it.pat ? `fill="url(#${prefix}-${it.pat})"` : `style="fill:var(--k-${it.k})"`;
      let w = "";
      let c = "";
      let sh = "";
      let o = "";
      let caps = "";
      ["t", "x", "y"].forEach((k) => {
        const p = pts(f[k]);
        if (roles[k] === "cap") {
          caps += `<polygon class="cap" points="${p}"/>`;
          return;
        }
        w += `<polygon class="w" points="${p}"/>`;
        c += `<polygon class="c" points="${p}" ${paint}/>`;
        if (!it.flat && k !== "t") sh += `<polygon class="sh sh-${k}" points="${p}"/>`;
        o += `<polygon class="o" points="${p}"/>`;
      });
      const tx = (it.tex ? it.tex(it.b) : [])
        .map(([a, b]) => {
          const [ax, ay] = iso(...a);
          const [bx, by] = iso(...b);
          return `M${f1(ax)} ${f1(ay)}L${f1(bx)} ${f1(by)}`;
        })
        .join("");
      out += `<g class="el${it.cls ? ` ${it.cls}` : ""}" data-layer="${it.layer}" style="--d:${n * 55}ms">${w}${c}${sh}${o}${tx ? `<path class="tx" d="${tx}"/>` : ""}${caps}</g>`;
    });

    let dims = "";
    if (cotes) {
      const tick = ([x, y]) => `<path d="M${f1(x - 4)} ${f1(y + 4)}L${f1(x + 4)} ${f1(y - 4)}"/>`;
      const line = (a, b) => {
        const [ax, ay] = iso(...a);
        const [bx, by] = iso(...b);
        return `<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}"/>`;
      };
      const label = (p, text, anchor = "middle", dx = 0) => {
        const [x, y] = iso(...p);
        return `<text x="${f1(x + dx)}" y="${f1(y + 4)}" text-anchor="${anchor}">${text}</text>`;
      };
      const o1 = 1.0;
      dims += line([W + 0.25, 0, 0], [W + o1 + 0.2, 0, 0]) + line([W + 0.25, D, 0], [W + o1 + 0.2, D, 0]);
      dims += line([W + o1, 0, 0], [W + o1, D, 0]) + tick(iso(W + o1, 0, 0)) + tick(iso(W + o1, D, 0));
      dims += label([W + o1 + 0.75, D / 2, 0], "4,20 m");
      dims += line([0, D + 0.25, 0], [0, D + o1 + 0.2, 0]) + line([W, D + 0.25, 0], [W, D + o1 + 0.2, 0]);
      dims += line([0, D + o1, 0], [W, D + o1, 0]) + tick(iso(0, D + o1, 0)) + tick(iso(W, D + o1, 0));
      dims += label([W / 2, D + o1 + 0.75, 0], "4,60 m");
      dims += line([0, D + 0.25, H], [0, D + o1 + 0.2, H]);
      dims += line([0, D + o1, 0], [0, D + o1, H]) + tick(iso(0, D + o1, H));
      dims += label([0, D + o1, H / 2], "2,70 m", "end", -8);
      dims = `<g class="cote">${dims}</g>`;
    }

    const pad = 18;
    const vb = [box.x0 - pad - 40, box.y0 - pad, box.x1 - box.x0 + pad * 2 + 40, box.y1 - box.y0 + pad * 2];
    const defs = `<defs><pattern id="${prefix}-fabric" patternUnits="userSpaceOnUse" width="84" height="84"><image href="${fabric}" width="84" height="84" preserveAspectRatio="xMidYMid slice"/></pattern></defs>`;
    svg.setAttribute("viewBox", vb.map(f1).join(" "));
    svg.innerHTML = defs + out + dims;
    Object.entries(pal).forEach(([k, v]) => svg.style.setProperty(`--k-${k}`, v));
    return {
      vb,
      project: (p) => {
        const X = (p[0] - p[1]) * C30 * S;
        const Y = ((p[0] + p[1]) * 0.5 - p[2]) * S;
        return [((X - vb[0]) / vb[2]) * 100, ((Y - vb[1]) / vb[3]) * 100];
      },
      setFabric: (href) => svg.querySelector(`#${prefix}-fabric image`).setAttribute("href", href),
      setPal: (p) => Object.entries(p).forEach(([k, v]) => svg.style.setProperty(`--k-${k}`, v)),
      light: (layers) => $$(".el", svg).forEach((el) => el.classList.toggle("on", layers.includes(el.dataset.layer))),
    };
  }

  const stage = $("[data-stage]");
  const heroSvg = $('[data-room="hero"]');
  const hero = buildRoom(heroSvg, { prefix: "hr", fabric: "../assets/img/hero.jpg" });
  stage.style.aspectRatio = `${hero.vb[2]} / ${hero.vb[3]}`;

  const huds = {};
  $$("[data-hud]", stage).forEach((hud) => {
    const u = hud.dataset.hud;
    const a = ANCHORS[u];
    const [px, py] = hero.project(a.p);
    const pin = document.createElement("span");
    pin.className = "hud-pin";
    pin.style.setProperty("--u", `var(--u-${u})`);
    pin.style.left = `${px}%`;
    pin.style.top = `${py}%`;
    stage.insertBefore(pin, hud);
    hud.style.left = `calc(${px}% + ${a.dx}px)`;
    hud.style.top = `${py}%`;
    hud.style.setProperty("--ax", a.side === "left" ? "-100%" : "0%");
    huds[u] = { hud, pin };
  });

  const ALL = ["sol", "mural", "mobilier", "textile", "none"];
  const lit = new Set(["none"]);
  const reveal = (u) => {
    lit.add(u);
    hero.light([...lit]);
    if (huds[u]) {
      huds[u].hud.classList.add("is-in");
      huds[u].pin.classList.add("is-in");
    }
  };
  if (reduce) {
    ALL.forEach(reveal);
  } else {
    hero.light([...lit]);
    ["sol", "mural", "mobilier", "textile"].forEach((u, i) => setTimeout(() => reveal(u), 350 + i * 700));
  }

  let sticky = null;
  const highlight = (u) => {
    heroSvg.classList.toggle("room-hl", !!u);
    $$(".el", heroSvg).forEach((el) => el.classList.toggle("is-dim", !!u && el.dataset.layer !== u && el.dataset.layer !== "none"));
    Object.entries(huds).forEach(([k, { hud }]) => {
      hud.classList.toggle("is-hot", k === u);
      hud.classList.toggle("is-dim", !!u && k !== u);
    });
    $$(".uni-tab[data-u], .uni-stat, .uni-card").forEach((el) => el.classList.toggle("is-hot", el.dataset.u === u));
  };
  $$("[data-u], [data-hud]").forEach((el) => {
    const u = el.dataset.u || el.dataset.hud;
    const on = () => highlight(u);
    const off = () => highlight(sticky);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
  });

  const toastEl = $("[data-toast]");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-in"), 3600);
  };

  const PH = {
    tout: ["velours bleu non feu M1…", "moquette Cfl-s1 trafic intense…", "panneau acoustique chêne…", "fauteuil de chambre à recouvrir…"],
    textile: ["velours bleu non feu M1…", "occultant blanc 280 cm…", "bouclette écrue Martindale 50 000…"],
    mural: ["vinyle lessivable B-s2,d0…", "panneau acoustique chêne…"],
    sol: ["moquette Cfl-s1 trafic intense…", "parquet point de Hongrie…"],
    mobilier: ["chaise empilable hêtre…", "fauteuil de chambre à recouvrir…"],
  };
  let scope = "tout";
  let phIndex = 0;
  const inputs = $$("[data-rotate]");
  const setPlaceholder = () => {
    const list = PH[scope];
    inputs.forEach((i) => { i.placeholder = list[phIndex % list.length]; });
  };
  if (!reduce) {
    setInterval(() => {
      if (inputs.some((i) => i === document.activeElement || i.value)) return;
      phIndex += 1;
      setPlaceholder();
    }, 3200);
  }
  const note = $("[data-scope-note]");
  const setScope = (s) => {
    scope = s;
    phIndex = 0;
    setPlaceholder();
    $$("[data-scope]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.scope === s)));
    $$("[data-scope-select]").forEach((sel) => { sel.value = s; });
    $$("[data-scope-hidden]").forEach((h) => { h.value = s; });
    sticky = s === "tout" ? null : s;
    highlight(sticky);
    note.textContent = s === "tout" ? "" : `Recherche dans le catalogue ${UNIVERS[s].toLowerCase()}, directchr.com/${s}.`;
  };
  $$("[data-scope]").forEach((b) => b.addEventListener("click", () => setScope(b.dataset.scope)));
  $$("[data-scope-select]").forEach((sel) => sel.addEventListener("change", () => setScope(sel.value)));
  $$("[data-search]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = new FormData(form).get("q").toString().trim();
    location.href = `../recherche/?q=${encodeURIComponent(q)}${scope !== "tout" ? `&u=${scope}` : ""}`;
  }));

  $$("[data-matrix]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-matrix]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $("[data-matrix-table]").classList.toggle("show-norms", b.dataset.matrix === "norm");
  }));
  const ROW_SPACES = ["chambres", "couloirs", "lobby", "restaurant", "spa", "terrasse"];
  const COLS = ["textile", "mural", "sol", "mobilier"];
  $$("[data-matrix-table] tbody tr").forEach((tr, r) => {
    $$("td", tr).forEach((td, c) => {
      td.style.cursor = "pointer";
      td.dataset.u = COLS[c];
      td.addEventListener("click", () => {
        location.href = `../${COLS[c]}/?es=${ROW_SPACES[r]}`;
      });
    });
  });

  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const vb = 'viewBox="0 0 100 150" preserveAspectRatio="xMidYMid slice"';
  const BANDS = {
    enduit: () => `<svg ${vb}><filter id="fe-enduit"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="4" seed="3"/><feColorMatrix values="0 0 0 0 0.45 0 0 0 0 0.42 0 0 0 0 0.37 0 0 0 0.55 0"/></filter><rect width="100" height="150" fill="#e6dfd3"/><rect width="100" height="150" filter="url(#fe-enduit)"/></svg>`,
    lames: () => {
      let r = "";
      range(0, 100, 9).forEach((x) => {
        const l = 52 + rnd() * 10;
        r += `<rect x="${x}" y="0" width="7.4" height="150" fill="hsl(31 32% ${l.toFixed(0)}%)"/>`;
      });
      return `<svg ${vb}><rect width="100" height="150" fill="#5a4535"/>${r}</svg>`;
    },
    arches: () => {
      let p = "";
      range(0, 150, 22).forEach((y, j) => range(j % 2 ? -8 : 0, 100, 16).forEach((x) => {
        p += `M${x + 2} ${y + 20}v-10a6 6 0 0 1 12 0v10`;
      }));
      return `<svg ${vb}><rect width="100" height="150" fill="#dcd4c4"/><path d="${p}" fill="none" stroke="#9c8f7a" stroke-width="1.1"/></svg>`;
    },
    parquet: () => {
      let r = "";
      const cw = 12.5;
      const ph = 9;
      range(0, 100, cw).forEach((x, i) => {
        const a = i % 2 ? 7 : 0;
        const b = i % 2 ? 0 : 7;
        range(-14, 160, ph).forEach((y) => {
          const l = 48 + rnd() * 14;
          r += `<polygon points="${x},${y + a} ${x + cw},${y + b} ${x + cw},${y + b + ph} ${x},${y + a + ph}" fill="hsl(29 40% ${l.toFixed(0)}%)" stroke="rgba(60,35,15,.35)" stroke-width=".5"/>`;
        });
      });
      return `<svg ${vb}>${r}</svg>`;
    },
    moquette: () => `<svg ${vb}><filter id="fe-moq"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 0.97 0 0 0 0 0.92 0 0 0 0.9 -0.32"/></filter><rect width="100" height="150" fill="#8a7f73"/><rect width="100" height="150" filter="url(#fe-moq)"/><line x1="0" y1="96" x2="100" y2="96" stroke="rgba(0,0,0,.18)" stroke-width=".8"/></svg>`,
    terrazzo: () => {
      const cols = ["#b9a58e", "#8c7a6b", "#d2c3ad", "#6f6a63", "#a8714c", "#c9b8a2", "#4f4a45"];
      let r = "";
      for (let i = 0; i < 170; i += 1) {
        const x = rnd() * 100;
        const y = rnd() * 150;
        const s = 0.8 + rnd() * 3.6;
        const c = cols[Math.floor(rnd() * cols.length)];
        const n = 3 + Math.floor(rnd() * 3);
        const pts = range(0, n, 1).map((k) => {
          const ang = (k / n) * Math.PI * 2 + rnd() * 0.8;
          const rr = s * (0.6 + rnd() * 0.5);
          return `${(x + Math.cos(ang) * rr).toFixed(1)},${(y + Math.sin(ang) * rr).toFixed(1)}`;
        }).join(" ");
        r += `<polygon points="${pts}" fill="${c}"/>`;
      }
      return `<svg ${vb}><rect width="100" height="150" fill="#ebe5db"/>${r}</svg>`;
    },
    chaise: () => furniture("chaise", "velours", `
      <path class="ln" d="M33 134 L35 93 M67 134 L65 93"/>
      <path class="up" d="M29 88 H71 V95 H29 Z"/>
      <path class="up" d="M33 88 L31 44 Q50 39 69 44 L67 88 Z"/>
      ${dim(86, 42, 86, 134, "H 82", true)}${dim(29, 143, 71, 143, "L 48")}`),
    fauteuil: () => furniture("fauteuil", "chenille", `
      <path class="ln" d="M20 134 L22 108 M80 134 L78 108"/>
      <path class="up" d="M18 92 H82 V108 H18 Z"/>
      <path class="up" d="M26 92 L26 48 Q50 42 74 48 L74 92 Z"/>
      <path class="up" d="M13 72 H27 V108 H13 Z M73 72 H87 V108 H73 Z"/>
      ${dim(94, 48, 94, 134, "H 76", true)}${dim(13, 143, 87, 143, "L 74")}`),
    table: () => furniture("table", null, `
      <path class="wd" d="M18 76 H82 V82 H18 Z"/>
      <path class="ln" d="M48 82 V128 M52 82 V128"/>
      <path class="wd" d="M32 128 H68 V133 H32 Z"/>
      ${dim(90, 76, 90, 133, "H 74", true)}${dim(18, 143, 82, 143, "Ø 60")}`),
  };
  function dim(x1, y1, x2, y2, t, vertical = false) {
    const tx = vertical ? `<text x="${x1 + 3}" y="${(y1 + y2) / 2}" transform="rotate(-90 ${x1 + 3} ${(y1 + y2) / 2})" text-anchor="middle" dy="-1">${t}</text>`
      : `<text x="${(x1 + x2) / 2}" y="${y1 - 2.5}" text-anchor="middle">${t}</text>`;
    return `<g class="dm"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><path d="M${x1 - 2} ${y1 + 2}L${x1 + 2} ${y1 - 2}M${x2 - 2} ${y2 + 2}L${x2 + 2} ${y2 - 2}"/>${tx}</g>`;
  }
  function furniture(id, img, body) {
    const pat = img ? `<pattern id="pt-${id}" patternUnits="userSpaceOnUse" width="40" height="40"><image href="../assets/img/${img}.jpg" width="40" height="40" preserveAspectRatio="xMidYMid slice"/></pattern>` : "";
    const up = body.replaceAll('class="up"', `class="up" fill="${img ? `url(#pt-${id})` : "#fff"}"`);
    return `<svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet"><defs>${pat}</defs>${up}</svg>`;
  }
  $$("[data-band]").forEach((el) => {
    const make = BANDS[el.dataset.band];
    if (make) el.insertAdjacentHTML("afterbegin", make());
  });

  const accordSvg = $('[data-room="accord"]');
  const accord = buildRoom(accordSvg, { prefix: "ac", fabric: "../assets/img/velours.jpg", cotes: false });
  accord.light(ALL);

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const hex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  const toHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  };
  const fromHsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    };
    return hex(f(0), f(8), f(4));
  };
  const darker = (h, k) => {
    const [hh, s, l] = toHsl(...hexToRgb(h));
    return fromHsl(hh, s, Math.max(0.05, l - k));
  };

  const pick = $("[data-swatches]");
  const tabs = $$("[data-acc-tab]");
  if (window.DCHR) {
    DCHR.load().then((data) => {
      const lists = {};
      DCHR.U_ORDER.forEach((u) => {
        const byCat = {};
        data.by[u].forEach((p) => { (byCat[p.cat] = byCat[p.cat] || []).push(p); });
        const cats = Object.values(byCat);
        const out = [];
        for (let i = 0; out.length < 10 && i < 20; i += 1) cats.forEach((c) => { if (c[i] && out.length < 10) out.push(c[i]); });
        lists[u] = out;
      });
      let source = "textile";
      const apply = (p) => {
        const base = p.c[0].h;
        const [h, sat, l] = toHsl(...hexToRgb(base));
        const matches = DCHR.accordsFor(p, data, 1);
        const pickU = (u) => (u === p.u ? { p, ci: 0 } : matches[u][0]);
        const tx = pickU("textile");
        const mu = pickU("mural");
        const so = pickU("sol");
        const mo = pickU("mobilier");
        const wall = mu.p.c[mu.ci].h;
        const floor = so.p.c[so.ci].h;
        const wood = mo.p.c[mo.ci].h;
        const pal = {
          ...DEFAULT_PAL,
          wallA: wall,
          wallB: darker(wall, 0.035),
          panel: fromHsl(30 + ((((h - 30 + 540) % 360) - 180) * 0.12), 0.3, l > 0.55 ? 0.5 : 0.66),
          oak: floor,
          rug: fromHsl(h, Math.min(sat, 0.2) * 0.6, (l + 0.84) / 2),
          wood,
          woodDark: darker(wood, 0.08),
        };
        accord.setFabric(DCHR.swatch(tx.p, tx.ci));
        accord.setPal(pal);
        [["textile", tx], ["mural", mu], ["sol", so], ["mobilier", mo]].forEach(([u, m]) => {
          const chip = $(`[data-link="${u}"]`);
          chip.href = DCHR.productUrl(m.p, m.ci);
          $(".sw", chip).style.setProperty("--c", `url("${DCHR.swatch(m.p, m.ci)}")`);
          $(`[data-m="${u}"]`).textContent = `${m.p.t} · ${m.p.c[m.ci].n}\n${m.p.catName}`;
          chip.classList.toggle("is-source", u === p.u);
        });
      };
      const render = (u) => {
        source = u;
        tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.accTab === u)));
        pick.innerHTML = lists[u].map((p, i) => `<button class="sw-btn" type="button" data-i="${i}" aria-pressed="${i === 0}"><img src="${DCHR.swatch(p, 0)}" alt="" loading="lazy"><span class="n">${DCHR.esc(p.t)}</span><span class="f">${DCHR.esc(p.catName)}</span></button>`).join("");
        $$(".sw-btn", pick).forEach((b) => b.addEventListener("click", () => {
          $$(".sw-btn", pick).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          apply(lists[source][Number(b.dataset.i)]);
        }));
        apply(lists[u][0]);
      };
      tabs.forEach((t) => t.addEventListener("click", () => render(t.dataset.accTab)));
      render("textile");
    });
  }

  if (fine && !reduce) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  if (window.DCHR) {
    DCHR.load().then((data) => {
      ["textile", "mural", "sol", "mobilier"].forEach((u) => {
        const st = data.stats[u];
        const v = $(`[data-stat="${u}"]`);
        const s = $(`[data-stock="${u}"]`);
        if (v) v.innerHTML = `${DCHR.nf.format(st.products)}<small>produits</small>`;
        if (s) s.textContent = `${DCHR.qty(st.stock, DCHR.UNIVERS[u].unit)} en stock`;
      });
    });
  }
})();
