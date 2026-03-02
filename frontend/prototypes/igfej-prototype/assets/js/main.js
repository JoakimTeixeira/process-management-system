// Application state
const AppState = {
  currentView: "homepage",
  currentProcess: null,
  sidebarOpen: false,
  language: "pt",
  searchQuery: "",
  processes: [],
  macroprocesses: [],
};

// Function to generate hierarchical display codes for subprocesses
function getDisplayCode(item) {
  if (item.type === "subprocess" && item.parent_process_code) {
    // For subprocesses, use parent process code + . + subprocess index
    const parentCode = item.parent_process_code;
    // Extract the last number from subprocess code (e.g., 5.1 -> 1, 5.2 -> 2)
    const subprocessNum = item.code.split(".").pop();
    return `${parentCode}.${subprocessNum}`;
  }
  return item.code;
}

// Import JSON data from files (works in modern browsers)
let macroprocessesData = [];
let processesData = [];

// Load JSON data from files using fetch
async function loadJSONData() {
  try {
    // Fetch JSON files and parse them manually
    const [macroprocessesResponse, processesResponse] = await Promise.all([
      fetch("assets/data/macroprocesses.json"),
      fetch("assets/data/processes.json"),
    ]);

    if (!macroprocessesResponse.ok || !processesResponse.ok) {
      throw new Error("Failed to fetch JSON files");
    }

    AppState.macroprocesses = await macroprocessesResponse.json();
    AppState.processes = await processesResponse.json();

    // Set global variables for loadMockData function
    macroprocessesData = AppState.macroprocesses;
    processesData = AppState.processes;

    // Trigger app refresh if already loaded
    if (typeof window.refreshApp === "function") {
      window.refreshApp();
    }
  } catch (error) {
    console.error("Failed to load JSON files:", error);

    // Fallback to empty data when JSON files fail to load
    macroprocessesData = [];
    processesData = [];
  }
}

// Load data immediately
loadJSONData();

// Async function to load mock data from local constants
async function loadMockData() {
  // Use local constants instead of window variables
  const macroprocesses = macroprocessesData || [];
  const processes = processesData || [];

  return { macroprocesses, processes };
}

// Refresh app function for async data loading
window.refreshApp = function () {
  loadMockData().then((data) => {
    AppState.macroprocesses = data.macroprocesses;
    AppState.processes = data.processes;

    // Re-render all components
    renderNavigation();
    renderFeaturedProcesses();
    updateStatistics();

    // Initialize Feather Icons for new content
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  });
};

// Global functions for dropdown
window.toggleMacroprocessDropdown = toggleMacroprocessDropdown;
window.closeMacroprocessDropdown = closeMacroprocessDropdown;

// Navigation functions
window.navigateToSection = function (sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Hide all sections
  const allSections = document.querySelectorAll(".content-section");
  allSections.forEach((s) => s.classList.add("hidden"));

  // Show target section
  section.classList.remove("hidden");

  // Update navigation tab states
  const allNavTabs = document.querySelectorAll(".nav-tab");
  allNavTabs.forEach((tab) => tab.classList.remove("active"));

  // Update active tab based on section
  let activeTabId;
  if (sectionId === "welcome") {
    activeTabId = "nav-welcome";
  } else {
    activeTabId = `nav-${sectionId}`;
  }

  const activeTab = document.getElementById(activeTabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Remove dropdown active state when navigating to main sections
  const dropdownButton = document.getElementById("macroprocess-dropdown-btn");
  if (dropdownButton) {
    const mainSections = ["welcome", "homepage", "methodology", "faq"];
    if (mainSections.includes(sectionId)) {
      dropdownButton.classList.remove("active");
      clearDropdownHighlight(); // Clear item highlight
    }
  }

  // Update navigation state
  AppState.currentView = sectionId;

  // Show/hide breadcrumb based on section
  const breadcrumb = document.getElementById("breadcrumb");
  const mainPages = [
    "welcome",
    "homepage",
    "methodology",
    "faq",
    "introduction",
  ];

  if (mainPages.includes(sectionId)) {
    breadcrumb.classList.add("hidden");
  } else {
    breadcrumb.classList.remove("hidden");
    updateBreadcrumb(getBreadcrumbForSection(sectionId));
  }

  // Close mobile sidebar (if sidebar exists)
  const sidebar = document.getElementById("sidebar");
  if (sidebar && window.innerWidth < 768) {
    sidebar.classList.add("sidebar-collapsed");
  }

  // Close dropdown
  closeMacroprocessDropdown();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update URL
  history.pushState(null, null, `#${sectionId}`);
};

function getBreadcrumbForSection(sectionId) {
  switch (sectionId) {
    case "welcome":
      return ["Início"];
    case "homepage":
      return ["Início", "Dashboard"];
    case "introduction":
      return ["Início"];
    case "methodology":
      return ["Enquadramento", "Glossário"];
    case "faq":
      return ["Início", "FAQ"];
    case "process-list":
      return ["Início", "Processos"];
    case "process-detail":
      return [
        "Início",
        "Processos",
        AppState.currentProcess?.title || "Detalhes",
      ];
    default:
      return ["Início"];
  }
}

// Centralized type configuration

// Centralized type configuration
function getTypeConfig(type) {
  const typeConfig = {
    process: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      label: "Processo",
      icon: "target",
    },
    subprocess: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Subprocesso",
      icon: "settings",
    },
  };

  return typeConfig[type] || typeConfig["subprocess"];
}

// Feather Icons Professional Icons
function getIcon(iconName, size = 20) {
  const iconMap = {
    briefcase: "briefcase",
    users: "users",
    "clipboard-list": "clipboard",
    "alert-triangle": "alert-triangle",
    server: "server",
    "refresh-cw": "refresh-cw",
    search: "search",
    target: "target",
    settings: "settings",
    "file-text": "file-text",
    download: "download",
    bookmark: "bookmark",
    clock: "clock",
    "chevron-right": "chevron-right",
    "bar-chart": "bar-chart-2",
    "trending-up": "trending-up",
    activity: "activity",
    layers: "layers",
    "zoom-in": "zoom-in",
    "zoom-out": "zoom-out",
    maximize: "maximize",
    monitor: "monitor",
  };

  const featherIconName = iconMap[iconName] || "file-text";

  return `<i data-feather="${featherIconName}" style="width: ${size}px; height: ${size}px;"></i>`;
}

// Render methodology sections dynamically
function renderMethodology() {
  const container = document.getElementById("methodology-content");
  if (!container) return;

  const methodologySections = [
    {
      title: "Enquadramento",
      content: `
        <p class="text-gov-base text-gray-700 leading-relaxed">
          Uma metodologia de análise de processos é essencial em vários contextos por diversos motivos:
        </p>
        <ul class="list-disc list-inside space-y-1 text-gov-base text-gray-700 mt-3">
          <li><strong>Eficiência e Optimização:</strong> Permite identificar estrangulamentos, ineficiências e áreas de melhoria nos processos, o que possibilita optimizá-los para aumentar a produtividade e reduzir custos.</li>
          <li><strong>Padronização:</strong> Estabelece padrões e diretrizes para a execução de tarefas, garantindo consistência e qualidade nos resultados.</li>
          <li><strong>Entendimento dos Processos:</strong> Ajuda a compreender a sequência de atividades, recursos envolvidos e interações entre diferentes estágios, permitindo uma visão holística dos processos.</li>
          <li><strong>Identificação de Problemas:</strong> Facilita a identificação de problemas ou obstáculos nos processos, permitindo sua resolução de maneira estruturada.</li>
          <li><strong>Tomada de Decisão:</strong> Fornece dados e informações para suportar decisões estratégicas, baseadas em métricas e análises concretas.</li>
          <li><strong>Inovação e Mudança:</strong> Facilita a implementação de mudanças e inovações nos processos, permitindo uma abordagem mais ágil e controlada.</li>
          <li><strong>Compreensão do Ciclo de Vida do Processo:</strong> Ajuda a entender a dinâmica e evolução dos processos ao longo do tempo, permitindo ajustes conforme necessário.</li>
          <li><strong>Controle e Gestão:</strong> Permite um controle mais efetivo e uma gestão mais eficiente dos processos organizacionais.</li>
          <li><strong>Documentação:</strong> Permite documentar os processos de forma estruturada, facilitando a comunicação e o entendimento entre as partes interessadas.</li>
        </ul>
        <p class="text-gov-base text-gray-700 leading-relaxed mt-3">
          Uma metodologia de análise de processos pode variar de acordo com a natureza e o objetivo do processo em questão, e existem várias abordagens disponíveis, como o BPM (Business Process Management), Six Sigma, Lean, entre outras. A escolha da metodologia depende das necessidades específicas da organização e dos processos a serem analisados.
        </p>
        <p class="text-gov-base text-gray-700 leading-relaxed mt-3">
          Neste estudo, é seguida uma abordagem BPM. De entre a informação recolhida, e que se apresenta no relatório de cada processo com uma estrutura bem definida, encontram-se um número significativo de atributos sobre os quais convém fazer uma descrição mais detalhada:
        </p>
      `,
      isHidden: true,
      sectionId: "enquadramento",
    },
    {
      title: "Glossário",
      content: `
        <div class="space-y-4">
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">1.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Entidade</h4>
              <p class="text-gov-base text-gray-700">Descreve a entidade onde o processo é executado e que tem interesse na sua documentação. Pode ser uma entidade pública, privada ou outra.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">2.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Responsável</h4>
              <p class="text-gov-base text-gray-700">Descreve a pessoa ou entidade responsável pelo processo. Pode ser uma pessoa, um departamento ou uma entidade. Normalmente é uma pessoa. Quando tal não for possível identificar, deve ser identificado o departamento ou entidade responsável. Em último caso, este atributo ficará vazio.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">3.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Descrição</h4>
              <p class="text-gov-base text-gray-700">Descreve o processo de forma sucinta, mas completa. Deve ser suficientemente detalhada para que qualquer pessoa possa compreender o processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">4.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Palavras-Chave</h4>
              <p class="text-gov-base text-gray-700">Descreve as palavras-chave que melhor caracterizam o processo. Deve ser uma lista de palavras-chave separadas por vírgulas. Este mecanismo permitirá fazer buscas optimizadas por palavras-chave.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">5.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Objetivos</h4>
              <p class="text-gov-base text-gray-700">Descreve os objetivos do processo. Deve ser uma lista de objetivos separados por vírgulas. Este mecanismo permitirá saber de forma rápida quer o contexto, quer os objectivos, o que de certa forma deve justificar a razão da existência do processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">6.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Inputs</h4>
              <p class="text-gov-base text-gray-700">Descreve os inputs do processo. Este mecanismo permitirá saber quais os inputs que o processo poderá ter e aferir da sua necessidade e/ou qualidade no contributo para enriquecer o processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">7.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Atividades</h4>
              <p class="text-gov-base text-gray-700">Descreve as atividades do processo de forma detalhada. Este mecanismo permitirá saber quais as atividades que o processo tem, e ainda, descrever bem as interações entre os vários intervenientes no processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">8.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Entregáveis</h4>
              <p class="text-gov-base text-gray-700">Descreve os entregáveis do processo. No fundo, esta informação representa qual o output esperado do processo quando e se este executar de forma adequada e sistemática.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">9.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Fornecedores</h4>
              <p class="text-gov-base text-gray-700">Descreve de forma detalhada os intervenientes fornecedores de inputs ao processo e a suas interações. No fundo, esta informação representa quais os fornecedores que contribuem para o processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">10.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Participantes</h4>
              <p class="text-gov-base text-gray-700">Descreve de forma detalhada os participantes nas atividades do processo e a suas interações. Esta informação é relevante para identificar responsabilidades nas atividades, os momentos dessa sua intervenção e, em fase de execução, qual a sua duração e eventual custo. É ainda, uma componente fundamental para desenhar os modelos de processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">11.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Clientes</h4>
              <p class="text-gov-base text-gray-700">Descreve de forma detalhada os consumidores do processo e a suas interações. No fundo, esta informação representa quem beneficia dos resultados da execução do processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">12.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Metodologias</h4>
              <p class="text-gov-base text-gray-700">Descreve as metodologias que são utilizadas para executar o processo de forma adequada.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">13.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Ferramentas</h4>
              <p class="text-gov-base text-gray-700">Descreve as ferramentas envolvidas e que suportam o processo em momento de execução.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">14.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Métricas</h4>
              <p class="text-gov-base text-gray-700">Descreve as métricas que são utilizadas para medir a eficácia e eficiência do processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">15.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Sugestões</h4>
              <p class="text-gov-base text-gray-700">Descreve as sugestões que são feitas para melhorar o processo.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">16.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Maturidade</h4>
              <p class="text-gov-base text-gray-700">Descreve o nível de maturidade do processo. Este atributo é importante para aferir da qualidade do processo e da sua capacidade de evolução. Está baseado no modelo de maturidade de processos CMMI.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">17.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Diagramas</h4>
              <p class="text-gov-base text-gray-700">Apresentam os diagramas que são utilizados para descrever o processo. Neste caso, são sumarizadas informações sobre os diagramas de contexto, de atividades e de fluxo de dados.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">18.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Suporte Legal / Legislação</h4>
              <p class="text-gov-base text-gray-700">Identifica e descreve qual o suporte legal do processo. Várias das decisões e/ou atividades podem ser justificadas por esta legislação.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">19.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Classificação da informação</h4>
              <p class="text-gov-base text-gray-700">Identifica e descreve qual a classificação do processo em relação à sua confidencialidade e segurança da informação.</p>
            </div>
          </div>
          <div class="flex">
            <span class="text-gov-base font-bold text-igfej-blue mr-4 min-w-8">20.</span>
            <div>
              <h4 class="text-gov-base font-semibold text-gray-900 mb-2">Metadados</h4>
              <p class="text-gov-base text-gray-700">Descreve e apresenta os metadados do processo.</p>
            </div>
          </div>
        </div>
      `,
      isHidden: true,
      sectionId: "glossario",
    },
  ];

  container.innerHTML =
    methodologySections
      .map((section) =>
        createCollapsibleItem(
          section.title,
          section.content,
          `methodology-${section.sectionId}`,
          "toggleMethodologySection",
          section.isHidden,
        ),
      )
      .join("") +
    `
    <div class="bg-igfej-light border border-igfej-blue rounded-lg p-6">
      <h3 class="text-lg font-semibold text-igfej-blue mb-2">Nota</h3>
      <p class="text-igfej-blue">Informação adicional pode ser apresentada no restante relatório sem que o seu significado tenha sido detalhado nesta secção.</p>
    </div>
  `;

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }
}

