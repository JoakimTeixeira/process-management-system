## Page 1

10/5/08

&lt;img&gt;Stylized blue and white squares graphic&lt;/img&gt;

# Como apresentar os Resultados

&lt;img&gt;IST logo with "INSTITUTO SUPERIOR TÉCNICO" text&lt;/img&gt;

---

# Envisioning information

*   Comunicação eficiente de ideias (quantitativas) complexas!
*   Os gráficos e as tabelas permitem raciocínio sobre os dados.
*   Gráficos e tabelas suportam a inferência de conclusões.
*   Livros de Edward R. Tufte
*   Autoridade na área

&lt;img&gt;Book cover titled "Envisioning Information" by Edward R. Tufte, showing various data visualizations including t-shirt color distribution, map of New York City, stick figures, small multiples, and line graphs.&lt;/img&gt;

&lt;page_number&gt;1&lt;/page_number&gt;

---


## Page 2

10/5/08

# Como apresentar os resultados

*   Introdução.
*   Apresentar resultados sob a forma de gráficos.
*   Apresentar resultados sob a forma de tabelas.
*   Utilização prática de algumas ferramentas.
*   Preparar apresentações orais.

# Apresentação em gráficos e tabelas

<mermaid>
graph TD
    A[Apresentar Dados] --> B[Apresentação em tabelas]
    A --> C[Descrever sistemas, processos, ...]

    subgraph Gráficos
        D[Gráficos]
        E[Gráficos de linhas]
        F[Gráfico Barras]
        G[...]
    end

    B --> D
    D --> E
    D --> F
    D --> G
</mermaid>

&lt;page_number&gt;2&lt;/page_number&gt;

---


## Page 3

10/5/08

# Apresentação de resultados

*   Apresentar de forma simples e exacta.
*   Focar na coerência dos dados.
*   Suportar a dissertação e motivar o leitor.

*   Principais propósitos objectivos:
    *   Descrever resultados.
    *   Permitir exploração e inferência de conclusões.
    *   Tabular e documentar.
    *   Comparar diferentes alternativas.

# Tabelas vs. gráficos

*   Apresentação em tabelas.
    *   Melhor alternativa para documentar resultados.
    *   Maior grau de detalhe. (para poucos valores)
    *   Difícil visualizar padrões e tendências.
*   Apresentação em gráficos.
    *   Melhor para transmitir uma mensagem.
    *   Mais difícil visualizar valores específicos.

&lt;page_number&gt;3&lt;/page_number&gt;

---


## Page 4

10/5/08

Parte 2

# APRESENTAÇÃO DE DADOS SOB A FORMA DE GRÁFICOS

## Tipos de Gráficos

*   **Linhas:** tendências ao longo do tempo.
*   **Circulares:** partes de um todo.
*   **Barras:** distribuição de percentagens.
*   **Barras agrupadas:** comparar items.
*   **Scatter plot:** relações entre duas variáveis.
*   **Box plot:** distribuições de probabilidade.
*   **Mapas e Diagramas:** relações complexas.

&lt;page_number&gt;4&lt;/page_number&gt;

---


## Page 5

10/5/08

# Utilização de gráficos circulares

*   Fatias num gráfico circular representam “partes” do todo
    *   ☐ Fatias devem ser percentagens
*   Evitar demasiadas “partes”
*   Regras de bom desenho:
    *   ☐ Fácil diferenciar as partes
    *   ☐ Tamanho decresce clockwise
    *   ☐ Legendas nas fatias

Fonte de origem para o exemplo : www.gamespot.com/

&lt;img&gt;Pie chart showing sales of GTA IV on Xbox 360 (65%) and PS3 (35%). Legend: GTA IV on Xbox 360, GTA IV on PS3.&lt;/img&gt;

# Utilização de gráficos de barras

*   Barras empilhadas para mostrar partes de um todo
*   Barrar agrupadas para possibilitar comparações
*   Escala numérica para facilitar leitura dos valores
*   No caso de barras agrupadas:
    *   ☐ Atributos de menor variação devem ser mostrados primeiro
    *   ☐ Ordem dos atributos na legenda deve seguir ordem das barras

Fonte de origem para o exemplo : www.mathleague.com/help/data/data.htm

Figure 1 : Fruit sales in first two days

&lt;img&gt;Bar chart comparing fruit sales (in kilograms) for two days (Day 1 and Day 2). The x-axis ranges from 0 to 60 kg. The y-axis lists fruits: Papaya, Star fruit, Mangos, Oranges, Apples. For each fruit, there are two bars representing the two days. The legend indicates blue for Day 1 and red for Day 2.&lt;/img&gt;

