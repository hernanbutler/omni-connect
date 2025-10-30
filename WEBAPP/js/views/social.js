// Lógica para la sección de Redes Sociales

async function loadSocialContent() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="loading-state">
            <i class='bx bx-loader-alt bx-spin'></i>
            <p>Cargando datos de redes sociales...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/social`);
        const result = await response.json();
        
        if (result.status === 'success') {
            renderSocialContent(result.data);
            loadAIInsights();
        } else {
            throw new Error(result.message || 'Error al cargar datos de redes sociales.');
        }
    } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class='bx bx-error'></i>
                <h2>Error al cargar datos</h2>
                <p>${error.message}</p>
                <button onclick="loadSocialContent()" class="btn btn-primary">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

function renderSocialContent(data) {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <header class="section-header">
            <div>
                <h1>Gestión de Redes Sociales</h1>
                <p class="subtitle">Programa, publica y analiza tu presencia social</p>
            </div>
            <button class="btn btn-primary" onclick="showNewPostModal()">
                <i class='bx bx-plus'></i>
                Nueva Publicación
            </button>
        </header>

        <div class="kpi-grid">
            ${renderPlatformStats(data.platform_stats)}
        </div>

        <div class="card">
            <div class="section-header">
                <h3>Calendario de Publicaciones</h3>
            </div>
            <table class="posts-table">
                <thead>
                    <tr>
                        <th>Fecha y Hora</th>
                        <th>Red Social</th>
                        <th>Contenido</th>
                        <th>Estado</th>
                        <th>Métricas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderPostsTable(data.upcoming_posts, data.recent_posts)}
                </tbody>
            </table>
        </div>

        <div class="social-charts-grid">
            <div class="social-card">
                <div class="social-card-header">
                    <h4>Post con Mayor Engagement</h4>
                    <span class="platform-badge ${data.top_post.platform.toLowerCase()}">${data.top_post.platform}</span>
                </div>
                <small class="text-secondary" style="margin-bottom: 1rem; display: block;">Publicado: ${data.top_post.date}</small>
                <p class="top-post-content">${data.top_post.content}</p>
                <div class="social-card-metrics">
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.likes)}</span>
                        <span class="metric-label">Me gusta</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.comments)}</span>
                        <span class="metric-label">Comentarios</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.shares)}</span>
                        <span class="metric-label">Compartidos</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${data.top_post.engagement_rate}%</span>
                        <span class="metric-label">Engagement</span>
                    </div>
                </div>
            </div>

            <div class="social-card">
                <div class="social-card-header">
                    <h4>Mejor Horario de Publicación</h4>
                    <span class="badge info">IA Insight</span>
                </div>
                <p>Basado en análisis de tus publicaciones recientes</p>
                <div class="list">
                    ${renderBestTimes(data.best_times)}
                </div>
            </div>

            <div class="social-card" id="ai-insights-container">
                <div class="social-card-header">
                     <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
                </div>
                <div class="loading-state mini">
                    <i class='bx bx-loader-alt bx-spin'></i>
                    <p>Generando insights...</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-header">
                <h3>Resumen General</h3>
            </div>
            <div class="kpi-grid">
                 <div class="kpi-card simple">
                    <div class="kpi-icon purple"><i class='bx bx-line-chart'></i></div>
                    <div>
                        <span class="kpi-label">Total Posts</span>
                        <h3 class="kpi-value">${data.total_posts}</h3>
                    </div>
                </div>
                <div class="kpi-card simple">
                    <div class="kpi-icon green"><i class='bx bx-user-check'></i></div>
                    <div>
                        <span class="kpi-label">Alcance Total</span>
                        <h3 class="kpi-value">${formatNumber(data.total_reach)}</h3>
                    </div>
                </div>
                <div class="kpi-card simple">
                    <div class="kpi-icon orange"><i class='bx bx-heart'></i></div>
                    <div>
                        <span class="kpi-label">Engagement Total</span>
                        <h3 class="kpi-value">${formatNumber(data.total_engagement)}</h3>
                    </div>
                </div>
                <div class="kpi-card simple">
                    <div class="kpi-icon blue"><i class='bx bx-trending-up'></i></div>
                    <div>
                        <span class="kpi-label">Tasa Promedio</span>
                        <h3 class="kpi-value">${data.avg_engagement_rate}%</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-header">
                <h3>Acciones Rápidas</h3>
            </div>
            <div class="quick-actions-grid">
                <button class="btn btn-secondary" onclick="generateAIPost()">
                    <i class='bx bx-bot'></i>
                    Generar Post con IA
                </button>
                <button class="btn btn-secondary" onclick="alert('Función en desarrollo')">
                    <i class='bx bx-image-add'></i>
                    Subir Contenido
                </button>
                <button class="btn btn-secondary" onclick="alert('Función en desarrollo')">
                    <i class='bx bx-calendar-check'></i>
                    Ver Calendario Completo
                </button>
                <button class="btn btn-secondary" onclick="exportSocialReport()">
                    <i class='bx bx-bar-chart-alt-2'></i>
                    Exportar Reporte Social
                </button>
            </div>
        </div>
    `;
}

