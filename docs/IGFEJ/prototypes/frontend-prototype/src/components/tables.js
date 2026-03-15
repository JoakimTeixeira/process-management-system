class TableManager {
  constructor(config) {
    Object.assign(this, {
      ...config,
      filterIds: config.filterIds || [],
      itemsPerPage: config.itemsPerPage || 5,
      currentPage: 1,
      filteredData: [],
      originalData: [],
      currentSort: null,
      sortDirection: "asc",
    });
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById(this.searchId)?.addEventListener("input", () => this.handleSearch());
    this.filterIds.forEach((id) => document.getElementById(id)?.addEventListener("change", () => this.handleSearch()));
    document.getElementById(this.prevId)?.addEventListener("click", () => this.goToPage(this.currentPage - 1));
    document.getElementById(this.nextId)?.addEventListener("click", () => this.goToPage(this.currentPage + 1));
  }

  setData(data) {
    this.originalData = data;
    this.filteredData = [...data];
    this.currentPage = 1;
    this.updateTable();
  }

  handleSearch() {
    const searchTerm = normalizeTableSearch(document.getElementById(this.searchId)?.value || "");
    this.filteredData = this.originalData.filter((item) => this.searchInItem(item, searchTerm) && this.matchesFilters(item));
    this.currentPage = 1;
    if (this.currentSort) this.sortData();
    this.updateTable();
  }

  searchInItem() {
    return false;
  }

  matchesFilters() {
    return true;
  }

  handleSort(sortBy) {
    this.sortDirection = this.currentSort === sortBy ? (this.sortDirection === "asc" ? "desc" : "asc") : "desc";
    this.currentSort = sortBy;
    this.sortData();
    this.updateSortIcons();
    this.updateTable();
  }

  sortData() {
    const sortBy = this.currentSort;
    if (!sortBy) return;
    this.filteredData.sort((left, right) => {
      const a = this.getSortValue(left, sortBy);
      const b = this.getSortValue(right, sortBy);
      if (typeof a === "string" || typeof b === "string") {
        return this.sortDirection === "asc"
          ? String(a).localeCompare(String(b), "pt", { numeric: true, sensitivity: "base" })
          : String(b).localeCompare(String(a), "pt", { numeric: true, sensitivity: "base" });
      }
      return this.sortDirection === "asc" ? a - b : b - a;
    });
  }

  getSortValue() {
    return "";
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.updateTable();
    }
  }

  updateTable() {
    this.renderTableRows();
    this.updatePagination();
  }

  getPageData() {
    return this.filteredData.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  getPageHeight() {
    return this.itemsPerPage * 80;
  }

  getRemainingPageHeight(rowCount) {
    return Math.max(0, this.getPageHeight() - (rowCount * 80));
  }

  setBodyEmptyState(tbody, isEmpty) {
    if (!tbody) return;
    tbody.classList.toggle("divide-y", !isEmpty);
    tbody.classList.toggle("divide-govpt-border", !isEmpty);
  }

  renderEmptyState(columns, message = "Nenhum resultado encontrado.", hint = "Ajuste a pesquisa ou os filtros para voltar a ver resultados.") {
    return `
      <tr class="table-empty-row">
        <td colspan="${columns}" class="px-6 text-center align-middle" style="height:${this.getPageHeight()}px;">
          <div class="mx-auto max-w-md">
            <p class="text-sm font-medium text-gray-900">${message}</p>
            <p class="mt-1 text-sm text-gray-500">${hint}</p>
          </div>
        </td>
      </tr>
    `;
  }

  renderSpacerRow(columns, rowCount) {
    const remainingHeight = this.getRemainingPageHeight(rowCount);
    if (!remainingHeight) return "";
    return `
      <tr class="table-spacer-row" aria-hidden="true">
        <td colspan="${columns}" class="p-0" style="height:${remainingHeight}px;"></td>
      </tr>
    `;
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);
    document.getElementById(this.showingId) &&
      (document.getElementById(this.showingId).textContent = this.filteredData.length ? `${startIndex + 1}-${endIndex}` : "0");
    document.getElementById(this.totalId) &&
      (document.getElementById(this.totalId).textContent = this.filteredData.length);
    document.getElementById(this.prevId) &&
      (document.getElementById(this.prevId).disabled = this.currentPage === 1);
    if (document.getElementById(this.nextId)) {
      const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
      document.getElementById(this.nextId).disabled = this.currentPage === totalPages || totalPages === 0;
    }
  }

  updateSortIcons() {
    document.querySelectorAll(`[data-table-sort="${this.tableName}"] .sort-icon`).forEach((icon) => {
      icon.classList.remove("sort-active");
      icon.classList.remove("rotate-180");
    });
    if (this.currentSort) {
      const currentIcon = document.querySelector(`[data-table-sort="${this.tableName}"] .sort-${this.currentSort}`);
      if (currentIcon) {
        currentIcon.classList.add("sort-active");
        currentIcon.classList.toggle("rotate-180", this.sortDirection === "desc");
      }
    }
    if (typeof feather !== "undefined") feather.replace();
  }
}

