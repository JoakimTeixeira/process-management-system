const AppState = {
  currentView: "dashboard",
  currentProcess: null,
  currentSubprocessId: null,
  currentMacroprocessId: null,
  currentProcessListItems: [],
  processBpmnLoaded: false,
  sidebarOpen: false,
  language: "pt",
  searchQuery: "",
  processes: [],
  macroprocesses: [],
};

const PROCESS_TAB_ROUTE_NAMES = {
  overview: "overview",
  subprocesses: "subprocesses",
  assets: "diagrams",
  history: "versions",
  "process-bpmn": "diagram",
};

const SUBPROCESS_TAB_ROUTE_NAMES = {
  details: "details",
  bpmn: "diagram",
};

function getRouteTabName(tabName, tabMap) {
  return tabMap[tabName] || tabName;
}

function getInternalTabName(tabName, tabMap) {
  const entry = Object.entries(tabMap).find(([, routeName]) => routeName === tabName);
  return entry ? entry[0] : tabName;
}

function getDisplayCode(item) {
  if (item.type === "subprocess" && item.parent_process_code) {
    return `${item.parent_process_code}.${item.code.split(".").pop()}`;
  }
  return item.code;
}

function getMacroprocessTitle(macroprocessId) {
  const macroprocess = AppState.macroprocesses.find((item) => item.id === macroprocessId);
  return macroprocess ? macroprocess.title : macroprocessId;
}

async function loadJSONData() {
  try {
    const [macroprocessesResponse, processesResponse] = await Promise.all([
      fetch("data/macroprocesses.json"),
      fetch("data/processes.json"),
    ]);

    if (!macroprocessesResponse.ok || !processesResponse.ok) {
      throw new Error("Failed to fetch JSON files");
    }

    AppState.macroprocesses = await macroprocessesResponse.json();
    AppState.processes = await processesResponse.json();
    return AppState;
  } catch (error) {
    console.error("Failed to load JSON files:", error);
    AppState.macroprocesses = [];
    AppState.processes = [];
    return AppState;
  }
}

function refreshApp() {
  window.renderNavigation?.();
  window.renderFeaturedProcesses?.();
  window.updateStatistics?.();
  window.initializeTables?.();
  window.initializeFeather?.();
}

Object.assign(window, {
  AppState,
  PROCESS_TAB_ROUTE_NAMES,
  SUBPROCESS_TAB_ROUTE_NAMES,
  getRouteTabName,
  getInternalTabName,
  getDisplayCode,
  getMacroprocessTitle,
  loadJSONData,
  refreshApp,
});
