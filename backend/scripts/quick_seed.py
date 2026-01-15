"""Quick seed script to create test users."""
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models import User, UserRole
from app.auth.password import hash_password

def create_users():
    db = SessionLocal()
    try:
        # Check if users already exist
        existing = db.query(User).first()
        if existing:
            print("Users already exist!")
            return

        users_data = [
            {"email": "admin@adnoc.ae", "password": "admin123", "full_name": "Ahmed Al Mansouri", "role": UserRole.admin},
            {"email": "khalid.al.mazrouei@adnoc.ae", "password": "demo123", "full_name": "Khalid Al Mazrouei", "role": UserRole.team_leader},
            {"email": "inspector1@adnoc.ae", "password": "demo123", "full_name": "Mohammad Al Hosani", "role": UserRole.inspector},
            {"email": "inspector2@adnoc.ae", "password": "demo123", "full_name": "Fatima Al Shamsi", "role": UserRole.inspector},
            {"email": "engineer1@adnoc.ae", "password": "demo123", "full_name": "Omar Al Ketbi", "role": UserRole.engineer},
            {"email": "rbi.auditor1@adnoc.ae", "password": "demo123", "full_name": "Salem Al Dhaheri", "role": UserRole.rbi_auditor},
        ]

        print("Creating users...")
        for user_data in users_data:
            user = User(
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=True,
                is_verified=True
            )
            db.add(user)
            print(f"  ✅ Created: {user_data['email']} ({user_data['role'].value})")
        
        db.commit()
        print("\n✅ Success! Users created.")
        print("\nLogin Credentials:")
        print("=" * 60)
        for user_data in users_data:
            print(f"  {user_data['role'].value:15} | {user_data['email']:35} | {user_data['password']}")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
