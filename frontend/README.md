# InspectionAgent Frontend

React + TypeScript + Vite frontend for ADNOC InspectionAgent system.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (AppLayout, Navbar, Sidebar)
│   │   ├── auth/           # Authentication components
│   │   ├── inspections/    # Inspection-related components
│   │   ├── approvals/      # Approval workflow components
│   │   ├── dashboard/      # Dashboard widgets
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   │   ├── auth/           # Login, Profile
│   │   ├── assets/         # Asset management pages
│   │   ├── plans/          # Annual/Quarterly/Monthly plans
│   │   ├── inspections/    # Inspection pages
│   │   ├── reports/        # Report pages
│   │   ├── approvals/      # Approval pages
│   │   ├── dashboard/      # Dashboard page
│   │   └── admin/          # Admin pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client & services
│   │   └── api.ts          # Axios instance with interceptors
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Base types
│   │   ├── auth.ts         # Auth types
│   │   ├── asset.ts        # Asset types
│   │   ├── inspection.ts   # Inspection types
│   │   └── approval.ts     # Approval types
│   ├── utils/              # Utility functions
│   ├── lib/                # shadcn/ui utilities
│   │   └── utils.ts        # cn() function
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
├── postcss.config.js       # PostCSS config
├── .eslintrc.cjs           # ESLint config
├── .prettierrc             # Prettier config
├── .env.example            # Environment variables example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_APP_NAME=InspectionAgent
   VITE_ENVIRONMENT=development
   ```

3. **Install shadcn/ui components** (after initial npm install):
   ```bash
   npx shadcn-ui@latest init
   ```

   Then add base components:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add textarea
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add toast
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add form
   ```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Code Quality

Run TypeScript type checking:
```bash
npm run type-check
```

Run ESLint:
```bash
npm run lint
```

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Key Features

### Authentication
- JWT-based authentication with refresh tokens
- Google OAuth 2.0 integration
- Role-based access control (RBAC)
- Protected routes

### API Integration
- Axios instance with request/response interceptors
- Automatic token refresh on 401 errors
- Centralized error handling
- React Query for caching and state management

### UI/UX
- Mobile-first responsive design (375px - 768px - 1024px+)
- Tailwind CSS for styling
- shadcn/ui for professional components
- Framer Motion for smooth animations
- Dark mode support

### Type Safety
- TypeScript strict mode enabled
- No `any` types allowed
- Comprehensive type definitions for all API responses
- Zod schemas for form validation

## Development Guidelines

### TypeScript
- Always define proper interfaces/types (NO `any`)
- Use type inference when possible
- Export types from dedicated files in `src/types/`

### Components
- Functional components with hooks
- Props interface required for all components
- Use `FC` type for React components
- Extract reusable logic into custom hooks

### API Calls
- Use React Query hooks for all data fetching
- Define service functions in `src/services/`
- Handle loading and error states
- Use optimistic updates where appropriate

### Styling
- Use Tailwind utility classes
- Follow mobile-first approach
- Use `cn()` utility for conditional classes
- No inline styles

### State Management
- React Context for global state (auth, notifications)
- React Query for server state
- Local component state with useState
- Derived state with useMemo

### Forms
- Use React Hook Form for form management
- Zod for schema validation
- Display validation errors inline
- Show loading state during submission

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `VITE_APP_NAME` | Application name | `InspectionAgent` |
| `VITE_ENVIRONMENT` | Environment (development/production) | `development` |

## Folder Structure Notes

### Component Organization
- **ui/**: shadcn/ui primitives (Button, Card, Input, etc.)
- **layout/**: Layout components (AppLayout, Navbar, Sidebar)
- **common/**: Shared components used across features
- **Feature-specific**: Components grouped by feature (inspections, approvals, etc.)

### Page Organization
Pages are organized by feature/module matching the backend API structure.

### Type Organization
Types mirror the backend models and are organized by domain (auth, asset, inspection, etc.).

## Next Steps (Phase 2)

1. Add shadcn/ui components
2. Create layout components (AppLayout, Navbar, Sidebar)
3. Build authentication pages (Login, Google OAuth)
4. Implement protected routes
5. Create dashboard pages
6. Build inspection execution flow
7. Implement approval workflows
8. Add charts and analytics
9. Create admin pages

## Support

For questions or issues, contact the development team.

## License

Proprietary - ADNOC Internal Use Only
