# CLAUDE.md

This file provides comprehensive guidance to AI assistants (Claude Code, Cursor, etc.) when working with the 赤币街机 (Crimson Coin Arcade) codebase. All rules and specifications here are mandatory and must be strictly followed.

## 🎯 Project Overview

**赤币街机 (Crimson Coin Arcade)** - A modern cryptocurrency gambling/gaming platform built with React 18, TypeScript 5, and Vite.

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1 with React SWC plugin
- **UI Library**: Shadcn/UI (50+ components)
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context API + TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next (English/Chinese)
- **Routing**: React Router DOM v6

## 📦 Essential Commands

```bash
npm run dev         # Start development server (port 8080)
npm run build       # Production build
npm run build:dev   # Development build
npm run preview     # Preview production build
npm run lint        # Run ESLint checks
```

**Note**: No test infrastructure currently exists. When implementing tests, use Vitest.

## ⚡ CRITICAL DEVELOPMENT RULES

### 1. TypeScript Mandatory
- **ALL files must use TypeScript** (.tsx/.ts extensions)
- **NEVER use `any` type** - define proper types
- **Dual config awareness**:
  - `tsconfig.json`: Base config (less strict)
  - `tsconfig.app.json`: App config (strict mode enabled)
- **Path alias**: `@/*` → `./src/*`

### 2. Strict Naming Conventions
- **Components**: PascalCase (e.g., `GameCard.tsx`, `HeroSection.tsx`)
- **Functions/Variables**: camelCase (e.g., `toggleTheme`, `setIsLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_ATTEMPTS`)
- **Files**: Match exported component name, use PascalCase

### 3. Import Order (MUST follow exactly)
1. React and React-related imports
2. Third-party libraries
3. Project contexts and hooks
4. Utility functions and constants
5. Components
6. Types
7. Styles

### 4. Component Patterns
- **ONLY functional components with hooks** (no class components)
- **Single responsibility principle** - small, focused components
- **Composition over inheritance**
- **NO COMMENTS unless explicitly requested**

## 🏗️ Architecture Specifications

### Folder Structure
```
src/
├── components/           # UI Components
│   ├── ui/              # Base Shadcn/UI components (Button, Card, Dialog, etc.)
│   ├── layout/          # Layout components (AppLayout, Sidebar, Header)
│   ├── sections/        # Page-specific sections (Hero, GameShowcase)
│   └── games/           # Game-related components
├── contexts/            # React Context providers (AppContext)
├── hooks/               # Custom React hooks
├── pages/               # Route page components
├── services/            # API calls and data services
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions and constants
└── i18n/               # Internationalization
    └── locales/        # Language files (en.json, zh.json)
```

### State Management Strategy
- **Global State**: React Context API via `AppContext`
  - Authentication state
  - Theme preferences
  - User session
- **Server State**: TanStack Query for API data
- **Form State**: React Hook Form
- **Local State**: useState/useReducer

### Service Layer
- All API calls in `src/services/`
- Currently using mock data
- TypeScript types for all API responses
- TanStack Query for caching

## 🎨 Style and Design System

### Color Palette
```css
/* Primary Colors */
--primary: #E11D48;        /* Red - main brand color */
--accent: #F59E0B;         /* Gold - secondary emphasis */

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Backgrounds */
--dark-bg: #18181B;        /* Dark mode */
--light-bg: #FAFAFA;       /* Light mode */
```

### Spacing (8px Grid System)
- Use only: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Tailwind classes: `space-x-1`, `p-2`, `m-4`, etc.

### Typography Scale
```
H1: 2.5rem (40px)
H2: 2rem (32px)
H3: 1.5rem (24px)
H4: 1.25rem (20px)
Body: 1rem (16px)
Small: 0.875rem (14px)
```

### Border Radius
- Small: `rounded-sm` (2px)
- Default: `rounded` (4px)
- Medium: `rounded-md` (8px)
- Large: `rounded-lg` (16px)
- Full: `rounded-full`

### Shadows
- Small: `shadow-sm`
- Default: `shadow`
- Medium: `shadow-md`
- Large: `shadow-lg`
- Extra Large: `shadow-xl`

### Animation Durations
- Ultra Fast: 100ms
- Fast: 200ms
- Normal: 300ms
- Slow: 500ms
- Ultra Slow: 700ms

## 🧩 UI Component Guidelines

### Buttons
- **Primary**: bg-primary text-white hover:bg-primary/90
- **Secondary**: border border-primary text-primary hover:bg-primary/10
- **Link**: text-primary hover:underline
- Height: 40px (2.5rem)
- Padding: px-3 py-2

