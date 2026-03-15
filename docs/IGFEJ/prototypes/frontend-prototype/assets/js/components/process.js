function renderSubprocesses(subprocesses) {
  if (!subprocesses?.length) {
    return `
      <div class="text-center py-8 text-gray-500">
        <p class="text-lg font-medium mb-2">Este processo não tem subprocessos</p>
        <p class="text-sm">Todos os subprocessos relacionados seriam listados aqui.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${subprocesses.map((subprocess) => `
          <div class="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-igfej-blue" onclick="showSubprocessDetail('${subprocess.id}')">
            <div class="flex flex-col h-full">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="flex items-center mb-1"><span class="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">Subprocesso</span></div>
                  <h4 class="font-semibold text-gray-900 mb-2">${getDisplayCode(subprocess)}: ${subprocess.title}</h4>
                  <p class="text-sm text-gray-600 line-clamp-3">${subprocess.description || "Sem descrição"}</p>
                  ${subprocess.keywords?.length ? `<div class="flex flex-wrap gap-1 mt-2">${subprocess.keywords.slice(0, 3).map((keyword) => `<span class="text-xs px-2 py-1 bg-igfej-light text-igfej-blue rounded">${keyword}</span>`).join("")}</div>` : ""}
                </div>
                <svg class="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
              <div class="mt-auto pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center">${getIcon("user", 12)}${subprocess.responsible?.slice(0, 2).join(", ") || "N/A"}${subprocess.responsible?.length > 2 ? "..." : ""}</span>
                  <span class="flex items-center"><svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>BPMN</span>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProcessDetail(process, currentVersion) {
  const config = getTypeConfig("process");
  const processState = process.state === "as_is" ? "AS-IS" : "TO-BE";
  const processVersion = currentVersion?.version || "1.0";
  const processDescription = currentVersion?.change_description || process.description || "Sem descrição disponível para este processo.";

  return `
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="border-b border-gray-200 px-4 py-5 sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <span class="text-sm font-medium px-3 py-1 rounded-full ${config.bg} ${config.text}">${config.label}</span>
              ${process.versions?.length > 1
                ? `<div class="flex items-center gap-2"><label class="text-sm text-gray-500">Versão</label><select onchange="switchProcessVersion('${process.id}', this.value)" class="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-igfej-blue">${process.versions.map((version) => `<option value="${version.id}" ${version.id === process.current_version_id ? "selected" : ""}>v${version.version} (${new Date(version.created_at).toLocaleDateString("pt-PT")})</option>`).join("")}</select></div>`
                : `<span class="text-sm font-medium text-gray-500">v${processVersion}</span>`}
            </div>
            <h1 class="text-2xl font-bold leading-tight text-gray-900">${process.code}: ${process.title}</h1>
            <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span class="text-gray-600">Macroprocesso: <span class="font-medium text-gray-900">${getMacroprocessTitle(process.macroprocess_id)}</span></span>
              <span class="text-gray-600">Estado: <span class="font-medium text-gray-900">${processState}</span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="border-b border-gray-200">
        <nav class="flex flex-wrap gap-x-6 px-6" aria-label="Tabs">
          <button onclick="switchTab('overview', event)" class="tab-button py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Visão Geral</button>
          <button onclick="switchTab('subprocesses', event)" class="tab-button py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Subprocessos <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${currentVersion?.subprocesses?.length || 0}</span></button>
          <button onclick="switchTab('assets', event)" class="tab-button py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Diagramas <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${currentVersion?.assets?.length || 0}</span></button>
          <button onclick="switchTab('history', event)" class="tab-button py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Versões <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${process.versions?.length || 1}</span></button>
        </nav>
      </div>
      <div class="p-6">
        <div id="overview-tab" class="tab-content">
          <div class="space-y-6">
            <div><h2 class="text-base font-semibold text-gray-900 mb-3">Descrição</h2><p class="text-sm leading-7 text-gray-700">${processDescription}</p></div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Versão</h3>
              <dl class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div><dt class="text-sm text-gray-500">Versão</dt><dd class="mt-1 text-sm font-medium text-gray-900">v${processVersion}</dd></div>
                <div><dt class="text-sm text-gray-500">Criado em</dt><dd class="mt-1 text-sm font-medium text-gray-900">${new Date(process.created_at).toLocaleDateString("pt-PT")}</dd></div>
                <div><dt class="text-sm text-gray-500">Criado por</dt><dd class="mt-1 text-sm font-medium text-gray-900">${process.author_id || "N/A"}</dd></div>
                <div><dt class="text-sm text-gray-500">Atualizado em</dt><dd class="mt-1 text-sm font-medium text-gray-900">${new Date(process.updated_at).toLocaleDateString("pt-PT")}</dd></div>
                <div><dt class="text-sm text-gray-500">Atualizado por</dt><dd class="mt-1 text-sm font-medium text-gray-900">${process.updated_by || "N/A"}</dd></div>
              </dl>
            </div>
          </div>
        </div>
        <div id="subprocesses-tab" class="tab-content">${renderSubprocesses(currentVersion?.subprocesses || [])}</div>
        <div id="process-bpmn-tab" class="tab-content"><div class="space-y-6"><div><h3 class="text-lg font-semibold text-gray-900 mb-4">Diagrama do Processo</h3><div class="bpmn-container" id="process-bpmn-container"><div class="flex items-center justify-center h-full text-gray-500"><div class="text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-igfej-blue"></div><p class="text-sm text-gray-500 mt-2">Carregando Diagrama do processo...</p></div></div></div></div></div></div>
        <div id="assets-tab" class="tab-content">${renderDiagramViewer({ listMarkup: renderAssets(currentVersion?.assets || []), containerId: "bpmn-container" })}</div>
        <div id="history-tab" class="tab-content">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Versões</h3>
              <div class="space-y-4">
                ${process.versions?.map((version) => `
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center"><span class="text-lg font-semibold text-gray-900">v${version.version}</span>${version.id === process.current_version_id ? '<span class="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Atual</span>' : ""}</div>
                      <div class="text-sm text-gray-500">${new Date(version.created_at).toLocaleDateString("pt-PT")}</div>
                    </div>
                    <p class="text-gray-700 mb-3">${version.change_description || "Sem descrição"}</p>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600"><strong>Autor:</strong> ${version.author_id || "N/A"}</span>
                      <span class="text-gray-600"><strong>Atualizado por:</strong> ${version.updated_by || "N/A"}</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-200"><span class="text-sm text-gray-600"><strong>Subprocessos:</strong> ${version.subprocesses?.length || 0}</span></div>
                  </div>
                `).join("") || '<p class="text-gray-700">Nenhuma versão registada.</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

Object.assign(window, { renderSubprocesses, renderProcessDetail });
