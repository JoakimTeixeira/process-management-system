# Site Processos Data Structure Analysis

> **Analysis Source**: Based on current IGFEJ process portal files in `docs/IGFEJ/source code/site-processos/` including `search.json`, `itil-gmp-hr.html`, and methodology documentation

## Overview

Analysis of the current IGFEJ process portal data structure to create mock data for new prototype development.

## Current Data Structure

### 1. **Search Index Structure** (`search.json`)

```json
{
  "objectID": "unique_id",
  "href": "file_path",
  "title": "page_title",
  "section": "section_title",
  "text": "full_content_text",
  "crumbs": ["breadcrumb", "path"]
}
```

### 2. **Process Hierarchy**

Based on the navigation structure found in the HTML files:

```
Gestão Global (Macroprocess)
├── 1. Gestão de Recursos Humanos (Process)
│   ├── 1.1 Mudança de Local: Oficiais Justiça, Magistrados (Subprocess)
│   ├── 1.2 Onboarding de Colaborador (Subprocess)
│   └── 1.3 Onboarding de um colaborador externo (Subprocess)
├── 2. Gestão de Pedidos de Serviço (Process)
│   ├── 2.1 Service Request Management (Subprocess)
│   └── 2.2 Service Request Categorization (Subprocess)
└── 3. Gestão de Ativos (Process)
    ├── 3.1 IT Asset Management (Subprocess)
    └── 3.2 Asset Reception and Registration (Subprocess)
```

### 3. **Process Data Fields** (from methodology.html)

Each process contains the following standardized fields:

#### **Basic Information**

- **Entidade**: Entity where process is executed (e.g., "DGAJ/IGFEJ")
- **Responsável**: Person or entity responsible (e.g., "Não identificado")
- **Descrição**: Succinct but complete process description
- **Palavras-Chave**: Comma-separated keywords for search optimization

#### **Process Details**

- **Objetivos**: Comma-separated list of process objectives
- **Inputs**: Process inputs and requirements
- **Actividades**: Detailed activities performed in the process
- **Outputs**: Process outputs and results

#### **Additional Information**

- **Ferramentas**: Tools used in the process
- **Controlos**: Process controls and quality measures
- **Participantes**: Process participants and stakeholders
- **Classificação**: Process classification and categorization

## Sample Process Data Structure

### **Example: Mudança de Local Process**

```json
{
  "id": "hr-001",
  "code": "1.1",
  "title": "Mudança de Local: Oficiais Justiça, Magistrados",
  "type": "subprocess",
  "category": "Gestão de Recursos Humanos",
  "parent_process": "Gestão de Recursos Humanos",
  "macroprocess": "Gestão Global",

  "basic_info": {
    "entity": "DGAJ/IGFEJ",
    "responsible": "Não identificado",
    "description": "A DGAJ em conjunto com a Comarca define e atribue nova localização quer a Funcionários Judiciais como a Magistrados após o que envia para o Help Desk do IGFEJ a informação necessária e o pedido de instalação e configuração de aplicações necessárias ao desempenho de actividade do colaborador no novo local...",
    "keywords": [
      "igfej",
      "dgaj",
      "mudança de local",
      "funcionários judiciais",
      "magistrados"
    ]
  },

  "process_details": {
    "objectives": [
      "Detalhar o processo de Mudança de Local de um Funcionário Judicial ou Magistrado"
    ],
    "inputs": [
      "Mudança de local de trabalho de um Funcionário Judicial ou Magistrado"
    ],
    "activities": [
      "Publicar em Diário da Républica",
      "Notificação à Comarca",
      "Criação de nova Ficha de Utilizador",
      "Recepção de pedido de Help Desk",
      "Instalação e configuração de aplicações"
    ],
    "outputs": [
      "Colaborador instalado no novo local com todas as aplicações configuradas"
    ]
  },

  "additional_info": {
    "tools": [
      "Diário da República",
      "Sistema de Help Desk",
      "Sistemas de aplicações DGAJ"
    ],
    "controls": [
      "Validação de DR",
      "Confirmação de disponibilidade de PC",
      "Teste de aplicações"
    ],
    "participants": ["DGAJ", "Comarca", "IGFEJ Help Desk", "Colaborador"],
    "classification": "Processo Administrativo"
  },

  "metadata": {
    "version": "1.0",
    "status": "published",
    "created_date": "2024-01-01",
    "last_modified": "2024-01-01",
    "bpmn_file": "0004-00-igfej-mudanca-de-local-do-utilizador.bpmn",
    "bpmn_svg": "0004-00-igfej-mudanca-de-local-do-utilizador.svg"
  }
}
```

## Mock Data Generation Strategy

### **1. Macroprocesses** (5-7 items)

```typescript
interface Macroprocess {
  id: string;
  title: string;
  description: string;
  processes: Process[];
}
```

### **2. Processes** (15-20 items)

```typescript
interface Process {
  id: string;
  code: string;
  title: string;
  type: "process";
  category: string;
  parent_macroprocess: string;
  subprocesses: Subprocess[];
  // ... same structure as above
}
```

### **3. Subprocesses** (30-40 items)

```typescript
interface Subprocess {
  id: string;
  code: string;
  title: string;
  type: "subprocess";
  category: string;
  parent_process: string;
  parent_macroprocess: string;
  // ... same structure as above
}
```

## Data Categories for Mock Generation

### **ITIL-Based Categories**

1. **Gestão de Recursos Humanos**
2. **Gestão de Pedidos de Serviço**
3. **Gestão de Ativos**
4. **Gestão de Incidentes**
5. **Gestão de Alterações**
6. **Gestão de Configurações**
7. **Gestão de Problemas**

### **Entity Types**

- DGAJ/IGFEJ
- Comarca
- Help Desk
- Departamento de TI
- Direcção Geral

### **Common Keywords**

- igfej, dgaj, processo, serviço, incidente, alteração, configuração, ativo, colaborador, magistrado, funcionário

## BPMN File Structure

### **File Naming Convention**

```
{code}-{type}-{description}.bpmn
{code}-{type}-{description}.svg

Examples:
0004-00-igfej-mudanca-de-local-do-utilizador.bpmn
0005-01-igfej-criacao-utilizador.bpmn
0500-00-gestao-incidentes.bpmn
```

### **BPMN Integration**

```typescript
interface BPMNFile {
  filename: string;
  type: "bpmn" | "svg";
  process_id: string;
  file_path: string;
}
```

## Search Index Generation

### **Search Data Structure**

```typescript
interface SearchIndex {
  objectID: string;
  href: string;
  title: string;
  section: string;
  text: string;
  crumbs: string[];
  type: "macroprocess" | "process" | "subprocess";
  category: string;
  keywords: string[];
}
```

## Implementation Recommendations

### **1. Data Generation Script**

Create a TypeScript/JavaScript script to generate mock data:

- Generate realistic process hierarchies
- Create consistent naming conventions
- Include BPMN file references
- Generate search index automatically

### **2. Data Validation**

- Ensure all required fields are populated
- Validate hierarchy relationships
- Check for duplicate IDs
- Verify BPMN file references

### **3. Import/Export Structure**

```json
{
  "macroprocesses": [...],
  "processes": [...],
  "subprocesses": [...],
  "bpmn_files": [...],
  "search_index": [...]
}
```

## Next Steps

1. **Create mock data generator** based on this structure
2. **Generate sample data** for all categories
3. **Create BPMN file placeholders** for each process
4. **Build search index** from generated data
5. **Test data integrity** and relationships

This structure provides a solid foundation for creating realistic mock data that matches the current IGFEJ process portal while being flexible for the new Angular prototype.