// Initialize application
document.addEventListener("DOMContentLoaded", async function () {
  // Setup search functionality
  setupTableSearch();

  try {
    // Load JSON data first
    await loadJSONData();

    // Set initial state
    AppState.currentView = "welcome";

    // Setup event listeners
    setupEventListeners();

    // Render initial content
    renderNavigation();
    renderFeaturedProcesses();
    renderFAQ();
    renderMethodology();
    updateStatistics();

    // Initialize sidebar state
    initializeSidebarState();

    // Check initial URL hash for deep linking
    const initialHash = window.location.hash.slice(1);
    if (initialHash && document.getElementById(initialHash)) {
      // Navigate to the hash section if it exists
      navigateToSection(initialHash);
    } else {
      // Show default welcome page
      navigateToSection("welcome");
    }

    // Add hash change listener for browser back/forward navigation
    window.addEventListener("hashchange", function () {
      const hash = window.location.hash.slice(1);
      if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
      } else if (!hash) {
        // If no hash, navigate to welcome
        navigateToSection("welcome");
      }
    });

    // Add window resize listener for sidebar
    window.addEventListener("resize", () => {
      initializeSidebarState();
    });
  } catch (error) {
    console.error("Failed to initialize app:", error);
    // Show welcome page even if data loading fails
    navigateToSection("welcome");
  }
});

function setupEventListeners() {
  // Search input - handled by search.js
  const searchInput = document.getElementById("search-input");
  if (searchInput && typeof window.handleSearch === "function") {
    searchInput.addEventListener("input", window.handleSearch);
    searchInput.addEventListener("focus", () => {
      if (typeof window.showSearchResults === "function") {
        window.showSearchResults();
      }
    });
    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        if (typeof window.hideSearchResults === "function") {
          window.hideSearchResults();
        }
      }, 200);
    });
  }

  // Mobile menu
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", toggleSidebar);
  }

  // Close search results on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (typeof window.hideSearchResults === "function") {
        window.hideSearchResults();
      }
    }
  });

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest("#search-input") &&
      !e.target.closest("#search-results")
    ) {
      if (typeof window.hideSearchResults === "function") {
        window.hideSearchResults();
      }
    }
  });

  // Initialize search if available
  if (typeof window.initializeSearch === "function") {
    window.initializeSearch();
  }
}

function renderNavigation() {
  // Populate mobile sidebar navigation
  const navContainer = document.getElementById("macroprocess-nav");
  if (navContainer) {
    navContainer.innerHTML = AppState.macroprocesses
      .map(
        (macro) => `
          <div class="mb-2">
              <button 
                  onclick="navigateToMacroprocess('${macro.id}')"
                  class="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-igfej-light hover:text-igfej-blue rounded-md transition-colors"
              >
                  <span class="mr-3 text-lg">${getIcon(macro.icon || "layers", 20)}</span>
                  <div class="flex-1 text-left">
                      <div class="font-medium">${macro.title}</div>
                  </div>
                  ${getIcon("chevron-right", 16)}
              </button>
          </div>
      `,
      )
      .join("");
  }

  // Populate desktop dropdown navigation
  const desktopNavContainer = document.getElementById(
    "desktop-macroprocess-nav",
  );
  if (desktopNavContainer) {
    const desktopHTML = AppState.macroprocesses
      .map(
        (macro) => `
          <a
              href="#"
              id="dropdown-item-${macro.id}"
              onclick="navigateToMacroprocess('${macro.id}'); return false;"
              class="macro-dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-igfej-light hover:text-igfej-blue transition-colors"
          >
              <div class="flex items-center">
                  <span class="mr-3">${getIcon(macro.icon || "layers", 16)}</span>
                  <span>${macro.title}</span>
              </div>
          </a>
      `,
      )
      .join("");

    desktopNavContainer.innerHTML = desktopHTML;
  }

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }
}

