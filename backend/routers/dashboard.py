from fastapi import APIRouter
from ..services import dashboard_service

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data():
    """Endpoint para obtener todos los datos del dashboard."""
    return dashboard_service.get_dashboard_kpis()
