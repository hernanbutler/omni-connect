from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import ai_content_service

router = APIRouter()

class ContentGenerationRequest(BaseModel):
    content_type: str
    tone: str
    topic: str
    segment: Optional[str] = None
    platform: Optional[str] = None
    additional_context: Optional[str] = None

class ContentImprovementRequest(BaseModel):
    original_content: str
    improvement_type: str  # "grammar", "engagement", "seo", "shorter", "longer"
    tone: Optional[str] = "profesional"

@router.get("/ai-content")
async def get_ai_content_info():
    """Endpoint informativo sobre el generador de contenido IA"""
    return {
        "status": "active",
        "message": "Generador de Contenido con IA",
        "supported_content_types": [
            "email",
            "social_post",
            "blog_article",
            "ad_copy",
            "product_description",
            "landing_page",
            "video_script",
            "hashtags"
        ],
        "supported_tones": [
            "profesional",
            "casual",
            "persuasivo",
            "educativo",
            "inspirador",
            "humorístico"
        ],
        "supported_platforms": [
            "Instagram",
            "Facebook",
            "LinkedIn",
            "Twitter",
            "TikTok",
            "YouTube"
        ]
    }

@router.post("/ai-content/generate")
async def generate_content(request: ContentGenerationRequest):
    """
    Genera contenido usando IA basado en los parámetros proporcionados
    
    - content_type: Tipo de contenido a generar
    - tone: Tono del contenido
    - topic: Tema principal
    - segment: Segmento de audiencia (opcional)
    - platform: Plataforma destino (opcional)
    - additional_context: Contexto adicional (opcional)
    """
    try:
        generated_content = ai_content_service.generate_ai_content(
            content_type=request.content_type,
            tone=request.tone,
            topic=request.topic,
            segment=request.segment,
            platform=request.platform,
            additional_context=request.additional_context
        )
        
        return {
            "status": "success",
            "data": generated_content
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar contenido: {str(e)}"
        )

@router.post("/ai-content/improve")
async def improve_content(request: ContentImprovementRequest):
    """
    Mejora contenido existente usando IA
    
    - original_content: Contenido a mejorar
    - improvement_type: Tipo de mejora (grammar, engagement, seo, etc.)
    - tone: Tono deseado
    """
    try:
        improved = ai_content_service.improve_existing_content(
            content=request.original_content,
            improvement_type=request.improvement_type,
            tone=request.tone
        )
        
        return {
            "status": "success",
            "data": improved
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al mejorar contenido: {str(e)}"
        )

@router.post("/ai-content/translate")
async def translate_content(content: str, target_language: str):
    """
    Traduce contenido a otro idioma manteniendo el tono
    
    - content: Contenido a traducir
    - target_language: Idioma destino (inglés, francés, alemán, etc.)
    """
    try:
        translated = ai_content_service.translate_content(content, target_language)
        
        return {
            "status": "success",
            "data": translated
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al traducir contenido: {str(e)}"
        )

@router.post("/ai-content/analyze")
async def analyze_content(content: str):
    """
    Analiza contenido y proporciona métricas y sugerencias
    
    - content: Contenido a analizar
    """
    try:
        analysis = ai_content_service.analyze_content(content)
        
        return {
            "status": "success",
            "data": analysis
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al analizar contenido: {str(e)}"
        )

@router.get("/ai-content/templates/{content_type}")
async def get_content_templates(content_type: str):
    """
    Obtiene templates y ejemplos para un tipo de contenido específico
    """
    templates = {
        "email": {
            "templates": [
                {"name": "Bienvenida", "description": "Email de bienvenida para nuevos suscriptores"},
                {"name": "Promoción", "description": "Email promocional con oferta especial"},
                {"name": "Newsletter", "description": "Boletín informativo mensual"},
                {"name": "Abandono de carrito", "description": "Recuperación de carritos abandonados"}
            ]
        },
        "social_post": {
            "templates": [
                {"name": "Pregunta enganchadora", "description": "Post que inicia conversación"},
                {"name": "Testimonio", "description": "Compartir opinión de cliente"},
                {"name": "Behind the scenes", "description": "Mostrar el proceso interno"},
                {"name": "Tip rápido", "description": "Consejo útil en formato corto"}
            ]
        },
        "blog_article": {
            "templates": [
                {"name": "How-to Guide", "description": "Guía paso a paso"},
                {"name": "Listicle", "description": "Artículo en formato de lista"},
                {"name": "Case Study", "description": "Estudio de caso detallado"},
                {"name": "Opinion Piece", "description": "Artículo de opinión"}
            ]
        }
    }
    
    return {
        "status": "success",
        "data": templates.get(content_type, {"templates": []})
    }