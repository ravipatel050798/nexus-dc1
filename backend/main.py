from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import random
import json
from datetime import datetime

import models, database, auth
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

background_task_running = True

async def analytics_snapshot_task():
    global background_task_running
    while background_task_running:
        db = SessionLocal()
        try:
            devices = db.query(models.Device).all()
            if devices:
                avg_sig = sum(d.wifi_signal for d in devices) / len(devices) if len(devices) > 0 else 0
                avg_bat = sum(d.battery_health for d in devices) / len(devices) if len(devices) > 0 else 0
                load = (len([d for d in devices if d.status == 'Active']) / len(devices)) * 100 if len(devices) > 0 else 0
                
                new_hist = models.DeviceHistory(
                    avg_signal=avg_sig,
                    avg_battery=avg_bat,
                    total_active_load=load
                )
                db.add(new_hist)
                db.commit()
        finally:
            db.close()
        # Takes snapshots every 5 seconds for rapid UI demonstration
        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global background_task_running
    
    # Initialize mock database data
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            hashed_pw = auth.get_password_hash("nexus123")
            db.add(models.User(username="admin", hashed_password=hashed_pw))
            db.commit()

        count = db.query(models.Device).count()
        if count == 0:
            for i in range(1, 21):
                name = f"RF-SCAN-{i:03}"
                new_device = models.Device(
                    device_id=f"DC1-{i:03}",
                    name=name,
                    status="Active",
                    onboarding_time=round(random.uniform(4.5, 5.8), 1),
                    battery_health=random.randint(60, 100),
                    wifi_signal=random.randint(-85, -40),
                    location=random.choice(["Aisle 4", "Loading Dock", "Aisle 12", "Packing Station"]),
                    ip_address=f"10.0.4.{10+i}"
                )
                db.add(new_device)
            db.commit()
    finally:
        db.close()

    task = asyncio.create_task(analytics_snapshot_task())
    yield
    background_task_running = False
    task.cancel()

app = FastAPI(title="Nexus DC-1 Core API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def library_connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Jira Integration Logic
def create_jira_issue(device_id: str, reason: str):
    ticket_id = f"WMS-{random.randint(1000, 9999)}"
    print(f"[JIRA] Created {ticket_id} for {device_id}: {reason}")
    return ticket_id

@app.post("/api/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me")
def read_users_me(current_user: str = Depends(auth.get_current_user)):
    return {"username": current_user}

@app.get("/api/devices", response_model=List[dict])
def read_devices(current_user: str = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    devices = db.query(models.Device).all()
    return [
        {
            "id": d.id,
            "device_id": d.device_id,
            "name": d.name,
            "status": d.status,
            "battery": d.battery_health,
            "signal": d.wifi_signal,
            "location": d.location,
            "failure_predicted": d.predicted_failure
        } for d in devices
    ]

@app.get("/api/analytics", response_model=List[dict])
def get_analytics(current_user: str = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    history = db.query(models.DeviceHistory).order_by(models.DeviceHistory.timestamp.desc()).limit(48).all()
    history = list(reversed(history))
    return [
        {
            "time": h.timestamp.strftime("%H:%M:%S"),
            "signal": round(abs(h.avg_signal), 1),
            "battery": round(h.avg_battery, 1),
            "load": round(h.total_active_load, 1)
        } for h in history
    ]

@app.post("/api/onboard")
async def onboard_device(current_user: str = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    new_idx = db.query(models.Device).count() + 1
    device_id = f"DC1-{new_idx:03}"
    new_device = models.Device(
        device_id=device_id,
        name=f"RF-SCAN-{new_idx:03}",
        status="Provisioning",
        onboarding_time=random.uniform(4.2, 5.5),
        battery_health=100,
        wifi_signal=-45,
        location="IT Desk"
    )
    db.add(new_device)
    db.commit()
    return {"status": "success", "device_id": device_id}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.library_connect(websocket)
    try:
        while True:
            drift_data = {
                "timestamp": datetime.now().isoformat(),
                "updates": [
                    {"id": random.randint(1, 20), "signal": random.randint(-85, -40), "battery": random.randint(10, 100)}
                ]
            }
            if random.random() < 0.1:
                dev_id = f"DC1-{random.randint(1, 20):03}"
                reason = random.choice(["Critical Signal Drop", "Battery Depletion", "Thermal Warning"])
                jira_id = create_jira_issue(dev_id, reason)
                drift_data["alert"] = {
                    "device_id": dev_id,
                    "type": reason,
                    "jira_ticket": jira_id
                }
            
            await manager.broadcast(json.dumps(drift_data))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
