import pandas as pd
from .. import data_handler

def get_dashboard_kpis():
    """Calcula los KPIs principales para el dashboard."""
    users_df, campaigns_df, social_df = data_handler.load_data()

    if users_df is None or campaigns_df is None or social_df is None:
        return {"error": "No se pudieron cargar los datos."}

    try:
        # KPI: Tasa de Apertura (promedio de campañas)
        avg_open_rate = campaigns_df['Tasa Apertura'].mean()

        # KPI: Conversiones (promedio de campañas)
        total_conversions = campaigns_df['Conversiones'].sum()
        total_recipients = campaigns_df['Destinatarios'].sum()
        avg_conversion_rate = (total_conversions / total_recipients * 100) if total_recipients > 0 else 0

        # KPI: Retención (calculado como % de usuarios no inactivos)
        total_users = len(users_df)
        active_users = users_df[users_df['Tipo Usuario'] != 'inactive'].shape[0]
        retention_rate = (active_users / total_users) * 100 if total_users > 0 else 0

        # KPI: CTR General (promedio de campañas)
        avg_ctr = campaigns_df['CTR'].mean()

        # Datos para el gráfico de rendimiento de canales (Revenue por mes)
        campaigns_df['Fecha Envío'] = pd.to_datetime(campaigns_df['Fecha Envío'], errors='coerce')
        campaigns_df['mes'] = campaigns_df['Fecha Envío'].dt.to_period('M')
        channel_performance = campaigns_df.groupby('mes')['Revenue'].sum().reset_index()
        channel_performance['mes'] = channel_performance['mes'].astype(str)
        channel_performance.rename(columns={'mes': 'month', 'Revenue': 'revenue'}, inplace=True)

        # Datos para el gráfico de engagement por red social
        social_engagement = social_df.groupby('Plataforma')['Engagement'].sum().reset_index()
        social_engagement.rename(columns={'Plataforma': 'platform', 'Engagement': 'engagement'}, inplace=True)

        return {
            "status": "success",
            "kpis": {
                "open_rate": round(avg_open_rate, 1),
                "conversion_rate": round(avg_conversion_rate, 1),
                "retention_rate": round(retention_rate, 1),
                "ctr_general": round(avg_ctr, 1)
            },
            "charts": {
                "channel_performance": channel_performance.to_dict('records'),
                "social_engagement": social_engagement.to_dict('records')
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Error al procesar datos: {str(e)}"
        }
