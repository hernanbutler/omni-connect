from .. import data_handler
import pandas as pd
from datetime import datetime, timedelta

def get_social_data():
    """
    Prepara los datos para la vista de Social.
    Calcula métricas y estadísticas de redes sociales.
    """
    users_df, campaigns_df, social_df = data_handler.load_data()
    
    if social_df is None:
        return {"error": "No se pudieron cargar los datos de redes sociales."}

    # Convertir fecha a datetime de forma robusta (aceptar varios formatos)
    def _parse_dates(series):
        # Intenta inferir formatos primero
        parsed = pd.to_datetime(series, infer_datetime_format=True, dayfirst=False, errors='coerce')

        # Si quedan valores inválidos, reintentar con formatos comunes
        if parsed.isna().any():
            for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y'):
                try:
                    alt = pd.to_datetime(series, format=fmt, errors='coerce')
                    # Usa los valores parseados cuando mejoran la cobertura
                    parsed = parsed.fillna(alt)
                except Exception:
                    # ignorar formatos que fallen
                    pass
        return parsed

    social_df['Fecha'] = _parse_dates(social_df['Fecha'])

    # Eliminar filas con fechas inválidas en caso de que queden (evita errores posteriores)
    invalid_count = social_df['Fecha'].isna().sum()
    if invalid_count > 0:
        # Opcional: podríamos loguear esto; por ahora simplemente descartamos filas inválidas
        social_df = social_df.dropna(subset=['Fecha']).reset_index(drop=True)
    
    # Calcular métricas por plataforma
    platform_stats = calculate_platform_stats(social_df)
    
    # Obtener publicaciones programadas y recientes
    upcoming_posts = get_upcoming_posts(social_df)
    recent_posts = get_recent_posts(social_df)
    
    # Calcular el mejor post
    top_post = get_top_performing_post(social_df)
    
    # Analizar mejores horarios por plataforma
    best_times = analyze_best_posting_times(social_df)
    
    # Calcular tendencias
    engagement_trends = calculate_engagement_trends(social_df)
    
    return {
        "platform_stats": platform_stats,
        "upcoming_posts": upcoming_posts,
        "recent_posts": recent_posts,
        "top_post": top_post,
        "best_times": best_times,
        "engagement_trends": engagement_trends,
        "total_posts": len(social_df),
        "total_reach": int(social_df['Alcance'].sum()),
        "total_engagement": int(social_df['Engagement'].sum()),
        "avg_engagement_rate": round(social_df['Tasa Engagement'].mean(), 2)
    }

def calculate_platform_stats(df):
    """Calcula estadísticas agregadas por plataforma"""
    platforms = df.groupby('Plataforma').agg({
        'Alcance': 'sum',
        'Engagement': 'sum',
        'Tasa Engagement': 'mean',
        'Likes': 'sum',
        'Comentarios': 'sum',
        'Compartidos': 'sum'
    }).reset_index()
    
    # Calcular crecimiento (simulado para demo)
    stats = []
    for _, row in platforms.iterrows():
        stats.append({
            'platform': row['Plataforma'],
            'followers': row['Alcance'],  # Usando alcance como proxy
            'engagement_rate': round(row['Tasa Engagement'], 2),
            'total_engagement': int(row['Engagement']),
            'likes': int(row['Likes']),
            'comments': int(row['Comentarios']),
            'shares': int(row['Compartidos']),
            'growth': round(((row['Tasa Engagement'] - 3) / 3) * 100, 1)  # Crecimiento simulado
        })
    
    return stats

def get_upcoming_posts(df):
    """Obtiene posts programados (simulados como futuros)"""
    # Para la demo, tomamos los posts más recientes y los "programamos"
    today = datetime.now()
    upcoming = []
    
    recent = df.nlargest(3, 'Fecha')
    for i, (_, row) in enumerate(recent.iterrows()):
        future_date = today + timedelta(days=i)
        upcoming.append({
            'id': row['ID'],
            'platform': row['Plataforma'],
            'date': future_date.strftime('%d %b, %H:00'),
            'content': generate_post_preview(row['Plataforma'], i),
            'status': 'Programada'
        })
    
    return upcoming

def get_recent_posts(df):
    """Obtiene posts recientes publicados"""
    recent = df.nlargest(5, 'Fecha').to_dict('records')
    posts = []
    
    for post in recent:
        posts.append({
            'id': post['ID'],
            'platform': post['Plataforma'],
            'date': pd.to_datetime(post['Fecha']).strftime('%d %b, %H:00'),
            'content': generate_post_preview(post['Plataforma'], 0),
            'reach': int(post['Alcance']),
            'engagement': int(post['Engagement']),
            'engagement_rate': round(post['Tasa Engagement'], 2),
            'likes': int(post['Likes']),
            'comments': int(post['Comentarios']),
            'shares': int(post['Compartidos']),
            'status': 'Publicada'
        })
    
    return posts

def get_top_performing_post(df):
    """Encuentra el post con mejor desempeño"""
    top = df.loc[df['Engagement'].idxmax()]
    
    return {
        'id': top['ID'],
        'platform': top['Plataforma'],
        'content': generate_post_preview(top['Plataforma'], 0, is_top=True),
        'date': pd.to_datetime(top['Fecha']).strftime('%d %b'),
        'reach': int(top['Alcance']),
        'engagement': int(top['Engagement']),
        'likes': int(top['Likes']),
        'comments': int(top['Comentarios']),
        'shares': int(top['Compartidos']),
        'engagement_rate': round(top['Tasa Engagement'], 2)
    }

def analyze_best_posting_times(df):
    """Analiza los mejores horarios por plataforma basado en engagement"""
    best_times = {}
    
    for platform in df['Plataforma'].unique():
        platform_df = df[df['Plataforma'] == platform]
        avg_engagement = platform_df['Tasa Engagement'].mean()
        
        # Simulación de mejores horarios basados en datos
        times = {
            'Instagram': 'Lunes y Jueves, 18:00-20:00',
            'Facebook': 'Martes, 10:00-12:00',
            'LinkedIn': 'Miércoles, 08:00-09:00',
            'Twitter': 'Todos los días, 12:00-14:00',
            'TikTok': 'Viernes y Sábado, 19:00-21:00'
        }
        
        best_times[platform] = {
            'times': times.get(platform, 'Análisis en progreso'),
            'avg_engagement': round(avg_engagement, 2)
        }
    
    return best_times

def calculate_engagement_trends(df):
    """Calcula tendencias de engagement por plataforma"""
    df_sorted = df.sort_values('Fecha')
    trends = []
    
    for platform in df['Plataforma'].unique():
        platform_df = df_sorted[df_sorted['Plataforma'] == platform]
        
        if len(platform_df) > 1:
            recent_avg = platform_df.tail(3)['Tasa Engagement'].mean()
            older_avg = platform_df.head(3)['Tasa Engagement'].mean()
            trend = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
        else:
            trend = 0
        
        trends.append({
            'platform': platform,
            'trend': round(trend, 1)
        })
    
    return trends

def generate_post_preview(platform, index, is_top=False):
    """Genera contenido de ejemplo para los posts"""
    if is_top:
        return "5 errores que matan tu estrategia de email marketing"
    
    contents = [
        "Tips de marketing digital para PyMEs",
        "Caso de éxito: Aumento 200% en conversiones",
        "Artículo: El futuro del marketing omnicanal",
        "Estadística del día + CTA a webinar",
        "Infografía: ROI del marketing de contenidos"
    ]
    
    return contents[index % len(contents)]