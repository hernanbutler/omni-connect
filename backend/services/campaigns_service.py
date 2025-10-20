from .. import data_handler
import pandas as pd
from datetime import datetime, timedelta

def get_campaigns_overview():
    """
    Calcula las métricas principales (KPIs) para la vista de campañas.
    """
    users_df, campaigns_df, social_df = data_handler.load_data()
    
    if campaigns_df is None:
        return {"error": "No se pudieron cargar los datos de campañas."}
    
    # Convertir fecha a datetime (usar inferencia y tolerar formatos inconsistentes)
    campaigns_df['Fecha Envío'] = pd.to_datetime(campaigns_df['Fecha Envío'], errors='coerce')

    # Si todas las fechas son NaT, devolver error claro
    if campaigns_df['Fecha Envío'].isna().all():
        return {"error": "Formato de fecha inválido en campanas_email.csv"}
    
    # Fecha actual y mes anterior
    current_date = datetime(2025, 10, 18)  # Fecha actual del sistema
    last_month = current_date - timedelta(days=30)
    two_months_ago = current_date - timedelta(days=60)
    
    # Filtrar campañas del último mes y mes anterior
    current_month_campaigns = campaigns_df[campaigns_df['Fecha Envío'] >= last_month]
    previous_month_campaigns = campaigns_df[
        (campaigns_df['Fecha Envío'] >= two_months_ago) & 
        (campaigns_df['Fecha Envío'] < last_month)
    ]
    
    # Calcular métricas del mes actual
    total_emails_sent = int(current_month_campaigns['Destinatarios'].sum())
    avg_open_rate = round(current_month_campaigns['Tasa Apertura'].mean(), 2)
    avg_ctr = round(current_month_campaigns['CTR'].mean(), 2)
    
    # Calcular tasa de rebote (simulada como inversa de tasa de apertura)
    avg_bounce_rate = round((100 - avg_open_rate) * 0.025, 2)  # Ajuste para valores realistas
    
    # Calcular métricas del mes anterior para comparación
    prev_total_emails = int(previous_month_campaigns['Destinatarios'].sum()) if len(previous_month_campaigns) > 0 else total_emails_sent
    prev_open_rate = previous_month_campaigns['Tasa Apertura'].mean() if len(previous_month_campaigns) > 0 else avg_open_rate
    prev_ctr = previous_month_campaigns['CTR'].mean() if len(previous_month_campaigns) > 0 else avg_ctr
    prev_bounce_rate = (100 - prev_open_rate) * 0.025 if len(previous_month_campaigns) > 0 else avg_bounce_rate
    
    # Calcular tendencias
    # Evitar divisiones por cero en tendencias
    emails_trend = round(((total_emails_sent - prev_total_emails) / prev_total_emails * 100), 1) if prev_total_emails > 0 else 0
    open_rate_trend = round(((avg_open_rate - prev_open_rate) / prev_open_rate * 100), 1) if prev_open_rate and prev_open_rate > 0 else 0
    ctr_trend = round(((avg_ctr - prev_ctr) / prev_ctr * 100), 1) if prev_ctr and prev_ctr > 0 else 0
    bounce_trend = round(((avg_bounce_rate - prev_bounce_rate) / prev_bounce_rate * 100), 1) if prev_bounce_rate and prev_bounce_rate > 0 else 0
    
    return {
        "emails_sent": total_emails_sent,
        "emails_trend": emails_trend,
        "open_rate": avg_open_rate,
        "open_rate_trend": open_rate_trend,
        "ctr": avg_ctr,
        "ctr_trend": ctr_trend,
        "bounce_rate": round(avg_bounce_rate, 1),
        "bounce_trend": bounce_trend
    }


def get_active_campaigns():
    """
    Obtiene las campañas activas, programadas y recientes.
    """
    users_df, campaigns_df, social_df = data_handler.load_data()
    
    if campaigns_df is None:
        return {"error": "No se pudieron cargar los datos de campañas."}
    
    # Convertir fecha a datetime (tolerar formatos inconsistentes)
    campaigns_df['Fecha Envío'] = pd.to_datetime(campaigns_df['Fecha Envío'], errors='coerce')

    # Eliminar filas sin fecha válida para evitar errores al restar
    campaigns_df = campaigns_df.dropna(subset=['Fecha Envío'])

    if campaigns_df.empty:
        return {"campaigns": []}

    current_date = datetime(2025, 10, 18)

    # Ordenar por fecha descendente
    campaigns_df = campaigns_df.sort_values('Fecha Envío', ascending=False)
    
    # Tomar las últimas 6 campañas
    recent_campaigns = campaigns_df.head(6)
    
    campaigns_list = []
    
    for idx, row in recent_campaigns.iterrows():
        days_diff = (current_date - row['Fecha Envío']).days
        
        # Determinar status
        if days_diff < 0:
            status = "Programada"
            time_info = f"Envío: {abs(days_diff)} días"
        elif days_diff <= 7:
            status = "Activa"
            time_info = f"Enviada hace {days_diff} día{'s' if days_diff != 1 else ''}"
        else:
            status = "Completada"
            time_info = f"Enviada hace {days_diff} días"
        
        # Seguridad: asegurar valores numéricos y evitar división por cero
        recipients = int(row['Destinatarios']) if pd.notna(row['Destinatarios']) else 0
        conversions = int(row['Conversiones']) if pd.notna(row['Conversiones']) else 0
        open_rate_val = float(row['Tasa Apertura']) if pd.notna(row['Tasa Apertura']) else 0.0
        ctr_val = float(row['CTR']) if pd.notna(row['CTR']) else 0.0
        revenue_val = float(row['Revenue']) if pd.notna(row['Revenue']) else 0.0

        conversion_rate = round((conversions / recipients * 100), 1) if recipients > 0 else 0

        campaign = {
            "id": row['ID'],
            "name": row['Nombre'],
            "status": status,
            "recipients": recipients,
            "time_info": time_info,
            "open_rate": round(open_rate_val, 1),
            "ctr": round(ctr_val, 1),
            "conversion_rate": conversion_rate,
            "revenue": round(revenue_val, 2),
            "date": row['Fecha Envío'].strftime('%Y-%m-%d')
        }
        
        campaigns_list.append(campaign)
    
    return {"campaigns": campaigns_list}


