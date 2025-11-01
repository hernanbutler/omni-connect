from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.company_models import Base, CompanyProfile, CompanyProfileSchema
import os

# Define the absolute database file path
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'company_data.db'))
DATABASE_URL = f"sqlite:///{db_path}"

# Ensure the data directory exists
data_dir = os.path.dirname(db_path)
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

def save_company_profile(profile_data: CompanyProfileSchema):
    db = SessionLocal()
    try:
        db_profile = db.query(CompanyProfile).first()
        if db_profile:
            # Update existing profile
            db_profile.name = profile_data.name
            db_profile.industry = profile_data.industry
            db_profile.company_size = profile_data.company_size
            db_profile.target_audience = profile_data.target_audience
        else:
            # Create new profile
            db_profile = CompanyProfile(
                name=profile_data.name,
                industry=profile_data.industry,
                company_size=profile_data.company_size,
                target_audience=profile_data.target_audience
            )
            db.add(db_profile)
        
        db.commit()
        db.refresh(db_profile)
        return db_profile
    finally:
        db.close()

def get_company_profile():
    db = SessionLocal()
    try:
        profile = db.query(CompanyProfile).first()
        return profile
    finally:
        db.close()
