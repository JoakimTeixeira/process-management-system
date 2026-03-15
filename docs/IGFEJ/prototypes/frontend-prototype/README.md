# IGFEJ Frontend Prototype

## Overview

This prototype is a vanilla JavaScript frontend for exploring IGFEJ macroprocesses, processes, subprocesses, and BPMN diagrams.

## Main Capabilities

- Welcome, Introduction, Dashboard, Methodology, and FAQ sections
- Dynamic routes for macroprocess, process, subprocess, and asset detail pages
- Process and subprocess detail tabs
- BPMN viewer with fit, zoom, fullscreen, and download
- Accent-insensitive search with highlighting
- Dashboard tables with search, filtering, sorting, and pagination

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
