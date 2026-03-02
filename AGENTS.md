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
- `AGENTS.md` - This agent directory index (you are here)

### `backend/`

**Purpose**: Backend services, APIs, and server-side components

### `frontend/`

**Purpose**: Frontend interfaces and user-facing components

- `frontend/prototypes/` - Frontend prototype files and mockups

### `docs/`

**Purpose**: Thesis documentation, academic research materials, and project resources

- `docs/IGFEJ/` - IGFEJ project documentation and source code
  - `images/` - IGFEJ project diagrams, charts, and screenshots including organizational charts, process diagrams, enterprise architecture overviews, and ITIL practices
  - `source code/` - IGFEJ project source code including BPMN processes and website files
- `docs/thesis/` - Thesis-related documentation and materials
  - `examples/` - Examples and reference papers
  - `literature/` - Bibliography research documents
  - `overleaf-templates/` - LaTeX templates for submission

### `.windsurf/`

**Purpose**: Windsurf IDE-specific configurations and extensions

- `.windsurf/rules/` - Conditional rules for automated repository management
- `.windsurf/skills/` - MCP skill configurations
  - `google-docs-mcp-setup/` - Google Docs integration
  - `notebookllm-mcp-setup/` - NotebookLM integration
- `.windsurf/workflows/` - Defined workflows and processes for Windsurf IDE

## Agent Guidelines

### Navigation Rules

1. **Start here**: Always consult this `AGENTS.md` file first when exploring the repository
2. **Follow the structure**: Use the directory index above to locate relevant components
3. **Check skill documentation**: For MCP setups, read the `SKILL.md` files in each skill directory
4. **Use workflows**: Refer to `.windsurf/workflows/` for defined processes

### Development Workflow

1. **New features**: Determine if backend, frontend, or both are needed
2. **Documentation**: Update relevant docs in `docs/` or create new sections
3. **MCP skills**: Add new skills to `.windsurf/skills/` with SKILL.md and script.ps1
4. **Testing**: Use provided automation scripts for setup verification

### File Organization Conventions

- **Markdown files**: Use `.md` extension for documentation and guides
- **PowerShell scripts**: Use `.ps1` extension for Windows automation
- **Environment files**: Use `.env` for credential templates
- **Configuration files**: JSON format for MCP configurations

Remember: This repository follows a modular structure where each major component has its own directory. Always check the relevant SKILL.md files for detailed setup instructions for MCP integrations.
