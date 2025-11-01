// automation.js - Lógica del frontend para Automatización

let currentFlows = [];
let currentTemplates = [];
let aiConfigured = false;

// ========== RENDER HELPERS (prevent ReferenceError) ========== 
function renderKPIs(stats = {}) {
    const activeFlows = stats.active_flows ?? (currentFlows.filter(f => f.status === 'active').length || 0);
    const usersInFlows = stats.users_in_flows ?? (currentFlows.reduce((s, f) => s + (f.users_count || 0), 0) || 0);
    const timeSaved = stats.time_saved_hours ?? stats.time_saved ?? 0;
    const revenue = stats.automated_revenue ?? stats.revenue ?? 0;

    return `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon blue"><i class='bx bx-git-branch'></i></div>
                <div class="kpi-content">
                    <span class="kpi-label">Flujos Activos</span>
                    <h2 class="kpi-value">${activeFlows}</h2>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon green"><i class='bx bx-user-check'></i></div>
                <div class="kpi-content">
                    <span class="kpi-label">Usuarios en Flujos</span>
                    <h2 class="kpi-value">${formatNumber(usersInFlows)}</h2>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon purple"><i class='bx bx-timer'></i></div>
                <div class="kpi-content">
                    <span class="kpi-label">Tiempo Ahorrado</span>
                    <h2 class="kpi-value">${timeSaved}h</h2>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon orange"><i class='bx bx-dollar'></i></div>
                <div class="kpi-content">
                    <span class="kpi-label">Revenue Automatizado</span>
                    <h2 class="kpi-value">$${formatNumber(revenue)}</h2>
                </div>
            </div>
        </div>
    `;
}

function renderAIStatus() {
    return `
        <div style="margin-top: 1rem; display:flex; justify-content:flex-end; gap:0.5rem; align-items:center;">
            <div style="font-size:0.875rem; color:var(--text-secondary);">IA:</div>
            <div style="font-weight:600; color:${aiConfigured ? 'var(--success)' : 'var(--text-secondary)'};">
                ${aiConfigured ? '<i class="bx bx-bot"></i> Activada' : '<i class="bx bx-slash"></i> No configurada'}
            </div>
        </div>
    `;
}

