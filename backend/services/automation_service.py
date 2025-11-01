from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random
from .database import AutomationDB

class AutomationService:
    def __init__(self):
        self.db = AutomationDB()
    
    def get_all_flows(self) -> List[Dict[str, Any]]:
        """Obtiene todos los flujos con sus métricas calculadas"""
        flows = self.db.get_all_flows()
        
        # Enriquecer con métricas calculadas
        for flow in flows:
            metrics = self._calculate_flow_metrics(flow['id'])
            flow['metrics'] = metrics
        
        return flows
    
    def get_flow_by_id(self, flow_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene un flujo específico con sus métricas"""
        flow = self.db.get_flow(flow_id)
        if flow:
            flow['metrics'] = self._calculate_flow_metrics(flow_id)
        return flow
    
    def create_flow(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea un nuevo flujo de automatización"""
        # Validar estructura del flujo
        self._validate_flow_structure(flow_data)
        
        flow_id = self.db.create_flow(flow_data)
        
        return {
            'flow_id': flow_id,
            'status': 'success',
            'message': f'Flujo "{flow_data["name"]}" creado exitosamente'
        }
    
    def update_flow(self, flow_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Actualiza un flujo existente"""
        if 'steps' in update_data:
            self._validate_flow_structure({'steps': update_data['steps']})
        
        success = self.db.update_flow(flow_id, update_data)
        
        if success:
            return {
                'flow_id': flow_id,
                'status': 'success',
                'message': 'Flujo actualizado exitosamente'
            }
        else:
            return {
                'flow_id': flow_id,
                'status': 'error',
                'message': 'No se pudo actualizar el flujo'
            }
    
    def toggle_flow_status(self, flow_id: str) -> Dict[str, Any]:
        """Activa o pausa un flujo"""
        flow = self.db.get_flow(flow_id)
        
        if not flow:
            return {
                'status': 'error',
                'message': 'Flujo no encontrado'
            }
        
        new_status = 'paused' if flow['status'] == 'active' else 'active'
        
        self.db.update_flow(flow_id, {'status': new_status})
        
        return {
            'flow_id': flow_id,
            'status': new_status,
            'message': f'Flujo {"activado" if new_status == "active" else "pausado"} exitosamente'
        }
    
    def delete_flow(self, flow_id: str) -> Dict[str, Any]:
        """Elimina un flujo"""
        success = self.db.delete_flow(flow_id)
        
        if success:
            return {
                'status': 'success',
                'message': 'Flujo eliminado exitosamente'
            }
        else:
            return {
                'status': 'error',
                'message': 'No se pudo eliminar el flujo'
            }
    
    def get_templates(self) -> List[Dict[str, Any]]:
        """Obtiene plantillas de flujos predefinidas"""
        return self.db.get_templates()
    
    def create_flow_from_template(self, template_id: str, custom_name: Optional[str] = None) -> Dict[str, Any]:
        """Crea un flujo a partir de una plantilla"""
        templates = self.db.get_templates()
        template = next((t for t in templates if t['id'] == template_id), None)
        
        if not template:
            return {
                'status': 'error',
                'message': 'Plantilla no encontrada'
            }
        
        flow_data = {
            'name': custom_name or f"{template['name']} (Copia)",
            'description': template['description'],
            'trigger_type': template['trigger_type'],
            'steps': template['steps'],
            'status': 'draft'
        }
        
        return self.create_flow(flow_data)
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas generales para el dashboard"""
        flows = self.db.get_all_flows()
        
        active_flows = [f for f in flows if f['status'] == 'active']
        total_users_in_flows = sum(f['users_in_flow'] for f in active_flows)
        
        # Calcular métricas agregadas
        total_revenue = 0
        total_time_saved = 0
        
        for flow in active_flows:
            metrics = self.db.get_flow_metrics(flow['id'])
            total_revenue += metrics.get('revenue_generated', 0)
        
        # Estimación de tiempo ahorrado (heurística simple)
        total_time_saved = len(active_flows) * 23  # ~23 horas por flujo activo al mes
        
        return {
            'active_flows': len(active_flows),
            'total_users_in_flows': total_users_in_flows,
            'time_saved_hours': total_time_saved,
            'automated_revenue': total_revenue,
            'revenue_increase_vs_manual': 23  # Porcentaje promedio
        }
    
    def _calculate_flow_metrics(self, flow_id: str) -> Dict[str, Any]:
        """Calcula métricas de rendimiento para un flujo"""
        metrics = self.db.get_flow_metrics(flow_id)
        flow = self.db.get_flow(flow_id)
        
        if not flow:
            return metrics
        
        # Si no hay datos reales, generar métricas de ejemplo basadas en el tipo
        if metrics['total_sent'] == 0:
            # Generar métricas simuladas para demostración
            base_rates = {
                'new_user': {'open': 68, 'click': 23, 'conversion': 23},
                'cart_abandoned': {'open': 45, 'click': 12, 'conversion': 12},
                'inactive_user': {'open': 52, 'click': 18, 'conversion': 18},
                'purchase': {'open': 58, 'click': 28, 'conversion': 28},
                'birthday': {'open': 72, 'click': 35, 'conversion': 30}
            }
            
            trigger = flow['trigger_type']
            rates = base_rates.get(trigger, {'open': 50, 'click': 15, 'conversion': 10})
            
            metrics['open_rate'] = rates['open']
            metrics['click_rate'] = rates['click']
            metrics['conversion_rate'] = rates['conversion']
            
            # Revenue simulado
            if flow['users_in_flow'] > 0:
                avg_value = random.randint(50, 150)
                metrics['revenue_generated'] = flow['users_in_flow'] * (rates['conversion'] / 100) * avg_value
        
        return metrics
    
    def _validate_flow_structure(self, flow_data: Dict[str, Any]):
        """Valida que la estructura del flujo sea correcta"""
        if 'steps' not in flow_data or not flow_data['steps']:
            raise ValueError("El flujo debe tener al menos un paso")
        
        steps = flow_data['steps']
        
        # Debe tener al menos un trigger
        has_trigger = any(step['type'] == 'trigger' for step in steps)
        if not has_trigger:
            raise ValueError("El flujo debe tener al menos un trigger")
        
        # Validar que los step_ids sean únicos
        step_ids = [step['step_id'] for step in steps]
        if len(step_ids) != len(set(step_ids)):
            raise ValueError("Los step_ids deben ser únicos")
        
        # Validar que los next_steps existan
        for step in steps:
            for next_step_id in step.get('next_steps', []):
                if next_step_id not in step_ids:
                    raise ValueError(f"El paso {next_step_id} referenciado no existe")
        
        return True
    
    # Métodos para ejecución de flujos (lógica mecánica)
    
    def check_and_trigger_flows(self, user_data: Dict[str, Any], event_type: str):
        """
        Verifica si un evento del usuario debe activar algún flujo
        Esta función se llamaría desde otros módulos cuando ocurran eventos
        """
        active_flows = [f for f in self.db.get_all_flows() if f['status'] == 'active']
        
        for flow in active_flows:
            # Mapeo simple de eventos a triggers
            trigger_mapping = {
                'user_registered': 'new_user',
                'cart_abandoned': 'cart_abandoned',
                'purchase_completed': 'purchase',
                'user_birthday': 'birthday',
                'user_inactive': 'inactive_user'
            }
            
            if flow['trigger_type'] == trigger_mapping.get(event_type):
                self._start_flow_execution(flow['id'], user_data['user_id'])
    
    def _start_flow_execution(self, flow_id: str, user_id: str):
        """Inicia la ejecución de un flujo para un usuario específico"""
        flow = self.db.get_flow(flow_id)
        
        if not flow:
            return
        
        # Encontrar el primer paso (trigger)
        trigger_step = next((s for s in flow['steps'] if s['type'] == 'trigger'), None)
        
        if not trigger_step:
            return
        
        # Crear ejecución en la BD
        execution_data = {
            'flow_id': flow_id,
            'user_id': user_id,
            'current_step_id': trigger_step['step_id'],
            'started_at': datetime.now(),
            'last_action_at': datetime.now(),
            'metadata': {}
        }
        
        # Aquí se guardaría en la BD y se programarían los siguientes pasos
        # Por ahora solo simulamos el proceso
        
        return execution_data
    
    def process_scheduled_steps(self):
        """
        Procesa pasos programados que deben ejecutarse ahora
        Esta función se ejecutaría periódicamente (cada minuto, por ejemplo)
        """
        # Lógica para verificar ejecuciones pendientes y ejecutar acciones
        # Por ejemplo: enviar emails, publicar en redes sociales, etc.
        pass
    
    def execute_step(self, execution_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta un paso específico del flujo
        """
        step_type = step_data['type']
        
        if step_type == 'email':
            return self._execute_email_step(step_data)
        elif step_type == 'social_post':
            return self._execute_social_step(step_data)
        elif step_type == 'delay':
            return self._schedule_delay(execution_id, step_data)
        elif step_type == 'condition':
            return self._evaluate_condition(execution_id, step_data)
        
        return {'status': 'completed'}
    
    def _execute_email_step(self, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecuta el envío de un email (simulado)"""
        config = step_data['config']
        
        # Aquí se integraría con un servicio de email real
        # Por ahora simulamos el envío
        
        return {
            'status': 'sent',
            'subject': config.get('subject', ''),
            'timestamp': datetime.now().isoformat()
        }
    
    def _execute_social_step(self, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecuta la publicación en redes sociales (simulado)"""
        return {
            'status': 'posted',
            'timestamp': datetime.now().isoformat()
        }
    
    def _schedule_delay(self, execution_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Programa un delay antes del siguiente paso"""
        config = step_data['config']
        hours = config.get('hours', 0)
        
        next_execution_time = datetime.now() + timedelta(hours=hours)
        
        return {
            'status': 'scheduled',
            'next_execution': next_execution_time.isoformat()
        }
    
    def _evaluate_condition(self, execution_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa una condición y determina el siguiente paso"""
        config = step_data['config']
        
        # Aquí se evaluaría la condición real
        # Por ahora retornamos un resultado aleatorio
        
        condition_met = random.choice([True, False])
        next_step = config['true_next_step'] if condition_met else config['false_next_step']
        
        return {
            'status': 'evaluated',
            'condition_met': condition_met,
            'next_step_id': next_step
        }