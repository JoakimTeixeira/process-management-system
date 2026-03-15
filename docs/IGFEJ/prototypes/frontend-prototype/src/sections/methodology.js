const METHODOLOGY_CONTEXT_POINTS = [
  ["Eficiência e Optimização", "Permite identificar estrangulamentos, ineficiências e áreas de melhoria nos processos, o que possibilita optimizá-los para aumentar a produtividade e reduzir custos."],
  ["Padronização", "Estabelece padrões e diretrizes para a execução de tarefas, garantindo consistência e qualidade nos resultados."],
  ["Entendimento dos Processos", "Ajuda a compreender a sequência de atividades, recursos envolvidos e interações entre diferentes estágios, permitindo uma visão holística dos processos."],
  ["Identificação de Problemas", "Facilita a identificação de problemas ou obstáculos nos processos, permitindo a sua resolução de maneira estruturada."],
  ["Tomada de Decisão", "Fornece dados e informações para suportar decisões estratégicas, baseadas em métricas e análises concretas."],
  ["Inovação e Mudança", "Facilita a implementação de mudanças e inovações nos processos, permitindo uma abordagem mais ágil e controlada."],
  ["Compreensão do Ciclo de Vida do Processo", "Ajuda a entender a dinâmica e evolução dos processos ao longo do tempo, permitindo ajustes conforme necessário."],
  ["Controle e Gestão", "Permite um controlo mais efetivo e uma gestão mais eficiente dos processos organizacionais."],
  ["Documentação", "Permite documentar os processos de forma estruturada, facilitando a comunicação e o entendimento entre as partes interessadas."],
];

const METHODOLOGY_GLOSSARY = [
  ["Entidade", "Descreve a entidade onde o processo é executado e que tem interesse na sua documentação. Pode ser uma entidade pública, privada ou outra."],
  ["Responsável", "Descreve a pessoa ou entidade responsável pelo processo. Pode ser uma pessoa, um departamento ou uma entidade. Normalmente é uma pessoa."],
  ["Descrição", "Descreve o processo de forma sucinta, mas completa. Deve ser suficientemente detalhada para que qualquer pessoa possa compreender o processo."],
  ["Palavras-Chave", "Descreve as palavras-chave que melhor caracterizam o processo. Deve ser uma lista de palavras-chave separadas por vírgulas."],
  ["Objetivos", "Descreve os objetivos do processo. Deve ser uma lista de objetivos separados por vírgulas, clarificando o contexto e a razão de existência do processo."],
  ["Inputs", "Descreve os inputs do processo e permite aferir da sua necessidade e qualidade no contributo para enriquecer o processo."],
  ["Atividades", "Descreve as atividades do processo de forma detalhada e as interações entre os vários intervenientes no processo."],
  ["Entregáveis", "Descreve os entregáveis do processo, ou seja, o output esperado quando o processo executa de forma adequada e sistemática."],
  ["Fornecedores", "Descreve de forma detalhada os intervenientes fornecedores de inputs ao processo e as suas interações."],
  ["Participantes", "Descreve de forma detalhada os participantes nas atividades do processo e as suas interações."],
  ["Clientes", "Descreve de forma detalhada os consumidores do processo e as suas interações."],
  ["Metodologias", "Descreve as metodologias que são utilizadas para executar o processo de forma adequada."],
  ["Ferramentas", "Descreve as ferramentas envolvidas e que suportam o processo em momento de execução."],
  ["Métricas", "Descreve as métricas que são utilizadas para medir a eficácia e eficiência do processo."],
  ["Sugestões", "Descreve as sugestões que são feitas para melhorar o processo."],
  ["Maturidade", "Descreve o nível de maturidade do processo com base no modelo de maturidade de processos CMMI."],
  ["Diagramas", "Apresenta os diagramas utilizados para descrever o processo e sumariza as informações de contexto, atividades e fluxo de dados."],
  ["Suporte Legal / Legislação", "Identifica e descreve qual o suporte legal do processo."],
  ["Classificação da informação", "Identifica e descreve qual a classificação do processo em relação à sua confidencialidade e segurança da informação."],
  ["Metadados", "Descreve e apresenta os metadados do processo."],
];

