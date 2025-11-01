from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import campaigns_service, campaigns_ai_service

router = APIRouter()


# Modelos Pydantic para validación
class CampaignAnalysisRequest(BaseModel):
    campaign_id: str


class SubjectLineRequest(BaseModel):
    campaign_type: str
    target_audience: Optional[str] = "general"


class EmailCopyRequest(BaseModel):
    campaign_type: str
    product_info: str
    tone: Optional[str] = "professional"


@router.get("/campaigns/overview")
async def get_campaigns_overview():
    """
    Obtiene las métricas principales (KPIs) de campañas.
    
    Returns:
        - emails_sent: Total de emails enviados
        - open_rate: Tasa de apertura promedio
        - ctr: CTR promedio
        - bounce_rate: Tasa de rebote
        - Tendencias vs mes anterior
    """
    try:
        data = campaigns_service.get_campaigns_overview()
        
        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener overview: {str(e)}")


@router.get("/campaigns/ai-insights")
async def get_ai_insights():
    """
    Obtiene insights generales de todas las campañas usando IA.
    
    Returns:
        Lista de insights estratégicos
    """
    try:
        # Obtener overview para datos agregados
        overview = campaigns_service.get_campaigns_overview()
        campaigns = campaigns_service.get_active_campaigns()
        
        if "error" in overview or "error" in campaigns:
            raise HTTPException(status_code=500, detail="No se pudieron cargar datos")
        
        # Preparar datos agregados
        all_campaigns_data = {
            "total_campaigns": len(campaigns['campaigns']),
            "avg_open_rate": overview['open_rate'],
            "avg_ctr": overview['ctr'],
            "total_revenue": sum([c['revenue'] for c in campaigns['campaigns']])
        }
        
        result = campaigns_ai_service.get_campaign_insights_summary(all_campaigns_data)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener insights: {str(e)}")


@router.get("/campaigns/active")
async def get_active_campaigns():
    """
    Obtiene la lista de campañas activas, programadas y recientes.
    
    Returns:
        Lista de campañas con sus métricas y estado
    """
    try:
        data = campaigns_service.get_active_campaigns()
        
        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener campañas activas: {str(e)}")


@router.get("/campaigns/templates")
async def get_campaign_templates():
    """
    Obtiene las plantillas de campaña disponibles basadas en campañas exitosas.
    
    Returns:
        Lista de plantillas con métricas promedio
    """
    try:
        data = campaigns_service.get_campaign_templates()
        
        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener plantillas: {str(e)}")


@router.get("/campaigns/{campaign_id}")
async def get_campaign_detail(campaign_id: str):
    """
    Obtiene los detalles de una campaña específica.
    
    Args:
        campaign_id: ID de la campaña
    
    Returns:
        Detalles completos de la campaña
    """
    try:
        data = campaigns_service.get_campaign_detail(campaign_id)
        
        if "error" in data:
            raise HTTPException(status_code=404, detail=data["error"])
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener detalle de campaña: {str(e)}")


@router.post("/campaigns/ai-analyze")
async def analyze_campaign_with_ai(request: CampaignAnalysisRequest):
    """
    Analiza una campaña usando IA y proporciona insights y recomendaciones.
    
    Args:
        request: Objeto con campaign_id
    
    Returns:
        Análisis con insights y recomendaciones
    """
    try:
        # Obtener datos de la campaña
        campaign_data = campaigns_service.get_campaign_detail(request.campaign_id)
        
        if "error" in campaign_data:
            raise HTTPException(status_code=404, detail="Campaña no encontrada")
        
        # Calcular tasa de conversión
        campaign_data['conversion_rate'] = round(
            (campaign_data.get('conversions', 0) / campaign_data.get('recipients', 1) * 100), 2
        )
        
        # Analizar con IA
        analysis = campaigns_ai_service.analyze_campaign_performance(campaign_data)
        
        return {
            "success": True,
            "data": {
                "campaign": campaign_data,
                "analysis": analysis
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al analizar campaña: {str(e)}")


@router.post("/campaigns/ai-generate-subjects")
async def generate_subject_lines(request: SubjectLineRequest):
    """
    Genera variantes de líneas de asunto optimizadas usando IA.
    
    Args:
        request: Objeto con campaign_type y target_audience
    
    Returns:
        Lista de 5 variantes de líneas de asunto
    """
    try:
        result = campaigns_ai_service.generate_subject_line_variants(
            campaign_type=request.campaign_type,
            target_audience=request.target_audience
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar asuntos: {str(e)}")


@router.post("/campaigns/ai-predict-time")
async def predict_best_send_time():
    """
    Predice el mejor momento para enviar una campaña basado en datos históricos.
    
    Returns:
        Recomendación de mejor día y hora
    """
    try:
        # Obtener campañas activas para el análisis
        campaigns_data = campaigns_service.get_active_campaigns()
        
        if "error" in campaigns_data:
            raise HTTPException(status_code=500, detail="No se pudieron cargar datos históricos")
        
        result = campaigns_ai_service.predict_best_send_time(campaigns_data['campaigns'])
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al predecir mejor momento: {str(e)}")


@router.post("/campaigns/ai-generate-copy")
async def generate_email_copy(request: EmailCopyRequest):
    try:
        result = campaigns_ai_service.generate_email_copy(
            campaign_type=request.campaign_type,
            product_info=request.product_info,
            tone=request.tone
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar copy: {str(e)}")