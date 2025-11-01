async function loadCampaignsContent() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="loading-state">
            <i class='bx bx-loader-alt bx-spin'></i>
            <p>Cargando campañas...</p>
        </div>
    `;

    try {
        const [overviewRes, activeRes, templatesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/campaigns/overview`),
            fetch(`${API_BASE_URL}/api/v1/campaigns/active`),
            fetch(`${API_BASE_URL}/api/v1/campaigns/templates`)
        ]);

        if (!overviewRes.ok || !activeRes.ok || !templatesRes.ok) {
            throw new Error('Error al cargar los datos de campañas. Verifica la conexión con el backend.');
        }

        const overviewData = await overviewRes.json();
        const activeData = await activeRes.json();
        const templatesData = await templatesRes.json();

        if (!overviewData.success || !activeData.success || !templatesData.success) {
            throw new Error('Los datos de campañas recibidos no son válidos.');
        }

        const overview = overviewData.data || {};
        const activeCampaigns = activeData.data.campaigns || [];
        const templates = templatesData.data.templates || [];

        mainContent.innerHTML = renderCampaignsHTML(overview, activeCampaigns, templates);

        setupCampaignsEventListeners();
        animateElements();

    } catch (error) {
        console.error('[loadCampaignsContent] Error:', error);
        mainContent.innerHTML = `
            <div class="error-state">
                <i class='bx bx-error'></i>
                <h2>Error al cargar campañas</h2>
                <p>${error.message}</p>
                <button onclick="loadCampaignsContent()" class="btn btn-primary">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

function renderCampaignsHTML(overview, campaigns, templates) {
    const campaignsHTML = campaigns.map(campaign => {
        try {
            return renderCampaignCard(campaign);
        } catch (e) {
            console.error('[Render Error] Failed to render campaign card:', e, campaign);
            return '<div class="card error-card"><p>Error al mostrar esta campaña</p></div>';
        }
    }).join('');

    const templatesHTML = templates.map(template => {
        try {
            return renderTemplateItem(template);
        } catch (e) {
            console.error('[Render Error] Failed to render template item:', e, template);
            return '<div class="list-item error-card"><p>Error al mostrar esta plantilla</p></div>';
        }
    }).join('');

    return `
    <section id="campaigns" class="content-section active">
        <header class="section-header">
            <div>
                <h1>Campañas de Email Marketing</h1>
                <p class="subtitle">Diseña, programa y analiza tus campañas de email</p>
            </div>
            <button class="btn btn-primary">
                <i class='bx bx-plus'></i>
                Nueva Campaña
            </button>
        </header>

        <div class="kpi-grid">
            ${renderKpiCard('Emails Enviados', overview.emails_sent, overview.emails_trend, 'bx-send', 'blue')}
            ${renderKpiCard('Tasa de Apertura', `${overview.open_rate || 0}%`, overview.open_rate_trend, 'bx-envelope-open', 'green')}
            ${renderKpiCard('CTR Promedio', `${overview.ctr || 0}%`, overview.ctr_trend, 'bx-mouse-alt', 'purple')}
            ${renderKpiCard('Tasa de Rebote', `${overview.bounce_rate || 0}%`, overview.bounce_trend, 'bx-error-circle', 'orange', true)}
        </div>

        <div class="card">
            <div class="section-header">
                <h3>Campañas Activas y Recientes</h3>
                <button class="btn btn-secondary" onclick="loadCampaignsContent()">
                    <i class='bx bx-refresh'></i> Actualizar
                </button>
            </div>
            <div class="campaigns-grid" id="campaigns-active-grid">
                ${campaigns.length > 0 ? campaignsHTML : `
                    <div class="no-data-card">
                        <i class='bx bx-info-circle'></i>
                        <p>No hay campañas disponibles</p>
                    </div>
                `}
            </div>
        </div>

        <div class="card">
            <div class="section-header">
                <h3>Plantillas de Email Disponibles</h3>
                <button class="btn btn-secondary" onclick="generateSubjectLines(null)">
                    <i class='bx bx-brain'></i> Generar Asuntos con IA
                </button>
            </div>
            <div class="list" id="campaigns-templates-list">
                ${templates.length > 0 ? templatesHTML : `
                    <div class="no-data-card">
                        <i class='bx bx-info-circle'></i>
                        <p>No hay plantillas disponibles</p>
                    </div>
                `}
            </div>
        </div>

        <div class="card">
             <div class="section-header">
                <div>
                    <h3>Insights Inteligentes</h3>
                    <p class="subtitle">Recomendaciones personalizadas basadas en tu histórico</p>
                </div>
            </div>
            <div class="insights-grid" id="campaigns-insights-grid">
                 <button class="btn btn-primary" onclick="handleGenerateCampaignInsights()" style="width: 100%; max-width: 400px; margin: 1rem auto; display: block;">
                    <i class='bx bx-brain'></i> Generar Insights con IA
                </button>
            </div>
        </div>
    </section>
    `;
}

async function handleGenerateCampaignInsights() {
    const container = document.getElementById('campaigns-insights-grid');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state" style="padding: 2rem 0;">
            <i class='bx bx-loader-alt bx-spin'></i>
            <p>Generando insights con IA...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/ai-insights`);
        if (!response.ok) throw new Error('La respuesta de la API no fue exitosa.');
        
        const insightsData = await response.json();
        if (!insightsData.success) throw new Error(insightsData.message || 'Error en los datos de la API');

        const insights = insightsData.data.insights || [];
        const insightsHTML = insights.map((insight, idx) => renderInsightItem(insight, idx)).join('');

        container.innerHTML = insights.length > 0 ? insightsHTML : `
            <div class="no-data-card">
                <i class='bx bx-brain'></i>
                <p>No hay suficientes datos para generar nuevos insights.</p>
            </div>
        `;
    } catch (error) {
        console.error('[handleGenerateCampaignInsights] Error:', error);
        container.innerHTML = `
            <div class="error-state" style="padding: 2rem 0;">
                <i class='bx bx-error'></i>
                <p>${error.message}</p>
                <button onclick="handleGenerateCampaignInsights()" class="btn btn-secondary">Reintentar</button>
            </div>
        `;
    }
}

