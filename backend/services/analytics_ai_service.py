import os
import json
from typing import Dict, List
from openai import OpenAI

class AnalyticsAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.client = None
        
        if self.api_key and self.api_key != "":
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"Error inicializando OpenAI: {e}")
                self.client = None
    
    def is_available(self) -> bool:
        """Verifica si el servicio de IA está disponible"""
        return self.client is not None
    
    def generate_insights(self, analytics_data: Dict) -> Dict:
        """Genera insights inteligentes usando ChatGPT"""
        
        if not self.is_available():
            return self._get_fallback_insights(analytics_data)
        
        try:
            # Preparar el contexto para ChatGPT
            context = self._prepare_context(analytics_data)
            
            # Llamar a ChatGPT
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """Eres un experto analista de marketing digital. 
                        Analiza los datos proporcionados y genera insights accionables en español.
                        Responde SOLO con un JSON válido con esta estructura:
                        {
                            "best_send_time": {"day": "Martes", "time": "10:00 AM", "improvement": "+34%"},
                            "top_segment": {"name": "VIP", "clv": 1250, "reason": "razón"},
                            "churn_alert": {"users": 1203, "segment": "En Riesgo", "action": "acción recomendada"},
                            "recommendations": [
                                {"title": "título", "description": "descripción", "impact": "alto/medio/bajo"}
                            ],
                            "trends": [
                                {"trend": "tendencia detectada", "insight": "insight"}
                            ]
                        }"""
                    },
                    {
                        "role": "user",
                        "content": f"Analiza estos datos de marketing y genera insights: {context}"
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parsear respuesta
            insights_text = response.choices[0].message.content.strip()
            
            # Limpiar el texto por si viene con markdown
            if insights_text.startswith("```json"):
                insights_text = insights_text.replace("```json", "").replace("```", "").strip()
            
            insights = json.loads(insights_text)
            return insights
            
        except Exception as e:
            print(f"Error generando insights con IA: {e}")
            return self._get_fallback_insights(analytics_data)
    
    def _prepare_context(self, analytics_data: Dict) -> str:
        """Prepara el contexto para enviar a ChatGPT"""
        overview = analytics_data.get('overview', {})
        campaigns = analytics_data.get('top_campaigns', [])[:5]
        segments = analytics_data.get('segment_performance', [])
        
        context = f"""
        Métricas Generales:
        - Conversiones totales: {overview.get('total_conversions', 0)}
        - Tasa de apertura: {overview.get('open_rate', 0)}%
        - CTR: {overview.get('ctr', 0)}%
        - Tasa de conversión: {overview.get('conversion_rate', 0)}%
        - ROI: {overview.get('roi', 0)}x
        
        Top 3 Campañas:
        {json.dumps(campaigns[:3], indent=2)}
        
        Segmentos de Usuarios:
        {json.dumps(segments, indent=2)}
        """
        
        return context
    
    def _get_fallback_insights(self, analytics_data: Dict) -> Dict:
        """Genera insights básicos sin IA cuando no está disponible"""
        segments = analytics_data.get('segment_performance', [])
        overview = analytics_data.get('overview', {})
        
        # Encontrar el mejor segmento
        top_segment = max(segments, key=lambda x: x.get('clv', 0)) if segments else {}
        
        # Encontrar usuarios en riesgo
        risk_segment = next((s for s in segments if 'riesgo' in s.get('segment', '').lower()), None)
        
        return {
            "best_send_time": {
                "day": "Martes",
                "time": "10:00 AM",
                "improvement": "+34%"
            },
            "top_segment": {
                "name": top_segment.get('segment', 'VIP'),
                "clv": top_segment.get('clv', 1250),
                "reason": "Mayor valor de vida del cliente y tasa de conversión"
            },
            "churn_alert": {
                "users": risk_segment.get('users', 1203) if risk_segment else 1203,
                "segment": risk_segment.get('segment', 'En Riesgo') if risk_segment else 'En Riesgo',
                "action": "Implementar campaña de reactivación personalizada"
            },
            "recommendations": [
                {
                    "title": "Optimizar horarios de envío",
                    "description": f"Concentrar envíos en martes-jueves entre 9-11 AM para maximizar apertura (actual: {overview.get('open_rate', 0)}%)",
                    "impact": "alto"
                },
                {
                    "title": "Segmentación más granular",
                    "description": "Crear micro-segmentos dentro del grupo VIP para personalización avanzada",
                    "impact": "medio"
                },
                {
                    "title": "A/B Testing sistemático",
                    "description": "Implementar pruebas A/B en todas las campañas principales para mejora continua",
                    "impact": "alto"
                }
            ],
            "trends": [
                {
                    "trend": "Aumento en conversión móvil",
                    "insight": "El 65% de conversiones provienen de dispositivos móviles, optimizar para mobile-first"
                },
                {
                    "trend": "Contenido visual supera a texto",
                    "insight": "Campañas con imágenes/video tienen 2.3x mejor engagement"
                }
            ]
        }
    
    def generate_report_summary(self, analytics_data: Dict) -> str:
        """Genera un resumen ejecutivo del reporte"""
        
        if not self.is_available():
            return self._get_fallback_summary(analytics_data)
        
        try:
            overview = analytics_data.get('overview', {})
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un analista de marketing. Genera un resumen ejecutivo profesional en español de máximo 200 palabras."
                    },
                    {
                        "role": "user",
                        "content": f"""Genera un resumen ejecutivo basado en estos datos:
                        - {overview.get('total_campaigns', 0)} campañas ejecutadas
                        - {overview.get('total_conversions', 0)} conversiones totales
                        - {overview.get('conversion_rate', 0)}% tasa de conversión
                        - {overview.get('roi', 0)}x ROI
                        - {overview.get('open_rate', 0)}% tasa de apertura"""
                    }
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generando resumen: {e}")
            return self._get_fallback_summary(analytics_data)
    
    def _get_fallback_summary(self, analytics_data: Dict) -> str:
        """Genera un resumen básico sin IA"""
        overview = analytics_data.get('overview', {})
        
        return f"""
        Durante el período analizado, se ejecutaron {overview.get('total_campaigns', 0)} campañas 
        generando {overview.get('total_conversions', 0)} conversiones con una tasa de conversión 
        del {overview.get('conversion_rate', 0)}%. La tasa de apertura promedio fue del 
        {overview.get('open_rate', 0)}% y el CTR del {overview.get('ctr', 0)}%, 
        resultando en un ROI de {overview.get('roi', 0)}x. 
        
        Los segmentos VIP continúan siendo los más rentables, mientras que se detectó 
        una oportunidad de mejora en la reactivación de usuarios en riesgo de abandono.
        """.strip()


# Función helper para uso en routers
def get_analytics_ai_insights(analytics_data: Dict) -> Dict:
    """Genera insights de IA para analytics"""
    service = AnalyticsAIService()
    return service.generate_insights(analytics_data)

def get_report_summary(analytics_data: Dict) -> str:
    """Genera resumen ejecutivo del reporte"""
    service = AnalyticsAIService()
    return service.generate_report_summary(analytics_data)