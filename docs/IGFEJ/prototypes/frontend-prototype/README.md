# IGFEJ Process Management System Prototype

## Overview

This is a modern, responsive prototype of the IGFEJ (Inspeção-Geral dos Serviços de Justiça) Process Management System, built with HTML5, Tailwind CSS, and bpmn.js. The prototype demonstrates the frontend requirements for the public consultation portal of business processes and procedures.

## Features

### Core Functionality

- **Hierarchical Navigation**: Browse macroprocesses → processes → subprocesses → procedures
- **Interactive BPMN Visualization**: View and interact with BPMN 2.0 diagrams using bpmn.js
- **Advanced Search**: Fuzzy search with filtering capabilities using Fuse.js
- **Responsive Design**: Mobile-first design that works on all devices
- **Process Detail Views**: Comprehensive process information with tabbed interface

### Technical Features

- **Modern Stack**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Performance Optimized**: Lazy loading
- **Print Support**: Print-friendly layouts for process documentation

## File Structure

```
igfej-prototype/
├── index.html                 # Main application file
├── assets/
│   ├── css/
│   │   └── custom.css         # Custom styles and print support
│   ├── js/
│   │   ├── app.js            # Main application logic
│   │   ├── search.js         # Search functionality
│   │   ├── bpmn-viewer.js    # BPMN diagram viewer
│   │   └── navigation.js    # Navigation and routing
│   ├── data/
│   │   ├── processes.json    # Process hierarchy data
│   │   └── search-index.json # Search index
│   └── models/
│       └── sample-diagram.bpmn # Sample BPMN diagram
└── README.md                 # This file
```

## Getting Started

### Running the Prototype

1. **Using a Local Server**:

   Navigate to the prototype directory and run the following command to avoid CORS issues when loading mock data:

   ```bash

   # Using Node.js
   node server.js
   ```

2. **Direct File Access**:
   Simply open `index.html` in your web browser

3. **Access the Prototype**:
   Navigate to `http://localhost:9000`

### Frontend Technologies

- **HTML5**: Semantic markup and accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **bpmn.js**: BPMN 2.0 rendering library
- **Fuse.js**: Fuzzy search functionality
- **Vanilla JavaScript**: Lightweight, no framework dependencies

## Performance Metrics

Target performance benchmarks:

- **Page Load**: < 3 seconds
- **Search Response**: < 1 second
- **BPMN Rendering**: < 2 seconds
- **Mobile Performance**: 95+ Lighthouse score

## Known Limitations

### Current Prototype

- Mock data only (no backend integration)
- Static BPMN diagrams (no real-time updates)
- No user authentication (public access only)
- Limited to Portuguese language (English toggle prepared)

### Production Considerations

- Backend API integration required
- Real BPMN file management
- User authentication and authorization
- Version control system
- Content management interface (back office)

## Development Notes

### Customization

- **Colors**: Modify Tailwind config in `index.html`
- **Data**: Update JSON files in `assets/data/`
- **Styling**: Add custom CSS to `assets/css/custom.css`
- **BPMN Files**: Add to `assets/models/`

## Note

This prototype is for demonstration purposes only.
