"""
Verify Demo Data Setup Script.

Checks that all dependencies and imports are working correctly.
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

def check_imports():
    """Check all required imports."""
    print("Checking imports...")

    try:
        import faker
        print("  ✓ faker imported successfully")
    except ImportError as e:
        print(f"  ✗ faker import failed: {e}")
        return False

    try:
        from passlib.context import CryptContext
        print("  ✓ passlib imported successfully")
    except ImportError as e:
        print(f"  ✗ passlib import failed: {e}")
        return False

    try:
        from sqlalchemy.orm import Session
        print("  ✓ sqlalchemy imported successfully")
    except ImportError as e:
        print(f"  ✗ sqlalchemy import failed: {e}")
        return False

    try:
        from app.database import SessionLocal, engine, Base
        print("  ✓ app.database imported successfully")
    except ImportError as e:
        print(f"  ✗ app.database import failed: {e}")
        return False

    try:
        from app.models import User, Asset, Inspection
        print("  ✓ app.models imported successfully")
    except ImportError as e:
        print(f"  ✗ app.models import failed: {e}")
        return False

    return True


def check_database_connection():
    """Check database connection."""
    print("\nChecking database connection...")

    try:
        from app.database import SessionLocal, engine
        from sqlalchemy import text

        db = SessionLocal()
        try:
            # Test connection
            db.execute(text("SELECT 1"))
            print("  ✓ Database connection successful")
            return True
        except Exception as e:
            print(f"  ✗ Database connection failed: {e}")
            return False
        finally:
            db.close()
    except Exception as e:
        print(f"  ✗ Database connection test failed: {e}")
        return False


def check_config():
    """Check configuration."""
    print("\nChecking configuration...")

    try:
        from app.config import settings
        print(f"  ✓ Configuration loaded")
        print(f"    - App Name: {settings.APP_NAME}")
        print(f"    - Environment: {settings.ENVIRONMENT}")
        print(f"    - Debug: {settings.DEBUG}")
        return True
    except Exception as e:
        print(f"  ✗ Configuration check failed: {e}")
        return False


def main():
    """Main verification function."""
    print("=" * 80)
    print("InspectionAgent Demo Data Setup Verification")
    print("=" * 80)

    all_ok = True

    # Check imports
    if not check_imports():
        all_ok = False

    # Check config
    if not check_config():
        all_ok = False

    # Check database
    if not check_database_connection():
        all_ok = False

    print("\n" + "=" * 80)
    if all_ok:
        print("✓ All checks passed! Ready to seed demo data.")
        print("\nNext steps:")
        print("  1. Run migrations: alembic upgrade head")
        print("  2. Seed data: make seed-demo")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("  - Install dependencies: pip install -r requirements.txt")
        print("  - Check .env file exists and has DATABASE_URL")
        print("  - Ensure PostgreSQL is running: pg_isready")
        print("  - Create database: createdb inspection_agent")
    print("=" * 80)


if __name__ == "__main__":
    main()
