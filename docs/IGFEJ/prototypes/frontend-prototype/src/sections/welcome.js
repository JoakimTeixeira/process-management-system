const WELCOME_SERVICE_CARDS = [
  { label: "Introdução", text: "Saiba mais sobre a importância da análise de processos e metodologias utilizadas.", icon: "info", href: "#introduction-overview", action: "navigateToSectionAnchor('introduction', 'introduction-overview'); return false;" },
  { label: "Dashboard", text: "Estatísticas e métricas dos processos em tempo real.", icon: "bar-chart-2", href: "#dashboard-overview", action: "navigateToSectionAnchor('dashboard', 'dashboard-overview'); return false;" },
  { label: "Macroprocessos", text: "Visualize e analise os macroprocessos organizacionais.", icon: "layers", href: "#dashboard-macroprocesses", action: "navigateToSectionAnchor('dashboard', 'dashboard-macroprocesses'); return false;" },
  { label: "Processos", text: "Gestão detalhada de todos os processos organizacionais.", icon: "git-branch", href: "#dashboard-processes", action: "navigateToSectionAnchor('dashboard', 'dashboard-processes'); return false;" },
  { label: "Subprocessos", text: "Explore todos os subprocessos organizacionais com detalhes completos.", icon: "settings", href: "#dashboard-subprocesses", action: "navigateToSectionAnchor('dashboard', 'dashboard-subprocesses'); return false;" },
  { label: "Diagramas", text: "Visualize todos os diagramas dos processos organizacionais.", icon: "grid", href: "#dashboard-diagrams", action: "navigateToSectionAnchor('dashboard', 'dashboard-diagrams'); return false;" },
  { label: "FAQ", text: "Tire suas dúvidas sobre o sistema de gestão de processos.", icon: "help-circle", href: "#faq-overview", action: "navigateToSectionAnchor('faq', 'faq-overview'); return false;" },
  { label: "Contactos", text: "Entre em contato com a equipa do IGFEJ para suporte e informações.", icon: "mail", href: "#introduction-contact", action: "navigateToSectionAnchor('introduction', 'introduction-contact'); return false;" },
];

function renderServiceCard(card) {
  return `<button type="button" onclick="${card.action.replace("; return false;", "")}" class="flex h-full w-full flex-col rounded border border-govpt-border bg-white p-6 text-left text-inherit no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-govpt-primary hover:shadow-lg"><div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-govpt-blue-light"><i data-feather="${card.icon}" class="h-6 w-6 text-govpt-primary"></i></div><h3 class="mb-2 text-lg font-semibold text-govpt-heading">${card.label}</h3><p class="grow text-sm text-govpt-gray">${card.text}</p></button>`;
}

function getWelcomeSection() {
  return `
    <section id="welcome" class="content-section">
      <div class="max-w-govpt-container mx-auto px-4 py-8">
        <div class="mb-8 text-center">
          <h1 class="mb-4 text-govpt-3xl font-bold text-govpt-heading">Sistema de Gestão de Processos</h1>
          <p class="mb-6 text-govpt-lg leading-relaxed text-govpt-gray">Plataforma para análise e gestão de processos de negócio e TI da IGFEJ.</p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <button type="button" onclick="navigateToSection('dashboard')" class="inline-flex min-h-11 items-center justify-center rounded border-2 border-govpt-primary bg-govpt-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:border-govpt-secondary hover:bg-govpt-secondary"><i data-feather="bar-chart-2" class="mr-2 h-4 w-4"></i>Dashboard</button>
            <button type="button" onclick="navigateToSection('methodology')" class="inline-flex min-h-11 items-center justify-center rounded border-2 border-govpt-primary bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-govpt-primary transition-all duration-200 hover:bg-govpt-primary hover:text-white"><i data-feather="book-open" class="mr-2 h-4 w-4"></i>Metodologia</button>
          </div>
        </div>

        <div class="mb-8 rounded-lg border border-govpt-border bg-white p-6">
          <h2 class="mb-6 text-center text-govpt-2xl font-semibold text-govpt-heading">Encontre o processo que procura</h2>
          <div id="welcome-search-shell" class="relative mx-auto max-w-xl">
            <input id="welcome-search" type="text" placeholder="Pesquisar processos, macroprocessos..." onfocus="showSearchResults()" class="govpt-input w-full border-2 border-govpt-primary pl-4 pr-20 text-govpt-base" />
            <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-govpt-primary"><i data-feather="search" class="h-5 w-5"></i></div>
            <button type="button" id="welcome-search-clear" onclick="clearSearchQuery('welcome-search', event)" class="absolute right-10 top-1/2 hidden -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Limpar pesquisa"><i data-feather="x" class="h-4 w-4"></i></button>
            <div id="search-results" class="absolute left-0 right-0 top-full z-50 mt-2 hidden max-h-96 overflow-y-auto rounded-lg border border-govpt-border bg-white shadow-lg"></div>
          </div>
        </div>

        <div>
          <h2 class="mb-6 text-center text-govpt-2xl font-semibold text-govpt-heading">Serviços Disponíveis</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">${WELCOME_SERVICE_CARDS.map(renderServiceCard).join("")}</div>
        </div>
      </div>
    </section>
  `;
}

window.getWelcomeSection = getWelcomeSection;
