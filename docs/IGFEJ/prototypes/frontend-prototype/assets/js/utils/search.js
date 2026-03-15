const SearchState = { index: [], fuse: null, initPromise: null, selected: {} };
const SEARCH_INPUTS = ["welcome-search", "header-search-input", "macroprocess-search", "process-search"];
const GLOBAL_INPUTS = ["welcome-search", "header-search-input"];
const INPUT_CONFIG = {
  "welcome-search": { results: "search-results", clear: "welcome-search-clear" },
  "header-search-input": { results: "header-search-results", clear: "header-search-clear", header: true },
};
const TABLE_FILTERS = {
  "macroprocess-search": (query) => window.filterMacroprocessTable?.(query),
  "process-search": (query) => window.filterProcessTable?.(query),
};
const FALLBACK_INDEX = [
  { title: "Mudanca de Local do Utilizador", text: "Processo de mudanca de local de utilizador", category: "Gestao de Servicos", keywords: ["mudanca", "local", "utilizador"], href: "#process-4.0", type: "process", code: "4.0" },
  { title: "Gestao de Acessos e Utilizadores", text: "Processos operacionais de gestao de acessos e utilizadores", category: "Gestao de Servicos", keywords: ["acessos", "utilizadores", "gestao"], href: "#process-5.0", type: "process", code: "5.0" },
  { title: "Criacao de Utilizador", text: "Criacao de conta em diretorio e disponibilizacao de acessos base", category: "Gestao de Servicos", keywords: ["utilizador", "conta", "acesso", "active directory"], href: "#subprocess-5.1", type: "subprocess", code: "5.1" },
];

const byId = (id) => document.getElementById(id);
const getCfg = (inputId) => INPUT_CONFIG[inputId] || INPUT_CONFIG["welcome-search"];
const getResults = (inputId) => byId(getCfg(inputId).results);
const stopEvent = (event) => {
  event?.preventDefault?.();
  event?.stopPropagation?.();
};
const setHeaderOpen = (open, options = {}) => {
  const expand = byId("header-search-expand");
  const button = byId("header-search-btn");
  const input = byId("header-search-input");
  if (!expand) return;
  if (!open) {
    if (expand.contains(document.activeElement)) {
      document.activeElement.blur?.();
      if (options.restoreFocus) button?.focus({ preventScroll: true });
    }
    expand.inert = true;
  } else expand.inert = false;
  expand.classList.toggle("hidden", !open);
  expand.setAttribute("aria-hidden", String(!open));
  button?.setAttribute("aria-expanded", String(open));
  if (open) input?.focus({ preventScroll: true });
};
const hideResults = (inputId) => getResults(inputId)?.classList.add("hidden");
const setClear = (inputId, visible) => byId(getCfg(inputId).clear)?.classList.toggle("hidden", !visible);
const updateQuery = (query) => typeof AppState !== "undefined" && (AppState.searchQuery = query);
const escapeHtml = (text) => String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const normalize = (text) =>
  String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s.]+/g, " ").toLowerCase().trim();
const tokensFor = (query) => normalize(query).split(/\s+/).filter(Boolean);
const renderEmptyPrompt = (inputId) => {
  const container = getResults(inputId);
  if (!container) return;
  container.innerHTML = '<div class="p-4 text-center text-govpt-gray"><p class="text-sm">Digite pelo menos 2 caracteres para pesquisar</p></div>'; container.classList.remove("hidden");
};

