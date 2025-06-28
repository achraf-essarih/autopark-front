# PARC Auto Management System

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Application header with logo and user actions
│   └── Navigation.js   # Main navigation menu
├── pages/              # Page components for each route
│   ├── Dashboard.js    # Dashboard with statistics and charts
│   ├── ParcAuto.js     # Vehicle management page
│   ├── Consommations.js # Fuel consumption tracking
│   ├── Interventions.js # Vehicle interventions with tabs
│   ├── OrdresMissions.js # Mission orders management
│   └── Rapports.js     # Reports with dynamic tabs
├── utils/              # Utility functions and constants
│   └── constants.js    # Shared constants and configurations
├── App.js              # Main application component with routing
├── App.css             # Global styles and component styles
└── index.js            # Application entry point
```

## Component Architecture

### Layout Components
- **Header**: Contains logo, navigation icons, and user avatar
- **Navigation**: Tab-based navigation between main sections

### Page Components
- **Dashboard**: Overview with statistics cards and consumption chart
- **ParcAuto**: Vehicle management with add/edit forms
- **Consommations**: Fuel consumption tracking and reporting
- **Interventions**: Vehicle maintenance with tab-based interface
- **OrdresMissions**: Mission order management
- **Rapports**: Dynamic reports with sidebar navigation

### Features
- ✅ Responsive design
- ✅ Tab-based navigation
- ✅ Dynamic forms
- ✅ Multi-language support (French/Arabic)
- ✅ Professional styling
- ✅ Modular architecture
- ✅ Scalable structure

## Adding New Features

### Adding a new page:
1. Create component in `pages/` directory
2. Add route to `App.js`
3. Add navigation item to `utils/constants.js`

### Adding new components:
1. Create component in `components/` directory
2. Import and use in relevant pages
3. Add shared constants to `utils/constants.js`

## Styling

All styles are centralized in `App.css` with:
- CSS variables for consistent theming
- Responsive design patterns
- Professional UI components
- Hover states and transitions 