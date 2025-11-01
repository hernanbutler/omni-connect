from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()
from .routers import ai_content, analytics, automation, campaigns, dashboard, segmentation, social, company, view_states

app = FastAPI()

# Configuración de CORS
# Esto permite que tu frontend (que se ejecuta en un origen diferente) 
# pueda hacer solicitudes a este backend.
origins = [
    "http://127.0.0.1:5500",  # Your frontend development server
    "http://localhost:5500",   # Alternative frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "Backend de Omni-Connect funcionando"}

# Include all the new routers
app.include_router(ai_content.router, prefix="/api/v1", tags=["AI Content"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(automation.router, prefix="/api/v1", tags=["Automation"])
app.include_router(campaigns.router, prefix="/api/v1", tags=["Campaigns"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(segmentation.router, prefix="/api/v1", tags=["Segmentation"])
app.include_router(social.router, prefix="/api/v1", tags=["Social"])
app.include_router(company.router, prefix="/api", tags=["Company"])
app.include_router(view_states.router, prefix="/api/v1", tags=["View States"])
