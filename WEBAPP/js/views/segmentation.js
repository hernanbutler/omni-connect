// Lógica para la sección de Segmentación

// Global chart instances for segmentation
let segmentDistributionChart = null;
let clvBySegmentChart = null;
let currentSegmentData = null;

/**
 * Formatea un número de forma segura para mostrarlo en la UI.
 * Maneja números, strings numéricos, null y undefined.
 * @param {number|string} value El valor a formatear.
 * @param {string} defaultString El valor a devolver si el valor no es un número válido.
 * @returns {string} El número formateado o el valor por defecto.
 */
function formatNumber(value, defaultString = '-') {
    if (value === null || typeof value === 'undefined') {
        return defaultString;
    }

    // Handle empty strings specifically, as Number('') is 0.
    if (typeof value === 'string' && value.trim() === '') {
        return defaultString;
    }

    const num = Number(value);

    if (!isNaN(num)) {
        return num.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    return defaultString;
}

// Cargar datos de segmentación
async function loadSegmentationContent() {
    const mainContent = document.getElementById('mainContent');
    
    // Mostrar loading
    mainContent.innerHTML = `
        <div class="u-flex-center" style="height: 400px;">
            <div class="u-text-center">
                <i class='bx bx-loader bx-spin' style='font-size: 48px; color: #6366f1;'></i>
                <p class="u-muted u-mt-1">Cargando segmentación...</p>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/segmentation`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(data.error);
        }
        
        // Guardar datos globalmente
        currentSegmentData = data;
        
        // Renderizar vista completa
        renderSegmentationView(data);
        
        // Inicializar gráficos
        setTimeout(() => initializeSegmentationCharts(data), 100);
        
    } catch (error) {
        console.error('Error loading segmentation:', error);
        mainContent.innerHTML = `
            <div class="u-text-center u-p-2">
                <i class='bx bx-error-circle' style='font-size: 64px; color: #ef4444;'></i>
                <h2 class="u-mt-1">Error al cargar segmentación</h2>
                <p class="u-muted u-mt-1">${error.message}</p>
                <button onclick="loadSegmentationContent()" class="btn btn-primary u-mt-1">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

function renderSegmentationView(data) {
    const mainContent = document.getElementById('mainContent');
    const kpis = data.kpis || {};
    const segments = data.segments || {};
    
    mainContent.innerHTML = `
        <section id="segmentation" class="content-section active">
            <header class="section-header">
                <div>
                    <h1>Segmentación Inteligente</h1>
                    <p class="subtitle">Análisis RFM + Machine Learning + ChatGPT</p>
                </div>
                <button class="btn btn-primary">
                    <i class='bx bx-plus'></i>
                    Crear Segmento
                </button>
            </header>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon blue">
                        <i class='bx bx-group'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Total Clientes</span>
                        <h2 class="kpi-value">${formatNumber(kpis.total_clientes)}</h2>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon purple">
                        <i class='bx bx-shape-circle'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Segmentos Activos</span>
                        <h2 class="kpi-value">${formatNumber(kpis.segmentos_activos)}</h2>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon green">
                        <i class='bx bx-dollar-circle'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">CLV Promedio</span>
                        <h2 class="kpi-value">$${formatNumber(kpis.clv_promedio)}</h2>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon orange">
                        <i class='bx bx-bot'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Clusters ML</span>
                        <h2 class="kpi-value">${formatNumber(kpis.segmentos_ia)}</h2>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">K-Means</span>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-grid u-mb-1-5">
                <div class="chart-card">
                    <h3>Distribución de Segmentos</h3>
                    <canvas id="segmentDistributionChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>CLV Total por Segmento</h3>
                    <canvas id="clvBySegmentChart"></canvas>
                </div>
            </div>

            <!-- Segments Grid -->
            <h3 style="margin-bottom: 1.5rem;">Segmentos Existentes</h3>
            <div class="segments-grid">
                ${generateSegmentCard('VIP Champions', 'compradores_vip', segments.compradores_vip, '#10b981', '🏆')}
                ${generateSegmentCard('En Riesgo', 'en_riesgo_churn', segments.en_riesgo_churn, '#ef4444', '⚠️')}
                ${generateSegmentCard('Promesa', 'promesa', segments.promesa, '#6366f1', '⭐')}
                ${generateSegmentCard('Leales', 'leales', segments.leales, '#10b981', '💚')}
                ${generateSegmentCard('Hibernando', 'hibernando', segments.hibernando, '#f59e0b', '😴')}
                ${generateSegmentCard('Perdidos', 'perdidos', segments.perdidos, '#64748b', '💤')}
            </div>
        </section>

            <!-- AI Modal -->
        <div id="aiInsightsModal" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class='bx bxs-brain'></i> Insights de IA - <span id="modalSegmentName"></span></h3>
                    <button class="modal-close" onclick="closeAIModal()">&times;</button>
                </div>
                <div class="modal-body" id="aiInsightsContent"></div>
            </div>
        </div>
    `;
    
    // Añadir estilos
    addSegmentationStyles();
    // Animate cards
    animateElements();
}

function generateSegmentCard(title, key, data, color, emoji) {
    const safeData = data || {};
    return `
        <div class="segment-card" style="border-left: 4px solid ${color};">
            <div class="segment-header">
                <h4>${emoji} ${title}</h4>
                <span class="segment-badge">${formatNumber(safeData.usuarios)} usuarios (${formatNumber(safeData.porcentaje)}%)</span>
            </div>
            <p>${getSegmentDescription(key)}</p>
            <div class="segment-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem;">
                ${getSegmentStats(key, safeData)}
            </div>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;" onclick="generateAIInsights('${key}')">
                <i class='bx bxs-magic-wand'></i> Generar Insights con IA
            </button>
        </div>
    `;
}

function getSegmentDescription(key) {
    const descriptions = {
        'compradores_vip': 'Clientes de alto valor con compras frecuentes y engagement excepcional.',
        'en_riesgo_churn': 'Alta probabilidad de abandono. Acción inmediata requerida.',
        'promesa': 'Nuevos clientes con alto potencial de crecimiento.',
        'leales': 'Clientes regulares con buen engagement y compras consistentes.',
        'hibernando': 'Ocasionales con bajo engagement. Oportunidad de reactivación.',
        'perdidos': 'Inactivos con engagement muy bajo. Difícil recuperación.'
    };
    return descriptions[key] || '';
}

function getSegmentStats(key, data) {
    const stats = {
        'compradores_vip': `
            <span><i class='bx bx-dollar'></i> CLV: <strong>$${formatNumber(data.clv_promedio)}</strong></span>
            <span><i class='bx bx-trending-up'></i> Engagement: <strong>${formatNumber(data.engagement_promedio)}%</strong></span>
        `,
        'en_riesgo_churn': `
            <span><i class='bx bx-error'></i> CLV en Riesgo: <strong>$${formatNumber(data.clv_potencial_perdido)}</strong></span>
            <span><i class='bx bx-trending-down'></i> Riesgo: <strong>${formatNumber(data.riesgo_promedio)}%</strong></span>
        `,
        'promesa': `
            <span><i class='bx bx-line-chart'></i> Engagement: <strong>${formatNumber(data.engagement_promedio)}%</strong></span>
            <span><i class='bx bx-dollar'></i> Potencial: <strong>$${formatNumber(data.potencial_estimado)}</strong></span>
        `,
        'leales': `
            <span><i class='bx bx-dollar'></i> CLV: <strong>$${formatNumber(data.clv_promedio)}</strong></span>
            <span><i class='bx bx-cart'></i> Compras: <strong>${formatNumber(data.compras_promedio)}</strong></span>
        `,
        'hibernando': `
            <span><i class='bx bx-chart-line'></i> Engagement: <strong>${formatNumber(data.engagement_promedio)}%</strong></span>
            <span><i class='bx bx-refresh'></i> Recuperación: <strong>$${formatNumber(data.potencial_recuperacion)}</strong></span>
        `,
        'perdidos': `
            <span><i class='bx bx-error-circle'></i> Engagement: <strong>${formatNumber(data.engagement_promedio)}%</strong></span>
            <span><i class='bx bx-dollar'></i> Valor Perdido: <strong>$${formatNumber(data.valor_perdido)}</strong></span>
        `
    };
    return stats[key] || '';
}

function initializeSegmentationCharts(data) {
    if (segmentDistributionChart) segmentDistributionChart.destroy();
    if (clvBySegmentChart) clvBySegmentChart.destroy();
    
    const distributionData = data.charts.segment_distribution;
    const clvData = data.charts.clv_by_segment;
    
    // Distribution Chart
    const distCtx = document.getElementById('segmentDistributionChart');
    if (distCtx && distributionData) {
        const labels = distributionData.map(item => item.segment);
        const counts = distributionData.map(item => item.count);
        const colors = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#a855f7', '#64748b'];
        
        segmentDistributionChart = new Chart(distCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const percentage = distributionData[context.dataIndex].percentage;
                                return context.label + ': ' + formatNumber(context.parsed) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // CLV by Segment Chart
    const clvCtx = document.getElementById('clvBySegmentChart');
    if (clvCtx && clvData) {
        const labels = clvData.map(item => item.segment);
        const clvTotals = clvData.map(item => item.clv_total);
        const colors = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#a855f7', '#64748b'];
        
        clvBySegmentChart = new Chart(clvCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CLV Total',
                    data: clvTotals,
                    backgroundColor: colors,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return 'CLV Total: $' + formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return '$' + formatNumber(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }
}

async function generateAIInsights(segmentName) {
    const modal = document.getElementById('aiInsightsModal');
    const modalTitle = document.getElementById('modalSegmentName');
    const modalContent = document.getElementById('aiInsightsContent');
    
    const segmentDisplayNames = {
        'compradores_vip': 'VIP Champions',
        'en_riesgo_churn': 'En Riesgo de Churn',
        'promesa': 'Promesa',
        'leales': 'Leales',
        'hibernando': 'Hibernando',
        'perdidos': 'Perdidos'
    };
    
    modalTitle.textContent = segmentDisplayNames[segmentName] || segmentName;
    
    modalContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class='bx bx-loader bx-spin' style='font-size: 48px; color: var(--primary);'></i>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Generando insights con ChatGPT...</p>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Esto puede tomar unos segundos</p>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    try {
        const statusResponse = await fetch(`${API_BASE_URL}/api/v1/segmentation/ai/status`);
        const status = await statusResponse.json();
        
        if (!status.configured) {
            modalContent.innerHTML = `
                <div class="ai-persona-card" style="border-left: 4px solid var(--danger);">
                    <h4><i class='bx bx-error-circle'></i> API de OpenAI no configurada</h4>
                    <p>${status.message}</p>
                    <p style="margin-top: 1rem;">Para usar esta función:</p>
                    <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>Crea un archivo <code>.env</code> en la raíz del proyecto</li>
                        <li>Añade tu API key: <code>OPENAI_API_KEY=tu-api-key-aqui</code></li>
                        <li>Reinicia el servidor backend</li>
                    </ol>
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                        Obtén tu API key en: <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a>
                    </p>
                </div>
            `;
            return;
        }
        
        const personaResponse = await fetch(`${API_BASE_URL}/api/v1/segmentation/ai/persona/${segmentName}`, {
            method: 'POST'
        });
        const personaData = await personaResponse.json();
        
        const recsResponse = await fetch(`${API_BASE_URL}/api/v1/segmentation/ai/recommendations/${segmentName}`, {
            method: 'POST'
        });
        const recsData = await recsResponse.json();
        
    renderSegmentationAIInsights(personaData, recsData);
        
    } catch (error) {
        console.error('Error generating AI insights:', error);
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: var(--danger);'></i>
                <h3 style="margin-top: 1rem;">Error al generar insights</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${error.message}</p>
                <button onclick="closeAIModal()" class="btn btn-secondary" style="margin-top: 1.5rem;">Cerrar</button>
            </div>
        `;
    }
}

