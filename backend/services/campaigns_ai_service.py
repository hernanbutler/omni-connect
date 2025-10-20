import os
from openai import OpenAI

# Configuración de OpenAI
client = None
API_KEY = os.getenv("OPENAI_API_KEY", "")

def initialize_openai():
    """Inicializa el cliente de OpenAI."""
    global client
    if API_KEY and API_KEY != "tu-api-key-aqui":
        client = OpenAI(api_key=API_KEY)
        return True
    return False


def analyze_campaign_performance(campaign_data):
    """
    Analiza el rendimiento de una campaña usando IA.
    
    Args:
        campaign_data: Dict con datos de la campaña (nombre, open_rate, ctr, etc.)
    
    Returns:
        Dict con análisis, insights y recomendaciones
    """
    if not initialize_openai():
        return {
            "error": "API Key de OpenAI no configurada",
            "insights": [
                "Configura tu OPENAI_API_KEY en el archivo .env para habilitar análisis con IA"
            ],
            "recommendations": [
                "La tasa de apertura actual indica un rendimiento dentro del promedio de la industria",
                "Considera segmentar tu audiencia para mejorar la relevancia",
                "Prueba diferentes líneas de asunto para aumentar el engagement"
            ]
        }
    
    try:
        prompt = f"""
Analiza esta campaña de email marketing y proporciona insights accionables:

Nombre: {campaign_data.get('name', 'N/A')}
Tasa de Apertura: {campaign_data.get('open_rate', 0)}%
CTR: {campaign_data.get('ctr', 0)}%
Tasa de Conversión: {campaign_data.get('conversion_rate', 0)}%
Destinatarios: {campaign_data.get('recipients', 0)}

Benchmarks de la industria:
- Tasa de Apertura promedio: 21-25%
- CTR promedio: 2.5-3.5%
- Tasa de Conversión promedio: 2-5%

Proporciona:
1. 3 insights clave sobre el rendimiento
2. 4 recomendaciones específicas y accionables para mejorar
3. Una predicción de mejora esperada si se implementan las recomendaciones

Formato de respuesta en JSON:
{{
    "performance_summary": "Resumen breve del rendimiento",
    "insights": ["insight1", "insight2", "insight3"],
    "recommendations": ["rec1", "rec2", "rec3", "rec4"],
    "predicted_improvement": "Descripción de mejora esperada"
}}
"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un experto en email marketing con 15 años de experiencia analizando campañas y optimizando conversiones."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        return {
            "error": f"Error al analizar campaña: {str(e)}",
            "insights": ["No se pudo completar el análisis con IA"],
            "recommendations": ["Verifica la configuración de la API de OpenAI"]
        }


def generate_subject_line_variants(campaign_type, target_audience="general"):
    """
    Genera variantes de líneas de asunto optimizadas.
    
    Args:
        campaign_type: Tipo de campaña (promocional, newsletter, reactivacion)
        target_audience: Audiencia objetivo
    
    Returns:
        Lista de 5 variantes de asunto
    """
    if not initialize_openai():
        return {
            "variants": [
                "🎉 Oferta especial solo para ti",
                "No te pierdas estas novedades",
                "Tu descuento exclusivo te espera",
                "Últimas horas: aprovecha ahora",
                "Algo especial para ti 💌"
            ]
        }
    
    try:
        campaign_descriptions = {
            "promocional": "campaña de descuentos y ofertas especiales",
            "newsletter": "newsletter informativo con contenido de valor",
            "reactivacion": "campaña de recuperación de clientes inactivos",
            "bienvenida": "email de bienvenida a nuevos suscriptores"
        }
        
        description = campaign_descriptions.get(campaign_type, "campaña de email marketing")
        
        prompt = f"""
Genera 5 líneas de asunto optimizadas para una {description} dirigida a {target_audience}.

Criterios:
- Máximo 50 caracteres
- Usar técnicas de persuasión (urgencia, exclusividad, curiosidad)
- Incluir emojis estratégicamente (1-2 por asunto)
- Ser específico y claro
- Enfocarse en beneficio para el usuario

Proporciona solo las 5 líneas de asunto, una por línea, sin numeración ni explicaciones.
"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un copywriter especializado en email marketing con historial comprobado de altas tasas de apertura."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=300
        )
        
        variants = response.choices[0].message.content.strip().split('\n')
        variants = [v.strip() for v in variants if v.strip()]
        
        return {"variants": variants[:5]}
        
    except Exception as e:
        return {
            "error": f"Error al generar asuntos: {str(e)}",
            "variants": []
        }


