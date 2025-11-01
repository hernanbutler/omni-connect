from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class ViewState(Base):
    __tablename__ = "view_states"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String) # Storing as string, can be 'true', 'false', or chosen option

class ViewStateSchema(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True