function renderSegmentationAIInsights(personaData, recsData) {
    const modalContent = document.getElementById('aiInsightsContent');
    let html = '';
    
    if (personaData.persona && personaData.persona.status === 'success') {
        const persona = personaData.persona;
        
        if (persona.texto_completo) {
            html += `
                <div class="ai-persona-card">
                    <h4><i class='bx bxs-user-circle'></i> Perfil de Cliente</h4>
                    <div style="white-space: pre-line;">${persona.texto_completo}</div>
                </div>
            `;
        } else {
            html += `
                <div class="ai-persona-card">
                    <h4><i class='bx bxs-user-circle'></i> Perfil de Cliente</h4>
                    <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <strong style="color: var(--primary);">👤 Nombre:</strong> ${persona.nombre || 'N/A'}
                            <span style="margin-left: 1rem; color: var(--text-secondary);">Edad: ${persona.edad || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--primary);">💼 Ocupación:</strong> ${persona.ocupacion || 'N/A'}
                        </div>
                        <div>
                            <strong style="color: var(--primary);">💰 Nivel Socioeconómico:</strong> ${persona.nivel_socioeconomico || 'N/A'}
                        </div>
                        <div>
                            <strong style="color: var(--primary);">🛍️ Comportamiento:</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">${persona.comportamiento || 'N/A'}</p>
                        </div>
                        <div>
                            <strong style="color: var(--primary);">🎯 Motivaciones:</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">${persona.motivaciones || 'N/A'}</p>
                        </div>
                        <div>
                            <strong style="color: var(--primary);">😰 Pain Points:</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">${persona.pain_points || 'N/A'}</p>
                        </div>
                        <div>
                            <strong style="color: var(--primary);">📱 Canales Preferidos:</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">${persona.canales_preferidos || 'N/A'}</p>
                        </div>
                        ${persona.frase_descriptiva ? `
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary); margin-top: 0.5rem;">
                                <em>"${persona.frase_descriptiva}"</em>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }
    
    if (recsData.recommendations && recsData.recommendations.status === 'success') {
        const recs = recsData.recommendations;
        
        if (recs.texto_completo) {
            html += `
                <div class="ai-recommendations-card">
                    <h4><i class='bx bxs-bulb'></i> Recomendaciones de Marketing</h4>
                    <div style="white-space: pre-line;">${recs.texto_completo}</div>
                </div>
            `;
        } else if (recs.recomendaciones && recs.recomendaciones.length > 0) {
            html += `
                <div class="ai-recommendations-card">
                    <h4><i class='bx bxs-bulb'></i> Recomendaciones de Marketing</h4>
                    ${recs.prioridad_general ? `
                        <p style="margin-bottom: 1rem;"><strong>Prioridad:</strong> ${recs.prioridad_general}</p>
                    ` : ''}
                    ${recs.justificacion ? `
                        <p style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            ${recs.justificacion}
                        </p>
                    ` : ''}
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${recs.recomendaciones.map((rec, index) => `
                            <div class="ai-recommendation-item">
                                <h5 style="margin: 0 0 0.75rem 0; color: var(--primary);">
                                    ${index + 1}. ${rec.accion || 'Acción recomendada'}
                                </h5>
                                <div style="display: grid; gap: 0.5rem; font-size: 0.95rem;">
                                    <div><strong>📢 Canal:</strong> ${rec.canal || 'N/A'}</div>
                                    <div><strong>💬 Mensaje/Oferta:</strong> ${rec.mensaje_oferta || 'N/A'}</div>
                                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                        <span class="ai-tag" style="background: ${getROIColor(rec.roi_estimado)};">
                                            ROI: ${rec.roi_estimado || 'N/A'}
                                        </span>
                                        <span class="ai-tag" style="background: var(--secondary);">
                                            ⏱️ ${rec.tiempo_implementacion || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    if (html === '') {
        html = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: var(--warning);'></i>
                <p style="margin-top: 1rem;">No se pudieron generar insights para este segmento.</p>
            </div>
        `;
    }
    
    modalContent.innerHTML = html;
}

function getROIColor(roi) {
    if (!roi) return 'var(--secondary)';
    const roiLower = String(roi).toLowerCase(); // Use String() to be safe
    if (roiLower.includes('alto')) return 'var(--success)';
    if (roiLower.includes('medio')) return 'var(--warning)';
    if (roiLower.includes('bajo')) return 'var(--danger)';
    return 'var(--primary)';
}