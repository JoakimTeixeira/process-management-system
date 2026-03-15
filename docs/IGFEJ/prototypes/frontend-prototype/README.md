# IGFEJ Frontend Prototype

## Overview

This prototype is a vanilla JavaScript frontend for exploring IGFEJ macroprocesses, processes, subprocesses, and BPMN diagrams.

## Functional Overview

This prototype behaves like a read-only process catalog and exploration tool. It is designed to help a user move from high-level organizational areas down to specific processes, subprocesses, and BPMN models without using a backend API or authentication flow.

### What the Website Is For

- explain the IGFEJ process-management context
- let users browse the process catalog by macroprocess
- let users inspect process and subprocess metadata
- let users open BPMN-related assets and diagrams
- let users compare process versions inside a single process detail page
- let users search for processes and subprocesses from anywhere in the app

### Main User Flows

```text
Entry points
|-- Welcome page
|   |-- go to Dashboard
|   |-- go to Methodology
|   `-- search directly for a process/subprocess
|-- Top navigation
|   |-- open static content sections
|   `-- open the Macroprocessos dropdown
`-- Dashboard tables
    |-- open a macroprocess
    `-- open a process

Exploration flow
|-- Macroprocess
|   `-- list of processes and subprocesses in that macroprocess
|       |-- open process detail
|       `-- open subprocess detail directly
|-- Process detail
|   |-- read overview metadata
|   |-- inspect subprocesses
|   |-- inspect process diagrams/assets
|   |-- inspect version history
|   `-- switch active version
`-- Subprocess detail
    |-- read structured subprocess data
    `-- open the subprocess diagram
