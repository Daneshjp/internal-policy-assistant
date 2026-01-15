# Installation Guide

Quick start guide to get the InspectionAgent frontend up and running.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see backend README)

## Step-by-Step Installation

### 1. Navigate to Frontend Directory

```bash
cd /Users/manojaidude/AdNoc/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`.

**Expected installation time**: 2-5 minutes

### 3. Install shadcn/ui Components (IMPORTANT)

After the main npm install completes, you need to add shadcn/ui components:

```bash
# Note: shadcn/ui init might already be configured via components.json
# If prompted, accept the defaults

# Install core components
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
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
```

Or install them all at once:
```bash
npx shadcn-ui@latest add button card input label select textarea badge dialog dropdown-menu toast table tabs form avatar checkbox radio-group switch separator skeleton progress
```

### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
nano .env.local  # or use your preferred editor
```

Update these values in `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
VITE_APP_NAME=InspectionAgent
VITE_ENVIRONMENT=development
```

### 5. Verify Installation

Run TypeScript type checking:
```bash
npm run type-check
```

Expected output: No errors

Run ESLint:
```bash
npm run lint
```

Expected output: No errors (or only warnings)

### 6. Start Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### 7. Open in Browser

Visit: http://localhost:5173

You should see the InspectionAgent home page with:
- "InspectionAgent" title
- "ADNOC Inspection Workflow Management System" subtitle
- "Frontend Foundation - Phase 1 Complete" message

## Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution**: Make sure the path aliases are configured in both `tsconfig.json` and `vite.config.ts`. Restart the dev server after making changes.

### Issue: "Module not found: tailwindcss-animate"

**Solution**: Install the missing dependency:
```bash
npm install -D tailwindcss-animate
```

### Issue: Port 5173 already in use

**Solution**: Either stop the process using port 5173, or specify a different port:
```bash
npm run dev -- --port 5174
```

### Issue: ESLint errors about unused variables

**Solution**: This is expected for Phase 1. Many folders are created but empty. These will be populated in Phase 2.

### Issue: "Cannot connect to backend API"

**Solution**: Make sure the backend is running on the URL specified in `VITE_API_URL`. The frontend expects the backend at `http://localhost:8000/api/v1` by default.

## Verify Backend Connection (Optional)

To test the API connection, you can use the browser console:

```javascript
// Open browser console (F12) and run:
fetch('http://localhost:8000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('Backend connected:', d))
  .catch(e => console.error('Backend connection failed:', e))
```

## Build for Production

To create a production build:

```bash
npm run build
```

Output will be in the `dist/` folder.

Preview the production build:
```bash
npm run preview
```

## Running Tests

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Development Workflow

### File Watching
Vite automatically watches for file changes. Just edit and save - the browser will auto-refresh.

### Hot Module Replacement (HMR)
React components support HMR. Changes appear instantly without full page reload.

### TypeScript Checking
Run `npm run type-check` before committing to catch type errors.

### Linting
Run `npm run lint` to check code quality.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |

## Next Steps After Installation

1. Verify the app runs at http://localhost:5173
2. Check browser console for any errors
3. Review the folder structure in `STRUCTURE.md`
4. Read development guidelines in `README.md`
5. Start implementing Phase 2 features

## Getting Help

- Check `README.md` for detailed documentation
- Review `STRUCTURE.md` for folder organization
- See `SETUP_SUMMARY.md` for complete overview
- Consult `/Users/manojaidude/AdNoc/CLAUDE.md` for project rules

## Installation Checklist

- [ ] Node.js 18+ installed
- [ ] Navigated to frontend directory
- [ ] Ran `npm install`
- [ ] Installed shadcn/ui components
- [ ] Configured `.env.local`
- [ ] Ran `npm run type-check` (no errors)
- [ ] Ran `npm run lint` (no errors)
- [ ] Started dev server with `npm run dev`
- [ ] Opened http://localhost:5173 in browser
- [ ] Verified app loads correctly
- [ ] Backend API accessible (optional but recommended)

## Estimated Total Setup Time

- npm install: 2-5 minutes
- shadcn/ui components: 1-2 minutes
- Configuration: 1 minute
- Verification: 1 minute

**Total: 5-10 minutes**

---

**Status**: Installation guide for Phase 1 Foundation
**Last Updated**: 2026-01-13