function renderKpiCard(label, value = 'N/A', trend = 0, icon = 'bx-question-mark', color = 'grey', invertTrend = false) {
    const trendValue = parseFloat(trend);
    const isPositive = invertTrend ? trendValue < 0 : trendValue > 0;
    const trendIcon = trendValue === 0 ? 'bx-minus' : (isPositive ? 'bx-trending-up' : 'bx-trending-down');
    const trendClass = trendValue === 0 ? '' : (isPositive ? 'positive' : 'negative');
    const prefix = trendValue > 0 ? '+' : '';
    return `
        <div class="kpi-card">
            <div class="kpi-icon ${color}">
                <i class='bx ${icon}'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">${label}</span>
                <h2 class="kpi-value">${value}</h2>
                <span class="kpi-trend ${trendClass}">
                    <i class='bx ${trendIcon}'></i> ${prefix}${trendValue}% vs mes anterior
                </span>
            </div>
        </div>
    `;
}

function renderCampaignCard(campaign = {}) {
    const status = campaign.status || 'Desconocido';
    // Create a CSS-friendly class from the status
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');

    // Determine status text and class for "Completada"
    const isCompleted = (campaign.status || '').toLowerCase() === 'completada';
    const statusText = isCompleted ? 'Completada' : status;

    return `
        <div class="card" data-campaign-id="${campaign.id || ''}">
            <div class="section-header" style="margin-bottom: 1rem; align-items: center;">
                <h3 style="font-size: 1.1rem;">${campaign.name || 'Campaña sin nombre'}</h3>
                <span class="campaign-status status-${statusClass}">${statusText}</span>
            </div>
            <p class="subtitle" style="margin-top: -0.5rem; margin-bottom: 1rem;">${getCampaignDescription(campaign)}</p>
            
            <div class="campaign-card-metrics">
                <div class="metric">
                    <span class="metric-value">${campaign.open_rate || 0}%</span>
                    <span class="metric-label">Apertura</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${campaign.ctr || 0}%</span>
                    <span class="metric-label">CTR</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${campaign.conversion_rate || 0}%</span>
                    <span class="metric-label">Conversión</span>
                </div>
            </div>

            <div class="campaign-card-actions">
                <button class="btn btn-secondary" onclick="viewCampaignDetails('${campaign.id || ''}')">
                    Ver Detalles
                </button>
                <button class="btn btn-primary" onclick="analyzeCampaignWithAI('${campaign.id || ''}')">
                    <i class='bx bx-brain'></i> Analizar
                </button>
            </div>
        </div>
    `;
}

