
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routes.auth_routes import router as auth_router
from routes.ai_routes import router as ai_router
from routes.facility_routes import router as facility_router
from routes.admin_knowledge_routes import router as admin_knowledge_router
from routes.report_routes import router as report_router
from routes.admin_report_routes import router as admin_report_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CareGuide Rural AI",
    description="Rural Healthcare Information and Navigation Assistant",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Application Routers
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(facility_router)
app.include_router(admin_knowledge_router)
app.include_router(report_router)
app.include_router(admin_report_router)


# Root Endpoint
@app.get("/")
def home():
    return {
        "message": "CareGuide Rural AI Backend Running"
    }


# Health Check Endpoint
@app.get("/health")
def health():
    return {
        "status": "OK"
    }
