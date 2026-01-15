import { Step } from 'react-joyride';
import { UserRole } from '@/types/auth';

// Common steps for all users
const commonSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to the ADNOC Inspection Management System! Let me show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar"]',
    content: 'This is your navigation sidebar. Click on any menu item to navigate through the application.',
    placement: 'right',
  },
  {
    target: '[data-tour="profile-menu"]',
    content: 'Access your profile settings and logout from here.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    content: 'Check your notifications and alerts here.',
    placement: 'bottom',
  },
];

// Role-specific tour configurations
export const tourSteps: Record<UserRole, Step[]> = {
  admin: [
    ...commonSteps,
    {
      target: '[data-tour="nav-dashboard"]',
      content: 'As an Admin, your dashboard shows system-wide metrics and overview.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-assets"]',
      content: 'Manage all assets across ADNOC facilities. You have full CRUD access.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-planning"]',
      content: 'Create and manage annual inspection plans for all teams.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-teams"]',
      content: 'Manage teams, assign inspectors, and track availability.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-analytics"]',
      content: 'View comprehensive analytics and performance metrics.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-admin"]',
      content: 'Access system administration, user management, and configuration.',
      placement: 'right',
    },
  ],

  team_leader: [
    ...commonSteps,
    {
      target: '[data-tour="nav-dashboard"]',
      content: 'Your dashboard shows your team\'s performance and pending tasks.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-assets"]',
      content: 'View and create assets for your inspection planning.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-planning"]',
      content: 'Create annual plans and schedule inspections for your team.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-teams"]',
      content: 'Manage your team members and their assignments.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-inspections"]',
      content: 'Monitor ongoing inspections and review submissions.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-analytics"]',
      content: 'Track team performance and inspection metrics.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-escalations"]',
      content: 'Handle overdue inspections and critical findings.',
      placement: 'right',
    },
  ],

  inspector: [
    ...commonSteps,
    {
      target: '[data-tour="nav-dashboard"]',
      content: 'Your dashboard shows your assigned inspections and tasks.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-assets"]',
      content: 'Browse assets and view detailed information for inspections.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-inspections"]',
      content: 'View your assigned inspections and submit inspection reports.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-reports"]',
      content: 'Generate and view inspection reports.',
      placement: 'right',
    },
    {
      target: 'body',
      content: 'Start by checking your dashboard for assigned inspections. Good luck!',
      placement: 'center',
    },
  ],

  engineer: [
    ...commonSteps,
    {
      target: '[data-tour="nav-dashboard"]',
      content: 'Your dashboard shows work requests and findings requiring action.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-assets"]',
      content: 'View asset details and maintenance history.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-work-requests"]',
      content: 'Manage work requests created from inspection findings.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-reports"]',
      content: 'Review inspection reports and findings.',
      placement: 'right',
    },
    {
      target: 'body',
      content: 'Check your work requests to see what needs attention. Let\'s get started!',
      placement: 'center',
    },
  ],

  rbi_auditor: [
    ...commonSteps,
    {
      target: '[data-tour="nav-dashboard"]',
      content: 'Your dashboard shows RBI assessments and risk profiles.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-assets"]',
      content: 'View assets and their risk-based inspection data.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-rbi"]',
      content: 'Conduct RBI assessments and manage risk profiles.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-reports"]',
      content: 'Review inspection reports for risk assessment.',
      placement: 'right',
    },
    {
      target: 'body',
      content: 'Access the RBI module to start your risk assessments.',
      placement: 'center',
    },
  ],
};

// Welcome messages by role
export const welcomeMessages: Record<UserRole, string> = {
  admin: 'Welcome, Administrator! You have full access to all system features.',
  team_leader: 'Welcome, Team Leader! Manage your team and plan inspections efficiently.',
  inspector: 'Welcome, Inspector! Check your assigned inspections and submit reports.',
  engineer: 'Welcome, Engineer! Review work requests and manage maintenance activities.',
  rbi_auditor: 'Welcome, RBI Auditor! Conduct risk assessments and manage RBI profiles.',
};
