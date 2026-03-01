import re

# 1. Patch main.py to seed DB on startup
with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/backend/main.py', 'r') as f:
    main_content = f.read()

old_lifespan = """@asynccontextmanager
async def lifespan(app: FastAPI):
    global background_task_running
    task = asyncio.create_task(analytics_snapshot_task())
    yield
    background_task_running = False
    task.cancel()"""

new_lifespan = """@asynccontextmanager
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
    task.cancel()"""

main_content = main_content.replace(old_lifespan, new_lifespan)
with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/backend/main.py', 'w') as f:
    f.write(main_content)


# 2. Patch Login.tsx
with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/frontend/src/components/Login.tsx', 'r') as f:
    login_content = f.read()

# Update placeholders and labels
login_content = login_content.replace('placeholder="NXS-8842"', 'placeholder="admin"')
login_content = login_content.replace('placeholder="••••••••••••"', 'placeholder="nexus123"')
login_content = login_content.replace('Operator ID</label>', 'Operator ID (admin)</label>')
login_content = login_content.replace('Access Code</label>', 'Access Code (nexus123)</label>')
login_content = login_content.replace('<span>Default Local Access: admin / nexus123</span>', '<span>Default Local Access: admin / nexus123</span>\n                        <span className="block mt-2 text-well-green">Built by Ravi Patel</span>')

with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/frontend/src/components/Login.tsx', 'w') as f:
    f.write(login_content)


# 3. Patch App.tsx to add "Built by Ravi Patel"
with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/frontend/src/App.tsx', 'r') as f:
    app_content = f.read()

# Add to the top right header area (where 'Sync Ref', 'Filter Log' are)
header_buttons = """<div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/2 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
                <RefreshCw className="w-3 h-3" /> Sync Ref
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-well-green/5 rounded-lg border border-well-green/20 text-[9px] font-black uppercase tracking-widest text-well-green hover:shadow-well-neon transition-all">
                <Filter className="w-3 h-3" /> Filter Log
            </button>
        </div>"""

new_header_buttons = """<div className="flex gap-4 items-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-well-green mr-4 border-r border-white/10 pr-4">
                Built by Ravi Patel
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/2 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
                <RefreshCw className="w-3 h-3" /> Sync Ref
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-well-green/5 rounded-lg border border-well-green/20 text-[9px] font-black uppercase tracking-widest text-well-green hover:shadow-well-neon transition-all">
                <Filter className="w-3 h-3" /> Filter Log
            </button>
        </div>"""

app_content = app_content.replace(header_buttons, new_header_buttons)

with open('/Users/ravipatel/.gemini/antigravity/playground/nexus-dc1/frontend/src/App.tsx', 'w') as f:
    f.write(app_content)