function renderFeaturedProcesses() {
  const container = document.getElementById("featured-processes");
  if (!container) return;

  // Collect all processes and subprocesses with their modification dates
  const allItems = [];

  // Add main processes
  AppState.processes.forEach((process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    allItems.push({
      id: process.id,
      code: process.code,
      title: process.title,
      type: "process",
      macroprocess_id: process.macroprocess_id,
      updated_at: process.updated_at,
      subprocess_count: currentVersion?.subprocesses?.length || 0,
      description:
        currentVersion?.subprocesses?.length > 0
          ? `Processo com ${currentVersion.subprocesses.length} subprocessos`
          : process.title || "Processo",
    });
  });

  // Add subprocesses
  AppState.processes.forEach((process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    if (currentVersion?.subprocesses) {
      currentVersion.subprocesses.forEach((subprocess) => {
        allItems.push({
          id: subprocess.id,
          code: getDisplayCode(subprocess),
          title: subprocess.title,
          type: "subprocess",
          parent_process: process,
          parent_process_id: process.id,
          parent_process_title: process.title,
          parent_process_code: process.code,
          macroprocess_id: process.macroprocess_id,
          updated_at: subprocess.updated_at || process.updated_at,
          description:
            subprocess.description || `Subprocesso de ${process.title}`,
        });
      });
    }
  });

  // Sort by code (alphanumeric) and take top 3
  const recentItems = allItems
    .sort((a, b) => {
      // Extract numeric parts from codes for proper sorting
      const aCode = a.code.replace(/[^0-9]/g, "");
      const bCode = b.code.replace(/[^0-9]/g, "");
      const aNum = parseInt(aCode) || 0;
      const bNum = parseInt(bCode) || 0;

      // If both have numbers, compare numerically
      if (aNum > 0 && bNum > 0) {
        return aNum - bNum;
      }

      // If one has number and other doesn't, the numbered one comes first
      if (aNum > 0 && bNum === 0) return -1;
      if (aNum === 0 && bNum > 0) return 1;

      // If neither has numbers, sort alphabetically
      return a.code.localeCompare(b.code);
    })
    .slice(0, 3);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${recentItems.map((item) => createRecentItemCard(item)).join("")}
    </div>
  `;

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }
}

function createRecentItemCard(item) {
  const config = getTypeConfig(item.type);
  const relativeTime = getRelativeTime(item.updated_at);

  if (item.type === "subprocess") {
    return `
      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-igfej-blue" onclick="showSubprocessDetail('${item.id}')">
        <div class="flex flex-col h-full">
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">
                  Subprocesso
                </span>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">${item.code}: ${item.title}</h4>
              <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div class="flex items-center">
                  ${getIcon("home", 12)}
                  Pai: ${item.parent_process_code}
                </div>
              </div>
            </div>
            ${getIcon("chevron-right", 16)}
          </div>
          
          <!-- Bottom Section with Divider -->
          <div class="mt-auto pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${getMacroprocessTitle(item.macroprocess_id)}</span>
              <span class="flex items-center">
                ${getIcon("clock", 12)}
                ${relativeTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-igfej-blue" onclick="showProcessDetail('${item.id}')">
        <div class="flex flex-col h-full">
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">
                  Processo
                </span>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">${item.code}: ${item.title}</h4>
              <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
              ${
                item.subprocess_count > 0
                  ? `
                <div class="mt-2 text-xs text-gray-500">
                  <div class="flex items-center">
                    ${getIcon("layers", 12)}
                    ${item.subprocess_count} subprocesso${item.subprocess_count !== 1 ? "s" : ""}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
            ${getIcon("chevron-right", 16)}
          </div>
          
          <!-- Bottom Section with Divider -->
          <div class="mt-auto pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${getMacroprocessTitle(item.macroprocess_id)}</span>
              <span class="flex items-center">
                ${getIcon("clock", 12)}
                ${relativeTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Agora" : `${diffMinutes} min atrás`;
    }
    return diffHours === 1 ? "1 hora atrás" : `${diffHours} horas atrás`;
  } else if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 semana atrás" : `${weeks} semanas atrás`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 mês atrás" : `${months} meses atrás`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "1 ano atrás" : `${years} anos atrás`;
  }
}

function createProcessCard(process) {
  const config = getTypeConfig("process"); // All processes are main processes in new structure
  const currentVersion = process.versions?.find(
    (v) => v.id === process.current_version_id,
  );
  const description =
    currentVersion?.subprocesses?.length > 0
      ? `Processo com ${currentVersion.subprocesses.length} subprocessos`
      : process.title || "Processo";

  return `
        <div class="process-card bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer" onclick="showProcessDetail('${process.id}')">
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <div class="flex items-center mb-1">
                        <span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">
                            ${config.label}
                        </span>
                    </div>
                    <h4 class="font-semibold text-gray-900 mb-2">${process.code}: ${process.title}</h4>
                    <p class="text-sm text-gray-600 line-clamp-2">${description}</p>
                </div>
                ${createChevron("right", "", "")}
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>${getMacroprocessTitle(process.macroprocess_id)}</span>
            </div>
        </div>
    `;
}

function updateStatistics() {
  // Calculate statistics from new data structure
  const totalProcesses = AppState.processes.length;
  let totalSubprocesses = 0;
  let totalAssets = 0;

  AppState.processes.forEach((process) => {
    const currentVersion = process.versions?.find(
      (v) => v.id === process.current_version_id,
    );
    if (currentVersion) {
      totalSubprocesses += currentVersion.subprocesses?.length || 0;
      totalAssets += currentVersion.assets?.length || 0;
    }
  });

  const totalMacroprocesses = AppState.macroprocesses.length;
  const totalDiagrams = totalAssets + totalSubprocesses; // Each asset and subprocess may have diagrams

  // Update HTML statistics elements with animation
  const diagramsElement = document.getElementById("stat-diagrams");
  const macroprocessesElement = document.getElementById("stat-macroprocesses");
  const processesElement = document.getElementById("stat-processes");
  const subprocessesElement = document.getElementById("stat-subprocesses");

  // Animate counter updates
  animateCounter(diagramsElement, totalDiagrams);
  animateCounter(macroprocessesElement, totalMacroprocesses);
  animateCounter(processesElement, totalProcesses);
  animateCounter(subprocessesElement, totalSubprocesses);

  // Create bar chart with Chart.js
  const ctx = document.getElementById("statisticsChart");
  if (ctx && typeof Chart !== "undefined") {
    // Destroy existing chart if it exists
    if (window.statisticsChart instanceof Chart) {
      window.statisticsChart.destroy();
    }

    window.statisticsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Diagramas BPMN",
          "Macroprocessos",
          "Processos",
          "Subprocessos",
        ],
        datasets: [
          {
            label: "Quantidade",
            data: [
              totalDiagrams,
              totalMacroprocesses,
              totalProcesses,
              totalSubprocesses,
            ],
            backgroundColor: [
              "rgba(0, 102, 204, 0.8)",
              "rgba(0, 102, 204, 0.8)",
              "rgba(0, 102, 204, 0.8)",
              "rgba(0, 102, 204, 0.8)",
            ],
            borderColor: [
              "rgba(0, 102, 204, 1)",
              "rgba(0, 102, 204, 1)",
              "rgba(0, 102, 204, 1)",
              "rgba(0, 102, 204, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}

function renderFAQ() {
  const container = document.getElementById("faq-content");
  if (!container) return;

  const faqItems = [
    {
      question: "Como aceder aos processos?",
      answer:
        "Pode navegar pela estrutura hierárquica na barra lateral ou utilizar a barra de pesquisa para encontrar processos específicos.",
    },
    {
      question: "O que são diagramas BPMN?",
      answer:
        "BPMN (Business Process Model and Notation) é uma notação gráfica para modelar processos de negócio, permitindo visualizar o fluxo de atividades.",
    },
    {
      question: "Como pesquisar processos?",
      answer:
        "Use a barra de pesquisa na página inicial para encontrar processos por nome, código ou palavras-chave.",
    },
  ];

  container.innerHTML = faqItems
    .map(
      (item, index) => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
            <button 
                onclick="toggleFAQ(${index})"
                class="flex items-center w-full text-left py-2 rounded transition-colors"
            >
                <span class="text-lg font-medium text-gray-900 flex-1 pr-4">${item.question}</span>
                ${createChevron("down", "", "faq-icon-" + index)}
            </button>
            <div id="faq-answer-${index}" class="hidden mt-4 text-gray-700 max-w-full">
                ${item.answer}
            </div>
        </div>
    `,
    )
    .join("");
}

function navigateToMacroprocess(macroprocessId) {
  const macroprocess = AppState.macroprocesses.find(
    (m) => m.id === macroprocessId,
  );
  if (!macroprocess) return;

  const processes = AppState.processes.filter(
    (p) => p.macroprocess_id === macroprocessId,
  );

  // Close dropdown when navigating
  closeMacroprocessDropdown();

  // Set dropdown as active
  const button = document.getElementById("macroprocess-dropdown-btn");
  if (button) {
    button.classList.add("active");
  }

  // Highlight selected dropdown item
  highlightDropdownItem(macroprocessId);

  showProcessList(macroprocess, processes);
  updateBreadcrumb(["Início", macroprocess.title]);

  // Show breadcrumb
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb) {
    breadcrumb.classList.remove("hidden");
  }

  // Close mobile sidebar
  if (window.innerWidth < 768) {
    closeSidebar();
  }
}

function highlightDropdownItem(macroprocessId) {
  // Remove highlight from all dropdown items
  const allDropdownItems = document.querySelectorAll(".macro-dropdown-item");
  allDropdownItems.forEach((item) => {
    item.classList.remove("bg-igfej-light", "text-igfej-blue", "font-medium");
    item.classList.add("text-gray-700");
  });

  // Add highlight to selected item
  const selectedItem = document.getElementById(
    `dropdown-item-${macroprocessId}`,
  );
  if (selectedItem) {
    selectedItem.classList.remove("text-gray-700");
    selectedItem.classList.add(
      "bg-igfej-light",
      "text-igfej-blue",
      "font-medium",
    );
  }
}

function clearDropdownHighlight() {
  // Remove highlight from all dropdown items
  const allDropdownItems = document.querySelectorAll(".macro-dropdown-item");
  allDropdownItems.forEach((item) => {
    item.classList.remove("bg-igfej-light", "text-igfej-blue", "font-medium");
    item.classList.add("text-gray-700");
  });
}

function showProcessList(macroprocess, processes) {
  const contentArea = document.getElementById("content-area");

  // Remove existing process list view if it exists
  const existingView = document.getElementById("process-list-view");
  if (existingView) {
    existingView.remove();
  }

  // Hide all static sections
  const allSections = contentArea.querySelectorAll(".content-section");
  allSections.forEach((section) => section.classList.add("hidden"));

  // Collect all processes and subprocesses for this macroprocess
  const allItems = [];

  // Add main processes
  processes.forEach((process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    allItems.push({
      id: process.id,
      code: process.code,
      title: process.title,
      type: "process",
      macroprocess_id: process.macroprocess_id,
      subprocess_count: currentVersion?.subprocesses?.length || 0,
      description:
        currentVersion?.subprocesses?.length > 0
          ? `Processo com ${currentVersion.subprocesses.length} subprocessos`
          : process.title || "Processo",
      updated_at: process.updated_at,
    });
  });

  // Add subprocesses
  processes.forEach((process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    if (currentVersion?.subprocesses) {
      currentVersion.subprocesses.forEach((subprocess) => {
        allItems.push({
          id: subprocess.id,
          code: subprocess.code,
          title: subprocess.title,
          type: "subprocess",
          parent_process_id: process.id,
          parent_process_title: process.title,
          parent_process_code: process.code,
          macroprocess_id: process.macroprocess_id,
          description:
            subprocess.description || `Subprocesso de ${process.title}`,
          updated_at: subprocess.updated_at || process.updated_at,
        });
      });
    }
  });

  // Sort all items by code (alphanumeric)
  allItems.sort((a, b) => {
    // Extract numeric parts from codes for proper sorting
    const aCode = a.code.replace(/[^0-9]/g, "");
    const bCode = b.code.replace(/[^0-9]/g, "");
    const aNum = parseInt(aCode) || 0;
    const bNum = parseInt(bCode) || 0;

    // If both have numbers, compare numerically
    if (aNum > 0 && bNum > 0) {
      return aNum - bNum;
    }

    // If one has number and other doesn't, the numbered one comes first
    if (aNum > 0 && bNum === 0) return -1;
    if (aNum === 0 && bNum > 0) return 1;

    // If neither has numbers, sort alphabetically
    return a.code.localeCompare(b.code);
  });

  // Calculate dynamic counts
  const totalProcesses = processes.length;
  const totalSubprocesses = processes.reduce((sum, process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    return sum + (currentVersion?.subprocesses?.length || 0);
  }, 0);

  const processListHTML = `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${macroprocess.title}</h2>
                <p class="text-gray-600">${macroprocess.description || ""}</p>
                ${
                  totalProcesses > 0 || totalSubprocesses > 0
                    ? `
                    <div class="mt-4 grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-lg font-semibold text-igfej-blue">${totalProcesses}</div>
                            <div class="text-xs text-gray-600">Processos</div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-lg font-semibold text-igfej-blue">${totalSubprocesses}</div>
                            <div class="text-xs text-gray-600">Subprocessos</div>
                        </div>
                    </div>
                    `
                    : `
                    <div class="mt-4 text-center p-8 bg-gray-50 rounded-lg">
                        <div class="text-gray-400 mb-2">
                            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="text-lg font-medium text-gray-900 mb-1">Nenhum processo encontrado</div>
                        <div class="text-sm text-gray-600">Esta macroprocesso ainda não tem processos ou subprocessos cadastrados.</div>
                    </div>
                    `
                }
            </div>
            
            ${
              totalProcesses > 0 || totalSubprocesses > 0
                ? `
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Processos e Subprocessos</h3>
                        <div class="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder="Filtrar..."
                                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-igfej-blue"
                                onkeyup="filterProcessListItems(this.value)"
                                id="process-filter-input"
                            >
                            <select 
                                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-igfej-blue"
                                id="process-type-filter"
                                onchange="filterProcessListItems()"
                            >
                                <option value="all">Todos (${allItems.length})</option>
                                <option value="process">Processos (${allItems.filter((item) => item.type === "process").length})</option>
                                <option value="subprocess">Subprocessos (${allItems.filter((item) => item.type === "subprocess").length})</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="process-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${allItems.map((item) => createProcessListItem(item)).join("")}
                    </div>
                </div>
                `
                : ""
            }
        </div>
    `;

  const tempDiv = document.createElement("div");
  tempDiv.className = "content-section";
  tempDiv.id = "process-list-view";
  tempDiv.innerHTML = processListHTML;
  contentArea.appendChild(tempDiv);

  // Hide other sections
  allSections.forEach((section) => section.classList.add("hidden"));
  tempDiv.classList.remove("hidden");

  // Update navigation state and tabs
  AppState.currentView = "process-list";
  AppState.currentProcessListItems = allItems; // Store items for filtering

  // Update navigation tab states
  const allNavTabs = document.querySelectorAll(".nav-tab");
  allNavTabs.forEach((tab) => tab.classList.remove("active"));

  // Keep dropdown active and maintain highlight since we're in process-list
  const dropdownButton = document.getElementById("macroprocess-dropdown-btn");
  if (dropdownButton) {
    dropdownButton.classList.add("active");
  }

  // Re-apply highlight to current macroprocess
  highlightDropdownItem(macroprocess.id);
}

