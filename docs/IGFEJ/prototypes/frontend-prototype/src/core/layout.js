function renderAppLayout() {
  const root = document.getElementById("app-root");
  if (!root || root.dataset.rendered === "true") return;

  root.innerHTML = window.getAppShell?.() || "";
  root.dataset.rendered = "true";
  window.initializeFeather?.();
}

window.renderAppLayout = renderAppLayout;