function renderTemplateItem(template = {}) {
    return `
        <div class="list-item">
            <i class='list-item-icon bx ${template.icon || 'bx-file'}'></i>
            <div class="list-item-content">
                <strong>${template.name || 'Plantilla sin nombre'}</strong>
                <span>${template.description || 'Sin descripción.'}</span>
                <div class="template-list-item-metrics">
                    <span><i class='bx bx-envelope-open'></i> ${template.avg_open_rate || 0}% apertura</span>
                    <span><i class='bx bx-mouse-alt'></i> ${template.avg_ctr || 0}% CTR</span>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="useTemplate('${template.type || ''}')">
                <i class='bx bx-copy'></i> Usar plantilla
            </button>
        </div>
    `;
}

function renderInsightItem(insight, idx) {
    return `
        <div class="insight-item">
            <i class='bx ${getInsightIcon(idx)}'></i>
            <div class="insight-content">
                <strong>Insight ${idx + 1}</strong>
                <p>${insight || 'Insight no disponible.'}</p>
            </div>
        </div>
    `;
}

function getCampaignDescription(campaign) {
    const name = (campaign.name || '').toLowerCase();
    if (name.includes('newsletter') || name.includes('novedades')) return 'Newsletter informativo con contenido de valor';
    if (name.includes('últimas') || name.includes('aprovecha')) return 'Campaña promocional con ofertas de tiempo limitado';
    if (name.includes('extrañamos') || name.includes('vuelve')) return 'Campaña de reactivación para clientes inactivos';
    if (name.includes('vip') || name.includes('exclusiv')) return 'Ofertas especiales para segmento premium';
    return 'Campaña de email marketing';
}

async function analyzeCampaignWithAI(campaignId) {
    showAIAnalysisModal(campaignId, null, true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/ai-analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Error en análisis');
        showAIAnalysisModal(campaignId, result.data, false);
    } catch (error) {
        console.error('Error analyzing campaign:', error);
        closeAIAnalysisModal();
        alert('Error al analizar la campaña con IA. Por favor, verifica la configuración de la API.');
    }
}

function showAIAnalysisModal(campaignId, data, isLoading) {
    const existingModal = document.getElementById('aiAnalysisModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'aiAnalysisModal';
    modal.className = 'modal';
    
    let modalHTML = '';
    if (isLoading) {
        modalHTML = `
            <div class="modal-content">
                <div class="modal-loading">
                    <i class='bx bx-brain bx-spin'></i>
                    <h3>Analizando campaña con IA...</h3>
                    <p>Esto puede tomar unos segundos</p>
                </div>
            </div>
        `;
    } else {
        const analysis = data.analysis;
        const campaign = data.campaign;
        modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class='bx bx-brain'></i> Análisis IA: ${campaign.name}</h3>
                    <button class="modal-close" onclick="closeAIAnalysisModal()"><i class='bx bx-x'></i></button>
                </div>
                <div class="modal-body">
                    ${analysis.performance_summary ? `<div class="ai-modal-card"><h4><i class='bx bx-bar-chart-alt-2'></i> Resumen de Rendimiento</h4><p>${analysis.performance_summary}</p></div>` : ''}
                    <div class="ai-modal-card">
                        <h4><i class='bx bx-bulb'></i> Insights Clave</h4>
                        <ul>${(analysis.insights || []).map(insight => `<li>${insight}</li>`).join('')}</ul>
                    </div>
                    <div class="ai-modal-card">
                        <h4><i class='bx bx-trending-up'></i> Recomendaciones</h4>
                        ${(analysis.recommendations || []).map((rec, idx) => `<div class="ai-recommendation-item"><strong>${idx + 1}. </strong>${rec}</div>`).join('')}
                    </div>
                    ${analysis.predicted_improvement ? `<div class="ai-modal-card ai-modal-card-gradient"><h4><i class='bx bx-trophy'></i> Mejora Esperada</h4><p>${analysis.predicted_improvement}</p></div>` : ''}
                    <div class="campaign-card-actions">
                        <button class="btn btn-primary" onclick="generateSubjectLines('${campaignId}')"><i class='bx bx-bulb'></i> Generar Asuntos con IA</button>
                        <button class="btn-secondary" onclick="closeAIAnalysisModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    }
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAIAnalysisModal(); });
}