&lt;page_number&gt;5&lt;/page_number&gt;

---


## Page 6

10/5/08

# Utilização de gráficos de linhas

*   Mostram variações e tendências em dados contínuos.
*   Se os dados não são contínuos:
    *   Gráficos de barras, ...
*   Tempo representa-se no eixo X
*   Pontos individuais nas linhas
    *   Valores precisos
    *   Resultados das medições

&lt;img&gt;A line graph showing Inflation Rate (%) on the y-axis (0 to 6) and years on the x-axis (1984 to 2002). The graph shows fluctuations with peaks around 1990 (~5.5%) and troughs around 1986 (~2%) and 2002 (~1.5%). A label below the graph reads "Figure 1 : Inflation rate in the U.S.".&lt;/img&gt;

Fonte de origem para o exemplo : www.mathleague.com/help/data/data.htm

# Utilização de scatter plots

*   Relações entre duas variáveis
*   Usar escala logaritmica...
    *   Apenas se fizer sentido...
*   Usar linhas de regressão.
    *   Tendências nos dados

&lt;img&gt;A scatter plot showing Waiting Time Between Eruptions (Min) on the y-axis (45 to 90) and Eruption Duration (Min) on the x-axis (1.5 to 5.0). Points are scattered, but a trend line suggests a positive correlation. A label below the plot reads "Figure 1 : Registered Volcanic Eruptions".&lt;/img&gt;

Fonte de origem para o exemplo : www.mathleague.com/help/data/data.htm

&lt;page_number&gt;6&lt;/page_number&gt;

---


## Page 7

10/5/08

# Diagramas e mapas

*   Seguir a “cultura” da área (e.g., Unified Modeling Language).
*   Incluir apenas informação relevante.
*   Atenção à consistência dos elementos e organização.

<mermaid>
graph TD
    A[Diagram] --> B[Structure Diagram]
    A --> C[Behaviour Diagram]

    B --> D[Class Diagram]
    B --> E[Component Diagram]
    B --> F[Object Diagram]

    C --> G[Activity Diagram]
    C --> H[Use Case Diagram]
    C --> I[State Machine Diagram]

    G --> J[Interaction Diagram]
    J --> K[Sequence Diagram]
    J --> L[Interaction Overview Diagram]

    L --> M[Communication Diagram]
    L --> N[Timing Diagram]

    F --> O[Composite Structure Diagram]
    F --> P[Deployment Diagram]
    F --> Q[Package Diagram]
</mermaid>

Figure 1 : Hierarchy of UML diagrams

Fonte de origem para o exemplo : http://en.wikipedia.org/wiki/Unified_Modeling_Language

# Gráficos eficazes

*   Evitar excesso de informação (*keep it simple!*).
*   Coerência e sobriedade nas fontes e cores.
*   Manter as escalas honestas.
*   Título deve transmitir o essencial da mensagem.
*   Dados suficientes para que mensagem seja clara.
*   Identificar a origem dos dados.
*   Colocar dados de suporte num apêndice.

&lt;page_number&gt;7&lt;/page_number&gt;

---


## Page 8

10/5/08

# Como mentir com gráficos

*   Alterar/distorcer os eixos ou a origem.
*   Distorcer as formas ou as diferenças.
    *   Usando as cores, linhas diferenciadas ou outras técnicas.
*   Usar efeitos 3D que introduzam distorções.

*   Deve-se minimizar o “factor do mentiroso”:

F = Tamanho do efeito aparente no gráfico
Tamanho do efeito nos dados

---

# Elementos gráficos desnecessários

&lt;img&gt;No symbol&lt;/img&gt; Má apresentação

Salário mínimo

&lt;img&gt;One dollar bill&lt;/img&gt; 1950: $1.00
&lt;img&gt;One dollar bill&lt;/img&gt; 1960: $1.65
&lt;img&gt;One dollar bill&lt;/img&gt; 1970: $3.20
&lt;img&gt;One dollar bill&lt;/img&gt; 1980: $3.90

☑ Boa apresentação

Salário mínimo

&lt;img&gt;Line graph showing Salário mínimo (Minimum Wage) over time.&lt;/img&gt;
Milhares de dólares
0 2 4
1950 1960 1970 1980

&lt;page_number&gt;8&lt;/page_number&gt;

---


## Page 9

10/5/08

# Origem do(s) eixo(s)

&lt;img&gt;No symbol&lt;/img&gt; Má apresentação

Despezas mensais
Milhares de euros
45
42
39
36
J F M A M J

&lt;img&gt;Check mark symbol&lt;/img&gt; Boa apresentação

