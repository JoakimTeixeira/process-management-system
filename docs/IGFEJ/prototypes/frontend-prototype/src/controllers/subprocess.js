function findSubprocessParent(subprocessId) {
  return AppState.processes.find((process) => {
    const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
    return currentVersion?.subprocesses?.some((subprocess) => subprocess.id === subprocessId);
  });
}

function loadSubprocessBpmn(subprocessId) {
  const process = findSubprocessParent(subprocessId);
  if (!process) return console.error("Process not found for subprocess:", subprocessId);

  const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
  const subprocess = currentVersion?.subprocesses?.find((item) => item.id === subprocessId);
  if (!subprocess) return console.error("Subprocess not found:", subprocessId);

  const subprocessAsset = (currentVersion.assets || []).find((asset) => asset.code === subprocess.code || asset.subtitle?.toLowerCase().includes(subprocess.title.toLowerCase()));
  const container = document.getElementById("subprocess-bpmn-container");
  if (!container) return;

  if (!subprocessAsset) {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900">Diagrama Indisponível</h3><p class="mt-1 text-sm text-gray-500">Este subprocesso não tem diagramas diretos.<br>Verifique se há arquivos BPMN associados.</p></div></div>`;
    return;
  }

  const bpmnFile = subprocessAsset.files.find((file) => file.bpmn_file)?.bpmn_file;
  if (!bpmnFile) {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><p class="text-sm text-gray-500">Arquivo BPMN não encontrado</p><p class="text-xs text-gray-400 mt-1">Verifique os arquivos do asset.</p></div></div>`;
    return;
  }

  if (typeof window.loadBPMDiagram !== "function") {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><p class="text-sm text-gray-500">Erro ao carregar Diagrama</p><p class="text-xs text-gray-400 mt-1">Função de carregamento não disponível.</p></div></div>`;
    return;
  }

  try {
    window.currentProcess = process;
    window.currentAsset = subprocessAsset;
    setActiveDiagramListItem(subprocessAsset.id);
    window.loadBPMDiagram(bpmnFile, "subprocess-bpmn-container");
  } catch (error) {
    console.error("Error loading subprocess BPMN diagram:", error);
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900">Erro no Diagrama</h3><p class="mt-1 text-sm text-gray-600">Este arquivo BPMN contém erros de estrutura.<br>Tente recarregar a página.</p></div></div>`;
  }
}

function switchSubprocessTab(tabName, event) {
  const view = document.getElementById("subprocess-detail-view");
  if (!view) return;
  if (event) event.preventDefault();

  view.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("border-igfej-blue", "text-igfej-blue");
    button.classList.add("border-transparent", "text-gray-500");
  });

  const button = event?.target.closest(".tab-button") || view.querySelector(`[onclick*="switchSubprocessTab('${tabName}'"]`);
  if (button) {
    button.classList.remove("border-transparent", "text-gray-500");
    button.classList.add("border-igfej-blue", "text-igfej-blue");
  }

  view.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
  view.querySelector(`#subprocess-${tabName}-tab`)?.classList.add("active");

  if (tabName === "bpmn" && AppState.currentSubprocessId) {
    loadSubprocessBpmn(AppState.currentSubprocessId);
    setTimeout(() => window.fitBPMN?.(), 120);
  }

  if (AppState.currentSubprocessId) {
    updateHash({ type: "subprocess", id: AppState.currentSubprocessId, tab: getRouteTabName(tabName, SUBPROCESS_TAB_ROUTE_NAMES) }, !event);
  }
}

function showSubprocessDetail(subprocessId, options = {}) {
  const { updateHash: shouldUpdateHash = true, activeTab = "details" } = options;
  const resolvedActiveTab = ["details", "bpmn"].includes(activeTab) ? activeTab : "details";
  window.closeHeaderSearchOnNavigation?.();

  const parentProcess = findSubprocessParent(subprocessId);
  if (!parentProcess) return window.showNotification?.("Subprocesso não encontrado");

  const currentVersion = parentProcess.versions?.find((version) => version.id === parentProcess.current_version_id) || parentProcess.versions?.[0];
  const subprocess = currentVersion?.subprocesses?.find((item) => item.id === subprocessId);
  if (!subprocess) return window.showNotification?.("Subprocesso não encontrado");

  AppState.currentProcess = parentProcess;
  AppState.currentSubprocessId = subprocessId;
  AppState.currentMacroprocessId = parentProcess.macroprocess_id;
  AppState.currentView = "subprocess-detail";
  const subprocessAssets = getSubprocessAssets(subprocess);

  renderDynamicView("subprocess-detail-view", `
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center mb-2"><span class="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800">Subprocesso</span></div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${getDisplayCode(subprocess)}: ${subprocess.title}</h1>
            <p class="text-gray-600">${subprocess.description || "Sem descrição"}</p>
          </div>
        </div>
      </div>
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button onclick="switchSubprocessTab('details', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-igfej-blue text-igfej-blue hover:text-gray-700 hover:border-gray-300">Detalhes</button>
          <button onclick="switchSubprocessTab('bpmn', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Diagrama</button>
        </nav>
      </div>
      <div class="p-6">
        <div id="subprocess-bpmn-tab" class="tab-content">${renderDiagramViewer({ listMarkup: renderAssets(subprocessAssets), containerId: "subprocess-bpmn-container", hasDiagrams: subprocessAssets.length > 0 })}</div>
        <div id="subprocess-details-tab" class="tab-content active">${renderSubprocessDetails(subprocess)}</div>
      </div>
    </div>
  `);

  syncNavigationState();
  showBreadcrumbTrail(["Início", getMacroprocessTitle(parentProcess.macroprocess_id), `${parentProcess.code}: ${parentProcess.title}`, `${getDisplayCode(subprocess)}: ${subprocess.title}`]);
  switchSubprocessTab(resolvedActiveTab);
  if (shouldUpdateHash) updateHash({ type: "subprocess", id: subprocessId, tab: getRouteTabName(resolvedActiveTab, SUBPROCESS_TAB_ROUTE_NAMES) });
  setTimeout(() => loadSubprocessBpmn(subprocessId), 100);
}

Object.assign(window, { loadSubprocessBpmn, switchSubprocessTab, showSubprocessDetail });
