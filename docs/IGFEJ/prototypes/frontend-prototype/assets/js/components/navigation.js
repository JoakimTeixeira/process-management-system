function renderNavigation() {
  const navContainer = document.getElementById("macroprocess-nav");
  if (navContainer) {
    navContainer.innerHTML = AppState.macroprocesses.map(
      (macro) => `
        <div class="mb-2">
          <button onclick="navigateToMacroprocess('${macro.id}')" class="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-igfej-light hover:text-igfej-blue rounded-md transition-colors">
            <span class="mr-3 text-lg">${getIcon(macro.icon || "layers", 20)}</span>
            <div class="flex-1 text-left"><div class="font-medium">${macro.title}</div></div>
            ${getIcon("chevron-right", 16)}
          </button>
        </div>
      `,
    ).join("");
  }

  const desktopNavContainer = document.getElementById("desktop-macroprocess-nav");
  if (desktopNavContainer) {
    desktopNavContainer.innerHTML = AppState.macroprocesses.map(
      (macro) => `
        <button type="button" id="dropdown-item-${macro.id}" onclick="navigateToMacroprocess('${macro.id}')" class="macro-dropdown-item block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-igfej-light hover:text-igfej-blue transition-colors">
          <div class="flex items-center"><span class="mr-3">${getIcon(macro.icon || "layers", 16)}</span><span>${macro.title}</span></div>
        </button>
      `,
    ).join("");
  }

  window.initializeFeather?.();
}

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes <= 1) return "Agora";
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return hours === 1 ? "1 hora atrás" : `${hours} horas atrás`;
  }

  const diffDays = Math.floor(diffMinutes / 1440);
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} semana${weeks === 1 ? "" : "s"} atrás`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mês${months === 1 ? "" : "es"} atrás`;
  }

  const years = Math.floor(diffDays / 365);
  return `${years} ano${years === 1 ? "" : "s"} atrás`;
}

function createRecentItemCard(item) {
  const config = getTypeConfig(item.type);
  const isSubprocess = item.type === "subprocess";
  const details = isSubprocess
    ? `<div class="mt-2 text-xs text-gray-500"><div class="flex items-center">${getIcon("home", 12)}Pai: ${item.parent_process_code}</div></div>`
    : item.subprocess_count > 0
      ? `<div class="mt-2 text-xs text-gray-500"><div class="flex items-center">${getIcon("layers", 12)}${item.subprocess_count} subprocesso${item.subprocess_count !== 1 ? "s" : ""}</div></div>`
      : "";

  return `
    <div class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-igfej-blue" onclick="${isSubprocess ? `showSubprocessDetail('${item.id}')` : `showProcessDetail('${item.id}')`}">
      <div class="flex flex-col h-full">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center mb-1"><span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">${isSubprocess ? "Subprocesso" : "Processo"}</span></div>
            <h4 class="font-semibold text-gray-900 mb-2">${item.code}: ${item.title}</h4>
            <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
            ${details}
          </div>
          ${getIcon("chevron-right", 16)}
        </div>
        <div class="mt-auto pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>${getMacroprocessTitle(item.macroprocess_id)}</span>
            <span class="flex items-center">${getIcon("clock", 12)}${getRelativeTime(item.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedProcesses() {
  const container = document.getElementById("featured-processes");
  if (!container) return;

  const allItems = AppState.processes.flatMap((process) => {
    const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
    const processItem = {
      id: process.id,
      code: process.code,
      title: process.title,
      type: "process",
      macroprocess_id: process.macroprocess_id,
      updated_at: process.updated_at,
      subprocess_count: currentVersion?.subprocesses?.length || 0,
      description: currentVersion?.subprocesses?.length ? `Processo com ${currentVersion.subprocesses.length} subprocessos` : process.title || "Processo",
    };

    const subprocessItems = currentVersion?.subprocesses?.map((subprocess) => ({
      id: subprocess.id,
      code: getDisplayCode(subprocess),
      title: subprocess.title,
      type: "subprocess",
      parent_process_id: process.id,
      parent_process_title: process.title,
      parent_process_code: process.code,
      macroprocess_id: process.macroprocess_id,
      updated_at: subprocess.updated_at || process.updated_at,
      description: subprocess.description || `Subprocesso de ${process.title}`,
    })) || [];

    return [processItem, ...subprocessItems];
  });

  const recentItems = allItems.sort((left, right) => {
    const a = parseInt(left.code.replace(/[^0-9]/g, ""), 10) || 0;
    const b = parseInt(right.code.replace(/[^0-9]/g, ""), 10) || 0;
    if (a && b) return a - b;
    if (a && !b) return -1;
    if (!a && b) return 1;
    return left.code.localeCompare(right.code);
  }).slice(0, 3);

  container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${recentItems.map((item) => createRecentItemCard(item)).join("")}</div>`;
  window.initializeFeather?.();
}

function createProcessCard(process) {
  const config = getTypeConfig("process");
  const currentVersion = process.versions?.find((version) => version.id === process.current_version_id);
  const description = currentVersion?.subprocesses?.length ? `Processo com ${currentVersion.subprocesses.length} subprocessos` : process.title || "Processo";

  return `
    <div class="process-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer" onclick="showProcessDetail('${process.id}')">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <div class="flex items-center mb-1"><span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">${config.label}</span></div>
          <h4 class="font-semibold text-gray-900 mb-2">${process.code}: ${process.title}</h4>
          <p class="text-sm text-gray-600 line-clamp-2">${description}</p>
        </div>
        ${createChevron("right", "", "")}
      </div>
      <div class="flex items-center justify-between text-xs text-gray-500"><span>${getMacroprocessTitle(process.macroprocess_id)}</span></div>
    </div>
  `;
}

Object.assign(window, {
  renderNavigation,
  getRelativeTime,
  createRecentItemCard,
  renderFeaturedProcesses,
  createProcessCard,
});
