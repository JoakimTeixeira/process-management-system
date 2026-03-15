function showAssetDetail(assetId, options = {}) {
  const { updateHash: shouldUpdateHash = true } = options;
  let process = AppState.currentProcess;
  let currentVersion = process?.versions?.find((version) => version.id === process.current_version_id) || process?.versions?.[0];
  let asset = currentVersion?.assets?.find((item) => item.id === assetId);

  if (!asset) {
    process = AppState.processes.find((candidate) => {
      const version = candidate.versions?.find((item) => item.id === candidate.current_version_id) || candidate.versions?.[0];
      return version?.assets?.some((candidateAsset) => candidateAsset.id === assetId);
    });
    currentVersion = process?.versions?.find((version) => version.id === process.current_version_id) || process?.versions?.[0];
    asset = currentVersion?.assets?.find((item) => item.id === assetId);
  }

  if (!asset || !process) return window.showNotification?.("Asset não encontrado");

  AppState.currentProcess = process;
  AppState.currentMacroprocessId = process.macroprocess_id;
  AppState.currentView = "asset-detail";

  renderDynamicView("asset-detail-view", `
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center mb-2"><span class="text-sm font-medium px-3 py-1 rounded-full bg-govpt-blue-light text-govpt-primary">Modelo BPMN</span><span class="ml-3 text-sm text-gray-500">${asset.code}</span></div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${asset.subtitle}</h1>
            <p class="text-gray-600">${asset.description || "Sem descrição"}</p>
          </div>
        </div>
        <nav class="flex items-center space-x-2 text-sm text-gray-600">
          <a href="#" onclick="showHomepage()" class="hover:text-igfej-blue">Início</a><span class="text-gray-400">/</span>
          <a href="#" onclick="navigateToMacroprocess('${process.macroprocess_id}')" class="hover:text-igfej-blue">${getMacroprocessTitle(process.macroprocess_id)}</a><span class="text-gray-400">/</span>
          <a href="#" onclick="showProcessDetail('${process.id}')" class="hover:text-igfej-blue">${process.title}</a><span class="text-gray-400">/</span>
          <span class="text-gray-900">${asset.subtitle}</span>
        </nav>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações do Modelo</h3>
            <dl class="space-y-3">
              <div><dt class="text-sm font-medium text-gray-500">Código</dt><dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${asset.code}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Processo</dt><dd class="mt-1 text-sm text-gray-900">${process.code}: ${process.title}</dd></div>
              <div><dt class="text-sm font-medium text-gray-500">Arquivos</dt><dd class="mt-1 text-sm text-gray-900">${asset.files?.filter((file) => file.bpmn_file || file.svg_file || file.dmn_file).length || 0} arquivo(s)</dd></div>
            </dl>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Arquivos Disponíveis</h3>
            <div class="space-y-2">
              ${asset.files?.map((file) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <span class="text-sm font-medium px-2 py-1 bg-igfej-light text-igfej-blue rounded">${file.bpmn_file ? "BPMN" : "N/A"}</span>
                    <span class="ml-2 text-sm text-gray-700">${file.bpmn_file || "N/A"}</span>
                  </div>
                  <button onclick="loadAssetBPMN('${asset.id}')" class="text-igfej-blue hover:text-igfej-dark underline text-sm">Visualizar</button>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  syncNavigationState();
  showBreadcrumbTrail(["Início", getMacroprocessTitle(process.macroprocess_id), process.title, asset.subtitle || "Asset"]);
  if (shouldUpdateHash) updateHash({ type: "asset", id: assetId });
}

function loadAssetBPMN(assetId) {
  const currentVersion = AppState.currentProcess?.versions?.find((version) => version.id === AppState.currentProcess.current_version_id) || AppState.currentProcess?.versions?.[0];
  const asset = currentVersion?.assets?.find((item) => item.id === assetId);
  if (!asset?.files?.[0]?.bpmn_file) return window.showNotification?.("Arquivo BPMN não encontrado");

  window.currentAsset = asset;
  window.loadBPMDiagram?.(asset.files[0].bpmn_file);
  switchTab("assets");
}

function loadBPMNDiagramFromList(assetId) {
  const currentVersion = AppState.currentProcess?.versions?.find((version) => version.id === AppState.currentProcess.current_version_id) || AppState.currentProcess?.versions?.[0];
  const asset = currentVersion?.assets?.find((item) => item.id === assetId);
  if (!asset?.files?.[0]?.bpmn_file) return window.showNotification?.("Arquivo BPMN não encontrado");

  setActiveDiagramListItem(assetId);
  window.currentAsset = asset;
  window.loadBPMDiagram?.(asset.files[0].bpmn_file, "bpmn-container");
  setTimeout(() => window.updateDownloadOptions?.(), 100);
}

function selectFirstDiagram() {
  const assetsTab = document.getElementById("assets-tab");
  if (!assetsTab?.classList.contains("active") || assetsTab.querySelector(".asset-list-item.selected")) return;

  const firstItem = assetsTab.querySelector(".asset-list-item");
  const match = firstItem?.getAttribute("onclick")?.match(/loadBPMNDiagramFromList\('([^']+)'\)/);
  if (match?.[1]) setTimeout(() => window.loadBPMNDiagramFromList(match[1]), 80);
}

function getActiveDiagramListScope() {
  return document.querySelector("#assets-tab.active") || document.querySelector("#subprocess-bpmn-tab.active") || document;
}

function setActiveDiagramListItem(assetId) {
  const scope = getActiveDiagramListScope();
  scope.querySelectorAll(".asset-list-item").forEach((item) => {
    item.classList.remove("selected", "bg-blue-50", "border-blue-300");
    item.classList.add("bg-white", "border-gray-200");
  });

  const activeItem = scope.querySelector(`.asset-list-item[data-asset-id="${assetId}"]`);
  if (activeItem) {
    activeItem.classList.remove("bg-white", "border-gray-200");
    activeItem.classList.add("selected", "bg-blue-50", "border-blue-300");
  }
}

function loadProcessBpmn(processId) {
  const process = AppState.processes.find((item) => item.id === processId);
  const currentVersion = process?.versions?.find((version) => version.id === process.current_version_id) || process?.versions?.[0];
  const assetWithBpmn = currentVersion?.assets?.find((asset) => asset.files?.some((file) => file.bpmn_file));
  const container = document.getElementById("process-bpmn-container");
  if (!container) return;

  if (!assetWithBpmn) {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900">Diagrama Indisponível</h3><p class="mt-1 text-sm text-gray-500">Este processo não tem diagramas diretos.<br><a href="#" onclick="switchTab('assets')" class="text-igfej-blue hover:text-igfej-dark underline">Ver diagramas na aba Diagramas →</a></p></div></div>`;
    AppState.processBpmnLoaded = true;
    return;
  }

  const bpmnFile = assetWithBpmn.files.find((file) => file.bpmn_file)?.bpmn_file;
  if (!bpmnFile) {
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><p class="text-sm text-gray-500">Arquivo BPMN não encontrado</p><p class="text-xs text-gray-400 mt-1">Verifique os arquivos do asset.</p></div></div>`;
    AppState.processBpmnLoaded = true;
    return;
  }

  try {
    window.currentProcess = process;
    window.currentAsset = assetWithBpmn;
    window.loadBPMDiagram?.(bpmnFile, "process-bpmn-container");
  } catch (error) {
    console.error("Error loading BPMN diagram:", error);
    container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900">Erro no Diagrama</h3><p class="mt-1 text-sm text-gray-600">Este arquivo BPMN contém erros de estrutura e não pode ser exibido.<br><a href="#" onclick="switchTab('assets')" class="text-igfej-blue hover:text-igfej-dark underline">Ver outros modelos BPMN →</a></p></div></div>`;
  }

  AppState.processBpmnLoaded = true;
}

Object.assign(window, {
  showAssetDetail,
  loadAssetBPMN,
  loadBPMNDiagramFromList,
  selectFirstDiagram,
  getActiveDiagramListScope,
  setActiveDiagramListItem,
  loadProcessBpmn,
});

window.loadBPMNDiagramFromList = loadBPMNDiagramFromList;
