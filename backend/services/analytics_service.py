import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

class AnalyticsService:
    def __init__(self, users_df, campaigns_df, social_df):
        self.users_df = users_df
        self.campaigns_df = campaigns_df
        self.social_df = social_df
    
    def get_period_filter(self, period: str) -> datetime:
        """Retorna la fecha de inicio según el período seleccionado"""
        today = datetime.now()
        
        period_map = {
            '7days': today - timedelta(days=7),
            '30days': today - timedelta(days=30),
            '3months': today - timedelta(days=90),
            'year': today - timedelta(days=365)
        }
        
        return period_map.get(period, today - timedelta(days=30))
    
    def get_overview_metrics(self, period: str = '30days') -> Dict:
        """Calcula métricas generales del período"""
        start_date = self.get_period_filter(period)
        
        # Convertir columnas de fecha si existen
        if 'fecha' in self.campaigns_df.columns:
            self.campaigns_df['fecha'] = pd.to_datetime(self.campaigns_df['fecha'])
            filtered_campaigns = self.campaigns_df[self.campaigns_df['fecha'] >= start_date]
        else:
            filtered_campaigns = self.campaigns_df
        
        # Calcular métricas
        total_conversions = filtered_campaigns['conversiones'].sum() if 'conversiones' in filtered_campaigns.columns else 0
        total_sent = filtered_campaigns['enviados'].sum() if 'enviados' in filtered_campaigns.columns else 0
        total_opens = filtered_campaigns['aperturas'].sum() if 'aperturas' in filtered_campaigns.columns else 0
        total_clicks = filtered_campaigns['clicks'].sum() if 'clicks' in filtered_campaigns.columns else 0
        
        # Tasas
        open_rate = (total_opens / total_sent * 100) if total_sent > 0 else 0
        ctr = (total_clicks / total_sent * 100) if total_sent > 0 else 0
        conversion_rate = (total_conversions / total_sent * 100) if total_sent > 0 else 0
        
        # ROI simulado (basado en conversiones)
        avg_order_value = 75  # Valor promedio de orden
        roi = (total_conversions * avg_order_value) / (total_sent * 0.05) if total_sent > 0 else 0
        
        return {
            'total_conversions': int(total_conversions),
            'total_sent': int(total_sent),
            'open_rate': round(open_rate, 2),
            'ctr': round(ctr, 2),
            'conversion_rate': round(conversion_rate, 2),
            'roi': round(roi, 2),
            'total_campaigns': len(filtered_campaigns),
            'period': period
        }
    
    def get_conversion_evolution(self, period: str = '30days') -> Dict:
        """Obtiene la evolución de conversiones día a día"""
        start_date = self.get_period_filter(period)
        
        if 'fecha' not in self.campaigns_df.columns:
            # Generar datos de ejemplo si no hay fecha
            days = 30 if period == '30days' else 7
            dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days-1, -1, -1)]
            conversions = [np.random.randint(50, 200) for _ in range(days)]
            
            return {
                'labels': dates,
                'conversions': conversions,
                'opens': [c * np.random.uniform(2, 4) for c in conversions],
                'clicks': [c * np.random.uniform(1.2, 2) for c in conversions]
            }
        
        self.campaigns_df['fecha'] = pd.to_datetime(self.campaigns_df['fecha'])
        filtered = self.campaigns_df[self.campaigns_df['fecha'] >= start_date]
        
        # Agrupar por día
        daily_data = filtered.groupby(filtered['fecha'].dt.date).agg({
            'conversiones': 'sum',
            'aperturas': 'sum',
            'clicks': 'sum'
        }).reset_index()
        
        return {
            'labels': [str(d) for d in daily_data['fecha'].tolist()],
            'conversions': daily_data['conversiones'].tolist(),
            'opens': daily_data['aperturas'].tolist(),
            'clicks': daily_data['clicks'].tolist()
        }
    
    def get_top_campaigns(self, period: str = '30days', limit: int = 10) -> List[Dict]:
        """Obtiene las mejores campañas del período"""
        start_date = self.get_period_filter(period)
        
        if 'fecha' in self.campaigns_df.columns:
            self.campaigns_df['fecha'] = pd.to_datetime(self.campaigns_df['fecha'])
            filtered = self.campaigns_df[self.campaigns_df['fecha'] >= start_date]
        else:
            filtered = self.campaigns_df
        
        # Calcular métricas por campaña
        campaigns = []
        for _, row in filtered.head(limit).iterrows():
            enviados = row.get('enviados', 0)
            aperturas = row.get('aperturas', 0)
            clicks = row.get('clicks', 0)
            conversiones = row.get('conversiones', 0)
            
            open_rate = (aperturas / enviados * 100) if enviados > 0 else 0
            ctr = (clicks / enviados * 100) if enviados > 0 else 0
            conversion_rate = (conversiones / enviados * 100) if enviados > 0 else 0
            
            campaigns.append({
                'name': row.get('nombre', row.get('campaign_name', 'Sin nombre')),
                'channel': row.get('canal', row.get('channel', 'email')),
                'sent': int(enviados),
                'open_rate': round(open_rate, 2),
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'revenue': round(conversiones * 75, 2)  # Valor promedio
            })
        
        # Ordenar por tasa de conversión
        campaigns.sort(key=lambda x: x['conversion_rate'], reverse=True)
        return campaigns
    
    def get_channel_performance(self, period: str = '30days') -> Dict:
        """Analiza el rendimiento por canal"""
        start_date = self.get_period_filter(period)
        
        if 'fecha' in self.campaigns_df.columns:
            self.campaigns_df['fecha'] = pd.to_datetime(self.campaigns_df['fecha'])
            filtered = self.campaigns_df[self.campaigns_df['fecha'] >= start_date]
        else:
            filtered = self.campaigns_df
        
        channel_col = 'canal' if 'canal' in filtered.columns else 'channel'
        
        if channel_col not in filtered.columns:
            return {'email': 45.2, 'social': 38.5, 'sms': 16.3}
        
        channel_data = filtered.groupby(channel_col).agg({
            'conversiones': 'sum'
        }).reset_index()
        
        total = channel_data['conversiones'].sum()
        result = {}
        
        for _, row in channel_data.iterrows():
            channel = row[channel_col]
            percentage = (row['conversiones'] / total * 100) if total > 0 else 0
            result[channel] = round(percentage, 2)
        
        return result
    
    def get_segment_performance(self) -> List[Dict]:
        """Analiza el rendimiento por segmento de usuario"""
        if 'segment' not in self.users_df.columns:
            # Datos de ejemplo
            return [
                {'segment': 'VIP', 'users': 1250, 'clv': 1250, 'conversion_rate': 18.5},
                {'segment': 'Activos', 'users': 3420, 'clv': 450, 'conversion_rate': 12.3},
                {'segment': 'En Riesgo', 'users': 1203, 'clv': 280, 'conversion_rate': 5.2},
                {'segment': 'Nuevos', 'users': 2890, 'clv': 125, 'conversion_rate': 8.7}
            ]
        
        segment_data = self.users_df.groupby('segment').agg({
            'user_id': 'count',
            'clv': 'mean'
        }).reset_index()
        
        segments = []
        for _, row in segment_data.iterrows():
            segments.append({
                'segment': row['segment'],
                'users': int(row['user_id']),
                'clv': round(row['clv'], 2),
                'conversion_rate': round(np.random.uniform(5, 20), 2)
            })
        
        return segments
    
    def prepare_export_data(self, period: str = '30days') -> pd.DataFrame:
        """Prepara datos para exportación"""
        overview = self.get_overview_metrics(period)
        campaigns = self.get_top_campaigns(period)
        
        # Crear DataFrame con resumen
        export_data = pd.DataFrame(campaigns)
        
        return export_data


def get_analytics_data(users_df, campaigns_df, social_df, period: str = '30days'):
    """Función principal para obtener todos los datos de analytics"""
    service = AnalyticsService(users_df, campaigns_df, social_df)
    
    return {
        'overview': service.get_overview_metrics(period),
        'conversion_evolution': service.get_conversion_evolution(period),
        'top_campaigns': service.get_top_campaigns(period),
        'channel_performance': service.get_channel_performance(period),
        'segment_performance': service.get_segment_performance()
    }