function renderFlows() {
    if (!currentFlows || currentFlows.length === 0) {
        return `<div style="padding:2rem; color:var(--text-secondary);">No hay flujos configurados aún. Usa "Nuevo Flujo" o importa una plantilla.</div>`;
    }

    return currentFlows.map(flow => {
        const statusClass = flow.status === 'active' ? 'active' : (flow.status === 'paused' ? 'paused' : '');
        const usersCount = flow.users_count || 0;
        const openRate = flow.metrics?.open_rate ? `${(flow.metrics.open_rate*100).toFixed(0)}%` : 'N/A';

        return `
            <div class="automation-card ${statusClass}" style="border-left: 4px solid ${flow.status === 'active' ? 'var(--success)' : flow.status === 'paused' ? 'var(--danger)' : 'var(--secondary)'};">
                <div class="automation-status">
                    <span class="status-badge ${flow.status === 'active' ? 'active' : ''}">${flow.status ? flow.status.charAt(0).toUpperCase() + flow.status.slice(1) : 'Borrador'}</span>
                    <div class="automation-stats"><span>${formatNumber(usersCount)} usuarios en flujo</span></div>
                </div>
                <div style="display:flex; align-items:start; justify-content:space-between; margin-bottom:0.75rem;">
                    <h4>${flow.name}</h4>
                    ${flow.ai_optimized ? "<i class='bx bx-bot' title='Optimizado por IA' style='color:var(--primary);'></i>" : ''}
                </div>
                <p style="color:var(--text-secondary);">${flow.description || ''}</p>
                <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                    <button class="btn-link" onclick="viewFlowDetails('${flow.id}')">Ver detalles</button>
                    <button class="btn-link" style="color:var(--text-secondary);" onclick="toggleFlowStatus('${flow.id}','${flow.status}')">
                        <i class='bx bx-pause-circle'></i> ${flow.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                    <button class="btn-link" style="color:var(--danger);" onclick="deleteFlow('${flow.id}')">
                        <i class='bx bx-trash'></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderTemplates() {
    if (!currentTemplates || currentTemplates.length === 0) {
        return `<div style="padding:1rem; color:var(--text-secondary);">No hay plantillas disponibles</div>`;
    }

    return currentTemplates.map(t => `
        <div class="segment-card">
            <div style="display:flex; align-items:start; justify-content:space-between; margin-bottom:0.75rem;">
                <div style="width:48px; height:48px; background:var(--bg-main); border-radius:0.75rem; display:flex; align-items:center; justify-content:center;">
                    <i class='bx bx-file'></i>
                </div>
                <span style="padding:0.25rem 0.5rem; background:#eff6ff; color:var(--primary); font-size:0.75rem; border-radius:0.375rem; font-weight:600;">${t.estimated_setup_time || '30 min'}</span>
            </div>
            <h4>${t.name}</h4>
            <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:1rem;">${t.description || ''}</p>
            <div style="display:flex; gap:1rem; font-size:0.75rem; color:var(--text-secondary); margin-bottom:1rem;">
                <span><i class='bx bx-time'></i> ${t.estimated_setup_time || '30 min'}</span>
                <span><i class='bx bx-star'></i> ${t.rating || '4.5/5'}</span>
            </div>
            <button class="btn btn-secondary" style="width:100%; justify-content:center;" onclick="useTemplate('${t.id}')">
                <i class='bx bx-plus'></i> Usar plantilla
            </button>
        </div>
    `).join('');
}

function renderInsights() {
    // Basic insights placeholder using stats from flows
    const totalFlows = currentFlows.length;
    const potentialRevenue = currentFlows.reduce((s, f) => s + (f.metrics?.revenue_generated || 0), 0);

    return `
        <div class="charts-grid" style="margin-top:2rem;">
            <div class="insights-card">
                <h4><i class='bx bxs-bulb'></i> Insights de Automatización</h4>
                <div class="insight-item">
                    <i class='bx bx-trending-up'></i>
                    <p><strong>Flujos totales:</strong> ${totalFlows}</p>
                </div>
                <div class="insight-item">
                    <i class='bx bx-dollar-circle'></i>
                    <p><strong>Revenue potencial:</strong> $${formatNumber(potentialRevenue)}</p>
                </div>
            </div>
        </div>
    `;
}

async function loadAutomationContent() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="bx bx-loader-alt bx-spin" style="font-size: 3rem; color: var(--primary);"></i><p>Cargando automatización...</p></div>';
    
    try {
        const [flowsResponse, templatesResponse, statsResponse, aiStatusResponse, usersCsvResponse] = await Promise.all([
            apiRequest('/api/v1/automation/flows'),
            apiRequest('/api/v1/automation/templates'),
            apiRequest('/api/v1/automation/stats'),
            apiRequest('/api/v1/automation/ai/status'),
            fetch('../../data/usuarios.csv').then(res => res.text())
        ]);
        
        currentFlows = flowsResponse.data || [];
        currentTemplates = templatesResponse.data || [];
        let stats = statsResponse.data || {};
        aiConfigured = aiStatusResponse.data?.ai_configured || false;
        
        if (!stats.automated_revenue) {
            stats.automated_revenue = currentFlows.reduce((total, flow) => total + (flow.metrics?.revenue_generated || 0), 0);
        }

        // Procesar datos de usuarios
        const users = parseCSV(usersCsvResponse);
        const newUsersCount = users.filter(u => u['Tipo Usuario'] === 'new').length;
        const inactiveUsersCount = users.filter(u => u['Tipo Usuario'] === 'inactive').length;

        // Actualizar conteos en los flujos
        currentFlows.forEach(flow => {
            if (flow.trigger_type === 'new_user') {
                flow.users_count = newUsersCount;
            } else if (flow.trigger_type === 'inactive_user') {
                flow.users_count = inactiveUsersCount;
            }
        });

        // Recalcular stats
        stats.users_in_flows = currentFlows.reduce((s, f) => s + (f.users_count || 0), 0);
        
        renderAutomationView(stats);
        
    } catch (error) {
        console.error('Error cargando automatización:', error);
        if (!mainContent) return;
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class='bx bx-error-circle' style='font-size: 3rem; color: var(--danger);'></i>
                <h3 style="margin-top: 1rem;">Error al cargar datos</h3>
                <p style="color: var(--text-secondary);">Se produjo un error al cargar los datos de automatización.</p>
                <p style="color: var(--text-secondary);"><strong>Detalles:</strong> ${error.message}</p>
                <button onclick="loadAutomationContent()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

function renderAutomationView(stats) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section id="automation" class="content-section active">
            <header class="section-header">
                <div>
                    <h1>Flujos de Automatización</h1>
                    <p class="subtitle">Configura secuencias inteligentes multicanal</p>
                </div>
                <button class="btn btn-primary" onclick="openCreateFlowModal()">
                    <i class='bx bx-plus'></i>
                    Nuevo Flujo
                </button>
            </header>

            ${renderKPIs(stats)}

            ${renderAIStatus()}

            <h3 style="margin: 2rem 0 1.5rem 0;">Flujos Configurados</h3>
            <div class="automation-grid" id="flowsContainer">
                ${renderFlows()}
            </div>

            <div style="margin-top: 3rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Plantillas de Automatización</h3>
                    <button class="btn btn-secondary" onclick="loadTemplates()">
                        <i class='bx bx-library'></i>
                        Ver todas las plantillas
                    </button>
                </div>
                <div class="segments-grid" id="templatesContainer">
                    ${renderTemplates()}
                </div>
            </div>

            ${renderInsights()}
        </section>
    `;
}

function createModal(title, content, footerButtons) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>${title}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer">${footerButtons}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showOptimizationResults(data) {
    const optimizations = data.optimizations || [];
    
    const content = `
        ${optimizations.map(opt => `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-main); border-radius: 0.75rem;">
                <h4 style="margin-bottom: 1rem;">${opt.step_name}</h4>
                
                <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 0.5rem; border: 2px solid var(--border);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem;">Original</div>
                    <div style="font-weight: 600;">${opt.original_subject}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem;">Variaciones Optimizadas:</div>
                    ${opt.variants?.map((variant, idx) => `
                        <div style="margin-bottom: 0.75rem; padding: 1rem; background: white; border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <div style="font-weight: 600;">${variant.subject}</div>
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--bg-main); border-radius: 0.25rem;">${variant.strategy}</span>
                            </div>
                        </div>
                    `).join('') || '<p style="color: var(--text-secondary);">No hay variantes disponibles</p>'}
                </div>
                
                ${opt.recommendation ? `
                    <div style="padding: 1rem; background: #eff6ff; border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                        <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">💡 Recomendación:</div>
                        <div style="font-size: 0.875rem;">${opt.recommendation}</div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
        
        <div style="padding: 1rem; background: #d1fae5; border-radius: 0.75rem; border-left: 3px solid var(--success);">
            <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">📈 Mejora Estimada</div>
            <div style="font-size: 0.875rem;">${data.predicted_improvement || 'Variable según implementación'}</div>
        </div>
    `;
    
    const footer = `
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cerrar</button>
        <button onclick="applyOptimizations('${data.flow_id}')" class="btn btn-primary">
            <i class='bx bx-check'></i> Aplicar Optimizaciones
        </button>
    `;
    
    createModal("<i class='bx bx-envelope'></i> Subject Lines Optimizados", content, footer);

}

function showPerformanceAnalysis(data) {
    const analysis = data.analysis || {};
    
    const content = `
        <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-main); border-radius: 0.75rem; text-align: center;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Evaluación General</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--primary); text-transform: capitalize;">
                ${analysis.overall_rating || 'N/A'}
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class='bx bx-check-circle' style="color: var(--success);"></i>
                Fortalezas Identificadas
            </h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${analysis.strengths?.map(strength => `
                    <li style="padding: 0.75rem; margin-bottom: 0.5rem; background: #d1fae5; border-radius: 0.5rem; border-left: 3px solid var(--success);">
                        <i class='bx bx-check' style="color: var(--success);"></i> ${strength}
                    </li>
                `).join('') || '<li style="color: var(--text-secondary);">No disponible</li>'}
            </ul>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class='bx bx-error-circle' style="color: var(--warning);"></i>
                Oportunidades de Mejora
            </h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${analysis.improvements?.map(improvement => `
                    <li style="padding: 0.75rem; margin-bottom: 0.5rem; background: #fef3c7; border-radius: 0.5rem; border-left: 3px solid var(--warning);">
                        <i class='bx bx-info-circle' style="color: var(--warning);"></i> ${improvement}
                    </li>
                `).join('') || '<li style="color: var(--text-secondary);">No disponible</li>'}
            </ul>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class='bx bx-list-check' style="color: var(--primary);"></i>
                Recomendaciones Priorizadas
            </h4>
            ${analysis.recommendations?.map(rec => {
                const priorityColors = {
                    'alta': 'var(--danger)',
                    'media': 'var(--warning)',
                    'baja': 'var(--success)'
                };
                return `
                    <div style="padding: 1rem; margin-bottom: 0.75rem; background: white; border-radius: 0.5rem; border-left: 3px solid ${priorityColors[rec.priority] || 'var(--primary)'};">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div style="font-weight: 600;">${rec.action}</div>
                            <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--bg-main); border-radius: 0.25rem; text-transform: uppercase;">
                                ${rec.priority}
                            </span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            💡 ${rec.impact}
                        </div>
                    </div>
                `;
            }).join('') || '<p style="color: var(--text-secondary);">No disponible</p>'}
        </div>
        
        <div style="padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.75rem; color: white;">
            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">📊 Predicción de Mejora</div>
            <div style="font-size: 1.25rem; font-weight: 600;">${analysis.predicted_improvement || 'Variable según cambios aplicados'}</div>
        </div>
    `;
    
    const footer = `
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cerrar</button>
        <button onclick="downloadAnalysisReport('${data.flow_id}')" class="btn btn-primary">
            <i class='bx bx-download'></i> Descargar Reporte
        </button>
    `;
    
    createModal("<i class='bx bx-line-chart'></i> Análisis de Rendimiento", content, footer);
}

