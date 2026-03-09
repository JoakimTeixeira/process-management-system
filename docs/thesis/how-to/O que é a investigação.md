## Page 1

10/5/08

# Introdução
## O que é a investigação
&lt;img&gt;IST Logo&lt;/img&gt;
INSTITUTO SUPERIOR TÉCNICO

# Investigação

*   O conhecimento científico e tecnológico é um dos principais pilares das dinâmicas de desenvolvimento económico, social e cultural das sociedades
*   A aplicação prática do trabalho de I&D constitui um dos impulsionadores do crescimento
*   As ideias do investigador são relevantes quando partilhadas com a comunidade
*   I&D é uma actividade desafiante e propícia a espíritos de rebeldia intelectual

&lt;page_number&gt;1&lt;/page_number&gt;

---


## Page 2

10/5/08

# Resultados da Investigação

*   Contribuição para a resolução de um problema numa área do conhecimento científico
*   Disponibilizar os dados necessários para que os resultados possam ser replicados por outros investigadores
*   Divulgação à comunidade científica pelos canais próprios
*   Contribuições para trabalho futuro

# Metodologias de investigação: Teórica

*   Desenvolver uma teoria para explicar um conceito
    *   Propor hipóteses e testar alternativas
    *   Recolher dados que confirmam ou refutem a hipótese formulada
*   Algoritmos para processar/resolver um problema do mundo real
*   Avaliação por meio de métodos formais/matemáticos
*   “Learn from Writing”
    *   Ler trabalho relacionado de forma selectiva e com espírito crítico
    *   Recurso a aplicações informáticas para suporte à formulação de hipóteses

&lt;page_number&gt;2&lt;/page_number&gt;

---


## Page 3

10/5/08

# Metodologias de investigação:
## Experimental

*   Desenvolver e testar uma solução com base num teorema/hipótese
*   Avaliação dos resultados através de um demonstrador
*   Com base no resultados dos testes introduz melhoramentos sucessivos ao demonstrador
*   “Learn from Doing”
    *   Ler trabalho relacionado de forma selectiva e com espírito critico
    *   Recurso a aplicações informáticas para testar as hipóteses

# Metodologias de investigação:
## Aplicada

*   Baseada em caso de estudo derivados de problemas concretos (Empresa, Administração Publica, Ensino, Projecto I&D, Software Piloto, etc.)
*   Desenvolver, implementar e testar uma solução protótipo, com um âmbito bem definido
*   Avaliação dos resultados através de cenários e dados reais
*   “Learn from Doing”
    *   Ler trabalho relacionado de forma selectiva e com espírito critico
    *   Desenvolvimento de uma solução para a resolução de um problema

&lt;page_number&gt;3&lt;/page_number&gt;

---


## Page 4

10/5/08

# Investigação & Método Cientifico

*   **Método Científico:** processo em etapas para obter, do modo mais rigoroso e inequívoco possível, conhecimento científico.
*   **Etapas típicas:**
    1.  Observação
    2.  Formulação de Hipótese
    3.  Experimentação
    4.  Interpretação dos Resultados
    5.  Conclusão

# Etapas de uma metodologia de investigação

<mermaid>
graph TD
    subgraph Knowledge Flows
        A[Awareness of Problem]
        B[Suggestion]
        C[Development]
        D[Evaluation]
        E[Conclusion]
        F[* Operation and Goal Knowledge]
    end

    subgraph Process Steps
        G[Proposal]
        H[Tentative Design]
        I[Artifact]
        J[Performance Measures]
        K[Results]
    end

    subgraph Outputs
        L[ ]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    G --> H
    H --> I
    I --> J
    J --> K

    F --> A
    F --> G
    F --> K

    style A fill:#fff,stroke:#333,stroke-width:2px
    style B fill:#fff,stroke:#333,stroke-width:2px
    style C fill:#fff,stroke:#333,stroke-width:2px
    style D fill:#fff,stroke:#333,stroke-width:2px
    style E fill:#fff,stroke:#333,stroke-width:2px
    style F fill:#fff,stroke:#333,stroke-width:2px
    style G fill:#fff,stroke:#333,stroke-width:2px
    style H fill:#fff,stroke:#333,stroke-width:2px
    style I fill:#fff,stroke:#333,stroke-width:2px
    style J fill:#fff,stroke:#333,stroke-width:2px
    style K fill:#fff,stroke:#333,stroke-width:2px
    style L fill:#fff,stroke:#333,stroke-width:2px
</mermaid>

fonte: Design Science Research Methods and Patterns, Vijay K. Vaishnavi, William, CRC Press, 2007.

&lt;page_number&gt;4&lt;/page_number&gt;

---


## Page 5

10/5/08

# Modelos de validação da investigação

