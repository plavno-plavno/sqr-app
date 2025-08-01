# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm run dev` (or `pnpm run dev:host` for network access)
- **Build**: `pnpm run build` (runs TypeScript compilation + Vite build)
- **Lint**: `pnpm run lint`
- **Preview**: `pnpm run preview`

## Architecture Overview

This is a React + TypeScript + Vite application for a financial AI assistant with voice interaction capabilities. The project follows Feature-Sliced Design (FSD) architecture:

### Core Structure
- `src/app/` - Application initialization, routing, and global configuration
- `src/pages/` - Route components (home, finance, chat, analytics, invest, payments, settings)
- `src/features/` - Business logic features (chat, finance, transactions, investments, etc.)
- `src/shared/` - Reusable utilities, UI components, and shared models

### Key Technologies
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **State Management**: Zustand with Immer middleware and persistence
- **Routing**: React Router v7 with lazy-loaded pages
- **Voice Processing**: @ricky0123/vad-web for voice activity detection
- **Real-time Communication**: Socket.io client for WebSocket connections
- **Audio**: Custom audio processing with Web Audio API and worklets
- **Charts**: Recharts for data visualization
- **UI Components**: Radix UI primitives with custom styling

### State Management Pattern
The app uses Zustand stores with a custom `createSelectors` utility that provides property-based selectors:
```typescript
// Instead of: const messages = useStore(state => state.messages)
// Use: const messages = useStore.use.messages()
```

Key stores:
- `chat-store.ts` - Chat messages, dialogs, and conversation state
- `websocket-store.ts` - WebSocket connection state
- `audio-store.ts` - Voice/audio processing state
- `finance-store.ts`, `transaction-store.ts`, `investment-store.ts` - Financial data

### Voice & Audio Architecture
The application features sophisticated voice interaction:
- Voice Activity Detection (VAD) using Silero VAD model
- Real-time audio processing with AudioWorklet
- WebSocket communication for voice data streaming
- Audio visualization and sound level indicators

### Routing & Navigation
- Centralized route definitions in `src/shared/model/routes.ts`
- Type-safe routing with TypeScript augmentation
- Lazy-loaded page components for performance
- Global error boundary for error handling

### UI Architecture
- Component library in `src/shared/ui/kit/` using Radix UI primitives
- Responsive design with mobile-first approach
- Custom components for financial data visualization
- Adaptive drawer/dialog components for mobile/desktop

### API Integration
- Axios instance in `src/shared/api/instance.ts`
- Environment-based configuration via `src/shared/model/config.ts`
- Mock data providers in `src/shared/mock/`

### Asset Management
- SVG icons with SVGR plugin for React components
- Lottie animations for voice visualization
- Static asset copying for VAD model files via Vite plugin

### FSD Architecture Enforcement
The project uses `eslint-plugin-boundaries` to enforce Feature-Sliced Design import rules:
- `shared` layer cannot import from `features`, `pages`, or `app`
- `features` layer cannot import from `pages` or `app`  
- `pages` layer cannot import from `app`
- Features must be imported through `index.(ts|tsx)` files
- Pages must be imported through `*.page.tsx` files

### Intent-Based AI Architecture
The chat system processes structured intents defined in `src/shared/model/intents.ts`:
- 11 financial intent types (transfers, investments, analytics, etc.)
- Type-safe intent responses with standardized schemas
- Each intent has structured output format with warnings, summaries, and specific data

### Development Notes
- Path mapping configured with `@/*` pointing to `src/*`
- SSL enabled for HTTPS development server (required for voice features)
- Hot module replacement (HMR) enabled
- ESLint with TypeScript, React hooks, and architectural boundary rules
- No testing framework configured
- Environment variables via `.env.development` (API base URL: `/api`)