function closeAIAnalysisModal() {
    const modal = document.getElementById('aiAnalysisModal');
    if (modal) modal.remove();
}

async function generateSubjectLines(campaignId) {
    closeAIAnalysisModal();
    showSubjectLinesModal(null, true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/ai-generate-subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_type: 'promocional', target_audience: 'general' })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Error al generar asuntos');
        showSubjectLinesModal(result.data.variants, false);
    } catch (error) {
        console.error('Error generating subject lines:', error);
        closeSubjectLinesModal();
        alert('Error al generar asuntos. Por favor, verifica la configuración de la API.');
    }
}

function showSubjectLinesModal(variants, isLoading) {
    const existingModal = document.getElementById('subjectLinesModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'subjectLinesModal';
    modal.className = 'modal';
    
    let modalHTML = '';
    if (isLoading) {
        modalHTML = `
            <div class="modal-content">
                 <div class="modal-loading">
                    <i class='bx bx-bulb bx-spin'></i>
                    <h3>Generando asuntos optimizados...</h3>
                    <p>Creando variantes persuasivas con IA</p>
                </div>
            </div>
        `;
    } else {
        modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class='bx bx-envelope'></i> Líneas de Asunto Generadas con IA</h3>
                    <button class="modal-close" onclick="closeSubjectLinesModal()"><i class='bx bx-x'></i></button>
                </div>
                <div class="modal-body">
                    <p>Haz clic en cualquier asunto para copiarlo al portapapeles</p>
                    ${variants.map((subject, idx) => `
                        <div class="subject-line-item" onclick="copyToClipboard('''${subject.replace(/'/g, "'''")}''', ${idx})" id="subject-${idx}">
                            <span><strong>${idx + 1}.</strong> ${subject}</span>
                            <i class='bx bx-copy'></i>
                        </div>
                    `).join('')}
                    <div class="ai-modal-card">
                        <h4><i class='bx bx-info-circle'></i> Consejo</h4>
                        <p>Prueba A/B testing con estas variantes para encontrar cuál resuena mejor con tu audiencia.</p>
                    </div>
                    <button class="btn btn-secondary" onclick="closeSubjectLinesModal()">Cerrar</button>
                </div>
            </div>
        `;
    }
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSubjectLinesModal(); });
}

function closeSubjectLinesModal() {
    const modal = document.getElementById('subjectLinesModal');
    if (modal) modal.remove();
}

function copyToClipboard(text, index) {
    navigator.clipboard.writeText(text).then(() => {
        const element = document.getElementById(`subject-${index}`);
        const originalBg = element.style.background;
        element.style.background = '#10b981';
        element.style.color = 'white';
        element.querySelector('i').classList.replace('bx-copy', 'bx-check');
        setTimeout(() => {
            element.style.background = originalBg;
            element.style.color = '';
            element.querySelector('i').classList.replace('bx-check', 'bx-copy');
        }, 1500);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar al portapapeles');
    });
}

function viewCampaignDetails(campaignId) {
    console.log('Ver detalles de campaña:', campaignId);
    alert('Funcionalidad en desarrollo: Vista detallada de campaña');
}

function useTemplate(templateType) {
    console.log('Usar plantilla:', templateType);
    alert(`Funcionalidad en desarrollo: Usar plantilla ${templateType}`);
}

function setupCampaignsEventListeners() {
    const campaignsSection = document.getElementById('campaigns');
    if (!campaignsSection) return;
    
    const newCampaignBtn = campaignsSection.querySelector('.section-header .btn-primary');
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', () => {
            alert('Funcionalidad en desarrollo: Crear nueva campaña');
        });
    }
    console.log('✅ Event listeners de campañas configurados');
}

function getInsightIcon(index) {
    const icons = ['bx-trending-up', 'bx-target-lock', 'bx-time-five', 'bx-group', 'bx-bulb'];
    return icons[index % icons.length];
}