function showProcessDetail(processId) {
  const process = AppState.processes.find((p) => p.id === processId);
  if (!process) {
    console.error("Process not found:", processId);
    return;
  }

  AppState.currentProcess = process;
  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];

  const contentArea = document.getElementById("content-area");

  // Remove existing views
  const existingDetailView = document.getElementById("process-detail-view");
  if (existingDetailView) {
    existingDetailView.remove();
  }
  const existingListView = document.getElementById("process-list-view");
  if (existingListView) {
    existingListView.remove();
  }

  // Hide all static sections
  const allSections = contentArea.querySelectorAll(".content-section");
  allSections.forEach((section) => section.classList.add("hidden"));

  const config = getTypeConfig("process");

  // Update breadcrumb
  updateBreadcrumb([
    "Início",
    getMacroprocessTitle(process.macroprocess_id),
    `${process.code}: ${process.title}`,
  ]);

  const detailHTML = `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Process Header -->
            <div class="border-b border-gray-200 p-4">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <div class="flex items-center mb-1">
                            <span class="text-sm font-medium px-3 py-1 rounded-full ${config.bg} ${config.text}">
                                ${config.label}
                            </span>
                            ${
                              process.versions && process.versions.length > 1
                                ? `
                                <div class="ml-4 flex items-center">
                                    <label class="text-sm text-gray-600 mr-2">Versão:</label>
                                    <select onchange="switchProcessVersion('${process.id}', this.value)" class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-igfej-blue">
                                        ${process.versions
                                          .map(
                                            (v) => `
                                            <option value="${v.id}" ${v.id === process.current_version_id ? "selected" : ""}>
                                                v${v.version} (${new Date(v.created_at).toLocaleDateString("pt-PT")})
                                            </option>
                                          `,
                                          )
                                          .join("")}
                                    </select>
                                </div>
                            `
                                : `
                                <span class="ml-3 text-sm text-gray-500">v${currentVersion?.version || "1.0"}</span>
                            `
                            }
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">${process.code}: ${process.title}</h1>
                        <p class="text-gray-600">${process.title}</p>
                    </div>
                    <div class="flex space-x-2 mb-6">
                        <!-- Action buttons removed -->
                    </div>
                </div>
            </div>
            
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                    <button onclick="switchTab('overview', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600 hover:text-gray-700 hover:border-gray-300">
                        Visão Geral
                    </button>
                    <button onclick="switchTab('subprocesses', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Subprocessos <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${currentVersion?.subprocesses?.length || 0}</span>
                    </button>
                    <button onclick="switchTab('assets', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Diagramas <span class="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${currentVersion?.assets?.length || 0}</span>
                    </button>
                    <button onclick="switchTab('details', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Detalhes
                    </button>
                    <button onclick="switchTab('history', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        Histórico
                    </button>
                </nav>
            </div>
            
            <!-- Tab Content -->
            <div class="p-6">
                <div id="overview-tab" class="tab-content active">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                            <dl class="space-y-3">
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Macroprocesso</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${getMacroprocessTitle(process.macroprocess_id)}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Estado</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${process.state === "as_is" ? "AS-IS" : "TO-BE"}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Versão Atual</dt>
                                    <dd class="mt-1 text-sm text-gray-900">v${currentVersion?.version || "1.0"}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">Atualizado por</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${process.updated_by || "N/A"}</dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                            <p class="text-gray-700">${process.title}</p>
                            <div class="mt-4">
                                <div class="text-sm text-gray-600">
                                    <div class="mb-2"><strong>Criado:</strong> ${new Date(process.created_at).toLocaleDateString("pt-PT")}</div>
                                    <div class="mb-2"><strong>Atualizado:</strong> ${new Date(process.updated_at).toLocaleDateString("pt-PT")}</div>
                                    <div><strong>ID:</strong> ${process.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="subprocesses-tab" class="tab-content">
                    ${renderSubprocesses(currentVersion?.subprocesses || [])}
                </div>
                
                <div id="process-bpmn-tab" class="tab-content">
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Diagrama BPMN do Processo</h3>
                            <div class="bpmn-container" id="process-bpmn-container">
                                <div class="flex items-center justify-center h-full text-gray-500">
                                    <div class="text-center">
                                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-igfej-blue"></div>
                                        <p class="text-sm text-gray-500 mt-2">Carregando diagrama BPMN do processo...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="assets-tab" class="tab-content">
                    <div class="space-y-6">
                        <!-- Main Content Layout -->
                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <!-- Sidebar - Diagram List -->
                            <div class="lg:col-span-1">
                                <div class="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        Diagramas BPMN
                                    </h3>
                                    <div class="space-y-2 max-h-full overflow-y-auto">
                                        ${renderAssets(currentVersion?.assets || [])}
                                    </div>
                                </div>
                            </div>

                            <!-- Main Viewer Area -->
                            <div class="lg:col-span-3">
                                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <!-- Controls Header -->
                                    <div class="bg-gray-50 border-b border-gray-200 p-4">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <h3 class="text-lg font-semibold text-gray-900">Visualização do Diagrama</h3>
                                                <p class="text-sm text-gray-600">Selecione um diagrama para começar</p>
                                            </div>
                                            <div class="flex items-center space-x-3">
                                                <!-- All Controls Group -->
                                                <div class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
                                                    <!-- Zoom Controls -->
                                                    <div class="flex items-center space-x-1">
                                                        <button onclick="zoomInBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Zoom In">
                                                            ${getIcon("zoom-in", 16)}
                                                        </button>
                                                        <button onclick="zoomOutBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Zoom Out">
                                                            ${getIcon("zoom-out", 16)}
                                                        </button>
                                                        <div class="border-l border-gray-300 h-6 mx-1"></div>
                                                        <button onclick="fitBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Fit Viewport">
                                                            ${getIcon("maximize", 16)}
                                                        </button>
                                                        <button onclick="fullscreenBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Fullscreen">
                                                            ${getIcon("monitor", 16)}
                                                        </button>
                                                    </div>

                                                    <!-- Separator -->
                                                    <div class="border-l border-gray-300 h-8"></div>

                                                    <!-- Download Controls -->
                                                    <div class="flex items-center space-x-2">
                                                        <select id="download-format" class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors">
                                                            <option value="bpmn">BPMN</option>
                                                            <option value="svg">SVG</option>
                                                            <option value="dmn">DMN</option>
                                                        </select>
                                                        <button onclick="downloadSelectedFormat()" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
                                                            <span>${getIcon("download", 14)}</span>
                                                            <span>Download</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- BPMN Viewer -->
                                    <div class="p-4">
                                        <div class="bpmn-container" id="bpmn-container" style="height: 600px;">
                                            <div class="flex items-center justify-center h-full text-gray-500">
                                                <div class="text-center">
                                                    <div class="inline-block p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                        </svg>
                                                        <h3 class="mt-4 text-sm font-medium text-gray-900">Selecione um Diagrama</h3>
                                                        <p class="mt-1 text-sm text-gray-600">
                                                            Clique em um diagrama BPMN da lista à esquerda<br>
                                                            para visualizar e editar o processo.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="details-tab" class="tab-content">
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações da Versão</h3>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p class="text-gray-700">${currentVersion?.change_description || "Sem descrição de alterações"}</p>
                                <div class="mt-2 text-sm text-gray-600">
                                    <div><strong>Autor:</strong> ${currentVersion?.author_id || "N/A"}</div>
                                    <div><strong>Criado:</strong> ${new Date(currentVersion?.created_at || process.created_at).toLocaleDateString("pt-PT")}</div>
                                    <div><strong>Atualizado:</strong> ${new Date(currentVersion?.updated_at || process.updated_at).toLocaleDateString("pt-PT")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="history-tab" class="tab-content">
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Histórico de Versões</h3>
                            <div class="space-y-4">
                                ${
                                  process.versions
                                    ? process.versions
                                        .map(
                                          (version, index) => `
                                <div class="bg-white border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-start justify-between mb-2">
                                        <div class="flex items-center">
                                            <span class="text-lg font-semibold text-gray-900">v${version.version}</span>
                                            ${version.id === process.current_version_id ? '<span class="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Atual</span>' : ""}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            ${new Date(version.created_at).toLocaleDateString("pt-PT")}
                                        </div>
                                    </div>
                                    <p class="text-gray-700 mb-3">${version.change_description || "Sem descrição"}</p>
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="text-gray-600">
                                            <strong>Autor:</strong> ${version.author_id || "N/A"}
                                        </span>
                                        <span class="text-gray-600">
                                            <strong>Atualizado por:</strong> ${version.updated_by || "N/A"}
                                        </span>
                                    </div>
                                    <div class="mt-3 pt-3 border-t border-gray-200">
                                        <span class="text-sm text-gray-600">
                                            <strong>Subprocessos:</strong> ${version.subprocesses ? version.subprocesses.length : 0}
                                        </span>
                                    </div>
                                </div>
                                `,
                                        )
                                        .join("")
                                    : '<p class="text-gray-700">Nenhuma versão registrada.</p>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  const tempDiv = document.createElement("div");
  tempDiv.className = "content-section";
  tempDiv.id = "process-detail-view";
  tempDiv.innerHTML = detailHTML;
  contentArea.appendChild(tempDiv);

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Hide other sections
  allSections.forEach((section) => section.classList.add("hidden"));
  tempDiv.classList.remove("hidden");

  // Update navigation state and tabs
  AppState.currentView = "process-detail";
  AppState.currentProcess = process;
  AppState.processBpmnLoaded = false; // Reset BPMN loaded flag

  // Update navigation tab states
  const allNavTabs = document.querySelectorAll(".nav-tab");
  allNavTabs.forEach((tab) => tab.classList.remove("active"));

  // Keep dropdown active and maintain highlight since we're in process-detail (related to process-list)
  const dropdownButton = document.getElementById("macroprocess-dropdown-btn");
  if (dropdownButton) {
    dropdownButton.classList.add("active");
  }

  // Re-apply highlight to current macroprocess
  highlightDropdownItem(process.macroprocess_id);

  // Update breadcrumb
  updateBreadcrumb([
    "Início",
    getMacroprocessTitle(process.macroprocess_id),
    `${process.code}: ${process.title}`,
  ]);

  // Show breadcrumb
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb) {
    breadcrumb.classList.remove("hidden");
  }

  // Load BPMN diagram if available
  setTimeout(() => {
    const bpmnTab = document.getElementById("process-bpmn-tab");
    if (bpmnTab && !AppState.processBpmnLoaded) {
      loadProcessBpmn(process.id);
    }
  }, 100);
}

function renderSubprocesses(subprocesses) {
  if (!subprocesses || subprocesses.length === 0) {
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
        ${subprocesses
          .map(
            (subprocess) => `
          <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-igfej-blue" onclick="showSubprocessDetail('${subprocess.id}')">
            <div class="flex flex-col h-full">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="flex items-center mb-1">
                    <span class="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Subprocesso
                    </span>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-2">${getDisplayCode(subprocess)}: ${subprocess.title}</h4>
                  <p class="text-sm text-gray-600 line-clamp-3">${subprocess.description || "Sem descrição"}</p>
                  
                  ${
                    subprocess.keywords && subprocess.keywords.length > 0
                      ? `
                  <div class="flex flex-wrap gap-1 mt-2">
                    ${subprocess.keywords
                      .slice(0, 3)
                      .map(
                        (keyword) =>
                          `<span class="text-xs px-2 py-1 bg-igfej-light text-igfej-blue rounded">${keyword}</span>`,
                      )
                      .join("")}
                  </div>
                `
                      : ""
                  }
                </div>
                <svg class="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
              
              <div class="mt-auto pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center">
                    ${getIcon("user", 12)}
                    ${subprocess.responsible?.slice(0, 2).join(", ") || "N/A"}${subprocess.responsible?.length > 2 ? "..." : ""}
                  </span>
                  <span class="flex items-center">
                    <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    BPMN
                  </span>
                </div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderAssets(assets) {
  if (!assets || assets.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <p class="text-lg font-medium mb-2">Sem modelos BPMN</p>
        <p class="text-sm">Este processo não tem modelos BPMN registrados.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-3">
      ${assets
        .map((asset, index) => {
          // Calculate file types and count
          const fileTypes = [];
          const filesWithContent =
            asset.files?.filter(
              (file) => file.bpmn_file || file.svg_file || file.dmn_file,
            ) || [];
          const fileCount = filesWithContent.length;

          if (filesWithContent.some((file) => file.bpmn_file))
            fileTypes.push("BPMN");
          if (filesWithContent.some((file) => file.svg_file))
            fileTypes.push("SVG");
          if (filesWithContent.some((file) => file.dmn_file))
            fileTypes.push("DMN");

          return `
        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer hover:border-gray-300 asset-list-item ${index === 0 ? "selected bg-blue-50 border-blue-300" : ""}" onclick="loadBPMNDiagramFromList('${asset.id}')">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 mb-2">${asset.code}: Modelo BPMN ${asset.subtitle}</h4>
              <div class="flex items-center space-x-2">
                ${fileTypes.map((type) => `<span class="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">${type}</span>`).join("")}
              </div>
            </div>
            ${getIcon("chevron-right", 20)}
          </div>
        </div>
      `;
        })
        .join("")}
    </div>
  `;
}

// Create function to get subprocess assets
function getSubprocessAssets(subprocess) {
  // For subprocesses, create mock assets based on the subprocess BPMN data
  // Subprocesses are linked to assets in the parent process
  const parentProcess = AppState.currentProcess;
  if (!parentProcess) return [];

  const currentVersion =
    parentProcess.versions?.find(
      (v) => v.id === parentProcess.current_version_id,
    ) || parentProcess.versions?.[0];
  const assets = currentVersion?.assets || [];

  // Find assets that match this subprocess (by code or title)
  const matchingAssets = assets.filter(
    (asset) =>
      asset.code === subprocess.code ||
      asset.subtitle?.toLowerCase().includes(subprocess.title.toLowerCase()),
  );

  return matchingAssets;
}

function showSubprocessDetail(subprocessId) {
  // Always search through all processes since subprocesses can be displayed in lists
  // across multiple processes (e.g., in macroprocess overviews)
  let parentProcess = AppState.processes.find((process) => {
    const currentVersion =
      process.versions?.find((v) => v.id === process.current_version_id) ||
      process.versions?.[0];
    return currentVersion?.subprocesses?.some((s) => s.id === subprocessId);
  });

  if (!parentProcess) {
    if (typeof window.showNotification === "function") {
      window.showNotification("Subprocesso não encontrado");
    }
    return;
  }

  AppState.currentProcess = parentProcess;
  const currentVersion =
    parentProcess.versions?.find(
      (v) => v.id === parentProcess.current_version_id,
    ) || parentProcess.versions?.[0];
  const subprocess = currentVersion?.subprocesses?.find(
    (s) => s.id === subprocessId,
  );

  if (!subprocess) {
    if (typeof window.showNotification === "function") {
      window.showNotification("Subprocesso não encontrado");
    }
    return;
  }

  // Create subprocess detail view
  const contentArea = document.getElementById("content-area");

  // Remove existing views
  const existingDetailView = document.getElementById("process-detail-view");
  if (existingDetailView) {
    existingDetailView.remove();
  }
  const existingListView = document.getElementById("process-list-view");
  if (existingListView) {
    existingListView.remove();
  }
  const existingSubprocessView = document.getElementById(
    "subprocess-detail-view",
  );
  if (existingSubprocessView) {
    existingSubprocessView.remove();
  }

  // Hide all static sections
  const allSections = contentArea.querySelectorAll(".content-section");
  allSections.forEach((section) => section.classList.add("hidden"));

  const subprocessDetailHTML = `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Subprocess Header -->
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center mb-2">
              <span class="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                Subprocesso
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${getDisplayCode(subprocess)}: ${subprocess.title}</h1>
            <p class="text-gray-600">${subprocess.description || "Sem descrição"}</p>
          </div>
        </div>
      </div>
      
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button onclick="switchSubprocessTab('overview', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-igfej-blue text-igfej-blue">
            Visão Geral
          </button>
          <button onclick="switchSubprocessTab('bpmn', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Diagrama BPMN
          </button>
          <button onclick="switchSubprocessTab('details', event)" class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Detalhes
          </button>
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="p-6">
        <div id="subprocess-overview-tab" class="tab-content active">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column - Sections 1, 2, 3 -->
            <div class="space-y-6">
              <!-- 9.1.1 Informações Básicas -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.1 Informações Básicas</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Processo Pai</dt>
                    <dd class="mt-1 text-sm text-gray-900">${parentProcess.code}: ${parentProcess.title}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Responsáveis</dt>
                    <dd class="mt-1 text-sm text-gray-900">${subprocess.responsible?.join(", ") || "N/A"}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-600">Entidade</dt>
                    <dd class="mt-1 text-sm text-gray-900">${subprocess.entity?.join(", ") || "N/A"}</dd>
                  </div>
                </dl>
              </div>

              <!-- 9.1.2 Descrição -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.2 Descrição</h3>
                <p class="text-gray-700 leading-relaxed">${subprocess.description || "Sem descrição disponível"}</p>
              </div>

              <!-- 9.1.3 Palavras-chave -->
              ${
                subprocess.keywords && subprocess.keywords.length > 0
                  ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.3 Palavras-chave</h3>
                <div class="flex flex-wrap gap-2">
                  ${subprocess.keywords.map((keyword) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">${keyword}</span>`).join("")}
                </div>
              </div>
              `
                  : ""
              }
            </div>

            <!-- Right Column - Sections 4, 5, 6 -->
            <div class="space-y-6">
              <!-- 9.1.4 Objetivos -->
              ${
                subprocess.objectives && subprocess.objectives.length > 0
                  ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.4 Objetivos</h3>
                <ul class="space-y-2">
                  ${subprocess.objectives.map((obj) => `<li class="text-sm text-gray-700 list-disc ml-4">${obj}</li>`).join("")}
                </ul>
              </div>
              `
                  : ""
              }

              <!-- 9.1.5 Inputs -->
              ${
                subprocess.inputs && subprocess.inputs.length > 0
                  ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.5 Inputs</h3>
                <div class="space-y-2">
                  ${subprocess.inputs.map((input) => `<div class="text-sm text-gray-700 ml-4 list-disc">${input}</div>`).join("")}
                </div>
              </div>
              `
                  : ""
              }

              <!-- 9.1.6 Atividades -->
              ${
                subprocess.activities && subprocess.activities.length > 0
                  ? `
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">${getDisplayCode(subprocess)}.6 Atividades</h3>
                <div class="space-y-4">
                  ${subprocess.activities
                    .map(
                      (activity, index) => `
                  <div class="bg-gray-50 rounded p-4">
                    <h4 class="font-medium text-gray-900 mb-2">${getDisplayCode(subprocess)}.6.${index + 1} ${activity.title}</h4>
                    ${
                      activity.bullets && activity.bullets.length > 0
                        ? `
                    <ul class="space-y-1 ml-6">
                      ${activity.bullets.map((bullet) => `<li class="text-sm text-gray-600 list-disc">${bullet}</li>`).join("")}
                    </ul>
                    `
                        : ""
                    }
                  </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        
        <div id="subprocess-bpmn-tab" class="tab-content">
          <div class="space-y-6">
            <!-- Main Content Layout - copied from process diagramas tab -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <!-- Sidebar - Diagram List -->
              <div class="lg:col-span-1">
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    Diagramas BPMN
                  </h3>
                  <div class="space-y-2 max-h-full overflow-y-auto">
                    ${renderAssets(getSubprocessAssets(subprocess))}
                  </div>
                </div>
              </div>

              <!-- Main Viewer Area -->
              <div class="lg:col-span-3">
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <!-- Controls Header -->
                  <div class="bg-gray-50 border-b border-gray-200 p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">Visualização do Diagrama</h3>
                        <p class="text-sm text-gray-600">Selecione um diagrama para começar</p>
                      </div>
                      <div class="flex items-center space-x-3">
                        <!-- All Controls Group -->
                        <div class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
                          <!-- Zoom Controls -->
                          <div class="flex items-center space-x-1">
                            <button onclick="zoomInBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Zoom In">
                              ${getIcon("zoom-in", 16)}
                            </button>
                            <button onclick="zoomOutBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Zoom Out">
                              ${getIcon("zoom-out", 16)}
                            </button>
                            <div class="border-l border-gray-300 h-6 mx-1"></div>
                            <button onclick="fitBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Fit Viewport">
                              ${getIcon("maximize", 16)}
                            </button>
                            <button onclick="fullscreenBPMN()" class="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md text-sm transition-colors" title="Fullscreen">
                              ${getIcon("monitor", 16)}
                            </button>
                          </div>

                          <!-- Separator -->
                          <div class="border-l border-gray-300 h-8"></div>

                          <!-- Download Controls -->
                          <div class="flex items-center space-x-2">
                            <select id="download-format" class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors">
                              <option value="bpmn">BPMN</option>
                              <option value="svg">SVG</option>
                              <option value="dmn">DMN</option>
                            </select>
                            <button onclick="downloadSelectedFormat()" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
                              <span>${getIcon("download", 14)}</span>
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- BPMN Viewer -->
                  <div class="p-4">
                    <div class="bpmn-container" id="subprocess-bpmn-container" style="height: 600px;">
                      <div class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                          <div class="inline-block p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            <h3 class="mt-4 text-sm font-medium text-gray-900">Selecione um Diagrama</h3>
                            <p class="mt-1 text-sm text-gray-600">
                              Clique em um diagrama BPMN da lista à esquerda<br>
                              para visualizar e editar o processo.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="subprocess-details-tab" class="tab-content">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Detalhadas</h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-gray-700">Informações detalhadas do subprocesso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement("div");
  tempDiv.className = "content-section";
  tempDiv.id = "subprocess-detail-view";
  tempDiv.innerHTML = subprocessDetailHTML;
  contentArea.appendChild(tempDiv);

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Hide other sections
  allSections.forEach((section) => section.classList.add("hidden"));
  tempDiv.classList.remove("hidden");

  AppState.currentView = "subprocess-detail";

  // Update breadcrumb
  updateBreadcrumb([
    "Início",
    getMacroprocessTitle(parentProcess.macroprocess_id),
    `${parentProcess.code}: ${parentProcess.title}`,
    `${getDisplayCode(subprocess)}: ${subprocess.title}`,
  ]);

  // Show breadcrumb
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb) {
    breadcrumb.classList.remove("hidden");
  }

  // Auto-load BPMN if available
  setTimeout(() => {
    loadSubprocessBpmn(subprocessId);
  }, 100);
}

function loadSubprocessBpmn(subprocessId) {
  const process = AppState.processes.find((p) => {
    const currentVersion =
      p.versions?.find((v) => v.id === p.current_version_id) || p.versions?.[0];
    return currentVersion?.subprocesses?.some((s) => s.id === subprocessId);
  });

  if (!process) {
    console.error("Process not found for subprocess:", subprocessId);
    return;
  }

  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];
  const subprocess = currentVersion?.subprocesses?.find(
    (s) => s.id === subprocessId,
  );

  if (!subprocess) {
    console.error("Subprocess not found:", subprocessId);
    return;
  }

  // Check if subprocess has BPMN assets
  const assets = currentVersion.assets || [];
  const subprocessAsset = assets.find(
    (asset) =>
      asset.code === subprocess.code ||
      asset.subtitle?.toLowerCase().includes(subprocess.title.toLowerCase()),
  );

  if (!subprocessAsset) {
    // Show message to use direct BPMN loading
    const container = document.getElementById("subprocess-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Diagrama BPMN Indisponível</h3>
            <p class="mt-1 text-sm text-gray-500">
              Este subprocesso não tem diagramas BPMN diretos.<br>
              Verifique se há arquivos BPMN associados.
            </p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Load BPMN from the subprocess asset
  const bpmnFile = subprocessAsset.files.find(
    (file) => file.bpmn_file,
  )?.bpmn_file;

  if (!bpmnFile) {
    console.error(
      "BPMN file not found in subprocess asset:",
      subprocessAsset.id,
    );
    const container = document.getElementById("subprocess-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="text-sm text-gray-500">Arquivo BPMN não encontrado</p>
            <p class="text-xs text-gray-400 mt-1">Verifique os arquivos do asset.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Load the BPMN file with same configuration as process BPMN
  if (typeof window.loadBPMDiagram === "function") {
    const container = document.getElementById("subprocess-bpmn-container");
    if (container) {
      try {
        // Load directly into the subprocess container without ID swapping
        window.currentProcess = process;
        window.currentAsset = subprocessAsset; // Set current asset for download options
        window.loadBPMDiagram(bpmnFile, "subprocess-bpmn-container");
      } catch (error) {
        console.error("Error loading subprocess BPMN diagram:", error);
        // Show error state
        container.innerHTML = `
          <div class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Erro no diagrama BPMN</h3>
              <p class="mt-1 text-sm text-gray-600">
                Este arquivo BPMN contém erros de estrutura.<br>
                Tente recarregar a página.
              </p>
            </div>
          </div>
        `;
      }
    }
  } else {
    console.error("loadBPMDiagram function not available");
    // Show error state
    const container = document.getElementById("subprocess-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="text-sm text-gray-500">Erro ao carregar diagrama BPMN</p>
            <p class="text-xs text-gray-400 mt-1">Função de carregamento não disponível.</p>
          </div>
        </div>
      `;
    }
  }
}

function showAssetDetail(assetId) {
  const process = AppState.currentProcess;
  if (!process) {
    console.error("No current process found");
    return;
  }

  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];
  const asset = currentVersion?.assets?.find((a) => a.id === assetId);

  if (!asset) {
    if (typeof window.showNotification === "function") {
      window.showNotification("Asset não encontrado");
    }
    return;
  }

  // Create asset detail view
  const contentArea = document.getElementById("content-area");

  // Remove existing views
  const existingDetailView = document.getElementById("process-detail-view");
  if (existingDetailView) {
    existingDetailView.remove();
  }
  const existingListView = document.getElementById("process-list-view");
  if (existingListView) {
    existingListView.remove();
  }
  const existingSubprocessView = document.getElementById(
    "subprocess-detail-view",
  );
  if (existingSubprocessView) {
    existingSubprocessView.remove();
  }

  // Hide all static sections
  const allSections = contentArea.querySelectorAll(".content-section");
  allSections.forEach((section) => section.classList.add("hidden"));

  const assetDetailHTML = `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Asset Header -->
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center mb-2">
              <span class="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                Modelo BPMN
              </span>
              <span class="ml-3 text-sm text-gray-500">${asset.code}</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${asset.subtitle}</h1>
            <p class="text-gray-600">${asset.description || "Sem descrição"}</p>
          </div>
        </div>
        
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-600">
          <a href="#" onclick="showHomepage()" class="hover:text-igfej-blue">Início</a>
          <span class="text-gray-400">/</span>
          <a href="#" onclick="navigateToMacroprocess('${process.macroprocess_id}')" class="hover:text-igfej-blue">
            ${getMacroprocessTitle(process.macroprocess_id)}
          </a>
          <span class="text-gray-400">/</span>
          <a href="#" onclick="showProcessDetail('${process.id}')" class="hover:text-igfej-blue">
            ${process.title}
          </a>
          <span class="text-gray-400">/</span>
          <span class="text-gray-900">${asset.subtitle}</span>
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="p-6">
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações do Modelo</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Código</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${asset.code}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Processo</dt>
                <dd class="mt-1 text-sm text-gray-900">${process.code}: ${process.title}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Arquivos</dt>
                <dd class="mt-1 text-sm text-gray-900">${asset.files?.filter((file) => file.bpmn_file || file.svg_file || file.dmn_file).length || 0} arquivo(s)</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Arquivos Disponíveis</h3>
            <div class="space-y-2">
              ${asset.files
                ?.map(
                  (file) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <span class="text-sm font-medium px-2 py-1 bg-igfej-light text-igfej-blue rounded">
                      ${file.bpmn_file ? "BPMN" : ""}
                    </span>
                    <span class="ml-2 text-sm text-gray-700">
                      ${file.bpmn_file ? file.bpmn_file : "N/A"}
                    </span>
                  </div>
                  <button onclick="loadAssetBPMN('${asset.id}')" class="text-igfej-blue hover:text-igfej-dark underline text-sm">
                    Visualizar
                  </button>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

  const tempDiv = document.createElement("div");
  tempDiv.className = "content-section";
  tempDiv.id = "asset-detail-view";
  tempDiv.innerHTML = assetDetailHTML;
  contentArea.appendChild(tempDiv);

  // Initialize Feather Icons for new content
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Hide other sections
  allSections.forEach((section) => section.classList.add("hidden"));
  tempDiv.classList.remove("hidden");

  AppState.currentView = "asset-detail";

  // Update breadcrumb
  updateBreadcrumb([
    "Início",
    getMacroprocessTitle(process.macroprocess_id),
    process.title,
    asset.subtitle || "Asset",
  ]);

  // Show breadcrumb
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb) {
    breadcrumb.classList.remove("hidden");
  }
}

function loadAssetBPMN(assetId) {
  const process = AppState.currentProcess;
  if (!process) {
    console.error("No current process found");
    return;
  }

  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];
  const asset = currentVersion?.assets?.find((a) => a.id === assetId);

  if (!asset || !asset.files?.[0]?.bpmn_file) {
    if (typeof window.showNotification === "function") {
      window.showNotification("Arquivo BPMN não encontrado");
    } else {
      console.error("BPMN file not found for asset:", assetId);
    }
    return;
  }

  // Load the BPMN file
  if (typeof window.loadBPMDiagram === "function") {
    window.currentAsset = asset;
    window.loadBPMDiagram(asset.files[0].bpmn_file);
    // Switch to assets tab
    switchTab("assets");
  } else {
    console.error("loadBPMDiagram function not available");
  }
}

// New function to load BPMN diagram directly into visualizer
window.loadBPMNDiagramFromList = function loadBPMNDiagramFromList(assetId) {
  const process = AppState.currentProcess;
  if (!process) {
    console.error("No current process found");
    return;
  }

  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];
  const asset = currentVersion?.assets?.find((a) => a.id === assetId);

  if (!asset || !asset.files?.[0]?.bpmn_file) {
    if (typeof window.showNotification === "function") {
      window.showNotification("Arquivo BPMN não encontrado");
    } else {
      console.error("BPMN file not found for asset:", assetId);
    }
    return;
  }

  // Update visual selection
  const assetItems = document.querySelectorAll(".asset-list-item");
  assetItems.forEach((item) => {
    item.classList.remove("selected", "bg-blue-50", "border-blue-300");
    item.classList.add("bg-white", "border-gray-200");
  });

  // Find and highlight the clicked item
  const clickedItem = document.querySelector(`[onclick*="${assetId}"]`);
  if (clickedItem) {
    clickedItem.classList.remove("bg-white", "border-gray-200");
    clickedItem.classList.add("selected", "bg-blue-50", "border-blue-300");
  }

  // Load the BPMN file directly into the visualizer
  if (typeof window.loadBPMDiagram === "function") {
    window.currentAsset = asset;
    window.loadBPMDiagram(asset.files[0].bpmn_file);
  } else {
    console.error("loadBPMDiagram function not available");
  }

  // Ensure download options are updated after loading
  setTimeout(() => {
    if (typeof window.updateDownloadOptions === "function") {
      window.updateDownloadOptions();
    }
  }, 100);
};

// Auto-select first diagram when assets tab is shown
function selectFirstDiagram() {
  const assetsTab = document.getElementById("assets-tab");
  if (!assetsTab || !assetsTab.classList.contains("active")) return;

  // Check if there's already a selected item
  const selectedItem = document.querySelector(".asset-list-item.selected");
  if (selectedItem) return; // Already have selection

  // Find first asset item and select it with a delay to ensure canvas is ready
  const firstItem = document.querySelector(".asset-list-item");
  if (firstItem) {
    const onclickAttr = firstItem.getAttribute("onclick");
    if (onclickAttr) {
      // Extract asset ID from onclick attribute
      const match = onclickAttr.match(/loadBPMNDiagramFromList\('([^']+)'\)/);
      if (match && match[1]) {
        // Add delay to ensure canvas container is properly sized
        setTimeout(() => {
          window.loadBPMNDiagramFromList(match[1]);
        }, 500); // Increased delay for auto-selection
      }
    }
  }
}

function loadProcessBpmn(processId) {
  const process = AppState.processes.find((p) => p.id === processId);
  if (!process) {
    console.error("Process not found:", processId);
    return;
  }

  const currentVersion =
    process.versions?.find((v) => v.id === process.current_version_id) ||
    process.versions?.[0];

  if (!currentVersion) {
    console.error("No version found for process:", processId);
    return;
  }

  // Check if process has assets with BPMN files
  const assets = currentVersion.assets || [];
  const assetWithBpmn = assets.find(
    (asset) => asset.files && asset.files.some((file) => file.bpmn_file),
  );

  if (!assetWithBpmn) {
    // Show message to use Assets tab
    const container = document.getElementById("process-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Diagrama BPMN Indisponível</h3>
            <p class="mt-1 text-sm text-gray-500">
              Este processo não tem diagramas BPMN diretos.<br>
              <a href="#" onclick="switchTab('assets')" class="text-igfej-blue hover:text-igfej-dark underline">
                Ver diagramas na aba Diagramas →
              </a>
            </p>
          </div>
        </div>
      `;
    }
    AppState.processBpmnLoaded = true;
    return;
  }

  // Load BPMN from the first available asset
  const bpmnFile = assetWithBpmn.files.find(
    (file) => file.bpmn_file,
  )?.bpmn_file;

  if (!bpmnFile) {
    console.error("BPMN file not found in asset:", assetWithBpmn.id);
    const container = document.getElementById("process-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="text-sm text-gray-500">Arquivo BPMN não encontrado</p>
            <p class="text-xs text-gray-400 mt-1">Verifique os arquivos do asset.</p>
          </div>
        </div>
      `;
    }
    AppState.processBpmnLoaded = true;
    return;
  }

  // Load the BPMN file
  if (typeof window.loadBPMDiagram === "function") {
    try {
      window.currentProcess = process;
      window.loadBPMDiagram(bpmnFile);
    } catch (error) {
      console.error("Error loading BPMN diagram:", error);
      // Show error state
      const container = document.getElementById("process-bpmn-container");
      if (container) {
        container.innerHTML = `
          <div class="flex items-center justify-center h-full text-gray-500">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Erro no diagrama BPMN</h3>
              <p class="mt-1 text-sm text-gray-600">
                Este arquivo BPMN contém erros de estrutura e não pode ser exibido.<br>
                <a href="#" onclick="switchTab('assets')" class="text-igfej-blue hover:text-igfej-dark underline">
                  Ver outros modelos BPMN →
                </a>
              </p>
            </div>
          </div>
        `;
      }
    }
  } else {
    console.error("loadBPMDiagram function not available");
    // Show error state
    const container = document.getElementById("process-bpmn-container");
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="text-sm text-gray-500">Erro ao carregar diagrama BPMN</p>
            <p class="text-xs text-gray-400 mt-1">Função de carregamento não disponível.</p>
          </div>
        </div>
      `;
    }
  }

  AppState.processBpmnLoaded = true;
}

function switchSubprocessTab(tabName, event) {
  // Prevent default behavior
  if (event) {
    event.preventDefault();
  }

  // Update tab buttons
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.classList.remove("border-igfej-blue", "text-igfej-blue");
    button.classList.add("border-transparent", "text-gray-500");
  });

  // Activate clicked tab
  const clickedButton = event
    ? event.target
    : document.querySelector(`[onclick*="switchSubprocessTab('${tabName}'"]`);
  if (clickedButton) {
    clickedButton.classList.remove("border-transparent", "text-gray-500");
    clickedButton.classList.add("border-igfej-blue", "text-igfej-blue");
  }

  // Show corresponding content
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.remove("active"));

  const activeTab = document.getElementById(`subprocess-${tabName}-tab`);
  if (activeTab) {
    activeTab.classList.add("active");
  }
}

