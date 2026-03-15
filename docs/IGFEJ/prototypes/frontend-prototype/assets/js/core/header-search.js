function toggleHeaderSearch(forceOpen) {
  const expand = document.getElementById("header-search-expand");
  if (!expand) return;

  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : expand.classList.contains("hidden");
  window.setHeaderSearchOpen?.(shouldOpen);
}

function initializeHeaderSearch() {
  const button = document.getElementById("header-search-btn");
  if (!button || button.dataset.bound === "true") return;

  button.dataset.bound = "true";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHeaderSearch();
  });
}

Object.assign(window, {
  toggleHeaderSearch,
  initializeHeaderSearch,
});