function showImprovementSuggestions(data) {
    const suggestions = data.suggestions || {};
    
    const content = `
        ${suggestions.add_steps?.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">➕ Pasos Sugeridos para Agregar</h4>
                ${suggestions.add_steps.map(step => `
                    <div style="padding: 1rem; margin-bottom: 0.75rem; background: var(--bg-main); border-radius: 0.5rem; border-left: 3px solid var(--success);">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">${step.name} (${step.type})</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                            📍 ${step.position}
                        </div>
                        <div style="font-size: 0.875rem;">
                            ${step.reason}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${suggestions.optimize_steps?.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">⚡ Optimizaciones de Pasos Existentes</h4>
                ${suggestions.optimize_steps.map(opt => `
                    <div style="padding: 1rem; margin-bottom: 0.75rem; background: var(--bg-main); border-radius: 0.5rem; border-left: 3px solid var(--warning);">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">${opt.step}</div>
                        <div style="font-size: 0.875rem;">
                            💡 ${opt.suggestion}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${suggestions.delay_recommendations?.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">⏱️ Recomendaciones de Timing</h4>
                ${suggestions.delay_recommendations.map(delay => `
                    <div style="padding: 1rem; margin-bottom: 0.75rem; background: var(--bg-main); border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div style="font-weight: 600;">${delay.between}</div>
                            <span style="padding: 0.25rem 0.5rem; background: white; border-radius: 0.25rem; font-size: 0.875rem;">
                                ${delay.suggested_hours}h
                            </span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${delay.reason}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${suggestions.personalization_opportunities?.length > 0 ? `
            <div>
                <h4 style="margin-bottom: 1rem;">✨ Oportunidades de Personalización</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${suggestions.personalization_opportunities.map(opp => `
                        <li style="padding: 0.75rem; margin-bottom: 0.5rem; background: #eff6ff; border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                            <i class='bx bx-star' style="color: var(--primary);"></i> ${opp}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
    `;
    
    const footer = `
        <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cerrar</button>
        <button onclick="applySuggestions('${data.flow_id}')" class="btn btn-primary">
            <i class='bx bx-check'></i> Aplicar Sugerencias
        </button>
    `;
    
    createModal("<i class='bx bx-bulb'></i> Sugerencias de Mejora", content, footer);
}

// ========== GESTIÓN DE PLANTILLAS ========== 

async function useTemplate(templateId) {
    const customName = prompt('Nombre para el nuevo flujo (opcional):');
    
    try {
        showLoading('Creando flujo desde plantilla...');
        
        const response = await apiRequest(`/api/v1/automation/templates/${templateId}/use`, {
            method: 'POST',
            body: JSON.stringify({ custom_name: customName })
        });
        
        hideLoading();
        
        if (response.status === 'success') {
            showNotification('Flujo creado exitosamente', 'success');
            window.navigateToSection('automation');
        }
    } catch (error) {
        hideLoading();
        console.error('Error using template:', error);
        showNotification('Error al crear flujo desde plantilla', 'error');
    }
}

// ========== MODALES DE CREACIÓN/EDICIÓN ========== 

function openCreateFlowModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Crear Nuevo Flujo</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="createFlowForm">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nombre del Flujo</label>
                        <input type="text" name="name" required 
                               style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem;"
                               placeholder="Ej: Bienvenida Nuevos Usuarios">
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Descripción</label>
                        <textarea name="description" rows="3" required
                                  style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem;"
                                  placeholder="Describe qué hace este flujo"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Trigger</label>
                        <select name="trigger_type" required
                                style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem;">
                            <option value="">Selecciona un trigger</option>
                            <option value="new_user">Nuevo Usuario</option>
                            <option value="cart_abandoned">Carrito Abandonado</option>
                            <option value="purchase">Compra Realizada</option>
                            <option value="birthday">Cumpleaños</option>
                            <option value="inactive_user">Usuario Inactivo</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    
                    <div style="padding: 1rem; background: #eff6ff; border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                        <div style="font-size: 0.875rem;">
                            💡 Después de crear el flujo, podrás agregar los pasos y configurar las acciones
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cancelar</button>
                <button onclick="submitCreateFlow()" class="btn btn-primary">
                    <i class='bx bx-check'></i> Crear Flujo
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function submitCreateFlow() {
    const form = document.getElementById('createFlowForm');
    const formData = new FormData(form);
    
    const flowData = {
        name: formData.get('name'),
        description: formData.get('description'),
        trigger_type: formData.get('trigger_type'),
        status: 'draft',
        steps: [
            {
                step_id: 'trigger_1',
                type: 'trigger',
                name: 'Trigger inicial',
                config: { trigger_type: formData.get('trigger_type') },
                next_steps: []
            }
        ]
    };
    
    try {
        showLoading('Creando flujo...');
        
        const response = await apiRequest('/api/v1/automation/flows', {
            method: 'POST',
            body: JSON.stringify(flowData)
        });
        
        hideLoading();
        
        if (response.status === 'success') {
            showNotification('Flujo creado exitosamente', 'success');
            document.querySelector('.modal-overlay').remove();
            window.navigateToSection('automation');
        }
    } catch (error) {
        hideLoading();
        console.error('Error creating flow:', error);
        showNotification('Error al crear flujo: ' + error.message, 'error');
    }
}

function editFlow(flowId) {
    showNotification('Editor de flujos en desarrollo. Por ahora usa los endpoints de API directamente.', 'info');
    // TODO: Implementar editor visual de flujos
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// ========== UTILIDADES ========== 

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',');
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j].trim()] = values[j].trim();
            }
            data.push(entry);
        }
    }
    return data;
}


function formatTriggerType(type) {
    const types = {
        'new_user': 'Nuevo Usuario',
        'cart_abandoned': 'Carrito Abandonado',
        'purchase': 'Compra Realizada',
        'birthday': 'Cumpleaños',
        'inactive_user': 'Usuario Inactivo',
        'custom': 'Personalizado'
    };
    return types[type] || type;
}

function formatStepType(type) {
    const types = {
        'trigger': '🎯 Trigger',
        'email': '📧 Email',
        'social_post': '📱 Post Social',
        'delay': '⏱️ Delay',
        'condition': '🔀 Condición',
        'action': '⚡ Acción'
    };
    return types[type] || type;
}

function showLoading(message = 'Cargando...') {
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    loading.innerHTML = `
        <div style="background: white; padding: 2rem 3rem; border-radius: 1rem; text-align: center;">
            <i class='bx bx-loader-alt bx-spin' style='font-size: 3rem; color: var(--primary);'></i>
            <p style="margin-top: 1rem; font-weight: 600;">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.remove();
    }
}

function testAIFeatures() {
    showNotification('Funciones de IA disponibles. Usa "Optimizar IA" en cualquier flujo para probarlas.', 'success');
}

async function applyOptimizations(flowId) {
    console.log(`Applying optimizations for flow ${flowId}`);
    showLoading('Aplicando optimizaciones...');
    try {
        // Simulación de llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        hideLoading();
        showNotification('Optimizaciones aplicadas. En producción, esto actualizaría el flujo.', 'success');
        document.querySelector('.modal-overlay').remove();
    } catch (error) {
        hideLoading();
        showNotification('Error al aplicar optimizaciones', 'error');
    }
}

async function applySuggestions(flowId) {
    console.log(`Applying suggestions for flow ${flowId}`);
    showLoading('Aplicando sugerencias...');
    try {
        // Simulación de llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        hideLoading();
        showNotification('Sugerencias aplicadas. En producción, esto actualizaría el flujo.', 'success');
        document.querySelector('.modal-overlay').remove();
    } catch (error) {
        hideLoading();
        showNotification('Error al aplicar sugerencias', 'error');
    }
}

function downloadAnalysisReport(flowId) {
    console.log(`Downloading analysis report for flow ${flowId}`);
    showNotification('Descarga de reporte en desarrollo', 'info');
    // Lógica para generar y descargar el reporte
}



// ========== ACCIONES DE FLUJOS ========== 

async function toggleFlowStatus(flowId, currentStatus) {
    try {
        const response = await apiRequest(`/api/v1/automation/flows/${flowId}/toggle`, {
            method: 'POST'
        });
        
        if (response.status === 'success') {
            showNotification(response.data.message, 'success');
            window.navigateToSection('automation'); // Recargar vista
        }
    } catch (error) {
        console.error('Error toggle status:', error);
        showNotification('Error al cambiar estado del flujo', 'error');
    }
}

async function deleteFlow(flowId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este flujo? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        showLoading('Eliminando flujo...');
        const response = await apiRequest(`/api/v1/automation/flows/${flowId}`, {
            method: 'DELETE'
        });
        hideLoading();

        if (response.status === 'success') {
            showNotification('Flujo eliminado exitosamente', 'success');
            window.navigateToSection('automation');
        }
    } catch (error) {
        hideLoading();
        console.error('Error deleting flow:', error);
        showNotification('Error al eliminar el flujo: ' + error.message, 'error');
    }
}


async function viewFlowDetails(flowId) {
    try {
        const response = await apiRequest(`/api/v1/automation/flows/${flowId}`);
        const flow = response.data;
        
        // Mostrar modal con detalles
        showFlowDetailsModal(flow);
    } catch (error) {
        console.error('Error loading flow details:', error);
        showNotification('Error al cargar detalles del flujo', 'error');
    }
}

function showFlowDetailsModal(flow) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>${flow.name}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${flow.description}</p>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Estructura del Flujo</h4>
                    <div style="background: var(--bg-main); padding: 1.5rem; border-radius: 0.75rem;">
                        ${flow.steps.map((step, index) => `
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: ${index < flow.steps.length - 1 ? '1rem' : '0'}; padding-bottom: ${index < flow.steps.length - 1 ? '1rem' : '0'}; border-bottom: ${index < flow.steps.length - 1 ? '1px solid var(--border)' : 'none'};">
                                <div style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                                    ${index + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">${step.name}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                        ${formatStepType(step.type)}
                                        ${step.delay_hours ? ` • Delay: ${step.delay_hours}h` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 1rem;">Métricas de Rendimiento</h4>
                    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        <div class="kpi-card">
                            <span class="kpi-label">Tasa Apertura</span>
                            <h3>${flow.metrics?.open_rate?.toFixed(1) || 0}%</h3>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-label">CTR</span>
                            <h3>${flow.metrics?.click_rate?.toFixed(1) || 0}%</h3>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-label">Conversión</span>
                            <h3>${flow.metrics?.conversion_rate?.toFixed(1) || 0}%</h3>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-label">Revenue</span>
                            <h3>$${formatNumber(flow.metrics?.revenue_generated || 0)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cerrar</button>
                <button onclick="editFlow('${flow.id}')" class="btn btn-primary">
                    <i class='bx bx-edit'></i> Editar Flujo
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function optimizeFlow(flowId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2><i class='bx bx-brain'></i> Optimizar con IA</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 2rem;">Selecciona qué aspectos quieres optimizar:</p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="optimizeSubjectLines('${flowId}')">
                        <i class='bx bx-envelope'></i>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600;">Subject Lines</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">Generar variaciones optimizadas para A/B testing</div>
                        </div>
                    </button>
                    
                    <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="analyzePerformance('${flowId}')">
                        <i class='bx bx-line-chart'></i>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600;">Análisis de Rendimiento</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">Obtener insights y recomendaciones</div>
                        </div>
                    </button>
                    
                    <button class="btn btn-secondary" style="justify-content: flex-start; padding: 1rem;" onclick="suggestImprovements('${flowId}')">
                        <i class='bx bx-bulb'></i>
                        <div style="text-align: left; flex: 1;">
                            <div style="font-weight: 600;">Sugerencias de Mejora</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">Mejorar estructura y configuración del flujo</div>
                        </div>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function optimizeSubjectLines(flowId) {
    showLoading('Optimizando subject lines con IA...');
    
    try {
        const response = await apiRequest('/api/v1/automation/ai/optimize-subjects', {
            method: 'POST',
            body: JSON.stringify({ flow_id: flowId })
        });
        
        hideLoading();
        
        if (response.status === 'success') {
            showOptimizationResults(response.data);
        }
    } catch (error) {
        hideLoading();
        console.error('Error optimizing:', error);
        showNotification('Error al optimizar subject lines', 'error');
    }
}

async function analyzePerformance(flowId) {
    showLoading('Analizando rendimiento con IA...');
    
    try {
        const response = await apiRequest('/api/v1/automation/ai/analyze-performance', {
            method: 'POST',
            body: JSON.stringify({ flow_id: flowId })
        });
        
        hideLoading();
        
        if (response.status === 'success') {
            showPerformanceAnalysis(response.data);
        }
    } catch (error) {
        hideLoading();
        console.error('Error analyzing:', error);
        showNotification('Error al analizar rendimiento', 'error');
    }
}

async function suggestImprovements(flowId) {
    showLoading('Generando sugerencias con IA...');
    
    try {
        const response = await apiRequest('/api/v1/automation/ai/suggest-improvements', {
            method: 'POST',
            body: JSON.stringify({ flow_id: flowId, industry: 'general' })
        });
        
        hideLoading();
        
        if (response.status === 'success') {
            showImprovementSuggestions(response.data);
        }
    } catch (error) {
        hideLoading();
        console.error('Error suggesting:', error);
        showNotification('Error al generar sugerencias', 'error');
    }
}

window.loadAutomationContent = loadAutomationContent;