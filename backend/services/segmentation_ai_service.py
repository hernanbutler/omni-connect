import os
from openai import OpenAI
from dotenv import load_dotenv
import json

# Cargar variables de entorno
load_dotenv()

# Inicializar cliente de OpenAI
client = None
API_KEY = os.getenv("OPENAI_API_KEY", "")

if API_KEY and API_KEY != "default_key_for_development":
    try:
        client = OpenAI(api_key=API_KEY)
    except Exception as e:
        print(f"Error al inicializar OpenAI client: {e}")

def generate_customer_persona(segment_name, segment_data):
    """
    Genera un perfil de cliente (persona) usando ChatGPT.
    
    Args:
        segment_name (str): Nombre del segmento
        segment_data (dict): Datos estadísticos del segmento
    
    Returns:
        dict: Perfil generado con nombre, descripción, comportamiento, etc.
    """
    if not client:
        return {
            "status": "error",
            "message": "API Key de OpenAI no configurada. Por favor configura OPENAI_API_KEY en el archivo .env"
        }
    
    try:
        # Construir prompt
        prompt = f"""Eres un experto en marketing y análisis de clientes. Basándote en los siguientes datos de un segmento de clientes, crea un perfil de cliente persona detallado y realista.

**Segmento:** {segment_name}

**Datos del Segmento:**
- Total de usuarios: {segment_data.get('usuarios', 'N/A')}
- Porcentaje del total: {segment_data.get('porcentaje', 'N/A')}%
- CLV Promedio: ${segment_data.get('clv_promedio', 0):.2f}
- Engagement Promedio: {segment_data.get('engagement_promedio', 0)}%
- Compras Promedio: {segment_data.get('compras_promedio', 0)}
- Riesgo de Churn: {segment_data.get('riesgo_churn_promedio', 0)}%

**Genera un perfil que incluya:**
1. Un nombre ficticio y edad aproximada
2. Ocupación y nivel socioeconómico
3. Descripción de su comportamiento de compra
4. Motivaciones principales
5. Puntos de dolor (pain points)
6. Canales de comunicación preferidos
7. Una frase que lo describa

Responde SOLO en formato JSON con esta estructura:
{{
    "nombre": "...",
    "edad": "...",
    "ocupacion": "...",
    "nivel_socioeconomico": "...",
    "comportamiento": "...",
    "motivaciones": "...",
    "pain_points": "...",
    "canales_preferidos": "...",
    "frase_descriptiva": "..."
}}"""

        # Llamar a la API de OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Modelo económico y rápido
            messages=[
                {"role": "system", "content": "Eres un experto en marketing y perfilamiento de clientes. Siempre respondes en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Extraer respuesta
        content = response.choices[0].message.content.strip()
        
        # Intentar parsear JSON
        try:
            # Limpiar markdown si existe
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            persona = json.loads(content)
            persona["status"] = "success"
            return persona
        except json.JSONDecodeError:
            # Si no es JSON válido, devolver como texto
            return {
                "status": "success",
                "texto_completo": content
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al generar persona: {str(e)}"
        }

def generate_marketing_recommendations(segment_name, segment_data):
    """
    Genera recomendaciones de marketing específicas usando ChatGPT.
    
    Args:
        segment_name (str): Nombre del segmento
        segment_data (dict): Datos estadísticos del segmento
    
    Returns:
        dict: Recomendaciones de acciones de marketing
    """
    if not client:
        return {
            "status": "error",
            "message": "API Key de OpenAI no configurada"
        }
    
    try:
        prompt = f"""Eres un estratega de marketing digital experto. Analiza este segmento de clientes y proporciona recomendaciones accionables.

**Segmento:** {segment_name}

**Métricas Clave:**
- Usuarios: {segment_data.get('usuarios', 'N/A')}
- CLV Promedio: ${segment_data.get('clv_promedio', 0):.2f}
- CLV Total: ${segment_data.get('clv_total', 0):.2f}
- Engagement: {segment_data.get('engagement_promedio', 0)}%
- Riesgo Churn: {segment_data.get('riesgo_churn_promedio', 0)}%

**Genera recomendaciones que incluyan:**
1. 3 acciones de marketing prioritarias y específicas
2. Canales recomendados para cada acción
3. Tipo de mensaje/oferta sugerido
4. ROI estimado (alto/medio/bajo)
5. Tiempo estimado de implementación

Responde SOLO en formato JSON con esta estructura:
{{
    "recomendaciones": [
        {{
            "accion": "...",
            "canal": "...",
            "mensaje_oferta": "...",
            "roi_estimado": "...",
            "tiempo_implementacion": "..."
        }}
    ],
    "prioridad_general": "...",
    "justificacion": "..."
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un estratega de marketing digital. Siempre respondes en JSON válido con recomendaciones accionables."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=600
        )
        
        content = response.choices[0].message.content.strip()
        
        try:
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            recommendations = json.loads(content)
            recommendations["status"] = "success"
            return recommendations
        except json.JSONDecodeError:
            return {
                "status": "success",
                "texto_completo": content
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al generar recomendaciones: {str(e)}"
        }

def generate_segment_insights(segment_name, segment_data, all_segments_data):
    """
    Genera insights generales comparando este segmento con otros.
    
    Args:
        segment_name (str): Nombre del segmento
        segment_data (dict): Datos del segmento específico
        all_segments_data (dict): Datos de todos los segmentos
    
    Returns:
        dict: Insights y análisis comparativo
    """
    if not client:
        return {
            "status": "error",
            "message": "API Key de OpenAI no configurada"
        }
    
    try:
        # Preparar contexto de otros segmentos
        otros_segmentos = "\n".join([
            f"- {name}: {data.get('usuarios', 0)} usuarios, CLV ${data.get('clv_promedio', 0):.2f}"
            for name, data in all_segments_data.items() if name != segment_name
        ])
        
        prompt = f"""Eres un analista de datos especializado en comportamiento del cliente. Analiza este segmento en contexto con los demás.

**Segmento Analizado:** {segment_name}
- Usuarios: {segment_data.get('usuarios', 0)}
- CLV Promedio: ${segment_data.get('clv_promedio', 0):.2f}
- Engagement: {segment_data.get('engagement_promedio', 0)}%

**Otros Segmentos:**
{otros_segmentos}

**Proporciona:**
1. 3 insights clave sobre este segmento
2. Oportunidades que representa
3. Riesgos potenciales
4. Comparación con otros segmentos

Responde SOLO en formato JSON:
{{
    "insights": ["...", "...", "..."],
    "oportunidades": ["...", "..."],
    "riesgos": ["...", "..."],
    "comparacion": "..."
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un analista de datos experto. Respondes en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        try:
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            insights = json.loads(content)
            insights["status"] = "success"
            return insights
        except json.JSONDecodeError:
            return {
                "status": "success",
                "texto_completo": content
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al generar insights: {str(e)}"
        }

def check_api_status():
    """Verifica si la API de OpenAI está configurada correctamente."""
    if not API_KEY or API_KEY == "default_key_for_development":
        return {
            "configured": False,
            "message": "API Key no configurada. Por favor configura OPENAI_API_KEY en .env"
        }
    
    if not client:
        return {
            "configured": False,
            "message": "Error al inicializar cliente de OpenAI"
        }
    
    try:
        # Test simple
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "test"}],
            max_tokens=5
        )
        return {
            "configured": True,
            "message": "API de OpenAI configurada correctamente",
            "model": "gpt-4o-mini"
        }
    except Exception as e:
        return {
            "configured": False,
            "message": f"Error al conectar con OpenAI: {str(e)}"
        }