function switchTab(tabName, event) {
  // Prevent default behavior
  if (event) {
    event.preventDefault();
  }

  // Update tab buttons - remove active state from all tabs
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.classList.remove("border-blue-500", "text-blue-600");
    button.classList.add("border-transparent", "text-gray-500");
  });

  // Activate clicked tab
  const clickedButton = event
    ? event.target.closest(".tab-button")
    : document.querySelector(`[onclick*="switchTab('${tabName}'"]`);
  if (clickedButton) {
    clickedButton.classList.remove("border-transparent", "text-gray-500");
    clickedButton.classList.add("border-blue-500", "text-blue-600");
  }

  // Show corresponding content
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.remove("active"));

  const activeTab = document.getElementById(`${tabName}-tab`);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Auto-load process BPMN when process detail is opened
  if (
    tabName === "process-bpmn" ||
    (tabName === "overview" && !AppState.processBpmnLoaded)
  ) {
    const process = AppState.currentProcess;
    if (process) {
      loadProcessBpmn(process.id);
    }
  }

  // Load BPMN diagram if assets tab is clicked
  if (tabName === "assets") {
    const process = AppState.currentProcess;
    if (process) {
      const currentVersion =
        process.versions?.find((v) => v.id === process.current_version_id) ||
        process.versions?.[0];
      if (currentVersion?.assets?.length > 0) {
        // Auto-select the first diagram
        selectFirstDiagram();
      }
    }
  }
}

