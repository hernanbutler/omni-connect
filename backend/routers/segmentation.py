from fastapi import APIRouter, HTTPException
from ..services import segmentation_service, segmentation_ai_service

router = APIRouter()

@router.get("/segmentation")
def get_segmentation_data():
    """Endpoint para obtener todos los datos de segmentación con RFM y ML."""
    return segmentation_service.get_segmentation_data()

@router.get("/segmentation/ai/status")
def check_ai_status():
    """Verifica si la API de IA está configurada."""
    return segmentation_ai_service.check_api_status()

@router.post("/segmentation/ai/persona/{segment_name}")
def generate_persona(segment_name: str):
    """
    Genera un perfil de cliente (persona) para un segmento específico.
    
    Args:
        segment_name: Nombre del segmento (ej: "compradores_vip", "en_riesgo_churn")
    """
    # Obtener datos del segmento
    seg_data = segmentation_service.get_segmentation_data()
    
    if seg_data.get("status") == "error":
        raise HTTPException(status_code=500, detail=seg_data.get("error"))
    
    # Mapear nombres de frontend a backend
    segment_mapping = {
        "compradores_vip": "VIP Champions",
        "en_riesgo_churn": "En Riesgo",
        "promesa": "Promesa",
        "leales": "Leales",
        "hibernando": "Hibernando",
        "perdidos": "Perdidos"
    }
    
    mapped_name = segment_mapping.get(segment_name, segment_name)
    
    # Buscar datos del segmento en segments o segments_summary
    segment_data = None
    if segment_name in seg_data.get("segments", {}):
        segment_data = seg_data["segments"][segment_name]
    elif mapped_name in seg_data.get("segments_summary", {}):
        segment_data = seg_data["segments_summary"][mapped_name]
    
    if not segment_data:
        raise HTTPException(status_code=404, detail=f"Segmento {segment_name} no encontrado")
    
    # Generar persona con ChatGPT
    persona = segmentation_ai_service.generate_customer_persona(mapped_name, segment_data)
    
    return {
        "segment": segment_name,
        "segment_display_name": mapped_name,
        "persona": persona
    }

@router.post("/segmentation/ai/recommendations/{segment_name}")
def generate_recommendations(segment_name: str):
    """
    Genera recomendaciones de marketing para un segmento específico.
    
    Args:
        segment_name: Nombre del segmento
    """
    # Obtener datos del segmento
    seg_data = segmentation_service.get_segmentation_data()
    
    if seg_data.get("status") == "error":
        raise HTTPException(status_code=500, detail=seg_data.get("error"))
    
    # Mapear nombres
    segment_mapping = {
        "compradores_vip": "VIP Champions",
        "en_riesgo_churn": "En Riesgo",
        "promesa": "Promesa",
        "leales": "Leales",
        "hibernando": "Hibernando",
        "perdidos": "Perdidos"
    }
    
    mapped_name = segment_mapping.get(segment_name, segment_name)
    
    # Buscar datos del segmento
    segment_data = None
    if segment_name in seg_data.get("segments", {}):
        segment_data = seg_data["segments"][segment_name]
    elif mapped_name in seg_data.get("segments_summary", {}):
        segment_data = seg_data["segments_summary"][mapped_name]
    
    if not segment_data:
        raise HTTPException(status_code=404, detail=f"Segmento {segment_name} no encontrado")
    
    # Generar recomendaciones con ChatGPT
    recommendations = segmentation_ai_service.generate_marketing_recommendations(mapped_name, segment_data)
    
    return {
        "segment": segment_name,
        "segment_display_name": mapped_name,
        "recommendations": recommendations
    }

@router.post("/segmentation/ai/insights/{segment_name}")
def generate_insights(segment_name: str):
    """
    Genera insights y análisis comparativo para un segmento.
    
    Args:
        segment_name: Nombre del segmento
    """
    # Obtener todos los datos
    seg_data = segmentation_service.get_segmentation_data()
    
    if seg_data.get("status") == "error":
        raise HTTPException(status_code=500, detail=seg_data.get("error"))
    
    # Mapear nombres
    segment_mapping = {
        "compradores_vip": "VIP Champions",
        "en_riesgo_churn": "En Riesgo",
        "promesa": "Promesa",
        "leales": "Leales",
        "hibernando": "Hibernando",
        "perdidos": "Perdidos"
    }
    
    mapped_name = segment_mapping.get(segment_name, segment_name)
    
    # Buscar datos del segmento
    segment_data = None
    if segment_name in seg_data.get("segments", {}):
        segment_data = seg_data["segments"][segment_name]
    elif mapped_name in seg_data.get("segments_summary", {}):
        segment_data = seg_data["segments_summary"][mapped_name]
    
    if not segment_data:
        raise HTTPException(status_code=404, detail=f"Segmento {segment_name} no encontrado")
    
    # Obtener datos de todos los segmentos para comparación
    all_segments = seg_data.get("segments_summary", {})
    
    # Generar insights con ChatGPT
    insights = segmentation_ai_service.generate_segment_insights(
        mapped_name, 
        segment_data, 
        all_segments
    )
    
    return {
        "segment": segment_name,
        "segment_display_name": mapped_name,
        "insights": insights
    }