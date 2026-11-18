(() => {
  const SRC = document.currentScript ? document.currentScript.src : location.href;
  const ROOT = new URL("../", SRC).href;
  const LIST = [
    ["1-plan", "1", "Le plan"],
    ["2-hotel", "2", "L'hôtel en coupe"],
    ["3-materiautheque", "3", "La matériauthèque"],
    ["4-comptoir", "4", "Le comptoir"],
  ];
  const first = location.pathname.split("/").filter(Boolean)[0] || "";
  const inProp = LIST.some(([dir]) => dir === first);
  let current = first;
  if (inProp) {
    try { localStorage.setItem("dchr-prop", first); } catch { }
  } else {
    const q = new URLSearchParams(location.search).get("prop");
    try { current = q || localStorage.getItem("dchr-prop") || ""; } catch { current = q || ""; }
  }
  const css = `
.proto-switch { position: fixed; z-index: 70; left: max(12px, env(safe-area-inset-left, 0px)); bottom: max(12px, env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 2px; padding: 4px; border-radius: 999px; background: rgba(17, 17, 17, 0.92); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.5); font: 500 12px/1 "Geist", "Helvetica Neue", Arial, sans-serif; max-width: calc(100vw - 24px); overflow-x: auto; scrollbar-width: none; }
.proto-switch::-webkit-scrollbar { display: none; }
.proto-switch a { display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 11px; border-radius: 999px; color: #d8d1c6; white-space: nowrap; text-decoration: none; transition: background-color 160ms ease, color 160ms ease; }
.proto-switch a b { font: 600 11px/1 "Geist Mono", ui-monospace, monospace; color: #8c7a6b; }
.proto-switch a[aria-current="page"] { background: #f3efe9; color: #111; }
.proto-switch a[aria-current="page"] b { color: #111; }
.proto-switch .ps-home { color: #a39b90; padding-right: 8px; }
@media (hover: hover) and (pointer: fine) { .proto-switch a:not([aria-current="page"]):hover { background: rgba(255, 255, 255, 0.1); color: #fff; } }
@media (max-width: 640px) { .proto-switch a:not([aria-current="page"]) span { display: none; } .proto-switch .ps-home { display: none; } }
`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  const nav = document.createElement("nav");
  nav.className = "proto-switch";
  nav.setAttribute("aria-label", "Propositions");
  nav.innerHTML = `<a class="ps-home" href="${ROOT}">Propositions</a>${LIST.map(([dir, n, t]) => `<a href="${ROOT}${dir}/"${dir === current ? ' aria-current="page"' : ""}><b>${n}</b><span>${t}</span></a>`).join("")}`;
  document.body.append(nav);
})();