function renderPlatformStats(stats) {
    const platformIcons = {
        'Instagram': 'bxl-instagram',
        'Facebook': 'bxl-facebook',
        'Twitter': 'bxl-twitter',
        'LinkedIn': 'bxl-linkedin',
        'TikTok': 'bxl-tiktok'
    };

    return stats.map(stat => {
        const platform = stat.platform.toLowerCase();
        const trendClass = stat.growth >= 0 ? 'positive' : 'negative';
        const trendIcon = stat.growth >= 0 ? 'bx-trending-up' : 'bx-trending-down';
        
        return `
            <div class="kpi-card">
                <div class="kpi-icon platform-icon ${platform}">
                    <i class='bx ${platformIcons[stat.platform] || 'bx-share-alt'}'></i>
                </div>
                <div class="kpi-content">
                    <span class="kpi-label">${stat.platform}</span>
                    <h2 class="kpi-value">${formatNumber(stat.followers)}</h2>
                    <span class="kpi-trend ${trendClass}">
                        <i class='bx ${trendIcon}'></i> ${stat.growth > 0 ? '+' : ''}${stat.growth}% engagement
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function renderPostsTable(upcoming, recent) {
    const allPosts = [...upcoming, ...recent];
    
    return allPosts.slice(0, 8).map(post => {
        const platform = post.platform.toLowerCase();
        const statusClass = post.status === 'Publicada' ? 'success' : (post.status === 'Programada' ? 'warning' : '');
        const metrics = post.status === 'Publicada' 
            ? `<span class="table-metrics">${formatNumber(post.reach)} alcance | ${post.engagement_rate}% engagement</span>`
            : '<span class="table-metrics">-</span>';
        
        const action = post.status === 'Publicada'
            ? `<button class="btn btn-secondary btn-sm" onclick="viewPostAnalytics('${post.id}')"><i class='bx bx-bar-chart-alt-2'></i> Ver análisis</button>`
            : `<button class="btn btn-secondary btn-sm" onclick="editPost('${post.id}')"><i class='bx bx-edit-alt'></i> Editar</button>`;
        
        return `
            <tr>
                <td><strong>${post.date}</strong></td>
                <td>
                    <span class="platform-badge ${platform}">${post.platform}</span>
                </td>
                <td><span class="content-preview">${post.content}</span></td>
                <td><span class="status-badge ${statusClass}">${post.status}</span></td>
                <td>${metrics}</td>
                <td class="table-actions">${action}</td>
            </tr>
        `;
    }).join('');
}

function renderBestTimes(bestTimes) {
    return Object.entries(bestTimes).map(([platform, data]) => `
        <div class="list-item">
            <i class='list-item-icon bx bx-time'></i>
            <div class="list-item-content">
                <strong>${platform}:</strong>
                <span>${data.times}</span>
            </div>
        </div>
    `).join('');
}

async function loadAIInsights() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/social/insights`);
        const result = await response.json();
        
        if (result.status === 'success') {
            renderSocialAIInsights(result.data);
        }
    } catch (error) {
        console.error('Error cargando insights:', error);
        const container = document.getElementById('ai-insights-container');
        if (container) {
            container.innerHTML = `
                <div class="social-card-header">
                    <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
                </div>
                <div class="error-state mini">
                    <i class='bx bx-error-circle'></i>
                    <p>No se pudieron cargar los insights</p>
                </div>
            `;
        }
    }
}

function renderSocialAIInsights(aiData) {
    const container = document.getElementById('ai-insights-container');
    const insights = aiData.insights || [];
    const warning = aiData.warning || '';
    
    let insightsHtml = insights.slice(0, 3).map(insight => {
        const icons = {
            'success': 'bx-check-circle',
            'warning': 'bx-error-circle',
            'tip': 'bx-bulb',
            'info': 'bx-info-circle'
        };
        
        return `
            <div class="insight-item">
                <i class='bx ${icons[insight.type] || 'bx-info-circle'}'></i>
                <div class="insight-content">
                    <strong>${insight.title}</strong>
                    <p>${insight.description}</p>
                </div>
            </div>
        `;
    }).join('');
    
    if (warning) {
        insightsHtml += `
            <div class="insight-item warning">
                <i class='bx bx-info-circle'></i>
                <div class="insight-content">
                    <p>${warning}</p>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="social-card-header">
            <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
        </div>
        <div class="list">
            ${insightsHtml}
        </div>
        <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="showFullInsights()">
            <i class='bx bx-detail'></i>
            Ver Análisis Completo
        </button>
    `;
}

function formatNumber(num, defaultString = '-') {
    if (num === null || typeof num === 'undefined' || String(num).trim() === '') return defaultString;
    const parsed = Number(num);
    if (isNaN(parsed)) return defaultString;

    if (parsed >= 1000000) return (parsed / 1000000).toFixed(1) + 'M';
    if (parsed >= 1000) return (parsed / 1000).toFixed(1) + 'K';
    return String(parsed);
}

function showNewPostModal() {
    alert('Modal de nueva publicación - Función en desarrollo');
}

async function generateAIPost() {
    const platform = prompt('¿Para qué plataforma? (Instagram, Facebook, LinkedIn, Twitter, TikTok)', 'Instagram');
    const topic = prompt('¿Sobre qué tema?', 'marketing digital');
    
    if (!platform || !topic) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/social/generate-post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, topic, tone: 'profesional' })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert(`Post generado:\n\n${result.data.content}\n\nHashtags: ${result.data.hashtags.join(' ')}\n\nMejor horario: ${result.data.best_time}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar post con IA');
    }
}

function exportSocialReport() {
    alert('Exportando reporte de redes sociales...\nFunción en desarrollo');
}

function viewPostAnalytics(postId) {
    alert(`Ver análisis detallado del post: ${postId}\nFunción en desarrollo`);
}

function editPost(postId) {
    alert(`Editar post: ${postId}\nFunción en desarrollo`);
}

function showFullInsights() {
    alert('Mostrando análisis completo de IA\nFunción en desarrollo');
}