function getMethodologySection() {
  return `
    <section id="methodology" class="content-section hidden">
      <div class="max-w-govpt-container mx-auto px-4 py-8">
        <div class="space-y-8">
          <div class="mb-6">
            <h1 class="mb-4 text-govpt-3xl font-bold text-govpt-heading">Metodologia</h1>
            <p class="text-govpt-lg leading-relaxed text-govpt-gray">Metodologia BPM utilizada para análise e gestão de processos organizacionais.</p>
          </div>
          <div id="methodology-content" class="space-y-6"></div>
        </div>
      </div>
    </section>
  `;
}

function createMethodologyItem(title, contentHTML, sectionId) {
  return `
    <div class="mb-3 rounded-lg border border-gray-200 bg-white p-4">
      <button onclick="toggleMethodologySection('${sectionId}')" class="flex w-full items-center rounded py-2 text-left transition-colors">
        <span class="flex-1 pr-4 text-lg font-medium text-gray-900">${title}</span>
        ${createChevron("down", "", `icon-${sectionId}`)}
      </button>
      <div id="${sectionId}" class="mt-4 hidden max-w-full text-gray-700">${contentHTML}</div>
    </div>
  `;
}

function renderGlossaryItems() {
  return METHODOLOGY_GLOSSARY.map(
    ([title, text], index) => `
      <div class="flex">
        <span class="text-govpt-base font-bold text-govpt-primary mr-4 min-w-8">${index + 1}.</span>
        <div><h4 class="mb-2 text-govpt-base font-semibold text-govpt-heading">${title}</h4><p class="text-govpt-base text-govpt-text">${text}</p></div>
      </div>
    `,
  ).join("");
}

function renderMethodology() {
  const container = document.getElementById("methodology-content");
  if (!container) return;

  const overview = `
    <p class="text-govpt-base text-govpt-text leading-relaxed">Uma metodologia de análise de processos é essencial em vários contextos por diversos motivos:</p>
    <ul class="list-disc list-inside mt-3 space-y-1 text-govpt-base text-govpt-text">${METHODOLOGY_CONTEXT_POINTS.map(([title, text]) => `<li><strong>${title}:</strong> ${text}</li>`).join("")}</ul>
    <p class="mt-3 text-govpt-base text-govpt-text leading-relaxed">Uma metodologia de análise de processos pode variar de acordo com a natureza e o objetivo do processo em questão, e existem várias abordagens disponíveis, como BPM, Six Sigma e Lean.</p>
    <p class="mt-3 text-govpt-base text-govpt-text leading-relaxed">Neste estudo, é seguida uma abordagem BPM. De entre a informação recolhida no relatório de cada processo, encontram-se um número significativo de atributos sobre os quais convém fazer uma descrição mais detalhada.</p>
  `;

  container.innerHTML = [
    createMethodologyItem("Enquadramento", overview, "methodology-enquadramento"),
    createMethodologyItem("Glossário", `<div class="space-y-4">${renderGlossaryItems()}</div>`, "methodology-glossario"),
  ].join("") + `<div class="rounded-lg border border-igfej-blue bg-igfej-light p-6"><h3 class="mb-2 text-lg font-semibold text-igfej-blue">Nota</h3><p class="text-igfej-blue">Informação adicional pode ser apresentada no restante relatório sem que o seu significado tenha sido detalhado nesta secção.</p></div>`;

  window.initializeFeather?.();
  syncNavigationState();
}

function toggleMethodologySection(sectionId) {
  window.toggleCollapsible(sectionId, `icon-${sectionId}`);
}

Object.assign(window, {
  getMethodologySection,
  renderMethodology,
  toggleMethodologySection,
});
