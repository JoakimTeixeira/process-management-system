const DASHBOARD_STATS = [
  ["stat-macroprocesses", "Macroprocessos"],
  ["stat-processes", "Processos"],
  ["stat-subprocesses", "Subprocessos"],
  ["stat-diagrams", "Diagramas"],
];

const MACROPROCESS_COLUMNS = [
  ["folder", "Macroprocesso", "name"],
  ["file-text", "Descrição", "description"],
  ["package", "Processos", "processes"],
  ["git-branch", "Subprocessos", "subprocesses"],
];
const MACROPROCESS_COLUMN_WIDTHS = ["22%", "36%", "132px", "144px", "96px"];

const PROCESS_COLUMNS = [
  ["hash", "Código", "code"],
  ["file-text", "Processo", "name"],
  ["layers", "Macroprocesso", "macroprocess"],
  ["check-circle", "Status", "status"],
];
const PROCESS_COLUMN_WIDTHS = ["112px", null, null, "120px", "104px"];

function tableHeader([icon, label, sortKey], handlerName) {
  const headerPadding = sortKey === "processes" ? "pl-4 pr-10" : "px-4";
  return `<th class="${headerPadding} py-4 text-left text-xs font-semibold uppercase tracking-wide text-govpt-heading cursor-pointer hover:bg-govpt-blue-light transition-colors" onclick="${handlerName}('${sortKey}', event)"><div class="flex items-center gap-1 whitespace-nowrap"><i data-feather="${icon}" class="h-4 w-4 shrink-0 text-govpt-primary"></i><span>${label}</span><i data-feather="chevron-up" class="sort-icon sort-${sortKey} h-4 w-4 shrink-0 text-govpt-gray"></i></div></th>`;
}

function tableSearchInput(id, placeholder) {
  return `<div class="relative flex-1 min-w-0"><input id="${id}" type="text" placeholder="${placeholder}" class="govpt-input pl-10" /><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><i data-feather="search" class="h-5 w-5 text-govpt-gray"></i></div></div>`;
}

function tableFilterSelect(id, label, options = "") {
  return `<div><select id="${id}" class="govpt-select w-full lg:w-52"><option value="">${label}</option>${options}</select></div>`;
}

function paginationBlock(showingId, totalId, prevId, nextId, label) {
  return `<div class="mt-6 flex items-center justify-between border-t border-govpt-border pt-4"><div class="text-sm text-govpt-text">Mostrando <span id="${showingId}" class="font-medium text-govpt-heading">0</span> de <span id="${totalId}" class="font-medium text-govpt-heading">0</span> ${label}</div><div class="flex gap-2"><button type="button" id="${prevId}" class="table-page-btn" disabled><i data-feather="chevron-left" class="h-4 w-4"></i></button><button type="button" id="${nextId}" class="table-page-btn" disabled><i data-feather="chevron-right" class="h-4 w-4"></i></button></div></div>`;
}

function tableColGroup(widths) {
  return `<colgroup>${widths.map((width) => (width ? `<col style="width:${width};">` : "<col>")).join("")}</colgroup>`;
}

function tableCard(sectionId, title, toolbar, tableName, columns, columnWidths, bodyId, paginationIds, label, sortHandler) {
  return `<div id="${sectionId}" class="space-y-4"><h3 class="text-govpt-2xl font-semibold text-govpt-heading">${title}</h3><div class="govpt-card"><div class="govpt-card-body"><div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">${toolbar}</div><div class="overflow-x-auto" data-table-sort="${tableName}"><table class="w-full table-fixed rounded-lg border border-govpt-border bg-white">${tableColGroup(columnWidths)}<thead class="bg-govpt-light"><tr>${columns.map((column) => tableHeader(column, sortHandler)).join("")}<th class="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-govpt-heading">Ações</th></tr></thead><tbody id="${bodyId}" class="divide-y divide-govpt-border bg-white"></tbody></table></div>${paginationBlock(...paginationIds, label)}</div></div></div>`;
}

