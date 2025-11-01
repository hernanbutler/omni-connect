import os
import json
from openai import OpenAI

# API Key desde variables de entorno
API_KEY = os.getenv("OPENAI_API_KEY", "default_key_for_development")

def get_social_ai_insights(social_data):
    """
    Genera insights y recomendaciones de IA para la vista de Social.
    Utiliza OpenAI GPT para análisis avanzado de datos de redes sociales.
    """
    if not API_KEY or API_KEY == "default_key_for_development":
        return generate_fallback_insights(social_data)
    
    try:
        client = OpenAI(api_key=API_KEY)
        
        # Preparar contexto para la IA
        context = prepare_context(social_data)
        
        # Generar insights
        insights = generate_insights(client, context)
        
        # Generar recomendaciones de contenido
        content_ideas = generate_content_ideas(client, social_data)
        
        # Analizar sentimiento y tendencias
        sentiment_analysis = analyze_trends(client, social_data)
        
        return {
            "insights": insights,
            "content_ideas": content_ideas,
            "sentiment_analysis": sentiment_analysis,
            "recommendations": generate_recommendations(insights, social_data)
        }
        
    except Exception as e:
        print(f"Error al conectar con OpenAI: {str(e)}")
        return generate_fallback_insights(social_data)

def prepare_context(social_data):
    """Prepara el contexto de datos para enviar a la IA"""
    return f"""
    Datos de rendimiento de redes sociales:
    - Total de publicaciones: {social_data.get('total_posts', 0)}
    - Alcance total: {social_data.get('total_reach', 0):,}
    - Engagement total: {social_data.get('total_engagement', 0):,}
    - Tasa de engagement promedio: {social_data.get('avg_engagement_rate', 0)}%
    
    Estadísticas por plataforma:
    {json.dumps(social_data.get('platform_stats', []), indent=2)}
    
    Post con mejor desempeño:
    {json.dumps(social_data.get('top_post', {}), indent=2)}
    """

def generate_insights(client, context):
    """Genera insights estratégicos usando GPT"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto analista de redes sociales. Analiza los datos y proporciona 3-4 insights clave y accionables en formato JSON con estructura: [{\"type\": \"tipo\", \"title\": \"título\", \"description\": \"descripción\", \"impact\": \"alto/medio/bajo\"}]"
                },
                {
                    "role": "user",
                    "content": f"Analiza estos datos de redes sociales y genera insights:\n\n{context}"
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        insights_text = response.choices[0].message.content
        
        # Intentar parsear JSON, si falla devolver texto plano
        try:
            return json.loads(insights_text)
        except:
            return parse_insights_from_text(insights_text)
            
    except Exception as e:
        print(f"Error generando insights: {str(e)}")
        return []

def generate_content_ideas(client, social_data):
    """Genera ideas de contenido personalizadas"""
    try:
        platform_stats = social_data.get('platform_stats', [])
        best_platform = max(platform_stats, key=lambda x: x['engagement_rate']) if platform_stats else None
        
        prompt = f"""
        Basándote en el rendimiento de las redes sociales, genera 5 ideas de contenido específicas.
        
        Mejor plataforma: {best_platform['platform'] if best_platform else 'N/A'}
        Tasa de engagement: {best_platform['engagement_rate'] if best_platform else 0}%
        
        Formato JSON: [{{"platform": "plataforma", "idea": "idea de contenido", "format": "formato", "estimated_engagement": "estimación"}}]
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un creador de contenido experto en redes sociales. Genera ideas creativas y accionables."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.8,
            max_tokens=600
        )
        
        ideas_text = response.choices[0].message.content
        
        try:
            return json.loads(ideas_text)
        except:
            return parse_content_ideas_from_text(ideas_text)
            
    except Exception as e:
        print(f"Error generando ideas de contenido: {str(e)}")
        return []

def analyze_trends(client, social_data):
    """Analiza tendencias y patrones de engagement"""
    try:
        engagement_trends = social_data.get('engagement_trends', [])
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un analista de tendencias en redes sociales. Identifica patrones y oportunidades."
                },
                {
                    "role": "user",
                    "content": f"Analiza estas tendencias de engagement: {json.dumps(engagement_trends)}\n\nIdentifica: 1) Plataformas en crecimiento, 2) Plataformas que necesitan atención, 3) Oportunidades estratégicas"
                }
            ],
            temperature=0.6,
            max_tokens=400
        )
        
        return {
            "analysis": response.choices[0].message.content,
            "trends": engagement_trends
        }
        
    except Exception as e:
        print(f"Error analizando tendencias: {str(e)}")
        return {"analysis": "Análisis no disponible", "trends": []}

