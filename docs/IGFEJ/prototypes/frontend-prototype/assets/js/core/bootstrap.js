function setupEventListeners() {
  document.getElementById("mobile-menu-button")?.addEventListener("click", toggleSidebar);

  document.addEventListener(
    "click",
    (event) => {
      const hashLink = event.target.closest('a[href="#"], a[href^="#"]');
      if (hashLink) event.preventDefault();

      const control = event.target.closest("input, select, textarea, button");
      const accidentalAnchor = control?.closest('a[href^="#"]');
      if (control && accidentalAnchor) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") window.hideSearchResults?.();
  });

  document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("macroprocess-dropdown");
    const button = document.getElementById("macroprocess-dropdown-btn");
    if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
      closeMacroprocessDropdown();
    }
  });

  window.initializeSearch?.();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    renderAppLayout?.();
    initializeHeaderSearch?.();
    await loadJSONData();
    AppState.currentView = "welcome";

    setupEventListeners();
    renderNavigation();
    renderFeaturedProcesses();
    renderFAQ();
    renderMethodology();
    updateStatistics();
    initializeTables?.();
    initializeSidebarState();
    applyRoute(parseCurrentRoute(), true);

    window.addEventListener("hashchange", () => applyRoute(parseCurrentRoute()));
    window.addEventListener("resize", initializeSidebarState);
  } catch (error) {
    console.error("Failed to initialize app:", error);
    window.navigateToSection("welcome", { updateHash: false });
    updateHash({ type: "section", id: "welcome" }, true);
  }
});
