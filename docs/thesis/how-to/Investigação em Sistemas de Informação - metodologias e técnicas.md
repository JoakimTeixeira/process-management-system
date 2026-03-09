## Page 1

UNIVERSIDADE DE TRÁS-OS-MONTES E ALTO DOURO

Investigação em Sistemas de Informação Organizacionais – Teses e dissertações em Portugal

DISSERTAÇÃO DE MESTRADO EM
Informática

RICARDO MANUEL MARQUES GRILLO

&lt;img&gt;Coat of Arms with "SCIENTIA ET LABORE OMNIA ADIPISCITUR" motto&lt;/img&gt;

Vila Real, 2008

---


## Page 2

Investigação em Sistemas de Informação Organizacionais – Teses e dissertações em Portugal

Dissertação de Mestrado apresentada por Ricardo Manuel Marques Grilo

Sob orientação do Doutor João Eduardo Quintela Alves de Sousa Varajão e co-orientação do Doutor António Manuel de Jesus Pereira

Universidade de Trás-os-Montes e Alto Douro

&lt;img&gt;Coat of Arms with "SCIENTIA ET LABORE OMNIA ADIPISCIT"&lt;/img&gt;

Departamento de Engenharias

2008

---


## Page 3

Às minhas meninas pela minha presença ausente.

Aos meus pais pelo apoio que sempre deram.

Ao orientador João Varajão pela ajuda e alento demonstrado ao longo do projecto.

---


## Page 4

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 5

Se o intelecto contribui para a felicidade não o faz como fonte primária, mas sim como meio de coordenação, como instrumento harmonizador dos desejos. Neste sentido o intelecto pode ser um precioso auxiliar; e de contrário de nada valeria realizarmos todos os nossos fins, porque os desejos cancelar-se-iam uns aos outros, dando como resultado uma triste futilidade.

Will Durant, in "Filosofia da Vida"

---


## Page 6

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 7

&lt;page_number&gt;V&lt;/page_number&gt;

# AGRADECIMENTOS

A dissertação apresentada é o resultado de um desafio lançado pelo Professor Doutor João Varajão que assume a pasta de orientador e que desde o início presta um enorme apoio, ilumina o caminho a seguir e eleva os níveis de motivação. Os meus mais sinceros agradecimentos!

Ao fim de cada dia de trabalho, sempre intenso e surpreendente, os fracos pensamentos de desistência, mas por vezes atractivos, perderam a batalha face às palavras de motivação e apoio que chegaram. É aos colegas dos Serviços de Informática do Instituto Politécnico de Leiria que tenho de dizer Obrigado.

Os Serviços de Documentação do Instituto Politécnico de Leiria foram uma peça essencial no desenvolvimento deste trabalho, não só pelo auxílio no empréstimo de obras, mas também pelo apoio logístico e moral dado. Obrigado pela vossa ajuda.

A força de vontade, a persistência e a ambição são características de personalidade que ainda hoje os meus pais me transmitem. O apoio prestado, em todas as vertentes possíveis, está acima de qualquer agradecimento declarado. Só o meu amor por eles alguma vez os poderá compensar.

As pessoas mais importantes e mais próximas são as que mais sofrem em momentos de ausência. O desenvolvimento do projecto obrigou em muitos momentos a um desligar do ambiente que rodeia, com principal prejuízo no familiar. Impossível de compensar momentos perdidos com a esposa Liliana e com a filha Laura, só posso esperar que os valores que me foram transmitidos o sejam também para a Laura e que o empenho e tempo dedicado a este trabalho demonstrem capacidade de fazer igual para fins familiares.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 8

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 9

&lt;page_number&gt;VII&lt;/page_number&gt;

# RESUMO

Os investigadores quando abraçam um projecto seleccionam uma forma para conduzir e estruturar a investigação relativa ao projecto. A selecção, que pode ser influenciada pela comunidade científica em que estão inseridos, pelos objectivos do projecto ou outros factores que incidam sobre o trabalho, deve ser cuidada e efectuada após o conhecimento prévio das alternativas existentes.

Ao tentar identificar as alternativas ao seu alcance, o investigador vai tentar compreender as várias ferramentas e pontos de vista possíveis de adoptar para o desenvolvimento do seu projecto. Não poucas vezes essas alternativas são confusas e contraditórias.

Perante este cenário, é importante a existência de uma ferramenta que apresente a principal informação de forma organizada. Assim, o investigador de Sistemas de Informação terá então ao seu dispor para consulta, o leque de opções mais comuns e mais indicadas para desenvolver o seu trabalho assim como para caracterizar os estudos realizados.

Nesta dissertação são estudados os diferentes instrumentos de investigação utilizados em Sistemas de Informação Organizacionais e, recorrendo à análise de dissertações e teses, é caracterizada a realidade da investigação nessa área, em Portugal.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 10

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 11

&lt;page_number&gt;IX&lt;/page_number&gt;

# ABSTRACT

When researchers embrace a new project, they select a path and a structure to follow so as to do their research. This selection may be influenced by their scientific community, by project goals or by other relevant factors which affect their work, and should be carefully done after acknowledging all the available options.

When trying to identify the possible choices, the researcher will consider several tools and possible perspectives they can use to carry out their project. At this moment they will note that most of the information is confusing and contradictory.

Bearing this scenario in mind, it is important to find a new tool that presents the main information and its characterization. So, an Information Systems researcher can access the common choices and eventually the best one to embed in his project. This tool may also help him in assessing the choices made by other researchers.

The goal is to study the different research tools used in Organizational Information Systems’ projects and basing on the results of dissertations and theses review, build a research characterization in that specific area in Portugal.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 12

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 13

&lt;page_number&gt;XI&lt;/page_number&gt;

# ÍNDICE GERAL

AGRADECIMENTOS.................................................................................................................. V
RESUMO................................................................................................................................. VII
ABSTRACT............................................................................................................................. IX
ÍNDICE GERAL........................................................................................................................ XI
ÍNDICE DE TABELAS............................................................................................................ XV
ÍNDICE DE FIGURAS............................................................................................................ XVII
SIGLAS E ACRÓNIMOS........................................................................................................... XIX
1. INTRODUÇÃO....................................................................................................................... 1
    1.1. IDENTIFICAÇÃO DO PROBLEMA............................................................................... 1
    1.2. MOTIVAÇÕES E OBJECTIVOS................................................................................... 2
    1.3. PROPOSTA DE TRABALHO E ABORDAGEM DE INVESTIGAÇÃO.............................. 3
    1.4. ORGANIZAÇÃO DA DISSERTAÇÃO............................................................................ 5
2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO............................ 7
    2.1. ELEMENTOS DE INVESTIGAÇÃO NOS ESTUDOS DE SISTEMAS DE INFORMAÇÃO........ 7
    2.2. INSTRUMENTOS DE INVESTIGAÇÃO........................................................................ 12
    2.3. ABORDAGENS........................................................................................................... 16
        2.3.1. INVESTIGAÇÃO QUALITATIVA.......................................................................... 17
        2.3.2. INVESTIGAÇÃO QUANTITATIVA........................................................................ 19
        2.3.3. TRIANGULAÇÃO............................................................................................... 19
        2.3.4. ABORDAGEM QUALITATIVA E ABORDAGEM QUANTITATIVA - COMPARAÇÃO.. 20
    2.4. EPISTEMOLOGIAS..................................................................................................... 23
        2.4.1. POSITIVIST ..................................................................................................... 25
        2.4.2. INTERPRETATIVE............................................................................................ 27
        2.4.3. CRITICAL SCIENCE......................................................................................... 28
    2.5. METODOLOGIAS DE INVESTIGAÇÃO........................................................................ 31
        2.5.1. ACTION RESEARCH ......................................................................................... 34
        2.5.2. CASE STUDY..................................................................................................... 38
        2.5.3. ETHNOGRAPHY............................................................................................... 42
        2.5.4. DESIGN RESEARCH.......................................................................................... 44

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 14

&lt;page_number&gt;XII&lt;/page_number&gt;

<table>
  <tr>
    <td>2.5.5.</td>
    <td>GROUNDED THEORY</td>
    <td>48</td>
  </tr>
  <tr>
    <td>2.5.6.</td>
    <td>GROUP FEEDBACK</td>
    <td>51</td>
  </tr>
  <tr>
    <td>2.5.7.</td>
    <td>EXPERIMENTS</td>
    <td>54</td>
  </tr>
  <tr>
    <td>2.5.8.</td>
    <td>PHILOSOPHICAL RESEARCH</td>
    <td>57</td>
  </tr>
  <tr>
    <td>2.5.9.</td>
    <td>SURVEY</td>
    <td>59</td>
  </tr>
  <tr>
    <td>2.5.10.</td>
    <td>ARCHIVAL RESEARCH</td>
    <td>61</td>
  </tr>
  <tr>
    <td>2.5.11.</td>
    <td>FIELD STUDY</td>
    <td>64</td>
  </tr>
  <tr>
    <td>2.5.12.</td>
    <td>OPINION RESEARCH</td>
    <td>67</td>
  </tr>
  <tr>
    <td>2.5.13.</td>
    <td>NUMERIC METHODS</td>
    <td>69</td>
  </tr>
  <tr>
    <td>2.5.14.</td>
    <td>FORMAL METHODS</td>
    <td>73</td>
  </tr>
  <tr>
    <td>2.6.</td>
    <td>TÉCNICAS DE INVESTIGAÇÃO</td>
    <td>75</td>
  </tr>
  <tr>
    <td>2.6.1.</td>
    <td>DELPHI</td>
    <td>77</td>
  </tr>
  <tr>
    <td>2.6.2.</td>
    <td>OBSERVATION</td>
    <td>79</td>
  </tr>
  <tr>
    <td>2.6.3.</td>
    <td>INTERVIEW</td>
    <td>82</td>
  </tr>
  <tr>
    <td>2.6.4.</td>
    <td>FOCUS GROUP</td>
    <td>85</td>
  </tr>
  <tr>
    <td>2.6.5.</td>
    <td>SURVEY</td>
    <td>87</td>
  </tr>
  <tr>
    <td>2.6.6.</td>
    <td>TRANSCRIPT ANALYSIS</td>
    <td>89</td>
  </tr>
  <tr>
    <td>2.6.7.</td>
    <td>MEASUREMENT</td>
    <td>92</td>
  </tr>
  <tr>
    <td>2.6.8.</td>
    <td>ARCHIVAL RESEARCH</td>
    <td>94</td>
  </tr>
  <tr>
    <td>2.7.</td>
    <td>TÉCNICAS DE ANÁLISE</td>
    <td>96</td>
  </tr>
  <tr>
    <td>2.8.</td>
    <td>CLASSIFICAÇÃO DE METODOLOGIAS E TÉCNICAS QUANTO À ABORDAGEM</td>
    <td>98</td>
  </tr>
  <tr>
    <td>2.9.</td>
    <td>ENQUADRAMENTO CONCEPTUAL DOS INSTRUMENTOS PARA INVESTIGAÇÃO</td>
    <td>101</td>
  </tr>
  <tr>
    <td>3.</td>
    <td>INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO ORGANIZACIONAIS NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS</td>
    <td>103</td>
  </tr>
  <tr>
    <td>3.1.</td>
    <td>RECOLHA DE DADOS</td>
    <td>104</td>
  </tr>
  <tr>
    <td>3.1.1.</td>
    <td>IDENTIFICAÇÃO DOS ESTUDOS RELEVANTES</td>
    <td>105</td>
  </tr>
  <tr>
    <td>3.1.2.</td>
    <td>ANÁLISE DOS ESTUDOS RELEVANTES</td>
    <td>112</td>
  </tr>
  <tr>
    <td>3.2.</td>
    <td>ANÁLISE DE DADOS E DISCUSSÃO DE RESULTADOS</td>
    <td>118</td>
  </tr>
  <tr>
    <td>4.</td>
    <td>CONSIDERAÇÕES FINAIS</td>
    <td>135</td>
  </tr>
  <tr>
    <td>4.1.</td>
    <td>SÍNTESE DO TRABALHO</td>
    <td>135</td>
  </tr>
  <tr>
    <td>4.2.</td>
    <td>PRINCIPAIS CONTRIBUTOS</td>
    <td>137</td>
  </tr>
  <tr>
    <td>4.3.</td>
    <td>TRABALHO FUTURO</td>
    <td>139</td>
  </tr>
  <tr>
    <td>4.4.</td>
    <td>CONCLUSÕES</td>
    <td>140</td>
  </tr>
  <tr>
    <td>BIBLIOGRAFIA</td>
    <td></td>
    <td>143</td>
  </tr>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 15

XIII

ANEXOS .................................................................................................................. 149
ANEXO I - DISSERTAÇÕES E TESES IDENTIFICADAS EM SISTEMAS DE INFORMAÇÃO ORGANIZACIONAIS ............................................................ 149
ANEXO II - ESTUDOS VISADOS NAS DESLOCAÇÕES ÀS BIBLIOTECAS ........................................................................................................... 161
ANEXO III - ANÁLISE DOS ESTUDOS REPETIDOS ................................................................................................................................. 167
ANEXO IV - ESTUDOS NÃO ANALISADOS................................................................................................................................. 169

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 16

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 17

&lt;page_number&gt;XV&lt;/page_number&gt;

# ÍNDICE DE TABELAS

Tabela 1 - Tarefas identificadas para desenvolvimento da dissertação ..... 4
Tabela 2 - Os elementos de investigação em camadas ..... 9
Tabela 3 - Áreas da camada Classificação ..... 10
Tabela 4 - Áreas da camada Condução ..... 10
Tabela 5 - Classificação através de abordagem e de epistemologia ..... 11
Tabela 6 - As vertentes da Investigação ..... 12
Tabela 7 - Termos paralelos nas abordagens, adaptado de (Lincoln and Guba 1985; Ford 1997) ..... 20
Tabela 8 - Procedimentos distintos entre abordagens, adaptado de (Ford 1997) ..... 22
Tabela 9 - Contraste de axiomas nas abordagens, adaptado de (Spradley 1979) ..... 22
Tabela 10 - Etapas em Design Research ..... 47
Tabela 11 - Recursos em Archival Research ..... 62
Tabela 12 - Níveis de aplicação de Formal Methods ..... 74
Tabela 13 - Exemplos de codificação em Transcript Analysis ..... 91
Tabela 14 - Meios de registo de informação ..... 95
Tabela 15 - Classificação de metodologias relativamente à abordagem ..... 99
Tabela 16 - Classificação de técnicas relativamente à abordagem ..... 99
Tabela 17 - Universidades públicas contempladas no estudo ..... 107
Tabela 18 - Catálogos bibliográficos utilizados para pesquisa ..... 108
Tabela 19 - Possíveis estudos de Sistemas de Informação ..... 110
Tabela 20 - Principais tarefas na análise de um estudo ..... 115
Tabela 21 - Estudos de Sistemas de Informação Organizacionais por anos, em cada universidade ..... 123
Tabela 22 - Estudos identificados em cada metodologia ..... 124
Tabela 23 - Estudos identificados em cada técnica ..... 126
Tabela 24 - Índice percentual de técnicas aplicadas em metodologias adoptadas em mais de dez estudos ..... 129
Tabela 25 - Índice percentual de técnicas aplicadas em metodologias adoptadas em menos de dez estudos ..... 129
Tabela 26 - Resumo de estudos quanto à abordagem e epistemologia ..... 130
Tabela 27 - Estudos identificados por tipo de fenómeno ..... 132
Tabela 28 - Índice percentual de metodologias aplicadas por tipo de fenómeno ..... 134
Tabela 29 - Registo das 107 dissertações e teses identificadas em Sistemas de Informação Organizacionais ..... 161
Tabela 30 - Registo dos 44 estudos visados nas deslocações às bibliotecas ..... 166
Tabela 31 - Identificação da localização de análise dos estudos repetidos ..... 169
Tabela 32 - Registo dos nove estudos não abrangidos pelas deslocações às bibliotecas ..... 170

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 18

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 19

&lt;page_number&gt;XVII&lt;/page_number&gt;

# ÍNDICE DE FIGURAS

*   Ilustração 1 - Vertentes da Epistemologia &lt;page_number&gt;14&lt;/page_number&gt;
*   Ilustração 2 - Elementos de investigação em Sistemas de Informação &lt;page_number&gt;16&lt;/page_number&gt;
*   Ilustração 3 - Suposição epistemológica da investigação quantitativa &lt;page_number&gt;23&lt;/page_number&gt;
*   Ilustração 4 - Suposição epistemológica da investigação qualitativa &lt;page_number&gt;24&lt;/page_number&gt;
*   Ilustração 5 - Suposições epistemológicas da investigação &lt;page_number&gt;24&lt;/page_number&gt;
*   Ilustração 6 - Escolhas básicas no percurso de investigação &lt;page_number&gt;33&lt;/page_number&gt;
*   Ilustração 7 - Etapas em Action Research &lt;page_number&gt;38&lt;/page_number&gt;
*   Ilustração 8 - Etapas em Case Study &lt;page_number&gt;42&lt;/page_number&gt;
*   Ilustração 9 - Etapas na estrutura dedutiva de investigação Field Study &lt;page_number&gt;65&lt;/page_number&gt;
*   Ilustração 10 - Etapas na estrutura indutiva de investigação Field Study &lt;page_number&gt;65&lt;/page_number&gt;
*   Ilustração 11 - Enquadramento de técnica na investigação &lt;page_number&gt;76&lt;/page_number&gt;
*   Ilustração 12 - Etapas na aplicação de DELPHI &lt;page_number&gt;77&lt;/page_number&gt;
*   Ilustração 13 - Sugestões na aplicação de DELPHI &lt;page_number&gt;78&lt;/page_number&gt;
*   Ilustração 14 - Classificações de técnicas de Observation &lt;page_number&gt;79&lt;/page_number&gt;
*   Ilustração 15 - Circunscrição da aplicação de Observation &lt;page_number&gt;80&lt;/page_number&gt;
*   Ilustração 16 - Fases na aplicação de Observation &lt;page_number&gt;82&lt;/page_number&gt;
*   Ilustração 17 - Etapas na aplicação de Interview &lt;page_number&gt;84&lt;/page_number&gt;
*   Ilustração 18 - Etapas na aplicação de Focus Group &lt;page_number&gt;86&lt;/page_number&gt;
*   Ilustração 19 - Princípios básicos na definição de Survey &lt;page_number&gt;87&lt;/page_number&gt;
*   Ilustração 20 - Checklist na aplicação de Survey &lt;page_number&gt;88&lt;/page_number&gt;
*   Ilustração 21 - Requisitos para a aplicação de Transcript Analysis &lt;page_number&gt;90&lt;/page_number&gt;
*   Ilustração 22 - Processo de Transcript Analysis &lt;page_number&gt;91&lt;/page_number&gt;
*   Ilustração 23 - Níveis de medição de variáveis em Measurement &lt;page_number&gt;92&lt;/page_number&gt;
*   Ilustração 24 - Etapas na aplicação de Archival Research &lt;page_number&gt;95&lt;/page_number&gt;
*   Ilustração 25 - Enquadramento da análise de dados no processo de investigação, adaptado de (Johnson and Onwuegbuzie 2004) &lt;page_number&gt;97&lt;/page_number&gt;
*   Ilustração 26 - Etapas até a criação de resultados &lt;page_number&gt;97&lt;/page_number&gt;
*   Ilustração 27 - Diagrama de classificação de metodologias e técnicas &lt;page_number&gt;100&lt;/page_number&gt;
*   Ilustração 28 - Enquadramento conceptual dos instrumentos para investigação em Sistemas de Informação &lt;page_number&gt;101&lt;/page_number&gt;
*   Ilustração 29 - Taxa de crescimento média anual de investigação em Portugal &lt;page_number&gt;104&lt;/page_number&gt;
*   Ilustração 30 - Rede pública universitária de Portugal &lt;page_number&gt;106&lt;/page_number&gt;
*   Ilustração 31 - Estrutura da informação armazenada relativa a estudos de Sistemas de Informação &lt;page_number&gt;111&lt;/page_number&gt;
*   Ilustração 32 - Impressão digital dos resultados de pesquisa bibliográfica &lt;page_number&gt;111&lt;/page_number&gt;
*   Ilustração 33 - Disponibilidade dos estudos na Internet &lt;page_number&gt;113&lt;/page_number&gt;
*   Ilustração 34 - Estudos acessíveis na Internet, por universidade &lt;page_number&gt;113&lt;/page_number&gt;
*   Ilustração 35 - Índice percentual de estudos analisados &lt;page_number&gt;117&lt;/page_number&gt;

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 20

&lt;page_number&gt;XVIII&lt;/page_number&gt;

Ilustração 36 - Estudos analisados versus estudos não analisados ..... 118
Ilustração 37 - Estudos identificados de Sistemas de Informação ..... 119
Ilustração 38 - Conjuntos de estudos definidos ao longo do projecto ..... 119
Ilustração 39 - Estudos identificados de Sistemas de Informação, sem registos repetidos ..... 120
Ilustração 40 - Distribuição de estudos de Sistemas de Informação, por anos ..... 120
Ilustração 41 - Estudos de Sistemas de Informação, dos quais em Sistemas de Informação Organizacionais, por universidade ..... 121
Ilustração 42 - Estudos identificados de Sistemas de Informação Organizacionais ..... 121
Ilustração 43 - Distribuição de estudos de Sistemas de Informação Organizacionais, por anos ..... 122
Ilustração 44 - Conjuntos de universidades identificados ao longo do estudo ..... 122
Ilustração 45 - Evolução dos estudos de Sistemas de Informação Organizacionais, por universidade ..... 123
Ilustração 46 - Índice percentual de universidades analisadas ..... 124
Ilustração 47 - Estrutura típica da investigação ..... 124
Ilustração 48 - Metodologias na investigação de Sistemas de Informação Organizacionais em Portugal ..... 125
Ilustração 49 - Índice percentual de metodologias na investigação de Sistemas de Informação Organizacionais em Portugal ..... 125
Ilustração 50 - Técnicas na investigação de Sistemas de Informação Organizacionais em Portugal ..... 126
Ilustração 51 - Índice percentual de técnicas na investigação de Sistemas de Informação Organizacionais em Portugal ..... 126
Ilustração 52 - Número de técnicas aplicadas num estudo de Sistemas de Informação Organizacionais ..... 127
Ilustração 53 - Índice percentual do número de técnicas aplicadas num estudo de Sistemas de Informação Organizacionais ..... 127
Ilustração 54 - Relação entre metodologias e técnicas em estudos de Sistemas de Informação Organizacionais ..... 128
Ilustração 55 - Índice percentual da abordagem em estudos de Sistemas de Informação Organizacionais ..... 130
Ilustração 56 - Índice percentual da epistemologia em estudos de Sistemas de Informação Organizacionais ..... 131
Ilustração 57 - Índice percentual de estudos que referem os instrumentos de investigação aplicados em estudos de Sistemas de Informação Organizacionais ..... 131
Ilustração 58 - Estudos de Sistemas de Informação Organizacionais que referem os instrumentos de investigação aplicados, por universidade ..... 132
Ilustração 59 - Índice percentual de estudos de Sistemas de Informação Organizacionais, por tipo de fenómeno ..... 133
Ilustração 60 - Relação entre tipos de fenómeno e metodologias aplicadas em estudos de Sistemas de Informação Organizacionais ..... 133
Ilustração 61 - Metodologia e técnica mais aplicada nos estudos de Sistemas de Informação Organizacionais em Portugal ..... 137

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 21

&lt;page_number&gt;XIX&lt;/page_number&gt;

# SIGLAS E ACRÓNIMOS

Ao longo da dissertação são apresentadas referências a abreviaturas de designações, que embora comuns nas áreas de Investigação e de Sistemas de Informação, é possível um melhor esclarecimento do discurso com a consulta das siglas e acrónimos aqui listados:

<table>
  <tr>
    <td>SI</td>
    <td>→ Sistemas de Informação</td>
  </tr>
  <tr>
    <td>SIO</td>
    <td>→ Sistemas de Informação Organizacionais</td>
  </tr>
  <tr>
    <td>AIS</td>
    <td>→ Association for Information Systems</td>
  </tr>
  <tr>
    <td>TI</td>
    <td>→ Tecnologias de Informação</td>
  </tr>
  <tr>
    <td>EIB</td>
    <td>→ Empréstimo Inter Bibliotecas</td>
  </tr>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 22

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 23

&lt;page_number&gt;1&lt;/page_number&gt;

1. INTRODUÇÃO

# 1. INTRODUÇÃO

A investigação em Sistemas de Informação (SI) é um elemento essencial para o desenvolvimento da Sociedade da Informação e nos últimos anos tem registado uma evolução considerável no que concerne à natureza dos estudos realizados, criando uma maior diversidade de estudos, relativamente à abordagem, métodos e técnicas de investigação utilizadas.

Ao abraçar um novo projecto, de acordo com a comunidade científica em que estão inseridos, objectivos do projecto e/ou outros factores que incidem sobre o trabalho, os investigadores seleccionam instrumentos para a condução e estruturação da investigação. Optam por uma abordagem e por um suporte metodológico, que os encaminham para as técnicas mais populares ou mais eficazes que permitam obter os resultados pretendidos. Sobre estes últimos é desenvolvida uma interpretação. Este conjunto de selecções nem sempre é feito de forma consciente, principalmente se o investigador estiver pouco familiarizado com o processo de investigação. Ao pesquisar informação que o ajude a definir o caminho a percorrer, depara-se com uma grande diversidade de informação não estruturada e com falta de consenso sobre conceitos e significados de abordagens, epistemologias, metodologias e técnicas de investigação.

## 1.1.IDENTIFICAÇÃO DO PROBLEMA

Ao iniciar o desenvolvimento de um projecto, muitos investigadores são confrontados com dúvidas na selecção da forma mais adequada para obter os resultados que perseguem. Nesse momento, os investigadores procuram compreender os vários processos de investigação disponíveis e para tal pesquisam informação em diversas fontes, com diferentes organizações, diferentes níveis de detalhe, diferentes autores, tornando-se fácil o investigador ficar confuso sobre a matéria.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 24

&lt;page_number&gt;2&lt;/page_number&gt;

1. INTRODUÇÃO

Numa aparente falta de consenso, onde cada autor se refere de forma diferente ao mesmo objecto ou elemento da investigação (abordagens, epistemologias, metodologias e técnicas), quem procura familiarizar-se com a área depara-se com sérias dificuldades.

O problema toma maior envergadura quando se opta por pesquisar em diversas fontes. O incremento da diversidade de repositórios de informação também aumenta a diversidade de termos usados, onde se encontram facilmente contradições na aplicação de termos. A juntar a estas situações, vem a necessidade de traduzir a informação encontrada (tipicamente em Inglês) para Português.

O investigador de SI vê-se rodeado de termos que identificam epistemologias, metodologias ou outros elementos de investigação, mas continua com a dúvida de saber quais as vantagens e desvantagens na selecção de uma ferramenta específica.

Torna-se fundamental a existência de ferramentas que apresentem ao investigador de língua Portuguesa de SI, informação sobre investigação de forma clara e objectiva. Essas ferramentas, possuindo a caracterização de cada elemento, devem permitir ao investigador compreender cada alternativa e tomar as decisões de forma sábia e consciente.

1.2.MOTIVAÇÕES E OBJECTIVOS

Com este projecto procura-se contribuir para uma clarificação dos instrumentos disponíveis para a investigação em SI, de modo a quando um investigador pretender iniciar um projecto possa dispor de um referencial que o auxilie a perceber de forma clara e em Português, os conceitos, termos e significados utilizados na investigação.

Será sobre a área de Sistemas de Informação Organizacionais (SIO) que o trabalho incidirá, relativamente às epistemologias, metodologias e técnicas referidas, assim como a análise de trabalhos de investigação realizados em Portugal (reflectida na produção de teses e dissertações).

Neste cenário, torna-se objectivo deste projecto de investigação, analisar e caracterizar os diferentes instrumentos de investigação utilizados em SIO e caracterizar a realidade da investigação na área em Portugal. Para tal, serão identificados e analisados os trabalhos realizados nos últimos anos e posteriormente classificados de acordo com os instrumentos de

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 25

&lt;page_number&gt;3&lt;/page_number&gt;

1. INTRODUÇÃO

investigação identificados. Procurar-se-á caracterizar a investigação desenvolvida em Portugal no período de 2004 a 2007, relativamente abordagens, metodologias, técnicas e epistemologias adoptadas.

**1.3.PROPOSTA DE TRABALHO E ABORDAGEM DE INVESTIGAÇÃO**

Um dos objectivos do projecto, caracterizar a investigação em SI em Portugal, determina que é necessário classificar os estudos realizados, relativamente aos instrumentos de investigação utilizados. A classificação pretendida deve ser realizada com recurso a ferramentas que auxiliem a identificação dos instrumentos de investigação adoptados. Por sua vez, a definição das ferramentas desejadas exige a identificação e compreensão dos diferentes conceitos associados à investigação em SI.

Assim, numa fase inicial, há como principal objectivo identificar e explicitar os vários conceitos existentes relacionados com investigação. Pretende-se apresentar a fronteira entre as diferentes abordagens, investigação qualitativa e quantitativa, as diferentes epistemologias, investigação positivista, interpretativa e de ciência crítica. Neste ponto, serão definidos os conceitos relacionados com metodologias, métodos, técnicas e instrumentos. Serão ainda apresentadas as metodologias e técnicas mais comuns e praticáveis para investigação na área.

Na parte final desta fase, pretende-se sistematizar as possíveis abordagens e epistemologias, as metodologias e técnicas com maior ênfase na investigação de SI. Este diagrama pode ser encarado como uma ferramenta de auxílio na identificação e classificação dos instrumentos de investigação, assim como na caracterização de estudos realizados.

Numa fase seguinte, tenciona-se identificar os estudos realizados (doutoramentos e mestrados) nos últimos quatro anos em Portugal, na área de SI. Realizada a identificação dos estudos, estes serão alvo de análise relativamente à abordagem, metodologia e técnicas seleccionadas para a investigação e relativamente à epistemologia usada na interpretação dos resultados de cada estudo.

A tabela 1 apresenta de forma resumida as tarefas identificadas e os resultados esperados para cada.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 26

&lt;page_number&gt;4&lt;/page_number&gt;

1. INTRODUÇÃO

<table>
  <thead>
    <tr>
      <th>TAREFA</th>
      <th>RESULTADO PRETENDIDO</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <ul>
          <li>Pesquisa de artigos sobre investigação em SIO:</li>
          <li>Revistas;</li>
          <li>Conferências;</li>
          <li>Organizações;</li>
          <li>Autores vários.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Ilustrar a falta de consenso existente;</li>
          <li>Identificar as fontes mais fidedignas que permitam recolher a informação mais consensual;</li>
          <li>Caracterizar os elementos da investigação;</li>
          <li>Criar diagrama esquemático dos instrumentos que suportam a investigação.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <ul>
          <li>Pesquisa de estudos nacionais:</li>
          <li>Pesquisa dos estudos realizados;</li>
          <li>Acesso e análise aos estudos identificados;</li>
          <li>Identificar estudos que resultaram em testes e dissertações realizados na área de SI entre 2004 e 2007;</li>
          <li>Caracterizar cada estudo relativamente aos instrumentos de investigação adoptados;</li>
          <li>Caracterizar a investigação em SIO, em Portugal, com base no resultado da análise realizada.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Caracterização da investigação em SIO em Portugal.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

Tabela 1 - Tarefas identificadas para desenvolvimento da dissertação

O desenvolvimento do projecto descrito seguirá a estrutura associada à metodologia Field Study, tendo início num levantamento e conhecimento teórico relativo aos instrumentos de investigação existentes e mais usados em SI. Segue-se uma componente mais prática, que incide sobre a análise de estudos identificados e posteriormente uma reflexão sobre os resultados obtidos, criando então uma caracterização da investigação em Portugal e sendo esta a teoria produzida pelo estudo.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 27

&lt;page_number&gt;5&lt;/page_number&gt;

1. INTRODUÇÃO

Para recolha de dados recorre-se à técnica de investigação Archival Research, que permite identificar e recolher a informação relativa aos conceitos e instrumentos relacionados com investigação, assim como também analisar as dissertações e teses identificadas.

De acordo com a classificação de Action Research e com o desenvolvimento do projecto, este trabalho enquadra-se numa abordagem qualitativa com uma epistemologia interpretativa.

1.4.ORGANIZAÇÃO DA DISSERTAÇÃO

A dissertação reflecte o trabalho realizado e as principais metas definidas para o projecto. O primeiro capítulo engloba e apresenta as primeiras tarefas realizadas, onde se procura enquadrar os objectivos propostos com a realidade existente e a identificação dos problemas relacionados com a identificação de instrumentos de investigação. Neste capítulo são apresentados os principais objectivos e a forma delineada para os atingir.

O segundo capítulo procura ilustrar as dificuldades que surgem quando se pretende compreender e conhecer os diferentes instrumentos de investigação existentes, mas principalmente procura apresentar os resultados da recolha de informação realizada e as ferramentas criadas durante esta fase e que aspiram auxiliar a identificação e classificação desses mesmos instrumentos.

O terceiro capítulo ilustra o trabalho de campo realizado, relativamente à análise de estudos identificados na área de SIO em Portugal e os resultados obtidos da análise realizada. E com estes apresenta a caracterização da investigação em SIO em Portugal.

O último capítulo, o quarto, permite expor as dificuldades, oportunidades e trabalho futuro identificado, relativamente ao que foi desenvolvido no âmbito do projecto.

De acordo com o referido, a execução do projecto pressupõe a realização de algumas tarefas, que constituem de uma forma global três actividades ou fases:

*   Caracterizar o estado da arte:
    *   Ilustrar a falta de consenso existente;
    *   Clarificar os vários conceitos existentes, procurando esclarecer dúvidas comuns.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 28

&lt;page_number&gt;6&lt;/page_number&gt;

1. INTRODUÇÃO

*   Identificar e descrever abordagens, epistemologias, metodologias e técnicas de investigação, com especial relevância para a área de SIO:
    *   Definir e caracterizar os instrumentos mais comuns para a investigação na área;
    *   Criar esquema ou diagrama que possa ser usado como ferramenta na caracterização da investigação de um trabalho.
*   Caracterizar a investigação em SIO em Portugal:
    *   Caracterizar os estudos realizados recorrendo ao diagrama criado;
    *   Identificar as metodologias e técnicas mais aplicadas nos estudos de SIO.

Ao longo da dissertação são apresentados estrangeirismos que correspondem aos nomes dos instrumentos de investigação de forma a evitar traduções “forçadas” que reduzam a clareza proposta para este estudo, sendo esta uma das razões para a confusão de informação encontrada.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 29

&lt;page_number&gt;7&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

# 2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Neste capítulo pretende-se inicialmente ilustrar as dificuldades associadas à compreensão de instrumentos de investigação em SI e o pouco consenso que se verifica na informação encontrada. Tentando ultrapassar este cenário, é objectivo apresentar e descrever de forma sucinta cada instrumento de investigação em SI identificado, assim como propor um modelo que sistematize e auxilie a compreensão desses instrumentos e do seu relacionamento.

## 2.1.ELEMENTOS DE INVESTIGAÇÃO NOS ESTUDOS DE SISTEMAS DE INFORMAÇÃO

Foi criada uma amostra, através da selecção aleatória de dez estudos científicos da área de SIO em Portugal, onde se verificou que a maioria dos estudos não menciona a(s) metodologia(s) e técnica(s) adoptadas para elaborar o estudo. Na amostragem analisada apenas quatro estudos indicam quais os instrumentos de investigação aplicados durante a realização do trabalho. Como iremos ver mais á frente nesta dissertação, a investigação efectuada no âmbito desta dissertação, permite verificar que em Portugal não é comum o investigador indicar no seu trabalho os instrumentos de investigação seleccionados.

Um estudo que não apresente os instrumentos de investigação adoptados pode eventualmente transparecer a ideia que o investigador não identificou previamente que tipo de estudo pretendia desenvolver. A selecção e identificação dos instrumentos de investigação a aplicar poderá ter sido feita, mas talvez de forma implícita, pelo investigador ou pelo orientador.

Nuns primieros momentos de foco sobre o projecto em mente, além da ideia global e generalizada dos objectivos a atingir, o investigador tenta identificar formas alternativas de chegar ao objectivo. Estas primeiras formas identificadas, que podem vir a corresponder ao percurso de investigação, representam instrumentos de investigação, onde se destacam as

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 30

&lt;page_number&gt;8&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

metodologias e técnicas. Nesta primeira fase o indivíduo identifica os instrumentos pela natureza do fenómeno a investigar ou pela natureza da comunidade de investigação em que está inserido. O tema de investigação escolhido também pode ser influenciado por um conjunto de factores que incluem, a relevância do tema na área científica em que está inserido o investigador naquele momento exacto, as preferências e interesses pessoais, as possibilidades de fácil ou boa orientação e boas acessibilidades a fontes de informação. O estudo que esta dissertação materializa, permitiu verificar que a relevância do tema no momento é patente entre 2004 e 2005, quando muitos dos estudos na área de SI se focam em sistemas de apoio à decisão, e entre 2005 e 2006 em sistemas de informação geográfica. Quando um projecto de investigação é lançado pelo orientador, importa muito o historial e experiência do indivíduo. É exemplo desta situação o projecto associado a esta dissertação.

Na fase inicial do projecto, é habitualmente criado um esboço do plano de trabalho, que é um elemento clarificador e organizador do estudo a desenvolver. Ao elaborar o plano, os “pensamentos nebulosos” são reflectidos e traduzem-se em informações como título, objectivos, fontes iniciais de informação entre muitas outras.

Nesta fase o investigador equaciona diferentes abordagens possíveis para enfrentar o problema colocado. Dependendo da abordagem identificada existem metodologias e técnicas mais adequadas ou requeridas para o processo de investigação.

Os investigadores que pretendam apresentar o caminho de investigação seleccionado nos seus estudos, não têm a vida facilitada. Até há pouco tempo não fazia parte do curriculum académico informação sobre metodologias, métodos e técnicas de investigação, sendo vulgar um investigador sentir a necessidade de obter mais informação sobre os elementos de investigação disponíveis.

Ao procurar informação sobre investigação, o investigador depara-se com diferentes perspectivas, interpretações e designações dos instrumentos. Por exemplo:

*   Egon C. Guba no livro “The Paradigm Dialog” refere-se a Paradigmas para identificar Postpositivism, Critical Theory e Constructivism.
    *   “Recentemente surgiram três novos conceitos adversários – postpositivism, critical theory e constructivism. Todos oferecem aos investigadores novas abordagens metodológicas e todos apresentam questões fundamentais que devem ser consideradas. Pode a investigação ser conduzida entre paradigmas”
        (Guba 1990).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 31

&lt;page_number&gt;9&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

* Steven Eric Krauss no artigo “Research Paradigms and Meaning Making: A Primer”, publicado no “The Qualitive Report” refere:
    * Investigação qualitativa e investigação quantitativa como epistemologias.
        * “Apesar de muitas diferenças propostas entre as epistemologias quantitativa e qualitativa...” (Krauss 2005).
        * “De acordo com a epistemologia qualitativa, este significado refere-se ao assunto...” (Krauss 2005).
    * Investigação positivista como epistemologia.
        * “De acordo com a epistemologia Positivism, a ciência é vista como uma maneira de chegar à verdade...” (Krauss 2005).
    * Investigação qualitativa e investigação quantitativa como paradigmas.
        * “…diferenças dos paradigmas de investigação quantitativa e qualitativa são primeiro fornecidas, seguidas de...” (Krauss 2005).

* Orlikowski, W.J. e Baroudi, J.J. no artigo “Studying Information Technology in Organizations: Research Approaches and Assumptions do jornal Information Systems Research” classificam a forma de interpretação dos resultados do estudo, como epistemologias;
    * “Nós seguimos Chua’s [1986] com classificação de investigação em epistemologias Positivism, Interpretative ou Critical Science.” (Baroudi and Orlikowski 1991).

Assim se evidencia a necessidade de iniciar a clarificação dos conceitos associados a investigação, tentando evitar a habitual lacuna de guia de raciocínio na documentação que se encontra relativa à área.

De forma muito genérica, os elementos de investigação podem ser divididos em duas camadas, como apresentado na tabela 2. A camada associada à classificação da investigação e a camada relacionada com a estrutura utilizada para realizar a investigação.

Classificação da investigação
Condução da investigação

Tabela 2 - Os elementos de investigação em camadas

A camada de cima, relacionada com a classificação, divide-se em duas áreas. Uma que classifica e está profundamente associada aos instrumentos usados durante a investigação, para a recolha de dados e sua análise. Outra área que classifica a investigação, de acordo com

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 32

&lt;page_number&gt;10&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

a interpretação que o investigador faz aos resultados obtidos pela investigação conduzida (ver tabela 3).

<table>
  <thead>
    <tr>
      <th>Classificação dos instrumentos</th>
      <th>Classificação da interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">Condução da investigação</td>
    </tr>
  </tbody>
</table>

Tabela 3 - Áreas da camada Classificação

A camada de baixo, referida à condução que se faz durante a investigação, divide-se em três áreas. A primeira identifica a forma (ou as formas), seleccionada para guiar o trabalho a realizar pelo investigador. Uma segunda área que contém a forma (ou as formas), apurada durante o estudo, para a recolha de dados que alimentará a investigação. Por fim uma terceira área, que indica qual ou quais as formas usadas para análise dos dados recolhidos pelos instrumentos da segunda área. A divisão referida é ilustrada na tabela 4.

<table>
  <thead>
    <tr>
      <th>Classificação dos instrumentos</th>
      <th>Classificação da interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Guia de trabalho</td>
      <td>Recolha de dados</td>
      <td>Análise dos dados</td>
    </tr>
  </tbody>
</table>

Tabela 4 - Áreas da camada Condução

Uma das causas para a falta de consenso que se verifica parece advir do facto da maioria de informação disponível sobre investigação existir em estudos ou organizações internacionais. Neste cenário o investigador que se quer instruir recolhe informação de várias fontes, alimentadas por diferentes autores, o que só por si apresenta diferentes interpretações dos elementos de investigação. Associada a esta situação há a necessidade de traduzir a informação encontrada. Ora, diferentes traduções, devido à possibilidade de diferentes significados, criam descrições e características distintas entre investigadores para os mesmos elementos de investigação.

A informação apresentada ao longo deste estudo assenta sobre dois critérios para identificar os termos a usar: O mais comummente usado nos estudos e documentação pesquisada e o apresentado na organização de referência da área de SI, a Association for Information Systems (AIS).

Relativamente à área Classificação dos instrumentos, representada na tabela 3, apesar de não haver consenso e muitos autores se referirem de diferentes maneiras, o termo mais usado neste contexto é abordagem (*approach*), como apresentado na tabela 5.

O termo abordagem representa o acto de abordar, aproximar, fazer um primeiro contacto ou fase de iniciação. É neste sentido que o termo é aplicado, referindo-se à forma como o

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 33

&lt;page_number&gt;11&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

investigador abordará a investigação, onde se inclui um conjunto de princípios e o guia condutor dos procedimentos gerais. A iniciação à investigação surge com a aplicação de instrumentos, identificados nos procedimentos a seguir, que permitirão recolher dados sujeitos a análise. Daí a estreita relação entre os instrumentos seleccionados e a abordagem da investigação.

A outra área da camada Classificação da investigação, a Classificação da interpretação, é habitualmente designada como Perspectiva. De acordo com a interpretação que se faz sobre os resultados obtidos da investigação, a perspectiva toma uma classificação. Perspectiva é um termo de significado amplo aplicável em todas as áreas, pretendendo ilustrar um ponto de vista, mas possui uma maior conotação com as áreas de matemática e gráfica. Muito comum neste contexto é aplicação de Epistemologia. Termo profundamente relacionado com investigação, não significasse ele teoria do conhecimento. No seu sentido estrito, epistemologia representa o estudo crítico dos princípios, hipóteses e resultados da ciência e procura determinar a origem lógica, o valor e objectivo do conhecimento criado. Assim e embora o termo perspectiva seja bastante mencionado, face aos distintos significados e ao facto da AIS se referir, por várias vezes, à interpretação dos resultados de investigação com esta locução, o termo usado neste estudo para a Classificação da interpretação é Epistemologia (ver tabela 5).

<table>
<thead>
<tr>
<th>Abordagem</th>
<th>Epistemologia</th>
</tr>
</thead>
<tbody>
<tr>
<td>Guia de trabalho</td>
<td>Recolha de dados</td>
<td>Análise dos dados</td>
</tr>
</tbody>
</table>

Tabela 5 - Classificação através de abordagem e de epistemologia

Sobre a segunda camada, aqui mencionada como Condução da investigação, é onde incide a maior parte das dificuldades de tradução. Na documentação existente surgem as palavras Teoria (*Theory*), Metodologia (*Methodology*), Método (*Method*), Técnica (*Technique*) e Instrumento (*Instrument*), para se referenciarem as áreas desta camada. Instrumento, que significa utensílio ou artefacto, pode ser usado para referir uma instância de qualquer um dos outros conceitos, metodologia ou método específico, por exemplo.

No âmbito da área Guia de trabalho, onde se identificam os procedimentos para a condução do processo investigatório, os termos vulgarmente usados nos documentos internacionais são Teoria e Metodologia. A AIS refere-se a instrumentos específicos de condução de investigação como metodologias. Neste estudo Metodologia é a palavra identificada como a mais adequada para ilustrar a área Guia de trabalho, pela razão que teoria em português representa um conhecimento já criado, puramente racional, especulativo e sistematizado. De acordo com

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 34

&lt;page_number&gt;12&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

estes significados, teoria enquadrar-se-ia melhor na parte final do projecto de investigação, identificando o raciocínio gerado com os resultados obtidos. Por outro lado, metodologia, que designa a lógica que estuda os métodos técnicos e científicos assim como a arte de dirigir o espírito na investigação da verdade, encaixa perfeitamente como termo a designar o percurso a realizar durante o trabalho de investigação.

Sobre a área Recolha de dados, é vulgar o investigador identificar a instância do instrumento como sendo um método. Na tradução de *method*, entende-se como sendo um processo racional que se segue para chegar a um fim, que acaba por representar um modo ordenado de proceder e que antecipadamente regulará a sequência de operações a realizar. Técnica, termo seleccionado neste estudo para representar a área de Recolha de dados, refere um conjunto de procedimentos metódicos que originam conjuntos de processos a realizar durante a investigação, logo um conjunto de conhecimentos de aplicação prática. É neste sentido, como se demonstrará ao longo desta dissertação, que técnica se aplica. Isto é, de uma forma prática e não de forma teórica.

Por fim, na terceira área, Análise de dados, apesar de serem identificáveis vários termos, o mais comum e o referido pela AIS neste âmbito é Técnica. À medida que o investigador se integra com conhecimentos de investigação, diferenciar entre técnica de recolha e técnica de análise torna-se intuitivo. O que acontece na maioria da literatura é que a técnica aparece como termo singular referindo-se a uma metodologia ou técnica, de acordo com o contexto. Neste estudo, técnica, como palavra única refere uma técnica de recolha e técnica de análise é a forma de mencionar uma forma de análise de dados.

Como resultado desta interpretação, investigação é apresentada sobre cinco vertentes: Abordagem, Epistemologia, Metodologia, Técnica e Técnica de análise (ver tabela 6).

<table>
  <tr>
    <td>Abordagem</td>
    <td>Epistemologia</td>
  </tr>
  <tr>
    <td>Metodologia</td>
    <td>Técnica</td>
    <td>Técnica de análise</td>
  </tr>
</table>

Tabela 6 - As vertentes da Investigação

2.2.INSTRUMENTOS DE INVESTIGAÇÃO

As vertentes identificadas apresentam-se como resultado da evolução dos fundamentos de investigação. É na filosofia, conhecida como a mãe de todas as ciências, que assentam os

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 35

&lt;page_number&gt;13&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

pilares da estrutura associada à condução da investigação e interpretação dos resultados.
Apesar de nos dias de hoje filosofia ser considerada uma disciplina, ela contempla investigação, análise, discussão, formação e reflexão de ideias ou raciocínios.

A origem da filosofia parte da inquietação gerada pela curiosidade humana em compreender e questionar valores ou interpretações anteriormente aceites pela sociedade. São esses valores e interpretações que formam o conhecimento existente. A inquietação leva à observação de fenómenos naturais e a persistência sobre este ponto, leva o homem a definir instrumentos e procedimentos de observação e de documentação dos valores obtidos. É a partir desta forma de filosofia que nasce a ciência, que principalmente através de experiências sobre a sua própria realidade, o homem reorganiza as suas inquietações ou dúvidas.

Sobre os fenómenos observados, o filósofo organiza padrões de pensamentos que formulam diversas teorias, que resultam em valores e interpretações aceites, ou seja em conhecimento. Esta forma de filosofar toma a designação de filosofia de conhecimento. Para compreender melhor como se processa e que resultados produz, surge a disciplina que estuda a ciência, a epistemologia.

A produção de conhecimento através da investigação pode ser definida como uma actividade que contribui para a compreensão de um fenómeno (Lakatos 1978). Corresponde a um conjunto de actividades que a comunidade onde se insere o projecto ou investigador considera apropriadas. Este conjunto é constituído por metodologias e técnicas que assentam em pressupostos empiristas ou analíticos e que permitem recolher e analisar dados numa configuração aceite pelos restantes investigadores da comunidade científica. Para clarificar o máximo possível o conhecimento que se espera obter, o investigador deve verificar a base epistemológica das metodologias e técnicas de investigação, de forma a compreender as limitações e implicações de cada um dos instrumentos. Por exemplo, um mecanismo de medição de valores não será a ferramenta apropriada para a obtenção de opiniões e impressões de outros sobre o fenómeno.

O resultado obtido, para a maioria das comunidades de investigação deve corresponder a conhecimento que permita prever o comportamento, em determinados aspectos, do fenómeno. É na interpretação que se aplica ao resultado, onde diverge a epistemologia atribuída.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 36

&lt;page_number&gt;14&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Diferentes autores apresentam diferentes visões sobre epistemologia e suas vertentes, contudo a AIS aponta como havendo três vias principais para a interpretação de resultados, espelhadas nas classificações Positivist, Interpretative e Critical Science.

A primeira, Positivist, baseia-se no pressuposto da existência de leis universais que governam os eventos sociais e o entendimento destas leis permitirão ao investigador descrever, prever e controlar o fenómeno (Kim 2003). Neste meio é comum verificar que a comunidade apresenta grande preferência sobre dados observados e mensuráveis, que fundamentem os resultados como factos.

A vertente Interpretative, em contraste, procura compreender valores, crenças e significados do fenómeno, através da obtenção de análises profundas sobre actividades e experiências culturais (Kim 2003).

A terceira, Critical Science, tenciona criar compreensão crítica do fenómeno com o objectivo de uma transformação sobre este (Winberg 1997).

Apesar de muito sintetizada, a apresentação das três vertentes de interpretação, ilustradas na figura 1, mostra que cada uma alicerça em diferentes posições epistemológicas, relativamente aos fundamentos teóricos, pressupostos e objectivos pretendidos.

Os resultados que se procuram obter durante a realização do projecto de investigação, tem sempre como objectivo responder às questões colocadas sobre o fenómeno, objecto de estudo. O propósito a que a questão se propõe responder, determinará se as respostas deverão ter fundamento em dados medidos e estatísticos, ou se por outro lado em dados empíricos e não mensuráveis.

&lt;img&gt;Diagram showing different approaches (Abordagens) on the y-axis and epistemologies (Epistemologias) on the x-axis. The diagram has four quadrants:
- Top-left quadrant: Critical Science, Interpretative, Positivist.
- Top-right quadrant: Técnicas de recolha (Data collection techniques).
- Bottom-left quadrant: Metodologias de investigação (Research methodologies).
- Bottom-right quadrant: Técnicas de recolha (Data collection techniques).
The y-axis is labeled "Abordagens" and the x-axis is labeled "Epistemologias".&lt;/img&gt;
Ilustração 1 - Vertentes da Epistemologia

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 37

&lt;page_number&gt;15&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A investigação teve origem em ciências naturais como são exemplos Biologia, Química, Física ou Geologia, com o fim de analisar objectos ou acontecimentos observáveis e mensuráveis de alguma forma. As observações e medições por serem tão objectivas podiam ser repetidas por outros investigadores. Este tipo de processo de investigação é apresentado como abordagem quantitativa. Mais tarde, os investigadores focam-se em ciências sociais, como Psicologia, Sociologia ou Antropologia. Nestas áreas o investigador estuda o comportamento humano e o mundo social, verificando-se uma extrema dificuldade ao tentar explicar o comportamento sob variáveis mensuráveis.

Medições podem ajudar a responder a questões como quantas pessoas ou quantas vezes uma pessoa se comporta de uma determinada forma, mas este tipo de instrumento não é adequado para responder a questões de “Porquê?”.

À investigação que tenta aumentar o conhecimento da causa das coisas e do seu comportamento no mundo social, é atribuída designação de abordagem qualitativa.

As questões em projectos de investigação de diferentes abordagens requerem diferentes tipos de dados, para que seja possível elaborar respostas adequadas. Para questões objectivas sobre ciências naturais, o investigador deve recorrer a instrumentos que permitam obter dados quantitativos. Em contraste, o investigador deverá aplicar instrumentos que obtenham dados qualitativos, para dar resposta a questões empíricas ou de ciências sociais. Contudo, apesar da possibilidade de todas as questões serem distintas em diferentes projectos, todos os investigadores partilham o mesmo objectivo – desenvolver explicações para fenómenos complexos.

O histórico do desenvolvimento de estudos pelas diferentes áreas, permite identificar conjuntos de métodos, procedimentos e técnicas possíveis de usar para recolher e analisar informação apropriada no desenvolvimento de respostas às questões de projectos. A estes conjuntos dá-se o nome de metodologias, onde o investigador estrutura os passos a realizar durante o projecto, onde se destacam as técnicas de recolha e de análise de dados.

Existem várias metodologias, técnicas de recolha e técnicas de análise identificadas. Cada um destes instrumentos procura responder ao que se propõe de acordo com as características que possui, o que permite com diferentes metodologias ou técnicas, apresentar diferentes resultados, mesmo que aplicadas sobre o mesmo estudo. As metodologias quando definidas, possuem técnicas de recolha que lhes estão associadas, mas na maioria dos casos a recolha dos dados não se restringe à técnica ou às técnicas apresentadas, sendo possível ao

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 38

&lt;page_number&gt;16&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

investigador aplicar diferentes e diversas técnicas no âmbito de uma metodologia. São as técnicas de recolha de dados que permitem ao investigador obter dados para analisar o fenómeno, podendo os dados serem quantitativos ou qualitativos. O tipo de dados que a técnica de recolha permite obter reflecte-se na classificação da metodologia. Isto é, as metodologias e técnicas de recolha são classificadas de qualitativas ou quantitativas.

Em síntese, investigação que procura obter resultados através de meios não estatísticos ou quantificadores, combina metodologias qualitativas como, por exemplo, Case Study ou Group Feedback, e recorre a técnicas de recolha tais como Observation ou Focus Group, formando investigação com abordagem qualitativa. Em alternativa, investigadores que recorrem a técnicas como Measurement ou Survey, obtêm dados estatísticos ou quantificáveis e seguem metodologias quantitativas, como são exemplos Experiments e Survey, criando investigação com abordagem quantitativa.

&lt;img&gt;
A diagram with four quadrants.
Top left quadrant (light purple) contains "Quantitative" and "Qualitative".
Bottom left quadrant (light green) contains "Metodologias de investigação" and examples: Case Study, Group Feedback, Experiments, Survey, ...
Top right quadrant (light blue) contains "Critical Science", "Interpretative", "Positivist", and "Epistemologias".
Bottom right quadrant (light orange) contains "Técnicas de recolha" and examples: Observation, Focus Group, Mesurement, Survey, ...
The diagram illustrates relationships between Abordagens (Approaches), Epistemologias (Epistemologies), Metodologias de investigação (Research Methods), and Técnicas de recolha (Data Collection Techniques).
&lt;/img&gt;

Ilustração 2 - Elementos de investigação em Sistemas de Informação

A figura 2 apresenta exemplos de instrumentos de investigação que serão detalhados mais à frente.

2.3.ABORDAGENS

As duas abordagens identificadas, qualitativa e quantitativa, divergem quanto ao tipo de dados usados para suportar as hipóteses de explicação do fenómeno sob estudo. A literatura apresenta diferentes formas de classificação para os instrumentos seleccionados pelo

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 39

&lt;page_number&gt;17&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

investigador, metodologias e técnicas, no entanto a classificação mais comum é entre qualitativos e quantitativos.

Apesar de ser a classificação mais comum relativamente a abordagem, existem outras distinções apresentadas por alguns autores. Os métodos de investigação podem também aparecer com a classificação de objectivos ou subjectivos, o que se reflecte numa abordagem objectiva ou subjectiva.

Métodos de investigação quantitativa foram originalmente desenvolvidos em ciências naturais para o estudo de fenómenos naturais. Exemplos de métodos quantitativos são os Survey, Experiments, Formal Methods e Numeric Methods, em que os dados são recolhidos através de inquéritos, medições ou métodos matemáticos conhecidos, como é o caso de modelação.

Métodos de investigação qualitativa foram desenvolvidos em ciências sociais, para permitir aos investigadores o estudo de fenómenos sociais e culturais. São exemplos de métodos qualitativos Action Research, Case Study e Ethnography, onde as origens de dados qualitativos incluem observação, trabalho de campo, entrevistas ou documentos.

O que motiva a selecção de investigação qualitativa em detrimento da quantitativa é sobretudo a capacidade de comunicar. Os métodos de investigação qualitativa foram concebidos para ajudar os investigadores a compreender pessoas e como estas vivem num determinado contexto social e cultural. O objectivo de compreender um fenómeno, a partir do ponto de vista dos participantes e do seu contexto social e institucional, seria largamente perdido quando os dados textuais fossem quantificados (Kaplan and Maxwell 1994).

### 2.3.1. INVESTIGAÇÃO QUALITATIVA

Apesar de investigadores das áreas de Antropologia e Sociologia aplicarem este tipo de abordagem há mais de um século, o termo investigação qualitativa não foi usado nas ciências sociais até aos finais dos anos 60. O termo é usado como um termo geral para referir a várias estratégias de investigação (Siegle 2006).

Na abordagem qualitativa, a investigação para atingir o objectivo proposto ou para estudar um fenómeno, não usa procedimentos estatísticos ou outros meios quantitativos, mas sim métodos que permitam a recolha de dados qualitativos. A investigação qualitativa pode ser encontrada em várias disciplinas e áreas, tendo como suporte uma variedade de métodos e

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 40

&lt;page_number&gt;18&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

técnicas. A investigação na área de SI tem sido direcionada, de uma forma geral, dos aspectos tecnológicos, para aspectos de gestão e da organização. Esta mudança de rumo, aparenta causar um acréscimo de interesse na aplicação de métodos para investigação qualitativa.

Esta abordagem de investigação possui como principal característica o facto dos dados recolhidos não estarem prontamente preparados ou não serem indicados para quantificações, especificações de valores, classificáveis ou não serem objectivos. Devido a este facto, os procedimentos comuns de estatísticas não podem ser aplicados para apresentação ou análise de resultados (Mauch and Park 2003). As fontes de dados mais comuns são relatórios de observação, directa ou participativa, textos de profundo conhecimento sobre o fenómeno e sobre a realidade que o rodeia e ainda o resultado de entrevistas não estruturadas (entrevista desenvolvida pelo fluir de uma conversa).

Mauch e Park (Mauch and Park 2003) afirmam que em investigações qualitativas, o investigador luta para compreender o fenómeno sobre estudo. E apresentam como exemplos de fenómenos, em investigações qualitativas:

*   “Porque pessoas gostam de determinados alimentos?”;
*   “Como é que um atleta se prepara para conseguir um exercício óptimo?”;
*   “Como é que opiniões sobre assuntos políticos são formadas?”;
*   “Como é ser idoso?”;
*   “Como são expressas as ameaças na cultura Maori?”.

O investigador guarda registos detalhados de factos ou acontecimentos sentidos ou contactados de alguma forma, relacionados com o tópico ou fenómeno em análise. O objectivo primário é conseguir conhecimento (dados) sobre o tema de referência e em muitos dos estudos é crucial a informação de sentimentos, comportamentos ou de outras experiências pessoais. Embora já seja histórica a dificuldade em obter registos completos e imparciais relativos a dor, vontade e hábitos alimentares dos objectos de estudo, ao longo do percurso de investigação têm vindo a ser desenvolvidas metodologias e técnicas com o propósito de melhorar e fiabilizar auto-relatórios e relatórios de observação.

Os dados conseguidos contribuem para a criação de hipóteses ou de intervenções no desenvolvimento de teorias e de indicadores de prognóstico.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 41

&lt;page_number&gt;19&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

### 2.3.2. INVESTIGAÇÃO QUANTITATIVA

Investigação que produz dados possíveis de serem analisados estatisticamente e cujos resultados podem ser expressos numericamente. Tipicamente as metodologias e técnicas classificadas de quantitativas procuram quantificar os resultados obtidos e classificá-los por valores ou níveis que representem conceitos teóricos. A interpretação de classificação pode ser vista como uma evidência científica de como o fenómeno se realiza.

A presença de quantidades é tão predominante neste tipo de pesquisa, que a aplicação de análises estatísticas torna-se num elemento essencial da investigação. Na área de SI é comum os investigadores procurarem responder a questões sobre a interacção entre humanos e computadores.

Apesar de ser comum numa investigação usando esta abordagem o investigador recorrer a metodologias e técnicas de recolha de dados quantitativas, informação empírica, tipicamente qualitativa, também pode ser utilizada, como é o caso de informação recolhida de registos de dados ou de entrevistas estruturadas.

O grande desafio nestas situações está em conseguir estabelecer os valores ou níveis a aplicar sobre os dados e como retirar ilações desses valores ou níveis.

### 2.3.3. TRIANGULAÇÃO

Embora muitos dos investigadores escolham realizar o trabalho numa abordagem quantitativa ou qualitativa, outros aplicam combinação de um ou mais tipos de instrumentos de investigação aplicados no mesmo estudo. Este tipo de combinação de metodologias de investigação qualitativa e quantitativa é designado de triangulação.

(Reichardt and Cook 1979; Patton 1990) acreditam que um investigador qualificado pode combinar as abordagens qualitativa e quantitativa e obter resultados com sucesso.

O raciocínio pode tornar-se confuso mas, porque os pressupostos das abordagens são distintos, o desenvolvimento do estudo pode requerer a aplicação de diferentes metodologias e técnicas para obter os dados desejados. Contudo, esta diferença nos instrumentos a aplicar

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 42

&lt;page_number&gt;20&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

não significa que o investigador qualitativo nunca use um questionário ou que um investigador quantitativo nunca recorra a entrevistas (Glesne and Peshkin 1992).

A potencialidade da triangulação reside no facto das diferentes abordagens permitirem ao investigador conhecer e compreender os mais variados fenómenos, mesmo que fora do ambiente que habitualmente o rodeia.

**2.3.4. ABORDAGEM QUALITATIVA E ABORDAGEM QUANTITATIVA - COMPARAÇÃO**

Algumas comunidades de investigação da área de ciências naturais estão historicamente relacionadas com metodologias e técnicas quantitativas e apontam, por vezes, para um eventual fraco rigor quando adoptada uma abordagem qualitativa. (Mauch and Park 2003) referem que investigadores habituados a usar as formas mais convencionais de investigação (relacionadas com ciências naturais) acreditam que rigor, exactidão escrupulosa e honestidade na condução do relatório de investigação são ilustrados por vários marcadores, quando usados instrumentos de investigação quantitativos.

Mas contrapondo esta posição (Lincoln and Guba 1985; Ford 1997) referem que o rigor, a exactidão e a honestidade também pode ser demonstrada através de investigação qualitativa. Contendo esta abordagem os seus procedimentos específicos para assegurar esses valores.

Estes autores apresentam termos paralelos para os dois tipos de abordagens, exibidos na tabela 7:

<table>
<thead>
<tr>
<th>Investigação Qualitativa</th>
<th>Investigação Quantitativa</th>
</tr>
</thead>
<tbody>
<tr>
<td>Credibilidade</td>
<td>Validação Externa</td>
</tr>
<tr>
<td>Transferência</td>
<td>Validação Interna</td>
</tr>
<tr>
<td>Dependência</td>
<td>Fiabilidade</td>
</tr>
<tr>
<td>Confirmação</td>
<td>Objectividade</td>
</tr>
</tbody>
</table>

Tabela 7 - Termos paralelos nas abordagens, adaptado de (Lincoln and Guba 1985; Ford 1997)

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 43

&lt;page_number&gt;21&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Com base nas diferenças indicadas por (Ford 1997), apresenta-se um quadro comparativo e confrontativo (tabela 8), nos procedimentos de investigação associados a cada uma das metodologias:

<table>
  <thead>
    <tr>
      <th></th>
      <th>Investigação Qualitativa</th>
      <th>Investigação Quantitativa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Baseia-se na dedução. As conclusões são elaboradas com raciocínios e deduções partindo de princípios gerais para situações particulares.</td>
      <td>Baseia-se na indução, chegando às conclusões através de colecta e análise de dados de instâncias específicas.</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Requer que o investigador se relacione com pessoas, eventos e ambiente que rodeia o fenómeno. Este relacionamento é parte do processo de investigação.</td>
      <td>Em muitos dos estudos quantitativos é necessário que o investigador mantenha a distância e não se relacione com o fenómeno.</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Dá grande ênfase à geração de novos conceitos ou teorias.</td>
      <td>Tem como principal foco testes de teorias existentes.</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Procura apresentar uma descrição completa e detalhada do fenómeno e da sua complexidade.</td>
      <td>Procura estabelecer relações do tipo acção-reacção em experiências ou ocorrências.</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Tenta descobrir e ilustrar os pressupostos base de eventos ou acções do ou sobre o fenómeno.</td>
      <td>Foca a investigação em testar a realização ou desenvolver de pressupostos conhecidos.</td>
    </tr>
    <tr>
      <td>6</td>
      <td>Usa definições naturais como dados primários.</td>
      <td>Constrói e controla definições com base em níveis e valores que são usados como dados primários.</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Tem início com questões ou problemas profundos e ao longo da investigação procura detalhá-los.</td>
      <td>Tem início com problemas ou questões específicas e relaciona-os com outros problemas procurando ilustrar um conceito com maior dimensão.</td>
    </tr>
    <tr>
      <td>8</td>
      <td>Lida com pequenas amostras e muitas vezes específicas ou únicas.</td>
      <td>Encoraja o estudo de amostras de grande dimensão e premeia a representatividade.</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 44

&lt;page_number&gt;22&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>9</td>
      <td>Considera o contexto de palavras e eventos como parte dos dados base.</td>
      <td>Elimina o contexto e tende a minimizar a influência de nuances afectivas.</td>
    </tr>
    <tr>
      <td>10</td>
      <td>Depende da meticulosidade e do detalhe do relatório para demonstrar a interpretação do estudo.</td>
      <td>Utiliza análises estatísticas e aplica cálculo de probabilidades para demonstrar a interpretação do estudo.</td>
    </tr>
  </tbody>
</table>

Tabela 8 - Procedimentos distintos entre abordagens, adaptado de (Ford 1997)

As diferenças ilustradas nas duas abordagens de investigação, acabam por ser reflectir em diferentes crenças e pressupostos para investigadores qualitativos e quantitativos (ver tabela 9). Assim, de acordo com a posição assumida pelo investigador as questões que se colocam, segundo (Spradley 1979) são:

<table>
  <thead>
    <tr>
      <th></th>
      <th>Abordagem Qualitativa</th>
      <th>Abordagem Quantitativa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>O que é que os meus informadores sabem sobre a sua cultura que eu possa descobrir?</td>
      <td>O que é que eu sei sobre um problema que me permitirá formular e testar uma hipótese?</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Que conceitos os meus informadores usam para classificar as suas experiências?</td>
      <td>Que conceitos posso usar para testar esta hipótese?</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Como é que os meus informadores definem estes conceitos?</td>
      <td>Como consigo definir estes conceitos de forma operacional?</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Que teoria popular os meus informadores usam para explicar as suas experiências?</td>
      <td>Que teoria científica pode explicar os dados?</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Como deverei traduzir o conhecimento cultural dos meus informadores, de forma a criar uma descrição cultural e que seja possível os meus colegas perceberem?</td>
      <td>Como deverei interpretar os resultados para posteriormente apresentá-los na linguagem que os meus colegas usam?</td>
    </tr>
  </tbody>
</table>

Tabela 9 - Contraste de axiomas nas abordagens, adaptado de (Spradley 1979)

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 45

&lt;page_number&gt;23&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

# 2.4. EPISTEMOLOGIAS

As três posições distintas relativas ao estudo da origem, estrutura e validade do conhecimento, de acordo com os seus pressupostos originam diferentes interpretações sobre o estudo. É possível que o investigador assuma uma posição devido à condução de investigação realizada, devido às suas crenças, comunidade onde está inserido ou objectivos definidos para o projecto de estudo.

Uma interpretação positivista tem como fundamentos métodos científicos que produzem dados numéricos ou alfanuméricos, mensuráveis. Este tipo de investigação enquadra-se numa abordagem de investigação quantitativa. Neste tipo de cenário o investigador ao optar por investigação quantitativa acaba por realizar um determinado tipo de interpretação, devido ao tipo de dados que possui e ao tipo de ilações que estes permitem, como ilustrado na figura 3.

&lt;img&gt;
A diagram showing two stacked rectangles.
The top rectangle has "Abordagem" on the left side and "Quantitative" on the right side, with "Quantitative" highlighted.
An arrow points down to the bottom rectangle.
The bottom rectangle has "Epistemologia" on the left side and "Positivist" in the middle, with "Positivist" highlighted.
&lt;/img&gt;
Ilustração 3 - Suposição epistemológica da investigação quantitativa

Os dados que resultam para interpretação dependem sempre das metodologias e técnicas aplicadas no desenvolvimento do trabalho. Mesmo seguindo metodologias tipicamente qualitativas, o investigador pode optar por técnicas de recolha tipicamente quantitativas, que originam dados possíveis de serem mensuráveis e de serem paralelamente analisados e descriminados. Situação comum quando se opta por mais que uma abordagem, criando um cenário de triangulação. Nesta situação, o investigador acaba por efectuar a interpretação sobre os dados, que mais lhe convém, como se ilustra com a figura 4.

Normalmente, o objectivo é responder às questões colocadas pelos objectivos de estudo, podendo ser através da criação de hipóteses com base em dados estatísticos, através de discriminação e compreensão de actividades ou experiências ou ainda através de uma interpretação crítica sobre o fenómeno e o ambiente que o rodeia.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 46

&lt;page_number&gt;24&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<mermaid>
graph TD
    A[Abordagem] --> B[Qualitative]
    subgraph Epistemologia
        C[Positivist]
        D[Interpretative]
        E[Critical Science]
    end
    B --> C
    B --> D
    B --> E
</mermaid>
Ilustração 4 - Suposição epistemológica da investigação qualitativa

Juntando as possíveis bases epistemológicas para investigação, seja ela qualitativa ou quantitativa, resultam possíveis relacionamentos, indicados pela figura 5:

<mermaid>
graph TD
    A[Abordagem] --> B[Quantitative]
    A --> C[Qualitative]
    subgraph Epistemologia
        D[Positivist]
        E[Interpretative]
        F[Critical Science]
    end
    B --> D
    C --> E
    C --> F
</mermaid>
Ilustração 5 - Suposições epistemológicas da investigação

A aprendizagem sobre o fenómeno de estudo é conseguida através da interpretação realizada sobre os dados obtidos com a investigação. O conhecimento conseguido pode ser construído sobre três perspectivas ou epistemologias:

*   Positivist;
*   Interpretative;
*   Critical Science.

Positivist tem como base os pressupostos que definem a existência de leis universais que controlam os eventos sociais e que, compreender essas leis permite ao investigador descrever, prever e controlar o fenómeno social (Wardlow 1989).

A epistemologia Interpretative, por contraste à Positivist, assenta na tentativa da compreensão de valores, crenças e conceitos de eventos sociais, através de uma percepção profunda e clara de experiências e actividades humanas de foro cultural (Smith and Heshusius 1986).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 47

&lt;page_number&gt;25&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Por último, a epistemologia Critical Science tenciona descrever injustiças sociais sobre as quais o indivíduo pode tomar acções de forma a alterar a situação considerada injusta (Comstock 1982).

### 2.4.1. POSITIVIST

Esta epistemologia, com origem no século XIX, surgiu como tentativa de aplicação de métodos associados a ciências naturais em fenómenos sociais (Smith 1983). Em 1822, o filósofo francês Auguste Comte apresenta o termo sociologia e mais tarde classifica as interacções sociais como fenómenos de ciência física investigáveis que permitem esclarecimento e argumentação de leis universais (Babbie 1993).

O conceito criado por Comte baseia-se em objectividade científica e observação através dos cinco sentidos, descurando crenças subjectivas. Esta perspectiva revolucionária sobre o mundo social como fenómenos científicos, que se tornava compreensível com estudos empíricos, converte-se na base de aplicação de uma epistemologia positivista (Babbie 1993).

Positivist, como derivação dos fundamentos filosóficos de Comte, pressupõe que a realidade social existe independentemente das pessoas e pode ser investigada objectivamente, aplicando instrumentos de medição, válidos e fiáveis.

O cerne de Positivist difere das outras epistemologias numa forma análoga à diferença entre teoria científica e mito. Numa teoria científica as predições apresentadas ao longo do estudo, podem ser confrontadas de forma empírica, isto é, é possível provar que estão erradas. Desta forma uma teoria científica corre o risco de ser eliminada, se não for possível de ser comprovada através de dados.

A teoria da relatividade de Einstein é um exemplo clássico de uma teoria científica. A teoria proposta por Einstein poderia ter sido arquivada, caso o teste empírico realizado não a tivesse suportado. Apesar da quantidade de trabalho que acarretou e apesar do seu interesse matemático, a teoria foi aceite porque foi colocada sob teste em 1919 por Eddington durante observação e os resultados obtidos da observação corroboraram a teoria da relatividade. As predições indicadas por Einstein contrastavam com as defendidas pelos físicos de Newton. A teoria seria desacreditada se não parecesse que as estrelas se moviam, durante o eclipse, devido à gravidade do sol.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 48

&lt;page_number&gt;26&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Em contraste a este exemplo de teoria científica está a teoria de psico-análise de Freud, por nunca poder ser desacreditada, dado que a teoria é suficientemente imprecisa. Permite qualquer explicação conveniente e a definição de novas hipóteses para justificar observações efectuadas e que contradigam a teoria.

Este tipo de teoria, que nunca pode ser provada como errada para quem acreditar nela, contrasta com a definição de teoria científica, uma vez que esta pode ser provada de errada. Basicamente, experiências podem provar que a teoria está errada, mas nunca poderão provar que está certa.

A epistemologia Positivist tenta provar que as predições da teoria estão erradas, bastando uma observação que contradiga essas predições, para provar que está incorrecta. Além disso, mesmo depois de testada a teoria, esta nunca será verificada porque não será possível mostrar que no futuro não haverá uma observação que venha a contradizer a teoria.

Neste ponto de vista, as hipóteses apresentadas pelo investigador, desde que corroboradas várias vezes pelos resultados, são aceites como teoria até prova em contrário.

Os desígnios reflectidos na investigação positivista estão fundamentados na concepção de uma realidade independente (Popkewitz 1980). Investigadores que optem pela epistemologia Positivist, devem reconhecer que os pressupostos primários deste tipo de investigação acabam por se tornar características intrínsecas no desenvolvimento da investigação (Wardlow 1989):

1. Realidade física e eventos sociais são análogos de forma que investigadores podem estudar fenómenos sociais como se fossem fenómenos físicos;
2. Existe uma teoria e um conjunto de princípios universais e através de inferências é possível descrever o comportamento humano e fenómenos sociais;
3. Ao examinar eventos sociais, os investigadores devem fixar a análise no objecto sujeito e manterem-se afastados dos intervenientes mantendo uma existência independente;
4. É necessário formalizar o conhecimento que se ganha, recorrendo a teorias e variáveis distintas entre si, na sua aplicação no desenvolar do estudo, mas combinadas para criar o resultado;
5. Hipóteses sobre teorias de princípios são testadas com a quantificação de observação e aplicação de análises estatísticas.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 49

&lt;page_number&gt;27&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Esta análise quantificada sobre fenómenos sociais, contém algumas limitações, como são o caso de factores contextuais influenciadores do fenómeno e que são ignorados pelos métodos que procuram medir ou quantificar as características mensuráveis do fenómeno.

De facto, estudos que tentam prever o comportamento humano estão integrados num contexto onde as pessoas interagem entre si no seio de um ambiente social ou de uma organização. Se os investigadores conseguirem compreender os elementos de contexto associados ao comportamento, poderão aumentar a probabilidade de sucesso na previsão do evento humano.

Outra denominada limitação é o facto da verdade, numa investigação positivista, ser argumentada com probabilidades.

De forma resumida, no processo de investigação positivista, os investigadores devem expressar-se com valores neutros e linguagem científica, de forma a ultrapassarem descrições comuns e subjectivas, criando os resultados através de regras e leis universais. Ao fazerem isto, o conhecimento conseguido pela realidade independente pode ser aceite por todas as pessoas racionais (Smith 1983).

### 2.4.2. INTERPRETATIVE

Para os investigadores que adoptam investigação interpretativa, realidades organizacionais e sociais são construídas com base em teorias, que são próprias e que acabaram por moldar e afectar a realidade. Neste sentido, não há realidades independentes que possam ser respondidas com hipóteses utilizadas como pontos de referência (Walker and Evers 1999).

O conhecimento que se retira numa investigação interpretativa poderá estar comprometido por várias interpretações que fazem parte do ambiente social e cultural onde ocorrem. Devido a esta característica, o investigador no decorrer do estudo procura compreender as pessoas que são estudadas, por estarem relacionadas com o fenómeno, de forma captar as características que apresentam (Giorgi 1997; van Manen 1998; Husen 1999).

A verdade de uma situação pode não ser numa outra. As discrepâncias contextuais criam um imenso obstáculo na busca de conhecimentos aplicáveis em vários contextos ou realidades. Em muitos casos acabam por haver variâncias únicas que impedem a replicação de resultados.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 50

&lt;page_number&gt;28&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Optar por estudos interpretativos pode representar um acréscimo nos custos associados ao projecto, devido ao habitual longo período de investigação. A maioria dos investigadores acaba por aceitar esta condição, mas os puristas, que provém de uma tradição ou comunidade positivista, consideram-na inaceitável.

À medida que o trabalho se desenvola, a percepção, experiência e historial sociocultural afecta a maneira de como cada indivíduo vê o ambiente que o rodeia e torna-se difícil ao investigador, como indivíduo, abranger todos os aspectos socioculturais e descartar os próprios valores e crenças.

O investigador que adopta a epistemologia Interpretative, sabe disso e aceita-o como característica do trabalho desenvolvido. Contudo, o investigador positivista, em vez de negar a presença destes enviesamentos opta por aplicar métodos empíricos numa tentativa de minimizar a subjectividade na investigação.

Estudos explicitamente interpretativos acabam por adoptar uma perspectiva não determinística, ou seja, tentam explorar o fenómeno na sua forma e ambiente natural. Contudo, na área específica de SI, uma análise a um fenómeno desta natureza implica colocar foco apenas em determinados aspectos. Uma análise exclusiva acaba por ser sempre uma análise parcial.

O principal propósito numa investigação interpretativa é compreender como é que os membros de um grupo social, através da sua participação no processo social, promulgam as suas realidades e as dotam de significados, crenças e intenções de ajudar na constituição do acto social. A epistemologia Interpretative tenta compreender os significados subjectivos embebidos na vida social e explicar porque é que as pessoas agem como agem (Gibbons 1987).

A filosofia interpretativa tem como premissa a crença epistemológica que o processo social não é capturado com deduções hipotéticas, co-variações e intervalos de valores. Em vez disso compreender o processo social implica penetrar na realidade que gera o processo (Rosen 1991).

2.4.3. CRITICAL SCIENCE

Investigadores que optam pela epistemologia Critical Science, destacam ainda mais a sua posição filosófica, discordante da neutralidade de valores que caracteriza Positivist, ao

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 51

&lt;page_number&gt;29&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

argumentarem que os investigadores devem ter uma postura participativa na mudança social, dessa forma, partilhando na responsabilidade pela mudança (Comstock 1982).

Segundo esta perspectiva, os métodos positivistas não conseguem capturar a importância que existe nos valores necessários à optimização ou melhoria de eventualidades humanas (Comstock 1982).

Estudos de Critical Science procuram através da exposição de problemas estruturais, criticar as contradições criadas por status quo e outros factores de desigualdade, tanto em ambientes organizacionais como sociais. Estes estudos colocam o foco na avaliação, descrição e explicação das desigualdades e injustiças sociais.

Adoptando uma perspectiva diferente da assumida pelo investigador positivista ou interpretativo, este tenta criar uma avaliação crítica à realidade social que está sobre investigação. Pode-se afirmar que enquanto as outras duas epistemologias tentam prever ou explicar o status quo, a epistemologia Critical Science preocupa-se em apreciar e comentar os sistemas sociais existentes e também em revelar quaisquer contradições ou conflitos associados às estruturas dos referidos sistemas.

O principal pressuposto na filosofia Critical Science é a convicção que tudo, organizacional ou social, é historicamente constituído e por isso fenómenos humanos, organizacionais e sociais não estão confinados a um estado particular (Chua 1986). Este autor aponta como exemplo os programadores de sistemas. Estas pessoas não são elementos isolados, existem sim apenas em contextos de organizações que produzem e usam tecnologias de informação (TI) ou numa sociedade que investe em TI.

Numa comunidade de Critical Science não pode haver teorias independentes de recolhas e interpretações de evidências, cujas conclusões permitam provar ou corromper a teoria apresentada. Os métodos de pesquisa aplicados, neste tipo de investigação, tendem a produzir estudos com grande histórico de factos ou argumentos, resultado na maioria das vezes da aplicação de metodologia Ethnography. A predominância desta metodologia advém da convicção que um fenómeno apenas pode ser compreendido de uma forma histórica, através de uma análise do tipo "... o que foi, o que se tornou e o que não é" (Chua 1986).

Os investigadores de Critical Science diferem dos seus colegas interpretativos, ao acreditarem que a interpretação do mundo social não é o suficiente. Consideram que as condições

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 52

&lt;page_number&gt;30&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

materiais dominantes também devem ser compreendidas e criticadas e que estes elementos não estão acessíveis através de meros questionários ou observações como participante.

Uma investigação sobre a epistemologia Critical Science, além de uma explicação dos esquemas, estruturas e regras sociais, de um grupo em particular ou de uma organização deve incluir também uma crítica às práticas e relações existentes.

Há mais de um século que a epistemologia Positivist se tem apresentado como dominante nos estudos de ciências sociais (Wardlow 1989). Desde a aplicação de Positivist por Comte, no século XIX, que se tem evidenciado um progresso no refinamento de metodologias e técnicas de análise em investigação sobre as áreas social e educacional.

Os movimentos sociais ocorridos nos anos 60 provocaram críticas à epistemologia Positivist e despoletaram questões de mérito e de legitimidade (Code 1991; Banks 1998). Investigadores de Critical Science apresentavam argumentos que Positivist causava teorias institucionalizadas e que, ao se considerarem realidades e variáveis neutras, se favorecia a população de características gerais, mas que se criava negligência sobre comunidades marginalizadas. De forma semelhante, os investigadores interpretativos criticavam Positivist por desrespeitar e não procurar compreender os contextos sócio-culturais existentes numa sociedade de multiplas etnias (Banks 1998).

Como resultado deste conflito, a situação actual nas comunidades de investigação acaba por ser uma confrontação entre estas três epistemologias, por vezes manifestada como ciências “hard” e “soft” ou “quantitativa” ou “qualitativa” (Bredo and Feinsberg 1982; Code 1991).

Com esta informação, o investigador deve assegurar que adopta a epistemologia mais compatível com os interesses da sua investigação. Embora aberto à possibilidade de analisar outras pressuposições de acordo com a mutabilidade dos interesses. O factor mais relevante na selecção da epistemologia é a compreensão e o conhecimento prévio de que a adopção de uma determinada epistemologia vai encaminhar o investigador para colocar o foco de atenção em determinados factos em detrimento de outros. A selecção deve recair sobre a epistemologia que melhor permitirá estudar o fenómeno.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 53

&lt;page_number&gt;31&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

# 2.5. METODOLOGIAS DE INVESTIGAÇÃO

Uma definição breve de metodologia apresenta-a como sendo um conceito que se refere a um conjunto de métodos, procedimentos e técnicas, usado para recolher dados e analisar informação de forma apropriada para um programa ou projecto específico (Winberg 1997).

Num sentido mais prático, metodologia está associada à definição que o investigador faz relativamente à abordagem a seguir, os métodos a aplicar, os instrumentos a utilizar, ou seja quando desenha o caminho a percorrer para atingir o fim a que se propõe com o seu projecto.

Metodologia é definida como sendo o estudo sistemático e lógico dos princípios que conduzem a investigação científica, incluindo desde suposições básicas a técnicas de indagação. Por vezes confundida com teoria, leva a uma conceptualização errada do conceito. Teoria incide principalmente sobre a validade do proposto enquanto metodologia incide sobre conteúdo e principalmente sobre os procedimentos (métodos e técnicas) a adoptar durante o projecto. Mais do que uma descrição formal de técnicas e métodos a serem utilizados, indica a opção que o investigador fez do quadro teórico para determinada situação prática, onde reside o fenómeno objecto de pesquisa (Teixeira 2005).

A metodologia contempla a fase exploratória do projecto, onde acontece o estabelecimento de critérios de amostragem, a definição de instrumentos e procedimentos para síntese e a análise de dados e informações. Destacam-se neste quadro dois conceitos: método e técnica.

Método significa o caminho a seguir mediante uma série de operações e regras prefixadas de antemão, aptas para alcançar o resultado proposto. Representa um procedimento racional e ordenado, constituído por instrumentos básicos a utilizar.

Técnica, por sua vez, a maneira de percorrer esse caminho. Por outras palavras, método é o procedimento que permite estabelecer conclusões de forma objectiva, enquanto técnica é um sistema de princípios e normas que auxiliam na aplicação dos métodos.

Habitualmente metodologias quantitativas prescrevem uma selecção aleatória sobre a população de forma a definir a amostra assim como uma atribuição, igualmente aleatória, de amostras a grupos de investigação (Duffy 1985). A aplicação de tratamentos estatísticos sobre estas amostras permite o desenvolvimento de regras gerais que podem ser generalizadas

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 54

&lt;page_number&gt;32&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

sobre a população. A vantage de resultados obtidos a partir de amostras criadas aleatoriamente é que é altamente provável de serem generalizáveis. Por outro lado, a desvantagem está no largo tempo necessário para concluir o estudo sobre toda a amostra, quando poderia ser muito mais rápido se o estudo fosse feito sobre uma amostra mais oportunista, no prisma do fenómeno sob estudo (Duffy 1985).

Metodologias qualitativas, por assentarem em estudos com uma natureza mais profunda e por requerem análise empírica aos dados recolhidos, são aplicadas a amostras mais pequenas e mais selectivas (Cormack 1991). Estas condições apresentam como principal fraqueza uma fácil suspeita de que o investigador poderá ter sido influenciado por alguma predisposição, afectando a generalização do estudo (Bryman 1988). Estas condições ainda sugerem que metodologias qualitativas tenham a validação de população pequena, no entanto, a forte característica deste tipo de metodologias é visível quando a amostra é bem definida, permitindo a generalização do conhecimento a uma população geral (Hinton 1987).

Apesar de metodologias qualitativas terem maiores problemas relativos à credibilidade do que metodologias quantitativas, a posição é inversa quando se trata de validade. O ponto importante a ter em conta numa investigação quantitativa é que quanto mais é controlado o estudo, mais difícil se torna confirmar que a situação estudada acontece tal e qual na vida real. Os mesmos componentes de investigação que exigem o controlo de variáveis operam em sentido oposto na validação geral do conhecimento encontrado e, consequentemente, na sua generalização (Sandelowski 1986).

Importante característica das metodologias quantitativas é o facto dos investigadores manterem uma visão desligada e objectiva sobre o objecto de estudo (Duffy 1985). Alguns métodos podem mesmo requerer que não haja contacto directo entre investigador e investigados ou fenómeno, como acontece com questionários enviados via postal ou electronicamente. A relevância de uma visão deste tipo é a inexistência de qualquer envolvimento do investigador prevenindo a polarização do estudo e assegurando a objectividade.

A referência de metodologias qualitativas e quantitativas surge como enquadramento ao já apresentado neste estudo, relativamente à abordagem. Independentemente desta classificação, é comum a indicação de dois tipos de investigação: confirmatória ou exploratória. Investigação confirmatória procura confirmar ou testar uma relação pré-desenhada, conhecida ou estabelecida, enquanto investigação exploratória procura definir

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 55

&lt;page_number&gt;33&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

possíveis relações através de várias variáveis identificadas ao longo do estudo (Hair, Anderson et al. 1995). Considerando o tipo de investigação, o investigador opta por aplicar uma metodologia que o encaminhe ao que se propõe, confirmar ou identificar ilações entre variáveis.

O facto de o investigador conduzir uma investigação que perante um ponto de vista, pretende confirmar ou explorar relações e perante outro ponto de vista, resulte em dados empíricos ou numéricos (qualitativa ou quantitativa), a selecção da metodologia não está confinada a um pequeno conjunto ou a um tipo de classificação. Assim como, a selecção de uma metodologia não deve forçar uma determinada técnica de investigação. Na prática, a selecção de determinados procedimentos metodológicos durante o percurso do estudo, encaminha o investigador num percurso influenciando-o na adopção de técnicas de recolha e de análise de dados. A influência acontece pela literatura da metodologia, desconhecimento de técnicas alternativas, pela comunidade onde está inserido o investigador ou pelo histórico de investigação na área do fenómeno.

Um conhecimento prévio dos instrumentos de investigação, metodologias, técnicas de recolha e técnicas de análise, permitem a realização das quatro escolhas básicas que o investigador terá de fazer (Straub, Gefen et al. 2005), como se apresenta na figura 6.

&lt;img&gt;Ilustração 6 - Escolhas básicas no percurso de investigação&lt;/img&gt;

A selecção de uma única metodologia estreita a visão do investigador e priva-o de conhecer os benefícios e os pontos fortes inerentes a uma variedade de metodologias de investigação (Duffy 1985).

Triangulação não só não maximiza as vantagens e minimiza as desvantagens de cada metodologia, como contribui para melhores resultados e para desenvolvimento de conhecimento (Morse 1991). Mas esta opinião sobre triangulação não é unânime. São vários os autores que se afirmam contra a aplicação de várias metodologias num mesmo projecto. Independente de opiniões opostas, quando combinadas metodologias quantitativas e

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 56

&lt;page_number&gt;34&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

qualitativas, os instrumentos são aplicados de forma sequencial. Numa primeira instância a aplicação de técnicas qualitativas, como entrevistas semi-estruturadas ou observação, permite a exploração de hipóteses e de variáveis que pode resultar numa maior sensibilidade e proximidade do fenómeno, para uma futura aplicação de técnicas quantitativas, como inquéritos ou estatísticas. Contudo, técnicas qualitativas também podem ser aplicadas após técnicas quantitativas, numa perspectiva de compreender o significado e as implicações de resultados obtidos.

Apesar das diferenças entre metodologias qualitativas e quantitativas, não há evidências de algum dos tipos ser superior a outro. Nas duas vertentes são reconhecidas vantagens e desvantagens, por esta razão é possível afirmar que não há alguma metodologia mais indicada para a produção de conhecimento.

### 2.5.1. ACTION RESEARCH

A definição de Action Research, apresenta-a como uma metodologia que procura contribuir para a compreensão de preocupações práticas de pessoas e situações de problemas imediatos, através de colaboração, respeitando as definições de ética, entre investigador e investigado (Rapoport 1970). A definição apresenta as características mais importantes da metodologia, a colaboração que existe e alerta para possíveis problemas éticos que possa surgir devido à colaboração.

As características da metodologia tornam-na adequada para estudos que procuram alargar o conhecimento da comunidade de ciência social. Apresentando-se assim mais direccionada para estudos nas áreas do desenvolvimento organizacional e da educação. Com a evolução dos SI, que se posicionam cada vez mais numa área de desenvolvimento e estruturação organizacional, esta metodologia ganha cada vez mais adeptos.

Um investigador que tenha sido convidado para auxiliar no desenvolvimento de uma actividade deve em primeiro lugar, analisar como é distribuída a autoridade organizacional no processo sob análise. Com este conhecimento, cabe ao investigador decidir a que nível deve incidir a defesa da sua futura proposta, se em todos os níveis ou se apenas a um nível intermediário é o suficiente. A tendência é que a apresentação e justificação do trabalho realizado pelo investigador sejam feitas junto das pessoas que despoletaram o processo de requisição do investigador, habitualmente a direcção da organização (Routio 2007).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 57

&lt;page_number&gt;35&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Neste tipo de cenário, a tendência inicial dos investigadores era desenvolver actividade que os identificasse como representantes da direcção e nesta posição tentavam descobrir formas de resolução do problema e posteriormente ensinar as camadas mais baixas da autoridade. Nesta perspectiva o investigador tentava actuar como um médico que curava a doença do seu paciente, através de medicamentos que tivessem efeito mas sem a contribuição do paciente. Este tipo de procedimento é válido em áreas ou problemas onde uma teoria generalizada seja aceite e se apresente como solução. Mas os problemas em SI, em especial os aplicados às organizações, acabam por ter a melhor solução quando médicos e pacientes trabalham para a cura de forma conjunta.

A participação dos intervenientes, sejam utilizadores ou gestores, do sistema ou da organização acaba por apresentar benefícios tanto para a administração onde o sistema se insere, como para o investigador.

A participação dos intervenientes, independente da forma, dá acesso ao investigador a conhecimento não verbal, técnicas e experiência que apenas os intervenientes tem, por serem eles que lidam com o sistema no campo de acção. Com este conhecimento, a perspectiva do estudo amplia-se, mas apenas sobre o que realmente interessa e o risco de omissão de pontos de vista ou factores importantes diminui. Por outro lado, se é esperado que o projecto produza mudanças à prática corrente, este objectivo será muito provavelmente atingido, graças à contribuição de pessoas com uma sólida experiência prática (Routio 2007).

Também sobre os eventuais problemas éticos a participação de intervenientes apresenta vantagens. Uma participação extensa das diferentes camadas de autoridade reduz o risco do projecto causar qualquer inconveniência.

A selecção dos intervenientes deve ter em conta quem originalmente solicitou o trabalho do investigador. Será nesse ponto que reside a necessidade de ajuda e a disponibilidade que o investigador deseja. A abordagem que o investigador apresenta perante os intervenientes que participarão no estudo, está relacionada com o tipo de metodologia participativa. A classificação mais comum para este tipo de metodologia divide-se em metodologias extrínsecas e metodologias intrínsecas.

Nas metodologias extrínsecas o investigador assume-se como parte da gestão da organização ou do ambiente onde está inserido o problema e usa uma posição dominante para procurar respostas a questões de como e porquê sobre o fenómeno.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 58

&lt;page_number&gt;36&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

As questões referenciadas neste tipo de metodologia são:

*   O que é feito?
*   Quem faz o trabalho?
*   Onde é feito o trabalho?
*   Quando é feito o trabalho?
*   Como é feito o trabalho?

Habitualmente a investigação é iniciada com uma observação dos procedimentos habituais do processo de trabalho, sem interferências do investigador e com registo do processo através de gráficos, planos e horários. Com uma observação sistemática, o objectivo é conseguir resposta às cinco questões acima indicadas.

Nas metodologias intrínsecas o objectivo não é apenas esclarecer o processo. Pretende-se em primeiro lugar optimizar o processo existente. Este objectivo é habitualmente conseguido pela equipa interna da organização ou que lida com o problema, com a ajuda do investigador que cria propostas para possíveis melhorias do processo em estudo. A metodologia mais importante das denominadas intrínsecas é a Action Research. A maioria das aplicações da metodologia incide sobre actividades de produção industrial. Pede-se ao investigador que identifique optimizações de actividade de produção que resultem numa maior qualidade de produto e eventualmente num maior índice de produção. É ainda possível que, a organização peça ao investigador que ajude a identificar novas formas, ou alternativas às existentes, de aplicação do produto, tentando evitar o fim de vida deste através de novas necessidades ou de novos potenciais clientes.

Na Action Research, o investigador familiariza-se temporariamente com a comunidade onde se apresenta o fenómeno e, recorrendo a ferramentas de teoria, ajuda a comunidade a resolver o problema (Routio 2007).

Esta metodologia apresenta como vantagens o facto de uma solução desenvolvida pelo grupo que interage com o fenómeno, ser muito provavelmente melhor que uma solução produzida por forasteiros do ambiente real. Este grupo interno que conhece o problema sabe também quais as melhores soluções alternativas. Ao fornecer ao grupo conhecimento sobre teorias e relações humanas, o investigador inicia um diagnóstico ao problema que termina na identificação de uma solução. Idealmente o grupo ao receber este novo conhecimento, cresce

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 59

&lt;page_number&gt;37&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

mentalmente e futuramente poderá ser capaz de reconhecer problemas e lidar com eles sem auxílio de investigador externo. A motivação gerada pelo envolvimento do grupo permite um maior entusiasmo e entrega sobre o problema e sua solução, ao contrário de uma solução indicada por alguém externo à comunidade.

É devido a estas vantagens que Action Research se tem vindo a apresentar como uma metodologia extremamente eficaz.

O processo de investigação associado à metodologia acaba por defini-la não só como uma ferramenta de desenvolvimento de actividades mas também de aprendizagem colectiva sobre o fenómeno em estudo (ver figura 7):

1. O ponto de partida deve ser a acção regularmente exercida pelo grupo. Suposições teóricas não serão suficientes para entender o problema;
2. Análise dos resultados obtidos, tentando identificar se existem inconvenientes ou efeitos secundários ou se o objectivo a que se propôs o estudo já foi atingido;
3. Reflexão sobre o processo. O investigador deve tomar alguma distância ao ambiente de estudo e tentar encontrar a estrutura conceptual do fenómeno. O objectivo é compreender como ocorre o processo e tentar identificar formas alternativas de o realizar;
4. Abstracção. O investigador deve conseguir construir um modelo teórico do fenómeno, incluindo as funções essenciais que lhe estão associadas, os pontos fortes e pontos fracos;
5. Planear mudanças à forma de acção original que permitam reter os pontos fortes e melhorar os fracos. O modelo teórico deve fornecer fundamentos para as novas acções.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 60

&lt;page_number&gt;38&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<mermaid>
graph TD
    A[Literatura] --> B[Análise da teoria existente]
    B --> C[Identificar mudanças]
    C --> D[Acção]
    D --> E[Avaliação]
    E --> F[Reflexão]
    F --> G[Criar modelo]
    G --> H[Teoria]
    H --> A
</mermaid>

Ilustração 7 - Etapas em Action Research

O ciclo apresentado deve ser realizado as vezes necessárias até encontrada a solução. O ponto de partida será sempre as últimas acções planeadas.

Os instrumentos de investigação podem ser vários, contudo os mais comuns são documentos, como gráficos e fluxogramas, questionários e observação.

2.5.2. CASE STUDY

Segundo a AIS, Case Study é a metodologia mais comum na área de SI. Com o trabalho realizado nesta dissertação, que será discutido mais à frente, é possível verificar que em Portugal a realidade é diferente, mas pouco.

Um Case Study é uma investigação empírica que investiga um fenómeno contemporâneo no seu verdadeiro e real contexto, especialmente quando a fronteira entre fenómeno e contexto não é muito clara (Yin 2002).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 61

&lt;page_number&gt;39&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A constante opção por esta metodologia advém do facto desta encaixar perfeitamente em investigações de SI, uma vez que o objectivo da disciplina SI é o estudo de sistemas de gestão de informação nas organizações, onde o interesse se tem deslocado de fenómenos técnicos para a análise de problemas organizacionais (Benbasat, Goldstein et al. 1987).

Apesar de cada investigação ter as suas questões específicas, nesta metodologia, todos os investigadores partilham um objectivo básico – desenvolver explicação para fenómenos complexos que afectam as organizações, em particular os seus sistemas de informação.

As explicações são conseguidas através do desenvolvimento de teorias que permitem uma investigação junto de processos de trabalho que podem conter influências sociais, por vezes escondidas nas actividades do processo.

Porque as situações criadas e existentes entre humanos e sistemas organizacionais são únicas, teoria existente definida em estudos anteriores, torna-se inadequada para novos fenómenos (Gummesson 1991).

Case Study só é possível com uma completa observação, reconstrução e análise do fenómeno em estudo (Zonabend 1992). O recurso de técnicas de observação permite obter dados ricos, por estarem a ser recolhidos do seu contexto e serem extremamente válidos.

O Case Study é preferido quando as questões propostas para investigação são da forma “Como” e “Porquê” e o controle que o investigador tem sobre os eventos é muito reduzido. O ambiente é ainda propício a esta metodologia quando o foco está em fenómenos contemporâneos contextualizados em processos reais.

Algumas das desvantagens apontadas sobre esta metodologia são:

*   Falta de rigor;
*   Informação insuficiente para generalizações;
*   Influência do investigador;
*   Estudos extensos e morosos.

Sobre estas desvantagens, a literatura da área refere existirem maneiras de validar e mostrar a fiabilidade do estudo, assim como, o que se procura generalizar são teorias e não hipóteses sobre populações.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 62

&lt;page_number&gt;40&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Relativamente às duas últimas críticas, o investigador deve ter alguns cuidados e se possível algum treino. A extracção de informação deve ser feita com recurso a procedimentos baseados na percepção e capacidade analítica. Para tal é importante o investigador ser capaz de formular boas questões e interpretar as respostas, mas sem ficar prisioneiro de preconceitos. Assim, o investigador não deve ser inflexível mas também não deve nunca perder o rigor. O investigador acaba por actuar como um detective que trabalha com neutralidade para evitar a introdução de opiniões ou noções pré-concebidas.

É habitual a aplicação desta metodologia contemplar a utilização de múltiplas fontes de dados, embora tal não seja obrigatório. Podem ser várias as técnicas de recolha de dados aplicadas, dependendo do objectivo do estudo, uma vez que esta metodologia pode ser analisada sob uma epistemologia positivista, interpretativa ou crítica, dependendo dos pressupostos do investigador.

As técnicas mais utilizadas nesta metodologia são Observation, Interview e Archival Research. Frequentemente com as duas primeiras técnicas recolhem-se os dados do fenómeno em estudo e, com a última, complementa-se a informação de bases e conceitos teóricos da área sob análise.

Archival Research permite ao investigador pesquisar informação em documentos como cartas, relatórios, entre outras informações internas da organização. E também em registos de dados, como bases de dados, registos de operações, etc. Esta informação poderá ser usada para corroborar evidências de outras fontes ou acrescentar informações, enriquecendo o estudo.

Observation e Interview serão as técnicas principais na recolha de dados. Dependendo do fenómeno a Observation pode ser usada como única técnica de recolha de dados, ou em outros casos a técnica Interview.

Embora referidas as três principais técnicas aplicadas em estudos de metodologia Case Study, este tipo de estudo permite e são desejáveis múltiplas fontes de dados. Uma maior diversidade de técnicas e fontes de dados enriquece e fortalece o estudo, criando uma maior credibilidade do estudo.

Case Study é uma metodologia que proporciona triangulação. O investigador encontra esta necessidade quando pretende confirmar a validade de processos. Em Case Study, a triangulação pode ser conseguida recorrendo a múltiplas fontes de dados (Yin 1984).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 63

&lt;page_number&gt;41&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Existem pelo menos seis fontes de dados possíveis para incluir num estudo de metodologia Case Study (Yin 1994; Stake 1995).

*   Documentos
    *   Cartas, memorandos, comunicados, agendas, documentos administrativos, artigos de jornais;
*   Registos
    *   Registos de actividade, registos da organização, listas de nomes, dados de questionários, registos de bases de dados;
*   Entrevistas
    *   Abertas, focadas, estruturadas;
*   Observação directa
    *   O investigador deve ser tão comedido como papel de parede;
*   Observação participante
    *   O investigador pode vir a fazer parte do grupo;
*   Artefactos físicos
    *   Ferramentas, instrumentos recolhidos durante visita ao campo de acção.

Uma crítica frequente ao Case Study é que o facto dos dados muitas vezes dependerem de um único caso incapacita gerar uma conclusão generalizada.

A amostragem, sejam 2, 10 ou 100 casos sob estudo, não transforma um Case Study múltiplo num estudo macroscópico. O objectivo do estudo deve ser reflectido em parâmetros e é sobre estes que deve incidir a investigação, em todos os casos sob estudo. Desta forma, mesmo estudos Case Study com um único caso, devem ser considerados aceites, desde que atingido o objectivo estabelecido (Yin 1984; Yin 1989; Yin 1989; Hamel, Dufour et al. 1993; Yin 1993; Yin 1994).

A generalização de resultados, de casos únicos ou de múltiplos casos, é conseguida através de teoria e não da população de estudo. Múltiplos casos sob estudo, fortalecem os resultados

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 64

&lt;page_number&gt;42&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

porque tal reproduz padrões de correspondência aumentando a confiança na solidez da teoria (Yin 1994).

Trabalhos com um único caso de estudo podem ser usados para confirmar ou desafiar uma teoria assim como para representar um caso único ou extremo (Yin 1994).

&lt;img&gt;A diagram showing six stages of a case study research process. The top stage is "Literatura" (Literature). The second stage is "Planificação" (Planning). The third stage is "Recolher dados" (Collecting data). The fourth stage is "Analisar dados" (Analyzing data). The fifth stage is "Reflexão" (Reflection). The sixth stage is "Teoria" (Theory).&lt;/img&gt;
Ilustração 8 - Etapas em Case Study

Todas as etapas compreendidas entre planificação e reflexão podem ser repetidas quantas vezes necessárias, como representado na figura 8. A repetição pode dever-se à aplicação de diferentes técnicas de recolha de dados ou simplesmente porque o investigador considera não ter dados suficiente válidos e fiáveis.

2.5.3. ETHNOGRAPHY

Um etnógrafo, ou seja, quem adopta a metodologia Ethnography, posiciona-se durante um largo período de tempo no campo de acção, mergulhando profundamente na realidade e no ambiente sob estudo procurando estudar o fenómeno no seu contexto social e cultural natural (Lewis 1985).

Um cenário deste tipo para investigação não se enquadra em todas vertentes da ciência. Nas últimas três décadas a maioria dos etnógrafos surgem das áreas da Antropologia, Sociologia e

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 65

&lt;page_number&gt;43&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Design e nas áreas da informação como bibliotecas, arquivos e informática. Esta realidade advém da importância que estas áreas dão às pessoas e à forma como agem e interagem.

Na área de informática, ganha especial relevo em estudos direcionados para SIO. Mais particularmente para a análise de desenvolvimento de sistemas e análise de gestão de TI. Sobre a área de SI a Ethnography tem-se apresentado bastante útil em estudos focados na definição do interface das aplicações, na avaliação e testes de aplicações e na definição de evoluções de sistemas aplicacionais (Bowker and Star 1996).

O resultado da Ethnography é essencialmente descritivo, aparecendo por vezes como uma forma de registo de narrativa oral (Hammersley and Atkinson 1994). Só ocasionalmente o investigador coloca ênfase no desenvolvimento e verificação de teoria. Este tipo de opinião não é generalizável. Outros investigadores, em especial das áreas da informação olham para a Ethnography como uma espécie de metodologia que funciona como a técnica observação participante. A Ethnography é uma metodologia de investigação social, pouco comum porque requer uma ampla gama de fontes de dados (Hammersley and Atkinson 1994).

Dilema semelhante existe na interpretação feita aos estudos etnográficos. Enquanto há quem considere que um estudo realizado com recurso à Ethnography, apresenta apenas dados e nenhuma informação por ser demasiado subjectiva, não podendo proporcionar fundamentos sólidos para uma análise científica rigorosa, há também quem considere que só através de um estudo etnográfico se consegue entender o sentido de processos sociais. Para este último grupo de pessoas, métodos artificiais como experimentações, entrevistas ou questionários são incapazes de captar o significado de actividades humanas.

O etnógrafo participa de forma camuflada ou de forma exposta, dependendo do objectivo, na realidade que rodeia o fenómeno, durante um período relativamente extenso. Vendo o que se passa, ouvindo o que se diz, perguntando coisas, ou seja recolhendo todos os tipos de dados acessíveis de forma a desenvolver uma explicação para o fenómeno.

Para estudos assentes em Ethnography as técnicas de recolha de dados primárias devem ser as consideradas naturais, ou seja, as de observação. Podendo ser aplicada observação directa ou observação participante, dependendo dos objectivos do estudo e se o investigador quer correr o risco de influenciar os dados recolhidos ou não.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 66

&lt;page_number&gt;44&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Técnicas de entrevista, questionários ou experimentações podem ser usadas, mas como fontes secundárias, tendo como objectivo confirmar dados já recolhidos de forma natural ou aumentar a validade da informação apresentada.

O desenvolvimento da investigação deve ser sensível e respeitar o ambiente natural do fenómeno. Em estudos sociais é frequente verificar-se a referência ao naturalismo, que pretende insistir que o investigador adopte uma atitude de respeito e apreço para com o mundo social onde se vai inserir durante o período de trabalho.

O investigador deve ter especial cuidado quando o ambiente do fenómeno é um grupo pequeno de pessoas, pois deve conseguir manter um comportamento de distância, antropologicamente falando. Será preciso manter o esforço de não influenciar a cultura dos nativos.

O valor da Ethnography torna-se mais óbvio quando há necessidade de desenvolvimento de teoria, onde é necessário retratar as actividades e perspectivas dos intervenientes do fenómeno. Além de o permitir, a metodologia apresenta-se como sendo um instrumento económico e proporcionador de criatividade.

O tempo que a aplicação da metodologia requer é apontado como a grande desvantagem da Ethnography. Não apenas demora muito tempo realizar o trabalho de campo, como também consome imenso tempo analisar o material recolhido e escrever o estudo (Myers 1999).

A principal diferença entre Case Study e Ethnography é o facto de na segunda metodologia o investigador imergir no ambiente em estudo (Myers 1999).

**2.5.4. DESIGN RESEARCH**

A investigação, como actividade que contribui para a compreensão de um fenómeno, quando assente na metodologia Design Research, parte ou a totalidade do fenómeno é considerado como oposto a um comportamento natural (Lakatos 1978).

Design representa o método que serve como base à criação de algo (DLP 2007). O facto do nome da metodologia conter o termo design não é por acaso. Design está relacionado com a criação de algo novo que não existe de forma natural, como objectos ou artefactos. Apesar deste tipo de actividade existir a séculos é especialmente no último século, que esta actividade

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 67

&lt;page_number&gt;45&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

se começa a reflectir como algo integrado nas profissões. No caso concreto das profissões relacionados com ciência da informação, esta actividade de criar algo novo toma um foco de nível intelectual.

A ciência natural tem como preocupação o conhecimento sobre objectos ou fenómenos naturais ou sociais, com o objectivo de descrever e explicar o comportamento e interacção entre este e o ambiente que o rodeia. A ciência artificial¹ preocupa-se com o conhecimento sobre objectos artificiais² e fenómenos que foram criados para responder a determinados fins (Simon 1996).

Conhecimento é gerado e acumulado pela acção. Fazer algo e avaliar os resultados é a base do modelo de processo da Design Research, funcionando como um ciclo em que o conhecimento é usado para criar trabalho, que por sua vez evolui para a formação de mais conhecimento (Owen 1997).

A Design Research envolve uma análise de uso e de performance, de um ou mais artefactos, que servirá para compreender, explicar e muito frequentemente para melhorar o comportamento. Em SI, alguns dos artefactos estudados são algoritmos e interfaces entre humanos e computadores.

É considerada uma metodologia multi-paradigma, ou seja permite a aplicação de técnicas qualitativas e quantitativas, assim como permite uma análise e interpretação dos dados sobre qualquer uma das epistemologias. Devido a esta característica é habitual verificar uma vasta variedade de tipos de resultados em estudos que recorreram a Design Research.

Para algumas comunidades de investigação Design Research é considerada mais que uma metodologia, é considerada com sendo um complemento às epistemologias Positivist e Interpretative. Este ponto de vista é baseado no facto de investigadores que optam por Design Research aceitarem e estarem confortáveis com alternativas ao mundo que conhecem, pois estudam fenómenos criados pelo homem. Na opinião destas comunidades, este tipo de cenário está fora do enquadramento das epistemologias Positivist e Interpretative, onde o alvo de estudo é um sistema técnico-social.

---
¹ Também conhecida por Ciência do Design.
² Objectos criados pelo homem.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 68

&lt;page_number&gt;46&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Na generalidade das aplicações da Design Research são criados quatro tipos de informações (March and Smith 1995):

*   Construtores;
*   Modelos;
*   Métodos;
*   Instâncias.

Onde os construtores correspondem a vocabulário que constitui a definição do problema ou domínio da solução. Este vocabulário é formado durante a concepção do problema sendo aperfeiçoado ao longo do ciclo de investigação.

Os modelos são conjuntos de pressupostos ou declarações que expressam os relacionamentos entre os construtores identificados.

Métodos são constituídos por conjuntos de passos, necessários de realizar para completar uma determinada tarefa. Os métodos são apresentados sob a forma de planos direccionados para responder aos objectivos do estudo, ora, realizando as declarações identificadas nos modelos apresentados.

O quarto tipo de informação, instâncias, corresponde à implementação do artefacto num ambiente, ou seja inclui o desenrolar da aplicação dos construtores, modelos e métodos.

Esta estrutura apresentada por March and Smith em 1995, foi seguida e implementada por vários investigadores até que três autores de forma colaborativa (Purao 2002; Rossi and Sein 2003), apresentam uma revisão desta estrutura com a adição de um novo tipo de informação designado por Melhores Teorias (ver tabela 10). Na opinião destes autores, este novo tipo de informação tem grande relevância dado que a aplicação de Design Research pode contribuir fortemente para a optimização de metodologias e eventualmente para a formação de novas teorias.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 69

&lt;page_number&gt;47&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<table>
  <thead>
    <tr>
      <th>Tipo de Informação</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cstrutores</td>
      <td>O vocabulário conceptual do domínio</td>
    </tr>
    <tr>
      <td>Modelos</td>
      <td>Conjunto de hipóteses ou afirmações que expressam a relação entre construtores</td>
    </tr>
    <tr>
      <td>Métodos</td>
      <td>Conjunto de passos a usar para realizar as tarefas que gerarão conhecimento</td>
    </tr>
    <tr>
      <td>Instâncias</td>
      <td>A operacionalização dos construtores, modelos e métodos</td>
    </tr>
    <tr>
      <td>Melhores Teorias</td>
      <td>Definição ou redefinição de artefactos, de forma análoga a experiências sobre fenómenos naturais</td>
    </tr>
  </tbody>
</table>

Tabela 10 - Etapas em Design Research

Tipicamente um investigador que adopta a Design Research como metodologia do seu trabalho, valoriza mais a manipulação e o controlo do ambiente e do fenómeno, do que as tarefas habitualmente realizadas, como a perseguição da verdade e a sua compreensão.

As técnicas de investigação a aplicar dependem do fenómeno e dos objectivos do estudo. Numa primeira análise o investigador pode ter de criar a teoria sobre o ambiente que rodeia ou onde vai encaixar o artefacto, assumindo aqui uma posição tipicamente interpretativa e recorrendo a técnicas qualitativas. Mas por vezes o objectivo é mais específico e pretende-se conhecer e relatar o comportamento do artefacto, o que pode levar à alteração da posição filosófica do investigador. Ou seja, nestes casos o investigador pode passar para uma posição positivista, aplicando técnicas de medição e experimentação.

Independentemente das técnicas e das epistemologias seleccionadas, o resultado do trabalho resulta, na larga maioria das vezes, numa comparação do comportamento observado com o comportamento descrito como sendo a natureza do sistema ou artefacto. A interpretação deste resultado pode então tornar-se a base de uma nova teoria, dando início a um novo ciclo do processo Design Research.

As informações apresentadas sobre Design Research ilustram a semelhança entre esta metodologia e a Action Research. A principal diferença está no período de tempo que a Action Research acaba por exigir, devido às interacções sociais, sendo bem mais extenso que o necessário para a aplicação da Design Research. É ainda de salientar que o resultado de investigação, num estudo assente em Design Research, pode ser muito pobre e curto em conteúdo, mas mesmo assim o estudo ser considerado um sucesso para a comunidade onde o investigador está inserido. É habitual na área de SI, que a criação de novos artefactos ou

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 70

&lt;page_number&gt;48&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

modificações de existentes possam produzir altos resultados para esta área. São exemplos disso a identificação de optimizações a algoritmos até então aplicados.

**2.5.5. GROUNDED THEORY**

Todas as investigações são fundamentadas¹ em dados, mas poucas o são com uma teoria fundamentada² (Rhine 2008).

Grounded Theory procurar desenvolver teoria fundada em dados que são sistematicamente recolhidos e analisados. Esta metodologia leva à descoberta, de forma indutiva, de conceitos teóricos acerca do fenómeno em estudo e simultaneamente permite fundamentar os conceitos através de dados ou de observação empírica (Martin and Turner 1986).

A principal característica desta metodologia para com as outras é a especificidade de desenvolvimento de teoria. Grounded Theory sugere que haja um relacionamento contínuo e bidireccional entre recolha e análise de dados.

A metodologia traduz-se num conjunto de procedimentos rigorosos que conduzem à criação de categorias conceptuais. Estas categorias ou conceitos estão relacionados entre si através de uma explicação teórica das acções, realizadas continuadamente sempre com o objectivo de responder ao principal objectivo do investigador. Os resultados da investigação tornam-se válidos porque o processo de criação de teoria está intimamente ligado com evidências sendo muito provável que a teoria resultante esteja consistente de acordo com a observação empírica (Eisenhardt 1989). Grounded Theory pode ser usada tanto com suporte de dados qualitativos como de dados quantitativos.

Os três elementos básicos da Grounded Theory são conceitos, categorias e proposições. Conceitos são unidades básicas de análise, uma vez que é a partir da conceptualização dos dados e não dos dados per si, que a teoria é desenvolvida. O segundo elemento, categorias, é definido por Strauss e Corbin (Strauss and Corbin 1990) “como sendo de um mais alto nível e mais abstractas do que os conceitos que representam. São geradas através do mesmo processo analítico de fazer comparações para realçar semelhanças e diferenças, que é usado para produzir conceitos de baixo nível. As categorias constituem o meio pelo qual a teoria

---
¹ Em inglês grounded.
² Em inglês Grounded Theory.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 71

&lt;page_number&gt;49&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

pode ser integrada”. O terceiro elemento da Grounded Theory são as proposições que indicam relacionamentos generalizados entre a categoria e os seus conceitos e entre categorias discretas, envolvendo relações conceptuais e não relações mensuráveis (Pandit 1996).

A geração e desenvolvimento de conceitos, categorias e proposições são um processo iterativo. A Grounded Theory não é gerada *a priori* para ser subsequentemente testada. Pelo contrário, ela é indutivamente derivada do estudo do fenómeno que representa. Ou seja, é descoberta, desenvolvida e provisionalmente verificada através da recolha e análise sistemática de dados pertinentes a esse fenómeno. Por conseguinte, a recolha de dados, a análise e a teoria devem manter uma relação recíproca entre si. Não se parte de uma teoria para então procurar prová-la. Pelo contrário, parte-se de uma área de estudo e o que é relevante a essa área pode emergir (Strauss and Corbin 1990; Pandit 1996; Varajão 2002).

Uma das premissas da Grounded Theory é que para produzir resultados exactos e úteis, a complexidade do contexto organizacional deve estar incorporada na apresentação da percepção racional sobre o fenómeno e não ser simplificada ou ignorada (Martin and Turner 1986; Pettigrew 1990).

A interactividade da metodologia requer um movimento constante entre dados e conceitos, assim como uma constante comparação entre tipos de evidências, de forma a controlar o nível de conceitos e o âmbito da teoria em desenvolvimento.

Estas características da metodologia são reflectidas na forma de aplicação da mesma:

*   Definição da amostragem;
*   Recolha dos dados;
*   Análise dos dados;
*   Desenvolvimento da teoria.

O primeiro passo da Grounded Theory é a amostragem teórica. Esta consiste na sua essência na selecção de casos particularmente relevantes para o estudo. Em termos práticos, traduz-se em dois eventos de amostragem. Um caso inicial é seleccionado, sendo efectuada uma análise profunda dos dados com vista à sua teorização. Após esse caso, são seleccionados casos adicionais para validar e desenvolver os resultados verificados (Varajão 2002).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 72

&lt;page_number&gt;50&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A selecção dos casos adicionais deve ter em atenção as características de cada um, visto que o objectivo é seleccionar casos que permitam confirmar ou completar os resultados obtidos com a análise efectuada ao primeiro caso, aumentando desta forma a confiança dos resultados. Os casos adicionais podem também produzir resultados contrários, relativamente ao primeiro caso, mas tal deve ser previsível pelo investigador. O objectivo nesta situação é expandir a teoria.

De acordo com o princípio de amostragem teórica, cada caso adicional deverá servir fins específicos dentro do âmbito global da investigação (Varajão 2002). Yin identifica três opções (Yin 1989):

*   Selecção de um caso para completar as categorias teóricas, ou seja, para estender a teoria emergente; e/ou,
*   Selecção de um caso para replicar caso(s) anterior(es ) de modo a testar a teoria emergente; ou,
*   Seleccionar um caso diametralmente oposto de modo a expandir a teoria emergente.

A fase de recolha de dados está concentrada na recolha de material empírico e de documentação. A abordagem Grounded Theory defende a utilização de múltiplas fontes de dados convergindo para o mesmo fenómeno (Varajão 2002).

Glaser e Strauss (Glaser and Strauss 1967) referem que nenhum tipo de dados ou técnica para a sua recolha é necessariamente a mais adequada. Os dados podem ser obtidos recorrendo a entrevistas, observação, pesquisa documental, até à combinação destas diferentes fontes (De Búrca and McLoughlin 1996; Myers 1996; Varajão 2002).

Como fonte de dados escritos podem ser considerados documentos publicados e não publicados, relatórios de actividades de empresas, memorandos, cartas, relatórios, mensagens de correio electrónico, faxes, artigos da imprensa e outros (Myers 1996; Varajão 2002).

A análise de dados é uma fase central no desenvolvimento de teoria. A diferença da Grounded Theory relativamente a outros métodos reside principalmente na forma como a informação é obtida e analisada. Aqui a obtenção de dados e a sua análise procedem simultaneamente (Varajão 2002).

A análise de dados para cada caso envolve a geração de conceitos e é central no desenvolvimento de teoria. Destacam-se dois processos chave nesta fase: a codificação e a

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 73

&lt;page_number&gt;51&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

categorização (Stern 1980). Onde a codificação, que envolve a designação e organização dos dados, serve para denominar, dividir, compilar, conceptualizar e organizar os dados. A categorização, relacionada com os conceitos, é o agrupamento dos conceitos num nível superior, mais abstracto, conseguido pela divisão dos dados através de questões simples como “o quê?”, “como?”, “quando?”, “quanto?”, etc. Subsequentemente, os dados são comparados e os incidentes similares são agrupados conjuntamente e designados pela mesmo nome conceptual.

A última fase, o desenvolvimento da teoria, tem como base um conjunto de códigos focados em categorias, que o investigador tem que reorganizar no desenvolvimento de teoria, ou seja, tem que desenvolver relações entre si. As categorias emergentes, derivadas dos dados, são os blocos de construção básicos para a compreensão teórica da área em estudo (Varajão 2002).

O desenvolvimento teórico é significativamente melhorado por sensibilidade teórica. A sensibilidade teórica consiste num conhecimento da disciplina e num conhecimento profissional, assim como em experiência de investigação e pessoal, que o investigador traz para a sua pesquisa (Strauss and Corbin 1994). Uma fonte rica de sensibilidade teórica pode ser obtida através de uma cuidadosa amostragem selectiva da literatura.

O critério para determinar quando o processo de investigação poderá ser dado como terminado é a saturação teórica das categorias. Glaser e Strauss consideram a saturação teórica alcançada quando não são encontrados dados adicionais através dos quais o investigador possa desenvolver propriedades de uma categoria. Conforme vê instâncias similares consecutivamente, o investigador torna-se confiante que a categoria alcançou a saturação teórica, ou seja, que está estável relativamente a novos dados e rica em detalhe (Varajão 2002).

2.5.6. GROUP FEEDBACK

A metodologia propõe que um pequeno grupo de pessoas se reúna e se possível numa única sessão, o grupo seja questionado sobre o fenómeno e a informação recolhida seja interpretada pelo mesmo grupo. Group Feedback é considerada uma alternativa à metodologia Survey, onde a população abrangida pelo estudo corresponde ao grupo de pessoas definido.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 74

&lt;page_number&gt;52&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O melhor grupo para aplicar Group Feedback é o que representa um microcosmo da comunidade que rodeia ou serve de contexto para o fenómeno. Os membros do grupo podem ser seleccionados pelas suas qualidades como podem ser resultado de uma selecção aleatória (Brown and Heller 1981). O grupo identificado deve reunir algumas condições básicas para que o resultado da sessão de grupo corresponda ao pretendido pelo investigador, nomeadamente:

*   O grupo deve ser suficientemente representativo;
*   Os membros do grupo acordaram com os objectivos propostos para o estudo;
*   Os membros do grupo compreendem as restrições envolvidas.

A sessão de grupo deve contemplar um moderador, que poderá ser o investigador, mas melhor ainda se poder ser uma pessoa ou entidade respeitada na área de estudo, caso o investigador não possua estas características. Uma posição de respeito e confiança para com o moderador facilita o fluir da discussão e atenua eventuais conflitos entre o grupo. Não é aconselhável criar um grupo cujos membros possam ter conflitos ainda não resolvidos entre si, assim como pode ser contra-produtivo que as principais preocupações dos membros não sejam as mesmas ou se reflectam nos objectivos da sessão de grupo (Brown and Heller 1981).

É muito importante que cada membro do grupo se sinta capaz e seguro de contribuir com os seus pontos de vista, da mesma forma que os membros devem ter a capacidade de se ouvirem entre si, caso contrário um consenso genuíno do grupo não será criado. O grupo deve comunicar cooperativamente e não competitivamente. Para conduzir a discussão nesta linha de acções e comportamentos, o moderador deve ter capacidades para tal e sensibilidade suficiente para saber quando arrefecer ou aquecer os ânimos.

A aplicação de Group Feedback é um procedimento interactivo, onde os dados são recolhidos em diálogo com os informadores e por sua vez a interpretação dos resultados é feita pelas mesmas pessoas (Dick 2008). A metodologia é habitualmente aplicada em casos que estudam uma tomada de decisão e os resultados esperados dessa decisão. Por exemplo, procedimentos de trabalho, interface de aplicações ou campanhas publicitárias. Os resultados esperados da decisão tomada são medidos em eficácia, capacidade de utilização e satisfação.

As primeiras aplicações da metodologia foram efectuadas em pesquisas multinacionais, o que praticamente impossibilitava uma reunião presencial entre os membros do grupo. Face a esta dificuldade, a técnica de recolha de dados aplicada eram questionários enviados aos membros do grupo (Brown and Heller 1981).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 75

&lt;page_number&gt;53&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A evolução ocorrida permite hoje um encontro presencial ou em vídeo-conferência entre os membros do grupo. Por outro lado, a sessão entre todo o grupo permite uma discussão aberta sobre o fenómeno, elevando a qualidade e o detalhe dos resultados.

Group Feedback contempla as seguintes fases (Dick 2008):

*   Desenvolver as questões;
*   Conferir as questões;
*   Responder às questões;
*   Discussão;
*   Relatório.

A metodologia é bastante flexível, existindo aplicações onde as questões são criadas pelos membros do grupo e outras que as questões são indicadas pelo investigador. Em alguns casos, é mantido o anonimato das respostas, em outros as respostas são dadas perante todos os membros. As questões podem ser colocadas sobre a forma de conversa aberta ou sobre a forma de entrevista.

A forma de aplicação da metodologia depende dos objectivos do investigador, da sua experiência de moderação e das características dos membros do grupo.

Na primeira fase o objectivo é desenvolver as questões a que se pretende obter resposta, tendo alguns cuidados. As questões devem ser de desenvolvimento e abertas, por exemplo: “Quanto…”, “Quão bem…”, “Para quê…”. Quanto maior for o leque de membros do grupo, menor deve ser a lista de questões e mais específicas devem ser.

Se a conferência das questões for feita perante todo o grupo, a probabilidade de se conseguirem resultados mais estruturados é maior. Nesta situação, com o acordo dos membros, as questões são ordenadas possibilitando desta forma uma linha de raciocínio. Além disso, questões que procuram a mesma informação ou cujas respostas aparentem estar bastante relacionadas são retiradas ou fundidas em outras.

A resposta às questões, seja em forma de entrevista ou em conversa aberta, deve ser dada individualmente por cada membro. Para cada resposta deve ser criado um pequeno sumário, que após a resposta de todas as questões será usado na etapa seguinte, a discussão. É aconselhável que a discussão tenha lugar apenas depois de todas as questões respondidas,

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 76

&lt;page_number&gt;54&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

para que respostas ou opiniões sobre questões anteriores não influenciem respostas seguintes.

Durante a fase da discussão, os sumários das respostas dadas são analisados e é verificado se o grupo está perto de um consenso em algum ponto. Sobre os assuntos onde não há acordo, os sumários são usados como base e forma de despoletar a discussão entre os membros. A discussão tem como objectivo chegar a um consenso sobre cada assunto, de forma colaborativa, através da explicação e compreensão de cada ponto de vista apresentado. Durante a discussão, é descrito os pontos de vista e opiniões sobre cada assunto e no final é verificado se há consenso. Sobre os pontos onde não há consenso é usado o documento criado com os vários pontos de vista e opiniões para a fase final.

A fase final, relatório, propõe apresentar e descrever o consenso do grupo sobre o fenómeno em estudo. Havendo a possibilidade de em alguns pontos, onde não houve concordância, serem apresentados as várias opiniões recolhidas.

### 2.5.7. EXPERIMENTS

A metodologia Experiments apresenta como objectivo, medir os efeitos de X em Y, controlando X e medindo Y, mantendo ao mesmo tempo todo o resto constante (Bristol 2008). Esta definição demonstra que Experiments deve ser conduzida em estudos onde o ambiente seja controlável.

Em Experiments, o objectivo é controlar todas as variáveis relevantes enquanto se altera uma única só, a variável independente. Variáveis relevantes são todas as que interferem com o fenómeno e para que sejam consideradas controladas devem possuir valores constantes. A razão para tal é que se todas as variáveis relevantes estiverem controladas, apenas a variável independente é responsável por alterações sobre a variável dependente, que corresponde ao que se quer medir (Coolican 2004).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 77

&lt;page_number&gt;55&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Existem diferentes formas de aplicação da metodologia, contudo as mais comuns são designadas:

*   True Experiment;
*   Quasi-experiments;
*   Laboratory Experiment;
*   Field Experiment.

Relativamente às duas primeiras estruturas de aplicação, em True Experiment os participantes ou valores são alocados aleatoriamente às condições da experimentação e em Quasi-experiments os participantes são alocados pelo investigador às condições da variável independente (Coolican 2004).

Em Laboratory Experiment, todo o ambiente do fenómeno é artificial, sendo criada uma réplica do original mas contendo a manipulação das variáveis de acordo com o pretendido pelo investigador. Em oposição, Field Experiment ocorre no ambiente natural do fenómeno. Relativamente à estrutura anterior a replicação da experimentação é muito mais fácil enquanto a última estrutura será mais onerosa, particularmente pelo tempo que a investigação consumirá (Coolican 2004).

Pelas características de Experiments a sua aplicação em áreas de ciências sociais é extremamente difícil. Variáveis que representam relacionamentos e comportamentos humanos podem apresentar resultados imprevisíveis. Neste tipo de cenário, enquadram-se os estudos de SIO, onde a influência humana em muito contribui para a avaliação dos sistemas e das suas características.

Contudo, existem situações da área de SI em que a experimentação é viável e por vezes desejável. Frações muito pequenas e específicas dos sistemas aplicacionais apresentam por vezes problemas ou incerteza de resultados. Assim, experimentar algoritmos, processamento de dados ou interfaces ao utilizador pode permitir obter melhores resultados quando colocado o sistema aplicacional num ambiente de produção.

Quanto menos específicas as questões, mais complicada a aplicação de Experiments se torna e menos claras serão as respostas (Haynie 1998).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 78

&lt;page_number&gt;56&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Os resultados obtidos pela experimentação dependem sempre das variáveis envolvidas. Uma experimentação semelhante, mas com variáveis ligeiramente distintas pode apresentar resultados substancialmente diferentes. Às variáveis que causam esta diferença de valores é-lhes dado o nome factores de oposição. Como existem sempre variáveis envolvidas, dependentes ou independentes, existe sempre um risco associado à experimentação, que obriga ao investigador ter alguns cuidados para assegurar a confiança dos resultados.

O investigador deve conseguir identificar quais os factores de oposição que poderão influenciar o estudo e aceitar a existência de uma margem de erro. Alguns dos cuidados a ter é prudência de publicação de resultados de uma única experimentação, muito susceptíveis à desconfiança dos leitores do estudo. Uma forma de confrontar esta situação é o investigador avançar com mais experimentações, planeadas e estruturadas de forma a evitar os mesmos factores de oposição mas aceitando outros. Desta forma será possível reafirmar resultados obtidos na primeira experimentação.

Supondo que o investigador pretende conhecer o efeito que o tempo de consulta de um médico tem sobre a satisfação de um paciente. Nesta situação, o tempo de consulta de um médico é X e a satisfação do paciente é Y. Neste exemplo a aplicação de Experiments iria controlar o período de tempo da consulta e medir a satisfação dos pacientes. Ao mesmo tempo seria necessário tentar manter constante os factores que poderiam afectar a satisfação. Para tal, os pacientes teriam ser todos do mesmo género sexual e pertencerem a um mesmo grupo de idade, por exemplo entre 35 e 40 anos e ainda sofrerem do mesmo tipo de doença ou lesão. Só desta forma se poderia controlar o ambiente para que os resultados apresentassem o menos risco possível. Seguindo o exemplo, se pacientes fossem homens e mulheres, provavelmente haveria diferenças na avaliação de satisfação, assim como se fossem pessoas de grupos etários distintos. Mas o cuidado não seria apenas sobre os pacientes, o médico deveria ser sempre o mesmo, uma vez que a personalidade deste poderia influenciar a satisfação do cliente. No final da experimentação, o investigador seria capaz de indicar se consultas mais longas causam uma maior satisfação do cliente. A especificidade do exemplo apresentado pretende ilustrar algumas das dificuldades e que nem sempre esta metodologia é apropriada (Bristol 2008).

Ao decidir avançar com um estudo suportado por Experiments, o investigador necessita definir qual é o X e o Y. Ao X é dado o nome de variável independente e ao Y variável dependente. O investigador vai controlar a variável independente (X), ainda sobre o exemplo anterior, o investigador decidiria que haveria dois períodos de duração das consultas, de 10 minutos e de

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 79

&lt;page_number&gt;57&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

20 minutos. Quanto à medição da variável dependente (Y) o investigador decide qual ou quais as técnicas de recolha de dados. No exemplo, o investigador poderia decidir usar um questionário que recolhesse quanto satisfeito estava o paciente e no fim de cada consulta solicitar ao paciente que respondesse ao referido questionário.

Com base nos dados recolhidos, o investigador determina os valores de Y e relaciona-os com os valores atribuídos a X.

Uma investigação só pode ser considerada assente em Experiments, se o investigador efectivamente manipular a variável independente. Caso o investigador realize observação das variáveis independente e dependente, o estudo perde a classificação de Experiments.

### 2.5.8. PHILOSOPHICAL RESEARCH

A base da metodologia é Filosofia. Este conceito provém do Grego antigo onde *philos* significa “que ama” e *sophia* “sabedoria”. Filosofia apresenta-se como, o amor à sabedoria, o que levanta duas questões: o que é o amor? o que é sabedoria?

Continuam como dois mistérios que apresentam desafios à sua compreensão. Os Gregos referiram-se por diversas vezes ao significado de filosofia como ganância por sabedoria, luxúria depois da sabedoria e perseguição à sabedoria, sempre com uma conotação de glória pessoal. Sobre “que ama” os Gregos insistiram que dar uma atenção e um cuidado afectuoso seria uma forma inconsciente de chegar à sabedoria (Harris 2001). É neste quadro de pesquisa de sabedoria e de uma grande dedicação à investigação que se apresenta a Philosophical Research.

As principais características da metodologia apontam-na como indicada para estudos de teorias. A aplicação da Philosophical Research诱导 numa análise compreensiva e meticulosa sobre os objectivos críticos do estudo apresentada em texto muito bem escrito e forma clara.

Relativamente à área de SI esta metodologia é usada para apresentar novas interpretações de relacionamentos e de interacções de pessoas com artefactos relacionados com tecnologia. Tal acontece em muito devido à constante e cada vez mais rápida actualização dos itens tecnológicos, que por um lado tornam obsoleto a geração anterior dos equipamentos e das aplicações e por outro lado permitem gerar novos comportamentos nos seus utilizadores.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 80

&lt;page_number&gt;58&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O investigador tem de reavaliar constantemente o seu conhecimento, pois a evolução apresenta novos factores e novos problemas a considerar sobre o conhecimento prévio. Com esta posição o investigador agarra em conhecimento válido e tenta apresentar uma nova interpretação de acordo com o que vai encontrando ao longo do trabalho. Esta posição pretende também impossibilitar de iniciar a investigação com pressupostos de uma solução pré-concebida e alinhar o investigador com a perspectiva de olhar para o problema com o senso comum e de uma forma abrangente ou completa (Pitt 1996).

Philosophical Research permite ao investigador usufruir de três particularidades que outras metodologias não oferecem: inclusividade, advocacia e liberdade (Harris 2001).

A inclusividade dá ao investigador a possibilidade de incluir sabedoria de sua própria fonte e torná-la acessível a todos que a valorizam. Advocacia refere que o investigador é advogado de si mesmo, visto que a metodologia não requer, nem o endosso, nem ser partidário de alguém, comunidade ou tradição específica. A liberdade indica um processo de descoberta que o investigador realiza sendo livre de comparar e referenciar o seu conhecimento natural com as mais íntimas e próprias expressões e opiniões.

Estas condições dão ao investigador o privilégio de não ficar preso pelo tempo. É a sua disponibilidade que dita o quanto longo e extenso será o seu estudo.

A forma de escrita e a estrutura do estudo contém grande importância nesta metodologia, onde cada capítulo deve apresentar e seguir uma lógica de trabalho e de raciocínio que reflecte a estrutura base e planeada do estudo e cuja informação deve ser de fácil interpretação, limpa e fluída. Os capítulos iniciais devem ser utilizados para apresentação da história, da filosofia da ciência e lógica de dedução que está por detrás do fenómeno. Os capítulos seguintes devem ilustrar o desenvolvimento da teoria de forma bem fundamentada.

Habitualmente Philosophical Research está relacionada com descoberta e criatividade, tal como a base de novos conceitos. Mantendo a perspectiva da metodologia, o investigador não deve fundamentar a teoria com conhecimento ainda inconsistente. Os resultados da metodologia são usados como espinha dorsal ou ponto de partida para novos conhecimentos (Batens 2006).

O investigador que de alguma forma se coloca numa posição de filósofo recorre a técnicas de experimentação e de observação para fundamentar o conhecimento da sua nova teoria. Para a apresentação da base do raciocínio e da informação que contextualiza o fenómeno, o

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 81

&lt;page_number&gt;59&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

investigador recorre a técnicas de Archival Research, usando conhecimento considerado válido como pilar da investigação.

### 2.5.9. SURVEY

Survey é uma metodologia usada para passar da observação à validação de teoria, em que o objectivo mais comum dos investigadores de SI é determinar os relacionamentos do fenómeno, de forma entender o comportamento que envolve e rodeia um sistema aplicacional. Como consequência, a aplicação da metodologia requer uma atenção detalhada sobre o contexto do fenómeno.

O histórico da metodologia permite concluir que Survey é apropriada apenas em determinadas condições. Contudo, a metodologia permite criar tanto investigação positivista como investigação interpretativa. Quando o investigador pretende determinar os valores de variáveis em estudo e a resistência de relações entre elas, a metodologia deve ser conduzida numa epistemologia positivista. Se por outro lado, o investigador tenciona complementar outras fontes de dados ou formas de recolha, Survey é bastante útil como técnica de triangulação e nesta situação deve ser aplicada com um objectivo de estudo assente numa epistemologia interpretativa (Newsted, Chin et al. 1997). Assim, Survey pode ser usada numa abordagem quantitativa de investigação como também numa abordagem qualitativa.

A palavra Survey não é na maioria das vezes usada para identificar a metodologia, mas sim a técnica de recolha de dados que contempla um conjunto de questões que são colocadas a uma amostra da população em estudo. A técnica que pode ser usada para vários propósitos também pode ser aplicada de várias formas como, por exemplo, telefone, e-mail ou presencialmente (Scheuren 2008). Em muitos aspectos a técnica e a metodologia partilham de características e misturam-se de tal forma que é difícil separar estes conceitos. A metodologia Survey apresenta algumas características que podem ser classificadas como vantagens e desvantagens.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 82

&lt;page_number&gt;60&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Como pontos fortes pode-se considerar:

*   Fácil aplicação;
*   Simples de codificar e de pontuar;
*   Permite determinar valores e relações entre variáveis e fenómeno;
*   As respostas podem ser generalizadas a outros membros da população estudada e por vezes a populações similares;
*   Permite reutilização dos questionários;
*   Permite comparação de respostas entre diferentes grupos, datas e locais;
*   Permite prever comportamentos;
*   Permite testar proposições teóricas de uma forma objectiva;
*   Permite confirmar e quantificar resultados de investigação quantitativa.

Os pontos fracos apontados para esta metodologia são:

*   Os dados obtidos reflectem o comportamento num determinado local num determinado momento;
*   Os resultados dificilmente são válidos em diferentes contextos. Não se deve negligenciar a diversidade de culturas que produzirão diferentes resultados;
*   Não providencia uma descrição rica ou detalhada da situação em estudo;
*   Não providencia evidências fortes de que a investigação efectuada sobre o fenómeno tenha sido bem elaborada.

A aplicação da metodologia pode, de uma forma genérica, ser delineada por quatro fases (Chin 1996):

*   Transformação de respostas observadas em questões singulares;
*   Agregar em escala as questões definidas;
*   Aplicar fórmulas numéricas aos valores das respostas;
*   Construir representação concepcional do fenómeno medido de acordo com resultado das fórmulas.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 83

&lt;page_number&gt;61&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Com recurso à tecnologia disponível e a ferramentas aplicacionais é possível automatizar alguns dos passos da metodologia, contudo alguns cuidados devem ser tomados, em especial na análise das variáveis que interagem com o fenómeno, que podem ser esquecidas ao enveredar por uma aplicação automatizada do Survey (Webster and Compeau 1996).

Caso o investigador não tenha referido explicitamente que as respostas obtidas sejam de conhecimento público e seja identificável o inquirido, a confidencialidade dos dados deve ser a principal preocupação. Existe legislação que obriga o investigador a garantir que os dados recolhidos serão confidenciais, independente da técnica de recolha. Além da obrigação legal é de boa ética que o investigador antes de iniciar o questionário clarifique estas questões e os objectivos dos dados ao inquirido.

Como sugestões relativas à confidencialidade (Scheuren 2008):

*   Usar apenas códigos numéricos para relacionar inquiridos com questionário;
*   Guardar a relação nome do inquirido com informação de respostas numa base de dados separada das respostas;
*   Recusar dados como nomes ou moradas dos inquiridos a alguém;
*   Destruir os questionários e outras informações que identifiquem os inquiridos após passagem da informação para base de dados;
*   Omitir nomes e moradas dos inquiridos nos ficheiros usados para análise de dados;
*   Apresentar os resultados em categorias num nível suficiente que não permita identificar indivíduos.

2.5.10. ARCHIVAL RESEARCH

Fontes de dados consideradas de arquivo permitem um acesso directo ao momento ou ao evento sob estudo (Caseñas and Kalsbeek 2006). Pesquisa efectuada sobre este tipo de materiais oferece:

*   Melhor compreensão sobre o fenómeno;
*   Aplicar o conhecimento e experiência numa área específica;
*   Desenvolver ideias próprias;
*   Obter um conhecimento real acerca do âmbito do fenómeno.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 84

&lt;page_number&gt;62&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Archival Research apresenta como foco na investigação, a examinação de documentos históricos seguida de análise de dados registados. Todos os dados são examinados após a ocorrência do facto (Jenkins 1985).

A pesquisa da informação recai sobre recursos primários, normalmente criados no momento da ocorrência do evento ou facto sob estudo. Este tipo de recursos é considerado evidências directas ou registos em primeira mão de eventos históricos, em que não ocorreu alguma análise ou interpretação.

Recursos secundários referem-se aos recursos que já sofreram alguma interpretação ou análise anterior. Habitualmente são descrições, sumários, análises ou avaliações derivadas dos recursos primários.

Antes de mergulhar na recolha de dados de recursos primários, apresentados na tabela 11, é importante que o investigador tenha uma base de compreensão do assunto em estudo. Essa compreensão é conseguida através de pesquisas e análises de recursos secundários que permitem compreender o contexto histórico dos recursos primários.

<table>
  <thead>
    <tr>
      <th>Recursos Primários</th>
      <th>Recursos Secundários</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Diário</td>
      <td>Artigo que explica a importância e o contexto do diário</td>
    </tr>
    <tr>
      <td>Cartas de um soldado para a sua mãe durante a guerra</td>
      <td>Artigos de livro ou enciclopédia sobre a guerra</td>
    </tr>
    <tr>
      <td>Manuscritos ou ilustrações originais de um livro de crianças</td>
      <td>Biografia ou artigos sobre o autor do livro</td>
    </tr>
    <tr>
      <td>Registos de dados de negócio de uma empresa (registos dos RH, registos de bases de dados)</td>
      <td>Artigo de jornal ou livro com o desenvolvimento histórico da empresa</td>
    </tr>
  </tbody>
</table>

Tabela 11 - Recursos em Archival Research

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 85

&lt;page_number&gt;63&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A metodologia aconselha o investigador a ter em mente durante a pesquisa de dados três questões essenciais (Caseñas and Kalsbeek 2006):

*   Quando – Ter definido um intervalo de datas em que seja possível encontrar informação relevante. Dados encontrados fora do intervalo de datas podem ser descartados;
*   Onde – A pesquisa deve ser focada em locais ou secções específicas. Áreas fora do âmbito definido não necessitam de ser analisadas;
*   Quem – Se possível, o investigador deve saber sobre quem (pessoa, família, grupo ou comunidade) procura informações.

A presença destes três pontos de referência permite ao investigador incidir sobre o que realmente interessa e afasta-o de pesquisas infrutíferas e fora do âmbito, especialmente se o investigador recorrer a espaços onde abunde informação, como bibliotecas ou arquivos.

Durante a pesquisa de dados relevantes para o estudo, o investigador encontra muita informação que embora irrelevante para a investigação, interessa ao indivíduo num foro pessoal ou por esta estar relacionada com a sua actividade profissional. É demasiado fácil o investigador dispersar no seu trabalho de pesquisa e sair do âmbito a que se propôs. Embora a informação que recolhe o possa enriquecer como pessoa e noutros perfis, relativamente ao estudo, tempo acaba por ser desperdiçado. Algumas dicas a seguir durante a aplicação da Archival Research são:

*   Tentar restringir a materiais referenciados em informação relacionada com o fenómeno;
*   Dar especial atenção a notas de rodapé e a bibliografias quando a pesquisa incide sobre documentos publicados;
*   Efectuar pesquisas limitadas a palavras-chave relacionadas com o fenómeno;
*   Iniciar as pesquisas a partir de índices, sejam de documentos, registos ou bases de dados.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 86

&lt;page_number&gt;64&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

2.5.11. FIELD STUDY

Field Study é uma metodologia que recorre a técnicas de recolha não experimentais que ocorrem no ambiente natural. Os investigadores que recorrem a Field Study não manipulam variáveis independentes nem controlam a influência de variáveis relevantes (Boudreau, Gefen et al. 2001).

Esta metodologia através de recolha de dados, testes sobre hipóteses e inquéritos sobre o campo de acção, estende as oportunidades de aprendizagem e compreensão do fenómeno (Centre 2008).

Esta forma de investigação, centrada numa observação directa, permite uma grande envolvência do investigador ao possibilitar captar características do ambiente contextual que de outra forma não seriam compreendidas. Field Study torna-se assim uma metodologia bastante eficiente, que apesar da tendência de conduzir a um consumo excessivo de tempo, encaminha o investigador para uma posição de forte tentativa de resolver o problema, uma vez que este coloca grande atenção na descrição e explicação do fenómeno, graças aos elementos observados.

Durante a realização da investigação, perante o problema em estudo, são formuladas hipóteses, estruturada a forma de investigação, recolhidos e analisados os dados, interpretados os resultados e identificadas conclusões que resultam da aceitação ou rejeição das hipóteses originais. O encadeamento destas tarefas e a forma como são realizadas dependem sempre dos objectivos e das circunstâncias do estudo, mas habitualmente cai numa de duas estruturas de investigar através de Field Study, o método dedutivo e o método indutivo.

No método dedutivo são gerados objectivos e hipóteses baseadas num conhecimento teórico, prévio ao trabalho de campo. Neste sentido, o trabalho que se desenvolve parte do geral e caminha para o específico. O investigador começa com uma teoria que é narrada com hipóteses específicas, possíveis de testar e com descrição de formas de recolha de dados a aplicar nas hipóteses. O estudo termina com testes às hipóteses com dados recolhidos e com a aceitação ou negação da teoria original (Centre 2008).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 87

&lt;page_number&gt;65&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A figura 9 apresenta as etapas associadas à estrutura dedutiva desta metodologia.

<mermaid>
graph TD
    A[Teoria] --> B[Hipóteses]
    B --> C[Recolha de dados]
    C --> D[Análise de dados]
    D --> E[Confirmação / Negação de hipóteses]
</mermaid>

Ilustração 9 - Etapas na estrutura dedutiva de investigação Field Study

Com o método indutivo os assuntos são analisados, questões são criadas e o trabalho desenvolve-se a tentar encontrar possíveis respostas às questões. O encadeamento das tarefas aponta para o oposto do método dedutivo, indo de observações específicas à criação de generalizações e de teorias (ilustrado na figura 10). Partindo da exploração de áreas específicas através do registo de observações e respectivos dados, seguida de uma análise aos dados que permitirá identificar padrões e a formulação de hipóteses a testar, terminando com o desenvolvimento de teoria de acordo com as hipóteses formuladas (Centre 2008).

<mermaid>
graph TD
    A[Observação] --> B[Recolha de dados]
    B --> C[Análise de dados]
    C --> D[Identificação de padrões]
    D --> E[Formulação de hipóteses]
    E --> F[Teoria]
</mermaid>

Ilustração 10 - Etapas na estrutura indutiva de investigação Field Study

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 88

&lt;page_number&gt;66&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O método indutivo, devido à sua natureza, é mais exploratório e permite uma investigação mais aberta. Por sua vez, o método dedutivo apresenta-se mais narrativo e tende a focar o trabalho em testes ou confirmação de hipóteses.

Embora a metodologia possibilite a aplicação de diferentes técnicas de recolha de dados, as que limitam a aproximação ao contexto real do fenómeno e transmitem análises ou opiniões em segunda mão não são recomendadas, uma vez que não permitem ao investigador ir além do processo de recolha de dados. Field Study pretende que o investigador passe para o lado de lá. Nunca deixando de ser o investigador, se insira no contexto real, sendo capaz de compreender o comportamento e as razões de acções ou actos do fenómeno. Técnicas como Interview e Focus Group nem sempre se mostram úteis, pois não fornecem o tipo de informação necessária para especificar o fenómeno contextualizado com o que o suporta e com o que requer (Straub, Gefen et al. 2005). Em adição a técnicas de entrevista ou de questionários, caso o investigador as aplique, o trabalho deve recorrer a técnicas de observação que permitam contactar com o comportamento do fenómeno.

Na área de SI são exemplos de aplicação de Field Study, projectos de desenvolvimento de Intranets e aplicação de integração de dados, que por serem tão específicos e particulares à organização, apenas um estudo Field Study permitirá uma identificação detalhada dos requisitos de desenvolvimento (Nielsen 2002).

É frequente a dificuldade de separação das metodologias Field Study e Case Study. Um trabalho que analisa exaustivamente e com grande detalhe um pequeno número de casos, sob a mesma perspectiva e de acordo com as mesmas regras, aplica Case Study. A morosidade e a intensidade de estudos Case Study não permitem abranger mais que um ou dois casos. Um número superior como, por exemplo, nove casos, é claramente um estudo Field Study, visto que o elevado número de casos aponta para recolha e análise de dados relativos a características específicas de uma pequena área (Straub, Gefen et al. 2005).

Field Study contempla a recolha de dados de uma amostra, identificada por conveniência, da população que enquadra o fenómeno (Straub, Gefen et al. 2005).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 89

&lt;page_number&gt;67&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

2.5.12. OPINION RESEARCH

Opinion Research induz à recolha de dados de atitudes, opiniões, impressões e crenças de indivíduos, conseguida através meios de interrogação, como questionários, entrevistas ou outras técnicas. A metodologia permite testar hipóteses identificadas *a priori*, assim como a generalização de hipóteses, devido à sua abordagem iterativa (Jenkins 1985).

A metodologia traduz-se num levantamento estatístico de uma amostra particular da população onde está inserido o fenómeno. As questões colocadas à amostra de população são estruturadas de forma que possam representar a opinião da população, cujas respostas são então extrapoladas para um grupo maior, dentro de um intervalo de confiança.

Opinion Research enquadra-se numa abordagem quantitativa, visto que os resultados são pontuados e posteriormente analisados de forma estatística. Os exemplos mais conhecidos de aplicações da metodologia estão relacionados com processos eleitorais e de selecção de produtos. Na área de SI, Opinion Research é habitualmente aplicada em processos de decisão relativamente a mudanças de sistemas existentes e em confronto de decisões já tomadas.

As características da metodologia criam alguns factores de risco que o investigador deve tentar minimizar e se possível eliminar. O facto de se trabalhar sobre amostragem de população e não sobre a generalidade da comunidade apresenta a incerteza dos resultados. Noutra vertente, as fontes de dados são pessoas, que transmitem o seu ponto de vista na forma de respostas a questões que lhe são colocadas. Ora, é importante que as questões sejam formuladas no sentido de conduzir a respostas produtivas e que permitam atingir os objectivos do estudo. São cinco os riscos identificados e que se devem reflectir em cuidados a ter pelo investigador:

*   Sondagem e amostra;
*   Inexactidão;
*   Efeitos de não-resposta;
*   Efeitos de resposta;
*   Redacção de questões;
*   Âmbito da amostra.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 90

&lt;page_number&gt;68&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O investigador tem de identificar o público-alvo do seu estudo. Como na larga maioria das situações não é viável abranger toda a população, devido ao elevado número de indivíduos que a compõe, ou pelos custos que tal implicaria, é necessário identificar as características relevantes para o estudo. Aplicando essas características como filtro, o investigador pode optar por disponibilizar o instrumento a usar para interrogatório e quem estiver interessado responder. Em alternativa, solicitar a um indivíduo a participação no processo de interrogação.

Quase sempre esta selecção é dita pela comunidade a que se destina o estudo. Se numa determinada área a comunidade aceita e considera mais credível a aplicação do questionário ou entrevista pessoalmente ou por telefone, o investigador opta por solicitar a participação aos membros da amostra. Se a comunidade considera válidas respostas a questionários colocados através de meios de Internet, então o investigador pode optar por disponibilizar o questionário num sítio Web e indicar junto da população a voluntariedade de participação ou enviar directamente a uma amostra identificada o endereço de acesso e resposta ao questionário. A disponibilização do instrumento de questionário e apelo à voluntariedade da população permite uma reflexão mais credível dos interesses e opiniões da população. A exactidão dos resultados será menor quando uma amostra é identificada (Stone 1981).

Uma forma de reduzir a inexactidão dos resultados é implementar uma *tracking poll*. Este método manifesta-se na repetição periódica dos questionários, em que os dados recolhidos na última acção de interrogação são actualizados pela nova acção. Esta mudança ao longo do tempo permite a correcção de resultados e aumenta a exactidão do estudo (Stone 1981).

A aplicação da metodologia a amostras de população está sujeita ao denominado erro de amostragem, que reflecte os efeitos de incerteza associados ao processo de identificação da amostra. O erro de amostragem é expresso através de uma margem de erro que é geralmente definida como o raio de um intervalo de confiança para uma determinada estatística a partir de um questionário. A margem de erro é minimizada aumentando o número de indivíduos da amostra. Especialistas nos processos de amostragem referem que relativamente a toda a população do país, uma amostra de 1000 indivíduos apresenta uma margem de erro de 3%. Para diminuir a margem de erros a 1%, a amostra deve contemplar pelo menos 10.000 indivíduos (Stone 1981). Outra forma de reduzir a margem de erro é assentar o estudo em médias de bolsas de inquiridos. O processo da metodologia é aplicado a várias bolsas, funcionando com várias amostras da mesma população e aos resultados obtidos é determinada a média de valores (Stone 1981).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 91

&lt;page_number&gt;69&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Um processo de interrogação com vários registos sem resposta cria um estudo que não é representativo da população. As opiniões e impressões dos inquiridos que terão respondido desviam os resultados do estudo nesse sentido, em declínio de eventual posição dos que não responderam. Nestas situações o alargamento da amostra não significa que a margem de erro dos resultados seja menor. Se os inquiridos que recusaram participar tiverem as mesmas características dos que aderiram ao estudo, os resultados devem ser fiáveis, mas se as características dos indivíduos eram diferentes, a inexactidão dos resultados existe e tão grande quanto o número de inquiridos que recusaram participar. Optar por *tracking poll* reduz a inexactidão de resultados, mesmo com registos sem resposta.

O facto de haver uma alta participação dos inquiridos, não significa que os resultados sejam exactos. As respostas dadas podem não reflectir as verdadeiras opiniões e crenças do indivíduo. Esta situação pode ocorrer quando as questões estão formuladas para conduzir os resultados num determinado sentido, de forma consciente ou inconsciente. Para evitar esta situação, o investigador deve ter precauções na formulação e apresentação das questões e não colocar o inquirido sob pressão.

O histórico de aplicações da metodologia indica que a redacção das questões, a ordem pela qual são colocadas, o número de questões e abertura da questão a respostas abertas, influenciam os resultados obtidos. Uma redacção das questões ligeiramente diferente pode causar respostas amplamente diferentes. A redacção das questões dever ser de fácil interpretação, directa e não permitir respostas abertas ou desviadas do pretendido. Relativamente à ordem das questões, o investigador pode optar por trocar a ordem ao longo da participação dos inquiridos (Stone 1981).

Uma fonte provável de erro é o âmbito da amostra definida. O processo de identificação da amostra deve ser extremamente cuidadoso, de forma a garantir que as características da amostra são representativas da população sob estudo, caso contrário os resultados não serão representativos da população mas sim e apenas da amostra. Este risco é de elevada importância porque pode invalidar toda a investigação assente em Opinion Research.

**2.5.13. NUMERIC METHODS**

Numeric Methods modela a realidade e escalona os resultados, tal como as equações matemáticas. É um processo determinístico e fechado onde todas as variáveis conhecidas,

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 92

&lt;page_number&gt;70&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

independentes e dependentes, são incluídas no modelo. Não é possível alterar os valores das variáveis e nenhum factor social é necessário (Jenkins 1985).

A metodologia procura estruturar a investigação de forma que seja possível criar teoria com base numa análise de grande rigor sobre um problema que se pode representar de uma forma matemática.

Técnicas de análise matemática existem a mais de 2000 anos, das quais se destaca a Interpolação Linear. As grandes preocupações dos matemáticos incidiam sobre os algoritmos de maior renome como Método de Newton ou Eliminação de Gaussian. Para facilitar os cálculos, produziam livros com enorme quantidade de conteúdos, onde se apresentavam as fórmulas e tabelas de dados conhecidas. O desenvolvimento de uma calculadora mecânica mostrou-se uma ferramenta de grande utilidade para a realização dos cálculos, mas foi com a evolução para computadores electrónicos que os cálculos de análises matemáticas ganham grande visibilidade e credibilidade. As análises a realizar sobre os valores das variáveis, podem ser feitas num curto espaço de tempo e permitem chegar a valores muito aproximados da exactidão (Solutions 2008).

O estudo que se faz sobre as análises matemáticas é hoje considerado uma técnica de análise de dados, denominada por análise numérica. Devido à evolução tecnológica que se reflectiu na forma em como a análise numérica é realizada, praticamente não existe separação entre Numeric Methods e análise numérica.

A aplicação da metodologia tem como pilares a adequação do problema a uma estrutura de equação matemática e a realização da análise numérica aos valores das variáveis conhecidas. A aplicação da técnica de análise recorre a uma aplicação específica para o efeito, o que permite ao investigador um conhecimento muito menor das fórmulas a usar para analisar os valores, mas em contrapartida um conhecimento sólido da configuração e parametrização das aplicações. Embora qualquer aplicação folha de cálculo possa ser usada na resolução de problemas de análise numérica, as vantagens são imensas quando se pode recorrer a uma aplicação específica:

*   MatLab;
*   S-Plus;
*   LabView;

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 93

&lt;page_number&gt;71&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

*   IDL;
*   Scilab;
*   FreeMat;
*   GNU Octave;
*   IT++;
*   R programming language.

O principal objectivo da metodologia é conseguir determinar soluções com valores aproximados, quase exactos, para problemas de extrema complexidade, tais como (Harding and Quinney 1986):

*   Criar previsões de tempo;
*   Definir a trajectória de naves espaciais;
*   Permitir simulações de acidentes de automóveis;
*   Optimizar a gestão de fundos de investimento.

Habitualmente na área de SI, o recurso a Numeric Methods acontece quando se necessita de compreender a análise numérica para desenvolvimento de aplicações específicas, estabilidade de algoritmos ou eliminação de erros de aplicações. Na área de TI a metodologia tem tido muitas aplicações em projectos relacionados com requisitos de memória e de processamento, computação de alta performance, computação paralela e desenho de novas arquitecturas.

A análise numérica não procura respostas exactas, porque estas são impossíveis de obter, face ao tipo de problemas em estudo. Em vez disso, procura obter as soluções mais aproximadas à exactidão mantendo uma margem de erro aceitável. A técnica considera a modelagem do erro através do processamento de métodos numéricos e a subsequente readaptação dos métodos aos dados obtidos.

As aplicações que permitem a realização de análise numérica, depois de parametrizados os valores e variáveis que definem o contexto do fenómeno, aplicam funções matemáticas sobre os valores introduzidos, de forma directa ou de forma iterativa. Às funções aplicadas de forma directa é parametrizado um número finito de ciclos da função, que como resultado deverá indicar um valor aproximado à solução real. Em contraste, as funções aplicadas de forma

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 94

&lt;page_number&gt;72&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

iterativa não terminam após um determinado número de ciclos ou etapas. As funções efectuam sucessivas aproximações que apenas convergem para a solução exacta no limite.

Na análise numérica, existem várias formas de interpretação e consequente método de aplicação de funções matemáticas (Harding and Quinney 1986). Em alguma literatura, são referidas como áreas de estudo, em outras como disciplinas. Na prática, são diferentes formas de encarar o problema:

*   Interpolação;
*   Extrapolação;
*   Regressão;
*   Optimização;
*   Equações diferenciais.

Os resultados do estudo serão sempre uma aproximação aos valores exactos das variáveis relevantes para o fenómeno. O conceito de aproximação é causado pelas diversas causas de erro que podem acontecer (Anderson, Dahlquist et al. 2003). Com destaque:

*   Erros nos dados de entrada (medidos das variáveis);
*   Erros de arredondamento durante a realização dos cálculos;
*   Erros de truncamento;
*   Simplificações da função matemática;
*   Erros humanos e de máquina.

Todas as possíveis fontes de erro devem ser anotadas e analisadas, para que o investigador as referecie e as tenha em conta nos resultados obtidos. Para minimizar os erros, o investigador deve proceder ao máximo de ajustes nas fontes de erro e criar rotinas de verificação (Anderson, Dahlquist et al. 2003).

Para a maioria dos métodos numéricos aplicados, a qualidade da solução encontrada depende da quantidade de dados analisados (Anderson, Dahlquist et al. 2003).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 95

&lt;page_number&gt;73&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

## 2.5.14. FORMAL METHODS

A aplicação de Formal Methods incide em fenómenos relativamente pequenos, mas complexos. A área de *hardware* tem dominado os estudos que recorrem a esta metodologia e é na área que se encontram os exemplos mais significativos.

Em SI, Formal Methods aplica-se a pequenos sistemas, mas críticos para a organização (Joseph 2005). O facto de a maioria dos fenómenos ter uma dimensão pequena advém da necessidade da metodologia exigir especificação e verificação do sistema sob estudo.

Existem várias técnicas associadas à metodologia e cada uma tem as suas características próprias. Por exemplo, a técnica indicada para identificar especificações incompletas ou inconsistentes, para um sistema aplicacional é a Verificação de Modelo. Por outro lado, técnicas transformativas podem ser muito eficientes para a modelação de código e para a geração de código a partir de modelos de desenvolvimento. Para efectuar testes à aplicação desenvolvida são aconselhadas técnicas de Análise de Programa (Joseph 2005).

Mesmo durante a fase de manutenção de um sistema aplicacional é possível aplicar técnicas associadas a Formal Methods. Nesse cenário, o projecto pode passar pelas seguintes actividades:

*   Correctiva – Dedica-se à correcção de erros descobertos durante o uso da aplicação;
*   Adaptativa – Quando é necessário efectuar alteração ao sistema para se adaptar a um novo ambiente de produção;
*   Reforço – Consiste na adição de novas funcionalidades;
*   Melhoria – Quando se optimiza o software para uma maior robustez e estabilidade.

Estima-se que o custo de manutenção de software possa ser até 90% do custo do ciclo de vida do mesmo sistema aplicacional. Esta realidade reclama por alterações e optimizações nas técnicas de alterações de software para que possam diminuir as acções correctivas. A aplicação de Formal Methods na área de SI pode garantir maiores ganhos e a concepção de aplicações mais profissionais (Joseph 2005).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 96

&lt;page_number&gt;74&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Formal Methods consiste na aplicação de técnicas baseadas em métodos matemáticos que podem contribuir para fiabilidade e robustez de um artefacto (Holloway 1997). O custo elevado de recorrer a esta metodologia tem limitado a sua aplicação ao desenvolvimento de sistemas que requeiram alta integridade (Archer, Heitmeyer et al. 2002).

A metodologia quando aplicada, é-o a um determinado nível do ciclo de vida do artefacto. Os níveis de aplicação são apresentados tabela 12:

<table>
<thead>
<tr>
<th></th>
<th>Designação</th>
<th>Descrição</th>
</tr>
</thead>
<tbody>
<tr>
<td>Nível 0</td>
<td>Especificação formal</td>
<td>A metodologia é aplicada antes do desenvolvimento verificando lacunas ou erros aos requisitos identificados. Por permitir a identificação de uma melhor base de trabalho, é considerada a mais vantajosa.</td>
</tr>
<tr>
<td>Nível 1</td>
<td>Desenvolvimento formal</td>
<td>Usada para permitir a produção de um artefacto mais formal e profissional.</td>
</tr>
<tr>
<td>Nível 2</td>
<td>Verificação de teorema</td>
<td>Permite uma verificação mais completa de testes. Este tipo de aplicação é habitualmente moroso, sendo apenas vantajoso quando é crítico a existência de eventuais erros.</td>
</tr>
</tbody>
</table>

Tabela 12 - Níveis de aplicação de Formal Methods

A metodologia recorre a métodos estatísticos e quantitativos para verificar a existência e qualidade de princípios ou regras. Formal Methods quando aplicada na área de economia, tenta combinar teorias da área com estatísticas para analisar e testar relações económicas. Devido à especificidade da área e à popularidade das aplicações da metodologia, na comunidade de economia Formal Methods ganha o nome de Econometrics.

Os métodos aplicados para análise dos dados representam os modelos padrão de estatística, com algumas características específicas da área do fenómeno.

Os dados a introduzir no software que realizará a análise estatística são normalmente resultado de uma técnica de observação. O investigador deve inserir os dados na aplicação simulando os relacionamentos existentes entre dados e as condições que condicionam o fenómeno. A aplicação recorrerá a métodos estatísticos de identificação, estimativa e a

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 97

&lt;page_number&gt;75&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

métodos equacionais, produzindo resultados que permitirão ao investigador aferir pontos descurados.

Existem vários métodos estatísticos suportados por aplicações de análise estatística, contudo os mais populares são o VDM e o Z Notation (Harry 1997). Para sucesso dos resultados do estudo, o investigador deve decidir qual o melhor método a usar no seu projecto. Para isso é necessário que analise as características de cada método e as confronte com os objectivos a que se propõe, identificando assim os constrangimentos existentes em cada método relativamente ao seu trabalho (Europe 2008).

**2.6.TÉCNICAS DE INVESTIGAÇÃO**

No âmbito de uma qualquer metodologia a investigação requer a recolha de dados através de uma ou mais técnicas. A decisão de aplicar mais que uma técnica depende da metodologia aplicada, das fontes de dados disponíveis e das necessidades que a teoria a criar requer para a sua validade.

Tipicamente, o investigador decide por uma ou múltiplas técnicas de recolha de dados considerando a sua adequação à investigação, em conjunto com outros factores como a qualidade esperada dos dados recolhidos, custos estimados, percentagem esperada de não-respostas e o período que a técnica exige para a sua aplicação (Lyberg and Kasprzyk 1991).

É possível que determinadas questões da investigação não sejam tão estudadas como desejado, porque devido à especificidade dos dados a técnica necessária para a recolha de dados pode não existir (Kerlinger 1986).

A aplicação de técnicas de recolha enquadra-se no conjunto de etapas requeridas para o desenvolvimento da investigação. As etapas, estreitamente relacionadas com a (ou as) metodologia adoptada no projecto, de uma forma genérica são três, como ilustrado na figura 11.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 98

&lt;page_number&gt;76&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Orientação metodológica da investigação
Análise e Síntese

<mermaid>
graph LR
    A[Orientação metodológica da investigação] --> B[Recolha de Dados]
    B --> C[Análise e Síntese]
</mermaid>

**Ilustração 11 - Enquadramento de técnica na investigação**

Na etapa inicial existe um vasto conjunto de tarefas que são realizadas, onde se inclui a definição da metodologia, estipulação da estratégica para o desenvolvimento do projecto e preparação dos instrumentos de investigação.

Durante a recolha de dados podem ser aplicadas várias técnicas, de forma isolada ou conjunta. Em geral a literatura da metodologia aponta para um grupo de técnicas mais restrito, por se considerarem mais adequadas e já apresentarem sucesso comprovado em estudos anteriores.

Obtidos dados, na terceira etapa o investigador terá de aplicar regras, instrumentos e identificar relacionamentos entre os dados de forma definir ilações que serão apresentadas como resultado do estudo, maioritariamente na forma de teoria ou hipóteses.

O exercício de síntese é o culminar de uma iteração do processo de investigação que permite construir conhecimento, após a análise dos dados. A construção de um modelo resulta do exercício de abstracção de um dado domínio do mundo real, utilizando uma determinada estrutura de conceitos (Macedo, Zacarias et al. 2005).

O investigador poderá obter ganhos se antes de iniciar a recolha de dados reflectir sobre o pretendido e como o conseguir. A reflexão dará uma maior lucidez do âmbito da recolha e eliminará opções mais onerosas. Alguns pontos de reflexão poderão ser (Routio 2007):

*   Em que circuitos ou meios poderá existir literatura com a informação desejada;
*   Que população ou amostra desta, poderá comunicar conhecimento através de instrumentos interrogatórios;
*   Reflexão sobre conhecimento e experiências prévias relacionadas com a informação pretendida.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 99

&lt;page_number&gt;77&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

### 2.6.1. DELPHI

A técnica DELPHI foi desenvolvida nos anos 50 como técnica de investigação qualitativa para previsão e resolução de tópicos considerados complexos (Benarie 1988; Woudenberg 1991; Amal 2005). Procura conseguir um consenso entre os participantes, sobre o assunto em discussão (McClave and Benson 1988; Waissbluth and De Gortari 1990; Cho, Jeong et al. 1991) através de ciclos de resposta a questionários (Fontana and Frey 1994; Amal 2005).

Técnica que envolve especialistas sem os colocar fisicamente juntos (Masser and Foley 1987). A validade e confiança de resultados dos estudos recorrentes a DELPHI provém da combinação de opiniões especializadas (Bardecki 1984; Parente, Anderson et al. 1984). Em complemento, o anonimato dos participantes permite-lhes interagir, reavaliar e comparar pensamentos um ambiente imune a ameaças e que liberta de eventuais influências provenientes de opiniões de outros (Miller 1993). Contudo, o anonimato pode causar a exclusão de interacção no grupo o que reduzirá a exactidão da opinião do grupo (Woudenberg 1991).

A aplicação de DELPHI inclui a execução de três principais etapas (Amal 2005). Ilustradas na figura 12:

<mermaid>
graph TD
    A[1] --> B[Criar painel anónimo de especialistas da área em estudo]
    A[2] --> C[Conduzir ciclos de resposta a questionários, apresentados aos especialistas]
    A[3] --> D[Partilhar resultados obtidos com participantes]
</mermaid>

Ilustração 12 - Etapas na aplicação de DELPHI

É comum a referência de dez a cinquenta, no número de participantes especialistas. Trinta cooperadores devem gerar informação suficiente sobre o fenómeno e acima deste número provavelmente aparecerão mais repetições de respostas sem a adição de nova informação (Miller 1993).

Os ciclos necessários de respostas a questionários devem ter lugar enquanto os resultados não forem considerados suficientes para validar o estudo. Woudenberg (Woudenberg 1991) sugere entre dois e dez ciclos de resposta. É esperado que a exactidão dos resultados

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 100

&lt;page_number&gt;78&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

incremente ao longo dos ciclos, devido à repetição de respostas e à pressão que o grupo cria para uma conformidade nas respostas, apesar do anonimato dos cooperadores.

Em cada ciclo de respostas é apresentado a cada participante os resultados do ciclo anterior, dando oportunidade para reavaliar a sua posição de acordo com a opinião dos restantes membros do painel. Esta técnica tem apresentado resultados considerados credíveis e válidos por estes serem produzidos por especialistas da área sob estudo.

A técnica apresenta alguns riscos na sua aplicação, com especial destaque para o tempo e esforço que consome ao investigador, que terá de efectuar a preparação do processo, conduzi-lo e organizar os resultados gerados. Muito do esforço estará concentrado na identificação de participantes especialistas disponíveis para alinhar no processo. A probabilidade de desistência de algum membro aumenta à medida que os ciclos de resposta incrementam ou se apresentam questões mais amplas (Amal 2005).

Com reflexão nos pontos fortes e nas limitações da técnica é possível apresentar sete sugestões (ver figura 13) que poderão minimizar eventuais problemas na aplicação de DELPHI (Amal 2005):

<table>
  <tr>
    <td>1</td>
    <td>• Questões amplas no primeiro ciclo poderão desencorajar os participantes</td>
  </tr>
  <tr>
    <td>2</td>
    <td>• O período de condução da técnica deve ser flexível de forma a não colidir com o horário de trabalho dos participantes</td>
  </tr>
  <tr>
    <td>3</td>
    <td>• O investigador deve encorajar respostas até conseguir a percentagem de respostas desejada</td>
  </tr>
  <tr>
    <td>4</td>
    <td>• A entrega de incentivos estimulará a participação dos especialistas</td>
  </tr>
  <tr>
    <td>5</td>
    <td>• O recurso ao e-mail como meio de condução do processo facilitará a obtenção de respostas</td>
  </tr>
  <tr>
    <td>6</td>
    <td>• Adoptar votação por maioria para analisar respostas permitirá resultados fiáveis, mas poderá gerar controvérsia</td>
  </tr>
  <tr>
    <td>7</td>
    <td>• A categorização de respostas permitirá a sumariação de opiniões por ciclo</td>
  </tr>
</table>

Ilustração 13 - Sugestões na aplicação de DELPHI

DELPHI é uma forma de previsão quando a obtenção de dados do fenómeno seria demasiado dispendiosa ou impossível de realizar (Parente and Anderson-Parente 1987; Edwards 2003).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 101

&lt;page_number&gt;79&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

---

## 2.6.2. OBSERVATION

A técnica tem base na observação de um conjunto de fenómenos com objectivo de recolher, de forma sistemática, dados sobre o comportamento de algo ou alguém.

Observation inclui variadas formas de observar, que de acordo com alguns parâmetros são classificadas por diferentes conceitos. Huhg Coolican (Coolican 2004) identifica várias classificações, apresentadas na figura 14:

&lt;img&gt;Diagram showing "Observation" at the top, with four main categories: "Participação", "Instrumentos", "Investigador", and "Ambiente". Each category has two subcategories below it.&lt;/img&gt;

**Ilustração 14 - Classificações de técnicas de Observation**

<table>
  <tr>
    <td>Participação</td>
    <td>Instrumentos</td>
    <td>Investigador</td>
    <td>Ambiente</td>
  </tr>
  <tr>
    <td>Participante</td>
    <td>Estruturada</td>
    <td>Encoberta</td>
    <td>Controlado</td>
  </tr>
  <tr>
    <td>Não Participante</td>
    <td>Não Estruturada</td>
    <td>Não Encoberta</td>
    <td>Naturalista</td>
  </tr>
</table>

A observação engloba o conjunto de operações através das quais o modelo de análise é submetido ao teste dos factos e confrontado com dados observáveis (Quivy and Campenhoudt 1998).

Para levar a bom termo o trabalho de observação, o investigador deve preparar respostas para três questões que posteriormente reflectirão o desenvolvimento da observação, indicadas na figura 15.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 102

&lt;page_number&gt;80&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

&lt;img&gt;A diagram with three blue shapes (1, 2, 3) pointing downwards to three white rectangles.
• 1: • Observar o quê?
• 2: • Observar onde?
• 3: • Observar como?&lt;/img&gt;

Ilustração 15 - Circunscrição da aplicação de Observation

A segunda questão é por vezes referida como “Observar quem?”. Tal deve-se ao facto das técnicas de observação serem maioritariamente aplicadas na compreensão de comportamentos de pessoas seja na sociedade ou na organização.

A primeira questão pretende que o investigador reflecta sobre que dados são necessários para conseguir realizar o seu estudo. Para avaliar correctamente o fenómeno não basta estudar as relações entre as variáveis definidas pela hipótese. É indispensável ter em consideração variáveis de controlo, dado que as correlações observadas, longe de traduzirem ligações de causa a efeito, podem resultar de outros factores implicados no mesmo sistema de interacção (Quivy and Campenhoudt 1998).

Os dados necessários para o estudo, denominados por dados pertinentes, só poderão ser definidos através de reflexão e análise do ambiente por parte do investigador.

A segunda questão refere-se à necessidade de circunscrever o campo de análise nas vertentes espaço geográfico, espaço social e espaço temporal. A identificação das fronteiras poderá ser facilitada se os objectivos do estudo identificarem eles próprios o âmbito do estudo. Por exemplo se indica organizações, datas ou população alvo.

Tornar-se-á mais difícil ao investigador quando o projecto incide sobre processos sociais e não sobre fenómenos singulares. Nesta situação antes de iniciar a aplicação de técnica, o investigador deverá ser capaz de criar um campo de análise claramente circunscrito.

É em redor da terceira questão que se torna relevante compreender as formas de observar, pois serão através destas que se conseguirão os dados pretendidos. A selecção de uma forma menos adequada poderá causar a obtenção de dados desviados do objectivo.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 103

&lt;page_number&gt;81&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

As formas mais usadas na observação de SI, de acordo com a AIS, não seguem ou reflectem a classificação identificada por Hugh Coolican. Estas técnicas que podem obter várias classificações, tencionam apresentar a actividade numa perspectiva prática:

*   Observação Directa;
*   Observação Indirecta;
*   Observação Participante.

Na Directa, também conhecida por Simples, o próprio investigador procede directamente à recolha das informações sem se dirigir aos sujeitos interessados (Quivy and Campenhoudt 1998). O investigador terá de apelar a todos os seus sentidos de observação não permitindo a intervenção dos observados na produção da informação. Devido às características esta forma de observar é popular em estudos qualitativos de carácter exploratório.

No caso da observação Indirecta o investigador dirige-se ao sujeito para obter a informação procurada. Ao responder às perguntas, o sujeito intervém na produção da informação (Quivy and Campenhoudt 1998).

Esta forma de observação costuma ser utilizada em estudos que pretendem a descrição precisa do fenómeno, devido à facilidade de análise do material recolhido. A facilidade referida advém da categorização das respostas. Estas condições de observação impossibilitam o investigador de ocultar a realização da observação e obrigam-no a prever e preparar as categorias de respostas para futura análise.

A observação Participante consiste na participação real do investigador na vida da comunidade, organização ou situação determinada (Quivy and Campenhoudt 1998). Desta forma o observador assume até certo ponto, o papel de membro do grupo de observados. Por esta razão, o investigador deverá ter o cuidado de não tornar a sua pesquisa tendenciosa.

Apesar de ser comum a referência à desconfiança do grupo investigado em relação ao investigador, esta configuração de observar permite o acesso a dados considerados de domínio privado e a captação de palavras de esclarecimento que acompanham o comportamento dos observados (Quivy and Campenhoudt 1998).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 104

&lt;page_number&gt;82&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A aplicação de Observation contempla a realização de três fases, ilustradas na figura 16:

<mermaid>
graph TD
    A[1] --> B[Conceber instrumento de observação]
    C[2] --> D[Testar instrumento de observação]
    E[3] --> F[Recolher os dados]
</mermaid>

Ilustração 16 - Fases na aplicação de Observation

A aplicação da técnica requer a definição e preparação da forma como serão recolhidos os dados da observação. Mesmo não havendo nenhum instrumento físico para testar, antes de iniciar a acção, o investigador deve reflectir e confirmar que está preparado para observar e recolher dados.

2.6.3. INTERVIEW

Uma entrevista é uma forma de conversação de duas vias, iniciada por um entrevistador que pretende obter informação relevante para a sua investigação. Os participantes na entrevista não se costumam conhecer e os tópicos de conversão são ditados pelo entrevistador, o que torna as entrevistas bastante focadas e possibilita a obtenção de muita informação pela aplicação de questões directas (Emory 1980).

É uma técnica adequada para obter informações sobre: o que as pessoas sabem, crêem, esperam, sentem, desejam, pretendem fazer, fazem ou fizeram, bem como acerca das suas explicações ou razões a respeito das coisas precedentes (Suassuna 2008).

As potencialidades referidas da técnica tornam-na eficiente para a obtenção de dados em profundidade permitindo a classificação e quantificação dos dados obtidos. Mas para obter sucesso na informação pretendida, o entrevistador deve ter cuidado na elaboração de questões que poderão criar respostas inadequadas, principalmente se as interpretações das perguntas não forem fáceis e claras para o entrevistado. Caso o entrevistador apresente opiniões pessoais durante a condução da entrevista é possível que os dados obtidos que não reflectam a realidade, dada a influência do entrevistador nas respostas do entrevistado.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 105

&lt;page_number&gt;83&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Interview inclui várias formas de estruturar e conduzir a entrevista, que pode funcionar como uma conversa fluida ou seguir uma ordem rígida de resposta às questões identificadas. É possível ainda realizar uma entrevista ampla, em que interessa quase tudo o que o entrevistado indica ou realizar entrevista focada num assunto específico. Estas características causam diferentes classificações de tipos de entrevistas, por diferentes áreas da ciência e autores.

As classificações mais comuns atribuídas a entrevistas são:

*   Estruturadas;
*   Semi-Estruturadas;
*   Não-Estruturadas;

Nas entrevistas estruturas existe uma organização que pode incluir forma de registo das questões, ordem de resposta, classificação de respostas e outras regras, que o entrevistador segue durante a aplicação da entrevista. Este tipo de entrevista é composto por questões fechadas e bem focadas que permitirão apenas um pequeno leque de respostas. O que possibilitará ao entrevistador definir níveis ou classificações sobre os dados obtidos. Este tipo de análise resulta, normalmente, em quantificação de respostas dando oportunidade de calcular índices percentuais.

Ao adoptar por esta forma de entrevista, o investigador cria facilidade na análise dos dados que obterá e a possibilidade de replicar a técnica em outros casos de estudo (Costa, Rocha et al. 2004). Este tipo de entrevistas aconselha que o entrevistador realize testes antes da sua aplicação. Se possível testar as questões e formas de registo com um pequeno conjunto de pessoas que corresponda à população a entrevistar. Os testes permitirão a correcção de eventuais lacunas ou erros antes de obter os dados que serão usados na investigação, eliminando desta forma desvios dos dados pretendidos.

As entrevistas semi-estruturadas são aplicadas de forma intermédia, em comparação aos restantes tipos. O entrevistador conduz a entrevista através de um guia de pontos de interesse, que inclui alguma estruturação, fazendo questões directas mas deixando o entrevistado falar livremente sobre o assunto.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 106

&lt;page_number&gt;84&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O entrevistador procura garantir que os diversos participantes respondam às mesmas questões, não seguindo ordem rígida na apresentação das questões e adaptando o desenvolvimento da entrevista ao entrevistado.

O terceiro e último tipo de entrevista, as não-estruturadas, são muitas vezes referidas como entrevistas exploratórias. A entrevista é a menos estruturada possível e só se distingue da simples conversa porque tem como objectivo a recolha de dados. Não há guia de entrevista durante a aplicação da técnica a não ser as respostas do entrevistado (Quivy and Campenhoudt 1998). Este tipo de entrevista permite ao investigador obter pontos de vista, identificação e aspectos de personalidade do entrevistado. Informações por vezes necessárias em estudos relacionados com organizações.

As entrevistas não-estruturadas têm, portanto, como função principal revelar determinados aspectos do fenómeno estudado que o investigador não teria espontaneamente pensado por si mesmo (Quivy and Campenhoudt 1998).

Nos tipos de entrevistas menos estruturados a análise das respostas é um processo longo, complicado e subjectivo. Em estudos de investigação qualitativa há menos interesse em quantificar os resultados em categorias (Coolican 2004).

Um factor que poderá conduzir a respostas mais honestas é o disfarce do entrevistador no processo. Embora possam ser levantados problemas éticos neste tipo de condução de entrevista os resultados mais verdadeiros serão dados nestas circunstâncias, principalmente se a informação desejada for de grande sensibilidade ou de possível embarago para o entrevistado. Não sentindo qualquer ameaça inerente a uma entrevista oficial ou formal, o entrevistado acaba por revelar informação que de outra forma não o faria (Coolican 2004).

Dependendo do tipo de entrevista, determinada etapa da aplicação de Interview (ver figura 17) deve ter maior ênfase. Em entrevistas estruturadas a primeira etapa, o planeamento da entrevista, deve ser bem mais cuidada que em entrevistas não-estruturadas.

<mermaid>
graph TD
    A[1] --> B[Planeamento da entrevista]
    C[2] --> D[Condução da entrevista]
    E[3] --> F[Registos da entrevista]
</mermaid>

Ilustração 17 - Etapas na aplicação de Interview

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 107

&lt;page_number&gt;85&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Na primeira etapa identificam-se tarefas como:

*   Seleção de participantes;
*   Identificação das variáveis em estudo e que devem ficar englobadas nas questões;
*   Elaboração das questões;
*   Preparação do entrevistador.

A condução da entrevista obriga à agenda das entrevistas, à sua realização de acordo com o tipo de entrevista adoptado e manter a posição de entrevistador que o tipo de entrevista obriga.

A última etapa refere-se aos meios de registo dos dados obtidos, que serão posteriormente usados na fase de análise da investigação. Os meios de registo mais populares são:

*   Anotações durante a entrevista;
*   Registar em áudio;
*   Registar em vídeo.

2.6.4. FOCUS GROUP

Focus Group funciona como uma entrevista em grupo que capitaliza a comunicação entre os participantes de forma a gerar informação. Apesar de entrevistas em grupo serem por vezes usadas como uma forma rápida e conveniente de recolher dados de várias pessoas ao mesmo tempo, Focus Group recorre à interacção do grupo como parte da técnica (Kitzinger 1995).

Em vez do investigador questionar cada membro do grupo de forma sequencial, os membros são encorajados a discutir o assunto entre si, colocando questões, trocando experiências e pontos de vista.

Estas características tornam a técnica particularmente útil na exploração de conhecimento e de experiências, o que permite não só obter as opiniões dos membros mas também a razão dessas mesmas opiniões (Kitzinger 1995). Encaixa nesta estrutura de recolha de dados, a apresentação de questões abertas que encaminhem os participantes a explorar os tópicos na

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 108

&lt;page_number&gt;86&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

sua própria linguagem. A informação conseguida, em gíria da comunidade, transmitirá conhecimento rico sobre as experiências relacionadas com o fenómeno.

Os resultados de Focus Group apresentam altos índices de validade, no contraste dos baixos custos que normalmente a técnica acarreta, tendo em conta a rapidez com que se conseguem os dados de vários participantes (Marshall and Rossman 1999).

<mermaid>
graph LR
    A[Identificação dos membros] --> B[Reunião dos membros]
    B --> C[Condução da discussão]

    subgraph A_details
        D[Verificação do perfil pretendido]
    end

    subgraph B_details
        E[Preferência no mesmo espaço]
    end

    subgraph C_details
        F[Registo da discussão]
    end
</mermaid>

Ilustração 18 - Etapas na aplicação de Focus Group

Alguns dos cuidados a ter na aplicação da técnica são apresentados na figura 18.
Relativamente ao grupo, deve ser constituído por membros qualificados no âmbito do fenómeno, o que permitirá obtenção de informação técnica da área. Cada membro deve ser verificado que pertence à comunidade alvo do estudo, de forma que o grupo represente um subgrupo da população que se pretende analisar.

A reunião dos membros deverá ter lugar, se possível, no mesmo espaço, o que facilitará a dinâmica do grupo na discussão do assunto. Os exemplos conhecidos de aplicação da técnica apontam para grupos compostos entre seis e dez membros e sugerem reunião com duração de cerca de duas horas.

É conveniente que a condução da discussão seja realizada por um moderador experiente, que encaminhará a discussão apenas em torno dos objectivos do estudo, através de uma pequena estrutura de apoio à condução, onde estão definidas questões abertas apresentadas apenas para iniciar a discussão.

O registo da discussão poderá ser feito recorrendo à gravação áudio ou vídeo da reunião, com posterior aplicação de Transcipt Analysis. Dependendo da disponibilidade, temporal e financeira, do investigador a recolha dos dados poderá ser feita directamente sobre a visualização e audição dos registos.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 109

&lt;page_number&gt;87&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A principal desvantagem associada a Focus Group referida na literatura é a pressão que alguns membros possam sentir em entrar em conformidade com opiniões de outros membros, o que resultará em dados contaminados.

2.6.5. SURVEY

Ao adoptar Survey, o investigador procura respostas verbais ou escritas para questões ou declarações que permitirão recolher dados como preferências, expectativas, experiências vividas ou comportamentos privados do inquirido. A versatilidade da técnica coloca-a como uma forma prática e económica de conhecer informação de vários tipos e sobre variadas situações (Emory 1980).

Questionários¹ podem ser compreendidos como instrumentos que facultam a recolha de dados estruturados, sendo definidos com o objectivo de obter opiniões ou comportamentos sobre determinado tópico (Coolican 2004). Ao serem encarados como técnica de medição é requerida uma preparação do processo que inclui a categorização de respostas, definida de acordo com pressupostos de validade e fiabilidade dos resultados a obter.

A popularidade da técnica permitiu a identificação de quatro princípios básicos na definição de questionários (Coolican 2004), representados na figura 19:

**Questionar o mínimo de informação que permita a realização do estudo**
* O inquirido considera que o seu tempo é precioso. Um questionário longo e moroso de preencher alterará o comportamento do inquirido que responderá com respostas desonestas.

**Confirmar que as questões podem ser respondidas pelos inquiridos**
* Algumas questões mal estruturadas poderão obrigar o inquirido a reflectir sobre eventos muito anteriores ou acções sistematicamente repetidas o que criará dificuldades em responder.

**Confirmar que as questões sejam respondidas de forma honesta**
* Questões de resposta difícil ou ampla provavelmente receberão resposta de acordo com a opinião geral da comunidade e não a resposta real do inquirido.

**Confirmar que as questões sejam respondidas e não recusadas**
* Questões sobre assuntos de grande sensibilidade produzem recusa à sua resposta. Se o assunto de estudo é considerado sensível, deverá haver um contexto que justifique a questão.

Ilustração 19 - Princípios básicos na definição de Survey

---
¹ A tradução de Survey.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 110

&lt;page_number&gt;88&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

O questionário poderá apresentar questões abertas e/ou fechadas. Dependendo dos objectivos do projecto, o investigador deve ter o cuidado de definir as questões que originarão a melhor informação possível para o seu estudo.

Ao apresentar questões abertas, o investigador conseguirá informação mais rica, uma vez que o inquirido não se sentirá frustrado pelas respostas impostas. Haverá menos probabilidade de respostas ambíguas pois as respostas reflectirão o que o inquirido pensa, ao evitar da interpretação de declarações. As respostas obtidas com este tipo de questões são consideradas mais realistas. Contudo o trabalho de análise das respostas será bem mais moroso dado a dificuldade de categorização das mesmas (Coolican 2004). O questionário ideal ao ser apresentado a qualquer inquirido teria a mesma interpretação. Disponibilizar o instrumento neste sentido obriga à verificação de não ambiguidade em todas as respostas possíveis.

O número de itens apresentados no questionário requer a gestão de tempo e paciência do inquirido para o preenchimento, mas também o número de itens necessários para criar confiança e credibilidade sobre os resultados. Com um maior número de itens, erros de resposta em alguns pontos serão cancelados por resposta em outros.

Varun Grover (Grover 2003) identifica uma lista de verificação, ilustrada na figura 20, a ser seguida no desenvolvimento e aplicação da técnica:

*   Determinar a unidade de análise
*   Criar os itens e definir as escalas de categorização
*   Testar o instrumento com dados piloto
*   Avaliar a construção e validade das respostas obtidas
*   Avaliar a fiabilidade
*   Identificar a amostra da população
*   Determinar percentagem desejada de respostas
*   Avaliar se correlações significantes implicam relações reais
*   Determinar o potencial estatístico da análise final

Ilustração 20 - Checklist na aplicação de Survey

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 111

&lt;page_number&gt;89&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A técnica apresenta algumas vantagens relativamente a outras, pois permite uma auto-aplicação, ou seja o próprio inquirido responde, permite atingir um elevado número de pessoas e pode garantir o anonimato. Se o questionário for disponibilizado sob meios tecnológicos pode ainda permitir que o inquirido responda no momento que julgar mais conveniente, o que pode significar respostas mais honestas ou reflectidas.

### 2.6.6. TRANSCRIPT ANALYSIS

Transcript Analysis consiste na transcrição e análise de eventos assíncronos relacionados com o fenómeno sob investigação.

A transcrição nasceu da necessidade de processar de forma simples dados de conversas espontâneas e que dispensasse estudos profundos para a sua compreensão (Schnack, Pisoni et al. 2004).

A técnica deriva do método específico de análise de conteúdo, denominado por Content Analysis, habitualmente aplicado para identificar mensagens contidas em registos de vídeo e áudio ou outros tipos de material, em literatura, discursos de pessoas famosas ou propaganda de guerra (Coolican 2004).

Transcript Analysis apresenta-se como uma forma de observar, não directamente, mas as comunicações criadas entre pessoas. A evolução e popularidade da técnica levou-a da análise de comunicações publicadas, para a análise de materiais com conteúdo de discussões, reuniões, entrevistas ou outro tipo de interacções, relativos a um tópico sob investigação (Coolican 2004).

A transcrição de um encontro entre pessoas funciona como um elemento de percepção, visto que inúmeros detalhes passariam despercebidos ao indivíduo comum (Schnack, Pisoni et al. 2004). Se a transcrição for realizada por especialistas, que não o investigador, então é assumida como uma ferramenta de auxílio que coloca em contacto directo com dados, permitindo micro análises dada a disponibilidade da informação, sempre presente.

A transcrição pode ser realizada sobre os mais variados meios de informação como jornais, revistas, registos de multimédia, comunicações disponibilizadas na Web e outros. O investigador deve assegurar que na realização desta tarefa não fica apenas descrito o que aconteceu mas fica também a forma como aconteceu. A transcrição criada de acordo com as

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 112

&lt;page_number&gt;90&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

regras específicas não se assemelha a um diálogo escrito, pois não utiliza a forma ortográfica padrão nem aplica a pontuação utilizada na forma escrita, e inclui aspectos relacionados com a ausência da palavra, como silêncios, risos, respiração e características de entoação e volume de voz.

A aplicação de Transcript Analysis apresenta alguns cuidados a ter pelo investigador e que definem a aplicação da técnica (Schnack, Pisoni et al. 2004), reflectindo-se como requisitos apresentados na figura 21:

<mermaid>
graph TD
    A[1] --> B[Definição dos objectivos para análise dos dados]
    C[2] --> D[Definição do ambiente de recolha de dados]
    E[3] --> F[Recursos disponíveis para recolha de dados]
</mermaid>

Ilustração 21 - Requisitos para a aplicação de Transcript Analysis

O investigador ao definir de forma clara os objectivos pretendidos, identifica o âmbito e os recursos a analisar, assim como possibilita a quem realizar a transcrição a ter em conta eventuais pormenores importantes para a investigação como, por exemplo, comportamentos.

A definição do ambiente pode incluir a delimitação de assuntos, datas e meios para a recolha de dados. No caso de se tratar da transcrição de reuniões, discussões ou entrevistas, esta informação de ambiente será importante para o especialista que transcreverá o evento, permitindo uma boa preparação dos instrumentos.

Os recursos disponíveis podem estar confinados a revistas técnicas, a jornais especializados ou a registos de vídeo ou áudio, do evento a transcrever. Serão estes os meios sobre os quais serão recolhidos dados.

O processo de Transcript Analysis está estruturado em três etapas. A inicial contempla a codificação de unidades que se refere à identificação das unidades que serão categorizadas (Coolican 2004). Nesta etapa deve ser criado um esquema de codificação de acordo com os objectivos do estudo, identificando as unidades relevantes para a análise, que podem ser palavras, parágrafos, frases, temas, caracteres e até espaços e tempos. O esquema inclui a definição da métrica de análise para cada unidade (Coolican 2004).

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 113

&lt;page_number&gt;91&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Alguns exemplos são apresentados na tabela 13:

<table>
<thead>
<tr>
<th>Unidade</th>
<th>Exemplo</th>
</tr>
</thead>
<tbody>
<tr>
<td>Palavra</td>
<td>Palavras relacionadas com Drogas em várias revistas</td>
</tr>
<tr>
<td>Tema</td>
<td>Situações, em literatura infantil, onde a iniciativa da criança é elogiada</td>
</tr>
<tr>
<td>Item</td>
<td>Nome de local ou de atitude (Nova Leiria; Muito Triste)</td>
</tr>
<tr>
<td>Caracter</td>
<td>Tipos de caracteres em cartoons</td>
</tr>
<tr>
<td>Tempo e Espaço</td>
<td>Contar espaço e tempo dedicado a um assunto em vídeos</td>
</tr>
</tbody>
</table>

Tabela 13 - Exemplos de codificação em Transcript Analysis

A técnica funciona como um instrumento de investigação exploratória enquadrada numa abordagem qualitativa e devido a tal, um esquema de codificação demasiado simples poderá limitar a identificação de correlações para criar a teoria. Outra preocupação do investigador sobre o esquema é que este deve estar preparado para argumentar as relações identificadas, de forma suficiente que permitam a validade e fiabilidade destas (Garrison, Cleveland-Innes et al. 2006).

A etapa seguinte é a categorização das unidades. O investigador deve definir categorias nominais para valores de ocorrências, distribuídos por níveis. A categorização permitirá criar relações entre unidades e rankings de ocorrências.

A última etapa é a análise propriamente dita do material transcrito face ao esquema de codificação e níveis de categorias. Actualmente este processo é suportado por aplicações informáticas especializadas na análise qualitativa de dados, como são exemplos Nudist e Atlas/ti.

<mermaid>
graph LR
    A[Codificação] --> B[Categorização]
    B --> C[Análise]
</mermaid>

Ilustração 22 - Processo de Transcript Analysis

A figura 22 apresenta o processo sequencial na aplicação de Transcript Analysis, reflectindo as etapas acima indicadas.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 114

&lt;page_number&gt;92&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

## 2.6.7. MEASUREMENT

A precisão que algumas áreas requerem, obriga à realização de medições quantitativas a variáveis relacionadas com o fenómeno. Para estas comunidades, mesmo eventos qualitativos podem ser categorizados ou quantificados de forma a criarem variáveis mensuráveis (Coolican 2004).

As variáveis podem ser medidas sobre diferentes tipos de valores. Foram identificados quatro níveis, apresentados na figura 23:

**Nominal**
* Os valores das variáveis são classificados de acordo com uma escala de categorias.

**Ordinal**
* As variáveis são ordenadas de acordo com os valores recebidos, mas não é conhecida a diferença de valores entre cada posição do ranking.

**Intervalos**
* As variáveis são colocadas em intervalos de valores próximos, sendo possível saber a diferença de valores entre cada intervalo.

**Índices Percentuais**
* O valor percentual é calculado através da proporção do valor da variável com o valor total da escala. O índice zero indica a ausência da variável.

Ilustração 23 - Níveis de medição de variáveis em Measurement

O nível de medição seleccionado determinará o tipo de processamento estatístico que será possível realizar, sendo que em projectos com objectivo de análise positivista as medições devem ser em intervalos ou índices percentuais.

Em investigações sobre dados qualitativos é possível aplicar Measurement através da operacionalização dos conceitos em variáveis que tomarão valores de cada medição. Por exemplo, o conceito “sexy” seria decomposto em itens como beleza e charme que tomariam valores de acordo com a opinião de um inquirido. No final de um processo de medição, seria possível verificar se para a maioria dos inquiridos uma pessoa bela corresponde a “sexy”. A

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 115

&lt;page_number&gt;93&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

validade deste exemplo estaria dependente da percentagem de respostas dadas no sentido da afirmação referida. As conclusões retiradas de medições reflectem os valores obtidos, ou seja dependem das diferenças de valores entre as várias variáveis. Só uma diferença elevada que representa um alto índice percentual dará validade às conclusões indicadas (Schwab 2004).

Apesar da facilidade que a técnica apresenta em conseguir credibilidade e validade dos resultados, o investigador deve ter o cuidado de manter estas características ao definir as variáveis. Para conseguir credibilidade, as variáveis medidas devem representar o mesmo significado independente do momento e do alvo medido. A validade requer que as variáveis meçam efectivamente o pretendido pelo processo de medição. Mantendo estes cuidados, o investigador conseguirá apresentar resultados válidos para a comunidade.

Measurement tem por objectivo determinar a influência de variáveis independentes sobre variáveis dependentes, ou seja identificando ou aplicando valores à variável independente concluir comportamentos ou implicações nos valores de variáveis dependentes (Schwab 2004).

De acordo com as condições do projecto e da estrutura da metodologia adoptada¹, a variável independente pode ser controlada pelo investigador ou de forma externa. No segundo cenário o investigador poderá ficar limitado quanto às medições possíveis de realizar, assumindo um papel de supervisor. No primeiro cenário o investigador ao controlar totalmente a medição, pode inclusive aplicar as variáveis em aplicações informáticas de análise estatística e identificar possíveis relações que posteriormente poderá experimentar (Schwab 2004).

A atribuição de valores ou participantes às condições da medição pode ser realizada de duas formas: colocação aleatória ou colocação reflectida.

A primeira forma de atribuição requer que o investigador defina diferentes níveis para a variável independente e atribua de forma aleatória valores ou participantes a cada nível. Esta forma de atribuição de casos liberta o investigador de analisar cada valor ou participante e de confrontar o seu perfil com a variável independente.

A colocação reflectida permite ao investigador um maior controlo do processo de medição mas apresenta-se como uma opção complexa e morosa, dado que requer a definição de níveis de valores para a variável independente de acordo com os perfis de casos que tem ao dispor para medir (Schwab 2004).

---
¹ Ver secção 2.5.7 Experiments.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 116

&lt;page_number&gt;94&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A aplicação de Measurement enquadra-se numa investigação assente em Experiments e de acordo com a forma de aplicação da metodologia as condições do processo de medição serão as fornecidas pela estrutura de investigação.

**2.6.8. ARCHIVAL RESEARCH**

A técnica tem como principal objectivo a análise de documentos históricos e num segundo plano a análise de qualquer registo de informação. Toda a informação é examinada após o evento que regista (Jenkins 1985).

A maioria dos estudos exige um levantamento teórico detalhado, onde são identificados dados empíricos que auxiliarão no enquadramento do fenómeno, na sua compreensão e alicerçam as bases da teoria criada.

Estas operações empíricas recorrem a técnicas de recolha direcccionadas para a análise de literatura como é o caso de Archival Research. Formam uma fase da investigação tipicamente longa e com vários tipos de custos associados e como tal, deve ser cuidadosamente planeada além de que, a existência de dados empíricos pobres ou deficientes causará uma análise igualmente carente ou deficiente. Cuidados a ter em conta antes de iniciar a pesquisa de literatura incluem (Routio 2007):

*   Delimitação do estudo. Identificando a comunidade destinatária dos resultados permite definir o âmbito da informação e como deve ser suportada;
*   A identificação da amostra ou domínio de onde será extraída a informação empírica desenha fronteiras que permitem circunscrever a investigação;
*   Definição dos conceitos, atributos e variáveis que terão de ser descritas e compreendidas.

Com as definições referidas, o investigador estará mais protegido de desvios na pesquisa que realiza. Uma das grandes dificuldades associadas à técnica é facilidade de dispersão na recolha de dados, que se traduzirá em maiores custos para o processo.

A informação obtida pela técnica provém de dois tipos de fontes, as primárias e as secundárias. As fontes primárias de dados, com as evidências directas, devem ser consideradas

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 117

&lt;page_number&gt;95&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

os principais recursos de dados para a investigação, seguindo-se a recolha de dados sobre fontes secundárias, interpretações ou análises do fenómeno.

Registos de informação pessoais de indivíduos ou registos internos de organizações, não publicados são habitualmente fontes ricas de informações com conceitos e contextos relacionados com o tópico em estudo. Quando o projecto incide sobre eventos históricos, os arquivos municipais deverão ser um dos alvos iniciais para a pesquisa de informação.

Este tipo de registos não publicados poderá ser suportado por diferentes meios como papel, vídeo, som, imagem ou outro e sobre diferentes formas (ver tabela 14):

<table>
  <tr>
    <td>• Cartas</td>
    <td>• Agendas</td>
  </tr>
  <tr>
    <td>• Fotografias</td>
    <td>• Relatórios anuais e ficheiros de projectos</td>
  </tr>
  <tr>
    <td>• Jornais e diários</td>
    <td>• Registos de bases de dados</td>
  </tr>
  <tr>
    <td>• Notas e manuscritos</td>
    <td>• Sons e vídeos</td>
  </tr>
  <tr>
    <td>• Registos bancários</td>
    <td>• Desenhos, mapas e planos</td>
  </tr>
</table>

Tabela 14 - Meios de registo de informação

A autenticidade da informação recolhida deve ser motivo de dupla preocupação. Por um lado o investigador deve indicar no seu estudo a origem da informação apresentada e por outro lado deve conseguir verificar que a informação que recolhe é válida e provém de fonte fidedigna.

A aplicação de Archival Research é desenvolvida em quatro etapas, representadas pela figura 24:

<mermaid>
graph TD
    A[1] --> B[Definição do âmbito e meios de informação]
    C[2] --> D[Codificar os registos encontrados com conceitos e temas]
    E[3] --> F[Analisar os registos codificados]
    G[4] --> H[Criar análise através de excertos e tabelas argumentadas]
</mermaid>

Ilustração 24 - Etapas na aplicação de Archival Research

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 118

&lt;page_number&gt;96&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A principal limitação na aplicação de Archival Research não está na técnica mas sim nos recursos. Nem sempre é possível o acesso aos documentos por variadas razões como confidencialidade, indisponibilidade, reservas de acesso externo ou outras. A dificuldade associada à técnica é o jogo de puzzle necessário de realizar para conseguir criar uma análise completa através de argumentações de diversos autores.

## 2.7.TÉCNICAS DE ANÁLISE

As técnicas de análise de dados têm como objectivo guiar o investigador no desenvolvimento de categorias, na exploração de similaridade e diferença entre dados e na identificação das suas relações (Pare 2002).

No entanto, as técnicas adoptadas dependem da metodologia escolhida e da posição epistemológica assumida. Num estudo assente em metodologia quantitativa, recorre-se, vulgarmente, a técnicas estatísticas de análise dos dados. Em metodologias qualitativas os dados são analisados qualitativamente segundo as directivas especificadas em normas ou aceites, em teoria, na comunidade científica.

Os dados obtidos com as técnicas de recolha deverão ser analisados no sentido dos objectivos do estudo. O investigador que procura criar teoria com dados, terá de recorrer à análise empírica dos dados ou técnicas de identificação de correlações entre conceitos de forma a sustentar a teoria desejada.

Nesta fase surgem dificuldades inesperadas. O conjunto de dados obtidos, por vezes massivo, poderá estar confuso e não devidamente classificado. Provavelmente o investigador que recolheu excertos de texto, tabelas de exemplos, imagens e gráficos para contextualizar o fenómeno não procedeu ao registo e classificação de cada registo de informação. Meses passados da recolha dos dados, o investigador é confrontado com informação esquecida e desarticulada. Um investigador experiente deverá ter criado um classificador de registos por temas, conceitos ou tópicos, que nesta fase facilitará a análise aos dados.

Sobre dados quantitativos, o investigador pode recorrer a software de análise estatístico como é exemplo o SPSS, que permite análise textual e análise numérica.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 119

&lt;page_number&gt;97&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

A análise de dados qualitativos pode ser feita com suporte a software específico para análise textual e construção de teoria, como é o caso do NVivo.

Na impossibilidade de recorrer a aplicações informáticas, o investigador terá aplicar regras de indução ou identificação de padrões, regras de dedução para testar teorias ou hipóteses, ou em alternativa identificar e argumentar a melhor explicação possível que justifique os dados obtidos (Johnson and Onwuegbuzie 2004).

&lt;img&gt;A circular flowchart with five steps: "Recolher Dados" (Collect Data) at the top, "Validar Dados" (Validate Data) to the right, "Interpretar Dados" (Interpret Data) at the bottom, "Analisar Dados" (Analyze Data) to the left, and "Reavaliar questões da investigação" (Re-evaluate research questions) in the center. Arrows connect each step in a clockwise direction.&lt;/img&gt;

Ilustração 25 – Enquadramento da análise de dados no processo de investigação, adaptado de (Johnson and Onwuegbuzie 2004)

A figura 25 apresenta o enquadramento da análise de dados, que chegando à última etapa, o investigador deve então continuar o seu trabalho de investigação, mantendo o rigor e a independência relativa aos dados que é esperado, tendo em conta os quatro pontos ilustrados na figura 26.

1. Organizar e analisar os dados obtidos
2. Confirmar o rigor na análise dos dados
3. Verificar a aplicação das regras de ética na investigação
4. Criar os resultados de acordo com a epistemologia adoptada

Ilustração 26 - Etapas até a criação de resultados

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 120

&lt;page_number&gt;98&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

# 2.8.CLASSIFICAÇÃO DE METODOLOGIAS E TÉCNICAS QUANTO À ABORDAGEM

A informação que se apresenta relativamente aos instrumentos de investigação só é possível após pesquisa e detalhada análise sobre as diversas fontes de dados, onde se destaca a AIS. Esta associação refere a classificação quanto à abordagem, da maioria das metodologias e técnicas referidas ao longo deste trabalho. Classificação que é confirmada pelos dados recolhidos de diversas fontes e descrita nas secções 2.5 e 2.6 desta dissertação.

Uma classificação destes instrumentos, relativamente à abordagem, permite de forma rápida identificar quais os mais adequados ao estudo a que se propõe um investigador. Se é objectivo recolher dados exactos e numéricos para formular hipóteses então o investigador deve reflectir sobre os instrumentos classificados como quantitativos. Por outro lado, se o investigador pretende compreender e descrever relacionamentos ou comportamentos do fenómeno, a sua escolha deve incidir sobre instrumentos qualitativos.

As aplicações conhecidas das metodologias e técnicas referenciadas permitem identificar algumas, que tanto podem ser aplicadas numa investigação qualitativa como quantitativa (ver tabelas 15 e 16). Esta bipolaridade dos instrumentos advém das suas características mas a viabilidade da sua aplicação num projecto depende principalmente, das fontes de dados usadas no projecto em que são aplicados e das condições que essas fontes permitem a recolha de dados.

<table>
  <thead>
    <tr>
      <th>Metodologia</th>
      <th>Abordagem</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Action Research</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Archival Research</td>
      <td>Qualitative / Quantitative</td>
    </tr>
    <tr>
      <td>Case Study</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Design Research</td>
      <td>Qualitative / Quantitative</td>
    </tr>
    <tr>
      <td>Ethnography</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Experiments</td>
      <td>Quantitative</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 121

&lt;page_number&gt;99&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<table>
  <thead>
    <tr>
      <th>Técnica de investigação</th>
      <th>Abordagem</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Field Study</td>
      <td>Qualitative / Quantitative</td>
    </tr>
    <tr>
      <td>Formal Methods</td>
      <td>Quantitative</td>
    </tr>
    <tr>
      <td>Grounded Theory</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Group Feedback</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Numeric Methods</td>
      <td>Quantitative</td>
    </tr>
    <tr>
      <td>Opinion Research</td>
      <td>Quantitative</td>
    </tr>
    <tr>
      <td>Philosophical Research</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Survey</td>
      <td>Quantitative</td>
    </tr>
  </tbody>
</table>

Tabela 15 - Classificação de metodologias relativamente à abordagem

<table>
  <thead>
    <tr>
      <th>Técnica de investigação</th>
      <th>Abordagem</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Archival Research</td>
      <td>Qualitative / Quantitative</td>
    </tr>
    <tr>
      <td>DELPHI</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Focus Group</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Interview</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Measurement</td>
      <td>Quantitative</td>
    </tr>
    <tr>
      <td>Observation</td>
      <td>Qualitative</td>
    </tr>
    <tr>
      <td>Survey</td>
      <td>Quantitative</td>
    </tr>
    <tr>
      <td>Transcript Analysis</td>
      <td>Qualitative</td>
    </tr>
  </tbody>
</table>

Tabela 16 - Classificação de técnicas relativamente à abordagem

Ao juntar a classificação de metodologias e técnicas é possível criar um único diagrama que apresenta de forma clara e rápida quais os instrumentos normalmente associados a investigação qualitativa e investigação quantitativa.

Pretende-se que o diagrama (figura 27) criado se mostre como uma ferramenta útil durante a análise de estudos, auxiliando na identificação dos instrumentos aplicados.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 122

&lt;page_number&gt;100&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

<mermaid>
graph TD
    subgraph "Investigação Quantitativa"
        A[Formal Methods]
        B[Opinion Research]
        C[Numeric Methods]
        D[Experiments]
        E[Survey]
        F[Field Study]
        G[Archival Research]
        H[Design Research]
        I[Measurement]
        J[Survey]
    end

    subgraph "Investigação Qualitativa"
        K[Transcript Analysis]
        L[Observation]
        M[Focus Group]
        N[Interview]
        O[DELPHI]
        P[Group Feedback]
        Q[Action Research]
        R[Case Study]
        S[Grounded Theory]
        T[Ethnography]
        U[Philosophical Research]
    end

    subgraph "Técnicas"
        J --> I
        J --> K
        J --> L
        J --> M
        J --> N
        J --> O
        J --> P
        J --> Q
        J --> R
        J --> S
        J --> T
        J --> U
    end

    subgraph "Metodologias"
        A --> J
        B --> J
        C --> J
        D --> J
        E --> J
        F --> J
        G --> J
        H --> J
        I --> J
        J --> K
        J --> L
        J --> M
        J --> N
        J --> O
        J --> P
        J --> Q
        J --> R
        J --> S
        J --> T
        J --> U
    end

    subgraph "Técnicas"
        I -- "Instrumento com classificação Quantitativo" --> J
        K -- "Instrumento com classificação Qualitativo" --> J
        L -- "Instrumento que poder ser Quantitativo e Qualitativo" --> J
    end
</mermaid>

Ilustração 27 - Diagrama de classificação de metodologias e técnicas

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 123

&lt;page_number&gt;101&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

2.9.ENQUADRAMENTO CONCEPTUAL DOS INSTRUMENTOS PARA INVESTIGAÇÃO

&lt;img&gt;A diagram illustrating the conceptual framing of research instruments for Information Systems Research. The vertical axis on the left is labeled "Abordagens" (Approaches) with two branches: "Qualitative" and "Quantitative". The horizontal axis at the top is labeled "Epistemologias" (Epistemologies) with three branches: "Critical Science", "Interpretative", and "Positivist". The horizontal axis at the bottom is labeled "Técnicas" (Techniques) with four branches: "Archival Research", "Interview", "Observation", and "Transcript Analysis / Measurement".

The diagram shows various research methods aligned with these branches:
- **Qualitative**
  - Archival Research
  - Interview
  - Observation
  - Transcript Analysis / Measurement
- **Quantitative**
  - DELPHI
  - Survey
  - Case Study
  - Grounded Theory
  - Survey
  - Numeric Methods
  - Field Study
  - Group Feedback
  - Experiments
- **Epistemologias**
  - Critical Science
    - Action Research
    - Ethnography
    - Formal Methods
    - Design Research
    - Archival Research
    - Opinion Research
    - Philosophical Research
- **Positivist**
  - None shown in this section.

The diagram visually represents how different research techniques and approaches align with various epistemological perspectives.&lt;/img&gt;

Ilustração 28 - Enquadramento conceptual dos instrumentos para investigação em Sistemas de Informação

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 124

&lt;page_number&gt;102&lt;/page_number&gt;

2. INSTRUMENTOS PARA INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO

Cada um dos instrumentos identificados possui uma posição no quadro da investigação em SI, que está associada a um dos quatro eixos de conceitos, Abordagens, Epistemologias, Metodologias e Técnicas. Foi criado um modelo (figura 29), denominado por Enquadramento conceptual dos instrumentos para investigação, que pretende ilustrar onde se encaixa cada um dos instrumentos descritos ao longo do capítulo.

O modelo apresenta como séries de valores, quatro dimensões que se podem usar para caracterizar um estudo. Fica de fora uma quinta dimensão, os instrumentos utilizados para análise dos resultados. Tal detalhe vai para lá do âmbito pretendido para este projecto.

A primeira dimensão identifica a abordagem assumida pelo investigador perante o fenómeno, Qualitative VS Quantitative. As metodologias mais comuns para investigação na área, representadas na segunda dimensão, não são indicadas por qualquer tipo de ordem ou classificação.

A terceira dimensão expõe as técnicas de investigação identificadas para investigação em SI, devendo ser a aplicação de cada técnica acautelada pela compreensão da metodologia adoptada para o estudo.

Na quarta e última dimensão, expõe-se a postura do investigador na forma em como interpreta os resultados obtidos, se Positivist, Interpretative ou Critical Science.

A informação oferecida pelo diagrama em conjunto com os relacionamentos encontrados na secção 3.2, entre metodologias e técnicas, tipos de estudo e metodologias, de acordo com as selecções aplicadas nos estudos de SIO em Portugal, dará a um investigador alguma segurança e permitirá rapidez na identificação e adopção dos instrumentos de investigação para o seu projecto.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 125

&lt;page_number&gt;103&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

# 3. INVESTIGAÇÃO EM SISTEMAS DE INFORMAÇÃO ORGANIZACIONAIS NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

No capítulo anterior, apresentou-se o culminar de um trabalho de Archival Research que, através de pesquisa de informação em revistas, livros, conferências, páginas Web e Associações da área, se conseguiu identificar informação que permite compreender o relacionamento entre os vários instrumentos de investigação de SI assim como o objectivo e principais características de cada instrumento identificado.

Para ser possível efectuar uma caracterização da investigação em SIO realizada em Portugal é necessário identificar e analisar os estudos efectuados na área durante o período definido. A investigação realizada no país é em boa parte da responsabilidade das universidades públicas, através de cursos de mestrado e doutoramento. Assim, para identificar os estudos realizados em Portugal, na área de SI, recorreu-se às páginas Web das instituições, mais especificamente aos catálogos de publicações que disponibilizam.

O período definido para a pesquisa de dissertações e teses foi de 4 anos, de 2004 a 2007, por questões de operacionalização do estudo, tendo sido identificados 191 estudos na área de SI. A esta lista foram retiradas as dissertações e teses que embora de SI, não são relativas a SIO. Restaram então 107 estudos, dispersos pelas várias universidades, para análise e caracterização.

Os estudos a que se teve acesso foram alvo de análise relativamente à abordagem, metodologia e técnicas seleccionadas para a investigação e relativamente à epistemologia usada na interpretação dos resultados de cada estudo. A análise só foi possível depois de conhecidos e compreendidos os instrumentos de investigação na área de SI, como tal, a caracterização realizada teve como suporte os resultados obtidos da primeira fase deste projecto, em especial o modelo de classificação de técnicas e metodologias quanto à abordagem, apresentado no capítulo anterior.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 126

&lt;page_number&gt;104&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

## 3.1.RECOLHA DE DADOS

Nos últimos anos, a investigação em Portugal tem tido uma taxa de crescimento média anual (TCMA) de 8,7% (figura 29). Entre 1990 e 2006 o número de doutoramentos realizados ou reconhecidos por universidades portuguesas quase que quadruplicou de 337 para 1276. Entre 2000 e 2006 a TCMA baixa para 6,8% (Delloite 2008).

&lt;img&gt;
Doutoramentos realizados ou reconhecidos por universidades portuguesas e número de publicações científicas portuguesas
(1990 -2006; número de doutoramentos, número de publicações)

Taxa de crescimento média anual (TCMA) de 8,7%

**Legend:**
*   Numero de publicações
*   Doutoramentos realizados em Portugal
*   Doutoramentos realizados no estrangeiro
*   Total de doutoramentos realizados

Data | Publicações | Doutoramentos em Portugal | Doutoramentos no estrangeiro | Total de doutoramentos
---|---|---|---|---
1990 | 337 | 150 | 150 | 337
1991 | 319 | 160 | 160 | 319
1992 | 351 | 170 | 170 | 351
1993 | 493 | 180 | 180 | 493
1994 | 453 | 190 | 190 | 453
1995 | 571 | 200 | 200 | 571
1996 | 608 | 210 | 210 | 608
1997 | 590 | 220 | 220 | 590
1998 | 718 | 230 | 230 | 718
1999 | 772 | 240 | 240 | 772
2000 | 860 | 250 | 250 | 860
2001 | 908 | 260 | 260 | 908
2002 | 986 | 270 | 270 | 986
2003 | 1028 | 280 | 280 | 1028
2004 | 1083 | 290 | 290 | 1083
2005 | 1136 | 300 | 300 | 1136
2006 | 1276 | 310 | 310 | 1276
&lt;/img&gt;

Ilustração 29 - Taxa de crescimento média anual de investigação em Portugal

Um dos objectivos estabelecidos para este trabalho consiste na caracterização da investigação em SIO que tem ocorrido em Portugal. A caracterização que incide sobre os instrumentos de investigação usados pelos investigadores, requer uma análise detalhada a cada estudo, identificando qual a abordagem adoptada, a metodologia que estruturou o projecto, as técnicas de investigação usadas como ferramentas de recolha de dados e a epistemologia eleita na interpretação dos resultados conseguidos.

O espaço temporal definido para o âmbito da análise foi de 4 anos de 2004 a 2007. Na lista de estudos identificados foi incluída uma dissertação de 2008, a única deste ano identificada à data de pesquisa.

Embora sejam conhecidas algumas instituições particulares de investigação no país, como é caso a Fundação Champalimaud, os resultados produzidos não são de domínio público. A larga maioria da investigação realizada é enquadrada em projectos de cursos de mestrado e

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 127

&lt;page_number&gt;105&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

doutoramento, correspondendo a dissertações e teses, respectivamente. Estes cursos são normalmente organizados e geridos pelas universidades e, na sua maioria, pelas universidades públicas.

Pretende-se então dar resposta à caracterização da investigação em SIO em Portugal, através da análise de dissertações e teses identificadas nas universidades públicas portuguesas, publicadas entre 2004 e 2007. Identificando as metodologias e técnicas de investigação aplicadas em cada estudo, será possível caracterizar a investigação na área de SIO, relativamente aos instrumentos de investigação adoptados.

Um risco que as características do projecto cria e que não é controlável é a disponibilidade dos estudos para consulta e subsequente análise. De todos os estudos identificados, nem todos estarão sempre acessíveis para consulta por diversas razões: empréstimo a outro leitor, restrição de acesso à obra, restrição de acesso a indivíduos externos da comunidade académica, ou qualquer outra razão. A percentagem de estudos que são inacessíveis é à partida desconhecida e pouco controlável. Resta identificar as várias alternativas de acesso aos estudos e ir adoptando a que se demonstrar mais prática e viável para cada universidade em particular.

Aos resultados conseguidos pela análise dos estudos, terá de ser feita uma análise estatística que permita identificar relacionamentos, tendências e comportamentos na investigação em SI em Portugal.

**3.1.1.IDENTIFICAÇÃO DOS ESTUDOS RELEVANTES**

A rede pública do ensino superior em Portugal é constituída por três grupos de entidades:

*   Universitário;
*   Politécnico;
*   Militar e Policial.

O âmbito deste projecto aplica-se sobre o grupo de ensino superior público universitário que engloba 15 entidades (DGES 2008), apresentadas na figura 30.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 128

&lt;page_number&gt;106&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;Map of Portugal showing public universities. The map includes:
- R. A. DOS AÇORES: U. Açores
- R. A. DA MADEIRA: U. Madeira
- PORTUGAL CONTINENTAL:
  - U. Minho
  - U. Porto
  - U. Aveiro
  - U. Coimbra
  - U. Trás-os-Montes e Alto Douro
  - U. Beira Interior
  - U. Lisboa
  - U. Técnica de Lisboa
  - U. Nova de Lisboa
  - ISCTE
  - U. Aberta
  - U. Évora
  - U. Algarve
A compass rose with N (North) is also visible.&lt;/img&gt;

Ilustração 30 - Rede pública universitária de Portugal

No âmbito do projecto, à lista de instituições públicas de ensino superior, foram retirados dois estabelecimentos de ensino, por apresentarem características específicas. A UAb, Universidade Aberta, é uma instituição pública de ensino superior a distância (Aberta 2008).

O ISCTE, Instituto Superior de Ciências do Trabalho e da Empresa, faz parte da rede de ensino superior público universitário, recebendo a consagração de instituto universitário não integrado, pelo Despacho Normativo nº 11/1990 (ISCTE 2006). Esta definição coloca o instituto como estabelecimento de ensino superior universitário não integrado em universidade.

Como resultado das decisões tomadas, a população a considerar para o estudo é constituída por 13 entidades, apresentadas na tabela 17.

<table>
<thead>
<tr>
<th>Instituição de Ensino Universitário</th>
<th>Endereço Web</th>
</tr>
</thead>
<tbody>
<tr>
<td>Universidade dos Açores</td>
<td>www.uac.pt</td>
</tr>
<tr>
<td>Universidade do Algarve</td>
<td>www.ualg.pt</td>
</tr>
<tr>
<td>Universidade de Aveiro</td>
<td>www.ua.pt</td>
</tr>
<tr>
<td>Universidade da Beira Interior</td>
<td>www.ubi.pt</td>
</tr>
<tr>
<td>Universidade de Coimbra</td>
<td>www.uc.pt</td>
</tr>
<tr>
<td>Universidade de Évora</td>
<td>www.uevora.pt</td>
</tr>
</tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 129

&lt;page_number&gt;107&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade de Lisboa</td>
      <td>www.ul.pt</td>
    </tr>
    <tr>
      <td>Universidade da Madeira</td>
      <td>www.uma.pt</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>www.uminho.pt</td>
    </tr>
    <tr>
      <td>Universidade Nova de Lisboa</td>
      <td>www.unl.pt</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>www.up.pt</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>www.utl.pt</td>
    </tr>
    <tr>
      <td>Universidade de Trás-os-Montes e Alto Douro</td>
      <td>www.utad.pt</td>
    </tr>
  </tbody>
</table>

Tabela 17 - Universidades públicas contempladas no estudo

Existem várias alternativas para conseguir identificar os estudos relevantes para análise. A deslocação às bibliotecas de cada universidade permitiria garantir o controlo na identificação das obras. No local poderiam ser identificados os estudos relevantes do total de obras disponíveis, mas não seriam detectáveis os estudos em depósito ou requisitados. Além destes inconvenientes, esta abordagem ainda se apresenta demasiado morosa e tem associados maiores custos relativos a tempo e deslocações necessárias.

Outra alternativa para identificar os estudos existentes seria o envio de um pequeno questionário, em forma de pedido, aos departamentos de cada universidade relacionados com a área de SI. O departamento deveria responder com informação que permitisse a identificação dos estudos úteis para este projecto, como a lista de publicações do departamento ou a lista de docentes mestres e doutorados. Esta abordagem apresenta um baixo nível de controlo sobre as respostas que se obteriam e poderia obrigar a pesquisas de publicações em todas as universidades por nome de docente.

A investigação em Portugal tem ganho maior destaque nos últimos anos, não só pelas estratégias de qualificação, mas também porque sem financiamento a instituição não funcionará. O valor financeiro atribuído às universidades depende de vários factores, entre os quais o número de alunos que abrange e a investigação produzida. A investigação quando bem sucedida e reconhecida pelas comunidades científicas, permite à universidade elevar o seu nível de prestígio, que se traduzirá num maior número de estudantes a pretenderem ingressar no estabelecimento. Por estas razões, as universidades tem apostado em publicar e apresentar a investigação que produzem, através dos seus catálogos bibliográficos ou repositórios de publicações académicas.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 130

&lt;page_number&gt;108&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Este tipo de ferramentas, catálogos e repositórios, acessíveis pela Web apresentam-se como um veículo rápido e controlável de acesso às publicações existentes. Para cada universidade foi identificado o catálogo ou os catálogos disponíveis e que continham publicações da área de SI. Em várias universidades, existe um único catálogo de acesso alimentado por várias bases de dados, habitualmente uma de cada departamento ou de cada faculdade. Outras universidades apresentam diferentes bases de dados de obras, existindo uma destinada somente a publicações académicas incluindo dissertações, teses e artigos. O terceiro cenário é a disponibilização de um catálogo bibliográfico por cada departamento ou faculdade.

Dos vários catálogos existentes, foram retirados da lista os que representavam áreas não relacionadas com SI, restando os apresentados na tabela 18.

<table>
<thead>
<tr>
<th>Universidade</th>
<th>Catálogo visado para pesquisa de estudos de SI</th>
</tr>
</thead>
<tbody>
<tr>
<td>U. Açores</td>
<td>http://www2.uac.pt/</td>
</tr>
<tr>
<td>U. Algarve</td>
<td>http://www.bib.ualg.pt/bibliotecas/</td>
</tr>
<tr>
<td>U. Aveiro</td>
<td>http://naleph.doc.ua.pt<br>http://biblioteca.sinbad.ua.pt/Teses/</td>
</tr>
<tr>
<td>U. Beira Interior</td>
<td>http://servbib.ubi.pt</td>
</tr>
<tr>
<td>U. Coimbra</td>
<td>http://www.dei.uc.pt/sibuc/PesquisaGeral/Pesquisa</td>
</tr>
<tr>
<td>U. Évora</td>
<td>http://servir.uevora.pt/</td>
</tr>
<tr>
<td>U. Lisboa</td>
<td>http://sibul.reitoria.ul.pt/</td>
</tr>
<tr>
<td>U. Madeira</td>
<td>http://aleph.uma.pt</td>
</tr>
<tr>
<td>U. Minho</td>
<td>http://aleph.sdum.uminho.pt</td>
</tr>
<tr>
<td>U. Nova de Lisboa</td>
<td>http://biblioteca.fct.unl.pt</td>
</tr>
<tr>
<td>U. Porto</td>
<td>http://repositorio.up.pt/dspace/</td>
</tr>
<tr>
<td>U. Técnica de Lisboa</td>
<td>http://thesaurus.reitoria.utl.pt</td>
</tr>
<tr>
<td>U. Trás-os-Montes e Alto Douro</td>
<td>http://biblioserver.bib.utad.pt/pacweb/</td>
</tr>
</tbody>
</table>

Tabela 18 - Catálogos bibliográficos utilizados para pesquisa

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 131

&lt;page_number&gt;109&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Dependendo das características de cada catálogo, a pesquisa dos estudos foi parametrizada de forma a enquadrar os resultados no que se pretendia:

*   Assunto: Sistemas de Informação
*   Palavra: Tese e dissertação
*   Datas: [2004, 2008]
*   Tipo de Documento: Monografias

Alguns catálogos permitem filtrar resultados por assunto, enquanto outros por palavra mas apenas alguns permitem aplicar vários filtros em simultâneo.

Nas bibliotecas que disponibilizam catálogos específicos de teses os resultados foram filtrados, onde possível, por assunto ou palavra “Sistemas de Informação”. Onde não foi possível fazer este tipo filtragem, foi verificado em todos os resultados do catálogo, quais os estudos que se enquadravam nos parâmetros definidos.

Nas bibliotecas que apresentam catálogos gerais de departamentos ou de faculdades, os resultados foram filtrados, onde possível, por assunto e por palavra (ver tabela 19).

<table>
<thead>
<tr>
<th>Universidade</th>
<th>Data Pesquisa</th>
<th>Catálogo</th>
<th>Filtros Aplicados</th>
<th>Nº Estudos</th>
</tr>
</thead>
<tbody>
<tr>
<td>U. Açores</td>
<td>11-03-2008</td>
<td>UAC</td>
<td>Palavra: Tese<br>Ano:[2004, 2008]</td>
<td>571</td>
</tr>
<tr>
<td>U. Algarve</td>
<td>28-02-2008</td>
<td>FEUA</td>
<td>Assunto: sistemas de informação</td>
<td>528</td>
</tr>
<tr>
<td>U. Aveiro</td>
<td>26-02-2008</td>
<td>Geral</td>
<td>Palavra: Tese<br>Assunto: Informação</td>
<td>30</td>
</tr>
<tr>
<td></td>
<td>27-02-2008</td>
<td>Teses</td>
<td>Assunto: Informação</td>
<td>43</td>
</tr>
<tr>
<td>U. Beira Interior</td>
<td>09-03-2008</td>
<td>UBI</td>
<td>Assunto: Sistemas de Informação</td>
<td>81</td>
</tr>
<tr>
<td>U. Coimbra</td>
<td>27-02-2008</td>
<td>Teses</td>
<td>Assunto: Sistemas de Informação<br>Ano:[2004, 2008]</td>
<td>2</td>
</tr>
</tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 132

&lt;page_number&gt;110&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>U. Évora</td>
      <td>27-02-2008</td>
      <td>Geral</td>
      <td>Palavra: Tese<br>Assunto: Sistemas de Informação</td>
      <td>27</td>
    </tr>
    <tr>
      <td>U. Lisboa</td>
      <td>04-03-2008</td>
      <td>FC</td>
      <td>Palavra: Tese</td>
      <td>2097</td>
    </tr>
    <tr>
      <td>U. Madeira</td>
      <td>11-03-2008</td>
      <td>UMA</td>
      <td>Palavra: Tese<br>Ano:[2004, 2008]</td>
      <td>76</td>
    </tr>
    <tr>
      <td rowspan="2">U. Minho</td>
      <td>24-02-2008</td>
      <td>Geral</td>
      <td>Sem filtros</td>
      <td>319</td>
    </tr>
    <tr>
      <td>24-02-2008</td>
      <td>Teses</td>
      <td>Palavra: Sistemas de Informação</td>
      <td>112</td>
    </tr>
    <tr>
      <td>U. Nova de Lisboa</td>
      <td>04-03-2008</td>
      <td>FCT</td>
      <td>Palavra: Tese</td>
      <td>159</td>
    </tr>
    <tr>
      <td rowspan="3">U. Porto</td>
      <td>18-02-2008</td>
      <td>Geral</td>
      <td>Palavra: Sistemas de Informação</td>
      <td>420</td>
    </tr>
    <tr>
      <td>06-03-2008</td>
      <td>IST</td>
      <td>Palavra: Tese<br>Ano:[2004, 2008]</td>
      <td>284</td>
    </tr>
    <tr>
      <td>09-03-2008</td>
      <td>ISEG</td>
      <td>Palavra: Tese<br>Ano:[2004, 2008]<br>Assunto: Sistemas de Informação</td>
      <td>63</td>
    </tr>
    <tr>
      <td>U. Trás-os-Montes e Alto Douro</td>
      <td>10-03-2008</td>
      <td>UTAD</td>
      <td>Palavra: Tese<br>Ano:[2004, 2008]</td>
      <td>494</td>
    </tr>
  </tbody>
</table>

Tabela 19 - Possíveis estudos de Sistemas de Informação

Com os constrangimentos encontrados nas ferramentas de pesquisa, que não permitiam parametrizar todas as variáveis do âmbito definido, foram identificadas 5306 possíveis obras de interesse. A todos os registos identificados foi analisado o resumo e/ou o índice assim como os campos de catalogação, de forma a determinar quais dos 5306 estudos eram efectivamente da área de SI. Tarefa morosa, mas que permitiu identificar um total de 187 teses e dissertações de SI publicadas após 2003 e até à data de pesquisa, Fevereiro, Março de 2008.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 133

&lt;page_number&gt;111&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Para cada estudo reconhecido como de SI foi recolhida informação que o permitia identificar para futura caracterização, apresentada na figura 31. Foi criada uma tabela que armazena os principais dados do estudo:

*   Universidade;
*   Catálogo;
*   Ano de Publicação;
*   Tipo de Estudo;
    *   Mestrado/Doutoramento.
*   Título do Estudo;
*   Autor do Estudo;
*   Número PDF.

<table>
<thead>
<tr>
<th>A</th>
<th>B</th>
<th>C</th>
<th>D</th>
<th>E</th>
<th>F</th>
<th>G</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td><b>Universidade</b></td>
<td><b>Catálogo</b></td>
<td><b>PDF</b></td>
<td><b>Ano</b></td>
<td><b>Tipo de Estudo</b></td>
<td><b>Título</b></td>
<td><b>Autor</b></td>
</tr>
<tr>
<td>2</td>
<td>Universidade de Lisboa</td>
<td>Faculdade de Ciências</td>
<td>1</td>
<td>2006</td>
<td>Mestrado</td>
<td>Concepção e aplicação a um site de astronomia como recurso potenciador da aprendizagem en ciencias : um estudo com alunos de Ensino Básico</td>
<td>Rui Miguel Rodrigues Pereira</td>
</tr>
<tr>
<td>12</td>
<td>Universidade Nova de Lisboa</td>
<td>Faculdade de Ciências e Tecnologia</td>
<td>1</td>
<td>2004</td>
<td>Doutoramento</td>
<td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de</td>
<td>José Luís Mota Pereira</td>
</tr>
<tr>
<td>18</td>
<td>Universidade Técnica de Lisboa</td>
<td>Instituto Superior Técnico</td>
<td>5</td>
<td>2006</td>
<td>Doutoramento</td>
<td>Designing for workstyle transitions: interaction design tools for software engineering</td>
<td>Pedro Filipe Pereira Campos</td>
</tr>
</tbody>
</table>

Ilustração 31 - Estrutura da informação armazenada relativa a estudos de Sistemas de Informação

A coluna PDF serve para estabelecer ligação a um ficheiro deste formato que contém a impressão digital dos dados de catalogação do estudo respectivo, ilustrado na figura 32.

&lt;img&gt;Image showing a folder named "CatalogoTeses" with several PDF files listed, each with their file size and type (Adobe Acrobat Document).&lt;/img&gt;

Ilustração 32 - Impressão digital dos resultados de pesquisa bibliográfica

O âmbito de SI engloba múltiplas temáticas, algumas delas estão relacionadas com sistemas aplicacionais mas de forma indirecta, como realidade virtual, inteligência artificial, etc. O

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 134

&lt;page_number&gt;112&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

domínio de temáticas a ter em conta neste projecto foi focalizado em SIO e apenas os estudos desta área serão alvo de análise para a caracterização da investigação em SI em Portugal. À lista de 187 estudos de SI, foram retiradas as obras que não se enquadram em SIO, reduzindo o número total de estudos a caracterizar para 107.

Ao efectuar uma análise à lista verificou-se que existem vários estudos repetidos. Os estudos estão associados a pesquisas em diferentes universidades, o que pressupõe que provavelmente estas dissertações e teses tenham sido publicadas na universidade que geriu o curso frequentado e na universidade a que estava associado o investigador, mas haverá com certeza outras razões, além deste pressuposto. Por exemplo, a tese, “Sistemas de informação para o novo paradigma organizacional: O contributo dos sistemas de informação cooperativos”, de José Luís Mota Pereira, aparece nas pesquisas de sete universidades. Cada estudo só será analisado numa única universidade, como tal e perante este cenário, faz sentido eliminar da lista as linhas que repetem referência a um mesmo estudo.

Após este filtro, que identificou 17 estudos repetidos na lista, o total de dissertações e teses a analisar passou de 107 para 90.

A tabela que apresenta os 107 registos identificados relativamente a estudos em SIO encontra-se em anexo na secção “Dissertações e Teses identificadas em Sistemas de Informação Organizacionais” deste projecto. A mesma tabela apresenta, de forma rasurada, os registos dos estudos verificados como repetidos.

**3.1.2.ANÁLISE DOS ESTUDOS RELEVANTES**

O trabalho realizado relativo ao capítulo “Instrumentos para Investigação em Sistemas de Informação”, permitiu recolher e analisar informação suficiente para a compreensão de cada instrumento de investigação. Este conhecimento mostra-se essencial para ser possível caracterizar cada estudo de acordo com os objectivos pretendidos.

A identificação dos instrumentos adoptados pelo investigador num determinado estudo, obriga à leitura deste, assim como uma análise e reflexão das acções apresentadas e descritas pelo investigador ao longo do documento. Para tal, é necessário ter acesso ao estudo durante um período de tempo que permita realizar este tipo de decomposição.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 135

&lt;page_number&gt;113&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Algumas das universidades além de apostarem na publicação dos seus feitos científicos, através dos catálogos bibliográficos e repositórios, estão também a disponibilizar nessas mesmas ferramentas o acesso aos estudos, apresentados em suporte digital, em formato PDF.

Dos 90 estudos de SIO, 65 não estão disponíveis à distância. Este rácio representa que 27,8% dos estudos científicos do formato dissertação e tese, produzidos entre 2004 e 2008, relacionados com a área de SIO, estão disponíveis ao público através de plataformas Web.
Informação apresentada na figura 33.

&lt;img&gt;Pie chart showing availability of studies on the Internet. The chart has two segments: "Acessíveis pela Web" (Accessible via Web) at 28% and "Não acessíveis pela Web" (Not accessible via Web) at 72%. The legend indicates these categories.&lt;/img&gt;

Ilustração 33 - Disponibilidade dos estudos na Internet

As percentagens apresentadas no gráfico acima espelham a quantidade de estudos disponíveis pela Web, nas várias universidades. A informação permite criar a figura 34 da seguinte forma:

&lt;img&gt;Bar chart comparing the number of studies available on the Internet across different universities. Each university is represented by three bars: "Não acessíveis pela Web" (Not accessible via Web), "Acessíveis pela Web" (Accessible via Web), and "Nº de Estudos Identificados" (Number of Studies Identified). The universities listed are U. Trás-os-Montes..., U. Técnica de Lisboa, U. Porto, U. Nova de Lisboa, U. Minho, U. Madeira, U. Lisboa, U. Évora, U. Coimbra, U. Beira Interior, U. Aveiro, U. Algarve, and U. Açores. The chart shows that U. Técnica de Lisboa has the highest number of studies available online, while U. Lisboa and U. Coimbra have the lowest.&lt;/img&gt;

Ilustração 34 - Estudos acessíveis na Internet, por universidade

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 136

&lt;page_number&gt;114&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Os 25 estudos obtidos à distância começaram a ser analisados logo após a recolha e análise da informação sobre os instrumentos de investigação.

Dependendo da estrutura da dissertação ou tese, da complexidade do fenómeno e da forma, explicita ou não, como o trabalho realizado é apresentado, este tipo de caracterização pode consumir pouco ou muito tempo. A identificação correcta dos instrumentos aplicados em cada estudo obriga a um exame detalhado sobre diferentes secções do documento em questão:

*   Análise dos objectivos a que o estudo se propõe;
*   Verificação de indicação de metodologia e abordagem seguida;
*   Reflexão sobre o conteúdo apresentado;
*   Análise à forma de apresentação dos resultados;
*   Identificação das acções realizadas pelo investigador.

Alguns dos estudos não obrigam à realização de todas estas tarefas. Por exemplo, se o estudo refere a metodologia e técnicas adoptadas é realizada uma leitura do documento que permita identificar que as acções apresentadas pelo investigador correspondem à metodologia e técnicas por ele apresentadas. Em oposição, em estudos sem referência a metodologia ou técnicas adoptadas, obriga à realização de todas as tarefas indicadas, para se conseguir identificar metodologia, técnicas, abordagem e epistemologia adoptada. Nestes casos, só uma reflexão cuidada da informação apresentada permite distinguir a metodologia, especialmente quando se trata de uma que tenha algumas semelhanças com outra metodologia, como é o caso de Action Research com Case Study e esta última com Grounded Theory.

As tarefas apresentadas na tabela 20, para examinar um estudo correspondem às análises com maior efeito num processo de caracterização. Outras tarefas podem ter de ser realizadas, mas na larga maioria dos casos, estas permitem chegar à identificação dos instrumentos de investigação adoptados.

Análise dos objectivos a que o estudo se propõe

Os objectivos do estudo normalmente apresentam um enquadramento ao tipo de resultado pretendido, permitindo diminuir o leque de possibilidades quanto à metodologia, em especial em estudos Case Study e Survey. Nos objectivos é comum aparecer a indicação da teoria a provar, o que pode permitir identificar a abordagem do estudo.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 137

&lt;page_number&gt;115&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

---

**Verificação de indicação de metodologia e abordagem seguida**

Quando presente esta informação no estudo, existe logo à partida a indicação da metodologia e técnicas adoptadas e ainda eventualmente a abordagem. Será então necessário continuar a analisar o estudo procurando informação que comprove o referido pelo autor. É pouco provável mas possível que a metodologia referida não corresponda à realmente aplicada. O investigador pode ter a intenção de aplicar determinada metodologia, mas ao trocar a estrutura e ferramentas durante a realização do estudo, pode cair na estrutura de uma outra metodologia.

---

**Reflexão sobre o conteúdo apresentado**

Esta tarefa é bastante morosa porque obriga à leitura, análise e compreensão das actividades realizadas pelo investigador. Só com a identificação das tarefas realizadas e da sequência entre elas é possível identificar claramente qual a metodologia adoptada.

Esta tarefa é necessária quando não há uma referência clara aos instrumentos de investigação seleccionados e os objectivos do estudo não são claros.

---

**Análise à forma de apresentação dos resultados**

É obrigatória a análise aos resultados do projecto. Só verificando que tipo de interpretação é feita sobre os resultados se pode concluir a epistemologia adoptada pelo investigador e por vezes, com as metodologias híbridas, se consegue identificar a abordagem da investigação.

---

**Identificação das acções realizadas pelo investigador**

Se o documento estiver estruturado de forma a reflectir as principais fases ou etapas do projecto realizado, é possível com informação dos objectivos circunscrever as metodologias possivelmente adoptadas. Por vezes o investigador usa instrumentos de investigação que não se apercebe, como é habitual com Archival Research.

---

Tabela 20 - Principais tarefas na análise de um estudo

Para auxiliar o processo de análise recorreu-se ao modelo de classificação de metodologias e técnicas quanto à abordagem. Esta ferramenta demonstrou-se uma mais-valia, especialmente em situações de dúvida entre metodologias semelhantes.

---

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 138

&lt;page_number&gt;116&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Relativamente aos estudos não acessíveis pela Web, decidiu-se recorrer ao protocolo Empréstimo Inter Bibliotecas (EIB), para tentar obter os estudos durante um período de tempo suficiente para efectuar análise.

O protocolo EIB consiste em obter documentos que não se encontram nos fundos dos serviços de documentação da instituição do investigador e esta solicitando o seu empréstimo a outras bibliotecas portuguesas ou estrangeiras. Dependendo da documentação necessária, os serviços locais solicitam uma reprodução ou envio da obra. No último caso, o leitor só poderá consultar localmente, na sala de leitura da biblioteca da instituição a que pertence o investigador (IPLeiria 2008).

No seguimento desta informação foi solicitado aos Serviços de Documentação do IPLeiria o recurso a este protocolo, para os estudos não acessíveis a distância. Para o processo de pedido de obras, foram definidas duas fases, para evitar o risco de obter muitos dos estudos no mesmo período de tempo, podendo impossibilitar uma análise cuidada a todos eles. Para a primeira fase foram marcados 38 e para uma segunda fase de pedidos, 27 estudos. A segunda fase deveria ocorrer quando estivesse quase completada a primeira.

Contudo, o protocolo não se mostrou muito eficaz. As respostas da maioria das instituições a quem foi solicitado o empréstimo de estudos, foram evasivas, protelaram a decisão ou foram simplesmente negativas. A excepção foi a Universidade do Minho que cedeu ao IPLeiria todos os estudos solicitados.

A resposta mais restritiva, relativamente ao EIB, foi da biblioteca do Instituto Superior de Economia e Gestão, da Universidade Técnica de Lisboa, que indicou a necessidade de pedido de autorização e aprovação deste, para acesso às obras, na própria biblioteca desse instituto.

A alternativa ao EIB foi a deslocação à biblioteca que possui o estudo a analisar e tentar localmente aceder ao estudo e efectuar a caracterização necessária.

Foi este o caminho encontrado para chegar a 44 dos estudos identificados, dos quais 37 foram analisados quanto aos instrumentos de investigação e 7 não o foram, por estarem indisponíveis para consulta, devido a prévio empréstimo da obra. Na secção “Estudos Visados nas Deslocações às Bibliotecas”, dos Apêndices, foi definida uma tabela que apresenta quais dos 44 estudos foram analisados.

Relativamente aos 17 estudos identificados como repetidos na lista inicial das 107 dissertações e teses, o registo original de cada cópia foi analisado numa única universidade. A indicação da

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 139

&lt;page_number&gt;117&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

localização onde ocorreu a análise destas obras é ilustrada em anexo, na secção “Análise dos Estudos Repetidos”.

Existe um conjunto de dissertações e teses que não estão acessíveis pela Web e que não houve oportunidade de analisar, devido à distância das bibliotecas e a limitações de agenda para realizar as necessárias deslocações. São nove os estudos nestas condições e que ficam registados para trabalho futuro, na secção “Estudos não Analisados” dos Apêndices.

O total de 90 estudos, seleccionados para análise, da área de SIO, foi repartido em conjuntos que tiveram um tratamento diferente.

As visitas às bibliotecas visam aceder a 44 estudos, dos quais sete se verificou que não estavam indisponíveis para consulta. Nestas visitas, 37 obras foram devidamente analisadas.

A indisponibilidade e a distância impediram a caracterização de nove estudos. Este número e os sete indisponíveis nas visitas às bibliotecas perfazem os 16 estudos não analisados neste projecto.

Os estudos devidamente analisados e caracterizados foram 74, divididos em três grupos:

*   37 Estudos foram analisados localmente, nas respectivas bibliotecas;
*   26 Estudos, acessíveis online, foram analisados em suporte digital;
*   11 Estudos, fruto do protocolo EIB, foram analisados mediante a recepção destes.

Assim, o trabalho no âmbito deste projecto concretizou uma análise, quanto aos instrumentos de investigação, em 74 estudos de um total de 90, ou seja 82,2%. Índice ilustrado nas figuras 35 e 36.

&lt;img&gt;Pie chart showing percentage of studies analyzed (18% not analyzed, 82% analyzed)&lt;/img&gt;
Ilustração 35 - Índice percentual de estudos analisados

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 140

&lt;page_number&gt;118&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;A bar chart showing the distribution of studies analyzed versus unanalyzed studies.
The y-axis ranges from 0 to 40 in increments of 5.
The x-axis has four categories:
- Disponíveis Online (Online Available)
- Disponíveis nas Bibliotecas (Available in Libraries)
- Disponíveis pelo EIB (Available via EIB)
- Não analisados (Not Analyzed)

The values are:
- Disponíveis Online: ~26
- Disponíveis nas Bibliotecas: ~37
- Disponíveis pelo EIB: ~11
- Não analisados: ~16&lt;/img&gt;

Ilustração 36 - Estudos analisados versus estudos não analisados

## 3.2.ANÁLISE DE DADOS E DISCUSSÃO DE RESULTADOS

O trabalho realizado ao longo deste projecto permitiu recolher informação que permite apresentar uma visão global da investigação em SI em Portugal, em particular a investigação desenvolvida nas universidades públicas sobre SIO.

Foram apresentados diferentes conjuntos de estudos ao longo da descrição do trabalho realizado. O primeiro conjunto de dissertações e teses identificado (ver figura 37) diz respeito ao total de estudos reconhecidos da área de SI, apresentados nas ferramentas de catálogo bibliográfico das universidades e publicados entre 2004 e 2007. Mais concretamente desde 01 de Janeiro de 2004 até ao mês de pesquisa que, dependendo da universidade, foi Fevereiro ou Março de 2008. Este conjunto constituído por 187 estudos, incluí no ano 2004, a tese “Contribuição para uma engenharia do contexto” de Licínio Gomes Roque, por no catálogo da Universidade de Coimbra, aparecer como “2003?”. Contém ainda, os estudos que se vieram a verificar repetidos (17) e a dissertação “Estratégia de integração de sistemas de informação de unidade hospitalar: caso de estudo Hospital Pulido Valente” de Luís Eduardo de Moura Trindade Elias que foi publicada em 2008, na Universidade Técnica de Lisboa.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 141

&lt;page_number&gt;119&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;A horizontal bar chart showing the number of studies identified in Systems of Information (SIO) by university.
The universities listed on the y-axis are:
U. Trás-os-Montes e ...
U. Técnica de Lisboa
U. Porto
U. Nova de Lisboa
U. Minho
U. Madeira
U. Lisboa
U. Évora
U. Coimbra
U. Beira Interior
U. Aveiro
U. Algarve
U. Açores

The corresponding x-axis values are:
U. Trás-os-Montes e ...: 10
U. Técnica de Lisboa: 52
U. Porto: 35
U. Nova de Lisboa: 1
U. Minho: 42
U. Madeira: 5
U. Lisboa: 9
U. Évora: 2
U. Coimbra: 7
U. Beira Interior: 2
U. Aveiro: 15
U. Algarve: 2
U. Açores: 5&lt;/img&gt;

Ilustração 37 - Estudos identificados de Sistemas de Informação

Do conjunto acima apresentado são eliminados 18 estudos. Os 17 repetidos entre as universidades, mantendo-se o registo original associado à universidade onde foi analisado e elimina-se do conjunto o registo de 2008 para que a tendência não se apresente desvirtualizada. Assim, o número de dissertações e teses distintas de SI é de 169, que filtrado por estudo de SIO reduz para 89, como ilustrado pela figura 38.

<mermaid>
graph TD
    A[5306 : Possíveis estudos em SI] --> B[187 : Dissertações e teses identificados em SI]
    B --> C[170 : Estudos em SI, sem repetições de registos]
    C --> D[169 : Estudos distintos em SI em [2004, 2007]]
    D --> E[89 : Estudos distintos de SIO em [2004, 2007]]
</mermaid>

Ilustração 38 - Conjuntos de estudos definidos ao longo do projecto

A distribuição dos 169 trabalhos de SI, pelas universidades públicas cria o gráfico, apresentado na figura 39:

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 142

&lt;page_number&gt;120&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;A horizontal bar chart showing the number of studies identified in Systems of Information (SIO) at various Portuguese public universities.
The x-axis represents the years 2004-2007.
The y-axis represents the number of studies, ranging from 0 to 60.
The bars represent:
U. Trás-os-Montes e ... - 9
U. Técnica de Lisboa - 49
U. Porto - 35
U. Nova de Lisboa - 0
U. Minho - 40
U. Madeira - 2
U. Lisboa - 9
U. Évora - 2
U. Coimbra - 7
U. Beira Interior - 0
U. Aveiro - 12
U. Algarve - 2
U. Açores - 2&lt;/img&gt;

Ilustração 39 - Estudos identificados de Sistemas de Informação, sem registos repetidos

Os dados recolhidos também permitem verificar a distribuição do número de estudos ao longo do tempo, contemplado no período de pesquisa [2004, 2007], como se verifica na figura 40.

Verifica-se uma quebra no número de estudos de 2007, que provavelmente se deve ao facto das dissertações e teses desse ano, ainda não estarem inseridas nos sistemas de gestão bibliográfica, logo não terem sido identificadas.

&lt;img&gt;A line graph showing the distribution of studies of Systems of Information (SIO), by year.
The y-axis represents the number of studies, ranging from 0 to 60.
The x-axis represents the years 2004-2007.
The data points are:
2004 - 38
2005 - 54
2006 - 52
2007 - 26&lt;/img&gt;

Ilustração 40 - Distribuição de estudos de Sistemas de Informação, por anos

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 143

&lt;page_number&gt;121&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

O segundo conjunto identificado filtra nos estudos de SI, apenas os que estão relacionados com organizações, ou seja SIO. O número de estudos que constitui o leque é de 89. É possível apresentar um quadro comparativo de estudos de SI e de estudos de SIO em cada universidade (figuras 41, 42 e 43) e desta forma identificar quais as universidades que na área de SI se dedicam em especial a estudos de âmbito organizacional.

&lt;img&gt;Bar chart showing the number of studies in Information Systems (SI) and Organizational Information Systems (SIO) by university.
The x-axis lists universities: U. Açores, U. Algarve, U. Aveiro, U. Beira Interior, U. Coimbra, U. Évora, U. Lisboa, U. Madeira, U. Minho, U. Nova de Lisboa, U. Porto, U. Técnica de Lisboa, U. Trás-os-Montes e ...
The y-axis ranges from 0 to 50.
For each university:
U. Açores: SI = 2, SIO = 0
U. Algarve: SI = 1, SIO = 0
U. Aveiro: SI = 12, SIO = 2
U. Beira Interior: SI = 7, SIO = 0
U. Coimbra: SI = 8, SIO = 1
U. Évora: SI = 2, SIO = 1
U. Lisboa: SI = 9, SIO = 2
U. Madeira: SI = 1, SIO = 0
U. Minho: SI = 40, SIO = 22
U. Nova de Lisboa: SI = 50, SIO = 36
U. Porto: SI = 35, SIO = 20
U. Técnica de Lisboa: SI = 48, SIO = 36
U. Trás-os-Montes e ...: SI = 9, SIO = 3
Legend: Blue = Estudos de SI, Red = Estudos de SIO.&lt;/img&gt;

Ilustração 41 - Estudos de Sistemas de Informação, dos quais em Sistemas de Informação Organizacionais, por universidade

&lt;img&gt;Horizontal bar chart showing the number of studies identified in Organizational Information Systems (SIO) by university.
The x-axis ranges from 0 to 40.
The y-axis lists universities with their corresponding values:
U. Trás-os-Montes e ...: 3
U. Técnica de Lisboa: 36
U. Porto: 20
U. Nova de Lisboa: 0
U. Minho: 22
U. Madeira: 0
U. Lisboa: 2
U. Évora: 2
U. Coimbra: 1
U. Beira Interior: 0
U. Aveiro: 2
U. Algarve: 1
U. Açores: 0
Values are represented by red bars.&lt;/img&gt;

Ilustração 42 - Estudos identificados de Sistemas de Informação Organizacionais

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 144

&lt;page_number&gt;122&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;A line graph showing the distribution of studies on Organizational Information Systems (SIO) across Portuguese public universities from 2004 to 2007.
The y-axis ranges from 0 to 40, marked at intervals of 5.
The x-axis shows the years 2004, 2005, 2006, and 2007.
The data points are:
- 2004: 20 studies
- 2005: 35 studies
- 2006: 22 studies
- 2007: 13 studies
The trend starts at 20 in 2004, rises sharply to 35 in 2005, then declines to 22 in 2006, and finally drops to 13 in 2007.&lt;/img&gt;

Ilustração 43 - Distribuição de estudos de Sistemas de Informação Organizacionais, por anos

O número de universidades visadas na análise dos dados reduz à medida que se aplicam filtros sobre os registos identificados. A primeira fase, a pesquisa de estudos de SI, identificou trabalhos associados a todas as universidades seleccionadas para este trabalho. Com a eliminação de registos duplicados, o leque de universidades reduz de 13 para 11. E ao focar o trabalho em estudos relacionados com SIO este total de instituições sofre ainda mais e é reduzido para 9, como apresentado pela figura 44.

<mermaid>
graph TD
    A[13 : Universidades públicas em Portugal] --> B[13 : Universidades apresentam estudos relacionados com SI]
    B --> C[11 : Universidades apresentam estudos não repetidos em SI]
    C --> D[9 : Universidades apresentam estudos relacionados com SIO]
    D --> E[7 : Universidades visadas nos estudos analisados]
</mermaid>

Ilustração 44 - Conjuntos de universidades identificados ao longo do estudo

Se for analisada a evolução em cada universidade que apresentam estudos de SIO (ver tabela 21), ao longo do período abrangido pelo estudo, é possível verificar que 2005 foi o ano de

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 145

&lt;page_number&gt;123&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

maior volume de investigação na área e que na globalidade, após esse ano, a investigação da área tem vindo a diminuir.

<table>
  <thead>
    <tr>
      <th></th>
      <th>2004</th>
      <th>2005</th>
      <th>2006</th>
      <th>2007</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>U. Algarve</td>
      <td></td>
      <td>1</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>U. Aveiro</td>
      <td></td>
      <td>1</td>
      <td>1</td>
      <td></td>
    </tr>
    <tr>
      <td>U. Coimbra</td>
      <td>1</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>U. Évora</td>
      <td></td>
      <td>1</td>
      <td>1</td>
      <td></td>
    </tr>
    <tr>
      <td>U. Lisboa</td>
      <td>1</td>
      <td>1</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>U. Minho</td>
      <td>6</td>
      <td>9</td>
      <td>5</td>
      <td>2</td>
    </tr>
    <tr>
      <td>U. Porto</td>
      <td>8</td>
      <td>6</td>
      <td>5</td>
      <td>1</td>
    </tr>
    <tr>
      <td>U. Técnica de Lisboa</td>
      <td>3</td>
      <td>14</td>
      <td>9</td>
      <td>10</td>
    </tr>
    <tr>
      <td>U. Trás-os-Montes e ...</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td></td>
    </tr>
  </tbody>
</table>

Tabela 21 - Estudos de Sistemas de Informação Organizacionais por anos, em cada universidade

&lt;img&gt;A line graph showing the evolution of studies in Organizational Information Systems (SIO) by university from 2004 to 2007.
The y-axis ranges from 0 to 16.
The x-axis shows the years 2004, 2005, 2006, and 2007.
Legend:
- U. Algarve (blue line)
- U. Aveiro (red line)
- U. Coimbra (green line)
- U. Évora (purple line)
- U. Lisboa (cyan line)
- U. Trás-os-Montes e ... (light green line)
- U. Porto (dark blue line)
- U. Minho (orange line)
- U. Técnica de Lisboa (pink line)

Data points (approximate):
- U. Algarve: 2004 ~8, 2005 ~5, 2006 ~2, 2007 ~0
- U. Aveiro: 2004 ~0, 2005 ~1, 2006 ~1, 2007 ~1
- U. Coimbra: 2004 ~3, 2005 ~0, 2006 ~0, 2007 ~0
- U. Évora: 2004 ~7, 2005 ~0, 2006 ~0, 2007 ~0
- U. Lisboa: 2004 ~1, 2005 ~1, 2006 ~0, 2007 ~0
- U. Trás-os-Montes e ...: 2004 ~3, 2005 ~0, 2006 ~0, 2007 ~0
- U. Porto: 2004 ~8, 2005 ~6, 2006 ~5, 2007 ~1
- U. Minho: 2004 ~6, 2005 ~9, 2006 ~5, 2007 ~2
- U. Técnica de Lisboa: 2004 ~3, 2005 ~14, 2006 ~9, 2007 ~10&lt;/img&gt;

Ilustração 45 - Evolução dos estudos de Sistemas de Informação Organizacionais, por universidade

A caracterização de 73 estudos de um total de 89, representa uma cobertura de 82%, o que permite assegurar a apresentação de relacionamentos e tendências, relativamente aos instrumentos de investigação. Relativamente à população de universidades incluída nos dados recolhidos, sendo o total de universidades com estudos em SIO 9 e o total das atingidas nos estudos analisados de 7, a cobertura calculada é de 77,7%. Índice apresentado na figura 46.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 146

&lt;page_number&gt;124&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;Pie chart showing percentage of universities analyzed. The pie chart is divided into two segments: a large blue segment representing 78% labeled "Universidades atingidas pela análise" (Universities affected by the analysis) and a smaller red segment representing 22% labeled "Universidades não atingidas pela análise" (Universities not affected by the analysis).&lt;/img&gt;

Ilustração 46 - Índice percentual de universidades analisadas

Existe apenas uma tese que recorreu à triangulação. Este facto indica que não é comum nos estudos de SIO em Portugal se recorrer à triangulação.

As análises realizadas identificaram apenas algumas metodologias aplicadas, relativamente ao conjunto de metodologias disponíveis para investigação em SI. As metodologias mais adoptadas em Portugal para SIO são, Action Research e Case Study, como mostra a tabela 22.

<table>
<thead>
<tr>
<th>Metodologia</th>
<th>Nº de estudos</th>
</tr>
</thead>
<tbody>
<tr>
<td>Action Research</td>
<td>31</td>
</tr>
<tr>
<td>Case Study</td>
<td>28</td>
</tr>
<tr>
<td>Survey</td>
<td>6</td>
</tr>
<tr>
<td>Archival Research</td>
<td>4</td>
</tr>
<tr>
<td>Grounded Theory</td>
<td>3</td>
</tr>
<tr>
<td>Design Research</td>
<td>1</td>
</tr>
</tbody>
</table>

Tabela 22 - Estudos identificados em cada metodologia

É provável que a selecção recaia sobre estas duas metodologias devido às características que possuem e à facilidade de as aplicar. A primeira, Action Research, representa a denominada estrutura típica de investigação, ilustrada na figura 47:

<mermaid>
graph LR
    A[Levantamento teórico] --> B[Acção]
    B --> C[Reflexão]
    C --> D[Cria modelo]
</mermaid>

Ilustração 47 - Estrutura típica da investigação

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 147

&lt;page_number&gt;125&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

A segunda, Case Study, permite para muitos investigadores o desenvolvimento do projecto num ambiente conhecido e dominado e permite de forma simples validar a teoria criada.

&lt;img&gt;Bar chart showing research methodologies used in organizational information systems research in Portugal. The x-axis ranges from 0 to 35. The y-axis lists the methodologies: Design Research (short bar), Grounded Theory (medium bar), Archival Research (medium bar), Survey (medium bar), Case Study (long bar), and Action Research (longest bar). The approximate values are: Design Research ~1, Grounded Theory ~3, Archival Research ~4, Survey ~6, Case Study ~28, and Action Research ~31.&lt;/img&gt;

Ilustração 48 - Metodologias na investigação de Sistemas de Informação Organizacionais em Portugal

&lt;img&gt;Pie chart showing the percentage distribution of research methodologies in organizational information systems research in Portugal. The chart is divided into six segments: Action Research (43%), Case Study (38%), Survey (8%), Archival Research (6%), Grounded Theory (4%), and Design Research (1%). Each segment is color-coded and labeled with its percentage.&lt;/img&gt;

Ilustração 49 - Índice percentual de metodologias na investigação de Sistemas de Informação Organizacionais em Portugal

Estes resultados, apresentados pelas figuras 48 e 49, indicam que em Portugal 43% da investigação em SIO é estruturada de acordo com a metodologia Action Research.

Relativamente às técnicas de investigação, as mais aplicadas nos trabalhos analisados estão de acordo com a abordagem das investigações. Por se tratar de uma área onde os fenómenos são

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 148

&lt;page_number&gt;126&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

de difícil medição e têm uma grande intervenção social, as técnicas que os investigadores mais recorrem são as qualitativas. Informação que se comprova ao consultar as tabelas 15 e 23.

<table>
<thead>
<tr>
<th>Técnica de investigação</th>
<th>Nº de estudos</th>
</tr>
</thead>
<tbody>
<tr>
<td>Observation</td>
<td>54</td>
</tr>
<tr>
<td>Archival Research</td>
<td>36</td>
</tr>
<tr>
<td>Interview</td>
<td>23</td>
</tr>
<tr>
<td>Survey</td>
<td>11</td>
</tr>
<tr>
<td>Measurement</td>
<td>4</td>
</tr>
<tr>
<td>DELPHI</td>
<td>1</td>
</tr>
</tbody>
</table>

Tabela 23 - Estudos identificados em cada técnica

Em Portugal, 42% dos estudos de SIO recorre à técnica de investigação Observation, como ilustrado pelas figuras 50 e 51.

&lt;img&gt;Bar chart showing the number of studies using different research techniques (Observation, Archival Research, Interview, Survey, Measurement, DELPHI) in Portugal. Observation has the highest bar, followed by Archival Research, Interview, Survey, Measurement, and DELPHI with the lowest.&lt;/img&gt;

Ilustração 50 - Técnicas na investigação de Sistemas de Informação Organizacionais em Portugal

&lt;img&gt;Pie chart showing the percentage distribution of research techniques used in SIO studies in Portugal. Observation accounts for 42%, Archival Research for 28%, Interview for 18%, Survey for 8%, Measurement for 3%, and DELPHI for 1%.&lt;/img&gt;

Ilustração 51 - Índice percentual de técnicas na investigação de Sistemas de Informação Organizacionais em Portugal

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 149

&lt;page_number&gt;127&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Tal como já referido, o investigador ao recorrer ao maior número de fontes de dados, cria uma maior confiança dos resultados perante a comunidade em que está inserido. Este exercício reclama por vezes a aplicação de diferentes técnicas de investigação num mesmo projecto, contudo em Portugal 45% dos estudos usa apenas uma única técnica de investigação (figuras 52 e 53).

&lt;img&gt;A horizontal bar chart showing the number of techniques used in studies of Organizational Information Systems.
The x-axis ranges from 0 to 35.
Four categories are displayed vertically on the left:
- Recorreram a 4 técnicas
- Recorreram a 3 técnicas
- Recorreram a 2 técnicas
- Recorreram a 1 técnica
The corresponding bars (from bottom to top) are approximately:
- Recorreram a 1 técnica: ~33 units
- Recorreram a 2 técnicas: ~25 units
- Recorreram a 3 técnicas: ~14 units
- Recorreram a 4 técnicas: ~2 units
&lt;/img&gt;

Ilustração 52 - Número de técnicas aplicadas num estudo de Sistemas de Informação Organizacionais

&lt;img&gt;A pie chart showing the percentage distribution of the number of techniques applied in studies of Organizational Information Systems.
The chart is divided into four segments:
- Recorreram a 1 técnica: 45%
- Recorreram a 2 técnicas: 34%
- Recorreram a 3 técnicas: 19%
- Recorreram a 4 técnicas: 2%
A legend on the right matches each color to its corresponding category.
&lt;/img&gt;

Ilustração 53 - Índice percentual do número de técnicas aplicadas num estudo de Sistemas de Informação Organizacionais

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 150

&lt;page_number&gt;128&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Com os dados da caracterização da investigação em SIO é factível identificar o relacionamento entre metodologias e as técnicas aplicadas nos estudos assentes nas primeiras.

<mermaid>
graph LR
    A[Action Research] -->|3| B[Interview]
    A -->|28| C[Observation]
    A -->|13| D[Archival Research]
    A -->|18| E[Measurement]

    F[Case Study] -->|1| B
    F -->|20| C
    F -->|16| D
    F -->|2| E

    G[Design Research] -->|1| B
    G -->|1| C
    G -->|1| D
    G -->|1| E

    H[Archival Research] -->|4| C
    H -->|3| D
    H -->|2| E

    I[Grounded Theory] -->|2| C
    I -->|2| D
    I -->|1| E

    J[Survey] -->|6| K[Survey]
    J -->|1| L[DELPHI]

    B -->|1| C
    B -->|1| D
    B -->|1| E
    B -->|1| K
    B -->|1| L

    C -->|1| D
    C -->|1| E
    C -->|1| K
    C -->|1| L

    D -->|1| E
    D -->|1| K
    D -->|1| L

    E -->|1| K
    E -->|1| L
</mermaid>

Ilustração 54 - Relação entre metodologias e técnicas em estudos de Sistemas de Informação Organizacionais

A figura 54 tenta representar graficamente a relação existente entre metodologia e técnica. Os dados apresentam relacionamentos que podem ser considerados mais seguros quanto mais casos com as mesmas características existirem. Para metodologias onde foram analisados mais de dez estudos é possível afirmar relacionamentos apresentados na tabela 24:

<table>
<thead>
<tr>
<th>Perc.</th>
<th>Metodologia</th>
<th>Técnica</th>
</tr>
</thead>
<tbody>
<tr>
<td>90,3%</td>
<td>dos estudos assentes em Action Research</td>
<td>recorrem a Observation</td>
</tr>
<tr>
<td>41,9%</td>
<td>dos estudos assentes em Action Research</td>
<td>recorrem a Archival Research</td>
</tr>
<tr>
<td>9,7%</td>
<td>dos estudos assentes em Action Research</td>
<td>recorrem a Interview</td>
</tr>
<tr>
<td>3,2%</td>
<td>dos estudos assentes em Action Research</td>
<td>recorrem a Measurement</td>
</tr>
<tr>
<td>3,2%</td>
<td>dos estudos assentes em Action Research</td>
<td>recorrem a Survey</td>
</tr>
</tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 151

&lt;page_number&gt;129&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

<table>
  <thead>
    <tr>
      <th>Perc.</th>
      <th>Metodologia</th>
      <th>Técnica</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>71,4%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>Observation</td>
    </tr>
    <tr>
      <td>64,3%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>Interview</td>
    </tr>
    <tr>
      <td>57,1%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>Archival Research</td>
    </tr>
    <tr>
      <td>10,7%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>Survey</td>
    </tr>
    <tr>
      <td>7,1%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>Measurement</td>
    </tr>
    <tr>
      <td>3,6%</td>
      <td>dos estudos assentes em Case Study</td>
      <td>DELPHI</td>
    </tr>
  </tbody>
</table>

Tabela 24 - Índice percentual de técnicas aplicadas em metodologias adoptadas em mais de dez estudos

Para metodologias com menos de dez estudos analisados, dada a reduzida amostragem, a probabilidade do relacionamento é com certeza mais baixa. Fica no entanto o registo através da tabela 25:

<table>
  <thead>
    <tr>
      <th>Perc.</th>
      <th>Metodologia</th>
      <th>Técnica</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>100%</td>
      <td>dos estudos assentes em Survey</td>
      <td>Survey</td>
    </tr>
    <tr>
      <td>16,7%</td>
      <td>dos estudos assentes em Survey</td>
      <td>Archival Research</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>dos estudos assentes em Archival Research</td>
      <td>Archival Research</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>dos estudos assentes em Archival Research</td>
      <td>Survey</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>dos estudos assentes em Grounded Theory</td>
      <td>Observation</td>
    </tr>
    <tr>
      <td>66,7%</td>
      <td>dos estudos assentes em Grounded Theory</td>
      <td>Archival Research</td>
    </tr>
    <tr>
      <td>66,7%</td>
      <td>dos estudos assentes em Grounded Theory</td>
      <td>Interview</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>dos estudos assentes em Design Research</td>
      <td>Observation</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>dos estudos assentes em Design Research</td>
      <td>Measurement</td>
    </tr>
  </tbody>
</table>

Tabela 25 - Índice percentual de técnicas aplicadas em metodologias adoptadas em menos de dez estudos

O facto da análise realizada incidir apenas sobre estudos relacionados com sistemas enquadrados com organizações, muito influenciadas pelos factores sociais internos e externos, está reflectido tanto na abordagem dos projectos como na forma de como os seus resultados são interpretados.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 152

&lt;page_number&gt;130&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

A caracterização desenvolvida indica que 88% dos estudos são investigações qualitativas e apenas 12% são quantitativas, ilustrada na figura 55.

&lt;img&gt;Pie chart showing 88% Qualitative and 12% Quantitative studies.&lt;/img&gt;

Ilustração 55 - Índice percentual da abordagem em estudos de Sistemas de Informação Organizacionais

Os mesmos resultados mostram que os estudos são na larga maioria Qualitative Interpretative e na minoria Qualitative Positivist, havendo um nível intermédio de nove estudos Quantitative Positivist (ver tabela 26). Calculada a percentagem, a investigação em SIO em Portugal possui em 81% dos casos uma apresentação interpretativa dos resultados obtidos (figura 56).

<table>
<thead>
<tr>
<th></th>
<th>Qualitative</th>
<th>Quantitative</th>
</tr>
</thead>
<tbody>
<tr>
<td>Positivist</td>
<td>5</td>
<td>9</td>
</tr>
<tr>
<td>Interpretative</td>
<td>59</td>
<td>-</td>
</tr>
<tr>
<td>Critical Science</td>
<td>0</td>
<td>-</td>
</tr>
</tbody>
</table>

Tabela 26 - Resumo de estudos quanto à abordagem e epistemologia

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 153

&lt;page_number&gt;131&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;Pie chart showing percentage of epistemology in SIO studies. The largest segment (81%) is Interpretative, followed by Positivist (19%), with Critical Science at 0%.&lt;/img&gt;

Ilustração 56 - Índice percentual da epistemologia em estudos de Sistemas de Informação Organizacionais

Durante a realização do trabalho de campo, foi verificado quais estudos continham referência e descrição dos instrumentos de investigação adoptados. É possível afirmar que na maioria dos estudos em SIO, 53% em concreto, não há a apresentação, descrição ou argumentação dos mecanismos de investigação adoptados ao longo do trabalho, como mostra a figura 57.

&lt;img&gt;Pie chart showing percentage of studies that mention research instruments applied in SIO studies. 53% say "Não" (No), and 47% say "Sim" (Yes).&lt;/img&gt;

Ilustração 57 - Índice percentual de estudos que referem os instrumentos de investigação aplicados em estudos de Sistemas de Informação Organizacionais

Avaliando as universidades com mais de um estudo em SIO, o panorama que reflecte esta preocupação por parte do investigador apresenta-se na figura 58:

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 154

&lt;page_number&gt;132&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;A horizontal bar chart comparing the number of studies that mention research instruments applied by university. The x-axis ranges from 0 to 25. Each university has two bars: one red (Não) and one blue (Sim). The values are:
U. Trás-os-Montes e ...: Não = 2, Sim = 1
U. Técnica de Lisboa: Não = 6, Sim = 22
U. Porto: Não = 16, Sim = 3
U. Minho: Não = 13, Sim = 6
U. Aveiro: Não = 1, Sim = 1
Legend: Red square = Não, Blue square = Sim.&lt;/img&gt;

Ilustração 58 - Estudos de Sistemas de Informação Organizacionais que referem os instrumentos de investigação aplicados, por universidade

Houve ainda oportunidade de avaliar qual o tipo de fenómeno a que se propunha cada estudo.
Informação apresentada na tabela 27.

Tendo sido definidos quatro tipos de fenómenos:

*   Problema;
*   Estudo teórico;
*   Proposta de solução;
*   Implementação ou teste.

<table>
<thead>
<tr>
<th>Problema</th>
<th>Estudo teórico</th>
<th>Proposta de solução</th>
<th>Implementação ou Teste</th>
</tr>
</thead>
<tbody>
<tr>
<td>6</td>
<td>35</td>
<td>27</td>
<td>5</td>
</tr>
</tbody>
</table>

Tabela 27 - Estudos identificados por tipo de fenómeno

Estes valores definem que 48% das investigações em SIO se propõe a elaborar um estudo teórico e que apenas 8% apresentam como objectivo a dissecação de um problema, como ilustrado na figura 59.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 155

&lt;page_number&gt;133&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

&lt;img&gt;Pie chart showing percentage distribution of research types in SIO studies at Portuguese public universities.
The pie chart is divided into four segments:
- Problema (Problem): 8%
- Estudo teórico (Theoretical Study): 48%
- Proposta de solução (Solution Proposal): 37%
- Implementação ou Teste (Implementation or Testing): 7%
A legend on the right explains the color coding for each category.&lt;/img&gt;

Ilustração 59 - Índice percentual de estudos de Sistemas de Informação Organizacionais, por tipo de fenómeno

Ao cruzar os dados de tipo de fenómeno e metodologias aplicadas nesses estudos, reúne-se informação representativa do relacionamento existente, apresentada na figura 60:

<mermaid>
graph LR
    A[Problema] -->|4| B[Case Study]
    A -->|2| C[Action Research]
    A -->|2| D[Archival Research]
    A -->|2| E[Grounded Theory]
    A -->|2| F[Survey]
    A -->|1| G[Design Research]

    H[Estudo Teórico] -->|21| B
    H -->|4| C
    H -->|3| D
    H -->|4| E
    H -->|3| F
    H -->|2| G

    I[Proposta Solução] -->|1| B
    I -->|1| C
    I -->|23| D
    I -->|1| E
    I -->|1| F
    I -->|1| G

    J[Implementação] -->|1| B
    J -->|1| C
    J -->|1| D
    J -->|1| E
    J -->|1| F
    J -->|1| G
</mermaid>

Ilustração 60 - Relação entre tipos de fenómeno e metodologias aplicadas em estudos de Sistemas de Informação Organizacionais

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 156

&lt;page_number&gt;134&lt;/page_number&gt;

3. INVESTIGAÇÃO EM SIO NAS UNIVERSIDADES PÚBLICAS PORTUGUESAS

Uma interpretação dos relacionamentos identificados na figura acima, permite identificar e determinar alguns índices percentuais, apresentados na tabela 28.

<table>
  <thead>
    <tr>
      <th>Perc.</th>
      <th>Tipo fenómeno</th>
      <th>Metodologia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>66,7%</td>
      <td>de estudos propostos a Problema</td>
      <td>asentam em Case Study</td>
    </tr>
    <tr>
      <td>33,3%</td>
      <td>de estudos propostos a Problema</td>
      <td>asentam em Action Research</td>
    </tr>
    <tr>
      <td>60,0%</td>
      <td>de estudos propostos a Estudo Teórico</td>
      <td>asentam em Case Study</td>
    </tr>
    <tr>
      <td>11,4%</td>
      <td>de estudos propostos a Estudo Teórico</td>
      <td>asentam em Action Research</td>
    </tr>
    <tr>
      <td>11,4%</td>
      <td>de estudos propostos a Estudo Teórico</td>
      <td>asentam em Survey</td>
    </tr>
    <tr>
      <td>8,6%</td>
      <td>de estudos propostos a Estudo Teórico</td>
      <td>asentam em Archival Research</td>
    </tr>
    <tr>
      <td>8,6%</td>
      <td>de estudos propostos a Estudo Teórico</td>
      <td>asentam em Grounded Theory</td>
    </tr>
    <tr>
      <td>85,2%</td>
      <td>de estudos propostos a Proposta Solução</td>
      <td>asentam em Action Research</td>
    </tr>
    <tr>
      <td>7,4%</td>
      <td>de estudos propostos a Proposta Solução</td>
      <td>asentam em Case Study</td>
    </tr>
    <tr>
      <td>3,7%</td>
      <td>de estudos propostos a Proposta Solução</td>
      <td>asentam em Archival Research</td>
    </tr>
    <tr>
      <td>3,7%</td>
      <td>de estudos propostos a Proposta Solução</td>
      <td>asentam em Survey</td>
    </tr>
    <tr>
      <td>40,0%</td>
      <td>de estudos propostos a Implementação</td>
      <td>asentam em Action Research</td>
    </tr>
    <tr>
      <td>20,0%</td>
      <td>de estudos propostos a Implementação</td>
      <td>asentam em Design Research</td>
    </tr>
    <tr>
      <td>20,0%</td>
      <td>de estudos propostos a Implementação</td>
      <td>asentam em Case Study</td>
    </tr>
    <tr>
      <td>20,0%</td>
      <td>de estudos propostos a Implementação</td>
      <td>asentam em Survey</td>
    </tr>
  </tbody>
</table>

Tabela 28 - Índice percentual de metodologias aplicadas por tipo de fenómeno

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 157

&lt;page_number&gt;135&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

# 4. CONSIDERAÇÕES FINAIS

Foi proposto com a presente dissertação identificar os conceitos e instrumentos, utilizados na investigação em SI e apresentar de forma clara o leque de opções existente. Com esta informação, procura-se também analisar os projectos desenvolvidos na área em Portugal, perseguindo como resultado a caracterização da investigação em SIO em Portugal. É sobre o trabalho desenvolvido que neste capítulo se apresentam algumas considerações, uma breve síntese da informação recolhida e apresentam-se aqueles que se julgam ser os seus principais contributos. Por fim, identificam-se eventuais actividades a desenvolver de forma a enriquecer e alargar o âmbito do projecto.

## 4.1.SÍNTESE DO TRABALHO

O trabalho desenvolvido pretendeu responder aos objectivos propostos e criar com os resultados produzidos, algumas ferramentas que procuram auxiliar o conhecimento e compreensão dos instrumentos de investigação utilizados em SI.

As maiores dificuldades surgiram logo no início dos trabalhos, principalmente devido à falta de experiência em investigação. Situação que reflecte as adversidades enfrentadas por muitos dos investigadores que pretendem conhecer as ferramentas disponíveis e mais adequadas para o desenvolvimento do seu projecto. A diversidade de fontes de informação exibe a falta de consenso que existe na área, em especial nos termos usados para identificar cada elemento de investigação. A inconsistência na denominação cria uma enorme incerteza tanto nos termos a usar, bem como suscita dúvidas quanto ao seu significado.

Recorrendo a informação disponibilizada por uma associação de referência, a AIS, foi identificado um ponto de partida para a uniformização da informação pretendida para este projecto. Na alegada confusão de informação, a AIS tem-se vindo a evidenciar como o núcleo da investigação na área. As referências assumidas por esta organização tem grande peso no consenso possível de estabelecer, mas apesar da AIS ser o ponto de referência na informação apresentada ao longo desta dissertação, não foi a única fonte de dados. Houve sempre o

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 158

&lt;page_number&gt;136&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

cuidado de comparar os termos e conceitos identificados na AIS com os identificados em outras Associações e autores de referência. É com estes fundamentos que se identificaram os instrumentos de investigação para SI e, através de pesquisa detalhada de informação, se conseguiu recolher dados suficientes para descrever e particularizar cada conceito e instrumentos que estes abrangem.

Durante a pesquisa de informação foram encontradas várias dificuldades. A informação existe, mas dispersa em publicações de diferentes áreas e disciplinas de ciência, o que apresenta a informação embebida em linguagem técnica e em domínios muito pouco informáticos. Estas circunstâncias dificultaram a compreensão e respectiva tradução.

À medida que se ultrapassaram as dificuldades sentidas, o projecto criou um repositório de informação que, trabalhado através da constante aplicação de regras de uniformidade de conceitos e termos, tenta exibir de forma clara os instrumentos disponíveis e uma breve descrição de cada um. Informação que se espera suficiente para a compreensão da finalidade e das vantagens e desvantagens de cada instrumento e das recomendações da sua aplicação num projecto.

Para facilitar a identificação rápida dos instrumentos disponíveis foram criadas alguns modelos que apresentam de forma sistematizada cada instrumento e a sua classificação quanto à abordagem. Estas ferramentas quando usadas em conjunto com alguns dos resultados conseguidos da caracterização de investigação, permitem identificar os instrumentos mais indicados para cada projecto, de acordo com o tipo de estudo proposto e identificar as técnicas habitualmente aplicadas em cada das metodologias.

Alcançado o conhecimento desejado sobre os instrumentos disponíveis para a investigação na área tornou-se exequível iniciar a caracterização da investigação em SIO. A investigação produzida em Portugal entre 2004 e 2007 é materializada em boa parte em teses e dissertações. Nem toda a investigação produzida provém da mesma fonte e é realizada no mesmo âmbito, mas a larga maioria dos estudos concretizados são-no no âmbito de formação de mestrado e doutoramento, de instituições de ensino portuguesas. Foi definido que o campo de acção do projecto seria apenas as universidades públicas incluídas na rede de ensino superior. É sobre esta população que interessou identificar os estudos desenvolvidos em SIO nos quatro anos definidos.

Os meios seleccionados para a identificação dos trabalhos de investigação a analisar foram os catálogos e repositórios bibliográficos disponibilizados pelas universidades. Esta forma de

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 159

&lt;page_number&gt;137&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

Identificar os estudos apresenta como principal desvantagem a não identificação de estudos não inseridos no sistema de gestão bibliográfica, mas garante um controlo total total de resposta. Podendo demonstrar-se uma tarefa morosa, tal como aconteceu, a verificação se todos os registos devolvidos pelo catálogo era efectivamente estudos de interesse para este projecto.

Os estudos identificados nas várias universidades como sendo de SI foram filtrados para a temática específica de SIO, perfazendo o total de 89 estudos distintos entre 2004 e 2007.

A caracterização da investigação quanto aos instrumentos de investigação adoptados só é possível através da análise dos estudos produzidos. O acesso aos estudos decorreu de três formas. A inicial e a mais rápida, através da Web nos catálogos e repositórios que disponibilizam o acesso público às obras. A segunda, via EIB foram solicitadas várias obras às universidades que as apresentam nas suas ferramentas bibliográficas. Face à resposta pobre do protocolo, foi seleccionada a forma que melhores garantias dá no acesso aos estudos: a consulta local dos estudos nas bibliotecas das universidades. Seguindo a estrutura de trabalho apresentada, foi conseguido o acesso e respectiva análise a 82,2% dos estudos identificados. Este rácio de cobertura permite construir algumas conclusões e identificar alguns relacionamentos e desta forma criar uma caracterização da investigação em SI em Portugal, como apresentado na figura 61.

<table>
  <tr>
    <td style="background-color:#4682B4; color:white; padding: 15px; border-radius: 10px;">
      43%
    </td>
    <td style="padding: 15px;">
      • Dos estudos em SI assentam em Action Research
    </td>
  </tr>
  <tr>
    <td style="background-color:#4682B4; color:white; padding: 15px; border-radius: 10px;">
      42%
    </td>
    <td style="padding: 15px;">
      • Dos estudos recorrem à técnica Observation
    </td>
  </tr>
</table>

Ilustração 61 - Metodologia e técnica mais aplicada nos estudos de Sistemas de Informação Organizacionais em Portugal

4.2.PRINCIPAIS CONTRIBUTOS

Os objectivos desenhados para o projecto tiveram como plano de fundo contribuir para a investigação futura em SI. A informação produzida pelo trabalho deve permitir a

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 160

&lt;page_number&gt;138&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

investigadores identificar e compreender de forma rápida e clara os instrumentos de investigação disponíveis para a área.

Este projecto procura responder a dois grandes objectivos. A identificação e breve descrição dos instrumentos de investigação disponíveis para investigação em SI e a caracterização da investigação realizada em SIO em Portugal.

O primeiro objectivo que se presume atingido, reúne a informação descrita ao longo do capítulo 2, onde se começa por apresentar os conceitos envolvidos através de um esclarecimento baseado em camadas. Sobre os conceitos identificados são descritos os vários elementos que os compõem, ilustrando as principais características e as habituais aplicações em projectos conhecidos.

O trabalho desenvolvido mostrou que a informação se encontra facilmente acessível a qualquer indivíduo, contudo determinar e confinar que informação usar, citar ou acreditar exige bastante tempo dedicado à compreensão da informação encontrada. É devido a autores que contradizem outros autores e alguns até a si próprios, quando empregam diferentes termos aos mesmos conceitos e outros que se auto-elegem como júris de classificação de elementos de investigação, que este trabalho se apresenta como uma ferramenta particularmente útil e necessária para a investigação em SI. A possibilidade do investigador usar a informação produzida por este trabalho para identificação e compreensão do leque de opções que tem ao seu dispor, poderá permitir economizar imenso tempo, o qual poderá ser aplicado numa análise mais cuidada do fenómeno.

Os resultados do trabalho de campo realizado, análise aos estudos de SIO produzidos entre 2004 e 2007, dão a possibilidade do investigador conhecer de forma rápida e consolidada as opções tomadas por outros investigadores da comunidade. Esta informação pode ser um enorme auxílio para um investigador que procure saber que metodologias ou ferramentas usar no seu projecto.

O índice percentual de estudos analisados permite identificar relacionamentos das decisões tomadas pelos investigadores portugueses. Com estes dados um investigador tem acesso a uma base de trabalho que rapidamente lhe indica que metodologias são adoptadas para um determinado tipo de estudo e que técnicas são habitualmente seleccionadas para uma metodologia específica.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 161

&lt;page_number&gt;139&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

Espera-se assim contribuir para o enriquecimento da investigação em SI, através de ferramentas que clarificam e facilitam o acesso a informação de instrumentos de investigação.

4.3. TRABALHO FUTURO

Os resultados obtidos pelo trabalho desenvolvido poderiam apresentar ainda maior solidez se os dezasseis estudos não analisados fossem contemplados. Apesar da aparente simplicidade, esta actividade é de difícil controlo. Os estudos são constantemente emprestados a outros leitores e alguns do estudos estão mesmo indisponíveis para consulta. Mas uma abertura na disponibilidade das obras face à compreensão dos objectivos do projecto, pelos responsáveis das bibliotecas das universidades, poderia contribuir para ultrapassar estas barreiras.

Também na população abrangida por este projecto, o âmbito pode ser alargado, incluindo as restantes instituições de ensino públicas portuguesas. Sobre estas será necessário identificar os estudos produzidos no período de tempo sob observação e efectuar o mesmo procedimento de análise realizado e descrito nesta dissertação.

Garantia de maior confiança dos dados é possível com um confronto dos registos de estudos identificados através dos catálogos e repositórios bibliográficos com listagem de registos disponibilizada pela universidade, se solicitado localmente. Este confronto de possíveis estudos de interesse para o projecto permitiria a confirmação dos índices percentuais aqui divulgados e a eventualidade de identificação de mais estudos para análise, criando outras ou reafirmando as apresentadas orientações de selecção dos instrumentos de investigação em Portugal.

Interessante poderá ser a comparação da realidade encontrada em Portugal com a realidade internacional. Para este cenário, seria necessário identificar um leque vasto de publicações publicadas no estrangeiro e efectuar análise relativamente aos instrumentos de investigação adoptados pelos investigadores estrangeiros. Uma das formas de contornar a identificação de estudos produzidos em vários países seria a identificação dos trabalhos publicados nas revistas e organizações mais conceituadas da área de SI.

Esta informação permitira identificar as diferenças entre a investigação portuguesa em SI, face à investigação internacional.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 162

&lt;page_number&gt;140&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

4.4.CONCLUSÕES

O desafio para a identificação e compreensão dos instrumentos de investigação em SIO, obrigou à recolha e exame cuidado de diversas fontes de informação que, anunciaram diferentes mas nem sempre distintos instrumentos de investigação. O fruto desse trabalho permitiu conhecer e compreender o posicionamento de cada instrumento no cenário que compõe a investigação em SI.

Como resultado do esforço aplicado, foram concebidos alguns modelos com que se procura contribuir para a rapidez e facilidade de futuros trabalhos de investigação na área. A tabela e o diagrama de classificação dos instrumentos quanto à abordagem e o diagrama que apresenta o enquadramento de cada elemento fornecem um meio rápido e intuitivo na identificação dos instrumentos possíveis de adoptar num projecto de investigação em SI. Este trabalho procura dar conhecimento de forma sistematizada dos conceitos e termos comummente aplicados na área, evitando assim dificuldades na identificação de conceitos, devido aos correntes cruzamentos de termos entre os diferentes instrumentos da investigação.

A caracterização da investigação que abrangeu 82% dos estudos identificados na área de SIO realizados no período de 2004 a 2007 em Portugal, possibilita a identificação de relacionamentos entre tipos de estudo e elementos de investigação seleccionados por investigadores portugueses. Esta informação dá a futuros investigadores uma informação que permitirá identificar as metodologias mais aplicadas e provavelmente as mais adequadas para um determinado tipo de estudo. Juntar esta informação a outro relacionamento identificado, as técnicas adoptadas em cada metodologia, auxilia a identificação dos instrumentos que um investigador deverá adoptar no seu estudo, sem necessidade de conhecimento profundo e detalhado de instrumentos não adequados para o seu trabalho.

Os resultados obtidos podem ser mais detalhados através de um alargamento de âmbito e de uma actualização constante da caracterização criada, de forma a reflectirem a evolução da investigação em SI em Portugal. A manutenção desta informação permitirá uma contínua contribuição do trabalho na comunidade da área.

A dissertação é o culminar do trabalho desenvolvido no âmbito de um projecto que se apresentou com objectivos ambiciosos. As metas estabelecidas evidenciaram várias

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 163

&lt;page_number&gt;141&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

dificuldades que com esforço foram ultrapassadas e que na recta final criam uma mistura de objectivo cumprido com desejo de continuar o trabalho realizado.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 164

&lt;page_number&gt;142&lt;/page_number&gt;

4. CONSIDERAÇÕES FINAIS

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 165

&lt;page_number&gt;143&lt;/page_number&gt;

# BIBLIOGRAFIA

Aberta, U. (2008). "Missão." Retrieved 03-12-2008, from http://www.univ-ab.pt/ua/missao.php.
Amal, K. A. (2005). "Using the Delphi Technique to Search for Empirical Measures of Local Planning Agency Power." The Qualitative Report **10**(4).
Anderson, N., G. Dahlquist, et al. (2003). Numerical Methods, Courier Dover Publications.
Archer, M., C. Heitmeyer, et al. (2002). "Proving invariants of I/O automata with TAME." Automated Software Engineering.
Babbie, E. (1993). The practice of social research. Belmont, CA: Wadsworth Publishing Company.
Banks, J. A. (1998). "The lives and values of researchers: Implications for educating citizens in a multicultural society." Educational Researcher **27**.
Bardecki, M. J. (1984). "Participants' response to the Delphi method: An attitudinal perspective." Technological Forecasting and Social Change **25**(3).
Baroudi, J. J. and W. J. Orlikowski (1991). "Studying Information Technology in Organizations: Research Approaches and Assumptions" Information Systems Research.
Batens, D. (2006). "On a Logic of Induction." Logic & Philosophy of Science **4**.
Benarie, M. (1988). "Delphi and Delphi like approaches with special regard to environmental standard setting." Technological Forecasting and Social Change **33**(2).
Benbasat, I., D. K. Goldstein, et al. (1987). "The Case Research Strategy in Studies of Information Systems." MIS Quarterly **11**: 3.
Boudreau, M. C., D. Gefen, et al. (2001). "Validation in IS Research: A State-of-the-Art Assessment." MIS Quarterly **25**.
Bowker, G. C. and S. L. Star. (1996). "Ethnography of Information Systems." Retrieved 28-11-2007, from www.qual.auckland.ac.nz/bowkstar.rtf
Bredo, E. and W. Feinsberg (1982). Knowledge and values in social and educational research. Philadelphia, Temple University Press.
Bristol, U. (2008). "Quantitative Methodologies." Retrieved 06-00-2008, from http://www.bris.ac.uk/Depts/DeafStudiesTeaching/dissert/Quantit.
Brown, A. and F. Heller (1981). "Usefulness of Group Feedback Analysis as a Research Method: Its Application to a Questionnaire Study." Human Relations **34**.
Bryman, A. (1988). Quantity and quality in social research. London, Routledge.
Caseñas, C. and K. Kalsbeek. (2006, Julho 2007). "Should you be at an Archives?" Retrieved 28-11-2007.
Centre, B. F. S. (2008). "Fieldwork Methodology." Retrieved 29-10-2008, from http://geographyfieldwork.com/Fieldwork%20Methodology.htm.
Chin, W. (1996). Surveys Just Don't Get No Respect. International Conference on Information Systems Cleveland, Ohio.
Cho, Y. Y., G. H. Jeong, et al. (1991). "A Delphi technology forecasting approach using a semi-Markov concept." Technological Forecasting and Social Change **40**.
Chua, W. F. (1986). "Radical Developments in Accounting Though." The Accounting Review **4**.
Code, L. (1991). What can she know: Feminist theory and the construction of knowledge. Ithaca, Cornell University Press.
Comstock, D. E. (1982). A method of critical research. Philadelphia, Temple University Press.
Coolican, H. (2004). Research Methods and Statistics in Psychology, Hodder and Stoughton.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 166

&lt;page_number&gt;144&lt;/page_number&gt;

Cormack, D. S. (1991). *The research process*. Oxford, Black Scientific.
Costa, C., G. Rocha, et al. (2004). A Entrevista. Lisboa, Faculdade de Ciências da Universidade de Lisboa.
De Búrca, S. and D. McLoughlin (1996). "The Grounded Theory Alternative in Business Network Research." *Research Papers* 4.
Delloite (2008). Estudo comparativo de bolsas de doutoramento e pós doutoramento. Relatorio_Deloitte_FCT_Bolsas_18_03_2008.pdf, Fundação para a Ciência e Tecnologia.
DGES (2008). Ensino Superior Público Universitário. MapaPubUniv.gif, Direccção-Geral do Ensino Superior.
Dick, B. (2008, 15-08-2005). "Group feedback analysis " Retrieved 30-10-2008, from http://www.scu.edu.au/schools/gcm/ar/arp/gfa.html.
DLP (2007). Dicionário da Língua Portuguesa On-Line. T. E. Universal.
Duffy , M. E. (1985). "Designing research the qualitative –quantitative debate." *Journal of Advanced Nursing* 11.
Edwards, J. (2003). "Beginning on-line delphi ethnographic research: The bolder method." *The Qualitative Report* 8(2).
Eisenhardt, K. M. (1989). "Building Theories from Case Study Research." *Academy of Management Review*.
Emory, W. C. (1980). *Business Research Methods*, Irwin.
Europe, F. M. (2008). "Formal Methods." Retrieved 02-07-2008, from http://www.fmeurope.org/.
Fontana, A. and J. H. Frey (1994). *Interviewing: The art of science*. London, Sage.
Ford, L. (1997). "Rigor or rigormortis: Identifying “quality” qualitative research." *American Psychologist* 51: 46–47.
Garrison, D. R., M. Cleveland-Innes, et al. (2006). "Revisiting methodological issues in transcript analysis: Negotiated coding and reliability." *The Internet and Higher Education* 9.
Gibbons, M. T. (1987). "Introduction: the Politics of Interpretation." *Interpreting Politics*: 1-31.
Giorgi, A. (1997). "The theory, practice and evaluation of the phenomenological method as a qualitative research procedure." *Journal of Phenomenological Psychology* 28: 235-260.
Glaser, B. G. and A. L. Strauss (1967). *The discovery of grounded theory*, Aldine.
Glesne, C. and A. Peshkin (1992). *Becoming qualitative researchers: An introduction*. New York, White Plains.
Grover, V. (2003). "A Tutorial on Survey Research: From Constructs to Theory." *Journal of Operations Management* 16.
Guba, E. C. (1990). *The Paradigm Dialog*, Sage Publications.
Gummesson, E. (1991). *Qualitative methods in management research*. Thousand oaks, Sage Publications.
Hair, J. H. J., R. E. Anderson, et al. (1995). *Multivariate Data Analysis*, Prentice Hall.
Hamel, J., S. Dufour, et al. (1993). *Case study methods*. Newbury Park, Sage Publications.
Hammersley, M. and P. Atkinson (1994). *Etnografía Métodos de Investigación*. Barcelona, Paidós.
Harding, R. D. and D. Quinney (1986). *A Simple Introduction to Numerical Analysis: A Computer Illustrated Text*, CRC Press.
Harris, O. S. (2001). "The Philosophical Research Society." Retrieved 12-05-2008, from www.prs.org.
Harry, A. (1997). *Formal Methods Fact File: Vdm and Z*, John Wiley & Sons.
Haynie, W. J. (1998). "Experimental Research In Technology Education: Where is it?" *Journal of Technology Education* 9.
Hinton, A. (1987). *Resracg awareness; The ethnographic perspective*. Southampton, Ashford.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 167

&lt;page_number&gt;145&lt;/page_number&gt;

Holloway, C. M. (1997). Why Engineers Should Consider Formal Methods. _16th Digital Avionics Systems Conference_.
Husen, T. (1999). "Research paradigm in education." _Issues in Education Research_.
IPLeiria, S. d. D. d. (2008). "Empréstimo interbibliotecas." Retrieved 08-11-2008, 2008, from http://www.ipleiria.pt/portal/sdoc?p_id=125162.
ISCTE, I. S. d. C. d. T. e. d. E. (2006). "Resenha Histórica." Retrieved 03-12-2008, from http://iscte.pt/historia.jsp.
Jenkins, A. M. (1985). "Research Methodologies and MIS Research." _Research Methods in Information Systems_.
Johnson, R. B. and A. J. Onwuegbuzie (2004). "Mixed methods research: A research paradigm whose time has come." _Educational Researcher_ **33**(7).
Joseph, M. (2005). _Formal Methos: Proceedings_, Springer.
Kaplan, B. and J. A. Maxwell (1994). _Qualitative Research Methods for Evaluating Computer Information Systems_. Thousand Oaks, Sage.
Kerlinger, F. N. (1986). _Foundations of Behavioral Research_, Harcourt Brace Jovanovich.
Kim, S. (2003). "Research Paradigms in Organizational Learning and Performance: Competing Modes of Inquiry." _Information Technology, Learning, and Performance Journal_ **21**.
Kitzinger, J. (1995). "Qualitative Research: Introducing focus groups." _BMJ_ **311**.
K Krauss, S. E. (2005). "Research Paradigms and Meaning Making: A Primer." _The Qualitive Report_ **10**: 558-570.
Lakatos, I. (1978). _The Methodology of Scientific Research Programmes_. Cambridge, Cambridge University Press.
Lewis, I. M. (1985). _Social Anthropology in Perspective_. Cambridge, Cambridge University Press.
Lincoln, Y. S. and E. G. Guba (1985). _Naturalistic inquiry_, Beverly Hills, CA: Sage.
Lyberg, L. E. and D. Kasprzyk (1991). "Data Collection Methods and Measurement Error: An Overview." _Measurement Errors in Surveys_.
Macedo, P., M. S. Zacarias, et al. (2005) "Técnicas e Métodos de Investigação em Engenharia Organizacional: Projecto de Investigação em Modelação de Processos de Produção." _Volume_, DOI:
March, S. and G. Smith (1995). "Design and Natural Science Research on Information Technology." _Decision Support Systems_ **15**.
Marshall, C. and G. B. Rossman (1999). _Designing Qualitative Research_. London, Sage Publications.
Martin, P. Y. and B. A. Turner (1986). "Grounded Theory and Organizational Research." _The Journal of Applied Behavioral Science_.
Masser, I. and P. Foley (1987). "Delphi revisited: Expert opinion in urban analysis." _Urban Studies_ **24**(3).
Mauch, J. E. and N. Park (2003). _Guide to the Successful Thesis and Dissertation - A Handbook for Students and Faculty_. New York, USA, Marcel.
McClave, J. T. and P. G. Benson (1988). _Statistics for business and economics_. San Francisco, Dellen.
Miller, M. M. (1993). "Enhancing regional analysis with the Delphi method." _Review of Regional Studies_ **23**(2).
Morse, J. M. (1991). "Approaches to qualitative and quantitative methodological: Triangulation." _Qualitative Research_ **40**.
Myers, M. (1999). "Investigating Information Systems with Ethnography Research." _Communications of the Association for Information Systems_ **2**.
Myers, M. D. (1996). "Qualitative Research in Information Systems." Retrieved 28-11-2007, from www.qual.auckland.ac.nz.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 168

&lt;page_number&gt;146&lt;/page_number&gt;

Newsted, P. R., W. Chin, et al. (1997). Resolved: Surveys have Outlived their Usefulness in IS Research. 1996 International Conference on Information Systems. Cleveland.
Nielsen, J. (2002) "Field Studies Done Right: Fast and Observational." Alertbox Volume, DOI: http://www.useit.com/alertbox/20020120.html
Owen, C. (1997). "Design Research: Building the Knowledge Base." Journal of the Japanese Society for the Science of Design 5.
Pandit, N. R. (1996). "The Creation of Theory: A Recent Application of the Grounded Theory Method." The Qualitative Report.
Parente, F. J. and J. K. Anderson-Parente (1987). Delphi inquiry systems. Chichester, John Wiley and Sons.
Parente, F. J., J. K. Anderson, et al. (1984). "An examination of factors contributing to Delphi accuracy." Journal of Forecasting 3(2).
Patton, M. Q. (1990). Qualitative Evaluation and Research Methods. Newbury Park, Sage Publications, Inc.
Pettigrew, A. M. (1990). "Longitudinal Field Research on Change: Theory and Practice." Organization Science.
Pitt, J. C. (1996). "Philosophical Methodology, Technology and the Transformation of Knowledge." PHIL & TECH.
Popkewitz, T. S. (1980). "Paradigm in education science: Different meaning and purpose to theory." The Journal of Education 162: 28-46.
Purao, S. (2002). Design Research in the Technology of Information Systems: Truth or Dare. GSU Department of CIS Working Paper. Atlanta.
Quivy, R. and L. V. Campenhoudt (1998). Manual de Investigação em Ciências Sociais. Lisboa, Gradiva.
Rapoport, R. N. (1970). "Three Dilemmas in Action Research." Human Relations 23.
Reichardt, C. S. and T. D. Cook (1979). Qualitative and Quantitative Methods in Evaluation Research. Thousand Oaks, Sage Publications, Inc.
Rhine, J. (2008, 30-10-2008). "What is Grounded Theory? ." Retrieved 12-07-2008, 2008, from http://www.groundedtheory.com/.
Rosen, M. (1991). "Coming to Terms with the Field: Understanding and Doing Organizational Ethnography." Journal of Management Studies.
Rossi, M. and M. Sein (2003). "Design Research Workshop: A Proactive Research Approach." Presentation delivered at IRIS 26.
Routio, P. (2007, 03-08-2007). "Arteology, the science of products and professions." Retrieved 28-08-2008, from http://www2.uiah.fi/projects/metodi/120.htm.
Routio, P. (2007, 03-08-2007). "Recording Descriptive Data." Retrieved 28-08-2008, from http://www2.uiah.fi/projects/metodi/160.htm.
Sandelowski, M. (1986). "The problem of rigor in qualitative research." Journal of science 8.
Scheuren, F. (2008). "What is a Survey." Retrieved 20-05-2008, from http://www.whatisasurvey.info/.
Schnack, C. M., T. D. Pisoni, et al. (2004). "Transcrição de fala: do evento real à representação escrita." entrelinhas.
Schwab, D. P. (2004). Research Methods for Organizational Studies, Lawrence Erlbaum Associates.
Siegle, D. (2006). "Principles and Methods in Educational Research." Retrieved 20-05-2008, from www.gifted.uconn.edu.
Simon, H. (1996). The Sciences of the Artificial. Cambridge, MIT Press.
Smith, J. K. (1983). "Quantitative versus qualitative research: An attempt to clarify the issue." Educational Researcher 12: 6-13.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 169

&lt;page_number&gt;147&lt;/page_number&gt;

Smith, J. K. and L. Heshusius (1986). "Closing down the conversation: The end of the quantitative-qualitative debate among educational inquires." *Educational Researcher* 15: 4-12.
Solutions, M. (2008). "What is Numerical Analysis?" Retrieved 20-05-2008, from http://www.mathcom.com/corpdir/techinfo.mdir/q105.html#q105.
Spradley, J. P. (1979). *The ethnographic interview*, Wadsworth Pub Co.
Stake, R. (1995). *The art of case research*. Thousand Oaks, Sage Publications.
Stern, P. N. (1980). "Grounded Theory Methodology." *Image 12,1*.
Stone, E. F. (1981). *Research Methods in Organizational Behavior*, Scott Foresman & Co.
Straub, D., D. Gefen, et al. (2005). Quantitative, Positivist Research Methods in Information Systems, Association for Information Systems. **2008**.
Strauss, A. and J. Corbin (1990). *Basics of qualitative research: Grounded theory procedures and techniques*, Sage.
Strauss, A. and J. Corbin (1994). *Grounded Theory Methodology: An Overview: An Overview*, in N.K. Denzin e Y.S. Lincoln (eds.), *Handbook of Qualitative Research*. London, Sage Publications.
Suassuna, D. (2008). Técnicas de Investigação Científica, Universidade de Brasília.
Teixeira, G. (2005). "O que significa Metodologia?" Retrieved 05-01-2008, from http://www.serprofessoruniversitario.pro.br/.
van Manen, M. (1998). *Researching live experience: Human science for an action sensitive pedagogy*. London, The Althouse Press.
Varajão, J. E. Q. A. d. S. (2002). Função de Sistemas de Informação - Contributos para a melhoria do sucesso da adopção de tecnologias de informação e desenvolvimento de sistemas de informação nas organizações. *Departamento de Sistemas de Informação*. Guimarães, Universidade do Minho. Phd.
Waissbluth, M. and A. De Gortari (1990). "A methodology for science and technology planning based upon economic scenarios and Delphi techniques." *Technological Forecasting and Social Change* 37(4).
Walker, J. C. and C. W. Evers (1999). "Research in education: Epistemological issues." *Issues in Education Research*.
Wardlow, G. (1989). "Alternative modes of inquiry for agricultural education." *Journal of Agricultural Education* 30: 2-7.
Webster, J. and D. Compeau (1996). "Computer-assisted versus paper-and-pencil administration of questionnaires." *Behavior Research Methods, Instruments, & Computers*.
Winberg, C. (1997). *How to Research and Evaluate*. Cape Town.
Woudenberg, F. (1991). "An evaluation of Delphi." *Technological Forecasting and Social Change* 440**(2)**.
Yin, R. K. (1984). *Case study research: Design and methods*, SAGE.
Yin, R. K. (1989). *Case study research: Design and methods*, SAGE.
Yin, R. K. (1989). *Interorganizational partnerships in local job creation and job training efforts*. Washington, COSMOS Corp.
Yin, R. K. (1993). *Applications of case study research*. Beverly Hills, Sage Publishing.
Yin, R. K. (1994). *Case Study Research: Design and Methods*, Sage Publications.
Yin, R. K. (2002). *Case Study Research, Design and Methods*. Newbury Park, Sage Publications.
Zonabend, F. (1992). "The monograph in European ethnology." *Current Sociology* 440**(1)**.

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 170

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 171

&lt;page_number&gt;149&lt;/page_number&gt;

# ANEXOS

## ANEXO I - DISSERTAÇÕES E TESES IDENTIFICADAS EM SISTEMAS DE INFORMAÇÃO ORGANIZACIONAIS

A tabela 29 apresenta os estudos identificados na forma de tese e dissertação, produzidos em Portugal entre 2004 e 2007. Os registos encontrados através dos catálogos bibliográficos das universidades públicas apresentaram 17 registos repetidos, aqui apresentados de forma rasurada.

<table>
<thead>
<tr>
<th>Universidade</th>
<th>Ano</th>
<th>Título</th>
<th>Autor</th>
</tr>
</thead>
<tbody>
<tr>
<td>Universidade de Lisboa</td>
<td>2005</td>
<td>E-WHIP: impacto provocado pela introdução de ferramentas num processo de desenvolvimento de software</td>
<td>Manuel Eduardo Fernandes Pereira da Costa</td>
</tr>
<tr>
<td>Universidade de Lisboa</td>
<td>2004</td>
<td>e-Weather : Criação e gestão de uma base de dados para registos meteorológicos</td>
<td>Nuno Miguel Sobreira Correia de Assis</td>
</tr>
<tr>
<td>Universidade Nova de Lisboa</td>
<td>2004</td>
<td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
<td>José Luís Mota Pereira</td>
</tr>
<tr>
<td>Universidade Técnica de Lisboa</td>
<td>2007</td>
<td>Caso de estudo em engenharia organizacional: do nível operacional ao meta-nível, the practitioner's approach</td>
<td>Rui Jorge Araújo Alves</td>
</tr>
</tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 172

&lt;page_number&gt;150&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do(a) Autor(a)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Metodologia para a concepção de sistemas de recuperação de informação</td>
      <td>João Carlos Amaro Ferreira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>Abordagem sócio-técnica ao desenvolvimento de sistemas de informação inter-institucionais</td>
      <td>José Manuel Costa Dias de Figueiredo</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2008</td>
      <td>Estratégia de integração de sistemas de informação de unidade hospitalar : caso de estudo Hospital Pulido Valente</td>
      <td>Luís Eduardo de Moura Trindade Elias</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Benefícios dos sistemas de informação inter-organizacionais: o caso da receita médica electrónica</td>
      <td>Mário Nuno de Oliveira Fernandes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>IS/IT user requirements definition: a business and management concepts point of view</td>
      <td>António Manuel Clímaco das Chagas</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Finding e-commerce strategies for businesses</td>
      <td>Winnie Ng Picoto</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>A importância da tecnologia para o desenvolvimento do sector da saúde: os centros de saúde no concelho de Almada : estudo de caso</td>
      <td>Patrícia Maria Passos Marcos</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Sistemas ERP e o seu impacto na mudança organizacional</td>
      <td>Nuno Miguel Simões</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Suporte à decisão estratégica na inovação: estudo de caso no sector das embalagens plásticas</td>
      <td>Nuno Miguel Santos Lourenço Tomás</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 173

&lt;page_number&gt;151&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do(a) Autor(a)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>A implementação de um enterprise resource planning no sector público português e a mudança organizacional: oportunidades e condicionamentos</td>
      <td>Fernando Jorge Eduardo Fialho Barnabé</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Os benefícios organizacionais da integração de sistemas de informação</td>
      <td>Elsa Maria Pereira Mendes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>A influência dos utilizadores no sucesso dos projectos informáticos: aplicação do Technology Acceptance Model a um projecto de Customer Relationship Management</td>
      <td>Anabela Pires Ferreira Afonso</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>Factores de sucesso na adopção de CRM: um estudo de casos em Portugal</td>
      <td>Fernando Emanuel Lopes de Almeida</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>Requisitos para a qualidade de um Executive Information System</td>
      <td>André Ricou Tavares Carreiro</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>A gestão do conhecimento numa instituição financeira: estudo de caso</td>
      <td>Jorge Pinto Colaço</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>Benefícios dos sistemas ERP: um estudo de caso</td>
      <td>António José Henriques de Albuquerque e Silva</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>As SI-TI, a produtividade e a inovação na economia portuguesa</td>
      <td>Isabel Navalho de Oliveira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>O relacionamento cliente-fornecedor de tecnologias de informação: uma abordagem interactiva e de competências</td>
      <td>Mafalda Cristina de Oliveira Pinto Coelho Nogueira</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 174

&lt;page_number&gt;152&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>A decision support system for investment evaluation in information systems-information technology in public administration organisations</td>
      <td>Luís Manuel de Oliveira Metelo</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Adopção de ferramentas de e-procurement: riscos e benefícios</td>
      <td>Dinora Isabel de Oliveira Guerreiro</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>A liderança, na implementação de sistemas e tecnologias de informação em pequenas e médias empresas em Portugal</td>
      <td>António Rodolfo Lucas da Silva</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Factores de sucesso com a adopção de sistemas ERP - Enterprise Resource planning</td>
      <td>Artur Manuel Barros da Cunha</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Utilização da competitive intelligence enquanto metodologia de apoio à valorização dos sistemas de informação nas organizações</td>
      <td>Maria Tereza Passuelo de Freitas</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Adopção de sistemas e tecnologias de informação: o caso de sistemas multi canal em Cabo Verde</td>
      <td>Nuías Mendes Barbosa da Silva</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Qualidade no desenvolvimento de sistemas de informação: análise de sistemas de informação</td>
      <td>Nuno Miguel Correia Fernandes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Factores de adopção e modelos de utilização e participação de sistemas EDI: um caso de estudo</td>
      <td>João Miguel Santana Pires</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>O papel das tecnologias de informação na gestão do conhecimento em prol da segurança pública</td>
      <td>José António Ribeiro Caçador</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 175

&lt;page_number&gt;153&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do(a) Autor(a)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>Critérios de selecção de software ERP</td>
      <td>João Pedro Moreno Rodrigues da Costa</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>O papel do software de código aberto-software livre nas organizações</td>
      <td>António Manuel Ferreira Azevedo Simão</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Support of operational processes in the Data Warehouse: the gap between theory and practice</td>
      <td>Ana Margarida de Almeida Bastos Carvalho</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2006</td>
      <td>Performance multidimensional: sistema integrado de avaliação da performance por dimensões</td>
      <td>Carlos Miguel Pinto Pereira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Análise de perfis do profissional em competitive intelligence: metodologia de apoio às decisões estratégicas</td>
      <td>Myrian Lucia Costa</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>A propensão do estudante universitário português para o comércio electrónico</td>
      <td>Sérgio Miguel Vasconcelos Oliveira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Capital intelectual nas empresas portuguesas de tecnologias de informação: um contributo para a sua medição</td>
      <td>Anabela Miguéns Castelo de Almeida Ferreira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>A qualidade dos dados no apoio à tomada de decisão em ambientes complexos: data</td>
      <td>António Correia Fernandes</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 176

&lt;page_number&gt;154&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lisboa</td>
      <td></td>
      <td>warehousing e business intelligence</td>
      <td></td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Arquitectura de interoperabilidade de sistemas de informação de projectos e recursos humanos de investigação: simulação computacional</td>
      <td>Luís Miguel dos Santos Oliveira</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Interoperabilidade entre Sistemas de Informação Universitários</td>
      <td>Sérgio Sobral Nunes</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Integração de sistemas e plataformas como solução para a gestão da informação de clientes</td>
      <td>Firmino Oliveira da Silva</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>2 MPspe: Um modelo de melhoria do processo de desenvolvimento de Software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional: O contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Uma abordagem baseada em Cenários para apoio à elaboração de estratégias,políticas e projectos de sistemas e tecnologias de informação</td>
      <td>Adília Isabel Domingues da Cruz Alves</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>Gestão de informação numa instituição de I&D: uma abordagem por redes colaborativas</td>
      <td>Carla Sofia Gonçalves Pereira</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 177

&lt;page_number&gt;155&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>Uma metodologia de implementação da norma ISO 9001:2000 em empresas de concepção e desenvolvimento de software</td>
      <td>Cristina Maria da Costa Henriques</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2006</td>
      <td>Uma plataforma de e-commerce reconfigurável para equipamento informático</td>
      <td>Margarida Júlia Rodrigues da Igreja</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2006</td>
      <td>Modelo integrado para o dewenvolvimento de Intranets em empresas/instituições</td>
      <td>José Miguel Gouveia Fernandes</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2006</td>
      <td>A representação temática nos sitemas de informação: um estudo comparativo entre biblioteca e supermercado</td>
      <td>Fabíola Maria Pereira Bezerra</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2007</td>
      <td>A utilização dos e-services como ferramenta para obtenção de vantagem competitiva nas organizações: estudo de casos múltiplos</td>
      <td>Thais Batista Zaninelli</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>Geração de Curricula Vitae e Relatórios de Actividades de Docentes Universitários</td>
      <td>José Sousa</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>Portal para a divulgação de projectos multidisciplinares em engenharia: Interface e implementação</td>
      <td>Ana Cláudia Ribeiro Barroso</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2004</td>
      <td>SIGDIC: Sistema integrado de gestão e difusao de conteúdos</td>
      <td>João Paulo Alves dos Santos Rodrigues</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>Um sistema de informação e modelo de diagnóstico diferencial no âmbito de um rastreio populacional</td>
      <td>Rui Manuel Cerqueira Magalhães</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>WSQL: uma arquitectura de software baseada em web services</td>
      <td>José Joaquim Magalhães Moreira</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 178

&lt;page_number&gt;156&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do(a) Investigador(a)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade do Porto</td>
      <td>2005</td>
      <td>Monotorização da utilização de sistemas de informação na Web</td>
      <td>Carla Alexandra Teixeira Lopes</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2006</td>
      <td>Empreendedorismo de software livre</td>
      <td>Fernando Luís Ferreira de Almeida</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>2006</td>
      <td>Portal colaborativo para gestão de conteúdos e colaboração</td>
      <td>Guilherme de Oliveira Dutra</td>
    </tr>
    <tr>
      <td>Universidade de Coimbra</td>
      <td>2004</td>
      <td>Integração de aplicações empresariais num ambiente heterogénio de sistemas de informação - um caso prático na empresa DIELMAR</td>
      <td>Octávio Sérgio Alferes Pereira</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2007</td>
      <td>Processo de implementação de ERPs: um método para o ajuste de requisitos e optimização de funcionalidades</td>
      <td>Gomes, José Luís Fernandes</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2007</td>
      <td>Segurança nos sistemas de informação hospitalares: políticas, práticas e avaliação</td>
      <td>António Manuel Rodrigues Carvalho dos Santos</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>A utilização do balanced scorecard para monitorar o desempenho de um hospital</td>
      <td>Luis Filipe Matos</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>A descoberta de conhecimento em bases de dados como suporte a actividades de business intelligence: aplicação na área do database marketing</td>
      <td>Filipe Jorge Mota Pinto</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>Descoberta de conhecimento em bases de dados como suporte a actividades de business intelligence: aplicação na área da distribuição de água</td>
      <td>Cristina Josefa Santos Teixeira</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 179

&lt;page_number&gt;157&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade do Minho</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Sistemas de informação, modelos de negócio e processos de fusão: análise de um caso - o nascimento do banco BPI (1998)</td>
      <td>Carlos Francisco Moreira Carneiro</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Integração de sistemas de informação: perspectivas, normas e abordagens</td>
      <td>Victor Manuel Moreira Martins</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Gestão de processos de negócio e sua articulação com o desenvolvimento de sistemas de informação: aplicação para a área do retalho</td>
      <td>António Pedro Almeida de Oliveira</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Gestão de projectos em sistemas de informação: o processo de valorização económica e contabilística dos projectos</td>
      <td>José Ângelo da Costa Pinto</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>2MPspe : um modelo de melhoria do processo de desenvolvimento de Software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Factores determinantes do sucesso de adopção e difusão de serviços de informação online em sistemas de gestão de ciência e tecnologia</td>
      <td>Leonel Duarte dos Santos</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Tecnologias de informação no suporte a um mercado de recursos para integração de empresas virtuais</td>
      <td>Joaquim Gonçalves Pereira da Silva</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Modelo de desenvolvimento de arquitecturas de sistemas de informação</td>
      <td>Paulo Rogério P. Tomé</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Principais factores organizacionais que influenciam a adopção, desenvolvimento e utilização de sistemas workflow administrativos: estudo de casos</td>
      <td>Mário Jorge Dias Lousã</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 180

&lt;page_number&gt;158&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>Proposta de um modelo para a disseminação da informação geográfica nas autarquias locais</td>
      <td>Suzete Maria da Silva Martins de Almeida</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>Benchmark de base de dados de suporte a serviços de informação</td>
      <td>José Luís Pereira Novais</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Sistemas de apoio à decisão em tempo real: áreas de intervenção em data warehousing</td>
      <td>Nuno Gabriel Silva Borges Guedes</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Estudo de modelos de avaliação da segurança da informação</td>
      <td>José Armando Dinis Pimenta</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Data mining: metodologias, tecnologias, modelos e aplicações</td>
      <td>Carla Fernanda Alves de Sousa</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Rejuvenescimento de aplicações: uma experiência com software de seguros</td>
      <td>Nuno Alberto Pereira da Silva</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Interpretação da segurança de sistemas de informação segundo a teoria da acção</td>
      <td>José Filipe de Sá Rodrigues Soares</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2004</td>
      <td>Comércio electrónico e engenharia da variedade</td>
      <td>Fernanda Clara Carvalho Pinto</td>
    </tr>
    <tr>
      <td>Universidade de Évora</td>
      <td>2006</td>
      <td>A informação turística e as tecnologias da informação e da comunicação: o caso português</td>
      <td>Eva Milheiro</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 181

&lt;page_number&gt;159&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Ano</th>
      <th>Título da Dissertação</th>
      <th>Nome do(a) Investigador(a)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade de Évora</td>
      <td>2005</td>
      <td>Os sistemas de apoio à decisão na implementação de um observatório social aplicado ao Centro Distrital de Segurança Social de Évora</td>
      <td>Sílvia Marques Soares</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>2004</td>
      <td>2MPSpe : um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>2006</td>
      <td>Desenvolvimento e aplicação de uma metodologia para avaliação do sistema de gestão de informação</td>
      <td>Cruz, Pedro Rui Ferreira</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>2005</td>
      <td>Negócio electrónico na medição de seguros - estudo de caso</td>
      <td>Amorim, Vítor José Castro</td>
    </tr>
    <tr>
      <td>Universidade da Beira Interior</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade da Beira Interior</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade de Trás-os-</td>
      <td>2005</td>
      <td>Modelo explicativo das iniciais de comércio electrónico</td>
      <td>Ramiro Manuel Ramos Moreira Gonçalves</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 182

&lt;page_number&gt;160&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Montes e<br>Alto Douro</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Universidade<br>de Trás-os-<br>Montes e<br>Alto Douro</td>
      <td>2004</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de<br>Figueiredo Martins</td>
    </tr>
    <tr>
      <td>Universidade<br>de Trás-os-<br>Montes e<br>Alto Douro</td>
      <td>2006</td>
      <td>Sistemas inteligentes de apoio à decisão com capacidade de justificação de soluções e identificação da intenção do utilizador</td>
      <td>José Avelino da Silva<br>Marinho</td>
    </tr>
    <tr>
      <td>Universidade<br>de Trás-os-<br>Montes e<br>Alto Douro</td>
      <td>2004</td>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>Luís Carlos Magalhães<br>Pires</td>
    </tr>
    <tr>
      <td>Universidade<br>do Algarve</td>
      <td>2005</td>
      <td>Sistema de informação integrado de apoio à gestão hospitalar</td>
      <td>Joel David Valente<br>Guerreiro</td>
    </tr>
    <tr>
      <td>Universidade<br>dos Açores</td>
      <td>2004</td>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>PIRES, Luís Carlos<br>Magalhães</td>
    </tr>
    <tr>
      <td>Universidade<br>dos Açores</td>
      <td>2004</td>
      <td>2MPspe [Texto policopiado]: um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>RIBEIRO, Pedro Miguel<br>Gonzalez de Abreu</td>
    </tr>
    <tr>
      <td>Universidade<br>dos Açores</td>
      <td>2004</td>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>PEREIRA, José Luis Mota</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 183

&lt;page_number&gt;161&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Ano</th>
      <th>Título</th>
      <th>Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade da Madeira</td>
      <td>2004</td>
      <td>2MPspe : um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
    </tr>
    <tr>
      <td>Universidade da Madeira</td>
      <td>2004</td>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>Luís Carlos Magalhães Pires</td>
    </tr>
    <tr>
      <td>Universidade da Madeira</td>
      <td>2004</td>
      <td>Sistemas de Produção de Informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
  </tbody>
</table>

Tabela 29 - Registo das 107 dissertações e teses identificadas em Sistemas de Informação Organizacionais

# ANEXO II - ESTUDOS VISADOS NAS DESLOCAÇÕES ÀS BIBLIOTECAS

Abaixo, na tabela 30, são apresentados os estudos que não se conseguiram aceder, pelas plataformas Web e pelo protocolo EIB.

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Estado</th>
      <th>Título</th>
      <th>Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade de Lisboa</td>
      <td>Analisado</td>
      <td>E-WHIP: impacto provocado pela introdução de ferramentas num processo de desenvolvimento de software</td>
      <td>Manuel Eduardo Fernandes Pereira da Costa</td>
    </tr>
    <tr>
      <td>Universidade de Lisboa</td>
      <td>Estudo na área de Física</td>
      <td>e-Weather: Criação e gestão de uma base de dados para registos meteorológicos</td>
      <td>Nuno Miguel Sobreira Correia de Assis</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Estratégia de integração de sistemas de informação de unidade hospitalar : caso de estudo Hospital Pulido Valente</td>
      <td>Luís Eduardo de Moura Trindade Elias</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 184

&lt;page_number&gt;162&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Analisado</th>
      <th>Benefícios dos sistemas de informação inter-organizacionais: o caso da receita médica electrónica</th>
      <th>Mário Nuno de Oliveira Fernandes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Indisponível</td>
      <td>IS/IT user requirements definition: a business and management concepts point of view</td>
      <td>António Manuel Clímaco das Chagas</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Indisponível</td>
      <td>Finding e-commerce strategies for businesses</td>
      <td>Winnie Ng Picoto</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A importância da tecnologia para o desenvolvimento do sector da saúde: os centros de saúde no concelho de Almada : estudo de caso</td>
      <td>Patrícia Maria Passos Marcos</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Sistemas ERP e o seu impacto na mudança organizacional</td>
      <td>Nuno Miguel Simões</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Indisponível</td>
      <td>Suporte à decisão estratégica na inovação: estudo de caso no sector das embalagens plásticas</td>
      <td>Nuno Miguel Santos Lourenço Tomás</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A implementação de um enterprise resource planning no sector público português e a mudança organizacional: oportunidades e condicionamentos</td>
      <td>Fernando Jorge Eduardo Fialho Barnabé</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Os benefícios organizacionais da integração de sistemas de informação</td>
      <td>Elsa Maria Pereira Mendes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A influência dos utilizadores no sucesso dos projectos informáticos: aplicação do Technology Acceptance Model a um projecto de Customer</td>
      <td>Anabela Pires Ferreira Afonso</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 185

&lt;page_number&gt;163&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Relationship Management<br>Factores de sucesso na adopção de CRM: um estudo de casos em Portugal</td>
      <td>Fernando Emanuel Lopes de Almeida</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Requisitos para a qualidade de um Executive Information System</td>
      <td>André Ricou Tavares Carreiro</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A gestão do conhecimento numa instituição financeira: estudo de caso</td>
      <td>Jorge Pinto Colaço</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Benefícios dos sistemas ERP: um estudo de caso</td>
      <td>António José Henriques de Albuquerque e Silva</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>As SI-TI, a produtividade e a inovação na economia portuguesa</td>
      <td>Isabel Navalho de Oliveira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>O relacionamento cliente-fornecedor de tecnologias de informação: uma abordagem interactiva e de competências</td>
      <td>Mafalda Cristina de Oliveira Pinto Coelho Nogueira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A decision support system for investment evaluation in information systems-information technology in public administration organisations</td>
      <td>Luís Manuel de Oliveira Metelo</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Adopção de ferramentas de e-procurement: riscos e benefícios</td>
      <td>Dinora Isabel de Oliveira Guerreiro</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Indisponível</td>
      <td>A liderança, na implementação de sistemas e tecnologias de informação em pequenas e médias empresas em Portugal</td>
      <td>António Rodolfo Lucas da Silva</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 186

&lt;page_number&gt;164&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade Técnica de Lisboa</th>
      <th>Analisado</th>
      <th>Factores de sucesso com a adopção de sistemas ERP - Enterprise Resource planning</th>
      <th>Artur Manuel Barros da Cunha</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Utilização da competitive intelligence enquanto metodologia de apoio à valorização dos sistemas de informação nas organizações</td>
      <td>Maria Tereza Passuelo de Freitas</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Indisponível</td>
      <td>Adopção de sistemas e tecnologias de informação: o caso de sistemas multi canal em Cabo Verde</td>
      <td>Nuias Mendes Barbosa da Silva</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Qualidade no desenvolvimento de sistemas de informação: análise de sistemas de informação</td>
      <td>Nuno Miguel Correia Fernandes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Factores de adopção e modelos de utilização e participação de sistemas EDI: um caso de estudo</td>
      <td>João Miguel Santana Pires</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>O papel das tecnologias de informação na gestão do conhecimento em prol da segurança pública</td>
      <td>José António Ribeiro Caçador</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>O papel do software de código aberto-software livre nas organizações</td>
      <td>António Manuel Ferreira Azevedo Simão</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Support of operational processes in the Data Warehouse: the gap between theory and practice</td>
      <td>Ana Margarida de Almeida Bastos Carvalho</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Performance multidimensional: sistema integrado de avaliação da performance por dimensões</td>
      <td>Carlos Miguel Pinto Pereira</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 187

&lt;page_number&gt;165&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Analisado</th>
      <th>Título da Investigação</th>
      <th>Autores</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Análise de perfis do profissional em competitive intelligence: metodologia de apoio às decisões estratégicas</td>
      <td>Myrian Lucia Costa</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A propensão do estudante universitário português para o comércio electrónico</td>
      <td>Sérgio Miguel Vasconcelos Oliveira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Capital intelectual nas empresas portuguesas de tecnologias de informação: um contributo para a sua medição</td>
      <td>Anabela Miguéns Castelo de Almeida Ferreira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>A qualidade dos dados no apoio à tomada de decisão em ambientes complexos: data warehousing e business intelligence</td>
      <td>António Correia Fernandes</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>Analisado</td>
      <td>Arquitectura de interoperabilidade de sistemas de informação de projectos e recursos humanos de investigação: simulação computacional</td>
      <td>Luís Miguel dos Santos Oliveira</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>Analisado</td>
      <td>2 MPspe: Um modelo de melhoria do processo de desenvolvimento de Software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>Analisado</td>
      <td>Sistemas de informação para o novo paradigma organizacional: O contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
    </tr>
    <tr>
      <td>Universidade do Porto</td>
      <td>Analisado</td>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 188

&lt;page_number&gt;166&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Indisponível</th>
      <th>A utilização dos e-services como ferramenta para obtenção de vantagem competitiva nas organizações: estudo de casos múltiplos</th>
      <th>Thais Batista Zaninelli</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade de Coimbra</td>
      <td>Analisado</td>
      <td>Integração de aplicações empresariais num ambiente heterogéneo de sistemas de informação - um caso prático na empresa DIELMAR</td>
      <td>Octávio Sérgio Alferes Pereira</td>
    </tr>
    <tr>
      <td>Universidade de Aveiro</td>
      <td>Analisado</td>
      <td>Negócio electrónico na medição de seguros - estudo de caso</td>
      <td>Amorim, Vítor José Castro</td>
    </tr>
    <tr>
      <td>Universidade de Trás-os-Montes e Alto Douro</td>
      <td>Analisado</td>
      <td>Modelo explicativo das iniciais de comércio electrónico</td>
      <td>Ramiro Manuel Ramos Moreira Gonçalves</td>
    </tr>
    <tr>
      <td>Universidade de Trás-os-Montes e Alto Douro</td>
      <td>Analisado</td>
      <td>Sistemas inteligentes de apoio à decisão com capacidade de justificação de soluções e identificação da intenção do utilizador</td>
      <td>José Avelino da Silva Marinho</td>
    </tr>
    <tr>
      <td>Universidade de Trás-os-Montes e Alto Douro</td>
      <td>Analisado</td>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>Luís Carlos Magalhães Pires</td>
    </tr>
  </tbody>
</table>

Tabela 30 - Registo dos 44 estudos visados nas deslocações às bibliotecas

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 189

&lt;page_number&gt;167&lt;/page_number&gt;

# ANEXO III - ANÁLISE DOS ESTUDOS REPETIDOS

A tabela 31, que se segue, apresenta em que universidades foram analisados os estudos repetidos na lista inicial de estudos identificados.

<table>
  <thead>
    <tr>
      <th>Título</th>
      <th>Autor</th>
      <th>Onde foi analisado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>2MPspe : um modelo de melhoria do processo de desenvolvimento de Software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 190

&lt;page_number&gt;168&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>2MPspe : um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>José Luís Mota Pereira</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de produção de informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>PIRES, Luís Carlos Magalhães</td>
      <td>Estudo analisado na Universidade de Trás-os-Montes e Alto Douro</td>
    </tr>
    <tr>
      <td>2MPspe [Texto policopiado] : um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>RIBEIRO, Pedro Miguel Gonzalez de Abreu</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Sistemas de informação para o novo paradigma organizacional : o contributo dos sistemas de informação cooperativos</td>
      <td>PEREIRA, José Luís Mota</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 191

&lt;page_number&gt;169&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Título</th>
      <th>Autor</th>
      <th>Localização do Estudo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2MPspe : um modelo de melhoria do processo de desenvolvimento de software para pequenas empresas</td>
      <td>Pedro Miguel Gonzalez de Abreu Ribeiro</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
    <tr>
      <td>Desenvolvimento de um sistema de planeamento e controlo da produção para empresas distribuídas virtuais</td>
      <td>Luís Carlos Magalhães Pires</td>
      <td>Estudo analisado na Universidade de Trás-os-Montes e Alto Douro</td>
    </tr>
    <tr>
      <td>Sistemas de Produção de Informação</td>
      <td>Paulo Jorge de Figueiredo Martins</td>
      <td>Estudo analisado na Universidade do Porto</td>
    </tr>
  </tbody>
</table>

Tabela 31 - Identificação da localização de análise dos estudos repetidos

# ANEXO IV - ESTUDOS NÃO ANALISADOS

Os registos que identificam os estudos não cobertos pelo projecto que se apresenta nesta dissertação são apresentados na tabela 32:

<table>
  <thead>
    <tr>
      <th>Universidade</th>
      <th>Ano</th>
      <th>Título</th>
      <th>Autor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2007</td>
      <td>Caso de estudo em engenharia organizacional: do nível operacional ao meta-nível, the practitioner's approach</td>
      <td>Rui Jorge Araújo Alves</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2005</td>
      <td>Metodologia para a concepção de sistemas de recuperação de informação</td>
      <td>João Carlos Amaro Ferreira</td>
    </tr>
    <tr>
      <td>Universidade Técnica de Lisboa</td>
      <td>2004</td>
      <td>Abordagem sócio-técnica ao desenvolvimento de sistemas de informação inter-institucionais</td>
      <td>José Manuel Costa Dias de Figueiredo</td>
    </tr>
  </tbody>
</table>

Investigação em Sistemas de Informação Organizacionais em Portugal

---


## Page 192

&lt;page_number&gt;170&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Universidade do Minho</td>
      <td>2007</td>
      <td>Segurança nos sistemas de informação hospitalares: políticas, práticas e avaliação</td>
      <td>António Manuel Rodrigues Carvalho dos Santos</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2006</td>
      <td>Proposta de um modelo para a disseminação da informação geográfica nas autarquias locais</td>
      <td>Suzete Maria da Silva Martins de Almeida</td>
    </tr>
    <tr>
      <td>Universidade do Minho</td>
      <td>2005</td>
      <td>Sistemas de apoio à decisão em tempo real : áreas de intervenção em data warehousing</td>
      <td>Nuno Gabriel Silva Borges Guedes</td>
    </tr>
    <tr>
      <td>Universidade de Évora</td>
      <td>2006</td>
      <td>A informação turística e as tecnologias da informação e da comunicação : o caso português</td>
      <td>Eva Milheiro</td>
    </tr>
    <tr>
      <td>Universidade de Évora</td>
      <td>2005</td>
      <td>Os sistemas de apoio à decisão na implementação de um observatório social aplicado ao Centro Distrital de Segurança Social de Évora</td>
      <td>Sílvia Marques Soares</td>
    </tr>
    <tr>
      <td>Universidade do Algarve</td>
      <td>2005</td>
      <td>Sistema de informação integrado de apoio à gestão hospitalar</td>
      <td>Joel David Valente Guerreiro</td>
    </tr>
  </tbody>
</table>

Tabela 32 - Registo dos nove estudos não abrangidos pelas deslocações às bibliotecas

Investigação em Sistemas de Informação Organizacionais em Portugal