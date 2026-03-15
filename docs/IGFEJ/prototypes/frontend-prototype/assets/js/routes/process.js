function activateProcessTab(tabName, event) {
  const view = document.getElementById("process-detail-view");
  if (!view) return;
  if (event) event.preventDefault();

  view.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("border-blue-500", "text-blue-600");
    button.classList.add("border-transparent", "text-gray-500");
  });

  const button = event?.target.closest(".tab-button") || view.querySelector(`[onclick*="switchTab('${tabName}'"]`);
  if (button) {
    button.classList.remove("border-transparent", "text-gray-500");
    button.classList.add("border-blue-500", "text-blue-600");
  }

  view.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
  view.querySelector(`#${tabName}-tab`)?.classList.add("active");
}

function switchTab(tabName, event) {
  activateProcessTab(tabName, event);

  if (tabName === "process-bpmn" && AppState.currentProcess) {
    loadProcessBpmn(AppState.currentProcess.id);
    setTimeout(() => window.fitBPMN?.("process-bpmn-container"), 120);
  }

  if (tabName === "assets" && AppState.currentProcess) {
    const currentVersion = AppState.currentProcess.versions?.find((version) => version.id === AppState.currentProcess.current_version_id) || AppState.currentProcess.versions?.[0];
    if (currentVersion?.assets?.length) {
      selectFirstDiagram();
      setTimeout(() => window.fitBPMN?.("bpmn-container"), 180);
    }
  }

  if (AppState.currentProcess?.id) {
    updateHash({ type: "process", id: AppState.currentProcess.id, tab: getRouteTabName(tabName, PROCESS_TAB_ROUTE_NAMES) }, !event);
  }
}

function showProcessDetail(processId, options = {}) {
  const { updateHash: shouldUpdateHash = true, activeTab = "overview" } = options;
  const process = AppState.processes.find((item) => item.id === processId);
  if (!process) return console.error("Process not found:", processId);

  window.closeHeaderSearchOnNavigation?.();

  const currentVersion = process.versions?.find((version) => version.id === process.current_version_id) || process.versions?.[0];
  AppState.currentProcess = process;
  AppState.currentMacroprocessId = process.macroprocess_id;
  AppState.currentView = "process-detail";
  AppState.processBpmnLoaded = false;

  renderDynamicView("process-detail-view", renderProcessDetail(process, currentVersion));
  syncNavigationState();
  showBreadcrumbTrail(["Início", getMacroprocessTitle(process.macroprocess_id), `${process.code}: ${process.title}`]);
  switchTab(activeTab);

  if (shouldUpdateHash) {
    updateHash({ type: "process", id: processId, tab: getRouteTabName(activeTab, PROCESS_TAB_ROUTE_NAMES) });
  }
}

window.switchProcessVersion = function switchProcessVersion(processId, versionId) {
  const process = AppState.processes.find((item) => item.id === processId);
  if (!process) return;
  process.current_version_id = versionId;
  showProcessDetail(processId);
};

Object.assign(window, { switchTab, showProcessDetail });