Despezas mensais
Milhares de euros
60
40
20
0
J F M A M J

# Comprimir o eixo vertical

&lt;img&gt;No symbol&lt;/img&gt; Má apresentação

Receitas semestrais
Milhares de euros
200
100
0
S1 S2 S3 S4

&lt;img&gt;Check mark symbol&lt;/img&gt; Boa apresentação

Receitas semestrais
Milhares de euros
50
25
0
S1 S2 S3 S4

&lt;page_number&gt;9&lt;/page_number&gt;

---


## Page 10

10/5/08

# Apresentação de valores absolutos

&lt;img&gt;No symbol&lt;/img&gt; Má apresentação

&lt;img&gt;Checkmark symbol&lt;/img&gt; Boa apresentação

Alunos aprovados

<table>
  <thead>
    <tr>
      <th></th>
      <th>300</th>
      <th>200</th>
      <th>100</th>
      <th>0</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>IN</td>
      <td>300</td>
      <td>200</td>
      <td>100</td>
      <td>0</td>
    </tr>
    <tr>
      <td>FI</td>
      <td>200</td>
      <td>100</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>BI</td>
      <td>100</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <td>ME</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>

Alunos aprovados

<table>
  <thead>
    <tr>
      <th></th>
      <th>30%</th>
      <th>20%</th>
      <th>10%</th>
      <th>0%</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>IN</td>
      <td>30%</td>
      <td>20%</td>
      <td>10%</td>
      <td>0%</td>
    </tr>
    <tr>
      <td>FI</td>
      <td>20%</td>
      <td>10%</td>
      <td>0%</td>
      <td>0%</td>
    </tr>
    <tr>
      <td>BI</td>
      <td>10%</td>
      <td>0%</td>
      <td>0%</td>
      <td>0%</td>
    </tr>
    <tr>
      <td>ME</td>
      <td>0%</td>
      <td>0%</td>
      <td>0%</td>
      <td>0%</td>
    </tr>
  </tbody>
</table>

IN = Informática, FI = Física, BI = Biologia, ME = Mecânica

Parte 3

# APRESENTAÇÃO DE DADOS SOB A FORMA DE TABELAS

&lt;page_number&gt;10&lt;/page_number&gt;

---


## Page 11

10/5/08

# Tabelas eficazes

*   Usar hierarquia nas tabelas.
*   Justificar valores numéricos à esquerda.
*   Identificar claramente as linhas e colunas:
    *   Evitar abreviaturas, usar nomes completos.
*   Mostrar sumário com os valores totais.
*   Identificar claramente a origem dos dados.

# Apresentação em tabelas

&lt;img&gt;No symbol&lt;/img&gt; Má apresentação ☑ Boa apresentação

<table>
  <thead>
    <tr>
      <th>STATISTICS</th>
      <th>SMALL</th>
      <th>LARGE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Characters</td>
      <td>18,621</td>
      <td>1,231,109</td>
    </tr>
    <tr>
      <td>Words</td>
      <td>2,060</td>
      <td>173,145</td>
    </tr>
    <tr>
      <td>After stopping</td>
      <td>1,200</td>
      <td>98,234</td>
    </tr>
    <tr>
      <td>Index size</td>
      <td>1,31 Kb</td>
      <td>109,0 Kb</td>
    </tr>
  </tbody>
</table>

Table 1: Collections used in experiments

<table>
  <thead>
    <tr>
      <th colspan="2">Collection</th>
    </tr>
    <tr>
      <th></th>
      <th>Small</th>
      <th>Large</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Size (Kb)</td>
      <td>18,621</td>
      <td>1,231,109</td>
    </tr>
    <tr>
      <td>Index size (Kb)</td>
      <td>1,31</td>
      <td>109,0</td>
    </tr>
    <tr>
      <td>Number of words</td>
      <td>2,060</td>
      <td>173,145</td>
    </tr>
    <tr>
      <td>After stopping</td>
      <td>1,200</td>
      <td>98,234</td>
    </tr>
  </tbody>
</table>

Table 1: Collections used in experiments

Fonte de origem para o exemplo : Writing for Computer Science, Justin Zobel

&lt;page_number&gt;11&lt;/page_number&gt;

---


## Page 12

10/5/08

# Como mentir com tabelas

*   Percentagens vs. valores absolutos.
*   Consistência nas unidades de representação.
*   Cuidado com arredondamentos.
*   Usar número de casas decimais consistente.

Parte 4
# FERRAMENTAS

&lt;page_number&gt;12&lt;/page_number&gt;

---


## Page 13

10/5/08

# Ferramentas