function getDashboardSection() {
  const macroToolbar = tableSearchInput("macroprocess-search", "Pesquisar macroprocessos...");
  const processToolbar = [
    tableSearchInput("process-search", "Pesquisar processos..."),
    tableFilterSelect("process-status-filter", "Todos os Status", '<option value="AS-IS">AS-IS</option><option value="TO-BE">TO-BE</option>'),
    tableFilterSelect("process-macroprocess-filter", "Todos os Macroprocessos"),
  ].join("");

  return `
    <section id="dashboard" class="content-section hidden">
      <div class="max-w-govpt-container mx-auto px-4 py-8">
        <div class="space-y-12">
          <div id="dashboard-overview" class="mb-4">
            <h1 class="mb-4 text-govpt-3xl font-bold text-govpt-heading">Dashboard de Processos</h1>
            <p class="mb-6 text-govpt-lg leading-relaxed text-govpt-gray">Painel de controlo para análise e gestão de processos de negócio e TI. Consulte estatísticas, processos recentes e as listagens principais do catálogo.</p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            ${DASHBOARD_STATS.map(([id, label]) => `<div class="govpt-card"><div class="govpt-card-body text-center"><div id="${id}" class="mb-2 text-3xl font-bold text-govpt-primary">0</div><div class="text-sm font-medium text-govpt-gray">${label}</div></div></div>`).join("")}
          </div>

          <div>
            <h3 class="mb-6 text-govpt-2xl font-semibold text-govpt-heading">Atualizados recentemente</h3>
            <div id="featured-processes" class="space-y-6"></div>
          </div>

          ${tableCard("dashboard-macroprocesses", "Todos os Macroprocessos", macroToolbar, "macroprocesses", MACROPROCESS_COLUMNS, MACROPROCESS_COLUMN_WIDTHS, "macroprocesses-table-body", ["macroprocesses-showing", "macroprocesses-total", "macroprocesses-prev", "macroprocesses-next"], "macroprocessos", "sortMacroprocessTable")}

          ${tableCard("dashboard-processes", "Todos os Processos", processToolbar, "processes", PROCESS_COLUMNS, PROCESS_COLUMN_WIDTHS, "processes-table-body", ["processes-showing", "processes-total", "processes-prev", "processes-next"], "processos", "sortProcessTable")}

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div id="dashboard-subprocesses" class="govpt-card"><div class="govpt-card-body"><h3 class="mb-3 text-govpt-xl font-semibold text-govpt-heading">Subprocessos</h3><p class="mb-3 text-govpt-base text-govpt-text">Os subprocessos estão distribuídos pelos processos e podem ser consultados a partir de cada detalhe de processo.</p><p class="text-sm text-govpt-gray">Use a tabela de processos acima para abrir um processo e aceder à aba <strong>Subprocessos</strong>.</p></div></div>
            <div id="dashboard-diagrams" class="govpt-card"><div class="govpt-card-body"><h3 class="mb-3 text-govpt-xl font-semibold text-govpt-heading">Diagramas</h3><p class="mb-3 text-govpt-base text-govpt-text">Os diagramas BPMN estão disponíveis no detalhe de cada processo e subprocesso, na respetiva aba de diagramas.</p><p class="text-sm text-govpt-gray">Abra um processo na tabela para consultar os seus modelos BPMN e versões associadas.</p></div></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function animateCounter(element, targetValue) {
  if (!element) return;
  const startValue = parseInt(element.textContent, 10) || 0;
  const startTime = performance.now();
  const updateCounter = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / 1000, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    element.textContent = Math.floor(startValue + (targetValue - startValue) * eased);
    if (progress < 1) requestAnimationFrame(updateCounter);
    else element.textContent = targetValue;
  };
  requestAnimationFrame(updateCounter);
}

function updateStatistics() {
  let totalSubprocesses = 0;
  let totalAssets = 0;
  AppState.processes.forEach((process) => {
    const currentVersion = process.versions?.find((version) => version.id === process.current_version_id);
    if (!currentVersion) return;
    totalSubprocesses += currentVersion.subprocesses?.length || 0;
    totalAssets += currentVersion.assets?.length || 0;
  });

  const totals = {
    diagrams: totalAssets + totalSubprocesses,
    macroprocesses: AppState.macroprocesses.length,
    processes: AppState.processes.length,
    subprocesses: totalSubprocesses,
  };

  animateCounter(document.getElementById("stat-diagrams"), totals.diagrams);
  animateCounter(document.getElementById("stat-macroprocesses"), totals.macroprocesses);
  animateCounter(document.getElementById("stat-processes"), totals.processes);
  animateCounter(document.getElementById("stat-subprocesses"), totals.subprocesses);
}

function refreshStatistics() {
  updateStatistics();
}

Object.assign(window, {
  getDashboardSection,
  animateCounter,
  updateStatistics,
  refreshStatistics,
});
