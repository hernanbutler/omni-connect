import os
import openai
from typing import List, Dict, Any, Optional
import json

class AutomationAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if self.api_key:
            openai.api_key = self.api_key
        self.model = "gpt-4o-mini"  # Modelo económico y rápido
    
    def is_configured(self) -> bool:
        """Verifica si la API key está configurada"""
        return bool(self.api_key and self.api_key != "default_key_for_development")
    
    def optimize_subject_lines(self, flow_data: Dict[str, Any], context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Genera variaciones optimizadas de subject lines usando IA
        """
        if not self.is_configured():
            return self._get_fallback_subject_optimization()
        
        # Extraer emails del flujo
        email_steps = [step for step in flow_data.get('steps', []) if step['type'] == 'email']
        
        if not email_steps:
            return {'status': 'error', 'message': 'No hay emails en este flujo'}
        
        optimizations = []
        
        for email_step in email_steps:
            original_subject = email_step['config'].get('subject', '')
            
            try:
                prompt = f"""Eres un experto en email marketing. Genera 3 variaciones optimizadas del siguiente subject line para mejorar la tasa de apertura.

Subject line original: "{original_subject}"

Contexto del flujo: {flow_data.get('name', '')} - {flow_data.get('description', '')}

Genera 3 variaciones que:
1. Sean más persuasivas
2. Generen curiosidad
3. Sean más personales o emocionales

Formato de respuesta JSON:
{{
    "variants": [
        {{"subject": "variación 1", "strategy": "persuasión"}},
        {{"subject": "variación 2", "strategy": "curiosidad"}},
        {{"subject": "variación 3", "strategy": "emocional"}}
    ],
    "recommendation": "Explicación breve de cuál usar y por qué"
}}"""

                response = openai.ChatCompletion.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "Eres un experto en email marketing y copywriting."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.8,
                    max_tokens=500
                )
                
                result = json.loads(response.choices[0].message.content)
                
                optimizations.append({
                    'step_id': email_step['step_id'],
                    'step_name': email_step['name'],
                    'original_subject': original_subject,
                    'variants': result['variants'],
                    'recommendation': result['recommendation']
                })
                
            except Exception as e:
                print(f"Error optimizando subject line: {e}")
                optimizations.append({
                    'step_id': email_step['step_id'],
                    'error': str(e)
                })
        
        return {
            'flow_id': flow_data.get('id'),
            'flow_name': flow_data.get('name'),
            'optimizations': optimizations,
            'predicted_improvement': '15-25%'
        }
    
    def predict_best_timing(self, user_data: Dict[str, Any], flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predice el mejor momento para enviar mensajes a un usuario específico
        """
        if not self.is_configured():
            return self._get_fallback_timing_prediction()
        
        try:
            # Preparar datos del usuario para el análisis
            user_context = f"""
Usuario:
- Historial de aperturas: {user_data.get('open_history', 'No disponible')}
- Zona horaria: {user_data.get('timezone', 'America/Lima')}
- Engagement promedio: {user_data.get('avg_engagement', 'Medio')}
- Tipo de cliente: {user_data.get('customer_type', 'Regular')}

Flujo:
- Nombre: {flow_data.get('name')}
- Tipo: {flow_data.get('trigger_type')}
- Descripción: {flow_data.get('description')}
"""

            prompt = f"""Basándote en el perfil del usuario y el tipo de flujo, predice los mejores momentos para enviar mensajes.

{user_context}

Proporciona:
1. Mejor día de la semana
2. Mejor hora del día
3. Días/horas a evitar
4. Justificación basada en el contexto

Formato JSON:
{{
    "best_day": "Lunes",
    "best_hour": "10:00",
    "avoid_days": ["Sábado", "Domingo"],
    "avoid_hours": ["22:00-06:00"],
    "reasoning": "Explicación breve",
    "confidence": "alta/media/baja"
}}"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un especialista en timing de marketing y análisis de comportamiento."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=400
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                'user_id': user_data.get('user_id'),
                'flow_id': flow_data.get('id'),
                'timing_recommendation': result,
                'status': 'success'
            }
            
        except Exception as e:
            print(f"Error prediciendo timing: {e}")
            return self._get_fallback_timing_prediction()
    
    def analyze_flow_performance(self, flow_data: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analiza el rendimiento de un flujo y genera insights
        """
        if not self.is_configured():
            return self._get_fallback_performance_analysis()
        
        try:
            context = f"""
Flujo: {flow_data.get('name')}
Descripción: {flow_data.get('description')}
Estado: {flow_data.get('status')}

Métricas actuales:
- Tasa de apertura: {metrics.get('open_rate', 0):.1f}%
- Tasa de clicks: {metrics.get('click_rate', 0):.1f}%
- Tasa de conversión: {metrics.get('conversion_rate', 0):.1f}%
- Revenue generado: ${metrics.get('revenue_generated', 0):.2f}
- Usuarios activos: {flow_data.get('users_in_flow', 0)}

Pasos del flujo: {len(flow_data.get('steps', []))} pasos
"""

            prompt = f"""Analiza el rendimiento de este flujo de automatización y proporciona insights accionables.

{context}

Proporciona:
1. Evaluación general (excelente/bueno/regular/necesita mejoras)
2. 3-4 fortalezas identificadas
3. 3-4 oportunidades de mejora
4. Recomendaciones específicas y priorizadas
5. Predicción de mejora si se aplican cambios

Formato JSON:
{{
    "overall_rating": "bueno",
    "strengths": ["fortaleza 1", "fortaleza 2", ...],
    "improvements": ["mejora 1", "mejora 2", ...],
    "recommendations": [
        {{"priority": "alta", "action": "acción", "impact": "impacto esperado"}},
        ...
    ],
    "predicted_improvement": "15-20% en conversión"
}}"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en automatización de marketing y optimización de conversiones."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                'flow_id': flow_data.get('id'),
                'analysis': result,
                'status': 'success'
            }
            
        except Exception as e:
            print(f"Error analizando performance: {e}")
            return self._get_fallback_performance_analysis()
    
    def generate_content_variants(self, email_content: str, segment_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Genera variaciones de contenido adaptadas a diferentes segmentos
        """
        if not self.is_configured():
            return self._get_fallback_content_variants()
        
        try:
            prompt = f"""Adapta el siguiente contenido de email para diferentes segmentos de audiencia.

Contenido original:
{email_content}

Segmento objetivo:
- Tipo: {segment_info.get('type', 'General')}
- Características: {segment_info.get('characteristics', 'N/A')}
- Nivel de engagement: {segment_info.get('engagement_level', 'Medio')}

Genera 2 variaciones:
1. Una versión más directa y concisa
2. Una versión más detallada y educativa

Formato JSON:
{{
    "variants": [
        {{"version": "concisa", "content": "contenido", "use_case": "cuándo usar"}},
        {{"version": "detallada", "content": "contenido", "use_case": "cuándo usar"}}
    ],
    "personalization_tips": ["tip 1", "tip 2"]
}}"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en copywriting y personalización de contenido."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                'original_content': email_content,
                'variants': result['variants'],
                'personalization_tips': result['personalization_tips'],
                'status': 'success'
            }
            
        except Exception as e:
            print(f"Error generando variantes: {e}")
            return self._get_fallback_content_variants()
    
    def suggest_flow_improvements(self, flow_data: Dict[str, Any], industry: str = "general") -> Dict[str, Any]:
        """
        Sugiere mejoras estructurales para el flujo basado en mejores prácticas
        """
        if not self.is_configured():
            return self._get_fallback_flow_suggestions()
        
        try:
            steps_summary = [
                f"{step['type']}: {step['name']}" 
                for step in flow_data.get('steps', [])
            ]
            
            prompt = f"""Analiza este flujo de automatización y sugiere mejoras estructurales.

Flujo: {flow_data.get('name')}
Industria: {industry}
Trigger: {flow_data.get('trigger_type')}
Pasos actuales:
{chr(10).join(f"- {s}" for s in steps_summary)}

Proporciona:
1. Pasos que podrían agregarse
2. Pasos que podrían optimizarse
3. Mejores momentos para delays
4. Puntos de personalización adicionales

Formato JSON:
{{
    "add_steps": [
        {{"type": "tipo", "name": "nombre", "reason": "por qué agregarlo", "position": "después de X"}}
    ],
    "optimize_steps": [
        {{"step": "nombre del paso", "suggestion": "cómo optimizarlo"}}
    ],
    "delay_recommendations": [
        {{"between": "paso A y paso B", "suggested_hours": 24, "reason": "justificación"}}
    ],
    "personalization_opportunities": ["oportunidad 1", "oportunidad 2"]
}}"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en diseño de flujos de automatización de marketing."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                'flow_id': flow_data.get('id'),
                'suggestions': result,
                'status': 'success'
            }
            
        except Exception as e:
            print(f"Error generando sugerencias: {e}")
            return self._get_fallback_flow_suggestions()
    
    # Fallback methods (cuando no hay API key configurada)
    
    def _get_fallback_subject_optimization(self) -> Dict[str, Any]:
        return {
            'status': 'warning',
            'message': 'API Key de OpenAI no configurada',
            'optimizations': [{
                'original_subject': 'Subject line original',
                'variants': [
                    {'subject': 'Variante optimizada 1', 'strategy': 'persuasión'},
                    {'subject': 'Variante optimizada 2', 'strategy': 'curiosidad'},
                    {'subject': 'Variante optimizada 3', 'strategy': 'emocional'}
                ],
                'recommendation': 'Configura tu API Key de OpenAI para obtener optimizaciones personalizadas'
            }]
        }
    
    def _get_fallback_timing_prediction(self) -> Dict[str, Any]:
        return {
            'timing_recommendation': {
                'best_day': 'Martes',
                'best_hour': '10:00',
                'avoid_days': ['Sábado', 'Domingo'],
                'avoid_hours': ['22:00-06:00'],
                'reasoning': 'Basado en mejores prácticas generales de la industria',
                'confidence': 'media'
            },
            'status': 'fallback',
            'message': 'Usando recomendaciones genéricas. Configura OpenAI para análisis personalizado.'
        }
    
    def _get_fallback_performance_analysis(self) -> Dict[str, Any]:
        return {
            'analysis': {
                'overall_rating': 'bueno',
                'strengths': [
                    'Flujo está activo y procesando usuarios',
                    'Estructura básica correcta',
                    'Métricas están siendo rastreadas'
                ],
                'improvements': [
                    'Agregar más puntos de personalización',
                    'Implementar A/B testing de contenido',
                    'Optimizar timing de envíos'
                ],
                'recommendations': [
                    {'priority': 'alta', 'action': 'Configurar API de OpenAI', 'impact': 'Obtener análisis detallado'},
                    {'priority': 'media', 'action': 'Agregar delays estratégicos', 'impact': 'Mejorar engagement'}
                ],
                'predicted_improvement': 'Configura IA para predicciones precisas'
            },
            'status': 'fallback'
        }
    
    def _get_fallback_content_variants(self) -> Dict[str, Any]:
        return {
            'variants': [
                {'version': 'concisa', 'content': 'Versión corta del contenido', 'use_case': 'Usuarios con poco tiempo'},
                {'version': 'detallada', 'content': 'Versión extendida del contenido', 'use_case': 'Usuarios interesados en detalles'}
            ],
            'personalization_tips': [
                'Usa el nombre del usuario',
                'Referencias su historial de compras',
                'Adapta el tono según el segmento'
            ],
            'status': 'fallback',
            'message': 'Configura OpenAI para variaciones personalizadas'
        }
    
    def _get_fallback_flow_suggestions(self) -> Dict[str, Any]:
        return {
            'suggestions': {
                'add_steps': [
                    {'type': 'condition', 'name': 'Verificar engagement', 'reason': 'Segmentar flujo según respuesta', 'position': 'después del primer email'}
                ],
                'optimize_steps': [
                    {'step': 'Email inicial', 'suggestion': 'Agregar personalización dinámica'}
                ],
                'delay_recommendations': [
                    {'between': 'Email 1 y Email 2', 'suggested_hours': 48, 'reason': 'Dar tiempo para procesar información'}
                ],
                'personalization_opportunities': [
                    'Usar nombre del usuario',
                    'Referencias productos vistos',
                    'Adaptar horario de envío'
                ]
            },
            'status': 'fallback',
            'message': 'Configura OpenAI para sugerencias específicas'
        }