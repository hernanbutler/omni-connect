import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from .. import data_handler

def calculate_rfm_scores(users_df):
    """
    Calcula scores RFM (Recency, Frequency, Monetary) para cada usuario.
    Como no tenemos fecha de última compra, usamos inversión de Engagement y Riesgo Churn.
    """
    df = users_df.copy()
    
    # R (Recency) - Usar inversa del Riesgo Churn como proxy
    # Alto riesgo churn = baja recency
    df['R_Score'] = 100 - df['Riesgo Churn']
    
    # F (Frequency) - Total de Compras
    df['F_Score'] = df['Total Compras']
    
    # M (Monetary) - CLV (Customer Lifetime Value)
    df['M_Score'] = df['CLV']
    
    # Normalizar scores a escala 1-5
    for col in ['R_Score', 'F_Score', 'M_Score']:
        if df[col].max() > 0:
            df[col] = pd.qcut(df[col].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5])
        else:
            df[col] = 1
    
    # RFM Score combinado
    df['RFM_Score'] = df['R_Score'].astype(int) + df['F_Score'].astype(int) + df['M_Score'].astype(int)
    
    return df

def apply_kmeans_clustering(users_df, n_clusters=6):
    """
    Aplica K-Means clustering para segmentación automática.
    """
    df = users_df.copy()
    
    # Seleccionar features para clustering
    features = ['Engagement Score', 'Total Compras', 'CLV', 'Riesgo Churn']
    X = df[features].fillna(0)
    
    # Normalizar datos
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Aplicar K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['Cluster_AI'] = kmeans.fit_predict(X_scaled)
    
    return df, kmeans

def classify_segment(row):
    """
    Clasifica un usuario en un segmento basado en reglas de negocio + RFM.
    """
    # Regla 1: VIP/Champions (Alto valor, alta frecuencia, bajo riesgo)
    if row['CLV'] > 1000 and row['Total Compras'] >= 5 and row['Riesgo Churn'] < 30:
        return 'VIP Champions'
    
    # Regla 2: Leales (Compras regulares, engagement medio-alto)
    elif row['Total Compras'] >= 2 and row['Engagement Score'] > 40 and row['Riesgo Churn'] < 50:
        return 'Leales'
    
    # Regla 3: En Riesgo (Antes activos, ahora alto riesgo)
    elif row['Riesgo Churn'] >= 70:
        return 'En Riesgo'
    
    # Regla 4: Promesa (Nuevos con potencial - 1 compra, engagement alto)
    elif row['Total Compras'] == 1 and row['Engagement Score'] > 50:
        return 'Promesa'
    
    # Regla 5: Hibernando (Ocasionales, bajo engagement)
    elif row['Tipo Usuario'] == 'occasional' and row['Engagement Score'] < 30:
        return 'Hibernando'
    
    # Regla 6: Perdidos (Inactivos)
    elif row['Tipo Usuario'] == 'inactive' or (row['Total Compras'] == 0 and row['Engagement Score'] < 20):
        return 'Perdidos'
    
    # Default: Ocasionales
    else:
        return 'Ocasionales'

