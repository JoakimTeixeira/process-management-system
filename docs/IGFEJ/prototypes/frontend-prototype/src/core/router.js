const SECTION_ANCHORS = {
  "dashboard-overview": "dashboard",
  "dashboard-macroprocesses": "dashboard",
  "dashboard-processes": "dashboard",
  "dashboard-subprocesses": "dashboard",
  "dashboard-diagrams": "dashboard",
  "introduction-overview": "introduction",
  "introduction-contact": "introduction",
  "faq-overview": "faq",
};

function buildHash(route) {
  if (!route) return "#welcome";
  if (typeof route === "string") return `#${route.replace(/^#/, "") || "welcome"}`;
  if (route.type === "section") {
    if (route.anchor) return `#${route.anchor}`;
    const sectionId = route.id === "homepage" ? "dashboard" : route.id;
    return `#${sectionId || "welcome"}`;
  }
  if (route.type === "macroprocess" && route.id) return `#macroprocess/${route.id}`;
  if (route.type === "process" && route.id) {
    const tab = route.tab ? getRouteTabName(route.tab, PROCESS_TAB_ROUTE_NAMES) : "";
    return `#process/${route.id}${tab ? `/${tab}` : ""}`;
  }
  if (route.type === "subprocess" && route.id) {
    const tab = route.tab ? getRouteTabName(route.tab, SUBPROCESS_TAB_ROUTE_NAMES) : "";
    return `#subprocess/${route.id}${tab ? `/${tab}` : ""}`;
  }
  if (route.type === "asset" && route.id) return `#asset/${route.id}`;
  return "#welcome";
}

function updateHash(route, replace = false) {
  const hash = buildHash(route);
  if (window.location.hash === hash) return;
  history[replace ? "replaceState" : "pushState"](null, "", hash);
}

