from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .v1.welcome.route import router as welcome_router
from .v1.auth.route import router as auth_router
from .v1.monitors.route import router as monitors_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(welcome_router)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(monitors_router, prefix="/monitors", tags=["monitors"])

# to run the application, use the command:
# uvicorn api.main:app --port 34001 --reload 
