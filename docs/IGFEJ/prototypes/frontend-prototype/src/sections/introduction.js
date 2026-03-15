const INTRO_BENEFITS = [
  ["zap", "Identificar oportunidades de automação", "Permite encontrar tarefas repetitivas e passíveis de automação, libertando tempo e recursos para atividades mais estratégicas."],
  ["shield", "Garantir a conformidade e segurança", "Ajuda a assegurar que os processos estão alinhados com regulamentos, padrões de segurança e políticas internas."],
  ["trending-up", "Melhorar a eficiência operacional", "Ao identificar e corrigir ineficiências, a organização pode reduzir custos, tempo e recursos despendidos."],
  ["users", "Aumentar a produtividade", "A otimização dos processos promove equipas mais produtivas e reduz problemas recorrentes."],
  ["refresh-cw", "Adaptar-se a mudanças", "Permite ajustar os processos às mudanças tecnológicas, de negócio e das necessidades da organização."],
];

const INTRO_CONTACTS = [
  ["mail", "Email", "apoio@igfej.justica.gov.pt"],
  ["phone", "Telefone", "(+351) 302 000 000"],
  ["clock", "Horário de Atendimento", "Dias úteis das 8h00 às 20h00 e sábados das 8h00 às 16h00"],
];

function renderBenefit([icon, title, text], fullWidth = false) {
  const widthClass = fullWidth ? "md:col-span-2" : "";
  return `
    <div class="bg-white border border-govpt-border rounded-lg p-6 hover:shadow-md transition-shadow ${widthClass}">
      <div class="flex items-start gap-4">
        <div class="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-govpt-primary/10">
          <i data-feather="${icon}" class="h-6 w-6 text-govpt-primary"></i>
        </div>
        <div class="flex-1">
          <h3 class="mb-3 text-govpt-xl font-semibold text-govpt-heading">${title}</h3>
          <p class="text-govpt-base leading-relaxed text-govpt-text">${text}</p>
        </div>
      </div>
    </div>
  `;
}

function renderContact([icon, label, value]) {
  return `
    <div class="flex items-center space-x-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"><i data-feather="${icon}" class="h-5 w-5 text-govpt-primary"></i></div>
      <div><p class="text-govpt-base font-medium text-govpt-heading">${label}</p><p class="text-govpt-sm text-govpt-text">${value}</p></div>
    </div>
  `;
}

function getIntroductionSection() {
  return `
    <section id="introduction" class="content-section hidden">
      <div class="max-w-govpt-container mx-auto px-4 py-8">
        <div class="space-y-8">
          <div id="introduction-overview" class="mb-8">
            <h1 class="mb-4 text-govpt-4xl font-bold text-govpt-heading">Introdução</h1>
            <p class="max-w-3xl text-govpt-lg leading-relaxed text-govpt-gray">Saiba mais sobre a importância da análise de processos e metodologias utilizadas para otimizar as operações da IGFEJ.</p>
          </div>
          <div class="rounded-lg border border-govpt-border bg-white p-6">
            <div class="flex flex-col items-center gap-8 lg:flex-row">
              <div class="flex-shrink-0"><img src="assets/images/cover.png" alt="IGFEJ - Sistema de Gestão de Processos" class="h-auto w-48 rounded-lg shadow-md" /></div>
              <div class="flex-1 text-center lg:text-left">
                <h2 class="mb-4 text-govpt-2xl font-semibold text-govpt-heading">Por que analisar processos de negócio e TI?</h2>
                <p class="mb-4 text-govpt-base leading-relaxed text-govpt-text">Analisar processos de Negócio e/ou Tecnologia da Informação é fundamental para entender, otimizar e aprimorar a eficiência, segurança e desempenho das operações e sistemas dentro de uma organização.</p>
                <p class="text-govpt-base leading-relaxed text-govpt-text">Essa análise permite identificar falhas, riscos de segurança, ineficiências e oportunidades de melhoria tanto no negócio quanto nas TI.</p>
              </div>
            </div>
          </div>
          <div class="space-y-8">
            <div class="text-center">
              <h2 class="mb-2 text-govpt-3xl font-bold text-govpt-heading">Benefícios da Análise de Processos</h2>
              <p class="mx-auto max-w-2xl text-govpt-lg text-govpt-gray">Descubra como a análise sistemática de processos pode transformar a eficiência e segurança da sua organização.</p>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              ${INTRO_BENEFITS.slice(0, 4).map((item) => renderBenefit(item)).join("")}
              ${renderBenefit(INTRO_BENEFITS[4], true)}
            </div>
          </div>
          <div class="rounded-lg border-2 border-govpt-primary bg-white p-6">
            <h2 class="mb-4 text-govpt-2xl font-semibold text-govpt-heading">Resumo</h2>
            <p class="text-govpt-base leading-relaxed text-govpt-text">A análise de processos de negócio/TI é essencial para garantir que a infraestrutura de TI de uma organização opere de maneira eficaz, segura e eficiente, apoiando as operações e metas empresariais.</p>
          </div>
          <div class="rounded-lg bg-white p-6">
            <h2 class="mb-4 text-govpt-2xl font-semibold text-govpt-heading">Destinatários</h2>
            <p class="text-govpt-base leading-relaxed text-govpt-text"><span class="font-semibold text-govpt-heading">Público-alvo:</span> Gestores de Negócio, de IT e Diretores de médio e alto nível dentro da organização.</p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-8">
            <div class="text-center">
              <h2 class="mb-4 text-govpt-3xl font-bold text-govpt-heading">Pronto para começar?</h2>
              <p class="mb-6 text-govpt-lg text-govpt-gray">Explore o sistema de gestão de processos do IGFEJ</p>
              <div class="flex flex-col justify-center gap-4 sm:flex-row">
                <button type="button" onclick="navigateToSection('dashboard')" class="inline-flex items-center justify-center rounded-lg bg-govpt-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-govpt-secondary"><i data-feather="arrow-right" class="mr-2 h-5 w-5"></i>Aceder Dashboard</button>
                <button type="button" onclick="navigateToSection('methodology')" class="inline-flex items-center justify-center rounded-lg border-2 border-govpt-primary px-6 py-3 font-semibold text-govpt-primary transition-colors hover:bg-govpt-primary hover:text-white"><i data-feather="book-open" class="mr-2 h-5 w-5"></i>Conhecer Metodologia</button>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div id="introduction-contact" class="rounded-lg border border-gray-200 bg-white p-6">
              <h2 class="mb-4 text-govpt-xl font-semibold text-govpt-heading">Sobre o Projeto</h2>
              <div class="space-y-4">
                <div><h3 class="mb-2 text-govpt-lg font-semibold text-govpt-heading">Autores</h3><p class="text-govpt-base text-govpt-text">Departamento de Serviços de Suporte Tecnológico (DSST)</p></div>
                <div>
                  <h3 class="mb-2 text-govpt-lg font-semibold text-govpt-heading">Licença</h3>
                  <div class="rounded-lg bg-gray-50 p-4">
                    <p class="mb-3 text-govpt-base text-govpt-text">Este trabalho é propriedade do <strong>IGFEJ</strong> e está protegido sob o licenciamento Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.</p>
                    <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center font-medium text-govpt-primary transition-colors hover:text-govpt-secondary"><i data-feather="external-link" class="mr-2 h-4 w-4"></i>Ver Licença Completa</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-6">
              <h2 class="mb-4 text-govpt-xl font-semibold text-govpt-heading">Contacto</h2>
              <div class="space-y-3">${INTRO_CONTACTS.map(renderContact).join("")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

window.getIntroductionSection = getIntroductionSection;
