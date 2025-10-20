async function loadCampaignsContent() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div style="text-align: center; padding: 64px 24px;">
            <i class='bx bx-loader-alt bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 16px; color: #64748b;">Cargando campañas...</p>
        </div>
    `;

    try {
        const [overviewRes, activeRes, templatesRes, insightsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/campaigns/overview`),
            fetch(`${API_BASE_URL}/api/v1/campaigns/active`),
            fetch(`${API_BASE_URL}/api/v1/campaigns/templates`),
            fetch(`${API_BASE_URL}/api/v1/campaigns/ai-insights`).catch(() => ({ ok: false }))
        ]);

        if (!overviewRes.ok || !activeRes.ok || !templatesRes.ok) {
            throw new Error('Error al cargar los datos de campañas. Verifica la conexión con el backend.');
        }

        const overviewData = await overviewRes.json();
        const activeData = await activeRes.json();
        const templatesData = await templatesRes.json();
        const insightsData = insightsRes.ok ? await insightsRes.json() : { success: false };

        if (!overviewData.success || !activeData.success || !templatesData.success) {
            throw new Error('Los datos de campañas recibidos no son válidos.');
        }

        const overview = overviewData.data || {};
        const activeCampaigns = activeData.data.campaigns || [];
        const templates = templatesData.data.templates || [];
        const insights = (insightsData.success && insightsData.data.insights) ? insightsData.data.insights : [];

        mainContent.innerHTML = renderCampaignsHTML(overview, activeCampaigns, templates, insights);

        addSegmentationStyles();
        setupCampaignsEventListeners();
        animateElements();

    } catch (error) {
        console.error('[loadCampaignsContent] Error:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 64px 24px;">
                <i class='bx bx-error' style='font-size: 48px; color: #ef4444;'></i>
                <h2 style="margin-top: 24px; color: #0f172a;">Error al cargar campañas</h2>
                <p style="color: #64748b; margin-top: 8px;">${error.message}</p>
                <button onclick="loadCampaignsContent()" class="btn btn-primary" style="margin-top: 24px;">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

function renderCampaignsHTML(overview, campaigns, templates, insights) {
    const campaignsHTML = campaigns.map(campaign => {
        try {
            return renderCampaignCard(campaign);
        } catch (e) {
            console.error('[Render Error] Failed to render campaign card:', e, campaign);
            return '<div class="segment-card error-card"><p>Error al mostrar esta campaña</p></div>';
        }
    }).join('');

    const templatesHTML = templates.map(template => {
        try {
            return renderTemplateItem(template);
        } catch (e) {
            console.error('[Render Error] Failed to render template item:', e, template);
            return '<div class="activity-item error-card"><p>Error al mostrar esta plantilla</p></div>';
        }
    }).join('');

    const insightsHTML = insights.map((insight, idx) => {
        try {
            return renderInsightItem(insight, idx);
        } catch (e) {
            console.error('[Render Error] Failed to render insight item:', e, insight);
            return '<div class="insight-item error-card"><p>Error al mostrar este insight</p></div>';
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

        <div class="campaign-performance">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3>Campañas Activas y Recientes</h3>
                <button class="btn btn-secondary" onclick="loadCampaignsContent()" style="font-size: 0.875rem;">
                    <i class='bx bx-refresh'></i> Actualizar
                </button>
            </div>
            <div class="segments-grid" id="campaigns-active-grid">
                ${campaigns.length > 0 ? campaignsHTML : `
                    <div class="segment-card" style="text-align: center; padding: 2rem;">
                        <i class='bx bx-info-circle' style='font-size: 48px; color: var(--text-secondary); opacity: 0.5;'></i>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">No hay campañas disponibles</p>
                    </div>
                `}
            </div>
        </div>

        <div class="activity-section" id="campaigns-templates-section" style="margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3>Plantillas de Email Disponibles</h3>
                <button class="btn btn-secondary" onclick="generateSubjectLines(null)" style="font-size: 0.875rem;">
                    <i class='bx bx-brain'></i> Generar Asuntos con IA
                </button>
            </div>
            <div class="activity-list" id="campaigns-templates-list">
                ${templates.length > 0 ? templatesHTML : `
                    <div class="activity-item" style="justify-content: center;">
                        <i class='bx bx-info-circle' style='font-size: 24px; color: var(--text-secondary);'></i>
                        <span style="margin-left: 1rem; color: var(--text-secondary);">No hay plantillas disponibles</span>
                    </div>
                `}
            </div>
        </div>

        <div class="campaign-performance" style="margin-top: 2rem;">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3>Insights Inteligentes</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                        Recomendaciones personalizadas basadas en tu histórico
                    </p>
                </div>
                <button class="btn btn-secondary" onclick="loadCampaignsContent()" style="font-size: 0.875rem;">
                    <i class='bx bx-brain'></i> Actualizar Insights
                </button>
            </div>
            <div class="ai-insights-container">
                <div class="segment-card" id="ai-insights-card">
                    ${insights.length > 0 ? `<div style="display: grid; gap: 1rem;">${insightsHTML}</div>` : `
                        <div style="text-align: center; padding: 2rem;">
                            <i class='bx bx-brain' style='font-size: 48px; color: var(--primary); opacity: 0.5;'></i>
                            <p style="margin-top: 1rem; color: var(--text-secondary);">No hay suficientes datos para generar insights.</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    </section>
    `;
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
    return `
        <div class="segment-card" data-campaign-id="${campaign.id || ''}">
            <div class="segment-header">
                <h4>${campaign.name || 'Campaña sin nombre'}</h4>
                <span class="segment-badge ${status.toLowerCase() === 'activa' ? 'success' : ''}">${status}</span>
            </div>
            <p>${getCampaignDescription(campaign)}</p>
            <div class="segment-stats">
                <span><i class='bx bx-group'></i> ${(campaign.recipients || 0).toLocaleString()} destinatarios</span>
                <span><i class='bx bx-${status === 'Programada' ? 'calendar' : 'time'}'></i> ${campaign.time_info || 'N/A'}</span>
            </div>
            <div class="automation-metrics">
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
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn-link" onclick="analyzeCampaignWithAI('${campaign.id || ''}')">
                    <i class='bx bx-brain'></i> Analizar con IA
                </button>
                <button class="btn-link" onclick="viewCampaignDetails('${campaign.id || ''}')">
                    Ver detalles
                </button>
            </div>
        </div>
    `;
}

function renderTemplateItem(template = {}) {
    return `
        <div class="activity-item">
            <i class='bx ${template.icon || 'bx-file'}' style="font-size: 24px; color: var(--primary);"></i>
            <div style="flex: 1;">
                <strong>${template.name || 'Plantilla sin nombre'}</strong>
                <span style="display: block; color: var(--text-secondary); font-size: 0.875rem;">
                    ${template.description || 'Sin descripción.'}
                </span>
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
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
    
    if (isLoading) {
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; padding: 3rem; text-align: center;">
                <i class='bx bx-brain bx-spin' style='font-size: 64px; color: var(--primary);'></i>
                <h3 style="margin-top: 1.5rem;">Analizando campaña con IA...</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Esto puede tomar unos segundos</p>
            </div>
        `;
    } else {
        const analysis = data.analysis;
        const campaign = data.campaign;
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class='bx bx-brain'></i> Análisis IA: ${campaign.name}</h3>
                    <button class="modal-close" onclick="closeAIAnalysisModal()"><i class='bx bx-x'></i></button>
                </div>
                <div class="modal-body">
                    ${analysis.performance_summary ? `<div class="ai-persona-card"><h4><i class='bx bx-bar-chart-alt-2'></i> Resumen de Rendimiento</h4><p>${analysis.performance_summary}</p></div>` : ''}
                    <div class="ai-persona-card">
                        <h4><i class='bx bx-bulb'></i> Insights Clave</h4>
                        <ul style="margin: 0; padding-left: 1.5rem;">${(analysis.insights || []).map(insight => `<li style="margin-bottom: 0.75rem;">${insight}</li>`).join('')}</ul>
                    </div>
                    <div class="ai-recommendations-card">
                        <h4><i class='bx bx-trending-up'></i> Recomendaciones</h4>
                        ${(analysis.recommendations || []).map((rec, idx) => `<div class="ai-recommendation-item"><strong>${idx + 1}. </strong>${rec}</div>`).join('')}
                    </div>
                    ${analysis.predicted_improvement ? `<div class="ai-persona-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"><h4 style="color: white;"><i class='bx bx-trophy'></i> Mejora Esperada</h4><p style="color: white; opacity: 0.95;">${analysis.predicted_improvement}</p></div>` : ''}
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="btn btn-primary" onclick="generateSubjectLines('${campaignId}')"><i class='bx bx-bulb'></i> Generar Asuntos con IA</button>
                        <button class="btn btn-secondary" onclick="closeAIAnalysisModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    }
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
    
    if (isLoading) {
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; padding: 3rem; text-align: center;">
                <i class='bx bx-bulb bx-spin' style='font-size: 64px; color: var(--primary);'></i>
                <h3 style="margin-top: 1.5rem;">Generando asuntos optimizados...</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Creando variantes persuasivas con IA</p>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3><i class='bx bx-envelope'></i> Líneas de Asunto Generadas con IA</h3>
                    <button class="modal-close" onclick="closeSubjectLinesModal()"><i class='bx bx-x'></i></button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Haz clic en cualquier asunto para copiarlo al portapapeles</p>
                    ${variants.map((subject, idx) => `
                        <div class="ai-recommendation-item" style="cursor: pointer; transition: all 0.2s;" onclick="copyToClipboard('''${subject.replace(/'/g, "'")}''', ${idx})" id="subject-${idx}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>${idx + 1}.</strong> ${subject}</span>
                                <i class='bx bx-copy' style="color: var(--primary); font-size: 20px;"></i>
                            </div>
                        </div>
                    `).join('')}
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;"><i class='bx bx-info-circle'></i> Consejo</h4>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">Prueba A/B testing con estas variantes para encontrar cuál resuena mejor con tu audiencia.</p>
                    </div>
                    <button class="btn btn-secondary" onclick="closeSubjectLinesModal()" style="margin-top: 1rem; width: 100%;">Cerrar</button>
                </div>
            </div>
        `;
    }
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