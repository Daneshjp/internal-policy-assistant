# Frontend Folder Structure

Complete folder structure for InspectionAgent frontend application.

```
frontend/
├── src/
│   ├── components/               # Reusable React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── form.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── AppLayout.tsx    # Main app layout with sidebar
│   │   │   ├── Navbar.tsx       # Top navigation bar
│   │   │   ├── Sidebar.tsx      # Side navigation menu
│   │   │   └── Footer.tsx       # Footer component
│   │   ├── auth/                # Authentication components
│   │   │   ├── LoginForm.tsx    # Login form
│   │   │   ├── RegisterForm.tsx # Registration form (if needed)
│   │   │   └── GoogleOAuthButton.tsx # Google OAuth button
│   │   ├── inspections/         # Inspection-related components
│   │   │   ├── InspectionCard.tsx      # Inspection card display
│   │   │   ├── InspectionList.tsx      # List of inspections
│   │   │   ├── InspectionForm.tsx      # Create/Edit inspection form
│   │   │   ├── FindingForm.tsx         # Add/Edit finding form
│   │   │   ├── FindingCard.tsx         # Finding display card
│   │   │   ├── PhotoUpload.tsx         # Photo upload component
│   │   │   ├── PhotoGallery.tsx        # Photo gallery viewer
│   │   │   ├── MeasurementInput.tsx    # Measurement input fields
│   │   │   └── InspectionStatusBadge.tsx # Status badge
│   │   ├── approvals/           # Approval workflow components
│   │   │   ├── ApprovalTimeline.tsx    # Approval workflow timeline
│   │   │   ├── ApprovalActions.tsx     # Approve/Reject buttons
│   │   │   ├── ApprovalCard.tsx        # Approval stage card
│   │   │   └── CommentBox.tsx          # Comment input box
│   │   ├── dashboard/           # Dashboard widgets
│   │   │   ├── KPICard.tsx             # KPI metric card
│   │   │   ├── InspectionChart.tsx     # Inspection analytics chart
│   │   │   ├── FindingsChart.tsx       # Findings analytics chart
│   │   │   ├── RecentActivity.tsx      # Recent activity feed
│   │   │   └── UpcomingInspections.tsx # Upcoming inspections widget
│   │   └── common/              # Shared components
│   │       ├── DataTable.tsx           # Reusable data table
│   │       ├── SearchBar.tsx           # Search input
│   │       ├── FilterDropdown.tsx      # Filter dropdown
│   │       ├── Pagination.tsx          # Pagination controls
│   │       ├── FileUpload.tsx          # File upload component
│   │       ├── LoadingSpinner.tsx      # Loading spinner
│   │       ├── EmptyState.tsx          # Empty state display
│   │       └── ErrorBoundary.tsx       # Error boundary wrapper
│   │
│   ├── pages/                   # Page components (route pages)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx           # Login page
│   │   │   └── ProfilePage.tsx         # User profile page
│   │   ├── assets/
│   │   │   ├── AssetListPage.tsx       # List all assets
│   │   │   ├── AssetDetailPage.tsx     # Asset details view
│   │   │   └── AssetFormPage.tsx       # Create/Edit asset
│   │   ├── plans/
│   │   │   ├── AnnualPlanPage.tsx      # Annual plan view
│   │   │   ├── QuarterlyPlanPage.tsx   # Quarterly plan view
│   │   │   └── MonthlyPlanPage.tsx     # Monthly plan view
│   │   ├── inspections/
│   │   │   ├── InspectionListPage.tsx  # List all inspections
│   │   │   ├── InspectionDetailPage.tsx # View inspection details
│   │   │   └── InspectionExecutePage.tsx # Execute inspection (mobile)
│   │   ├── reports/
│   │   │   ├── ReportListPage.tsx      # List all reports
│   │   │   └── ReportViewerPage.tsx    # View/Download report
│   │   ├── approvals/
│   │   │   └── ApprovalDashboardPage.tsx # Approval dashboard
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx       # Main dashboard
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx  # Admin overview
│   │       ├── UserManagementPage.tsx  # User management
│   │       └── SystemHealthPage.tsx    # System health monitoring
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # (Re-export from context or custom hook)
│   │   ├── useInspections.ts   # Inspection-related hooks
│   │   ├── useAssets.ts        # Asset-related hooks
│   │   ├── useApprovals.ts     # Approval-related hooks
│   │   ├── useReports.ts       # Report-related hooks
│   │   ├── useUsers.ts         # User management hooks
│   │   ├── useRealtime.ts      # WebSocket/realtime hooks
│   │   └── useDebounce.ts      # Debounce utility hook
│   │
│   ├── services/                # API client services
│   │   ├── api.ts              # Axios instance with interceptors
│   │   ├── authService.ts      # Authentication API calls
│   │   ├── assetService.ts     # Asset API calls
│   │   ├── inspectionService.ts # Inspection API calls
│   │   ├── reportService.ts    # Report API calls
│   │   ├── approvalService.ts  # Approval API calls
│   │   ├── userService.ts      # User management API calls
│   │   ├── dashboardService.ts # Dashboard data API calls
│   │   └── uploadService.ts    # File upload service
│   │
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx     # Authentication context
│   │   └── NotificationContext.tsx # Toast notifications context
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts            # Base types (BaseEntity, ApiResponse, etc.)
│   │   ├── auth.ts             # Auth-related types (User, LoginRequest, etc.)
│   │   ├── asset.ts            # Asset types
│   │   ├── inspection.ts       # Inspection types
│   │   ├── approval.ts         # Approval workflow types
│   │   ├── report.ts           # Report types
│   │   ├── plan.ts             # Plan types
│   │   ├── team.ts             # Team types
│   │   └── dashboard.ts        # Dashboard types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts       # Date, number, currency formatters
│   │   ├── validators.ts       # Validation schemas (Zod)
│   │   └── constants.ts        # Constants (roles, statuses, etc.)
│   │
│   ├── lib/                     # Library utilities
│   │   └── utils.ts            # cn() function for Tailwind
│   │
│   ├── App.tsx                  # Main app component with router
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite environment types
│
├── public/                      # Static assets
│   ├── vite.svg
│   └── (other static files)
│
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript config for Vite
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── components.json              # shadcn/ui configuration
├── .eslintrc.cjs                # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (gitignored)
├── .gitignore                   # Git ignore rules
├── README.md                    # Project documentation
└── STRUCTURE.md                 # This file
```