### Cards
- Background: bg-white dark:bg-gray-800
- Border: border border-gray-200 dark:border-gray-700
- Border Radius: rounded-md (8px)
- Shadow: shadow-sm to shadow-md
- Padding: p-4 (16px) to p-6 (24px)

### Input Fields
- Height: h-10 (40px)
- Background: bg-white dark:bg-gray-800
- Border: border-gray-300 dark:border-gray-600
- Focus: focus:border-primary focus:ring-primary
- Border Radius: rounded (4px)
- Padding: px-3 py-2

### Icons
- Default: w-6 h-6 (24px)
- Small: w-4 h-4 (16px)
- Large: w-8 h-8 (32px)

## ✅ Code Quality Standards

### ESLint Rules
- Must pass all ESLint checks
- Run `npm run lint` before committing
- No unused variables or imports
- Consistent code formatting

### Performance Optimization
- Use `React.memo` for expensive components
- Apply `useMemo` for complex calculations
- Implement `useCallback` for event handlers
- Lazy load images and routes
- Show loading states and skeleton screens

### Testing Requirements
- Target: 80% coverage minimum
- Use Vitest for unit tests
- Follow AAA pattern: Arrange, Act, Assert
- Test critical user flows

## 🔒 Security Best Practices
- NEVER expose or log secrets/keys
- NEVER commit credentials
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for all external requests

## ♿ Accessibility Requirements

### Mandatory Standards
- Text contrast ratio: 4.5:1 minimum
- All interactive elements keyboard navigable
- ARIA labels for icon buttons
- Form labels for all inputs
- Focus indicators visible
- Alt text for images

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: 0px
  - Tablet: 640px (sm:)
  - Laptop: 1024px (lg:)
  - Desktop: 1280px (xl:)
  - Large: 1536px (2xl:)

## 📝 Git Workflow

### Branch Strategy
- Main branch: `main`
- Feature branches: `feature/description`
- Fix branches: `fix/description`

### Commit Convention (Mandatory)
```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Style changes (formatting, etc.)
refactor: Code restructuring
test: Test additions/changes
chore: Build process or tool changes
perf: Performance improvements
```

### AI Collaboration
- Mark AI-assisted code with `[AI辅助]` or `[AI-assisted]` in commits
- All AI-generated code must be reviewed
- Follow CURSOR_GUIDE.md for AI best practices

## 🚀 Development Workflow

### Adding New Components
1. Check existing similar components first
2. Use Shadcn/UI base components when possible
3. Follow existing patterns and conventions
4. Define TypeScript interfaces/types
5. Add i18n keys to both en.json and zh.json
6. Ensure responsive design
7. Test dark/light theme compatibility

### Before Committing
1. Run `npm run lint` and fix all issues
2. Ensure TypeScript compilation succeeds
3. Test in both themes
4. Check responsive design
5. Verify i18n keys are complete

### Working with Translations
- Files: `src/i18n/locales/{en,zh}.json`
- Hook: `useTranslation()` from react-i18next
- Always provide both English and Chinese

## 🎮 Project Features

### Core Functionalities
- Multi-currency support: USDT, BTC, ETH, MYR, EUR, USD
- Game categories: Slots, Table Games, Live Casino, Jackpots, Originals, Sports
- Authentication: Login/logout with session management
- Theme system: Dark/light mode toggle
- Language switch: English/Chinese

### Current Status
- **Mock Data**: Using mock services, real API pending
- **No Tests**: Test infrastructure needs implementation
- **TypeScript Dual Config**: Be aware of different strictness levels

## ⚠️ Important Reminders

1. **NEVER add comments** unless explicitly requested
2. **ALWAYS use TypeScript** - no JavaScript files
3. **FOLLOW import order** exactly as specified
4. **USE functional components** only
5. **RESPECT the 8px grid** for all spacing
6. **TEST dark mode** compatibility
7. **ENSURE responsive design** works
8. **CHECK ESLint** before committing
9. **PREFER editing** existing files over creating new ones
10. **AVOID creating** documentation files unless requested

## 📚 Related Documentation

- [README.md](./README.md) - Project overview and setup
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Detailed design specifications
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CURSOR_GUIDE.md](./CURSOR_GUIDE.md) - AI collaboration best practices
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards

---

**Remember**: This document represents the single source of truth for all development standards in the 赤币街机 project. All specifications are mandatory and must be strictly followed to maintain consistency and quality.