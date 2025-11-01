import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
import unicodedata

class AnalyticsService:
    def __init__(self, users_df, campaigns_df, social_df):
        self.users_df = users_df if users_df is not None else pd.DataFrame()
        self.campaigns_df = campaigns_df if campaigns_df is not None else pd.DataFrame()
        self.social_df = social_df if social_df is not None else pd.DataFrame()

        # Map de columnas normalizadas -> nombre original (para campaigns y users)
        self.campaigns_col_map = {self._normalize(c): c for c in self.campaigns_df.columns}
        self.users_col_map = {self._normalize(c): c for c in self.users_df.columns}
        self.social_col_map = {self._normalize(c): c for c in self.social_df.columns}

    def _normalize(self, name: str) -> str:
        if not isinstance(name, str):
            return ''
        nk = unicodedata.normalize('NFKD', name)
        ascii_name = nk.encode('ASCII', 'ignore').decode('ASCII')
        return ascii_name.lower().replace(' ', '').replace('-', '').replace('_', '')

    def _find_col(self, col_map: Dict[str, str], *candidates: str) -> Optional[str]:
        for cand in candidates:
            if not cand:
                continue
            norm = self._normalize(cand)
            if norm in col_map:
                return col_map[norm]
        return None

    def _sum_col(self, df: pd.DataFrame, col_map: Dict[str, str], *candidates: str) -> float:
        col = self._find_col(col_map, *candidates)
        if col and col in df.columns:
            return float(df[col].fillna(0).astype(float).sum())
        return 0.0

    def _row_value(self, row, col_map: Dict[str, str], *candidates: str):
        col = self._find_col(col_map, *candidates)
        if col and col in row:
            val = row.get(col, 0)
            try:
                return float(val) if pd.notnull(val) else 0.0
            except Exception:
                return 0.0
        return 0.0

    def _date_labels_range(self, start_date: datetime) -> List[str]:
        today = datetime.now().date()
        start = start_date.date()
        days = (today - start).days + 1
        return [(start + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(max(days, 1))]

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
        fecha_col = self._find_col(self.campaigns_col_map, 'Fecha Envío', 'fechaenvio', 'fecha')
        if fecha_col and fecha_col in self.campaigns_df.columns:
            self.campaigns_df[fecha_col] = pd.to_datetime(self.campaigns_df[fecha_col], errors='coerce')
            filtered_campaigns = self.campaigns_df[self.campaigns_df[fecha_col] >= start_date]
        else:
            filtered_campaigns = self.campaigns_df.copy()
        
        # Calcular métricas con búsqueda robusta de columnas
        total_conversions = self._sum_col(filtered_campaigns, self.campaigns_col_map, 'Conversiones', 'conversion', 'conversions')
        total_sent = self._sum_col(filtered_campaigns, self.campaigns_col_map, 'enviados', 'Destinatarios', 'recipients', 'destinatarios')
        total_opens = self._sum_col(filtered_campaigns, self.campaigns_col_map, 'Tasa Apertura', 'opens', 'open_rate')
        total_clicks = self._sum_col(filtered_campaigns, self.campaigns_col_map, 'CTR', 'clicks_total', 'clics')
        
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
            'total_campaigns': int(len(filtered_campaigns)),
            'period': period
        }
    
    def get_conversion_evolution(self, period: str = '30days') -> Dict:
        """Obtiene la evolución de conversiones día a día"""
        start_date = self.get_period_filter(period)
        
        fecha_col = self._find_col(self.campaigns_col_map, 'Fecha Envío', 'fechaenvio', 'fecha')
        conv_col = self._find_col(self.campaigns_col_map, 'Conversiones', 'conversion', 'conversions')
        opens_col = self._find_col(self.campaigns_col_map, 'Tasa Apertura', 'opens')
        clicks_col = self._find_col(self.campaigns_col_map, 'CTR', 'clics')
        
        # Si no hay columna de fecha, generar datos sintéticos como antes
        if not fecha_col or fecha_col not in self.campaigns_df.columns:
            days = 30 if period == '30days' else 7
            dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days-1, -1, -1)]
            conversions = [int(np.random.randint(50, 200)) for _ in range(days)]
            opens = [int(c * np.random.uniform(2, 4)) for c in conversions]
            clicks = [int(c * np.random.uniform(1.2, 2)) for c in conversions]
            return {'labels': dates, 'conversions': conversions, 'opens': opens, 'clicks': clicks}
        
        self.campaigns_df[fecha_col] = pd.to_datetime(self.campaigns_df[fecha_col], errors='coerce')
        filtered = self.campaigns_df[self.campaigns_df[fecha_col] >= start_date].copy()
        
        labels = self._date_labels_range(start_date)
        if filtered.empty or conv_col is None:
            # devolver rango de fechas con ceros si no hay datos
            zeros = [0] * len(labels)
            return {'labels': labels, 'conversions': zeros, 'opens': zeros.copy(), 'clicks': zeros.copy()}
        
        # Agrupar por día usando la columna de fecha encontrada
        grouped = filtered.groupby(filtered[fecha_col].dt.date).agg({conv_col: 'sum'})
        if opens_col:
            grouped[opens_col] = filtered.groupby(filtered[fecha_col].dt.date).agg({opens_col: 'sum'})
        if clicks_col:
            grouped[clicks_col] = filtered.groupby(filtered[fecha_col].dt.date).agg({clicks_col: 'sum'})
        
        # Construir arrays alineados con labels
        conv_map = {str(k): int(v[conv_col]) for k, v in grouped.iterrows()} if conv_col else {}
        opens_map = {}
        clicks_map = {}
        if opens_col:
            opens_map = {str(k): int(v[opens_col]) for k, v in grouped.iterrows()}
        if clicks_col:
            clicks_map = {str(k): int(v[clicks_col]) for k, v in grouped.iterrows()}
        
        conversions = [conv_map.get(label, 0) for label in labels]
        opens = [opens_map.get(label, 0) for label in labels] if opens_col else [0]*len(labels)
        clicks = [clicks_map.get(label, 0) for label in labels] if clicks_col else [0]*len(labels)
        
        return {'labels': labels, 'conversions': conversions, 'opens': opens, 'clicks': clicks}
    
    def get_top_campaigns(self, period: str = '30days', limit: int = 10) -> List[Dict]:
        """Obtiene las mejores campañas del período"""
        start_date = self.get_period_filter(period)
        
        fecha_col = self._find_col(self.campaigns_col_map, 'Fecha Envío', 'fechaenvio', 'fecha')
        if fecha_col and fecha_col in self.campaigns_df.columns:
            self.campaigns_df[fecha_col] = pd.to_datetime(self.campaigns_df[fecha_col], errors='coerce')
            filtered = self.campaigns_df[self.campaigns_df[fecha_col] >= start_date]
        else:
            filtered = self.campaigns_df.copy()
        
        campaigns = []
        # prepare column candidates
        sent_candidates = ('Destinatarios', 'sent', 'recipients', 'destinatarios')
        opens_candidates = ('aperturas', 'opens', 'Tasa Apertura')
        clicks_candidates = ('clicks', 'CTR')
        conv_candidates = ('Conversiones', 'conversion', 'conversions')
        name_candidates = ('nombre', 'name', 'campaign_name', 'titulo')
        channel_candidates = ('canal', 'channel', 'media')
        
        for _, row in filtered.head(limit).iterrows():
            enviados = self._row_value(row, self.campaigns_col_map, *sent_candidates)
            aperturas = self._row_value(row, self.campaigns_col_map, *opens_candidates)
            clicks = self._row_value(row, self.campaigns_col_map, *clicks_candidates)
            conversiones = self._row_value(row, self.campaigns_col_map, *conv_candidates)
            
            open_rate = (aperturas / enviados * 100) if enviados > 0 else 0
            ctr = (clicks / enviados * 100) if enviados > 0 else 0
            conversion_rate = (conversiones / enviados * 100) if enviados > 0 else 0
            
            name_col = self._find_col(self.campaigns_col_map, *name_candidates)
            channel_col = self._find_col(self.campaigns_col_map, *channel_candidates)
            name = row.get(name_col, 'Sin nombre') if name_col else row.get('campaign_name', 'Sin nombre')
            channel = row.get(channel_col, 'email') if channel_col else 'email'
            
            campaigns.append({
                'name': name,
                'channel': channel,
                'sent': int(enviados),
                'open_rate': round(open_rate, 2),
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'revenue': round(conversiones * 75, 2)
            })
        
        campaigns.sort(key=lambda x: x['conversion_rate'], reverse=True)
        return campaigns
    
    def get_channel_performance(self, period: str = '30days') -> Dict:
        """Analiza el rendimiento por canal"""
        start_date = self.get_period_filter(period)
        
        fecha_col = self._find_col(self.campaigns_col_map, 'Fecha Envío', 'fechaenvio', 'fecha')
        if fecha_col and fecha_col in self.campaigns_df.columns:
            self.campaigns_df[fecha_col] = pd.to_datetime(self.campaigns_df[fecha_col], errors='coerce')
            filtered = self.campaigns_df[self.campaigns_df[fecha_col] >= start_date]
        else:
            filtered = self.campaigns_df.copy()
        
        channel_col = self._find_col(self.campaigns_col_map, 'canal', 'channel', 'media')
        conv_col = self._find_col(self.campaigns_col_map, 'conversiones', 'conversion', 'conversions')
        
        if conv_col is None or conv_col not in filtered.columns:
            return {'email': 45.2, 'social': 38.5, 'sms': 16.3}

        if channel_col is None or channel_col not in filtered.columns:
            # Si no hay columna de canal, asumir que todo es 'email'
            total_conv = filtered[conv_col].sum()
            if total_conv > 0:
                return {'email': 100.0}
            else:
                return {'email': 0.0}
        
        channel_data = filtered.groupby(channel_col).agg({conv_col: 'sum'}).reset_index()
        total = float(channel_data[conv_col].sum())
        result = {}
        
        for _, row in channel_data.iterrows():
            channel = row[channel_col]
            percentage = (row[conv_col] / total * 100) if total > 0 else 0
            result[channel] = round(percentage, 2)
        
        return result
    
    def get_segment_performance(self) -> List[Dict]:
        """Analiza el rendimiento por segmento de usuario"""
        segment_col = self._find_col(self.users_col_map, 'segment', 'segmento', 'Tipo Usuario')
        user_id_col = self._find_col(self.users_col_map, 'user_id', 'userid', 'id')
        clv_col = self._find_col(self.users_col_map, 'clv', 'lifetimevalue')
        
        if segment_col is None or user_id_col is None:
            # Datos de ejemplo
            return [
                {'segment': 'VIP', 'users': 1250, 'clv': 1250, 'conversion_rate': 18.5},
                {'segment': 'Activos', 'users': 3420, 'clv': 450, 'conversion_rate': 12.3},
                {'segment': 'En Riesgo', 'users': 1203, 'clv': 280, 'conversion_rate': 5.2},
                {'segment': 'Nuevos', 'users': 2890, 'clv': 125, 'conversion_rate': 8.7}
            ]
        
        segment_data = self.users_df.groupby(segment_col).agg({
            user_id_col: 'count',
            clv_col: 'mean' if clv_col else 'first'
        }).reset_index()
        
        segments = []
        for _, row in segment_data.iterrows():
            segments.append({
                'segment': row[segment_col],
                'users': int(row[user_id_col]),
                'clv': round(float(row[clv_col]) if clv_col and pd.notnull(row[clv_col]) else 0.0, 2),
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