def get_segmentation_data():
    """
    Calcula los datos completos para la vista de segmentación.
    Incluye RFM, ML Clustering, y métricas avanzadas.
    """
    users_df, _, _ = data_handler.load_data()

    if users_df is None:
        return {"error": "No se pudieron cargar los datos de usuarios."}

    try:
        # Aplicar RFM Scoring
        users_df = calculate_rfm_scores(users_df)
        
        # Aplicar K-Means Clustering
        users_df, kmeans_model = apply_kmeans_clustering(users_df)
        
        # Clasificar en segmentos de negocio
        users_df['Segmento'] = users_df.apply(classify_segment, axis=1)
        
        # --- KPIs Generales ---
        total_clientes = int(users_df.shape[0])
        clv_total = users_df['CLV'].sum()
        clv_promedio = round(users_df[users_df['CLV'] > 0]['CLV'].mean(), 2) if users_df['CLV'].sum() > 0 else 0
        
        # Contar segmentos únicos
        segmentos_activos = users_df['Segmento'].nunique()
        segmentos_ia = users_df['Cluster_AI'].nunique()
        
        # --- Análisis por Segmento ---
        segments_summary = {}
        
        for segmento in users_df['Segmento'].unique():
            seg_data = users_df[users_df['Segmento'] == segmento]
            
            segments_summary[segmento] = {
                "usuarios": int(seg_data.shape[0]),
                "porcentaje": round(seg_data.shape[0] / total_clientes * 100, 1),
                "clv_promedio": round(seg_data['CLV'].mean(), 2),
                "clv_total": round(seg_data['CLV'].sum(), 2),
                "engagement_promedio": round(seg_data['Engagement Score'].mean(), 1),
                "riesgo_churn_promedio": round(seg_data['Riesgo Churn'].mean(), 1),
                "compras_promedio": round(seg_data['Total Compras'].mean(), 2),
                "rfm_score_promedio": round(seg_data['RFM_Score'].mean(), 1)
            }
        
        # --- Segmentos Específicos para la UI ---
        
        # 1. VIP Champions
        vip_segment = users_df[users_df['Segmento'] == 'VIP Champions']
        compradores_vip = {
            "usuarios": int(vip_segment.shape[0]),
            "porcentaje": round(vip_segment.shape[0] / total_clientes * 100, 1),
            "clv_promedio": round(vip_segment['CLV'].mean(), 2) if len(vip_segment) > 0 else 0,
            "clv_total": round(vip_segment['CLV'].sum(), 2),
            "engagement_promedio": round(vip_segment['Engagement Score'].mean(), 1) if len(vip_segment) > 0 else 0,
            "compras_promedio": round(vip_segment['Total Compras'].mean(), 2) if len(vip_segment) > 0 else 0
        }

        # 2. En Riesgo de Churn
        churn_segment = users_df[users_df['Segmento'] == 'En Riesgo']
        en_riesgo_churn = {
            "usuarios": int(churn_segment.shape[0]),
            "porcentaje": round(churn_segment.shape[0] / total_clientes * 100, 1),
            "clv_potencial_perdido": round(churn_segment['CLV'].sum(), 2),
            "riesgo_promedio": round(churn_segment['Riesgo Churn'].mean(), 1) if len(churn_segment) > 0 else 0,
            "engagement_promedio": round(churn_segment['Engagement Score'].mean(), 1) if len(churn_segment) > 0 else 0
        }

        # 3. Promesa (Alto Potencial)
        promesa_segment = users_df[users_df['Segmento'] == 'Promesa']
        promesa = {
            "usuarios": int(promesa_segment.shape[0]),
            "porcentaje": round(promesa_segment.shape[0] / total_clientes * 100, 1),
            "engagement_promedio": round(promesa_segment['Engagement Score'].mean(), 1) if len(promesa_segment) > 0 else 0,
            "clv_promedio": round(promesa_segment['CLV'].mean(), 2) if len(promesa_segment) > 0 else 0,
            "potencial_estimado": round(promesa_segment.shape[0] * clv_promedio, 2) if clv_promedio > 0 else 0
        }

        # 4. Leales
        leales_segment = users_df[users_df['Segmento'] == 'Leales']
        leales = {
            "usuarios": int(leales_segment.shape[0]),
            "porcentaje": round(leales_segment.shape[0] / total_clientes * 100, 1),
            "clv_promedio": round(leales_segment['CLV'].mean(), 2) if len(leales_segment) > 0 else 0,
            "engagement_promedio": round(leales_segment['Engagement Score'].mean(), 1) if len(leales_segment) > 0 else 0,
            "compras_promedio": round(leales_segment['Total Compras'].mean(), 2) if len(leales_segment) > 0 else 0
        }
        
        # 5. Hibernando
        hibernando_segment = users_df[users_df['Segmento'] == 'Hibernando']
        hibernando = {
            "usuarios": int(hibernando_segment.shape[0]),
            "porcentaje": round(hibernando_segment.shape[0] / total_clientes * 100, 1),
            "engagement_promedio": round(hibernando_segment['Engagement Score'].mean(), 1) if len(hibernando_segment) > 0 else 0,
            "potencial_recuperacion": round(hibernando_segment.shape[0] * (clv_promedio * 0.5), 2)
        }

        # 6. Perdidos
        perdidos_segment = users_df[users_df['Segmento'] == 'Perdidos']
        perdidos = {
            "usuarios": int(perdidos_segment.shape[0]),
            "porcentaje": round(perdidos_segment.shape[0] / total_clientes * 100, 1),
            "engagement_promedio": round(perdidos_segment['Engagement Score'].mean(), 1) if len(perdidos_segment) > 0 else 0,
            "valor_perdido": round(perdidos_segment['CLV'].sum(), 2)
        }
        
        # --- Datos para gráficos ---
        
        # Distribución de segmentos
        segment_distribution = users_df['Segmento'].value_counts().to_dict()
        segment_distribution_list = [
            {"segment": k, "count": int(v), "percentage": round(v/total_clientes*100, 1)} 
            for k, v in segment_distribution.items()
        ]
        
        # CLV por segmento
        clv_by_segment = users_df.groupby('Segmento')['CLV'].sum().to_dict()
        clv_by_segment_list = [
            {"segment": k, "clv_total": round(v, 2)} 
            for k, v in clv_by_segment.items()
        ]

        return {
            "status": "success",
            "kpis": {
                "total_clientes": total_clientes,
                "segmentos_activos": segmentos_activos,
                "clv_promedio": clv_promedio,
                "clv_total": round(clv_total, 2),
                "segmentos_ia": segmentos_ia
            },
            "segments": {
                "compradores_vip": compradores_vip,
                "en_riesgo_churn": en_riesgo_churn,
                "promesa": promesa,
                "leales": leales,
                "hibernando": hibernando,
                "perdidos": perdidos
            },
            "segments_summary": segments_summary,
            "charts": {
                "segment_distribution": segment_distribution_list,
                "clv_by_segment": clv_by_segment_list
            },
            "ml_info": {
                "kmeans_clusters": segmentos_ia,
                "rfm_calculated": True
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Error al procesar datos de segmentación: {str(e)}"
        }