function getStatusBadgeClasses(status) {
  return status === "TO-BE"
    ? "bg-govpt-warning-soft text-govpt-warning-text"
    : "bg-govpt-success-soft text-govpt-success-text";
}

function normalizeTableSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const tableRowClass = (topAligned = false) => `${topAligned ? "align-top" : "align-middle"} h-20 hover:bg-gray-50`;
const clampTwoLines = 'overflow-hidden text-sm text-gray-900" style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;';
const tableCellHeight = "h-20";

class MacroprocessTableManager extends TableManager {
  constructor() {
    super({
      tableName: "macroprocesses",
      tableId: "macroprocesses-table-body",
      searchId: "macroprocess-search",
      prevId: "macroprocesses-prev",
      nextId: "macroprocesses-next",
      showingId: "macroprocesses-showing",
      totalId: "macroprocesses-total",
    });
  }

  searchInItem(item, searchTerm) {
    const fields = [item.title, item.description, item.slug].map(normalizeTableSearch);
    return !searchTerm || fields.some((field) => field.includes(searchTerm));
  }

  getSortValue(item, sortBy) {
    if (sortBy === "description") return item.description;
    if (sortBy === "processes") return item.processCount;
    if (sortBy === "subprocesses") return item.subprocessCount;
    return item.title;
  }

  renderTableRows() {
    const tbody = document.getElementById(this.tableId);
    if (!tbody) return;
    const pageData = this.getPageData();
    if (!pageData.length) {
      this.setBodyEmptyState(tbody, true);
      tbody.innerHTML = this.renderEmptyState(5);
      if (typeof feather !== "undefined") feather.replace();
      return;
    }
    this.setBodyEmptyState(tbody, false);
    const rows = pageData
      .map(
        (macro) => `
          <tr class="${tableRowClass(true)}">
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap"><div><div class="text-sm font-medium text-gray-900">${macro.title}</div><div class="text-sm text-gray-500">${macro.slug}</div></div></td>
            <td class="px-4 py-4 ${tableCellHeight}"><div class="${clampTwoLines}">${macro.description}</div></td>
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle text-center"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-govpt-blue-light text-govpt-primary">${macro.processCount}</span></td>
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle text-center"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-govpt-blue-light text-govpt-primary">${macro.subprocessCount}</span></td>
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle text-sm font-medium text-center"><button type="button" class="text-blue-600 hover:text-blue-800" onclick="navigateToMacroprocess('${macro.id}')">Ver Detalhes</button></td>
          </tr>
        `,
      )
      .join("");
    tbody.innerHTML = rows + this.renderSpacerRow(5, pageData.length);
    if (typeof feather !== "undefined") feather.replace();
  }
}

class ProcessTableManager extends TableManager {
  constructor() {
    super({
      tableName: "processes",
      tableId: "processes-table-body",
      searchId: "process-search",
      prevId: "processes-prev",
      nextId: "processes-next",
      showingId: "processes-showing",
      totalId: "processes-total",
      filterIds: ["process-status-filter", "process-macroprocess-filter"],
    });
  }

  searchInItem(item, searchTerm) {
    const fields = [item.code, item.title, item.macroprocessTitle, item.status].map(normalizeTableSearch);
    return !searchTerm || fields.some((field) => field.includes(searchTerm));
  }

