"""
Reset Demo Database Script.

WARNING: This script will DROP ALL TABLES and recreate them with fresh demo data.
Use with caution - all existing data will be lost!
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from sqlalchemy import text

from app.database import SessionLocal, engine, Base

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def confirm_reset() -> bool:
    """Ask user for confirmation before resetting database."""
    print("\n" + "=" * 80)
    print("WARNING: DATABASE RESET")
    print("=" * 80)
    print("This will:")
    print("  1. DROP ALL TABLES in the database")
    print("  2. DELETE ALL EXISTING DATA")
    print("  3. Recreate database schema")
    print("  4. Populate with fresh demo data")
    print("")
    response = input("Are you sure you want to continue? (yes/no): ").strip().lower()
    return response in ['yes', 'y']


def drop_all_tables():
    """Drop all tables from the database."""
    logger.info("Dropping all tables...")

    db = SessionLocal()
    try:
        # Drop all tables using SQLAlchemy
        Base.metadata.drop_all(bind=engine)
        logger.info("All tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping tables: {str(e)}")
        raise
    finally:
        db.close()


def recreate_schema():
    """Recreate database schema."""
    logger.info("Recreating database schema...")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema created successfully")
    except Exception as e:
        logger.error(f"Error creating schema: {str(e)}")
        raise


def seed_demo_data():
    """Run the demo data seeder."""
    logger.info("Seeding demo data...")

    try:
        # Import and run the seed script
        from seed_demo_data import main as seed_main
        seed_main()
    except Exception as e:
        logger.error(f"Error seeding data: {str(e)}")
        raise


def main():
    """Main reset function."""
    logger.info("=" * 80)
    logger.info("ADNOC InspectionAgent - Database Reset Tool")
    logger.info("=" * 80)

    # Confirm before proceeding
    if not confirm_reset():
        logger.info("Reset cancelled by user")
        return

    try:
        # Step 1: Drop all tables
        drop_all_tables()

        # Step 2: Recreate schema
        recreate_schema()

        # Step 3: Seed demo data
        seed_demo_data()

        logger.info("=" * 80)
        logger.info("Database reset completed successfully!")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"Reset failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