function getMacroprocessTitle(macroprocessId) {
  const macroprocess = AppState.macroprocesses.find(
    (m) => m.id === macroprocessId,
  );
  return macroprocess ? macroprocess.title : macroprocessId;
}

function showHomepage() {
  // Now shows the welcome page instead of dashboard
  navigateToSection("welcome");
}

function showDashboard() {
  navigateToSection("homepage");
}

function updateBreadcrumb(items) {
  const breadcrumb = document.getElementById("breadcrumb");
  if (!breadcrumb) return;

  const breadcrumbHTML = items
    .map((item, index) => {
      if (index === items.length - 1) {
        return `<span class="text-gray-900">${item}</span>`;
      } else {
        return `<a href="javascript:void(0)" onclick="handleBreadcrumbClick(${index})" class="hover:text-igfej-blue">${item}</a>`;
      }
    })
    .join('<span class="mx-2 text-gray-400">/</span>');

  breadcrumb.innerHTML = breadcrumbHTML;
}

function handleBreadcrumbClick(index) {
  const currentProcess = AppState.currentProcess;
  const currentView = AppState.currentView;

  if (index === 0) {
    showHomepage();
  } else if (index === 1) {
    if (currentProcess) {
      navigateToMacroprocess(currentProcess.macroprocess_id);
    } else {
      showHomepage();
    }
  } else if (index === 2) {
    if (currentProcess) {
      showProcessDetail(currentProcess.id);
    } else {
      showHomepage();
    }
  } else if (index === 3) {
    if (currentProcess) {
      showProcessDetail(currentProcess.id);
    } else {
      showHomepage();
    }
  }
}

