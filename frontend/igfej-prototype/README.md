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
- **Multi-language Support**: Portuguese/English language toggle
- **FAQ Section**: Common questions and answers

### Technical Features

- **Modern Stack**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Performance Optimized**: Lazy loading, caching, and optimized assets
- **Accessibility**: WCAG 2.1 AA compliance
- **Print Support**: Print-friendly layouts for process documentation
- **Keyboard Navigation**: Full keyboard accessibility

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

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended for development)

### Running the Prototype

1. **Using a Local Server** (Recommended):

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

2. **Direct File Access**:
   Simply open `index.html` in your web browser (some features may be limited due to CORS)

3. **Access the Prototype**:
   Navigate to `http://localhost:8000` (or your chosen port)

## Features Demonstration

### Navigation

- Click on macroprocesses in the sidebar to browse processes
- Use breadcrumb navigation to go back
- Mobile: Use hamburger menu to toggle sidebar

### Search

- Type in the search bar for real-time results
- Use keyboard arrows to navigate results
- Press Enter to select a result

### BPMN Viewer

- Click on any process with a BPMN diagram
- Use zoom controls (in/out/fit)
- Click elements to see details
- Fullscreen mode available

### Process Details

- Comprehensive process information
- Tabbed interface (Overview, Details, BPMN, Documents, History)
- Export and bookmark functionality

## Mock Data

The prototype includes realistic mock data based on the existing IGFEJ system:

- **7 Macroprocesses**: Main process categories
- **12 Processes**: Sample processes across categories
- **Sample BPMN Diagrams**: Interactive process flows
- **Search Index**: 13 searchable items

## Technical Implementation

### Frontend Technologies

- **HTML5**: Semantic markup and accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **bpmn.js**: BPMN 2.0 rendering library
- **Fuse.js**: Fuzzy search functionality
- **Vanilla JavaScript**: Lightweight, no framework dependencies

### Key Features

- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript
- **Performance**: Lazy loading and optimization
- **Accessibility**: Screen reader and keyboard support

## Browser Support

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## Performance Metrics

Target performance benchmarks:

- **Page Load**: < 3 seconds
- **Search Response**: < 1 second
- **BPMN Rendering**: < 2 seconds
- **Mobile Performance**: 95+ Lighthouse score

## Accessibility

The prototype follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard access
- **Screen Reader**: ARIA labels and landmarks
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user preferences

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
- Content management interface

## Future Enhancements

### Planned Features

- **Backend Integration**: Connect to PostgreSQL database
- **Real BPMN Files**: Load actual IGFEJ diagrams
- **Version Management**: Track process changes over time
- **User Management**: Authentication and roles
- **Export Functionality**: PDF, Word, Excel exports
- **Advanced Search**: Category filtering, date ranges
- **Analytics**: Usage tracking and reporting

### Technical Improvements

- **PWA Support**: Offline functionality
- **Caching Strategy**: Service worker implementation
- **Performance Monitoring**: Real user monitoring
- **A/B Testing**: Feature rollout optimization

## Development Notes

### Customization

- **Colors**: Modify Tailwind config in `index.html`
- **Data**: Update JSON files in `assets/data/`
- **Styling**: Add custom CSS to `assets/css/custom.css`
- **BPMN Files**: Add to `assets/models/`

### Debugging

- Browser console shows detailed logging
- Network tab shows API calls (when implemented)
- Performance tab shows loading metrics

## Support

For questions or issues:

1. Check browser console for errors
2. Verify local server is running
3. Ensure all files are present
4. Test in different browsers

## License

This prototype is for demonstration purposes only.
© 2026 IGFEJ - Inspeção-Geral dos Serviços de Justiça