function normalizeMap(text) {
  const source = String(text || "");
  let normalized = "";
  const map = [];
  for (let i = 0; i < source.length; i += 1) {
    for (const char of source[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
      normalized += char.toLowerCase();
      map.push(i);
    }
  }
  return { source, normalized, map };
}

function highlight(text, query) {
  if (!text || !query) return escapeHtml(text || "");
  const { source, normalized, map } = normalizeMap(text);
  const ranges = [];
  tokensFor(query).forEach((token) => {
    let start = normalized.indexOf(token);
    while (start !== -1) {
      ranges.push([map[start], map[start + token.length - 1] + 1]);
      start = normalized.indexOf(token, start + token.length);
    }
  });
  if (!ranges.length) return escapeHtml(source);
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  ranges.forEach(([start, end]) => {
    const last = merged[merged.length - 1];
    last && start <= last[1] ? (last[1] = Math.max(last[1], end)) : merged.push([start, end]);
  });
  let cursor = 0;
  return merged
    .map(([start, end]) => {
      const chunk = `${escapeHtml(source.slice(cursor, start))}<span class="search-highlight">${escapeHtml(source.slice(start, end))}</span>`;
      cursor = end;
      return chunk;
    })
    .join("") + escapeHtml(source.slice(cursor));
}

async function initializeSearch() {
  if (SearchState.initPromise) return SearchState.initPromise;
  SearchState.initPromise = (async () => {
    try {
      const response = await fetch("assets/data/search-index.json");
      SearchState.index = await response.json();
    } catch (error) {
      console.error("Error initializing search:", error);
      SearchState.index = FALLBACK_INDEX;
    }
    SearchState.fuse = new Fuse(SearchState.index, {
      keys: ["code", "title", "text", "section", "keywords", "category"],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      shouldSort: true,
      findAllMatches: true,
    });
    bindSearchEvents();
  })();
  return SearchState.initPromise;
}

function performSearch(query) {
  if (!SearchState.fuse) return [];
  const tokens = tokensFor(query);
  if (!tokens.length) return [];
  const groups = tokens.map((token) => SearchState.fuse.search(token));
  const hrefs = groups.reduce((set, group, index) => {
    const current = new Set(group.map((item) => item.item.href));
    return index ? new Set([...set].filter((href) => current.has(href))) : current;
  }, new Set());
  return groups
    .flat()
    .filter((item, index, list) => hrefs.has(item.item.href) && index === list.findIndex((entry) => entry.item.href === item.item.href))
    .map((item) => ({ ...item.item, score: item.score, matches: item.matches }));
}

const resultBadge = (type) =>
  type === "subprocess"
    ? { label: "Subprocesso", classes: "bg-purple-100 text-purple-800" }
    : { label: type === "asset" ? "Diagrama" : "Processo", classes: "bg-amber-100 text-amber-800" };

function renderResults(results, query, inputId) {
  const container = getResults(inputId);
  if (!container) return;
  if (getCfg(inputId).header) setHeaderOpen(true);
  if (!results.length) {
    container.innerHTML = `<div class="p-4 text-center text-govpt-gray"><svg class="h-8 w-8 mx-auto mb-2 text-govpt-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><p class="text-sm">Nenhum resultado encontrado para "${escapeHtml(query)}"</p><p class="text-xs mt-1">Tente usar termos diferentes ou menos especificos</p></div>`;
    container.classList.remove("hidden");
    return;
  }
  const items = results.slice(0, 8).map((result) => {
    const badge = resultBadge(result.type);
    const code = result.code ? `${getDisplayCode?.(result) || result.code}: ` : "";
    const title = `${highlight(code, query)}${highlight(result.title, query)}`;
    const text = highlight(`${(result.text || "").slice(0, 150)}...`, query);
    const keywords = (result.keywords || []).slice(0, 3).map((word) => `<span class="text-xs px-2 py-1 bg-govpt-light text-govpt-text rounded">${escapeHtml(word)}</span>`).join("");
    return `<div class="p-4 hover:bg-govpt-light cursor-pointer border-b govpt-border last:border-b-0 search-result-item" onclick="selectSearchResult('${result.href}', '${inputId}')"><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center mb-1"><span class="text-xs font-medium px-2 py-1 rounded-full ${badge.classes}">${badge.label}</span><span class="ml-2 text-xs text-govpt-gray">${escapeHtml(result.category || "")}</span></div><h4 class="font-medium text-govpt-heading mb-1">${title}</h4><p class="text-sm text-govpt-text">${text}</p>${keywords ? `<div class="flex flex-wrap gap-1 mt-2">${keywords}</div>` : ""}</div><i data-feather="chevron-right" class="w-4 h-4 text-govpt-gray mt-1"></i></div></div>`;
  }).join("");
  container.innerHTML = `<div class="px-4 py-2 bg-govpt-light border-b govpt-border"><div class="flex items-center justify-between"><span class="text-sm text-govpt-text">${results.length} resultado${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}</span><button type="button" onclick="clearSearchQuery('${inputId}', event, true)" class="text-sm text-govpt-gray hover:text-govpt-text transition-colors">Limpar</button></div></div>${items}`;
  container.classList.remove("hidden");
  if (typeof feather !== "undefined") feather.replace();
}

function clearSearchQuery(inputId, event, keepResultsOpen = false) {
  stopEvent(event);
  const input = byId(inputId);
  if (input) input.value = "";
  setClear(inputId, false);
  SearchState.selected[inputId] = -1;
  updateQuery("");
  if (keepResultsOpen) renderEmptyPrompt(inputId);
  else hideResults(inputId);
  if (getCfg(inputId).header && !event?.dismissOnly) {
    setHeaderOpen(true);
  }
}

function resetSearch(inputId, event, options = {}) {
  stopEvent(event);
  clearSearchQuery(inputId, { dismissOnly: true }, false);
  if (getCfg(inputId).header) setHeaderOpen(false, options);
}

function showSearchResults() {
  if (typeof AppState !== "undefined" && (AppState.searchQuery || "").length >= 2) byId("search-results")?.classList.remove("hidden");
}

function findSubprocessByCode(code) {
  for (const process of AppState?.processes || []) {
    const version = process.versions?.find((item) => item.id === process.current_version_id) || process.versions?.[0];
    const subprocess = version?.subprocesses?.find((item) => item.code === code);
    if (subprocess) return subprocess;
  }
  return null;
}

function navigateFromResult(href) {
  if (href.startsWith("#process-")) {
    const process = AppState?.processes?.find((item) => item.code === href.replace("#process-", ""));
    if (process) return showProcessDetail(process.id);
  }
  if (href.startsWith("#asset-")) {
    const process = AppState?.processes?.find((item) => item.code === href.replace("#asset-", ""));
    if (process) return showProcessDetail(process.id, { activeTab: "assets" }), setTimeout(() => window.fitBPMN?.(), 800);
  }
  if (href.startsWith("#subprocess-")) {
    const subprocess = findSubprocessByCode(href.replace("#subprocess-", ""));
    if (subprocess) return showSubprocessDetail(subprocess.id);
    return window.showNotification?.("Este subprocesso ainda nao esta disponivel no sistema.");
  }
  if (href.startsWith("#")) byId(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
}

function selectSearchResult(href, inputId) {
  resetSearch(inputId);
  navigateFromResult(href);
  setTimeout(() => window.fitBPMN?.(), 800);
}

function performAdvancedSearch(filters = {}) {
  let results = [...SearchState.index];
  if (filters.category && filters.category !== "all") results = results.filter((item) => item.category === filters.category);
  if (filters.type && filters.type !== "all") results = results.filter((item) => item.type === filters.type);
  if (filters.query?.trim()) {
    const hrefs = new Set(performSearch(filters.query).map((item) => item.href));
    results = results.filter((item) => hrefs.has(item.href));
  }
  return results;
}

function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];
  const needle = query.toLowerCase();
  const values = new Set();
  SearchState.index.forEach((item) => {
    if (item.title?.toLowerCase().includes(needle)) values.add(item.title);
    (item.keywords || []).forEach((word) => word.toLowerCase().includes(needle) && values.add(word));
  });
  return [...values].slice(0, 5);
}

