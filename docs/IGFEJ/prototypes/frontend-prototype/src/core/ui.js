function getTypeConfig(type) {
  const typeConfig = {
    process: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      label: "Processo",
      icon: "target",
    },
    subprocess: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Subprocesso",
      icon: "settings",
    },
  };

  return typeConfig[type] || typeConfig.subprocess;
}

function getIcon(iconName, size = 20) {
  const iconMap = {
    briefcase: "briefcase",
    users: "users",
    "clipboard-list": "clipboard",
    "alert-triangle": "alert-triangle",
    server: "server",
    "refresh-cw": "refresh-cw",
    search: "search",
    target: "target",
    settings: "settings",
    "file-text": "file-text",
    download: "download",
    bookmark: "bookmark",
    clock: "clock",
    "chevron-right": "chevron-right",
    "bar-chart": "bar-chart-2",
    "trending-up": "trending-up",
    activity: "activity",
    layers: "layers",
    "zoom-in": "zoom-in",
    "zoom-out": "zoom-out",
    "mouse-pointer": "mouse-pointer",
    move: "move",
    maximize: "maximize",
    monitor: "monitor",
    home: "home",
    user: "user",
  };

  return `<i data-feather="${iconMap[iconName] || "file-text"}" style="width: ${size}px; height: ${size}px;"></i>`;
}

function initializeFeather() {
  if (typeof feather !== "undefined") {
    feather.replace();
  }
}

function toggleCollapsible(contentId, iconId) {
  const content = document.getElementById(contentId);
  const icon = document.getElementById(iconId);
  if (!content || !icon) return;

  content.classList.toggle("hidden");
  icon.classList.toggle("rotate-180");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("sidebar-collapsed");
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.add("sidebar-collapsed");
  }
}

Object.assign(window, {
  getTypeConfig,
  getIcon,
  initializeFeather,
  toggleCollapsible,
  toggleSidebar,
  closeSidebar,
});