  matchesFilters(item) {
    const status = document.getElementById("process-status-filter")?.value || "";
    const macroprocess = document.getElementById("process-macroprocess-filter")?.value || "";
    return (!status || item.status === status) && (!macroprocess || item.macroprocessId === macroprocess);
  }

  getSortValue(item, sortBy) {
    if (sortBy === "name") return item.title;
    if (sortBy === "macroprocess") return item.macroprocessTitle;
    if (sortBy === "status") return item.status;
    return parseFloat(item.code) || 0;
  }

  renderTableRows() {
    const tbody = document.getElementById(this.tableId);
    if (!tbody) return;
    const pageData = this.getPageData();
    if (!pageData.length) {
      this.setBodyEmptyState(tbody, true);
      tbody.innerHTML = this.renderEmptyState(5);
      if (typeof feather !== "undefined") feather.replace();
      return;
    }
    this.setBodyEmptyState(tbody, false);
    const rows = pageData
      .map(
        (process) => `
          <tr class="${tableRowClass()}">
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle"><div class="text-sm font-medium text-gray-900">${process.code}</div></td>
            <td class="px-4 py-4 ${tableCellHeight} align-middle"><div class="${clampTwoLines}">${process.title}</div></td>
            <td class="px-4 py-4 ${tableCellHeight} align-middle"><div class="${clampTwoLines}">${process.macroprocessTitle}</div></td>
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle text-center"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(process.status)}">${process.status}</span></td>
            <td class="px-4 py-4 ${tableCellHeight} whitespace-nowrap align-middle text-sm font-medium text-center"><button type="button" class="text-blue-600 hover:text-blue-800" onclick="showProcessDetail('${process.id}')">Ver Detalhes</button></td>
          </tr>
        `,
      )
      .join("");
    tbody.innerHTML = rows + this.renderSpacerRow(5, pageData.length);
    if (typeof feather !== "undefined") feather.replace();
  }
}

function initializeTables() {
  initializeProcessFilters();
  window.macroprocessTableManager = new MacroprocessTableManager();
  window.macroprocessTableManager.setData(
    AppState.macroprocesses.map((macro) => ({
      id: macro.id,
      title: macro.title,
      slug: macro.slug || macro.title.toLowerCase().replace(/\s+/g, "-"),
      description: macro.description || "Descrição do macroprocesso",
      processCount: AppState.processes.filter((process) => process.macroprocess_id === macro.id).length,
      subprocessCount: AppState.processes
        .filter((process) => process.macroprocess_id === macro.id)
        .reduce((total, process) => {
          const currentVersion = process.versions?.find((version) => version.id === process.current_version_id);
          return total + (currentVersion?.subprocesses?.length || 0);
        }, 0),
    })),
  );

  window.processTableManager = new ProcessTableManager();
  window.processTableManager.setData(
    AppState.processes.map((process) => {
      const macroprocess = AppState.macroprocesses.find((macro) => macro.id === process.macroprocess_id);
      return {
        id: process.id,
        code: process.code,
        title: process.title,
        macroprocessId: process.macroprocess_id,
        macroprocessTitle: macroprocess ? macroprocess.title : "N/A",
        status: process.status === "TO-BE" ? "TO-BE" : "AS-IS",
      };
    }),
  );
}

function initializeProcessFilters() {
  const macroprocessFilter = document.getElementById("process-macroprocess-filter");
  if (!macroprocessFilter) return;
  const options = AppState.macroprocesses
    .map((macro) => `<option value="${macro.id}">${macro.title}</option>`)
    .join("");
  macroprocessFilter.innerHTML = '<option value="">Todos os Macroprocessos</option>' + options;
}

window.initializeTables = initializeTables;
window.initializeProcessFilters = initializeProcessFilters;
window.filterMacroprocessTable = function filterMacroprocessTable(query = "") {
  const input = document.getElementById("macroprocess-search");
  if (input) input.value = query;
  window.macroprocessTableManager?.handleSearch();
};
window.filterProcessTable = function filterProcessTable(query = "") {
  const input = document.getElementById("process-search");
  if (input) input.value = query;
  window.processTableManager?.handleSearch();
};
window.sortMacroprocessTable = function (sortBy, event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  window.macroprocessTableManager?.handleSort(sortBy);
};
window.sortProcessTable = function (sortBy, event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  window.processTableManager?.handleSort(sortBy);
};
