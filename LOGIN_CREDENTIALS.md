# ADNOC Inspection Agent - Test User Login Credentials

## Quick Access

**Application URL:** http://localhost:5174
**Backend API:** http://localhost:8000

---

## Test User Accounts

### 1. Administrator Account
```
Email:    admin@adnoc.ae
Password: admin123
Name:     Ahmed Al Mansouri
Role:     Admin
```

**Access Level:** Full System Access
- ✅ All features and modules
- ✅ User management
- ✅ System configuration
- ✅ Asset CRUD operations
- ✅ Planning and scheduling
- ✅ Team management
- ✅ Analytics and reports
- ✅ Admin panel

**Tour Highlights:**
- System-wide metrics dashboard
- Complete asset management
- Annual inspection planning
- Team and user management
- Comprehensive analytics
- System administration panel

---

### 2. Team Leader Account
```
Email:    khalid.al.mazrouei@adnoc.ae
Password: demo123
Name:     Khalid Al Mazrouei
Role:     Team Leader
```

**Access Level:** Team Management & Planning
- ✅ Team dashboard
- ✅ View and create assets
- ✅ Create annual plans
- ✅ Schedule inspections
- ✅ Manage team members
- ✅ Monitor inspections
- ✅ Team analytics
- ✅ Handle escalations

**Tour Highlights:**
- Team performance dashboard
- Asset management for planning
- Annual plan creation
- Team member management
- Inspection monitoring
- Performance metrics
- Escalation handling

---

### 3. Inspector Account #1
```
Email:    inspector1@adnoc.ae
Password: demo123
Name:     Mohammad Al Hosani
Role:     Inspector
```

**Access Level:** Field Inspection Operations
- ✅ Personal dashboard
- ✅ View assets
- ✅ Assigned inspections
- ✅ Submit inspection reports
- ✅ Generate reports

**Tour Highlights:**
- Assigned inspections view
- Asset details for inspections
- Inspection report submission
- Report generation

---

### 4. Inspector Account #2
```
Email:    inspector2@adnoc.ae
Password: demo123
Name:     Fatima Al Shamsi
Role:     Inspector
```

**Access Level:** Field Inspection Operations
- ✅ Personal dashboard
- ✅ View assets
- ✅ Assigned inspections
- ✅ Submit inspection reports
- ✅ Generate reports

**Tour Highlights:**
- Assigned inspections view
- Asset details for inspections
- Inspection report submission
- Report generation

---

### 5. Engineer Account
```
Email:    engineer1@adnoc.ae
Password: demo123
Name:     Omar Al Ketbi
Role:     Engineer
```

**Access Level:** Work Request Management
- ✅ Engineering dashboard
- ✅ View asset details
- ✅ Manage work requests
- ✅ Review inspection reports
- ✅ Track maintenance activities

**Tour Highlights:**
- Work requests dashboard
- Asset maintenance history
- Work request management
- Inspection findings review

---

### 6. RBI Auditor Account
```
Email:    rbi.auditor1@adnoc.ae
Password: demo123
Name:     Salem Al Dhaheri
Role:     RBI Auditor
```

**Access Level:** Risk-Based Inspection
- ✅ RBI dashboard
- ✅ View assets with risk data
- ✅ Conduct RBI assessments
- ✅ Manage risk profiles
- ✅ Review inspection reports

**Tour Highlights:**
- RBI assessment dashboard
- Asset risk profiles
- RBI module access
- Risk assessment tools

---

## Feature Access Matrix

| Feature | Admin | Team Leader | Inspector | Engineer | RBI Auditor |
|---------|-------|-------------|-----------|----------|-------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assets (View) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assets (Create/Edit) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Planning | ✅ | ✅ | ❌ | ❌ | ❌ |
| Teams | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inspections | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approvals | ✅ | ✅ | ✅ | ❌ | ❌ |
| Work Requests | ✅ | ✅ | ❌ | ✅ | ❌ |
| RBI | ✅ | ❌ | ❌ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| Escalations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Interactive Tour System

### Auto-Start Tour
- **First-time users:** Tour starts automatically after login
- **Returning users:** Tour is skipped (stored in localStorage)

### Manual Tour Control
- **Start Tour:** Click the help icon (?) in the top-right header
- **Skip Tour:** Click "Skip Tour" button during the tour
- **Reset Tour:** Clear browser localStorage or use profile settings

### Tour Features
- ✅ Role-based guided walkthrough
- ✅ Step-by-step navigation explanation
- ✅ Feature highlights
- ✅ Interactive tooltips
- ✅ Progress indicator
- ✅ Skip/Next/Back navigation

---

## Current Sample Data

### Assets (8 Total)
1. Crude Oil Storage Tank T-101 (Critical)
2. Pressure Vessel PV-202 (High)
3. Heat Exchanger HX-305 (Medium)
4. Centrifugal Pump P-401 (High)
5. Crude Oil Storage Tank T-501 (Critical)
6. Distillation Column DC-601 (Critical)
7. Cooling Tower CT-701 (Medium)
8. Gas Compressor GC-801 (High)

### Facilities
- Abu Dhabi Refinery
- Ruwais Refinery
- Al Dhafra Gas Plant
- Jebel Ali Tank Farm
- Habshan Processing Facility

---

## Getting Started

### For New Users:

1. **Navigate to:** http://localhost:5174
2. **Choose a role** to test from the accounts above
3. **Login** with the email and password
4. **Follow the tour** - it will automatically start
5. **Explore features** available to your role

### For Testing Different Roles:

1. **Logout** from current account (Profile menu → Logout)
2. **Login** with a different role account
3. **Tour will restart** for the new role
4. **Compare features** available to different roles

---

## Troubleshooting

### Tour Not Starting?
- Clear browser localStorage: `localStorage.clear()`
- Refresh the page
- Click the help icon (?) to manually start

### Can't See Certain Menu Items?
- Check your role - some features are role-restricted
- Reference the Feature Access Matrix above

### Need to Reset Everything?
```bash
# Backend: Re-seed database
cd backend
python scripts/quick_seed.py

# Frontend: Clear browser data
# Open DevTools → Application → Clear Storage
```

---

## Security Notes

⚠️ **These are test credentials for development only**
- DO NOT use in production
- Passwords are intentionally simple
- All users have is_active=True, is_verified=True

---

## Support

For issues or questions:
- Check the USER_GUIDE.md for detailed feature documentation
- Review the technical documentation in the codebase
- File an issue in the project repository

---

**Last Updated:** 2026-01-14
**System Version:** 1.0.0
**Environment:** Development
