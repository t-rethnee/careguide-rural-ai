from fastapi import FastAPI
from database import Base, engine
import models
from routes.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareGuide Rural AI",
    description="Rural Healthcare Information and Navigation Assistant",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication routes
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "CareGuide Rural AI Backend Running"}


@app.get("/health")
def health():
    return {"status": "OK"}