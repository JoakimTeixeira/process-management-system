const DYNAMIC_VIEW_IDS = [
  "process-list-view",
  "process-detail-view",
  "subprocess-detail-view",
  "asset-detail-view",
];

function getContentArea() {
  return document.getElementById("content-area");
}

function clearDynamicViews() {
  DYNAMIC_VIEW_IDS.forEach((viewId) => document.getElementById(viewId)?.remove());
}

function hideStaticSections() {
  getContentArea()
    ?.querySelectorAll(".content-section")
    .forEach((section) => section.classList.add("hidden"));
}

function renderDynamicView(viewId, html) {
  const contentArea = getContentArea();
  if (!contentArea) return null;

  clearDynamicViews();
  hideStaticSections();

  const view = document.createElement("div");
  view.className = "content-section";
  view.id = viewId;
  view.innerHTML = html;
  contentArea.appendChild(view);
  view.classList.remove("hidden");
  window.initializeFeather?.();
  return view;
}

function showBreadcrumbTrail(items) {
  const breadcrumb = document.getElementById("breadcrumb");
  if (!breadcrumb) return;

  window.updateBreadcrumb?.(items);
  breadcrumb.classList.remove("hidden");
}

function hideBreadcrumb() {
  document.getElementById("breadcrumb")?.classList.add("hidden");
}

Object.assign(window, {
  renderDynamicView,
  clearDynamicViews,
  hideStaticSections,
  showBreadcrumbTrail,
  hideBreadcrumb,
});
