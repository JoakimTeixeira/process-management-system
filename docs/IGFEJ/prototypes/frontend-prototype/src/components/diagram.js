function renderDiagramViewer({
  listTitle = "Diagramas",
  listMarkup = "",
  viewerTitle = "Visualização do Diagrama",
  viewerSubtitle = "Selecione um diagrama para começar",
  containerId = "bpmn-container",
  hasDiagrams = true,
} = {}) {
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div class="lg:col-span-1">
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <h3 class="mb-4 flex items-center text-lg font-semibold text-gray-900">${listTitle}</h3>
            <div class="max-h-full space-y-2 overflow-y-auto">${listMarkup}</div>
          </div>
        </div>
        <div class="lg:col-span-3">
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div class="border-b border-gray-200 bg-gray-50 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">${viewerTitle}</h3>
                  <p class="text-sm text-gray-600">${viewerSubtitle}</p>
                  ${hasDiagrams ? `<p class="mt-2 inline-flex items-center gap-1.5 text-[11px] leading-4 text-gray-500">${getIcon("move", 11)}<span>Prima Ctrl + click para mover o diagrama.</span></p>` : ""}
                </div>
                ${hasDiagrams ? `
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white p-2">
                      <div class="flex items-center space-x-1">
                        <button onclick="zoomInBPMN()" class="rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Zoom In">${getIcon("zoom-in", 16)}</button>
                        <button onclick="zoomOutBPMN()" class="rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Zoom Out">${getIcon("zoom-out", 16)}</button>
                        <div class="mx-1 h-6 border-l border-gray-300"></div>
                        <button onclick="fitBPMN('${containerId}')" class="rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Fit Viewport">${getIcon("maximize", 16)}</button>
                        <button onclick="fullscreenBPMN()" class="rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600" title="Fullscreen">${getIcon("monitor", 16)}</button>
                      </div>
                      <div class="h-8 border-l border-gray-300"></div>
                      <div class="flex items-center space-x-2">
                        <select id="download-format" class="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"></select>
                        <button onclick="downloadSelectedFormat()" class="inline-flex items-center rounded-md border border-transparent bg-govpt-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-govpt-secondary"><span>${getIcon("download", 14)}</span><span class="ml-2">Download</span></button>
                      </div>
                    </div>
                  </div>
                ` : ""}
              </div>
            </div>
            <div class="p-4">
              <div class="bpmn-container" id="${containerId}" style="height: 600px;">
                <div class="flex h-full items-center justify-center text-gray-500">
                  <div class="text-center">
                    <div class="inline-block rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      <h3 class="mt-4 text-sm font-medium text-gray-900">${hasDiagrams ? "Selecione um Diagrama" : "Sem Diagramas Disponíveis"}</h3>
                      <p class="mt-1 text-sm text-gray-600">${hasDiagrams ? "Clique em um Diagrama da lista à esquerda<br>para visualizar e editar o processo." : "Não existem diagramas associados a este registo."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAssets(assets) {
  if (!assets || assets.length === 0) {
    return `
      <div class="py-8 text-center text-gray-500">
        <p class="mb-2 text-lg font-medium">Sem modelos BPMN</p>
        <p class="text-sm">Este processo não tem modelos BPMN registados.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-3">
      ${assets.map((asset) => {
        const filesWithContent = asset.files?.filter((file) => file.bpmn_file || file.svg_file || file.dmn_file) || [];
        const fileTypes = ["bpmn_file", "svg_file", "dmn_file"]
          .filter((key) => filesWithContent.some((file) => file[key]))
          .map((key) => key.replace("_file", "").toUpperCase());

        return `
          <div class="asset-list-item cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300" data-asset-id="${asset.id}" onclick="loadBPMNDiagramFromList('${asset.id}')">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="mb-2 font-medium text-gray-900">${asset.code}: Modelo BPMN ${asset.subtitle}</h4>
                <div class="flex items-center space-x-2">${fileTypes.map((type) => `<span class="rounded bg-govpt-blue-light px-2 py-1 text-xs font-medium text-govpt-primary">${type}</span>`).join("")}</div>
              </div>
              ${getIcon("chevron-right", 20)}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getSubprocessAssets(subprocess) {
  const parentProcess = AppState.currentProcess;
  if (!parentProcess) return [];

  const currentVersion = parentProcess.versions?.find((version) => version.id === parentProcess.current_version_id) || parentProcess.versions?.[0];
  const assets = currentVersion?.assets || [];
  return assets.filter((asset) => asset.code === subprocess.code || asset.subtitle?.toLowerCase().includes(subprocess.title.toLowerCase()));
}

Object.assign(window, { renderDiagramViewer, renderAssets, getSubprocessAssets });
