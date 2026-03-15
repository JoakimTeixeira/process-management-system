function createProcessListItem(item) {
  const config = getTypeConfig(item.type);
  const isSubprocess = item.type === "subprocess";
  const title = isSubprocess ? `${getDisplayCode(item)}: ${item.title}` : `${item.code}: ${item.title}`;
  const extra = isSubprocess
    ? `<div class="mt-2 text-xs text-gray-500"><div class="flex items-center">${getIcon("home", 12)}Pai: ${item.parent_process_code}</div></div>`
    : item.subprocess_count > 0
      ? `<div class="mt-2 text-xs text-gray-500"><div class="flex items-center">${getIcon("layers", 12)}${item.subprocess_count} subprocesso${item.subprocess_count !== 1 ? "s" : ""}</div></div>`
      : "";

  return `
    <div class="process-card bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-igfej-blue" onclick="${isSubprocess ? `showSubprocessDetail('${item.id}')` : `showProcessDetail('${item.id}')`}">
      <div class="flex flex-col h-full">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center mb-1"><span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">${isSubprocess ? "Subprocesso" : "Processo"}</span></div>
            <h4 class="font-semibold text-gray-900 mb-2">${title}</h4>
            <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
            ${extra}
          </div>
          ${getIcon("chevron-right", 16)}
        </div>
        <div class="mt-auto pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between text-xs text-gray-500"><span>${getMacroprocessTitle(item.macroprocess_id)}</span></div>
        </div>
      </div>
    </div>
  `;
}

function filterProcessListItems() {
  if (!AppState.currentProcessListItems.length) return;
  const search = document.getElementById("process-filter-input")?.value.toLowerCase() || "";
  const type = document.getElementById("process-type-filter")?.value || "all";
  const cards = document.querySelectorAll("#process-list .process-card");

  AppState.currentProcessListItems.forEach((item, index) => {
    const card = cards[index];
    if (!card) return;

    const matchesSearch = !search || item.title.toLowerCase().includes(search) || item.code.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
    card.style.display = matchesSearch && (type === "all" || item.type === type) ? "block" : "none";
  });

  const breadcrumbItems = ["Início"];
  if (AppState.currentProcess) breadcrumbItems.push(getMacroprocessTitle(AppState.currentProcess.macroprocess_id));
  breadcrumbItems.push(search && type !== "all" ? `Processos (${type}: "${search}")` : search ? `Processos (Pesquisa: "${search}")` : type !== "all" ? `Processos (${type})` : "Processos");
  showBreadcrumbTrail(breadcrumbItems);
}

function filterProcesses(searchTerm) {
  document.querySelectorAll("#process-list .process-card").forEach((card) => {
    card.style.display = card.textContent.toLowerCase().includes(searchTerm.toLowerCase()) ? "block" : "none";
  });
}

Object.assign(window, {
  createProcessListItem,
  filterProcessListItems,
  filterProcesses,
});