def get_campaign_templates():
    """
    Genera plantillas basadas en campañas exitosas.
    """
    users_df, campaigns_df, social_df = data_handler.load_data()
    
    if campaigns_df is None:
        return {"error": "No se pudieron cargar los datos de campañas."}
    
    # Calcular promedios
    avg_ctr = campaigns_df['CTR'].mean()
    avg_open_rate = campaigns_df['Tasa Apertura'].mean()
    
    # Identificar campañas exitosas (CTR y Open Rate por encima del promedio)
    successful_campaigns = campaigns_df[
        (campaigns_df['CTR'] > avg_ctr) & 
        (campaigns_df['Tasa Apertura'] > avg_open_rate)
    ]
    
    # Extraer patrones de nombres
    templates = []
    
    # Plantilla 1: Newsletter
    newsletter_campaigns = campaigns_df[campaigns_df['Nombre'].str.contains('Novedades|Newsletter', case=False, na=False)]
    if len(newsletter_campaigns) > 0:
        templates.append({
            "name": "Newsletter Semanal",
            "description": "Ideal para mantener informados a tus suscriptores con novedades y contenido relevante",
            "avg_open_rate": round(newsletter_campaigns['Tasa Apertura'].mean(), 1),
            "avg_ctr": round(newsletter_campaigns['CTR'].mean(), 1),
            "icon": "bx-news",
            "type": "informativa"
        })
    
    # Plantilla 2: Promocional
    promo_campaigns = campaigns_df[campaigns_df['Nombre'].str.contains('Últimas|aprovecha|Descuento|Oferta', case=False, na=False)]
    if len(promo_campaigns) > 0:
        templates.append({
            "name": "Campaña Promocional",
            "description": "Perfecta para ofertas especiales, descuentos y lanzamientos de productos",
            "avg_open_rate": round(promo_campaigns['Tasa Apertura'].mean(), 1),
            "avg_ctr": round(promo_campaigns['CTR'].mean(), 1),
            "icon": "bx-purchase-tag",
            "type": "promocional"
        })
    
    # Plantilla 3: Re-engagement
    reengagement_campaigns = campaigns_df[campaigns_df['Nombre'].str.contains('extrañamos|vuelve|regresa', case=False, na=False)]
    if len(reengagement_campaigns) > 0:
        templates.append({
            "name": "Campaña de Reactivación",
            "description": "Diseñada para recuperar clientes inactivos con incentivos especiales",
            "avg_open_rate": round(reengagement_campaigns['Tasa Apertura'].mean(), 1),
            "avg_ctr": round(reengagement_campaigns['CTR'].mean(), 1),
            "icon": "bx-refresh",
            "type": "reactivacion"
        })
    
    # Si no hay suficientes plantillas, agregar genéricas
    if len(templates) < 3:
        templates.append({
            "name": "Bienvenida Nuevos Suscriptores",
            "description": "Primera impresión perfecta para nuevos usuarios en tu lista",
            "avg_open_rate": round(avg_open_rate * 1.2, 1),  # Asumimos 20% más
            "avg_ctr": round(avg_ctr * 1.15, 1),
            "icon": "bx-party",
            "type": "bienvenida"
        })
    
    return {"templates": templates}


def get_campaign_detail(campaign_id):
    """
    Obtiene detalles de una campaña específica.
    """
    users_df, campaigns_df, social_df = data_handler.load_data()
    
    if campaigns_df is None:
        return {"error": "No se pudieron cargar los datos de campañas."}
    
    campaign = campaigns_df[campaigns_df['ID'] == campaign_id]
    
    if len(campaign) == 0:
        return {"error": "Campaña no encontrada"}
    
    campaign = campaign.iloc[0]
    
    return {
        "id": campaign['ID'],
        "name": campaign['Nombre'],
        "date": campaign['Fecha Envío'],
        "recipients": int(campaign['Destinatarios']),
        "open_rate": round(campaign['Tasa Apertura'], 2),
        "ctr": round(campaign['CTR'], 2),
        "conversions": int(campaign['Conversiones']),
        "revenue": round(campaign['Revenue'], 2)
    }