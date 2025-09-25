from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import Routers
import routers.auth as auth
import routers.cuti as cuti
import routers.approve as approve
import routers.profile as profile

# Inisialisasi App
app = FastAPI(
    title="API Cuti",
    description="Backend untuk cuti karyawan",
    version="1.0.0"
)

# Middleware CORS supaya bisa diakses dari frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount folder uploads setelah app dibuat
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register Router
app.include_router(auth.router)
app.include_router(cuti.router)
app.include_router(approve.router)
app.include_router(profile.router)

# Root Endpoint
@app.get("/")
def root():
    return {"message": "✅ API cuti berjalan"}