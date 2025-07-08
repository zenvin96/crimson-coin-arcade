# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crimson Coin Arcade (赤币街机) is a modern cryptocurrency gambling/gaming platform built with React 18, TypeScript 5, and Vite. The project uses a comprehensive UI component library (Shadcn/UI) with Tailwind CSS for styling.

## Essential Commands

### Development
```bash
npm run dev         # Start development server on port 8080
npm run build       # Build for production
npm run build:dev   # Build for development environment
npm run preview     # Preview production build locally
npm run lint        # Run ESLint checks
```

### Testing
**Note**: No test infrastructure is currently set up. When implementing tests, consider using Vitest as mentioned in README.md.

## Architecture Overview

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1 with React SWC plugin
- **UI Components**: Shadcn/UI (50+ components in src/components/ui/)
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React Context API (AppContext)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next (English and Chinese support)
- **Routing**: React Router DOM 6

### Key Architectural Patterns

1. **Component Organization**:
   - `src/components/ui/`: Base Shadcn/UI components (Button, Card, Dialog, etc.)
   - `src/components/layout/`: Layout components (AppLayout, Sidebar, Header)
   - `src/components/sections/`: Page-specific sections (Hero, GameShowcase)
   - `src/components/games/`: Game-related components

2. **State Management**:
   - Global state via AppContext (src/contexts/AppContext.tsx)
   - Authentication state, theme preferences, and user session handled centrally
   - Component-level state with useState/useReducer

3. **API Services**:
   - Mock data currently in use (src/services/)
   - Services for games, winners, token prices, and exchange rates
   - TanStack Query for data fetching and caching

4. **Styling Approach**:
   - Tailwind CSS with custom configuration
   - CSS variables for theming (defined in globals.css)
   - Dark/light mode support via next-themes
   - 8px grid system for spacing
   - Custom color palette: Primary (#E11D48), Accent (#F59E0B)

5. **Internationalization**:
   - Language files in src/i18n/locales/
   - Automatic language detection
   - Support for English (en) and Chinese (zh)

## TypeScript Configuration

**Important**: There's a configuration split:
- `tsconfig.json`: Disables some strict checks (noImplicitAny: false, noUnusedParameters: false)
- `tsconfig.app.json`: Enables strict mode for application code
- Path alias configured: `@/*` → `./src/*`

When working with TypeScript, be aware that the app config is stricter than the base config.

## Development Guidelines

### Code Style Requirements
- Use TypeScript for all files (.tsx/.ts)
- Components: PascalCase (e.g., GameCard.tsx)
- Functions/variables: camelCase (e.g., toggleTheme)
- Constants: UPPER_SNAKE_CASE (e.g., API_URL)
- Prefer functional components with hooks
- Follow single responsibility principle

### Import Order
1. React and React-related imports
2. Third-party libraries
3. Project contexts and hooks
4. Utility functions and constants
5. Components
6. Types
7. Styles

### AI Collaboration
- The project actively uses AI assistance (see CURSOR_GUIDE.md)
- AI-generated code must be reviewed
- Mark AI contributions in commits with [AI辅助] or [AI-assisted]

### Key Features to Understand
1. **Multi-currency Support**: USDT, BTC, ETH, MYR, EUR, USD
2. **Game Categories**: Slots, Table Games, Live Casino, Jackpots, Originals, Sports Betting
3. **Authentication**: Login/logout with session management
4. **Theme System**: Dark/light mode toggle
5. **Responsive Design**: Mobile-first approach with specific mobile navigation

## Common Workflows

### Adding a New Component
1. Create component in appropriate directory (ui/, sections/, or layout/)
2. Follow existing component patterns (check similar components first)
3. Use Shadcn/UI components as base when possible
4. Ensure TypeScript types are properly defined
5. Add internationalization keys if needed

### Working with Translations
1. Language files located in src/i18n/locales/
2. Use the useTranslation hook from react-i18next
3. Add keys to both en.json and zh.json files

### Modifying Styles
1. Use Tailwind classes following the project's conventions
2. Custom animations defined in tailwind.config.ts
3. Theme colors use CSS variables (see globals.css)
4. Maintain 8px grid system for spacing

## Important Notes

- **No Test Infrastructure**: Testing setup needs to be implemented
- **Mock Data**: Currently using mock services, real API integration pending
- **Strict TypeScript**: Be aware of the dual TypeScript configuration
- **Documentation**: Comprehensive docs in README.md, STYLE_GUIDE.md, CONTRIBUTING.md
- **Git Workflow**: Uses Git Flow with conventional commits