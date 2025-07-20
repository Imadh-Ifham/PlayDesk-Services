# Business App

A modern React-based business dashboard application built with TypeScript, Vite, and Tailwind CSS. This application serves as the main business interface within the PlayDesk project ecosystem.

## 🚀 Features

- **Modern React Architecture**: Built with React 19 and TypeScript for type safety
- **Responsive Dashboard**: Clean, modern dashboard layout with sidebar navigation
- **State Management**: Redux Toolkit for predictable state management
- **Routing**: React Router v7 for client-side navigation
- **Styling**: Tailwind CSS v4 for utility-first styling with dark mode support
- **API Integration**: Axios for HTTP requests
- **Notifications**: React Hot Toast for user feedback
- **Icons**: React Icons library for consistent iconography

## 🛠️ Tech Stack

### Core Technologies

- **React 19.1.0** - Modern React with latest features
- **TypeScript 5.8.3** - Static type checking
- **Vite 7.0.4** - Fast build tool and dev server

### UI & Styling

- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **React Icons 5.5.0** - Icon library
- **clsx 2.1.1** - Conditional class utility

### State Management & Routing

- **Redux Toolkit 2.8.2** - State management
- **React Redux 9.2.0** - React bindings for Redux
- **React Router DOM 7.7.0** - Client-side routing

### HTTP & Notifications

- **Axios 1.10.0** - HTTP client
- **React Hot Toast 2.5.2** - Toast notifications

### Development Tools

- **ESLint 9.30.1** - Code linting
- **TypeScript ESLint 8.35.1** - TypeScript-specific linting rules

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   └── loaders/     # Loading components
│       └── AuthLoader.tsx
├── features/        # Feature-specific components and logic
├── layouts/         # Layout components
│   ├── DashboardLayout.tsx  # Main dashboard layout
│   └── Sidebar.tsx          # Navigation sidebar
├── pages/           # Page components
│   └── OverviewPage.tsx     # Dashboard overview page
├── utils/           # Utility functions
│   ├── scrollToTop.util.ts  # Scroll to top utility
│   └── themeChange.util.ts  # Theme switching utility
├── App.tsx          # Main application component
├── App.css          # Global styles
├── index.css        # Base styles
├── main.tsx         # Application entry point
└── vite-env.d.ts    # Vite environment types
```

## 🏗️ Architecture

### Layout System

- **DashboardLayout**: Main layout wrapper with sidebar and content area
- **Sidebar**: Navigation component with role-based access
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Routing Structure

- Root route (`/`) renders the DashboardLayout
- Nested routes for different dashboard sections
- Overview page as the main dashboard view

### Styling Architecture

- **Tailwind CSS**: Utility-first styling approach
- **Dark Mode**: Built-in dark theme support
- **Responsive**: Mobile-first responsive design
- **Component-scoped**: CSS modules for component isolation

## 🚦 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

### Building

```bash
# Build for production
pnpm build
```

### Linting

```bash
# Run ESLint
pnpm lint
```

### Preview

```bash
# Preview production build
pnpm preview
```

## 🎯 Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm lint` - Run ESLint for code quality checks
- `pnpm preview` - Preview the production build locally

## 🔧 Configuration

### TypeScript Configuration

- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js environment settings

### Build Configuration

- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint configuration for code quality

## 🎨 Styling Guidelines

This project uses Tailwind CSS v4 with the following conventions:

- Utility-first approach for styling
- Dark mode support via `dark:` prefix
- Responsive design with mobile-first breakpoints
- Component composition over custom CSS

## 🔌 Development Features

- **Hot Module Replacement (HMR)** - Instant updates during development
- **TypeScript Support** - Full type checking and IntelliSense
- **ESLint Integration** - Code quality and consistency enforcement
- **Fast Refresh** - React Fast Refresh for component state preservation

## 🚀 Deployment

The application is built as a static SPA and can be deployed to any static hosting service:

1. Run `pnpm build` to create the production build
2. Deploy the `dist/` folder to your hosting service

## 📝 Contributing

When contributing to this project:

1. Follow the existing code style and TypeScript conventions
2. Run `pnpm lint` to ensure code quality
3. Test your changes in both light and dark modes
4. Ensure responsive design works across different screen sizes

## 🔗 Related Projects

This business app is part of the larger PlayDesk ecosystem:

- **Customer Apps**: Customer-specific applications
- **Services**: Backend services and APIs
- **Shared**: Shared utilities and components
