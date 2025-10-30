from pydantic import BaseModel
from typing import Optional

# Pydantic model for request validation
class CompanyProfileSchema(BaseModel):
    name: str
    industry: str
    company_size: Optional[str] = None
    target_audience: Optional[str] = None

# SQLAlchemy model for database table
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CompanyProfile(Base):
    __tablename__ = 'company_profile'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    industry = Column(String)
    company_size = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