function toggleFAQ(index) {
  const answer = document.getElementById(`faq-answer-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);

  if (answer.classList.contains("hidden")) {
    answer.classList.remove("hidden");
    icon.classList.add("rotate-180");
  } else {
    answer.classList.add("hidden");
    icon.classList.remove("rotate-180");
  }
}

// Expose FAQ function to global window
window.toggleFAQ = toggleFAQ;

// Expose essential existing global functions
window.showHomepage = showHomepage;
window.showDashboard = showDashboard;
window.navigateToMacroprocess = navigateToMacroprocess;
window.showProcessDetail = showProcessDetail;
window.showSubprocessDetail = showSubprocessDetail;
window.switchTab = switchTab;
window.filterProcesses = filterProcesses;
window.filterProcessListItems = filterProcessListItems;
window.handleBreadcrumbClick = handleBreadcrumbClick;
window.toggleCollapsible = function (contentId, iconId) {
  const content = document.getElementById(contentId);
  const icon = document.getElementById(iconId);

  if (!content || !icon) return;

  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    icon.classList.add("rotate-180");
  } else {
    content.classList.add("hidden");
    icon.classList.remove("rotate-180");
  }
};

window.toggleMethodologySection = function (sectionId) {
  toggleCollapsible(sectionId, `icon-${sectionId}`);
};

window.toggleFAQ = function (index) {
  toggleCollapsible(`faq-answer-${index}`, `faq-icon-${index}`);
};

// Mobile sidebar functions
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("sidebar-collapsed");
  }
};

window.closeSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.add("sidebar-collapsed");
  }
};

function createCollapsibleItem(
  title,
  contentHTML,
  sectionId,
  toggleFunction = "toggleMethodologySection",
  isHidden = true,
) {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      <button onclick="${toggleFunction}('${sectionId}')" class="flex items-center w-full text-left py-2 rounded transition-colors">
        <span class="text-lg font-medium text-gray-900 flex-1 pr-4">${title}</span>
        ${createChevron("down", "", "icon-" + sectionId)}
      </button>
      <div id="${sectionId}" class="hidden mt-4 text-gray-700 max-w-full">
        ${contentHTML}
      </div>
    </div>
  `;
}

function createProcessListItem(item) {
  const config = getTypeConfig(item.type);

  if (item.type === "subprocess") {
    return `
      <div class="process-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-igfej-blue" onclick="showSubprocessDetail('${item.id}')">
        <div class="flex flex-col h-full">
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">
                  Subprocesso
                </span>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">${getDisplayCode(item)}: ${item.title}</h4>
              <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div class="flex items-center">
                  ${getIcon("home", 12)}
                  Pai: ${item.parent_process_code}
                </div>
              </div>
            </div>
            ${getIcon("chevron-right", 16)}
          </div>
          
          <!-- Bottom Section with Divider -->
          <div class="mt-auto pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${getMacroprocessTitle(item.macroprocess_id)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="process-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-igfej-blue" onclick="showProcessDetail('${item.id}')">
        <div class="flex flex-col h-full">
          <!-- Header Section -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}">
                  Processo
                </span>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">${item.code}: ${item.title}</h4>
              <p class="text-sm text-gray-600 line-clamp-2 flex-grow">${item.description}</p>
              ${
                item.subprocess_count > 0
                  ? `
                <div class="mt-2 text-xs text-gray-500">
                  <div class="flex items-center">
                    ${getIcon("layers", 12)}
                    ${item.subprocess_count} subprocesso${item.subprocess_count !== 1 ? "s" : ""}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
            ${getIcon("chevron-right", 16)}
          </div>
          
          <!-- Bottom Section with Divider -->
          <div class="mt-auto pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${getMacroprocessTitle(item.macroprocess_id)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

function filterProcessListItems(searchTerm) {
  /** @type {string} */
  searchTerm;
  if (!AppState.currentProcessListItems) return;

  const filterInput = document.getElementById("process-filter-input");
  const typeFilter = document.getElementById("process-type-filter");

  const search = filterInput ? filterInput.value.toLowerCase() : "";
  const type = typeFilter ? typeFilter.value : "all";

  const processCards = document.querySelectorAll("#process-list .process-card");

  AppState.currentProcessListItems.forEach((item, index) => {
    const card = processCards[index];
    if (!card) return;

    // Check if item matches filters
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search) ||
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesType = type === "all" || item.type === type;

    if (matchesSearch && matchesType) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Update breadcrumb for filtered results
  const breadcrumb = document.getElementById("breadcrumb");
  if (breadcrumb) {
    breadcrumb.classList.remove("hidden");

    let breadcrumbItems = ["Início"];

    // Add current macroprocess if available
    if (AppState.currentProcess) {
      breadcrumbItems.push(
        getMacroprocessTitle(AppState.currentProcess.macroprocess_id),
      );
    }

    // Add filter context
    let filterContext = "Processos";
    if (search && type !== "all") {
      filterContext = `Processos (${type}: "${search}")`;
    } else if (search) {
      filterContext = `Processos (Pesquisa: "${search}")`;
    } else if (type !== "all") {
      filterContext = `Processos (${type})`;
    }

    breadcrumbItems.push(filterContext);

    updateBreadcrumb(breadcrumbItems);
  }
}

function filterProcesses(searchTerm) {
  const processCards = document.querySelectorAll("#process-list .process-card");
  const term = searchTerm.toLowerCase();

  processCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(term)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function toggleMacroprocessDropdown() {
  const dropdown = document.getElementById("macroprocess-dropdown");
  const button = document.getElementById("macroprocess-dropdown-btn");
  const arrow = button.querySelector("svg");

  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    arrow.classList.add("rotate-180");
  } else {
    dropdown.classList.add("hidden");
    arrow.classList.remove("rotate-180");
  }
}

function closeMacroprocessDropdown() {
  const dropdown = document.getElementById("macroprocess-dropdown");
  const button = document.getElementById("macroprocess-dropdown-btn");
  const arrow = button.querySelector("svg");

  dropdown.classList.add("hidden");
  arrow.classList.remove("rotate-180");
}

function initializeSidebarState() {
  const sidebar = document.getElementById("sidebar");

  if (window.innerWidth >= 768) {
    // Desktop: hide sidebar by default (we use top menu)
    sidebar.classList.add("sidebar-collapsed");
    AppState.sidebarOpen = false;
  } else {
    // Mobile: hide sidebar by default
    sidebar.classList.add("sidebar-collapsed");
    AppState.sidebarOpen = false;
  }

  // Initialize active navigation tab
  const currentView = AppState.currentView || "welcome";
  const allNavTabs = document.querySelectorAll(".nav-tab");
  allNavTabs.forEach((tab) => tab.classList.remove("active"));

  // Set active tab based on current view
  let activeTabId;
  if (currentView === "welcome") {
    activeTabId = "nav-welcome";
  } else if (currentView === "homepage") {
    activeTabId = "nav-homepage";
  } else {
    activeTabId = `nav-${currentView}`;
  }

  const activeTab = document.getElementById(activeTabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }
}

// Make subprocess navigation function globally available for research results
window.showSubprocessDetail = showSubprocessDetail;

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("macroprocess-dropdown");
  const button = document.getElementById("macroprocess-dropdown-btn");

  if (!dropdown.contains(e.target) && !button.contains(e.target)) {
    closeMacroprocessDropdown();
  }
});

// Helper function to animate counter updates
function animateCounter(element, targetValue) {
  if (!element) return;

  const startValue = parseInt(element.textContent) || 0;
  const duration = 1000; // 1 second animation
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(
      startValue + (targetValue - startValue) * easeOutQuart,
    );

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = targetValue; // Ensure final value is exact
    }
  }

  requestAnimationFrame(updateCounter);
}

