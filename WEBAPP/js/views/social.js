// Lógica para la sección de Redes Sociales

async function loadSocialContent() {
    const mainContent = document.getElementById('mainContent');
    
    // Mostrar loading
    mainContent.innerHTML = `
        <div style="text-align: center; padding: 64px 24px;">
            <i class='bx bx-loader-alt bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 16px; color: #64748b;">Cargando datos de redes sociales...</p>
        </div>
    `;
    
    try {
    // Obtener datos del backend
    const response = await fetch(`${API_BASE_URL}/api/v1/social`);
        const result = await response.json();
        
        if (result.status === 'success') {
            renderSocialContent(result.data);
            
            // Cargar insights de IA en segundo plano
            loadAIInsights();
        } else {
            throw new Error('Error al cargar datos');
        }
    } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 64px 24px;">
                <i class='bx bx-error' style='font-size: 48px; color: #ef4444;'></i>
                <h2 style="margin-top: 24px; color: #0f172a;">Error al cargar datos</h2>
                <p style="color: #64748b; margin-top: 8px;">No se pudieron cargar los datos de redes sociales.</p>
                <button onclick="loadSocialContent()" class="btn btn-primary" style="margin-top: 24px;">
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

        <!-- Social Media Stats -->
        <div class="kpi-grid">
            ${renderPlatformStats(data.platform_stats)}
        </div>

        <!-- Content Calendar -->
        <div class="campaign-performance">
            <h3>Calendario de Publicaciones</h3>
            <table class="performance-table">
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

        <!-- Performance Grid -->
        <div class="charts-grid" style="margin-top: 2rem;">
            <!-- Top Post -->
            <div class="automation-card">
                <div class="automation-status">
                    <h4>Post con Mayor Engagement</h4>
                    <span class="segment-badge success">${data.top_post.platform}</span>
                </div>
                <p>${data.top_post.content}</p>
                <div class="automation-metrics">
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.likes)}</span>
                        <span class="metric-label">Likes</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.comments)}</span>
                        <span class="metric-label">Comentarios</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${formatNumber(data.top_post.shares)}</span>
                        <span class="metric-label">Compartidos</span>
                    </div>
                </div>
                <div class="segment-stats">
                    <span><i class='bx bx-calendar'></i> Publicado: ${data.top_post.date}</span>
                    <span><i class='bx bx-trending-up'></i> Alcance: ${formatNumber(data.top_post.reach)}</span>
                </div>
            </div>

            <!-- Best Times -->
            <div class="automation-card">
                <div class="automation-status">
                    <h4>Mejor Horario de Publicación</h4>
                    <span class="segment-badge" style="background: #e0e7ff; color: var(--primary);">IA Insights</span>
                </div>
                <p>Basado en análisis de tus publicaciones recientes</p>
                <div class="segment-stats" style="display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-top: 1rem;">
                    ${renderBestTimes(data.best_times)}
                </div>
            </div>

            <!-- AI Insights Placeholder -->
            <div class="insights-card" id="ai-insights-container">
                <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
                <div style="text-align: center; padding: 1rem;">
                    <i class='bx bx-loader-alt bx-spin' style='font-size: 24px; color: #6366f1;'></i>
                    <p style="color: #64748b; margin-top: 8px; font-size: 14px;">Generando insights con IA...</p>
                </div>
            </div>
        </div>

        <!-- Summary Stats -->
        <div class="activity-section" style="margin-top: 2rem;">
            <h3>Resumen General</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="kpi-card" style="flex-direction: row; align-items: center;">
                    <div class="kpi-icon" style="background: #6366f1; color: white; margin: 0; margin-right: 1rem;">
                        <i class='bx bx-line-chart'></i>
                    </div>
                    <div>
                        <span class="kpi-label">Total Posts</span>
                        <h3 class="kpi-value">${data.total_posts}</h3>
                    </div>
                </div>
                <div class="kpi-card" style="flex-direction: row; align-items: center;">
                    <div class="kpi-icon" style="background: #10b981; color: white; margin: 0; margin-right: 1rem;">
                        <i class='bx bx-user-check'></i>
                    </div>
                    <div>
                        <span class="kpi-label">Alcance Total</span>
                        <h3 class="kpi-value">${formatNumber(data.total_reach)}</h3>
                    </div>
                </div>
                <div class="kpi-card" style="flex-direction: row; align-items: center;">
                    <div class="kpi-icon" style="background: #f59e0b; color: white; margin: 0; margin-right: 1rem;">
                        <i class='bx bx-heart'></i>
                    </div>
                    <div>
                        <span class="kpi-label">Engagement Total</span>
                        <h3 class="kpi-value">${formatNumber(data.total_engagement)}</h3>
                    </div>
                </div>
                <div class="kpi-card" style="flex-direction: row; align-items: center;">
                    <div class="kpi-icon" style="background: #8b5cf6; color: white; margin: 0; margin-right: 1rem;">
                        <i class='bx bx-trending-up'></i>
                    </div>
                    <div>
                        <span class="kpi-label">Tasa Promedio</span>
                        <h3 class="kpi-value">${data.avg_engagement_rate}%</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="activity-section" style="margin-top: 2rem;">
            <h3>Acciones Rápidas</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <button class="btn btn-secondary" style="justify-content: center; padding: 1rem;" onclick="generateAIPost()">
                    <i class='bx bx-bot'></i>
                    Generar Post con IA
                </button>
                <button class="btn btn-secondary" style="justify-content: center; padding: 1rem;" onclick="alert('Función en desarrollo')">
                    <i class='bx bx-image-add'></i>
                    Subir Contenido
                </button>
                <button class="btn btn-secondary" style="justify-content: center; padding: 1rem;" onclick="alert('Función en desarrollo')">
                    <i class='bx bx-calendar-check'></i>
                    Ver Calendario Completo
                </button>
                <button class="btn btn-secondary" style="justify-content: center; padding: 1rem;" onclick="exportSocialReport()">
                    <i class='bx bx-bar-chart-alt-2'></i>
                    Exportar Reporte Social
                </button>
            </div>
        </div>
    `;
}

function renderPlatformStats(stats) {
    const platformIcons = {
        'Instagram': { icon: 'bxl-instagram', gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
        'Facebook': { icon: 'bxl-facebook', gradient: '#1877f2' },
        'Twitter': { icon: 'bxl-twitter', gradient: '#000000' },
        'LinkedIn': { icon: 'bxl-linkedin', gradient: '#0a66c2' },
        'TikTok': { icon: 'bxl-tiktok', gradient: '#000000' }
    };

    return stats.map(stat => {
        const platform = platformIcons[stat.platform] || { icon: 'bx-share-alt', gradient: '#6366f1' };
        const trendClass = stat.growth >= 0 ? 'positive' : 'negative';
        const trendIcon = stat.growth >= 0 ? 'bx-trending-up' : 'bx-trending-down';
        
        return `
            <div class="kpi-card">
                <div class="kpi-icon" style="background: ${platform.gradient}; color: white;">
                    <i class='bx ${platform.icon}'></i>
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
        const platformColors = {
            'Instagram': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%)',
            'Facebook': '#1877f2',
            'LinkedIn': '#0a66c2',
            'Twitter': '#000000',
            'TikTok': '#000000'
        };
        
        const statusClass = post.status === 'Publicada' ? 'success' : '';
        const metrics = post.status === 'Publicada' 
            ? `<span style="font-size: 12px; color: #64748b;">
                ${formatNumber(post.reach)} alcance | ${post.engagement_rate}% engagement
               </span>`
            : '<span style="font-size: 12px; color: #64748b;">-</span>';
        
        const action = post.status === 'Publicada'
            ? `<button class="btn-link" onclick="viewPostAnalytics('${post.id}')">Ver análisis</button>`
            : `<button class="btn-link" onclick="editPost('${post.id}')">Editar</button>`;
        
        return `
            <tr>
                <td><strong>${post.date}</strong></td>
                <td>
                    <span class="channel-badge" style="background: ${platformColors[post.platform] || '#6366f1'}; color: white;">
                        ${post.platform}
                    </span>
                </td>
                <td>${post.content}</td>
                <td><span class="segment-badge ${statusClass}">${post.status}</span></td>
                <td>${metrics}</td>
                <td>${action}</td>
            </tr>
        `;
    }).join('');
}

