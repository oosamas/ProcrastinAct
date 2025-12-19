# ProcrastinAct

**The go-to app for neurodivergent people who struggle with task initiation and time awareness.**

ProcrastinAct combines AI-powered task shrinking with ambient time visualization to help users start tasks and stay aware of time passing—without shame, guilt, or nagging.

## Vision

- **Target**: Top 50 in Productivity/Health & Fitness category
- **Monetization**: Free with heartfelt donate button
- **Platform**: Cross-platform (iOS, Android, Web PWA)

## Core Features

- 🎯 **Single Task Focus** - One task at a time, no overwhelming lists
- 🔬 **AI Task Shrinking** - Break tasks down to absurdly small first steps
- ⏰ **Ambient Time Awareness** - Visual time representation without anxiety
- 💚 **Permission to Stop** - Celebrate rest, not just productivity
- 🏆 **Non-Punishing Gamification** - Streaks that forgive, achievements that celebrate self-care

## Project Structure

```
/procrastinact
├── apps/
│   ├── mobile/          # React Native (Expo) - iOS & Android
│   ├── web/             # Next.js PWA
│   └── landing/         # Marketing site
├── packages/
│   ├── ui/              # Shared UI components
│   ├── core/            # Business logic
│   ├── api/             # API client
│   ├── types/           # Shared TypeScript types
│   ├── eslint-config/   # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

### Available Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start all apps in development mode |
| `npm run build`        | Build all apps and packages        |
| `npm run lint`         | Lint all packages                  |
| `npm run lint:fix`     | Lint and auto-fix issues           |
| `npm run format`       | Format all files with Prettier     |
| `npm run format:check` | Check formatting                   |
| `npm run check-types`  | Type-check all packages            |
| `npm run test`         | Run tests                          |
| `npm run clean`        | Clean all build artifacts          |

## Development

This project uses [Turborepo](https://turbo.build/repo) for monorepo management.

### Adding a new package

1. Create a new directory in `packages/`
2. Add a `package.json` with the `@procrastinact/` namespace
3. Add a `tsconfig.json` extending the shared config
4. The package will automatically be included in the workspace

### Code Quality

- **ESLint** - Linting with React and TypeScript plugins
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks for linting staged files
- **TypeScript** - Strict type checking

## Contributing

See the [GitHub Issues](https://github.com/oosamas/ProcrastinAct/issues) for the development roadmap.

## License

MIT

---

Built with 💜 for the ADHD community