```

### Section-by-Section Functionality

#### `Welcome`

The welcome page is the main landing page and default route.

It provides:

- a short introduction to the system
- two primary call-to-action buttons: `Dashboard` and `Metodologia`
- a large search box for global search
- a grid of shortcut cards that deep-link to important sections and anchors such as Introduction, Dashboard, Macroprocesses, Processes, Subprocesses, Diagrams, FAQ, and Contacts

The welcome search is intended as the fastest way to find a known process or subprocess by code, title, category, or keyword.

#### `Introduction`

The introduction page is explanatory content, not a catalog page.

It provides:

- a plain-language explanation of why business and IT process analysis matters
- benefits cards describing expected value such as efficiency, security, standardization, and adaptability
- project summary and target audience information
- calls to action back into the Dashboard and Methodology sections
- project ownership, licensing, and contact information

This section helps a new user understand why the prototype exists before they start browsing process records.

#### `Dashboard`

The dashboard is the main catalog and overview page.

It provides:

- KPI/stat cards derived from the currently loaded mock dataset for:
  - macroprocess count
  - process count
  - subprocess count
  - diagram count
- a "recently updated" area that surfaces a small set of process/subprocess cards
- a macroprocess table with:
  - free-text search
  - sortable columns
  - paginated results
  - a detail action that opens a macroprocess page
- a process table with:
  - free-text search
  - a status filter control for `AS-IS` / `TO-BE`
  - macroprocess filtering
  - sortable columns
  - paginated results
  - a detail action that opens a process page
- informational cards explaining that subprocesses and diagrams are accessed through process detail pages

This is the best section for a user who wants a broad overview of the available catalog content.

#### `Macroprocessos`

`Macroprocessos` is a dropdown in the main navigation, not a single static page.

Each macroprocess page provides:

- macroprocess title and description
- summary metrics for number of processes and subprocesses in that macroprocess
- a combined list of process cards and subprocess cards
- a local filter box and a type filter (`all`, `process`, `subprocess`)

This page acts as the bridge between high-level organizational grouping and the detailed process records.

#### `Process Detail`

Each process page is the main working page for a single process.

It provides:

- process code, title, macroprocess, and state
- an active version indicator or version selector
- a four-tab UI with:
  - `Visão Geral`
  - `Subprocessos`
  - `Diagramas`
  - `Versões`

The tabs behave as follows:

- `Visão Geral`
  - shows summary metadata for the active process version
  - shows creation/update information
  - shows the version description/change description
- `Subprocessos`
  - lists subprocess cards belonging to the currently selected process version
  - each card can open the subprocess detail page
- `Diagramas`
  - shows the diagram viewer shell
  - shows the list of assets/models attached to the current process version
  - loads the first available diagram automatically when appropriate
  - allows the user to inspect process-related BPMN assets
- `Versões`
  - lists all versions available for the process
  - shows author/date/change information
  - helps the user compare evolution of the process record

Important detail: the routing layer also supports a direct `diagram` route for the process BPMN-only view, even though the visible UI label presented to the user is `Diagramas`.

#### `Subprocess Detail`

Each subprocess page is a structured detail page nested conceptually under a process.

It provides:

- subprocess code and title
- subprocess summary/description in the page header
- a two-tab UI:
  - `Detalhes`
  - `Diagrama`

`Detalhes` renders the structured subprocess content taken from the data file, such as:

- entity
- responsible teams
- description
- keywords
- objectives
- inputs
- activities
- deliverables
- suppliers
- participants
- clients
- methodologies
- tools
- metrics
- maturity
- legal support
- information classification
- metadata

`Diagrama` tries to locate the subprocess-related asset from the parent process version and render its BPMN diagram.

#### `Asset Detail`

The asset page is a supporting page for one BPMN/model asset.

It provides:

- asset subtitle and code
- parent process information
- file inventory for the asset
- a `Visualizar` action to load the BPMN file

This page is useful when a user needs to inspect one model as an object in its own right instead of only through the process detail page.

#### `Methodology`

The methodology section is explanatory and collapsible.

It provides:

- BPM/process-analysis context
- a glossary of process attributes and terminology
- expandable sections rather than a long uninterrupted page

This section explains how to interpret the fields used in process and subprocess records.

#### `FAQ`

The FAQ section is also collapsible and focused on orientation.

It provides answers about:

- macroprocess/process/subprocess hierarchy
- `AS-IS` vs `TO-BE`
- maturity
- diagrams
- participants and roles
- search and filtering
- version access
- metrics interpretation

### Cross-Cutting Features

#### Search

The app has two global search entry points:

- welcome-page search
- header search

Search behavior:

- uses a prebuilt `search-index.json`
- falls back to a small in-code dataset if the JSON file cannot be loaded
- is accent-insensitive
- highlights matching text in results
- supports keyboard navigation with arrow keys, enter, and escape
- searches across code, title, text, section, keywords, and category
- returns processes, subprocesses, and asset-related results

Selecting a result navigates the user to the relevant process or subprocess page, or to a related section.

#### Dashboard Table Interactions

The dashboard tables are not static HTML snapshots. They support:

- text search
- sorting by column
- status filtering
- macroprocess filtering
- pagination
- fixed-height row layout to reduce visual jumping between pages
- empty states when filters return no results

#### Navigation State and Breadcrumbs

The app keeps a visible notion of where the user is.

It includes:

- active-state highlighting in the top navigation
- active highlighting in the macroprocess dropdown
- breadcrumb trails on dynamic detail pages
- hash-based routing so pages can be opened directly with a URL fragment

#### BPMN Viewer

The BPMN viewer is one of the main interactive features of the prototype.

It supports:

- BPMN file loading from local prototype files
- fit-to-viewport behavior
- zoom in / zoom out
- fullscreen mode
- export/download options
- SVG export when supported
- DMN option placeholder when a DMN file exists
- fallback error states when a diagram cannot be loaded
- resize-aware re-fitting
- temporary drag/pan interaction using `Ctrl` + mouse drag

The viewer is used in both process and subprocess detail pages.

### Relationship Model

The runtime relationships behind the UI are:

```text
Macroprocess
`-- Process
    |-- Version
    |   |-- Subprocesses
    |   `-- Assets / diagrams
    `-- Current version selector
```