function updateSelection(inputId, direction) {
  const items = [...(getResults(inputId)?.querySelectorAll(".search-result-item") || [])];
  if (!items.length) return;
  const next = Math.max(-1, Math.min((SearchState.selected[inputId] ?? -1) + direction, items.length - 1));
  SearchState.selected[inputId] = next;
  items.forEach((item, index) => item.classList.toggle("bg-igfej-light", index === next));
  if (next >= 0) items[next].scrollIntoView({ block: "nearest" });
}

function handleSearch(event) {
  const inputId = event?.target?.id;
  if (!SEARCH_INPUTS.includes(inputId)) return;
  const query = event.target.value.trim();
  setClear(inputId, query.length > 0);
  SearchState.selected[inputId] = -1;
  updateQuery(query);
  if (TABLE_FILTERS[inputId]) return TABLE_FILTERS[inputId](query);
  if (!GLOBAL_INPUTS.includes(inputId)) return;
  if (query.length < 2) return hideResults(inputId);
  renderResults(performSearch(query), query, inputId);
}

function bindSearchEvents() {
  if (document.body.dataset.searchBound) return;
  document.body.dataset.searchBound = "true";
  document.addEventListener("input", handleSearch);
  document.addEventListener("keydown", (event) => {
    const inputId = event.target?.id;
    if (!GLOBAL_INPUTS.includes(inputId)) return;
    if (event.key === "ArrowDown") return event.preventDefault(), updateSelection(inputId, 1);
    if (event.key === "ArrowUp") return event.preventDefault(), updateSelection(inputId, -1);
    if (event.key === "Enter") {
      const items = getResults(inputId)?.querySelectorAll(".search-result-item") || [];
      const selected = SearchState.selected[inputId] ?? -1;
      if (selected >= 0 && items[selected]) return event.preventDefault(), items[selected].click();
    }
    if (event.key === "Escape") return resetSearch(inputId), event.target.blur();
  });
  document.addEventListener("click", (event) => {
    const welcomeShell = byId("welcome-search-shell");
    const headerInput = byId("header-search-input");
    const headerExpand = byId("header-search-expand");
    if (welcomeShell && !welcomeShell.contains(event.target) && !byId("search-results")?.contains(event.target)) resetSearch("welcome-search");
    if (
      headerInput &&
      !headerExpand?.contains(event.target) &&
      !event.target.closest("#header-search-btn")
    ) {
      resetSearch("header-search-input");
    }
  });
}

function hideSearchResults() { hideResults("welcome-search"); }
function closeHeaderSearchOnNavigation() { resetSearch("header-search-input"); if (!byId("welcome-search")?.value.trim()) setClear("welcome-search", false); }

document.addEventListener("DOMContentLoaded", initializeSearch);

window.initializeSearch = initializeSearch;
window.handleSearch = handleSearch;
window.selectSearchResult = selectSearchResult;
window.clearSearchQuery = clearSearchQuery;
window.clearSearch = resetSearch;
window.resetSearch = resetSearch;
window.showSearchResults = showSearchResults;
window.hideSearchResults = hideSearchResults;
window.closeHeaderSearchOnNavigation = closeHeaderSearchOnNavigation;
window.performAdvancedSearch = performAdvancedSearch;
window.getSearchSuggestions = getSearchSuggestions;
window.setHeaderSearchOpen = setHeaderOpen;
