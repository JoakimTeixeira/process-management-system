function navigateToMacroprocess(macroprocessId, options = {}) {
  const { updateHash: shouldUpdateHash = true } = options;
  const macroprocess = AppState.macroprocesses.find((item) => item.id === macroprocessId);
  if (!macroprocess) return;

  const processes = AppState.processes.filter((process) => process.macroprocess_id === macroprocessId);
  closeMacroprocessDropdown();
  document.getElementById("macroprocess-dropdown-btn")?.classList.add("active");
  highlightDropdownItem(macroprocessId);
  AppState.currentMacroprocessId = macroprocessId;
  showProcessList(macroprocess, processes);
  showBreadcrumbTrail(["Início", macroprocess.title]);

  if (window.innerWidth < 768) closeSidebar();
  if (shouldUpdateHash) updateHash({ type: "macroprocess", id: macroprocessId });
}

function showProcessList(macroprocess, processes) {
  const allItems = [];

  processes.forEach((process) => {
    const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
    allItems.push({
      id: process.id,
      code: process.code,
      title: process.title,
      type: "process",
      macroprocess_id: process.macroprocess_id,
      subprocess_count: currentVersion?.subprocesses?.length || 0,
      description: currentVersion?.subprocesses?.length ? `Processo com ${currentVersion.subprocesses.length} subprocessos` : process.title || "Processo",
      updated_at: process.updated_at,
    });

    currentVersion?.subprocesses?.forEach((subprocess) => {
      allItems.push({
        id: subprocess.id,
        code: subprocess.code,
        title: subprocess.title,
        type: "subprocess",
        parent_process_id: process.id,
        parent_process_title: process.title,
        parent_process_code: process.code,
        macroprocess_id: process.macroprocess_id,
        description: subprocess.description || `Subprocesso de ${process.title}`,
        updated_at: subprocess.updated_at || process.updated_at,
      });
    });
  });

  allItems.sort((left, right) => {
    const a = parseInt(left.code.replace(/[^0-9]/g, ""), 10) || 0;
    const b = parseInt(right.code.replace(/[^0-9]/g, ""), 10) || 0;
    if (a && b) return a - b;
    if (a && !b) return -1;
    if (!a && b) return 1;
    return left.code.localeCompare(right.code);
  });

  const totalProcesses = processes.length;
  const totalSubprocesses = processes.reduce((sum, process) => {
    const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
    return sum + (currentVersion?.subprocesses?.length || 0);
  }, 0);

  const html = `
    <div class="max-w-govpt-container mx-auto px-4 pt-8">
      <nav id="breadcrumb" class="mb-12"></nav>
      <div class="text-left mb-8">
        <h1 class="text-govpt-3xl font-bold text-govpt-heading mb-4">${macroprocess.title}</h1>
        <p class="text-govpt-lg text-govpt-gray leading-relaxed mb-6">${macroprocess.description || ""}</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        ${totalProcesses || totalSubprocesses ? `
          <div class="mt-4 grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-3 bg-gray-50 rounded-lg"><div class="text-2xl font-semibold text-igfej-blue">${totalProcesses}</div><div class="text-sm text-gray-600">Processos</div></div>
            <div class="text-center p-3 bg-gray-50 rounded-lg"><div class="text-2xl font-semibold text-igfej-blue">${totalSubprocesses}</div><div class="text-sm text-gray-600">Subprocessos</div></div>
          </div>
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Processos e Subprocessos</h3>
              <div class="flex items-center space-x-2">
                <input id="process-filter-input" type="text" placeholder="Filtrar..." class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-igfej-blue" onkeyup="filterProcessListItems(this.value)">
                <select id="process-type-filter" class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-igfej-blue" onchange="filterProcessListItems()">
                  <option value="all">Todos (${allItems.length})</option>
                  <option value="process">Processos (${allItems.filter((item) => item.type === "process").length})</option>
                  <option value="subprocess">Subprocessos (${allItems.filter((item) => item.type === "subprocess").length})</option>
                </select>
              </div>
            </div>
            <div id="process-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${allItems.map((item) => createProcessListItem(item)).join("")}</div>
          </div>
        ` : `
          <div class="mt-4 text-center p-8 bg-gray-50 rounded-lg">
            <div class="text-gray-400 mb-2"><svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>
            <div class="text-lg font-medium text-gray-900 mb-1">Nenhum processo encontrado</div>
            <div class="text-sm text-gray-600">Este macroprocesso ainda não tem processos ou subprocessos registados.</div>
          </div>
        `}
      </div>
    </div>
  `;

  renderDynamicView("process-list-view", html);
  AppState.currentView = "process-list";
  AppState.currentProcessListItems = allItems;
  syncNavigationState();
}

Object.assign(window, { navigateToMacroprocess, showProcessList });