### Functional Boundaries

This prototype currently behaves as a presentation and exploration layer, not a full management platform.

It does not currently implement:

- authentication or authorization
- editing or creating records
- persistence back to a database
- approval workflows
- real-time analytics from a live backend
- a full DMN workflow viewer

## Current Routes

### Section routes

- `#welcome`
- `#dashboard`
- `#introduction`
- `#methodology`
- `#faq`

### Dynamic routes

- `#macroprocess/{id}`
- `#process/{id}/{tab}`
- `#subprocess/{id}/{tab}`
- `#asset/{id}`

### Process tabs

- `overview`
- `subprocesses`
- `diagrams`
- `versions`

### Subprocess tabs

- `details`
- `diagram`

## Frontend Prototype Website Map

This tree describes the navigable website structure from the point of view of routing and page types. Treat the static sections as top-level entry pages and the dynamic routes as detail pages backed by the prototype JSON files.

```text
Frontend Prototype
|-- #welcome
|   |-- landing page / default route
|   |-- global search entry point
|   `-- shortcut cards linking to:
|       |-- #introduction-overview
|       |-- #dashboard-overview
|       |-- #dashboard-subprocesses
|       |-- #dashboard-diagrams
|       `-- #faq-overview
|-- #dashboard
|   |-- dashboard overview and KPI cards
|   |-- #dashboard-overview
|   |-- #dashboard-macroprocesses
|   |   `-- table of all macroprocesses
|   |       `-- opens #macroprocess/{macroprocessId}
|   |-- #dashboard-processes
|   |   `-- table of all processes
|   |       `-- opens #process/{processId}/{tab}
|   |-- #dashboard-subprocesses
|   |   `-- explanatory card that tells users subprocesses live inside process detail pages
|   `-- #dashboard-diagrams
|       `-- explanatory card that tells users diagrams live inside process/subprocess detail pages
|-- #introduction
|   |-- #introduction-overview
|   `-- #introduction-contact
|-- #methodology
|   `-- methodology content page
|-- #faq
|   `-- #faq-overview
|-- #macroprocess/{macroprocessId}
|   |-- macroprocess detail / process list page
|   |-- summary metrics for the selected macroprocess
|   `-- mixed list of:
|       |-- process cards
|       |   `-- open #process/{processId}/{tab}
|       `-- subprocess cards
|           `-- open #subprocess/{subprocessId}/{tab}
|-- #process/{processId}/{tab}
|   |-- process detail page
|   |-- header includes process code, title, state, and version switcher
|   |-- overview
|   |   `-- route: #process/{processId}/overview
|   |-- subprocesses
|   |   `-- route: #process/{processId}/subprocesses
|   |       `-- list of subprocess cards
|   |           `-- open #subprocess/{subprocessId}/{tab}
|   |-- diagrams
|   |   `-- route: #process/{processId}/diagrams
|   |       `-- asset list + BPMN viewer for the current process version
|   |           `-- assets can open #asset/{assetId}
|   |-- versions
|   |   `-- route: #process/{processId}/versions
|   `-- process BPMN-only view
|       `-- route: #process/{processId}/diagram
|-- #subprocess/{subprocessId}/{tab}
|   |-- subprocess detail page
|   |-- details
|   |   `-- route: #subprocess/{subprocessId}/details
|   `-- diagram
|       `-- route: #subprocess/{subprocessId}/diagram
|           `-- BPMN viewer using the subprocess-matching asset from the parent process version
`-- #asset/{assetId}
    |-- standalone asset detail page
    |-- asset metadata and available files
    `-- "Visualizar" action
        `-- loads the BPMN file and returns the user to the process detail diagram area
