function getHeaderTemplate() {
  return `
    <header class="bg-white border-b border-govpt-border">
      <div class="max-w-govpt-container mx-auto px-4">
        <div class="flex items-center justify-between py-4">
          <div>
            <h1 class="text-2xl font-bold text-govpt-heading">IGFEJ</h1>
            <p class="text-sm text-govpt-gray">Inspeção-Geral dos Serviços de Justiça</p>
          </div>
          <div class="relative">
            <button
              id="header-search-btn"
              type="button"
              class="flex items-center gap-2 rounded-lg p-2 text-govpt-gray transition-colors hover:bg-govpt-light"
              aria-label="Pesquisar processos"
              aria-expanded="false"
              aria-controls="header-search-expand"
            >
              <i data-feather="search" class="h-5 w-5" aria-hidden="true"></i>
              <span class="text-sm font-medium">Pesquisar</span>
            </button>
            <div
              id="header-search-expand"
              class="absolute right-0 top-full z-50 mt-2 hidden w-96 rounded-lg border border-govpt-border bg-white"
              role="search"
              aria-hidden="true"
              inert
            >
              <div class="p-3">
                <label for="header-search-input" class="sr-only">Pesquisar processos</label>
                <div class="relative">
                  <input id="header-search-input" type="text" placeholder="Pesquisar processos..." aria-label="Pesquisar processos" class="govpt-input w-full pr-10" />
                  <button
                    type="button"
                    id="header-search-clear"
                    onclick="clearSearchQuery('header-search-input', event)"
                    class="absolute right-3 top-1/2 hidden -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                    aria-label="Limpar pesquisa"
                  >
                    <i data-feather="x" class="h-4 w-4"></i>
                  </button>
                </div>
                <div id="header-search-results" class="mt-2 hidden max-h-80 overflow-y-auto rounded-lg border border-govpt-border bg-white shadow-lg"></div>
              </div>
            </div>
          </div>
          <button id="mobile-menu-button" type="button" class="rounded-lg p-2 text-govpt-gray transition-colors hover:bg-govpt-light md:hidden">
            <i data-feather="menu" class="h-6 w-6"></i>
          </button>
        </div>
      </div>
    </header>
  `;
}

window.getHeaderTemplate = getHeaderTemplate;
