from sqlalchemy import create_engine, Column, String, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    pool_pre_ping=True
).execution_options(isolation_level="AUTOCOMMIT")

SessionLocal = sessionmaker(autoflush=True, bind=engine)

Base = declarative_base()

class BaseModelDB(Base):
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=func.gen_random_uuid)
    created_on = Column(DateTime, default=datetime.now)
    updated_on = Column(DateTime, default=datetime.now, onupdate=datetime.now)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