<table>
  <thead>
    <tr>
      <th>Método</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Project monitoring</td>
      <td>Observação: recolha dos dados gerados durante a execução do projecto; pouca intervenção nos resultados</td>
    </tr>
    <tr>
      <td>Case study</td>
      <td>observação: recolha de dados de um ou vários projectos análise comparativa (Baseline); focado num conjunto de objectivos específicos</td>
    </tr>
    <tr>
      <td>Assertion</td>
      <td>observação: realização de testes preliminares antes de uma validação mais formal; experimentação é pouco válida pois depende da tecnologia utilizada</td>
    </tr>
    <tr>
      <td>Field study</td>
      <td>observação: variante mais simples do Case Study; análise de uma situação ou produto bem definido</td>
    </tr>
    <tr>
      <td>Literature search</td>
      <td>Histórico: confirmar a validade de uma hipótese ou validar os resultados obtidos com dados publicados em trabalho relacionado</td>
    </tr>
    <tr>
      <td>Legacy (opensource)</td>
      <td>Histórico: utilização e consulta dos artefactos e documentação de projectos anteriores como base de referência para novos projectos; se esse material não está disponível então estamos perante o método Lessons Learned</td>
    </tr>
  </tbody>
</table>

# Modelos de validação da investigação

<table>
  <thead>
    <tr>
      <th>Método</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lessons learned</td>
      <td>Histórico: publicação das ilações retiradas de um projecto que terminou; a análise destas publicações permite retirar aspectos qualitativos para trabalhos futuros.</td>
    </tr>
    <tr>
      <td>Static analysis</td>
      <td>Histórico: foco está na análise das características do produto da investigação; comparação dos resultados face à complexidade do trabalho realizado</td>
    </tr>
    <tr>
      <td>Replicated experiments</td>
      <td>Controlado: Identificação e descrição das variáveis e do contexto de modo a permitir a replicação dos resultados por investigadores; custo envolvido pode ser elevado (quando simplificado tornar-se numa variante do Case Study)</td>
    </tr>
    <tr>
      <td>Synthetic experiments</td>
      <td>Controlado: criar uma experimentação num contexto mais restrito face ao âmbito de um projecto; estudo de um aspecto específico/actividade do projecto; equipas pequenas</td>
    </tr>
    <tr>
      <td>Dynamic analysis</td>
      <td>Controlado: teste às funcionalidades de um sistema/produto; geração de scripts e utilização de benchmarking para execução de testes futuros; problemas de generalização dos resultados para outros domínios ou conjunto de dados</td>
    </tr>
    <tr>
      <td>Simulation</td>
      <td>Contolado: teste da realidade via ambientes virtualizados; simular o comportamento do mundo real com recurso a algoritmos; definição das condições/variáveis do ambiente</td>
    </tr>
  </tbody>
</table>

&lt;page_number&gt;5&lt;/page_number&gt;

---


## Page 6

10/5/08

# Investigação:
## Por onde começar (1/3)

*   Motivação para a investigação
    *   MsC
    *   PhD
    *   Pós-Doutoramento
    *   Carreira de investigador
    *   Progressão na carreira profissional
    *   Investimento na valorização pessoal

&lt;img&gt;A poster with a man carrying books and a mug on his head, with text "This man does research for YOU!" and "JOIN GRADSCHOOL" below.&lt;/img&gt;

# Investigação:
## Por onde começar (2/3)

*   Ler
    *   Actividade fundamental na vida de um investigador
    *   Fontes: livros, artigos em revistas científicas (*journals*), *proceedings* das conferências, resumos publicações, site dos investigadores/grupos I&D
*   Postura pro-activa
    *   Recolher junto das pessoas informação sobre a actividade de I&D que exercem
    *   Resumo da área de interesse
    *   Reflectir no CV o trabalho de I&D
*   Preparação prévia
    *   Participar em grupos de discussão
    *   Gabinetes de aconselhamento
    *   Contactar docentes, falar com os colegas (MSc e PhD)

&lt;img&gt;A dark room with a neon sign that reads "SOMETIMES I THINK SOMETIMES I DON'T".&lt;/img&gt;

&lt;page_number&gt;6&lt;/page_number&gt;

---


## Page 7

10/5/08

# Investigação:
## Por onde começar (3/3)

*   Disciplinas complementares
*   Criar um registo desde o inicio
    *   Actividade investigação (livros, artigos, anotações, rabiscos, esquemas /desenhos, sites, contactos, emails, ...)
    *   Conjunto de ideias e contribuições externas
    *   Escrever resumos com regularidade
    *   Reservar um dia/semana para rever e actualizar o registo
*   Definir objectivos
    *   Um passo de cada vez (estratégia: Divide-and-Conquer)
    *   Manter o foco
    *   Dedicação e persistência

