def parse_social_from_text(text, platform):
    return {
        "type": "social_post",
        "platform": platform,
        "content": text,
        "hashtags": ["#marketing"]
    }

def improve_existing_content(content, improvement_type, tone):
    """Mejora contenido existente según el tipo de mejora solicitado"""
    if not API_KEY or API_KEY == "default_key_for_development":
        return {
            "original": content,
            "improved": f"[Versión mejorada de: {content[:50]}...]",
            "improvements": ["Ajuste de tono", "Mejor estructura", "Más impacto"],
            "warning": "API Key no configurada. Mostrando ejemplo."
        }
    
    try:
        client = OpenAI(api_key=API_KEY)
        
        improvement_prompts = {
            "grammar": "Corrige errores gramaticales y ortográficos sin cambiar el mensaje principal.",
            "engagement": "Haz el contenido más atractivo y que genere mayor engagement.",
            "seo": "Optimiza el contenido para SEO sin perder naturalidad.",
            "shorter": "Acorta el contenido manteniendo los puntos clave.",
            "longer": "Expande el contenido con más detalles y ejemplos.",
            "clarity": "Haz el contenido más claro y fácil de entender."
        }
        
        prompt = f"""
        Contenido original:
        {content}
        
        Tarea: {improvement_prompts.get(improvement_type, improvement_type)}
        Tono deseado: {tone}
        
        Proporciona la respuesta en JSON:
        {{
            "original": "contenido original",
            "improved": "contenido mejorado",
            "improvements": ["mejora 1", "mejora 2", "mejora 3"],
            "metrics": {{
                "readability": "score de legibilidad",
                "engagement_potential": "score de engagement"
            }}
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un editor de contenido experto en optimización y mejora de copys."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return {
                "original": content,
                "improved": response.choices[0].message.content,
                "improvements": ["Contenido mejorado"]
            }
    except Exception as e:
        print(f"Error mejorando contenido: {str(e)}")
        return {"error": str(e), "original": content}

def translate_content(content, target_language):
    """Traduce contenido manteniendo tono y estilo"""
    if not API_KEY or API_KEY == "default_key_for_development":
        return {
            "original": content,
            "translated": f"[Traducción a {target_language}: {content[:50]}...]",
            "target_language": target_language,
            "warning": "API Key no configurada."
        }
    
    try:
        client = OpenAI(api_key=API_KEY)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Eres un traductor profesional especializado en marketing. Traduce manteniendo el tono, estilo y impacto del mensaje original."},
                {"role": "user", "content": f"Traduce el siguiente contenido a {target_language}:\n\n{content}"}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        return {
            "original": content,
            "translated": response.choices[0].message.content,
            "target_language": target_language,
            "original_language": "detectado automáticamente"
        }
    except Exception as e:
        print(f"Error traduciendo: {str(e)}")
        return {"error": str(e)}

def analyze_content(content):
    """Analiza contenido y proporciona métricas detalladas"""
    if not API_KEY or API_KEY == "default_key_for_development":
        return {
            "content": content[:100] + "...",
            "metrics": {
                "readability_score": 75,
                "engagement_score": 68,
                "sentiment": "neutral",
                "word_count": len(content.split()),
                "estimated_read_time": f"{len(content.split()) // 200 + 1} min"
            },
            "suggestions": [
                "Considera agregar más llamados a la acción",
                "El tono podría ser más persuasivo",
                "Agrega ejemplos concretos"
            ],
            "warning": "API Key no configurada. Análisis básico."
        }
    
    try:
        client = OpenAI(api_key=API_KEY)
        
        prompt = f"""
        Analiza el siguiente contenido de marketing:
        
        {content}
        
        Proporciona un análisis detallado en JSON:
        {{
            "metrics": {{
                "readability_score": "0-100",
                "engagement_score": "0-100",
                "persuasion_score": "0-100",
                "clarity_score": "0-100",
                "sentiment": "positivo/negativo/neutral",
                "word_count": número,
                "character_count": número,
                "estimated_read_time": "X minutos"
            }},
            "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
            "weaknesses": ["debilidad 1", "debilidad 2"],
            "suggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
            "target_audience": "descripción de audiencia detectada",
            "tone_analysis": "análisis del tono utilizado",
            "cta_effectiveness": "análisis del call-to-action"
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un analista de contenido experto en marketing y copywriting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=1000
        )
        
        try:
            analysis = json.loads(response.choices[0].message.content)
            analysis["content_preview"] = content[:100] + "..."
            return analysis
        except:
            return {
                "content_preview": content[:100] + "...",
                "analysis": response.choices[0].message.content
            }
    except Exception as e:
        print(f"Error analizando contenido: {str(e)}")
        return {"error": str(e)}
    
import os
from openai import OpenAI
import json

# API Key desde variables de entorno
API_KEY = os.getenv("OPENAI_API_KEY", "default_key_for_development")

def generate_ai_content(content_type, tone, topic, segment=None, platform=None, additional_context=None):
    """
    Genera contenido con IA basado en los parámetros del frontend.
    Soporta múltiples tipos de contenido y plataformas.
    """
    if not API_KEY or API_KEY == "default_key_for_development":
        return generate_fallback_content(content_type, tone, topic, segment, platform)
    
    try:
        client = OpenAI(api_key=API_KEY)
        
        # Generar el contenido según el tipo
        if content_type == "email":
            return generate_email_content(client, tone, topic, segment, additional_context)
        elif content_type == "social_post":
            return generate_social_post(client, tone, topic, platform, additional_context)
        elif content_type == "blog_article":
            return generate_blog_article(client, tone, topic, additional_context)
        elif content_type == "ad_copy":
            return generate_ad_copy(client, tone, topic, platform, additional_context)
        elif content_type == "product_description":
            return generate_product_description(client, tone, topic, additional_context)
        elif content_type == "landing_page":
            return generate_landing_page(client, tone, topic, additional_context)
        elif content_type == "video_script":
            return generate_video_script(client, tone, topic, platform, additional_context)
        elif content_type == "hashtags":
            return generate_hashtags(client, topic, platform)
        else:
            return generate_generic_content(client, content_type, tone, topic, additional_context)
            
    except Exception as e:
        print(f"Error al generar contenido con IA: {str(e)}")
        return generate_fallback_content(content_type, tone, topic, segment, platform)

def generate_email_content(client, tone, topic, segment, additional_context):
    """Genera contenido completo para email marketing"""
    prompt = f"""
    Genera un email de marketing profesional con los siguientes parámetros:
    
    - Tema: {topic}
    - Tono: {tone}
    - Segmento objetivo: {segment or 'audiencia general'}
    - Contexto adicional: {additional_context or 'N/A'}
    
    Proporciona la respuesta en formato JSON con esta estructura:
    {{
        "subject_line": "Línea de asunto atractiva (máximo 60 caracteres)",
        "preview_text": "Texto de previsualización (máximo 100 caracteres)",
        "body": "Cuerpo completo del email en HTML simple",
        "cta": "Llamado a la acción principal",
        "tips": ["tip1", "tip2", "tip3"]
    }}
    
    El email debe ser persuasivo, claro y optimizado para conversiones.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un experto copywriter especializado en email marketing con años de experiencia en campañas exitosas."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=1000
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "email"
        return content
    except:
        return parse_email_from_text(response.choices[0].message.content)

def generate_social_post(client, tone, topic, platform, additional_context):
    """Genera posts optimizados para redes sociales"""
    platform_specs = {
        "Instagram": "280 caracteres, visual, con emojis, 5-7 hashtags",
        "Facebook": "400 caracteres, conversacional, con pregunta al final",
        "LinkedIn": "1200 caracteres, profesional, con insights de valor",
        "Twitter": "280 caracteres máximo, conciso, con hashtags relevantes",
        "TikTok": "150 caracteres, juvenil, con hook inicial potente"
    }
    
    spec = platform_specs.get(platform, "300 caracteres, optimizado para engagement")
    
    prompt = f"""
    Genera un post para {platform} sobre: {topic}
    
    - Tono: {tone}
    - Especificaciones: {spec}
    - Contexto: {additional_context or 'N/A'}
    
    Responde en JSON:
    {{
        "content": "Texto del post optimizado",
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
        "hook": "Frase inicial atractiva",
        "cta": "Call to action",
        "best_time": "Mejor horario para publicar",
        "image_suggestion": "Descripción de imagen recomendada",
        "alternatives": ["variante1", "variante2"]
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Eres un social media manager experto en crear contenido viral para {platform}."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.9,
        max_tokens=800
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "social_post"
        content["platform"] = platform
        return content
    except:
        return parse_social_from_text(response.choices[0].message.content, platform)

def generate_blog_article(client, tone, topic, additional_context):
    """Genera artículos de blog completos y SEO-optimizados"""
    prompt = f"""
    Crea un artículo de blog sobre: {topic}
    
    - Tono: {tone}
    - Contexto: {additional_context or 'N/A'}
    
    Formato JSON:
    {{
        "title": "Título SEO-friendly y atractivo",
        "meta_description": "Meta descripción (150-160 caracteres)",
        "introduction": "Introducción enganchadora (2-3 párrafos)",
        "main_points": [
            {{"heading": "H2 Title", "content": "Contenido del punto"}},
            {{"heading": "H2 Title", "content": "Contenido del punto"}},
            {{"heading": "H2 Title", "content": "Contenido del punto"}}
        ],
        "conclusion": "Conclusión con CTA",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "estimated_read_time": "X minutos"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un content writer experto en SEO y storytelling para blogs."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "blog_article"
        return content
    except:
        return {"type": "blog_article", "title": topic, "content": response.choices[0].message.content}

def generate_ad_copy(client, tone, topic, platform, additional_context):
    """Genera copys publicitarios optimizados"""
    prompt = f"""
    Crea un copy publicitario para {platform or 'Google Ads'} sobre: {topic}
    
    - Tono: {tone}
    - Contexto: {additional_context or 'N/A'}
    
    JSON response:
    {{
        "headline": "Titular principal (máx 30 caracteres)",
        "subheadline": "Subtítulo complementario",
        "body": "Texto principal del anuncio",
        "cta": "Call to action potente",
        "variations": [
            {{"headline": "Variante 1", "body": "Texto variante 1"}},
            {{"headline": "Variante 2", "body": "Texto variante 2"}}
        ],
        "target_audience": "Descripción de audiencia ideal",
        "emotional_trigger": "Emoción principal que activa"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un copywriter publicitario especializado en ads de alto rendimiento."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.85,
        max_tokens=800
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "ad_copy"
        return content
    except:
        return {"type": "ad_copy", "headline": topic, "body": response.choices[0].message.content}

def generate_product_description(client, tone, topic, additional_context):
    """Genera descripciones de producto persuasivas"""
    prompt = f"""
    Crea una descripción de producto para: {topic}
    
    - Tono: {tone}
    - Detalles: {additional_context or 'N/A'}
    
    JSON:
    {{
        "short_description": "Descripción breve y atractiva (1-2 líneas)",
        "long_description": "Descripción completa y detallada",
        "key_features": ["característica 1", "característica 2", "característica 3"],
        "benefits": ["beneficio 1", "beneficio 2", "beneficio 3"],
        "technical_specs": {{"spec1": "value1", "spec2": "value2"}},
        "tagline": "Frase memorable del producto"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un experto en e-commerce y descripciones de producto que convierten."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.75,
        max_tokens=1000
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "product_description"
        return content
    except:
        return {"type": "product_description", "short_description": topic, "long_description": response.choices[0].message.content}

def generate_landing_page(client, tone, topic, additional_context):
    """Genera estructura completa de landing page"""
    prompt = f"""
    Crea una estructura de landing page para: {topic}
    
    - Tono: {tone}
    - Contexto: {additional_context or 'N/A'}
    
    JSON:
    {{
        "hero": {{
            "headline": "Headline principal potente",
            "subheadline": "Subtítulo que amplía el valor",
            "cta_primary": "CTA principal",
            "cta_secondary": "CTA secundario opcional"
        }},
        "value_proposition": "Propuesta de valor única",
        "benefits": [
            {{"title": "Beneficio 1", "description": "Descripción"}},
            {{"title": "Beneficio 2", "description": "Descripción"}},
            {{"title": "Beneficio 3", "description": "Descripción"}}
        ],
        "social_proof": "Texto para testimonios/logos",
        "faq": [
            {{"question": "Pregunta 1", "answer": "Respuesta 1"}},
            {{"question": "Pregunta 2", "answer": "Respuesta 2"}}
        ],
        "closing_cta": "CTA de cierre"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un especialista en conversion rate optimization y landing pages de alto rendimiento."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "landing_page"
        return content
    except:
        return {"type": "landing_page", "hero": {"headline": topic}, "content": response.choices[0].message.content}

def generate_video_script(client, tone, topic, platform, additional_context):
    """Genera guiones para videos"""
    duration = "30-60 segundos" if platform == "TikTok" else "2-3 minutos"
    
    prompt = f"""
    Crea un guion de video para {platform or 'YouTube'} sobre: {topic}
    
    - Duración: {duration}
    - Tono: {tone}
    - Contexto: {additional_context or 'N/A'}
    
    JSON:
    {{
        "hook": "Hook inicial (primeros 3 segundos)",
        "introduction": "Introducción",
        "main_content": [
            {{"timestamp": "0:05", "scene": "Descripción de escena", "dialogue": "Diálogo/narración"}},
            {{"timestamp": "0:15", "scene": "Descripción de escena", "dialogue": "Diálogo/narración"}}
        ],
        "call_to_action": "CTA final",
        "visual_notes": ["nota visual 1", "nota visual 2"],
        "music_suggestion": "Tipo de música recomendada"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un guionista experto en contenido de video viral y engaging."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=1200
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "video_script"
        return content
    except:
        return {"type": "video_script", "hook": topic, "content": response.choices[0].message.content}

def generate_hashtags(client, topic, platform):
    """Genera hashtags estratégicos"""
    prompt = f"""
    Genera hashtags para {platform or 'redes sociales'} sobre: {topic}
    
    JSON:
    {{
        "trending": ["#trending1", "#trending2", "#trending3"],
        "niche": ["#niche1", "#niche2", "#niche3"],
        "branded": ["#brand1", "#brand2"],
        "recommended_mix": ["#mix1", "#mix2", "#mix3", "#mix4", "#mix5"]
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un experto en estrategia de hashtags y alcance orgánico."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=400
    )
    
    try:
        content = json.loads(response.choices[0].message.content)
        content["type"] = "hashtags"
        return content
    except:
        return {"type": "hashtags", "recommended_mix": ["#" + topic.replace(" ", "")]}

def generate_generic_content(client, content_type, tone, topic, additional_context):
    """Generador genérico para otros tipos de contenido"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Eres un experto en crear {content_type} de alta calidad."},
            {"role": "user", "content": f"Crea un {content_type} sobre {topic} con tono {tone}. Contexto: {additional_context or 'N/A'}"}
        ],
        temperature=0.8,
        max_tokens=1000
    )
    
    return {
        "type": content_type,
        "content": response.choices[0].message.content,
        "topic": topic,
        "tone": tone
    }

# Funciones de fallback (sin API key)
def generate_fallback_content(content_type, tone, topic, segment, platform):
    """Genera contenido de ejemplo cuando no hay API key"""
    fallback_templates = {
        "email": {
            "type": "email",
            "subject_line": f"🎯 {topic} - Contenido exclusivo para ti",
            "preview_text": f"Descubre cómo {topic} puede transformar tu negocio",
            "body": f"<p>Hola,</p><p>Queremos compartir contigo información valiosa sobre <strong>{topic}</strong>.</p><p>Este contenido está diseñado especialmente para {segment or 'ti'}.</p>",
            "cta": "Ver más →",
            "tips": ["Personaliza el saludo", "Añade valor inmediato", "CTA claro y visible"],
            "warning": "API Key no configurada. Contenido de ejemplo."
        },
        "social_post": {
            "type": "social_post",
            "platform": platform,
            "content": f"✨ {topic}\n\nDescubre cómo esto puede cambiar tu perspectiva. {tone.capitalize()} y directo al punto.\n\n¿Qué opinas? 💭",
            "hashtags": [f"#{topic.replace(' ', '')}", "#marketing", "#contenido"],
            "hook": f"¿Sabías esto sobre {topic}?",
            "cta": "¡Comenta tu opinión!",
            "best_time": "18:00-20:00",
            "warning": "API Key no configurada. Contenido de ejemplo."
        }
    }
    
    return fallback_templates.get(content_type, {
        "type": content_type,
        "content": f"Contenido de ejemplo sobre {topic} con tono {tone}.",
        "warning": "API Key no configurada. Contenido de ejemplo."
    })

def parse_email_from_text(text):
    return {
        "type": "email",
        "subject_line": "Email Marketing",
        "body": text,
        "cta": "Acción principal"
    }

def parse_social_from_text(text, platform):
    return {
        "type": "social_post",
        "platform": platform,
        "content": text,
        "hashtags": ["#marketing"]
    }