def generate_recommendations(insights, social_data):
    """Genera recomendaciones accionables basadas en insights"""
    recommendations = []
    
    # Recomendación basada en engagement rate
    avg_rate = social_data.get('avg_engagement_rate', 0)
    if avg_rate < 3:
        recommendations.append({
            "priority": "alta",
            "category": "Engagement",
            "title": "Aumentar interacción con la audiencia",
            "description": f"Tu tasa de engagement promedio es {avg_rate}%. Prueba hacer más preguntas abiertas y responder activamente a comentarios.",
            "action": "Implementar estrategia de engagement activo"
        })
    elif avg_rate > 5:
        recommendations.append({
            "priority": "media",
            "category": "Crecimiento",
            "title": "Escalar contenido exitoso",
            "description": f"Con {avg_rate}% de engagement, estás superando el promedio. Es momento de escalar tu mejor contenido.",
            "action": "Aumentar frecuencia de publicación"
        })
    
    # Recomendación basada en mejor plataforma
    platform_stats = social_data.get('platform_stats', [])
    if platform_stats:
        best = max(platform_stats, key=lambda x: x['engagement_rate'])
        recommendations.append({
            "priority": "media",
            "category": "Optimización",
            "title": f"Optimizar estrategia en {best['platform']}",
            "description": f"{best['platform']} es tu plataforma más efectiva con {best['engagement_rate']}% de engagement.",
            "action": f"Aumentar inversión en {best['platform']}"
        })
    
    return recommendations

def generate_fallback_insights(social_data):
    """Genera insights sin usar la API de OpenAI (fallback)"""
    insights = []
    
    # Análisis básico sin IA
    avg_rate = social_data.get('avg_engagement_rate', 0)
    
    if avg_rate > 5:
        insights.append({
            "type": "success",
            "title": "Excelente rendimiento general",
            "description": f"Tu tasa de engagement promedio de {avg_rate}% supera el benchmark de la industria.",
            "impact": "alto"
        })
    elif avg_rate < 2:
        insights.append({
            "type": "warning",
            "title": "Oportunidad de mejora en engagement",
            "description": "Considera aumentar la frecuencia de interacción con tu audiencia.",
            "impact": "alto"
        })
    
    # Análisis de contenido visual
    insights.append({
        "type": "tip",
        "title": "Contenido visual",
        "description": "Posts con imágenes obtienen 3.2x más engagement que solo texto",
        "impact": "medio"
    })
    
    # Hashtags
    insights.append({
        "type": "tip",
        "title": "Hashtags óptimos",
        "description": "5-7 hashtags generan mejor alcance orgánico",
        "impact": "medio"
    })
    
    content_ideas = [
        {
            "platform": "Instagram",
            "idea": "Carrusel educativo: '5 tips de marketing digital'",
            "format": "Carrusel",
            "estimated_engagement": "Alto"
        },
        {
            "platform": "LinkedIn",
            "idea": "Caso de estudio de cliente exitoso",
            "format": "Artículo + infografía",
            "estimated_engagement": "Medio-Alto"
        },
        {
            "platform": "TikTok",
            "idea": "Behind the scenes de tu proceso creativo",
            "format": "Video corto",
            "estimated_engagement": "Alto"
        }
    ]
    
    return {
        "insights": insights,
        "content_ideas": content_ideas,
        "sentiment_analysis": {
            "analysis": "Análisis detallado disponible con API Key configurada",
            "trends": social_data.get('engagement_trends', [])
        },
        "recommendations": generate_recommendations(insights, social_data),
        "warning": "API Key de IA no configurada. Mostrando análisis básico."
    }

def parse_insights_from_text(text):
    """Parsea insights de texto plano si JSON falla"""
    # Implementación básica de parsing
    return [{
        "type": "info",
        "title": "Análisis de IA",
        "description": text[:200] + "...",
        "impact": "medio"
    }]

def parse_content_ideas_from_text(text):
    """Parsea ideas de contenido de texto plano"""
    return [{
        "platform": "General",
        "idea": text[:150] + "...",
        "format": "Múltiple",
        "estimated_engagement": "Medio"
    }]