&lt;img&gt;A person with a large head and a computer keyboard, connected to an IV bag.&lt;/img&gt;

# Comunidade Cientifica (1/3)

*   Rede de contactos
    *   Orientador
    *   Grupos de Investigação
    *   Investigador Sénior de mérito reconhecido (Leão)
*   Tipos Publicações
    *   Poster
    *   Relatórios Técnicos (projectos I&D)
    *   Workshops
    *   Conferencias
    *   Journals
    *   Livro (ou capitulo de um livro)

&lt;page_number&gt;7&lt;/page_number&gt;

---


## Page 8

10/5/08

# Comunidade Cientifica (2/3)

*   **Artigos (Paper)**
    *   ☐ Permitir ao leitor avaliar o trabalho de I&D
    *   ☐ Descrever a apresentar os factos
    *   ☐ Destacar objectivamente quais são as contribuições
    *   ☐ Clareza na forma como os resultados foram obtidos
*   **Relevância das Publicações (proceedings)**
    *   ☐ Workshops: rede de investigadores com interesses comuns numa área /tema especifico
    *   ☐ Conferencias: trabalho de síntese, linguagem simples, short paper (6 pag) ou long paper (12 pag.)
    *   ☐ Journals: rigor, relevante, linguagem técnica, long paper (12-20 pag)
    *   ☐ Livro (e.g., Tema da Tese)

# Comunidade Cientifica (3/3)

*   **Atitude do investigador perante a investigação**
    *   ☐ Dedicação de muitas horas a um tema muito especifico
    *   ☐ Constante leitura de trabalho relacionado
    *   ☐ Rede de contactos muito activa
    *   ☐ Participação regular em eventos científicos
*   **Capacidade de análise critica de forma construtiva**
    *   ☐ Contribuir para solução
    *   ☐ Promover a investigação
    *   ☐ Ajudar jovens investigadores a conquistarem a sua reputação de Leão

&lt;page_number&gt;8&lt;/page_number&gt;

---


## Page 9

10/5/08

# Avaliação da investigação

*   Reconhecimento científico
    *   N° de publicações
    *   Organização de eventos científicos
    *   Participação em comissões e Júris
*   Participação em projectos de I&D
*   Transferência de conhecimento
*   Benefícios para o ensino
    *   N° de jovens investigadores (MSc e PhD)
    *   Programas curriculares

# Investimento na investigação científica em Portugal

&lt;img&gt;
A bar chart titled "Investimento na investigação científica em Portugal" showing the percentage of total general government expenditure on scientific research across various countries.

The y-axis represents "% of total general government expenditure", ranging from 0.00 to 3.50.
The x-axis lists countries with their corresponding values:
IS: 3.00
FI: 2.02
FR: 1.92
ES: 1.73
NL: 1.70
UK: 1.70
DE: 1.63
PT: 1.51
SE: 1.49
NO: 1.44
IT: 1.43
BE: 1.22
DK: 1.22
AT: 1.13
IE: 0.97
EL: 0.59
LU: 0.46

Source: Eurostat.
&lt;/img&gt;

(1) Exceptions to the reference year 2002
IT, UK, IS and NO: 2001;
ES: 2000.
(2) EL, FR, IE, IT, AT, FI and SE: provisional data.

Source: Eurostat.

&lt;page_number&gt;9&lt;/page_number&gt;

---


## Page 10

10/5/08

# I&D análise comparativa

*   Proporção de investigadores em relação à população (fonte: EuroStat)
    *   EUA - quinze em cada mil
        *   20% dos investigadores exercem funções na universidade
        *   80% estão ligados ao sector industrial
    *   Europa - dez em cada mil
        *   50% dos investigadores exercem funções na universidade
        *   50% estão ligados ao sector industrial
    *   Portugal – três em cada mil
        *   90% dos investigadores exercem funções na universidade
        *   10% estão ligados ao sector industrial

# Como Redigir trabalhos de investigação?

## Tema da próxima Sessão

JORGE CHAM © 2005

&lt;img&gt;A comic strip titled "Tema da próxima Sessão" by Jorge Cham, copyright 2005. The comic shows a graph titled "Desk Entropy" on the y-axis and "PhD Year" on the x-axis, with "year one", "year two", "year three", and "PhD Year" labeled along the x-axis. The graph starts low, rises slightly over year one, then rises sharply over years two and three, and finally spikes dramatically during the PhD year, with a "help!" note. The comic depicts a person's desk becoming increasingly cluttered and disorganized as time progresses.&lt;/img&gt;

Units: Junk-height/Area
www.phdcomics.com

&lt;page_number&gt;10&lt;/page_number&gt;