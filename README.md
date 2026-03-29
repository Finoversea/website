# Product

Monorepo containing the Product MVP application.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: Fastify, TypeScript, Drizzle ORM, PostgreSQL
- **Infrastructure**: Docker, GitHub Actions CI/CD

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Docker (for local database)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd product

# Install dependencies
pnpm install

# Start databases (PostgreSQL + Redis)
docker-compose up -d

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run development servers (both API and Web)
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/documentation

## Repository Structure

```
product/
├── apps/
│   ├── api/              # Fastify backend API
│   └── web/              # Next.js frontend
├── packages/
│   ├── config/           # Shared TypeScript/ESLint config
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components
├── .github/
│   └── workflows/        # CI/CD pipelines
└── docker-compose.yml    # Local development infrastructure
```

## Available Commands

```bash
pnpm dev          # Run all apps in development mode
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm test         # Run tests
pnpm typecheck    # Type check all apps
pnpm clean        # Clean build artifacts
```

## Development

### Backend API

```bash
cd apps/api
pnpm dev          # Start API server on port 3001
```

### Frontend Web

```bash
cd apps/web
pnpm dev          # Start Next.js on port 3000
```

## CI/CD

The CI pipeline runs on every push and PR:

- Lint check
- TypeScript type checking
- Unit tests
- Build verification

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## Engineering Practices

See [ENGINEERING.md](./ENGINEERING.md) for team practices and standards.
