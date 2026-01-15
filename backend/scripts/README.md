# InspectionAgent Demo Data Scripts

This directory contains scripts for seeding the database with comprehensive demo data for ADNOC presentation.

## Scripts

### `seed_demo_data.py`

Seeds the database with realistic demo data without dropping existing data.

**Creates:**
- 30 users (1 admin, 5 team leaders, 12 inspectors, 6 engineers, 4 RBI auditors)
- 50 assets across ADNOC locations
- 1 annual plan for 2025 with quarterly breakdown
- 200 inspections (various statuses)
- 150 inspection reports
- 100 approval workflows
- 50 work requests

**Usage:**
```bash
# From backend directory
python scripts/seed_demo_data.py

# OR using make
make seed-demo
```

### `reset_demo.py`

Completely resets the database by dropping all tables and reseeding with fresh demo data.

**WARNING:** This is a destructive operation that will delete all existing data!

**Usage:**
```bash
# From backend directory
python scripts/reset_demo.py

# OR using make
make reset-demo
```

The script will ask for confirmation before proceeding.

## Demo Data Characteristics

### Users

All users have the password: `demo123` (except admin: `admin123`)

| Role | Email Pattern | Count |
|------|---------------|-------|
| Admin | admin@adnoc.ae | 1 |
| Team Leader | khalid.almazrouei@adnoc.ae, etc. | 5 |
| Inspector | inspector1@adnoc.ae, inspector2@adnoc.ae, etc. | 12 |
| Engineer | engineer1@adnoc.ae, engineer2@adnoc.ae, etc. | 6 |
| RBI Auditor | rbi.auditor1@adnoc.ae, etc. | 4 |

### Assets

**Locations:**
- Abu Dhabi Refinery
- Ruwais Refinery Complex
- Habshan Gas Processing Plant
- Jebel Dhanna Terminal
- Das Island Facilities
- Fujairah Refinery
- Al Yasat Offshore Platform
- ADNOC Offshore Operations
- Takreer Main Terminal
- Ghasha Sour Gas Development

**Asset Types Distribution:**
- Pressure Vessels: 30%
- Pipelines: 25%
- Tanks: 20%
- Heat Exchangers: 15%
- Pumps: 7%
- Valves: 3%

**Criticality Distribution:**
- Critical: 10%
- High: 30%
- Medium: 40%
- Low: 20%

### Inspections

**Status Distribution:**
- Completed: 70%
- In Progress: 10%
- Not Started: 5%
- On Hold: 10%
- Cancelled: 5%

**Findings:**
- 70% of completed inspections have findings
- Findings include defects, observations, and recommendations
- Severity levels: Low, Medium, High, Critical

### Reports

**Status Distribution:**
- Draft: 20%
- Submitted: 30%
- Approved: 50%

All reports include:
- Executive summary
- Detailed findings
- Recommendations
- Conclusions

### Approval Workflows

**4-Stage Workflow:**
1. Inspector Review
2. Engineering Review
3. RBI Audit
4. Team Leader Approval

Each workflow tracks:
- Current stage
- Status of each stage (pending, in_review, approved)
- Reviewer assignments
- Approval history

### Work Requests

**Status Distribution:**
- Draft: 10%
- Submitted: 20%
- Approved: 30%
- In Progress: 25%
- Completed: 15%

**SAP Sync Status:**
- Pending (for drafts)
- Synced (for submitted and approved)

## Login Credentials

### Admin
- **Email:** admin@adnoc.ae
- **Password:** admin123
- **Role:** Admin
- **Access:** Full system access

### Team Leader
- **Email:** khalid.almazrouei@adnoc.ae
- **Password:** demo123
- **Role:** Team Leader
- **Access:** Oversight, approval, resource management

### Inspector
- **Email:** inspector1@adnoc.ae
- **Password:** demo123
- **Role:** Inspector
- **Access:** Execute inspections, submit reports

### Engineer
- **Email:** engineer1@adnoc.ae
- **Password:** demo123
- **Role:** Engineer
- **Access:** Technical review, create work requests

### RBI Auditor
- **Email:** rbi.auditor1@adnoc.ae
- **Password:** demo123
- **Role:** RBI Auditor
- **Access:** RBI compliance audit, report locking

## Requirements

Ensure the following are installed:
```bash
pip install faker
pip install passlib[bcrypt]
pip install sqlalchemy
pip install psycopg2-binary
```

Or simply:
```bash
pip install -r requirements.txt
```

## Database Configuration

Ensure your `.env` file has the correct database connection string:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/inspection_agent
```

## Running Migrations

Before seeding, ensure database migrations are up to date:

```bash
alembic upgrade head
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'app'"

Make sure you're running the script from the backend directory:
```bash
cd backend
python scripts/seed_demo_data.py
```

### "sqlalchemy.exc.IntegrityError"

This means some data already exists. Use `reset_demo.py` to start fresh:
```bash
make reset-demo
```

### Database connection errors

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure database exists:
   ```bash
   createdb inspection_agent
   ```

## Demo Flow

For ADNOC presentation, follow this sequence:

1. **Reset Database:**
   ```bash
   make reset-demo
   ```

2. **Verify Data:**
   ```bash
   # Check user count
   psql inspection_agent -c "SELECT role, COUNT(*) FROM users GROUP BY role;"

   # Check inspection count
   psql inspection_agent -c "SELECT status, COUNT(*) FROM inspections GROUP BY status;"
   ```

3. **Login and Demo:**
   - Start with admin@adnoc.ae to show dashboard
   - Switch to inspector1@adnoc.ae for field inspection demo
   - Show engineer1@adnoc.ae for work request creation
   - Demo approval flow with team leader account

## Statistics Output

After seeding, the script outputs comprehensive statistics:

```
==================================================================================
Demo Data Seeding Complete!
==================================================================================
Users created: 30
  - Admins: 1
  - Team Leaders: 5
  - Inspectors: 12
  - Engineers: 6
  - RBI Auditors: 4
Assets created: 50
Inspections created: 200
  - Completed: 140
  - In Progress: 20
Reports created: 150
Approval workflows: 100
Work requests: 50
==================================================================================
```

## Customization

To modify the demo data:

1. Edit constants in `seed_demo_data.py`:
   - `ADNOC_LOCATIONS` - Add/remove locations
   - `ASSET_TYPES_DISTRIBUTION` - Adjust asset type percentages
   - `INSPECTION_FINDINGS_DATA` - Customize findings

2. Adjust counts:
   ```python
   create_users(db)  # Modify user counts
   create_assets(db, admin_user)  # Change asset count
   create_inspections(db, assets, users, 200)  # Adjust inspection count
   ```

3. Re-run:
   ```bash
   make reset-demo
   ```

## Support

For issues or questions:
1. Check error logs in console output
2. Verify database connection
3. Ensure all migrations are applied
4. Review INITIAL.md for data requirements
