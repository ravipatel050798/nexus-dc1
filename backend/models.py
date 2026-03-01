from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Admin")

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    name = Column(String)
    status = Column(String, default="Active")
    onboarding_time = Column(Float)
    battery_health = Column(Integer)
    wifi_signal = Column(Integer)
    last_sync = Column(DateTime, default=datetime.utcnow)
    predicted_failure = Column(Boolean, default=False)
    location = Column(String, default="Main Aisle")
    ip_address = Column(String, default="10.0.4.1")

class DeviceHistory(Base):
    __tablename__ = "device_history"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    avg_signal = Column(Float)
    avg_battery = Column(Float)
    total_active_load = Column(Float)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String)
    alert_type = Column(String) # 'Signal Drop', 'Battery Low', etc.
    severity = Column(String) # 'Warning', 'Critical'
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_resolved = Column(Boolean, default=False)
