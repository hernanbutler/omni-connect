from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from pydantic import BaseModel

# Importar los servicios
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.automation_service import AutomationService
from services.automation_ai_service import AutomationAIService

router = APIRouter()

# Instanciar servicios
automation_service = AutomationService()
ai_service = AutomationAIService()

# ========== ENDPOINTS DE FLUJOS ==========

@router.get("/automation/flows")
async def get_all_flows():
    """Obtiene todos los flujos de automatización"""
    try:
        flows = automation_service.get_all_flows()
        return {
            "status": "success",
            "data": flows,
            "count": len(flows)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/automation/flows/{flow_id}")
async def get_flow(flow_id: str):
    """Obtiene un flujo específico por ID"""
    try:
        flow = automation_service.get_flow_by_id(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        return {
            "status": "success",
            "data": flow
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/flows")
async def create_flow(flow_data: dict = Body(...)):
    """Crea un nuevo flujo de automatización"""
    try:
        result = automation_service.create_flow(flow_data)
        return {
            "status": "success",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/automation/flows/{flow_id}")
async def update_flow(flow_id: str, update_data: dict = Body(...)):
    """Actualiza un flujo existente"""
    try:
        result = automation_service.update_flow(flow_id, update_data)
        if result['status'] == 'error':
            raise HTTPException(status_code=404, detail=result['message'])
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/automation/flows/{flow_id}")
async def delete_flow(flow_id: str):
    """Elimina un flujo"""
    try:
        result = automation_service.delete_flow(flow_id)
        if result['status'] == 'error':
            raise HTTPException(status_code=404, detail=result['message'])
        return {
            "status": "success",
            "message": result['message']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/flows/{flow_id}/toggle")
async def toggle_flow_status(flow_id: str):
    """Activa o pausa un flujo"""
    try:
        result = automation_service.toggle_flow_status(flow_id)
        if result.get('status') == 'error':
            raise HTTPException(status_code=404, detail=result['message'])
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== ENDPOINTS DE PLANTILLAS ==========

@router.get("/automation/templates")
async def get_templates():
    """Obtiene todas las plantillas disponibles"""
    try:
        templates = automation_service.get_templates()
        return {
            "status": "success",
            "data": templates,
            "count": len(templates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/templates/{template_id}/use")
async def create_from_template(template_id: str, custom_name: Optional[str] = Body(None, embed=True)):
    """Crea un flujo a partir de una plantilla"""
    try:
        result = automation_service.create_flow_from_template(template_id, custom_name)
        if result.get('status') == 'error':
            raise HTTPException(status_code=404, detail=result['message'])
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== ENDPOINTS DE ESTADÍSTICAS ==========

@router.get("/automation/stats")
async def get_dashboard_stats():
    """Obtiene estadísticas generales del dashboard"""
    try:
        stats = automation_service.get_dashboard_stats()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== ENDPOINTS DE IA ==========

@router.post("/automation/ai/optimize-subjects")
async def optimize_subject_lines(flow_id: str = Body(..., embed=True)):
    """Optimiza los subject lines de un flujo usando IA"""
    try:
        # Obtener el flujo
        flow = automation_service.get_flow_by_id(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        # Optimizar con IA
        result = ai_service.optimize_subject_lines(flow)
        
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/ai/predict-timing")
async def predict_best_timing(
    flow_id: str = Body(...),
    user_id: str = Body(...)
):
    """Predice el mejor timing para un usuario específico"""
    try:
        flow = automation_service.get_flow_by_id(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        # Datos simulados del usuario (en producción vendrían de la BD)
        user_data = {
            'user_id': user_id,
            'timezone': 'America/Lima',
            'avg_engagement': 'Alto',
            'customer_type': 'Premium',
            'open_history': 'Mayormente entre 9-11am y 6-8pm'
        }
        
        result = ai_service.predict_best_timing(user_data, flow)
        
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/ai/analyze-performance")
async def analyze_flow_performance(flow_id: str = Body(..., embed=True)):
    """Analiza el rendimiento de un flujo y genera insights"""
    try:
        flow = automation_service.get_flow_by_id(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        metrics = flow.get('metrics', {})
        result = ai_service.analyze_flow_performance(flow, metrics)
        
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/ai/generate-variants")
async def generate_content_variants(
    email_content: str = Body(...),
    segment_type: str = Body("general"),
    engagement_level: str = Body("medium")
):
    """Genera variaciones de contenido adaptadas"""
    try:
        segment_info = {
            'type': segment_type,
            'engagement_level': engagement_level,
            'characteristics': f'Segmento {segment_type} con engagement {engagement_level}'
        }
        
        result = ai_service.generate_content_variants(email_content, segment_info)
        
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automation/ai/suggest-improvements")
async def suggest_flow_improvements(
    flow_id: str = Body(...),
    industry: str = Body("general")
):
    """Sugiere mejoras para un flujo específico"""
    try:
        flow = automation_service.get_flow_by_id(flow_id)
        if not flow:
            raise HTTPException(status_code=404, detail="Flujo no encontrado")
        
        result = ai_service.suggest_flow_improvements(flow, industry)
        
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/automation/ai/status")
async def get_ai_status():
    """Verifica el estado de la configuración de IA"""
    try:
        is_configured = ai_service.is_configured()
        return {
            "status": "success",
            "data": {
                "ai_configured": is_configured,
                "message": "IA configurada y lista" if is_configured else "Configure OPENAI_API_KEY para habilitar IA",
                "features_available": [
                    "optimize_subject_lines",
                    "predict_timing",
                    "analyze_performance",
                    "generate_variants",
                    "suggest_improvements"
                ] if is_configured else []
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))