def predict_best_send_time(historical_data):
    """
    Predice el mejor momento para enviar una campaña basado en datos históricos.
    
    Args:
        historical_data: Lista de campañas con fechas y tasas de apertura
    
    Returns:
        Recomendación de mejor día y hora para enviar
    """
    if not initialize_openai():
        return {
            "best_day": "Martes",
            "best_time": "10:00 AM",
            "confidence": "media",
            "reasoning": "Basado en benchmarks de la industria, los martes a las 10 AM suelen tener mejor rendimiento"
        }
    
    try:
        # Preparar datos históricos para el análisis
        data_summary = "\n".join([
            f"Fecha: {camp['date']}, Tasa Apertura: {camp['open_rate']}%"
            for camp in historical_data[:10]  # Últimas 10 campañas
        ])
        
        prompt = f"""
Analiza estos datos históricos de campañas de email y recomienda el mejor momento para enviar:

{data_summary}

Considera:
- Día de la semana con mejor rendimiento
- Hora del día óptima
- Patrones identificados

Responde en formato JSON:
{{
    "best_day": "día de la semana",
    "best_time": "hora en formato 12h",
    "alternative_time": "segunda mejor opción",
    "confidence": "alta/media/baja",
    "reasoning": "explicación breve"
}}
"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un analista de datos especializado en email marketing y optimización de envíos."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=400
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        return {
            "error": f"Error al predecir mejor momento: {str(e)}",
            "best_day": "Martes",
            "best_time": "10:00 AM"
        }


def generate_email_copy(campaign_type, product_info, tone="professional"):
    """
    Genera el copy completo para un email.
    
    Args:
        campaign_type: Tipo de campaña
        product_info: Información del producto/servicio
        tone: Tono del mensaje (professional, casual, friendly)
    
    Returns:
        Dict con asunto, preheader, body y CTA
    """
    if not initialize_openai():
        return {
            "subject": "Oferta especial para ti",
            "preheader": "No te pierdas esta oportunidad única",
            "body": "Estimado cliente,\n\nTenemos algo especial para ti...",
            "cta": "Ver oferta"
        }
    
    try:
        prompt = f"""
Genera un email completo para una campaña de tipo: {campaign_type}

Información del producto/servicio:
{product_info}

Tono deseado: {tone}

Proporciona en formato JSON:
{{
    "subject": "línea de asunto atractiva (max 50 caracteres)",
    "preheader": "texto de preheader (max 100 caracteres)",
    "body": "cuerpo del email en HTML simple, máximo 200 palabras",
    "cta": "texto del botón de llamada a la acción"
}}

El copy debe ser persuasivo, claro y enfocado en beneficios.
"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Eres un copywriter experto en email marketing con tono {tone}."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=600
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        return {
            "error": f"Error al generar copy: {str(e)}",
            "subject": "",
            "body": ""
        }


def get_campaign_insights_summary(all_campaigns_data):
    """
    Genera un resumen de insights de todas las campañas.
    
    Args:
        all_campaigns_data: Datos agregados de todas las campañas
    
    Returns:
        Lista de insights generales
    """
    if not initialize_openai():
        return {
            "insights": [
                "Las campañas de reactivación muestran mejor rendimiento con un CTR promedio 30% superior",
                "Los envíos entre martes y jueves obtienen 15% más aperturas",
                "Las líneas de asunto con emojis aumentan la tasa de apertura en un 12%"
            ]
        }
    
    try:
        prompt = f"""
Analiza estos datos agregados de campañas de email marketing:

Total de campañas: {all_campaigns_data.get('total_campaigns', 0)}
Tasa de apertura promedio: {all_campaigns_data.get('avg_open_rate', 0)}%
CTR promedio: {all_campaigns_data.get('avg_ctr', 0)}%
Revenue total: ${all_campaigns_data.get('total_revenue', 0):,.2f}

Proporciona 5 insights estratégicos accionables en formato de lista.
Cada insight debe ser específico, basado en datos y útil para mejorar futuras campañas.
"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un consultor estratégico de email marketing."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )
        
        insights = response.choices[0].message.content.strip().split('\n')
        insights = [i.strip('- ').strip() for i in insights if i.strip()]
        
        return {"insights": insights[:5]}
        
    except Exception as e:
        return {
            "error": f"Error al generar insights: {str(e)}",
            "insights": []
        }