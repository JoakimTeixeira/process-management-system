function getFooterTemplate() {
  return `
    <footer class="mt-auto bg-govpt-dark text-white">
      <div class="w-full px-4 py-6">
        <div class="max-w-govpt-container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p class="text-sm text-gray-300">&copy; 2026 IGFEJ - Inspeção-Geral dos Serviços de Justiça</p>
            <p class="mt-1 text-xs text-gray-400">Sistema de Gestão de Processos</p>
          </div>
          <div class="flex items-center gap-6 text-sm">
            <button type="button" onclick="navigateToSection('faq')" class="text-gray-300 transition-colors hover:text-white">FAQ</button>
            <button type="button" onclick="navigateToSection('methodology')" class="text-gray-300 transition-colors hover:text-white">Metodologia</button>
            <button type="button" onclick="navigateToSection('introduction')" class="text-gray-300 transition-colors hover:text-white">Ajuda</button>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function getAppShell() {
  return `
    ${getHeaderTemplate()}
    ${getDesktopNavTemplate()}
    <div class="content-wrapper">
      <div class="max-w-6xl mx-auto w-full">
        <div class="sidebar-container">
          ${getSidebarTemplate()}
          <main id="main-content" class="flex-1 p-8 transition-all duration-300 print:p-4 lg:p-12">
            <div id="content-area">
              <div class="max-w-govpt-container mx-auto px-4">
                <nav id="breadcrumb" class="hidden"><div class="flex items-center text-sm"></div></nav>
              </div>
              ${window.getWelcomeSection?.() || ""}
              ${window.getIntroductionSection?.() || ""}
              ${window.getDashboardSection?.() || ""}
              ${window.getFAQSection?.() || ""}
              ${window.getMethodologySection?.() || ""}
            </div>
          </main>
        </div>
      </div>
    </div>
    ${getFooterTemplate()}
  `;
}

window.getAppShell = getAppShell;