function renderBestTimes(bestTimes) {
    return Object.entries(bestTimes).map(([platform, data]) => `
        <span><i class='bx bx-time'></i> <strong>${platform}:</strong> ${data.times}</span>
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
            <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
            <div style="text-align: center; padding: 1rem; color: #64748b;">
                <i class='bx bx-error-circle' style='font-size: 24px;'></i>
                <p style="margin-top: 8px; font-size: 14px;">No se pudieron cargar los insights</p>
            </div>
        `;
        } else {
            console.warn('ai-insights-container not found in DOM');
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
                <p><strong>${insight.title}:</strong> ${insight.description}</p>
            </div>
        `;
    }).join('');
    
    if (warning) {
        insightsHtml += `
            <div class="insight-item" style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 0.75rem; margin-top: 0.5rem;">
                <i class='bx bx-info-circle' style="color: #f59e0b;"></i>
                <p style="font-size: 13px; color: #92400e;">${warning}</p>
            </div>
        `;
    }
    
    container.innerHTML = `
        <h4><i class='bx bxs-bulb'></i> Recomendaciones IA</h4>
        ${insightsHtml}
        <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="showFullInsights()">
            <i class='bx bx-detail'></i>
            Ver Análisis Completo
        </button>
    `;
}

function formatNumber(num, defaultString = '-') {
    // Handle null/undefined and empty strings safely
    if (num === null || typeof num === 'undefined') return defaultString;
    if (typeof num === 'string' && num.trim() === '') return defaultString;

    const parsed = Number(num);
    if (isNaN(parsed)) return defaultString;

    if (parsed >= 1000000) {
        return (parsed / 1000000).toFixed(1) + 'M';
    } else if (parsed >= 1000) {
        return (parsed / 1000).toFixed(1) + 'K';
    }
    // Remove trailing .0 if integer-like
    return parsed % 1 === 0 ? String(parsed) : parsed.toString();
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