const FAQ_ITEMS = [
  ["Qual é a diferença entre macroprocesso, processo e subprocesso?", "O sistema utiliza uma estrutura hierárquica com três níveis: Macroprocesso, Processo e Subprocesso. Esta estrutura permite navegar desde áreas funcionais até atividades operacionais detalhadas."],
  ['Quais são os critérios para classificar um processo como "AS-IS" ou "TO-BE"?', 'Um processo é classificado como "AS-IS" quando representa o estado atual de execução. "TO-BE" representa o estado futuro desejado após optimizações e melhorias identificadas durante a análise.'],
  ["O que significa o nível de maturidade de um processo?", "O nível de maturidade indica o grau de desenvolvimento e implementação do processo na organização, baseado no modelo CMMI."],
  ["Como posso aceder aos diagramas dos processos?", 'Os diagramas estão disponíveis na secção "Diagramas". Navegue até ao processo desejado e aceda à visualização interactiva dos diagramas.'],
  ["Como posso identificar os intervenientes de um processo?", "Cada processo documentado inclui secções específicas para participantes, fornecedores e clientes, identificando papéis e responsabilidades."],
  ["Como posso pesquisar e filtrar processos específicos?", "Use a barra de pesquisa principal para buscar por nome, código ou palavras-chave. Nos macroprocessos, utilize os filtros por status e tipo de processo."],
  ["Quais são os padrões de segurança aplicados aos processos?", "Todos os processos seguem os padrões de segurança da informação definidos pela legislação portuguesa e normas internacionais."],
  ["Como posso navegar entre diferentes versões de um processo?", "Na página de detalhes de um processo, utilize o seletor de versões localizado no cabeçalho."],
  ["Como interpretar as métricas e indicadores de um processo?", "As métricas incluem indicadores de desempenho, tempos de execução, taxas de sucesso e outros dados quantitativos que ajudam a avaliar a eficiência e eficácia do processo."],
];

function getFAQSection() {
  return `
    <section id="faq" class="content-section hidden">
      <div class="max-w-govpt-container mx-auto px-4 py-8">
        <div class="space-y-8">
          <div id="faq-overview" class="mb-6">
            <h1 class="mb-4 text-govpt-3xl font-bold text-govpt-heading">Perguntas Frequentes</h1>
            <p class="text-govpt-lg leading-relaxed text-govpt-gray">Tire as suas dúvidas sobre o sistema de gestão de processos.</p>
          </div>
          <div id="faq-content" class="space-y-3"></div>
        </div>
      </div>
    </section>
  `;
}

function renderFAQ() {
  const container = document.getElementById("faq-content");
  if (!container) return;

  container.innerHTML = FAQ_ITEMS.map(
    ([question, answer], index) => `
      <div class="mb-3 rounded-lg border border-gray-200 bg-white p-4">
        <button onclick="toggleFAQ(${index})" class="flex w-full items-center rounded py-2 text-left transition-colors">
          <span class="flex-1 pr-4 text-lg font-medium text-gray-900">${question}</span>
          ${createChevron("down", "", `faq-icon-${index}`)}
        </button>
        <div id="faq-answer-${index}" class="mt-4 hidden max-w-full text-gray-700">${answer}</div>
      </div>
    `,
  ).join("");
}

function toggleFAQ(index) {
  window.toggleCollapsible(`faq-answer-${index}`, `faq-icon-${index}`);
}

Object.assign(window, {
  getFAQSection,
  renderFAQ,
  toggleFAQ,
});