```

### Route Interpretation Notes

- Top navigation order in the desktop UI is: `#welcome`, `#introduction`, `Macroprocessos`, `#dashboard`, `#methodology`, and `#faq`.
- `Macroprocessos` is a dropdown navigation section, not a literal `#macroprocesses` route. It is the entry point to `#macroprocess/{id}` pages.
- Process UI labels and route names are not identical:
  - `Visão Geral` -> `overview`
  - `Subprocessos` -> `subprocesses`
  - `Diagramas` -> `diagrams`
  - `Versões` -> `versions`
  - hidden/direct route: process BPMN viewer -> `diagram`
- Subprocess UI labels and route names are:
  - `Detalhes` -> `details`
  - `Diagrama` -> `diagram`
- `#asset/{id}` is a supporting detail page for one BPMN/model asset; it is not a top-level section.

## Project Structure

```text
index.html
server.js
sample-diagram.bpmn
diagrams/
assets/
|-- css/
|   `-- prototype.css
data/
|-- macroprocesses.json
|-- processes.json
`-- search-index.json
src/
|-- components/
|   |-- diagram.js
|   |-- header.js
|   |-- menus.js
|   |-- navigation.js
|   |-- process-list.js
|   |-- process.js
|   |-- shell.js
|   |-- subprocess-format.js
|   |-- subprocess.js
|   `-- tables.js
|-- controllers/
|   |-- asset.js
|   |-- macroprocess.js
|   |-- process.js
|   `-- subprocess.js
|-- core/
|   |-- bootstrap.js
|   |-- header-search.js
|   |-- layout.js
|   |-- router.js
|   |-- state.js
|   |-- tailwind-config.js
|   |-- ui.js
|   `-- views.js
|-- sections/
|   |-- dashboard.js
|   |-- faq.js
|   |-- introduction.js
|   |-- methodology.js
|   `-- welcome.js
|-- services/
|   |-- bpmn.js
|   `-- search.js
`-- utils/
    `-- chevron.js
```

## Responsibility Map

### `components/`

- reusable UI building blocks
- shared process/subprocess rendering
- shared dashboard table logic
- shared diagram viewer shell

### `controllers/`

- macroprocess detail controller
- process detail controller
- subprocess detail controller
- asset detail controller

### `core/`

- app bootstrapping
- shared state
- layout mounting
- hash route parsing and route application
- section visibility
- app-wide wiring and view lifecycle

### `sections/`

- menu-backed screens
- welcome cards and anchors
- dashboard tables and stats
- methodology and FAQ content

### `services/`

- shared app capabilities
- search state, indexing, and interaction handling
- BPMN loading, viewport control, and viewer actions

### `utils/`

- small presentation helpers

### `data/`

- mock runtime JSON used by the frontend
- macroprocess, process, and search records fetched by the browser

## Data Files

### `macroprocesses.json`

Contains top-level macroprocess metadata used by:

- navigation dropdowns
- dashboard macroprocess table
- macroprocess detail pages

### `processes.json`

Contains:

- processes
- versions
- subprocesses
- assets
- BPMN/SVG/DMN file references

### `search-index.json`

Prebuilt search index used by Fuse.js for:

- welcome search
- header search

## UI Notes

- Dashboard route is `#dashboard`, not `#homepage`
- Welcome cards navigate to section anchors where appropriate
- Process overview uses a simplified summary-first layout
- Subprocess detail opens directly in the structured `details` view
- Subprocess summaries are shown in the page header instead of a separate overview tab
- Dashboard tables use fixed-height paginated rows to reduce footer jumping

## Running Locally

```bash
cd docs/IGFEJ/prototypes/frontend-prototype
node server.js
```

Then open:

- `http://localhost:9000`

## Technical Notes

- Tailwind is loaded through CDN configuration
- BPMN rendering uses `bpmn-js`
- Search uses `Fuse.js`
- Routing is hash-based and refresh-safe
- Files were intentionally split to keep implementation units small and easier to maintain
