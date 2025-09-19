from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routers
import routers.auth as auth


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

# Register Router
app.include_router(auth.router)


# Root Endpoint
@app.get("/")
def root():
    return {"message": "✅ API Lembur is running"}