## Component Organization Principles

### 1. UI Components (`components/ui/`)
- Base shadcn/ui components
- Pure presentational components
- No business logic
- Highly reusable

### 2. Feature Components
- Organized by feature domain (inspections, approvals, etc.)
- Contain feature-specific logic
- Use UI components for presentation
- Can be composed from multiple UI components

### 3. Layout Components (`components/layout/`)
- App-wide layout components
- Navigation, sidebars, headers, footers
- Used across multiple pages

### 4. Common Components (`components/common/`)
- Shared across multiple features
- Generic but with some business logic
- Examples: DataTable, SearchBar, FileUpload

### 5. Pages (`pages/`)
- One page per route
- Compose feature components
- Handle page-level state
- Connect to API via hooks

## Naming Conventions

- **Components**: PascalCase (e.g., `InspectionCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useInspections.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `inspectionService.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `Inspection`, `User`)
- **Utils**: camelCase for functions (e.g., `formatDate`, `cn`)

## Import Path Aliases

Configure in `tsconfig.json` and `vite.config.ts`:

```typescript
// Use @ alias for src imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { inspectionService } from '@/services/inspectionService'
import type { Inspection } from '@/types/inspection'
```

## File Organization Best Practices

1. **Co-locate related files**: Keep components, hooks, and types together when they're tightly coupled
2. **Single responsibility**: Each file should have one clear purpose
3. **Index files**: Use index.ts to re-export from folders with multiple related exports
4. **Tests**: Place test files alongside the files they test (e.g., `Button.tsx` and `Button.test.tsx`)
5. **Stories**: If using Storybook, place stories alongside components (e.g., `Button.stories.tsx`)

## Current Status

### Phase 1 (Foundation) - COMPLETED
- ✅ Project structure created
- ✅ Dependencies configured (package.json)
- ✅ TypeScript configuration
- ✅ Vite build tool setup
- ✅ Tailwind CSS configured
- ✅ shadcn/ui base components (button, card)
- ✅ API client with interceptors
- ✅ Type definitions (base, auth, inspection, asset, approval)
- ✅ Context providers (Auth, Notification)
- ✅ Utility functions (formatters, validators, constants)
- ✅ Sample service (authService, inspectionService)
- ✅ Sample hook (useInspections)
- ✅ Protected route component
- ✅ Basic App.tsx with routing
- ✅ Environment configuration

### Phase 2 (Components & Pages) - PENDING
- Add remaining shadcn/ui components
- Create layout components (AppLayout, Navbar, Sidebar)
- Build authentication pages
- Implement dashboard
- Create inspection execution flow
- Build approval workflows
- Add charts and analytics
- Implement admin pages

## Notes

- All folders are created but many files are placeholders for Phase 2
- The structure follows the specifications in CLAUDE.md
- Mobile-first responsive design will be implemented in all components
- TypeScript strict mode is enabled - NO `any` types allowed