*   Dia (Diagram Editor)
*   GNU plot
*   R project for statistics
*   Microsoft Excel
*   ...
*   Tabelas no LaTeX ou no Microsoft Word

&lt;img&gt;Book cover titled "Using R for Introductory Statistics" by John Verzani, published by Chapman & Hall/CRC.&lt;/img&gt;

# Vários tutoriais disponíveis

# Plot data stored in file “dados.txt”
reset
set nokey
set grid
set title "Valores em (x,y)"
plot 'dados.txt' using 4:5 t 'Valores em x e y' with points 3 3

y <- read.csv("dados.txt")
plot (y)
plot (y, type="l", main="Valores em (x,y)")
# barplot(y, main="Barplot", names.arg=c("a","b","c","d","e"))
# pie(y, main="Pie-chart", labels=c("a","b","c","d","e"))
# boxplot(y, main="Boxplot")

Script para o GNU Plot

Script para o R-project

&lt;page_number&gt;13&lt;/page_number&gt;

---


## Page 14

10/5/08

# Exemplo com o R-project

```r
x1 <- c(4, 3, 4, 3, 4, 5, 4, 5, 6, 5, 5, 6, 7, 6, 7, 8)
x2 <- c(8, 7, 8, 7, 8, 7, 6, 5, 5, 6, 5, 4, 4, 5, 4, 3)
x3 <- c(1, 2, 1, 2, 1, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4)
x4 <- c(1, 2, 3, 4, 8, 7, 8, 9, 7, 6, 5, 4, 3, 3, 2, 1)
df <- data.frame(x1, x2, x3, x4)

par(mfrow=c(2, 2))

pie(mean(df), main="Pie-chart")
barplot(mean(df), main="Barplot")
boxplot(df, main="Boxplots")
matplot(df, type="l", main="Line diagram")

par(mfrow=c(1, 1))
```

Fonte de origem para o exemplo : http://www.rensenieuwenhuis.nl/archive/r-sessions-14-multiple-graphs/

&lt;img&gt;Pie-chart with labels x1, x2, x3, x4&lt;/img&gt;
&lt;img&gt;Barplot with labels x1, x2, x3, x4&lt;/img&gt;
&lt;img&gt;Boxplots with labels x1, x2, x3, x4&lt;/img&gt;
&lt;img&gt;Line diagram with labels temp, 2, 4, 6, 8, 10, 15&lt;/img&gt;

Parte 5
# APRESENTAÇÕES ORAIS

&lt;page_number&gt;14&lt;/page_number&gt;

---


## Page 15

10/5/08

# Apresentações orais

*   **Objectivo:** Convencer audiência do mérito do trabalho.
*   **Preparação é muito importante:**
    *   ☐ Qual a audiência da apresentação?
    *   ☐ Quais os aspectos principais a reter?
    *   ☐ Quanto tempo disponível para a apresentação?
    *   ☐ Quais as condições disponíveis?
    *   ☐ Ensaia, obter feedback, melhorar!

# Apresentações orais

*   **Simples, claras e focadas na audiência.**
    *   ☐ Evitar linguagem complexa e demasiados detalhes.
*   **Organizar a apresentação:**
    *   ☐ Dicas introduzidas para a escrita da dissertação.
        *   Apresentar o que se vai dizer.
        *   Dizer.
        *   Resumir o que foi dito.
    *   ☐ Slides para guiar a audiência ao longo da apresentação.
*   **Antecipar possíveis questões.**

&lt;page_number&gt;15&lt;/page_number&gt;

---


## Page 16

10/5/08

# Preparação de slides

*   Suportam a apresentação.
*   Foco de atenção para a audiência, mas...
    *   Evitar uso de frases longas.
    *   Devem acompanhar a sequência da apresentação.
    *   Slides devem ser auto-contidos.
*   Legibilidade, simplicidade, relevância.
    *   Evitar demasiadas cores, animações, fontes, ...

# Reservar tempo para re-desenhar...

&lt;img&gt;A comic strip with four panels:
Panel 1 (ONE WEEK BEFORE DEADLINE): A man asks another "Did you take a look at the draft I sent?" The other man responds "What draft?"
Panel 2 (THREE DAYS BEFORE DEADLINE): The first man says "I haven't read it in detail, but it looked ok to me."
Panel 3 (THE DAY BEFORE DEADLINE): The first man says "Sorry, we're out of town."
Panel 4 (30 SECONDS BEFORE DEADLINE): The first man is seen quickly writing on a piece of paper, which has "Needs work - Smith" written on it.&lt;/img&gt;
<footer>WWW.PHDCOMICS.COM</footer>

&lt;page_number&gt;16&lt;/page_number&gt;