function parseCurrentRoute() {
  const rawHash = window.location.hash.replace(/^#/, "").trim();
  if (!rawHash) return { type: "section", id: "welcome" };
  if (SECTION_ANCHORS[rawHash]) return { type: "section", id: SECTION_ANCHORS[rawHash], anchor: rawHash };

  const [routeType, routeId, routeTab] = rawHash.split("/");
  if (!routeId) {
    const sectionId = routeType === "homepage" ? "dashboard" : routeType;
    return { type: "section", id: sectionId };
  }
  if (["macroprocess", "process", "subprocess", "asset"].includes(routeType)) {
    return { type: routeType, id: routeId, tab: routeTab || null };
  }
  return { type: "section", id: rawHash };
}

function getAnchorOffset() {
  const header = document.querySelector("header");
  const desktopNav = document.querySelector("nav.bg-govpt-primary");
  const breadcrumb = document.getElementById("breadcrumb");
  const spacing = 16;
  return [header, desktopNav, breadcrumb]
    .filter((element) => element && !element.classList.contains("hidden"))
    .reduce((total, element) => total + element.getBoundingClientRect().height, spacing);
}

function scrollToAnchor(anchorId) {
  const target = document.getElementById(anchorId);
  if (!target) return;
  requestAnimationFrame(() => {
    const top = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
}

function navigateToSectionAnchor(sectionId, anchorId, options = {}) {
  const { updateHash: shouldUpdateHash = true } = options;
  window.navigateToSection(sectionId, { updateHash: false, skipScroll: true });
  scrollToAnchor(anchorId);
  if (shouldUpdateHash) updateHash({ type: "section", id: sectionId, anchor: anchorId });
}

function applyRoute(route, replace = false) {
  if (!route) {
    window.navigateToSection("welcome", { updateHash: false });
    if (replace) updateHash({ type: "section", id: "welcome" }, true);
    return;
  }

  if (route.type === "macroprocess") return navigateToMacroprocess(route.id, { updateHash: false });
  if (route.type === "process") {
    return showProcessDetail(route.id, {
      updateHash: false,
      activeTab: getInternalTabName(route.tab || "overview", PROCESS_TAB_ROUTE_NAMES),
    });
  }
  if (route.type === "subprocess") {
    const subprocessTab = route.tab === "overview" ? "details" : route.tab || "details";
    return showSubprocessDetail(route.id, {
      updateHash: false,
      activeTab: getInternalTabName(subprocessTab, SUBPROCESS_TAB_ROUTE_NAMES),
    });
  }
  if (route.type === "asset") return showAssetDetail(route.id, { updateHash: false });

  const routeId = route.id === "homepage" ? "dashboard" : route.id;
  if (route.anchor) {
    navigateToSectionAnchor(routeId, route.anchor, { updateHash: false });
    if (replace) updateHash({ type: "section", id: routeId, anchor: route.anchor }, true);
    return;
  }

  const sectionId = routeId && document.getElementById(routeId) ? routeId : "welcome";
  window.navigateToSection(sectionId, { updateHash: false });
  if (replace && sectionId !== route.id) updateHash({ type: "section", id: sectionId }, true);
}

function highlightDropdownItem(macroprocessId) {
  document.querySelectorAll(".macro-dropdown-item").forEach((item) => {
    item.classList.remove("bg-igfej-light", "text-igfej-blue", "font-medium");
    item.classList.add("text-gray-700");
  });

  const selectedItem = document.getElementById(`dropdown-item-${macroprocessId}`);
  if (selectedItem) {
    selectedItem.classList.remove("text-gray-700");
    selectedItem.classList.add("bg-igfej-light", "text-igfej-blue", "font-medium");
  }
}

function clearDropdownHighlight() {
  document.querySelectorAll(".macro-dropdown-item").forEach((item) => {
    item.classList.remove("bg-igfej-light", "text-igfej-blue", "font-medium");
    item.classList.add("text-gray-700");
  });
}

function syncNavigationState() {
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.remove("active"));
  document.getElementById("macroprocess-dropdown-btn")?.classList.remove("active");

  if (["process-list", "process-detail", "subprocess-detail", "asset-detail"].includes(AppState.currentView)) {
    document.getElementById("macroprocess-dropdown-btn")?.classList.add("active");
    const activeMacroprocessId = AppState.currentMacroprocessId || AppState.currentProcess?.macroprocess_id;
    if (activeMacroprocessId) highlightDropdownItem(activeMacroprocessId);
    return;
  }

  const activeTabId = AppState.currentView === "welcome" ? "nav-welcome" : `nav-${AppState.currentView}`;
  document.getElementById(activeTabId)?.classList.add("active");
}

function getBreadcrumbForSection(sectionId) {
  const map = {
    welcome: ["Início"],
    dashboard: ["Início", "Dashboard de Processos"],
    introduction: ["Início", "Introdução"],
    methodology: ["Início", "Metodologia"],
    faq: ["Início", "Perguntas Frequentes"],
    "process-list": ["Início", "Processos"],
    "process-detail": ["Início", "Processos", AppState.currentProcess?.title || "Detalhes"],
  };
  return map[sectionId] || ["Início"];
}

function updateBreadcrumb(items) {
  const breadcrumb = document.getElementById("breadcrumb");
  if (!breadcrumb) return;

  breadcrumb.innerHTML = items
    .map((item, index) =>
      index === items.length - 1
        ? `<span class="text-gray-900">${item}</span>`
        : `<a href="javascript:void(0)" onclick="handleBreadcrumbClick(${index})" class="hover:text-igfej-blue">${item}</a>`,
    )
    .join('<span class="mx-2 text-gray-400">/</span>');
}

function handleBreadcrumbClick(index) {
  if (index === 0) return showHomepage();
  if (index === 1) return AppState.currentProcess ? navigateToMacroprocess(AppState.currentProcess.macroprocess_id) : showHomepage();
  if (index >= 2) return AppState.currentProcess ? showProcessDetail(AppState.currentProcess.id) : showHomepage();
}

function toggleMacroprocessDropdown() {
  const dropdown = document.getElementById("macroprocess-dropdown");
  const arrow = document.getElementById("macroprocess-dropdown-btn")?.querySelector("svg");
  if (!dropdown || !arrow) return;
  dropdown.classList.toggle("hidden");
  arrow.classList.toggle("rotate-180");
}

function closeMacroprocessDropdown() {
  const dropdown = document.getElementById("macroprocess-dropdown");
  const arrow = document.getElementById("macroprocess-dropdown-btn")?.querySelector("svg");
  if (!dropdown || !arrow) return;
  dropdown.classList.add("hidden");
  arrow.classList.remove("rotate-180");
}

function initializeSidebarState() {
  document.getElementById("sidebar")?.classList.add("sidebar-collapsed");
  AppState.sidebarOpen = false;
  syncNavigationState();
}

function showHomepage() {
  window.navigateToSection("welcome");
}

function showDashboard() {
  window.navigateToSection("dashboard");
}

window.navigateToSection = function navigateToSection(sectionId, options = {}) {
  const { updateHash: shouldUpdateHash = true, skipScroll = false } = options;
  const targetId = sectionId === "homepage" ? "dashboard" : sectionId;
  const section = document.getElementById(targetId);
  if (!section) return;
  const isSameSection = AppState.currentView === targetId;

  window.closeHeaderSearchOnNavigation?.();
  if (targetId === "welcome") document.getElementById("search-results")?.classList.add("hidden");

  document.querySelectorAll(".content-section").forEach((item) => item.classList.add("hidden"));
  section.classList.remove("hidden");
  AppState.currentView = targetId;
  AppState.currentMacroprocessId = null;
  syncNavigationState();

  const dropdownButton = document.getElementById("macroprocess-dropdown-btn");
  if (dropdownButton && ["welcome", "dashboard", "methodology", "faq", "introduction"].includes(targetId)) {
    dropdownButton.classList.remove("active");
    clearDropdownHighlight();
  }

  if (targetId === "welcome") hideBreadcrumb();
  else showBreadcrumbTrail(getBreadcrumbForSection(targetId));

  if (window.innerWidth < 768) closeSidebar();
  closeMacroprocessDropdown();
  if (!skipScroll && !isSameSection) window.scrollTo({ top: 0, behavior: "smooth" });
  if (shouldUpdateHash) updateHash({ type: "section", id: targetId });
};

Object.assign(window, {
  buildHash,
  updateHash,
  parseCurrentRoute,
  applyRoute,
  navigateToSectionAnchor,
  syncNavigationState,
  highlightDropdownItem,
  clearDropdownHighlight,
  getBreadcrumbForSection,
  updateBreadcrumb,
  handleBreadcrumbClick,
  toggleMacroprocessDropdown,
  closeMacroprocessDropdown,
  initializeSidebarState,
  showHomepage,
  showDashboard,
});

window.toggleMacroprocessDropdown = toggleMacroprocessDropdown;
window.closeMacroprocessDropdown = closeMacroprocessDropdown;
