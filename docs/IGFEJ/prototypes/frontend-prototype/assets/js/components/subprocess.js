function getSubprocessSectionEntries(subprocess) {
  const code = getDisplayCode(subprocess);
  const fields = [
    ["Entidade", renderSubprocessArraySection(`${code}.1`, "Entidade", subprocess.entity)],
    ["Responsável", renderSubprocessArraySection(`${code}.2`, "Responsável", subprocess.responsible)],
    ["Descrição", renderSubprocessTextSection(`${code}.3`, "Descrição", normalizeDescription(subprocess.description))],
    ["Palavras Chave", renderSubprocessArraySection(`${code}.4`, "Palavras Chave", subprocess.keywords, { variant: "tags" })],
    ["Objetivos", renderSubprocessArraySection(`${code}.5`, "Objetivos", subprocess.objectives)],
    ["Inputs", renderSubprocessArraySection(`${code}.6`, "Inputs", subprocess.inputs)],
    ["Actividades", renderSubprocessActivitiesSection(`${code}.7`, subprocess)],
    ["Entregáveis", renderSubprocessArraySection(`${code}.8`, "Entregáveis", subprocess.deliverables)],
    ["Fornecedores", renderSubprocessArraySection(`${code}.9`, "Fornecedores", subprocess.suppliers)],
    ["Participantes", renderSubprocessArraySection(`${code}.10`, "Participantes", subprocess.participants)],
    ["Clientes", renderSubprocessArraySection(`${code}.11`, "Clientes", subprocess.clients)],
    ["Metodologias", renderSubprocessArraySection(`${code}.12`, "Metodologias", subprocess.methodologies)],
    ["Ferramentas", renderSubprocessArraySection(`${code}.13`, "Ferramentas", subprocess.tools)],
    ["Métricas", renderSubprocessArraySection(`${code}.14`, "Métricas", normalizeStructuredField(subprocess.metrics))],
    ["Maturidade", renderSubprocessArraySection(`${code}.15`, "Maturidade", subprocess.maturity)],
    ["Pedido (ITSM)", renderSubprocessArraySection(`${code}.16`, "Pedido (ITSM)", subprocess.itsm_request)],
    ["Serviço (CMDB)", renderSubprocessArraySection(`${code}.17`, "Serviço (CMDB)", subprocess.cmdb_service)],
    ["Sugestões", renderSubprocessArraySection(`${code}.18`, "Sugestões", normalizeStructuredField(subprocess.suggestions))],
    ["Suporte Legal / Legislação", renderSubprocessArraySection(`${code}.19`, "Suporte Legal / Legislação", normalizeStructuredField(subprocess.legal_support))],
    ["Classificação da informação", renderSubprocessInformationClassificationSection(`${code}.20`, subprocess.information_classification)],
    ["Metadados", renderSubprocessMetadataSection(`${code}.21`, subprocess.metadata)],
  ];

  return fields
    .map(([title, markup]) => ({ key: title, markup: wrapSubprocessSection(title, markup) }))
    .filter((entry) => entry.markup);
}

function renderSubprocessOverviewColumns(sections) {
  return `<div class="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">${sections.filter(Boolean).map((section) => `<div>${section}</div>`).join("")}</div>`;
}

function renderSubprocessSummary(subprocess) {
  const keywords = Array.isArray(subprocess.keywords) ? subprocess.keywords : [];
  const participants = Array.isArray(subprocess.participants) ? subprocess.participants : [];
  const tools = Array.isArray(subprocess.tools) ? subprocess.tools : [];
  const inputs = Array.isArray(subprocess.inputs) ? subprocess.inputs : [];
  const deliverables = Array.isArray(subprocess.deliverables) ? subprocess.deliverables : [];
  const metrics = normalizeStructuredField(subprocess.metrics);
  const metadata = subprocess.metadata || {};
  const interviewed = Array.isArray(metadata.interviewed) ? metadata.interviewed : [];

  return `
    <dl class="grid grid-cols-1 gap-4 xl:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <dt class="text-sm text-gray-500">Responsável</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">${Array.isArray(subprocess.responsible) && subprocess.responsible.length ? subprocess.responsible.join(", ") : "N/A"}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <dt class="text-sm text-gray-500">Participantes</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">${participants.length}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <dt class="text-sm text-gray-500">Inputs</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">${inputs.length}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <dt class="text-sm text-gray-500">Entregáveis</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">${deliverables.length}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 p-4 xl:col-span-2">
        <dt class="text-sm text-gray-500">Contexto</dt>
        <dd class="mt-1 text-sm text-gray-700">${Array.isArray(subprocess.entity) && subprocess.entity.length ? subprocess.entity.join(", ") : "N/A"}</dd>
        <dd class="mt-2 text-sm text-gray-700">${keywords.length ? keywords.join(", ") : "Sem palavras-chave"}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 p-4">
        <dt class="text-sm text-gray-500">Ferramentas</dt>
        <dd class="mt-1 text-sm text-gray-700">${tools.length ? tools.join(", ") : "N/A"}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 p-4">
        <dt class="text-sm text-gray-500">Métricas e Metadados</dt>
        <dd class="mt-1 text-sm text-gray-700">${metrics.length ? metrics.join(", ") : "Sem métricas definidas"}</dd>
        <dd class="mt-2 text-sm text-gray-700">${metadata.interviewer || interviewed.length ? `Entrevistas: ${[metadata.interviewer, ...interviewed].filter(Boolean).join(", ")}` : "Sem metadados de entrevista"}</dd>
      </div>
    </dl>
  `;
}

function renderSubprocessDetails(subprocess) {
  return renderSubprocessOverviewColumns(getSubprocessSectionEntries(subprocess).map((entry) => entry.markup));
}

Object.assign(window, {
  getSubprocessSectionEntries,
  renderSubprocessOverviewColumns,
  renderSubprocessSummary,
  renderSubprocessDetails,
});
