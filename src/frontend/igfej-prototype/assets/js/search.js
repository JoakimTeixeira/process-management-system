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

    // Attach event listeners to all search inputs immediately
    attachSearchEventListeners();

    // Setup keyboard navigation for header search
    setupSearchKeyboardNavigation();
  } catch (error) {
    console.error("Error initializing search:", error);
    // Create fallback search index
    createFallbackSearchIndex();
  }
}

// Attach event listeners to search inputs
function attachSearchEventListeners() {
  const searchInputs = [
    "welcome-search",
    "header-search-input",
    "macroprocess-search",
    "process-search",
  ];

  console.log("Starting to attach search event listeners...");

  // First, try to attach to inputs that are already available
  let attachedCount = 0;
  searchInputs.forEach((inputId) => {
    const searchInput = document.getElementById(inputId);
    console.log(`Looking for input: ${inputId}`, {
      element: searchInput,
      exists: !!searchInput,
    });

    if (searchInput) {
      console.log(`Attaching event listener to: ${inputId}`);
      searchInput.addEventListener("input", handleSearch);
      console.log(`Event listener attached successfully to: ${inputId}`);
      attachedCount++;
    } else {
      console.warn(`Search input not found: ${inputId}`);
    }
  });

  // If not all inputs were found, set up a mutation observer to watch for them
  if (attachedCount < searchInputs.length) {
    console.log("Setting up mutation observer for remaining search inputs...");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this node or its children contain our search inputs
            searchInputs.forEach((inputId) => {
              const searchInput = node.querySelector
                ? node.querySelector(`#${inputId}`)
                : null;
              if (
                searchInput &&
                !searchInput.hasAttribute("data-search-attached")
              ) {
                console.log(
                  `Found and attaching event listener to dynamically added: ${inputId}`,
                );
                searchInput.addEventListener("input", handleSearch);
                searchInput.setAttribute("data-search-attached", "true");
                console.log(
                  `Event listener attached to dynamically added: ${inputId}`,
                );
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also try again after a short delay in case elements are added after DOMContentLoaded
    setTimeout(() => {
      searchInputs.forEach((inputId) => {
        const searchInput = document.getElementById(inputId);
        if (searchInput && !searchInput.hasAttribute("data-search-attached")) {
          console.log(`Attaching event listener to delayed: ${inputId}`);
          searchInput.addEventListener("input", handleSearch);
          searchInput.setAttribute("data-search-attached", "true");
          console.log(`Event listener attached to delayed: ${inputId}`);
        }
      });
      observer.disconnect(); // Clean up observer after delay
    }, 1000);
  }

  console.log("Finished attaching search event listeners");

  // Add click-outside handler for welcome search
  setupWelcomeSearchClickOutside();
}

// Setup click-outside handler for welcome search
function setupWelcomeSearchClickOutside() {
  const welcomeSearchInput = document.getElementById("welcome-search");
  const searchResultsContainer = document.getElementById("search-results");

  if (welcomeSearchInput && searchResultsContainer) {
    // Add click-outside handler
    document.addEventListener("click", function (e) {
      // Check if click is outside welcome search input and results container
      if (
        !welcomeSearchInput.contains(e.target) &&
        !searchResultsContainer.contains(e.target)
      ) {
        // Only close if results are currently visible
        if (!searchResultsContainer.classList.contains("hidden")) {
          clearSearch("welcome-search");
        }
      }
    });

    // Add Escape key handler
    welcomeSearchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        clearSearch("welcome-search");
        welcomeSearchInput.blur();
      }
    });
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
  const inputId = event.target.id;

  console.log("Search triggered:", { inputId, query, length: query.length });

  // Show/hide clear button for welcome search
  if (inputId === "welcome-search") {
    const clearBtn = document.getElementById("welcome-search-clear");
    if (clearBtn) {
      if (query.length > 0) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }
  }

  // Show/hide clear button for header search
  if (inputId === "header-search-input") {
    const clearBtn = document.getElementById("header-search-clear");
    if (clearBtn) {
      if (query.length > 0) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }
  }

  // Check if AppState is available (defined in main.js)
  if (typeof AppState === "undefined") {
    console.warn("AppState not available, search functionality limited");
    return;
  }

  AppState.searchQuery = query;

  // Table searches are handled by their respective table managers
  // Only handle global search for welcome and header searches
  if (inputId !== "welcome-search" && inputId !== "header-search-input") {
    return; // Let table managers handle table-specific searches
  }

  if (query.length < 2) {
    hideSearchResults();
    return;
  }

  const results = performSearch(query);
  console.log("Search results:", { resultsCount: results.length, results });
  displaySearchResults(results, query, inputId);
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
function displaySearchResults(results, query, inputId) {
  console.log("Displaying search results:", {
    inputId,
    query,
    resultsCount: results.length,
  });

  // Determine which results container to use based on input
  let resultsContainerId = "search-results";
  let needsExpand = false;

  if (inputId === "header-search-input") {
    resultsContainerId = "header-search-results";
    needsExpand = true;
    console.log("Using header search results container");
  }

  const resultsContainer = document.getElementById(resultsContainerId);
  console.log("Results container:", {
    resultsContainerId,
    container: resultsContainer,
    exists: !!resultsContainer,
  });

  if (!resultsContainer) {
    console.error("Results container not found:", resultsContainerId);
    return;
  }

  // For header search, ensure the expandable div is visible
  if (needsExpand) {
    const headerSearchExpand = document.getElementById("header-search-expand");
    console.log("Header search expand element:", {
      element: headerSearchExpand,
      exists: !!headerSearchExpand,
      isHidden: headerSearchExpand
        ? headerSearchExpand.classList.contains("hidden")
        : "N/A",
    });
    if (headerSearchExpand) {
      headerSearchExpand.classList.remove("hidden");
      console.log("Made header search expand visible");
    }
  }

  if (results.length === 0) {
    resultsContainer.innerHTML = `
            <div class="p-4 text-center text-govpt-gray">
                <svg class="h-8 w-8 mx-auto mb-2 text-govpt-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="p-4 hover:bg-govpt-light cursor-pointer border-b govpt-border last:border-b-0" onclick="selectSearchResult('${result.href}', '${inputId}')">
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
                <span class="ml-2 text-xs text-govpt-gray">${result.category}</span>
              </div>
              <h4 class="font-medium text-govpt-heading mb-1">${result.code ? `${getDisplayCode(result)}: ` : ""}${highlightedTitle}</h4>
              <p class="text-sm text-govpt-text">${highlightedText}</p>
              ${
                result.keywords && result.keywords.length > 0
                  ? `
                    <div class="flex flex-wrap gap-1 mt-2">
                      ${result.keywords
                        .slice(0, 3)
                        .map(
                          (keyword) =>
                            `<span class="text-xs px-2 py-1 bg-govpt-light text-govpt-text rounded">${keyword}</span>`,
                        )
                        .join("")}
                    </div>
                  `
                  : ""
              }
            </div>
            <i data-feather="chevron-right" class="w-4 h-4 text-govpt-gray mt-1"></i>
          </div>
        </div>
      `;
    })
    .join("");

  resultsContainer.innerHTML = `
        <div class="px-4 py-2 bg-govpt-light border-b govpt-border">
            <div class="flex items-center justify-between">
                <span class="text-sm text-govpt-text">${results.length} resultado${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}</span>
                <button onclick="clearSearch('${inputId}')" class="text-sm text-govpt-gray hover:text-govpt-text transition-colors">
                    Limpar
                </button>
            </div>
        </div>
        ${resultsHTML}
    `;

  // Re-render feather icons
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  resultsContainer.classList.remove("hidden");
}

// Filter macroprocesses table
function filterMacroprocesses(query) {
  if (typeof window.filterMacroprocessTable === "function") {
    window.filterMacroprocessTable(query);
  }
}

// Filter processes table
function filterProcesses(query) {
  if (typeof window.filterProcessTable === "function") {
    window.filterProcessTable(query);
  }
}

// Clear table filters
function clearTableFilters(inputId) {
  if (inputId === "macroprocess-search") {
    filterMacroprocesses("");
  } else if (inputId === "process-search") {
    filterProcesses("");
  }
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
function selectSearchResult(href, inputId) {
  hideSearchResults();

  // Clear the specific search input that was used
  const searchInput = document.getElementById(inputId);
  if (searchInput) {
    searchInput.value = "";
  }

  if (typeof AppState !== "undefined") {
    AppState.searchQuery = "";
  }

  // Navigate to the result
  if (href.startsWith("#process-")) {
    const processCode = href.replace("#process-", "");
    // Find process by code
    if (typeof AppState !== "undefined" && AppState.processes) {
      const process = AppState.processes.find((p) => p.code === processCode);
      if (process) {
        showProcessDetail(process.id);
        // Apply fit viewport after process detail is loaded and BPMN is ready
        setTimeout(() => {
          if (window.fitBPMN && typeof window.fitBPMN === "function") {
            window.fitBPMN();
          }
        }, 800); // Longer delay to ensure everything is loaded
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
        // Apply fit viewport after assets tab is loaded and diagram is ready
        setTimeout(() => {
          if (window.fitBPMN && typeof window.fitBPMN === "function") {
            window.fitBPMN();
          }
        }, 900); // Even longer delay for assets (100ms + 800ms)
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
            // Apply fit viewport after subprocess detail is loaded and BPMN is ready
            setTimeout(() => {
              if (window.fitBPMN && typeof window.fitBPMN === "function") {
                window.fitBPMN();
              }
            }, 800); // Same delay as process for consistency
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
function clearSearch(inputId) {
  // Clear the specific search input
  const searchInput = document.getElementById(inputId);
  if (searchInput) {
    searchInput.value = "";
  }

  // Hide clear button for welcome search
  if (inputId === "welcome-search") {
    const clearBtn = document.getElementById("welcome-search-clear");
    if (clearBtn) {
      clearBtn.classList.add("hidden");
    }
  }

  // Hide clear button for header search
  if (inputId === "header-search-input") {
    const clearBtn = document.getElementById("header-search-clear");
    if (clearBtn) {
      clearBtn.classList.add("hidden");
    }
  }

  if (typeof AppState !== "undefined") {
    AppState.searchQuery = "";
  }

  // Hide the appropriate results container
  if (inputId === "header-search-input") {
    const resultsContainer = document.getElementById("header-search-results");
    if (resultsContainer) {
      resultsContainer.classList.add("hidden");
    }
    // Also hide the header search expand container
    const headerSearchExpand = document.getElementById("header-search-expand");
    if (headerSearchExpand) {
      headerSearchExpand.classList.add("hidden");
    }
    // Update header search button state
    const headerSearchBtn = document.getElementById("header-search-btn");
    if (headerSearchBtn) {
      headerSearchBtn.setAttribute("aria-expanded", "false");
    }
  } else {
    hideSearchResults();
  }
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
  // Setup for welcome search
  const welcomeSearchInput = document.getElementById("welcome-search");
  const welcomeResultsContainer = document.getElementById("search-results");

  if (welcomeSearchInput && welcomeResultsContainer) {
    setupKeyboardNavForInput(welcomeSearchInput, welcomeResultsContainer);
  }

  // Setup for header search
  const headerSearchInput = document.getElementById("header-search-input");
  const headerResultsContainer = document.getElementById(
    "header-search-results",
  );

  if (headerSearchInput && headerResultsContainer) {
    setupKeyboardNavForInput(headerSearchInput, headerResultsContainer);
  }
}

// Helper function for keyboard navigation setup
function setupKeyboardNavForInput(searchInput, resultsContainer) {
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

// Close header search when navigation occurs
function closeHeaderSearchOnNavigation() {
  const headerSearchExpand = document.getElementById("header-search-expand");
  const headerSearchBtn = document.getElementById("header-search-btn");

  if (headerSearchExpand && !headerSearchExpand.classList.contains("hidden")) {
    // Clear the search and close the expand container
    if (window.clearSearch) {
      window.clearSearch("header-search-input");
    }
    // Ensure the expand container is hidden and button state is updated
    headerSearchExpand.classList.add("hidden");
    if (headerSearchBtn) {
      headerSearchBtn.setAttribute("aria-expanded", "false");
      headerSearchExpand.setAttribute("aria-hidden", "true");
    }
  }

  // Also reset welcome search clear button state when navigating
  const welcomeSearchInput = document.getElementById("welcome-search");
  const welcomeClearBtn = document.getElementById("welcome-search-clear");

  if (welcomeSearchInput && welcomeClearBtn) {
    // If the welcome search input is empty, ensure the clear button is hidden
    if (welcomeSearchInput.value.trim().length === 0) {
      welcomeClearBtn.classList.add("hidden");
    }
  }
}

// Export search functions
window.initializeSearch = initializeSearch;
window.handleSearch = handleSearch;
window.selectSearchResult = selectSearchResult;
window.clearSearch = clearSearch;
window.showSearchResults = showSearchResults;
window.hideSearchResults = hideSearchResults;
window.closeHeaderSearchOnNavigation = closeHeaderSearchOnNavigation;
