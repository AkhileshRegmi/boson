from sqlalchemy import Column, String
from app.core.database import BaseModelDB

class User(BaseModelDB):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="VIEWER")
