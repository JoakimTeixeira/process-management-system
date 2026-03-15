# AGENTS.md - Cascade Agent Directory Index

This file serves as a comprehensive index for the Cascade agent to navigate and understand the process-management-system repository structure. Use this guide to locate specific components, documentation, and resources efficiently.

## Repository Overview

**process-management-system** is a comprehensive project management system with the following key components:

- Backend services and APIs
- Frontend user interfaces and prototypes
- Documentation and research materials
- MCP (Model Context Protocol) skills and workflows for Windsurf IDE
- Project templates and examples

## Directory Structure

### Root Level Files

- `README.md` - Project overview, setup instructions, and getting started guide
- `LICENSE` - Project licensing information
- `.gitignore` - Git ignore patterns for the repository
- `.env.example` - Environment variables template
- `docker-compose.yml` - Docker compose configuration
- `AGENTS.md` - This agent directory index (you are here)

### `api/`

**Purpose**: API backend services

- `api/Dockerfile` - Docker configuration for API
- `api/migrations/` - Database migrations
- `api/seeds/` - Database seeds
- `api/src/` - API source code

### `web/`

**Purpose**: Web frontend applications

- `web/backoffice/` - Backoffice management interface
  - `web/backoffice/Dockerfile` - Docker config for backoffice
  - `web/backoffice/src/` - Backoffice source code
- `web/public/` - Public website
  - `web/public/Dockerfile` - Docker config for public
  - `web/public/src/` - Public source code
  - `web/public/IGFEJ_Style_Guide.md` - IGFEJ style guide

### `docs/`

**Purpose**: Thesis documentation, academic research materials, and project resources

- `docs/IGFEJ/` - IGFEJ project documentation and source code
  - `IGFEJ - Macro Processes and Procedures - Macro Processos ITIL 4.csv` - Macro processes and procedures in CSV format
  - `Process Management and Modeling for the Ministry of Justice - Best Practices Guide v00.07.pdf` - Best practices guide for process management
  - `Proposal for a CMS System for IGFEJ.md` - Content management system proposal
  - `images/` - IGFEJ project diagrams, charts, and screenshots including organizational charts, process diagrams, enterprise architecture overviews, and ITIL practices
  - `meetings/` - Meeting documentation and notes
  - `prototypes/` - IGFEJ project prototypes and mockups
  - `scope-analysis/` - Scope analysis documentation
  - `source code/` - IGFEJ project source code including BPMN processes and website files
- `docs/thesis/` - Thesis-related documentation and materials
  - `examples/` - Examples and reference papers (contains both PDF and markdown versions - prioritize markdown for easier reading)
  - `how-to/` - How-to guides and methodology documentation for thesis work
  - `literature/` - Bibliography research documents and academic references
  - `overleaf-templates/` - LaTeX templates for submission

### `.windsurf/`

**Purpose**: Windsurf IDE-specific configurations and extensions

- `.windsurf/rules/` - Conditional rules for repository automation and NestJs development
- `.windsurf/skills/` - MCP skill configurations and Angular best practices
- `.windsurf/workflows/` - Defined workflows and processes for Windsurf IDE

## Agent Guidelines

### IGFEJ Frontend Prototype

When working on the current IGFEJ prototype, the main area is:

- `docs/IGFEJ/prototypes/frontend-prototype/`

Important files and folders there:

- `index.html` - thin entry file
- `README.md` - prototype-specific documentation
- `diagrams/` - BPMN/SVG/DMN sample files used by the viewer
- `assets/css/prototype.css` - shared prototype styles
- `data/` - mock data for macroprocesses, processes, and search
- `src/components/` - shared UI fragments and reusable renderers
- `src/controllers/` - dynamic detail-page controllers for macroprocess, process, subprocess, and asset pages
- `src/core/` - app bootstrap, layout, state, route parsing, and view switching
- `src/sections/` - top-level menu-backed sections such as welcome and dashboard
- `src/services/` - shared app capabilities such as BPMN loading and search interactions
- `src/utils/` - small helpers

Current frontend routing model:

- section routes: `#welcome`, `#dashboard`, `#introduction`, `#methodology`, `#faq`
- dynamic routes: `#macroprocess/{id}`, `#process/{id}/{tab}`, `#subprocess/{id}/{tab}`, `#asset/{id}`

Current prototype tab naming:

- process: `Visão Geral`, `Subprocessos`, `Diagramas`, `Versões`
- subprocess: `Visão Geral`, `Detalhes`, `Diagrama`

If you update the prototype structure or interaction model, also check whether these docs need updating:

- `docs/IGFEJ/prototypes/frontend-prototype/README.md`
- `docs/IGFEJ/scope-analysis/6. Frontend Prototype Analysis.md`

### Navigation Rules

1. **Start here**: Always consult this `AGENTS.md` file first when exploring the repository
2. **Follow the structure**: Use the directory index above to locate relevant components
3. **Check skill documentation**: When creating Angular code, read the `SKILL.md` files in each skill directory
4. **Check rules documentation**: When creating NestJS code, read the `RULE.md` files in each rule directory
5. **Use workflows**: Refer to `.windsurf/workflows/` for defined processes

### Development Workflow

1. **New features**: Determine if backend, frontend, or both are needed
2. **Documentation**: Update relevant docs in `docs/` or create new sections
3. **MCP Integration**: Use existing MCP skills or rules from `.windsurf/skills/`

### File Organization Conventions

- **Markdown files**: Use `.md` extension for documentation and guides
- **Environment files**: Use `.env` for credential templates
- **Configuration files**: JSON format for MCP configurations

Remember: This repository follows a modular structure where each major component has its own directory. Always check the relevant SKILL.md files for detailed setup instructions for MCP integrations.
