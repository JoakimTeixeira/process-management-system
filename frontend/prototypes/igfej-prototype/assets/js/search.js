// Search functionality for IGFEJ Process Management System

let searchIndex = null;
let fuse = null;

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
});

async function initializeSearch() {
  try {
    // Load search index
    const response = await fetch("assets/data/search-index.json");
    const data = await response.json();
    searchIndex = data;

    // Initialize Fuse.js for fuzzy search
    fuse = new Fuse(searchIndex, {
      keys: ["title", "text", "section", "keywords", "category"],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      shouldSort: true,
      findAllMatches: true,
    });

    // Attach event listener to search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", handleSearch);
    }

    // Setup keyboard navigation
    setupSearchKeyboardNavigation();
  } catch (error) {
    console.error("Error initializing search:", error);
    // Create fallback search index
    createFallbackSearchIndex();
  }
}

// Create fallback search index if JSON loading fails
function createFallbackSearchIndex() {
  const fallbackData = [
    {
      title: "Mudança de Local do Utilizador",
      text: "Processo de mudança de local de utilizador",
      category: "Gestão de Serviços",
      keywords: ["mudança", "local", "utilizador"],
      href: "#process-4.0",
      type: "process",
    },
    {
      title: "Gestão de Acessos e Utilizadores",
      text: "Processos operacionais de gestão de acessos e utilizadores",
      category: "Gestão de Serviços",
      keywords: ["acessos", "utilizadores", "gestão"],
      href: "#process-5.0",
      type: "process",
    },
    {
      title: "Criação de Utilizador",
      text: "Criação de conta de utilizador em diretório (ex.: AD) e disponibilização de credenciais e acessos base",
      category: "Gestão de Serviços",
      keywords: ["utilizador", "conta", "acesso", "active directory"],
      href: "#subprocess-5.1",
      type: "subprocess",
    },
  ];

  searchIndex = fallbackData;
  fuse = new Fuse(searchIndex, {
    keys: ["title", "text", "category", "keywords"],
    threshold: 0.3,
    includeScore: true,
  });
}

// Handle search input
function handleSearch(event) {
  const query = event.target.value.trim();

  // Check if AppState is available (defined in main.js)
  if (typeof AppState === "undefined") {
    console.warn("AppState not available, search functionality limited");
    return;
  }

  AppState.searchQuery = query;

  if (query.length < 2) {
    hideSearchResults();
    return;
  }

  const results = performSearch(query);
  displaySearchResults(results, query);
}

// Perform search using Fuse.js
function performSearch(query) {
  if (!fuse) return [];

  const results = fuse.search(query);
  return results.map((result) => ({
    ...result.item,
    score: result.score,
    matches: result.matches,
  }));
}

// Display search results
function displaySearchResults(results, query) {
  const resultsContainer = document.getElementById("search-results");
  if (!resultsContainer) return;

  if (results.length === 0) {
    resultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <svg class="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="text-sm">Nenhum resultado encontrado para "${query}"</p>
                <p class="text-xs mt-1">Tente usar termos diferentes ou menos específicos</p>
            </div>
        `;
    resultsContainer.classList.remove("hidden");
    return;
  }

  const resultsHTML = results
    .slice(0, 8)
    .map((result) => {
      const highlightedTitle = highlightText(result.title, query);
      const highlightedText = highlightText(
        result.text.substring(0, 150) + "...",
        query,
      );

      return `
        <div class="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onclick="selectSearchResult('${result.href}')">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs font-medium px-2 py-1 rounded-full ${
                  result.type === "subprocess"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-amber-100 text-amber-800"
                }">
                  ${result.type === "subprocess" ? "Subprocesso" : "Processo"}
                </span>
                <span class="ml-2 text-xs text-gray-500">${result.category}</span>
              </div>
              <h4 class="font-medium text-gray-900 mb-1">${result.code ? `${getDisplayCode(result)}: ` : ""}${highlightedTitle}</h4>
              <p class="text-sm text-gray-600">${highlightedText}</p>
              ${
                result.keywords && result.keywords.length > 0
                  ? `
                    <div class="flex flex-wrap gap-1 mt-2">
                      ${result.keywords
                        .slice(0, 3)
                        .map(
                          (keyword) =>
                            `<span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">${keyword}</span>`,
                        )
                        .join("")}
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  resultsContainer.innerHTML = `
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">${results.length} resultado${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}</span>
                <button onclick="clearSearch()" class="text-sm text-gray-500 hover:text-gray-700">
                    Limpar
                </button>
            </div>
        </div>
        ${resultsHTML}
    `;

  resultsContainer.classList.remove("hidden");
}

