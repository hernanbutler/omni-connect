from fastapi import APIRouter, HTTPException
from ..services import social_service, social_ai_service

router = APIRouter()

@router.get("/social")
async def get_social():
    """
    Endpoint principal para obtener datos de redes sociales
    Retorna métricas, estadísticas y análisis de publicaciones
    """
    try:
        # Obtener datos procesados
        social_data = social_service.get_social_data()
        
        if "error" in social_data:
            raise HTTPException(status_code=500, detail=social_data["error"])
        
        return {
            "status": "success",
            "data": social_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar datos: {str(e)}")

@router.get("/social/insights")
async def get_social_insights():
    """
    Endpoint para obtener insights de IA sobre redes sociales
    Incluye análisis avanzado, recomendaciones e ideas de contenido
    """
    try:
        # Primero obtener los datos procesados
        social_data = social_service.get_social_data()
        
        if "error" in social_data:
            raise HTTPException(status_code=500, detail=social_data["error"])
        
        # Generar insights con IA
        ai_insights = social_ai_service.get_social_ai_insights(social_data)
        
        return {
            "status": "success",
            "data": ai_insights
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar insights: {str(e)}")

@router.get("/social/platforms/{platform}")
async def get_platform_details(platform: str):
    """
    Obtiene detalles específicos de una plataforma
    """
    try:
        social_data = social_service.get_social_data()
        
        if "error" in social_data:
            raise HTTPException(status_code=404, detail="Datos no encontrados")
        
        # Filtrar datos de la plataforma específica
        platform_data = next(
            (p for p in social_data.get('platform_stats', []) if p['platform'].lower() == platform.lower()),
            None
        )
        
        if not platform_data:
            raise HTTPException(status_code=404, detail=f"Plataforma {platform} no encontrada")
        
        # Obtener mejores horarios para esta plataforma
        best_times = social_data.get('best_times', {}).get(platform, {})
        
        return {
            "status": "success",
            "data": {
                "platform": platform_data,
                "best_times": best_times
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/social/generate-post")
async def generate_post_with_ai(request: dict):
    """
    Genera contenido para un post usando IA
    Body: {"platform": "Instagram", "topic": "marketing tips", "tone": "professional"}
    """
    try:
        platform = request.get('platform', 'Instagram')
        topic = request.get('topic', 'marketing digital')
        tone = request.get('tone', 'profesional')
        
        # Aquí iría la lógica para generar contenido con IA
        # Por ahora retornamos un placeholder
        
        return {
            "status": "success",
            "data": {
                "platform": platform,
                "content": f"Post generado sobre {topic} con tono {tone}",
                "hashtags": ["#marketing", "#digital", "#business"],
                "best_time": "18:00-20:00"
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando post: {str(e)}")