// Function to refresh statistics when data changes
function refreshStatistics() {
  updateStatistics();
}

// Expose functions globally
window.refreshStatistics = refreshStatistics;
window.updateStatistics = updateStatistics;

// Table Management System
class TableManager {
  constructor(
    tableId,
    searchId,
    prevId,
    nextId,
    showingId,
    totalId,
    itemsPerPage = 5,
  ) {
    this.tableId = tableId;
    this.searchId = searchId;
    this.prevId = prevId;
    this.nextId = nextId;
    this.showingId = showingId;
    this.totalId = totalId;
    this.itemsPerPage = itemsPerPage;

    this.currentPage = 1;
    this.filteredData = [];
    this.originalData = [];
    this.currentSort = null;
    this.sortDirection = "asc";

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById(this.searchId);
    if (searchInput) {
      searchInput.addEventListener("input", () => this.handleSearch());
    }

    // Pagination
    const prevBtn = document.getElementById(this.prevId);
    const nextBtn = document.getElementById(this.nextId);
    if (prevBtn)
      prevBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage - 1),
      );
    if (nextBtn)
      nextBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage + 1),
      );
  }

  setData(data) {
    this.originalData = data;
    this.filteredData = [...data];
    this.currentPage = 1;
    this.updateTable();
  }

  handleSearch() {
    const searchInput = document.getElementById(this.searchId);
    const searchTerm = searchInput.value.toLowerCase();

    this.filteredData = this.originalData.filter((item) => {
      return this.searchInItem(item, searchTerm);
    });

    this.currentPage = 1;
    this.updateTable();
  }

  searchInItem(item, searchTerm) {
    // Override in subclasses
    return false;
  }

  handleSort(sortBy) {
    // Toggle sort direction if same column
    if (this.currentSort === sortBy) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.currentSort = sortBy;
      this.sortDirection = "asc";
    }

    this.updateSortIcons();

    this.filteredData.sort((a, b) => {
      const aValue = this.getSortValue(a, sortBy);
      const bValue = this.getSortValue(b, sortBy);

      if (typeof aValue === "string") {
        return this.sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return this.sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    this.updateTable();
  }

  getSortValue(item, sortBy) {
    // Override in subclasses
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

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.itemsPerPage,
      this.filteredData.length,
    );

    const showingElement = document.getElementById(this.showingId);
    const totalElement = document.getElementById(this.totalId);
    const prevBtn = document.getElementById(this.prevId);
    const nextBtn = document.getElementById(this.nextId);

    if (showingElement) {
      showingElement.textContent =
        this.filteredData.length > 0 ? `${startIndex + 1}-${endIndex}` : "0";
    }

    if (totalElement) {
      totalElement.textContent = this.filteredData.length;
    }

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }

    if (nextBtn) {
      const totalPages = Math.ceil(
        this.filteredData.length / this.itemsPerPage,
      );
      nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }
  }
}

// Macroprocess Table Manager
class MacroprocessTableManager extends TableManager {
  constructor() {
    super(
      "macroprocesses-table-body",
      "macroprocess-search",
      "macroprocesses-prev",
      "macroprocesses-next",
      "macroprocesses-showing",
      "macroprocesses-total",
    );
  }

  searchInItem(item, searchTerm) {
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.slug.toLowerCase().includes(searchTerm)
    );
  }

  getSortValue(item, sortBy) {
    switch (sortBy) {
      case "name":
        return item.title;
      case "processes":
        return item.processCount;
      case "subprocesses":
        return item.subprocessCount;
      default:
        return item.title;
    }
  }

  updateSortIcons() {
    // Reset all icons
    document.querySelectorAll(".sort-icon").forEach((icon) => {
      icon.setAttribute("data-feather", "chevron-up");
    });

    // Update current sort icon
    if (this.currentSort) {
      const currentIcon = document.querySelector(`.sort-${this.currentSort}`);
      if (currentIcon) {
        currentIcon.setAttribute(
          "data-feather",
          this.sortDirection === "asc" ? "chevron-up" : "chevron-down",
        );
      }
    }

    // Re-initialize Feather icons
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  renderTableRows() {
    const tbody = document.getElementById(this.tableId);
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    tbody.innerHTML = pageData
      .map(
        (macro) => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div>
            <div class="text-sm font-medium text-gray-900">${macro.title}</div>
            <div class="text-sm text-gray-500">${macro.slug}</div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${macro.description}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">${macro.processCount}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">${macro.subprocessCount}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-igfej-blue hover:text-igfej-dark mr-3" onclick="navigateToMacroprocess('${macro.id}')">Ver Detalhes</button>
        </td>
      </tr>
    `,
      )
      .join("");

    // Re-initialize Feather icons
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }
}

// Process Table Manager
class ProcessTableManager extends TableManager {
  constructor() {
    super(
      "processes-table-body",
      "process-search",
      "processes-prev",
      "processes-next",
      "processes-showing",
      "processes-total",
    );
  }

  searchInItem(item, searchTerm) {
    return (
      item.code.toLowerCase().includes(searchTerm) ||
      item.title.toLowerCase().includes(searchTerm) ||
      item.macroprocessTitle.toLowerCase().includes(searchTerm) ||
      item.status.toLowerCase().includes(searchTerm)
    );
  }

  getSortValue(item, sortBy) {
    switch (sortBy) {
      case "code":
        return item.code;
      case "name":
        return item.title;
      case "macroprocess":
        return item.macroprocessTitle;
      case "status":
        return item.status;
      default:
        return item.code;
    }
  }

  updateSortIcons() {
    // Reset all icons
    document.querySelectorAll(".sort-icon").forEach((icon) => {
      icon.setAttribute("data-feather", "chevron-up");
    });

    // Update current sort icon
    if (this.currentSort) {
      const currentIcon = document.querySelector(`.sort-${this.currentSort}`);
      if (currentIcon) {
        currentIcon.setAttribute(
          "data-feather",
          this.sortDirection === "asc" ? "chevron-up" : "chevron-down",
        );
      }
    }

    // Re-initialize Feather icons
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  renderTableRows() {
    const tbody = document.getElementById(this.tableId);
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    tbody.innerHTML = pageData
      .map(
        (process) => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${process.code}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div>
            <div class="text-sm font-medium text-gray-900">${process.title}</div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${process.macroprocessTitle}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${process.status}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-igfej-blue hover:text-igfej-dark mr-3" onclick="showProcessDetail('${process.id}')">Ver Detalhes</button>
        </td>
      </tr>
    `,
      )
      .join("");

    // Re-initialize Feather icons
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }
}

// Function to initialize tables with data
function initializeTables() {
  // Initialize macroprocess table
  macroprocessTableManager = new MacroprocessTableManager();
  const macroprocessData = AppState.macroprocesses.map((macro) => ({
    id: macro.id,
    title: macro.title,
    slug: macro.slug || macro.title.toLowerCase().replace(/\s+/g, "-"),
    description: macro.description || "Descrição do macroprocesso",
    processCount: AppState.processes.filter(
      (p) => p.macroprocess_id === macro.id,
    ).length,
    subprocessCount: AppState.processes
      .filter((p) => p.macroprocess_id === macro.id)
      .reduce((total, process) => {
        const currentVersion = process.versions?.find(
          (v) => v.id === process.current_version_id,
        );
        return total + (currentVersion?.subprocesses?.length || 0);
      }, 0),
  }));
  macroprocessTableManager.setData(macroprocessData);

  // Initialize process table
  processTableManager = new ProcessTableManager();
  const processData = AppState.processes.map((process) => {
    const macro = AppState.macroprocesses.find(
      (m) => m.id === process.macroprocess_id,
    );
    return {
      id: process.id,
      code: process.code,
      title: process.title,
      macroprocessTitle: macro ? macro.title : "N/A",
      status: "AS-IS", // Default status, can be dynamic
    };
  });
  processTableManager.setData(processData);
}

// Expose functions globally
window.initializeTables = initializeTables;
window.navigateToMacroprocess = navigateToMacroprocess;
window.showProcessDetail = showProcessDetail;

// Version switching function
window.switchProcessVersion = function (processId, versionId) {
  const process = AppState.processes.find((p) => p.id === processId);
  if (process) {
    process.current_version_id = versionId;
    // Re-render the process detail with the new version
    showProcessDetail(processId);
  }
};
window.sortMacroprocessTable = function (sortBy) {
  if (window.macroprocessTableManager) {
    window.macroprocessTableManager.handleSort(sortBy);
  }
};

window.sortProcessTable = function (sortBy) {
  if (window.processTableManager) {
    window.processTableManager.handleSort(sortBy);
  }
};