// Highlight search terms in text
function highlightText(text, query) {
  if (!query || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Escape special characters for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Show search results
function showSearchResults() {
  const resultsContainer = document.getElementById("search-results");
  if (
    resultsContainer &&
    typeof AppState !== "undefined" &&
    AppState.searchQuery.length >= 2
  ) {
    resultsContainer.classList.remove("hidden");
  }
}

// Hide search results
function hideSearchResults() {
  const resultsContainer = document.getElementById("search-results");
  if (resultsContainer) {
    resultsContainer.classList.add("hidden");
  }
}

// Select search result
function selectSearchResult(href) {
  hideSearchResults();

  // Clear search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    if (typeof AppState !== "undefined") {
      AppState.searchQuery = "";
    }
  }

  // Navigate to the result
  if (href.startsWith("#process-")) {
    const processCode = href.replace("#process-", "");
    // Find process by code
    if (typeof AppState !== "undefined" && AppState.processes) {
      const process = AppState.processes.find((p) => p.code === processCode);
      if (process) {
        showProcessDetail(process.id);
      }
    }
  } else if (href.startsWith("#asset-")) {
    const assetCode = href.replace("#asset-", "");
    // Find process by asset code and show assets tab
    if (typeof AppState !== "undefined" && AppState.processes) {
      const process = AppState.processes.find((p) => p.code === assetCode);
      if (process) {
        showProcessDetail(process.id);
        // Switch to assets tab after a short delay
        setTimeout(() => switchTab("assets"), 100);
      }
    }
  } else if (href.startsWith("#subprocess-")) {
    const subprocessCode = href.replace("#subprocess-", "");
    // Find subprocess by code and navigate directly to subprocess detail
    if (
      typeof window.showSubprocessDetail !== "undefined" &&
      typeof AppState !== "undefined" &&
      AppState.processes
    ) {
      // Find the subprocess across all processes
      for (const process of AppState.processes) {
        const currentVersion =
          process.versions?.find((v) => v.id === process.current_version_id) ||
          process.versions?.[0];

        if (currentVersion?.subprocesses) {
          const subprocess = currentVersion?.subprocesses?.find(
            (s) => s.code === subprocessCode,
          );
          if (subprocess) {
            window.showSubprocessDetail(subprocess.id);
            return;
          }
        }
      }
      // If subprocess not found in real data, show a message
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Este subprocesso ainda não está disponível no sistema.",
        );
      }
    } else {
      //
    }
  } else if (href.startsWith("#")) {
    // Handle other navigation
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  }
}

// Clear search
function clearSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    if (typeof AppState !== "undefined") {
      AppState.searchQuery = "";
    }
  }
  hideSearchResults();
}

// Advanced search functionality
function performAdvancedSearch(filters) {
  if (!searchIndex) return [];

  let results = [...searchIndex];

  // Apply filters
  if (filters.category && filters.category !== "all") {
    results = results.filter((item) => item.category === filters.category);
  }

  if (filters.type && filters.type !== "all") {
    results = results.filter((item) => item.type === filters.type);
  }

  if (filters.query && filters.query.trim()) {
    const fuseResults = fuse.search(filters.query);
    const fuseIds = new Set(fuseResults.map((r) => r.item.href));
    results = results.filter((item) => fuseIds.has(item.href));
  }

  return results;
}

// Search suggestions
function getSearchSuggestions(query) {
  if (!searchIndex || query.length < 2) return [];

  const suggestions = new Set();

  // Extract from titles
  searchIndex.forEach((item) => {
    if (item.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(item.title);
    }
  });

  // Extract from keywords
  searchIndex.forEach((item) => {
    if (item.keywords) {
      item.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(keyword);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

// Keyboard navigation for search
function setupSearchKeyboardNavigation() {
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");

  if (!searchInput || !resultsContainer) return;

  let selectedIndex = -1;

  searchInput.addEventListener("keydown", (e) => {
    const items = resultsContainer.querySelectorAll(
      '[onclick*="selectSearchResult"]',
    );

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSearchSelection(items, selectedIndex);
        break;

      case "ArrowUp":
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSearchSelection(items, selectedIndex);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          items[selectedIndex].click();
        }
        break;

      case "Escape":
        hideSearchResults();
        searchInput.blur();
        break;
    }
  });
}

// Update search selection highlighting
function updateSearchSelection(items, selectedIndex) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("bg-igfej-light");
    } else {
      item.classList.remove("bg-igfej-light");
    }
  });

  // Scroll selected item into view
  if (selectedIndex >= 0 && items[selectedIndex]) {
    items[selectedIndex].scrollIntoView({ block: "nearest" });
  }
}

// Export search functions
window.initializeSearch = initializeSearch;
window.handleSearch = handleSearch;
window.selectSearchResult = selectSearchResult;
window.clearSearch = clearSearch;
window.showSearchResults = showSearchResults;
window.hideSearchResults = hideSearchResults;
