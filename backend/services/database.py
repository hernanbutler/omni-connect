import sqlite3
from datetime import datetime
import json
from typing import List, Optional, Dict, Any
import uuid

class AutomationDB:
    def __init__(self, db_path: str = "automation.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Inicializa las tablas necesarias"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Tabla de flujos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS automation_flows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'draft',
                trigger_type TEXT NOT NULL,
                steps TEXT NOT NULL,
                users_in_flow INTEGER DEFAULT 0,
                total_completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabla de ejecuciones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS flow_executions (
                id TEXT PRIMARY KEY,
                flow_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                current_step_id TEXT NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed BOOLEAN DEFAULT 0,
                metadata TEXT,
                FOREIGN KEY (flow_id) REFERENCES automation_flows(id)
            )
        """)
        
        # Tabla de métricas por flujo
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS flow_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flow_id TEXT NOT NULL,
                date DATE DEFAULT CURRENT_DATE,
                users_active INTEGER DEFAULT 0,
                users_completed INTEGER DEFAULT 0,
                emails_sent INTEGER DEFAULT 0,
                emails_opened INTEGER DEFAULT 0,
                emails_clicked INTEGER DEFAULT 0,
                conversions INTEGER DEFAULT 0,
                revenue_generated REAL DEFAULT 0,
                FOREIGN KEY (flow_id) REFERENCES automation_flows(id)
            )
        """)
        
        # Tabla de plantillas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS flow_templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                icon TEXT,
                rating REAL DEFAULT 4.5,
                setup_time_minutes INTEGER,
                trigger_type TEXT,
                steps TEXT NOT NULL,
                is_popular BOOLEAN DEFAULT 0,
                uses_ai BOOLEAN DEFAULT 0
            )
        """)
        
        conn.commit()
        conn.close()
        
        # Insertar datos de ejemplo si la BD está vacía
        self._insert_sample_data()
    
    def _insert_sample_data(self):
        """Inserta flujos y plantillas de ejemplo"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Verificar si ya hay datos
        cursor.execute("SELECT COUNT(*) as count FROM automation_flows")
        if cursor.fetchone()['count'] > 0:
            conn.close()
            return
        
        # Flujo 1: Bienvenida
        flow1_steps = json.dumps([
            {
                "step_id": "step1",
                "type": "trigger",
                "name": "Nuevo registro",
                "config": {"trigger_type": "new_user"},
                "next_steps": ["step2"]
            },
            {
                "step_id": "step2",
                "type": "email",
                "name": "Email bienvenida",
                "config": {
                    "subject": "¡Bienvenido a OmniMark!",
                    "content": "Gracias por unirte. Aquí está tu guía de inicio..."
                },
                "next_steps": ["step3"]
            },
            {
                "step_id": "step3",
                "type": "delay",
                "name": "Espera 2 días",
                "config": {"hours": 48},
                "next_steps": ["step4"]
            },
            {
                "step_id": "step4",
                "type": "email",
                "name": "Tips de uso",
                "config": {
                    "subject": "3 tips para aprovechar OmniMark",
                    "content": "Hola, aquí te compartimos..."
                },
                "next_steps": []
            }
        ])
        
        cursor.execute("""
            INSERT INTO automation_flows (id, name, description, status, trigger_type, steps, users_in_flow, total_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            "Bienvenida Nuevos Clientes",
            "Secuencia de 5 emails + 3 posts sociales durante 14 días",
            "active",
            "new_user",
            flow1_steps,
            847,
            1240
        ))
        
        # Flujo 2: Carrito abandonado
        flow2_steps = json.dumps([
            {
                "step_id": "step1",
                "type": "trigger",
                "name": "Carrito abandonado",
                "config": {"trigger_type": "cart_abandoned", "delay_hours": 2},
                "next_steps": ["step2"]
            },
            {
                "step_id": "step2",
                "type": "email",
                "name": "Recordatorio 1",
                "config": {
                    "subject": "¡No olvides tu carrito!",
                    "content": "Tus productos te esperan..."
                },
                "next_steps": ["step3"]
            },
            {
                "step_id": "step3",
                "type": "delay",
                "name": "Espera 24 horas",
                "config": {"hours": 24},
                "next_steps": ["step4"]
            },
            {
                "step_id": "step4",
                "type": "email",
                "name": "Recordatorio con descuento",
                "config": {
                    "subject": "10% OFF en tu carrito",
                    "content": "Última oportunidad..."
                },
                "next_steps": []
            }
        ])
        
        cursor.execute("""
            INSERT INTO automation_flows (id, name, description, status, trigger_type, steps, users_in_flow, total_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            "Recuperación de Carrito",
            "3 recordatorios automáticos en 72 horas",
            "paused",
            "cart_abandoned",
            flow2_steps,
            0,
            342
        ))
        
        # Plantillas
        template1_steps = json.dumps([
            {
                "step_id": "step1",
                "type": "trigger",
                "name": "Usuario refiere amigo",
                "config": {"trigger_type": "custom"},
                "next_steps": ["step2"]
            },
            {
                "step_id": "step2",
                "type": "email",
                "name": "Agradecimiento",
                "config": {
                    "subject": "¡Gracias por recomendar!",
                    "content": "Has ganado puntos..."
                },
                "next_steps": []
            }
        ])
        
        cursor.execute("""
            INSERT INTO flow_templates (id, name, description, category, icon, rating, setup_time_minutes, trigger_type, steps, is_popular, uses_ai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            "Programa de Referidos",
            "Incentiva a clientes a recomendar tu marca con recompensas automáticas",
            "engagement",
            "bx-gift",
            4.8,
            30,
            "custom",
            template1_steps,
            1,
            0
        ))
        
        conn.commit()
        conn.close()
    
    # CRUD Operations para Flows
    def create_flow(self, flow_data: Dict[str, Any]) -> str:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        flow_id = str(uuid.uuid4())
        steps_json = json.dumps(flow_data['steps'])
        
        cursor.execute("""
            INSERT INTO automation_flows (id, name, description, status, trigger_type, steps)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            flow_id,
            flow_data['name'],
            flow_data['description'],
            flow_data.get('status', 'draft'),
            flow_data['trigger_type'],
            steps_json
        ))
        
        conn.commit()
        conn.close()
        return flow_id
    
    def get_flow(self, flow_id: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM automation_flows WHERE id = ?", (flow_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'status': row['status'],
                'trigger_type': row['trigger_type'],
                'steps': json.loads(row['steps']),
                'users_in_flow': row['users_in_flow'],
                'total_completed': row['total_completed'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        return None
    
    def get_all_flows(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM automation_flows ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        flows = []
        for row in rows:
            flows.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'status': row['status'],
                'trigger_type': row['trigger_type'],
                'steps': json.loads(row['steps']),
                'users_in_flow': row['users_in_flow'],
                'total_completed': row['total_completed'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })
        return flows
    
    def update_flow(self, flow_id: str, update_data: Dict[str, Any]) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        fields = []
        values = []
        
        if 'name' in update_data:
            fields.append("name = ?")
            values.append(update_data['name'])
        
        if 'description' in update_data:
            fields.append("description = ?")
            values.append(update_data['description'])
        
        if 'status' in update_data:
            fields.append("status = ?")
            values.append(update_data['status'])
        
        if 'steps' in update_data:
            fields.append("steps = ?")
            values.append(json.dumps(update_data['steps']))
        
        fields.append("updated_at = ?")
        values.append(datetime.now().isoformat())
        
        values.append(flow_id)
        
        query = f"UPDATE automation_flows SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, values)
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success
    
    def delete_flow(self, flow_id: str) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM automation_flows WHERE id = ?", (flow_id,))
        success = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        return success
    
    def get_templates(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM flow_templates")
        rows = cursor.fetchall()
        conn.close()
        
        templates = []
        for row in rows:
            templates.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'category': row['category'],
                'icon': row['icon'],
                'rating': row['rating'],
                'setup_time_minutes': row['setup_time_minutes'],
                'trigger_type': row['trigger_type'],
                'steps': json.loads(row['steps']),
                'is_popular': bool(row['is_popular']),
                'uses_ai': bool(row['uses_ai'])
            })
        return templates
    
    def get_flow_metrics(self, flow_id: str) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Obtener métricas agregadas
        cursor.execute("""
            SELECT 
                SUM(emails_sent) as total_sent,
                SUM(emails_opened) as total_opened,
                SUM(emails_clicked) as total_clicked,
                SUM(conversions) as total_conversions,
                SUM(revenue_generated) as total_revenue
            FROM flow_metrics
            WHERE flow_id = ?
        """, (flow_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row and row['total_sent']:
            return {
                'flow_id': flow_id,
                'total_sent': row['total_sent'],
                'open_rate': (row['total_opened'] / row['total_sent'] * 100) if row['total_sent'] > 0 else 0,
                'click_rate': (row['total_clicked'] / row['total_sent'] * 100) if row['total_sent'] > 0 else 0,
                'conversion_rate': (row['total_conversions'] / row['total_sent'] * 100) if row['total_sent'] > 0 else 0,
                'revenue_generated': row['total_revenue'] or 0
            }
        
        return {
            'flow_id': flow_id,
            'total_sent': 0,
            'open_rate': 0,
            'click_rate': 0,
            'conversion_rate': 0,
            'revenue_generated': 0
        }