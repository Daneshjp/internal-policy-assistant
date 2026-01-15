# Interactive Tour System Documentation

## Overview

The ADNOC Inspection Agent now includes a comprehensive, role-based interactive tour system that automatically guides users through the application based on their role and permissions.

## Features

### 1. Automatic Tour on First Login
- Tour starts automatically when a user logs in for the first time
- Each user's tour completion status is stored in localStorage
- Different tour content for each of the 5 user roles

### 2. Role-Based Tours

Each role receives a customized tour highlighting features relevant to their responsibilities:

#### Admin Tour (10 steps)
- System-wide metrics dashboard
- Complete asset management (CRUD)
- Annual inspection planning
- Team and user management
- Comprehensive analytics
- System administration panel

#### Team Leader Tour (9 steps)
- Team performance dashboard
- Asset management for planning
- Annual plan creation
- Team member management
- Inspection monitoring
- Performance analytics
- Escalation handling

#### Inspector Tour (6 steps)
- Personal task dashboard
- Asset browsing
- Assigned inspections
- Report submission
- Basic navigation

#### Engineer Tour (6 steps)
- Work request dashboard
- Asset maintenance history
- Work request management
- Inspection findings review

#### RBI Auditor Tour (6 steps)
- RBI assessment dashboard
- Asset risk profiles
- RBI module access
- Risk assessment tools

### 3. Manual Tour Control

Users can control the tour at any time:

**Start Tour:**
- Click the help icon (?) in the top-right header
- Available on any page after login

**Skip Tour:**
- Click "Skip Tour" button during the tour
- Marks tour as completed for that user

**Reset Tour:**
- Clear browser localStorage
- Or logout and login again

### 4. Tour Navigation Features

- **Progress Indicator:** Shows current step / total steps
- **Navigation Buttons:**
  - Back: Go to previous step
  - Next: Go to next step
  - Skip: Exit tour entirely
  - Finish: Complete tour (last step)
- **Interactive Tooltips:** Point to specific UI elements
- **Centered Messages:** For general welcome/completion messages

## Technical Implementation

### Components

1. **TourProvider** (`src/context/TourContext.tsx`)
   - Manages tour state globally
   - Handles localStorage persistence
   - Provides tour control functions

2. **Tour Configuration** (`src/config/tourSteps.ts`)
   - Defines all tour steps by role
   - Configures tooltip positioning
   - Welcome messages

3. **MainLayout** (`src/components/Layout/MainLayout.tsx`)
   - Includes help icon (?) button
   - Data-tour attributes on navigation elements
   - Integrates TourProvider

4. **LoginGuide** (`src/components/LoginGuide.tsx`)
   - Shows test credentials on login page
   - Copy-to-clipboard functionality
   - Expandable/collapsible design

### Tour Steps Configuration

Each tour step includes:
```typescript
{
  target: '[data-tour="element-id"]',  // CSS selector
  content: 'Explanation text',         // Tooltip content
  placement: 'right' | 'left' | 'top' | 'bottom' | 'center',
  disableBeacon: true                  // Skip pulsing beacon
}
```

### Data-Tour Attributes

Navigation elements are tagged with `data-tour` attributes:

- `[data-tour="sidebar"]` - Sidebar navigation
- `[data-tour="profile-menu"]` - Profile dropdown
- `[data-tour="notifications"]` - Notification bell
- `[data-tour="nav-dashboard"]` - Dashboard link
- `[data-tour="nav-assets"]` - Assets link
- `[data-tour="nav-planning"]` - Planning link
- `[data-tour="nav-teams"]` - Teams link
- `[data-tour="nav-inspections"]` - Inspections link
- `[data-tour="nav-reports"]` - Reports link
- `[data-tour="nav-approvals"]` - Approvals link
- `[data-tour="nav-work-requests"]` - Work Requests link
- `[data-tour="nav-rbi"]` - RBI link
- `[data-tour="nav-analytics"]` - Analytics link
- `[data-tour="nav-escalations"]` - Escalations link
- `[data-tour="nav-admin"]` - Admin Panel link

## Usage Examples

### For Users

1. **First-time login:**
   - Login with any test account
   - Tour starts automatically after 1 second
   - Follow the guided steps

2. **Restart tour:**
   - Click the help icon (?) in header
   - Tour restarts from step 1

3. **Skip tour:**
   - Click "Skip Tour" during walkthrough
   - Won't show again unless you reset it

### For Developers

**Add a new tour step:**
```typescript
// src/config/tourSteps.ts
export const tourSteps: Record<UserRole, Step[]> = {
  [UserRole.ADMIN]: [
    ...commonSteps,
    {
      target: '[data-tour="new-feature"]',
      content: 'This is a new feature explanation',
      placement: 'right',
    },
  ],
  // ... other roles
};
```

**Add data-tour attribute to new element:**
```tsx
<button data-tour="new-feature">
  New Feature
</button>
```

**Programmatically control tour:**
```typescript
import { useTour } from '@/context/TourContext';

function MyComponent() {
  const { startTour, skipTour, resetTour } = useTour();

  return (
    <button onClick={startTour}>Start Tour</button>
  );
}
```

## Styling

The tour uses a custom color scheme matching ADNOC branding:

- **Primary Color:** `#047857` (Green)
- **Tooltip Border Radius:** `8px`
- **Button Styling:** Green primary buttons
- **Z-Index:** `10000` (ensures visibility above all elements)

## Storage

Tour completion status is stored in localStorage:

**Key Format:** `tour_completed_{user.email}`

**Value:** `"true"` when completed

**Example:**
```javascript
localStorage.getItem('tour_completed_admin@adnoc.ae'); // "true"
```

## Dependencies

- **react-joyride:** `^2.8.2` - Core tour library
- **React:** `^18.x` - Component framework
- **TypeScript:** For type safety

## Browser Compatibility

Tour works in all modern browsers supporting:
- localStorage API
- CSS transforms
- Position: fixed
- z-index stacking

## Performance

- Tour adds minimal overhead (~50KB gzipped)
- Steps are lazy-loaded based on user role
- No impact when tour is not active
- localStorage reduces API calls

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- High contrast tooltips
- Clear button labels

## Future Enhancements

Potential improvements:
- [ ] Multi-language support
- [ ] Video tutorials in tooltips
- [ ] Interactive quiz at end of tour
- [ ] Tour analytics tracking
- [ ] Admin dashboard for tour completion rates
- [ ] Custom tour paths per user preference

## Troubleshooting

### Tour doesn't start automatically
- Check localStorage for `tour_completed_*` key
- Verify user is logged in
- Check console for errors
- Ensure TourProvider wraps the app

### Tour tooltip not positioned correctly
- Verify `data-tour` attribute exists
- Check element is visible when tour starts
- Try different `placement` option
- Ensure element has stable position

### Tour step shows wrong content
- Verify role-based steps configuration
- Check user.role value
- Review tourSteps mapping

## Support

For issues or questions:
- Review this documentation
- Check browser console for errors
- Verify all tour files are properly imported
- Test with different user roles

---

**Created:** 2026-01-14
**Version:** 1.0.0
**Library:** react-joyride v2.8.2
