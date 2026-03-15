const DESKTOP_NAV_ITEMS = [
  { id: "nav-welcome", hash: "welcome", label: "Início" },
  { id: "nav-introduction", hash: "introduction", label: "Introdução" },
  { id: "nav-dashboard", hash: "dashboard", label: "Dashboard" },
  { id: "nav-methodology", hash: "methodology", label: "Metodologia" },
  { id: "nav-faq", hash: "faq", label: "FAQ" },
];

const MOBILE_NAV_ITEMS = [
  { hash: "introduction", label: "Introdução", icon: "info" },
  { hash: "dashboard", label: "Dashboard", icon: "bar-chart-2" },
  { hash: "methodology", label: "Metodologia", icon: "layout" },
  { hash: "faq", label: "FAQ", icon: "book-open" },
];

function navAnchor(item, mobile = false) {
  const classes = mobile
    ? "nav-tab flex items-center rounded-md px-3 py-2 text-sm text-govpt-gray transition-colors hover:bg-govpt-light hover:text-govpt-primary"
    : "nav-tab block px-4 py-3 font-medium text-white transition-colors hover:bg-govpt-secondary";
  const icon = mobile ? `<i data-feather="${item.icon}" class="mr-3 h-4 w-4"></i>` : "";
  const id = item.id ? `id="${item.id}"` : "";
  return `<button type="button" ${id} onclick="navigateToSection('${item.hash}')" class="${classes}">${icon}${item.label}</button>`;
}

function getDesktopNavTemplate() {
  return `
    <nav class="bg-govpt-primary text-white">
      <div class="max-w-govpt-container mx-auto px-4">
        <div class="navigation-options hidden items-center space-x-1 md:flex">
          ${DESKTOP_NAV_ITEMS.slice(0, 3).map((item) => navAnchor(item)).join("")}
          <div class="relative">
            <button
              type="button"
              id="macroprocess-dropdown-btn"
              class="flex items-center px-4 py-3 font-medium text-white transition-colors hover:bg-govpt-secondary"
              onclick="toggleMacroprocessDropdown()"
            >
              <span>Macroprocessos</span>
              <i data-feather="chevron-down" class="ml-1 h-4 w-4 transition-transform duration-200"></i>
            </button>
            <div id="macroprocess-dropdown" class="absolute left-0 top-full z-50 mt-1 hidden w-64 rounded-lg border border-govpt-border bg-white">
              <div class="py-2"><div id="desktop-macroprocess-nav" class="space-y-1"></div></div>
            </div>
          </div>
          ${DESKTOP_NAV_ITEMS.slice(3).map((item) => navAnchor(item)).join("")}
        </div>
      </div>
    </nav>
  `;
}

function getSidebarTemplate() {
  return `
    <aside id="sidebar" class="sidebar-fixed sidebar-collapsed border-r border-govpt-border bg-white md:hidden">
      <nav class="sidebar p-4 space-y-6">
        <div>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-govpt-gray">Macroprocessos</h3>
          <div id="macroprocess-nav" class="space-y-1"></div>
        </div>
        <div>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-govpt-gray">Navegação Rápida</h3>
          <div class="space-y-1">${MOBILE_NAV_ITEMS.map((item) => navAnchor(item, true)).join("")}</div>
        </div>
      </nav>
    </aside>
  `;
}

Object.assign(window, {
  getDesktopNavTemplate,
  getSidebarTemplate,
});
