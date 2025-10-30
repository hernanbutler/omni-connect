// Vista de Analytics - Frontend completo con funcionalidad real

let analyticsChart = null;
let currentPeriod = '30days';

async function loadAnalyticsContent() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
    <section id="analytics" class="content-section active">
            <header class="section-header">
                <div>
                    <h1>Análisis y Reportes</h1>
                    <p class="subtitle">Insights detallados de todas tus campañas</p>
                </div>
                <div class="header-actions">
                    <select class="date-selector" id="periodSelector">
                        <option value="7days">Últimos 7 días</option>
                        <option value="30days" selected>Últimos 30 días</option>
                        <option value="3months">Últimos 3 meses</option>
                        <option value="year">Este año</option>
                    </select>
                    <button class="btn btn-secondary" onclick="exportData('csv')">
                        <i class='bx bx-download'></i> CSV
                    </button>
                    <button class="btn btn-secondary" onclick="exportData('excel')">
                        <i class='bx bx-file-blank'></i> Excel
                    </button>
                    <button class="btn btn-primary" onclick="exportData('pdf')">
                        <i class='bx bxs-file-pdf'></i> Generar PDF
                    </button>
                </div>
            </header>

            <!-- KPI Cards -->
            <div class="kpi-grid" id="kpiGrid">
                <div class="loading-spinner">Cargando métricas...</div>
            </div>

            <div class="analytics-grid">
                <div class="chart-card large">
                    <h3>Evolución de Conversiones</h3>
                    <canvas id="conversionChart"></canvas>
                </div>

                <div class="insights-card analytics-insights">
                    <h4><i class='bx bxs-bulb'></i> Insights de IA</h4>
                    <div id="aiInsightsContainer">
                        <div class="loading-spinner">Generando insights...</div>
                    </div>
                </div>
            </div>

            <div class="campaign-performance">
                <h3>Top Campañas del Período</h3>
                <div id="campaignsTableContainer">
                    <div class="loading-spinner">Cargando campañas...</div>
                </div>
            </div>

            <div class="segments-performance">
                <h3>Rendimiento por Segmentos</h3>
                <div id="segmentsContainer">
                    <div class="loading-spinner">Cargando segmentos...</div>
                </div>
            </div>
        </section>
    `;

    // Setup period selector
    const periodSelector = document.getElementById('periodSelector');
    periodSelector.addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        refreshAnalytics();
    });

    // Load initial data
    await refreshAnalytics();
}

async function refreshAnalytics() {
    try {
        // Load all data in parallel
        const [overview, conversions, campaigns, insights] = await Promise.all([
            fetchAnalyticsOverview(currentPeriod),
            fetchConversionEvolution(currentPeriod),
            fetchTopCampaigns(currentPeriod),
            fetchAIInsights(currentPeriod)
        ]);

        // Render all sections
        renderAnalyticsKPIs(overview);
        renderConversionChart(conversions);
        renderCampaignsTable(campaigns);
        renderAnalyticsAIInsights(insights);
        renderSegments(overview.segment_performance || []);

    } catch (error) {
        console.error('Error loading analytics:', error);
        // No mostrar notificación aquí para evitar múltiples popups
    }
}

async function fetchAnalyticsOverview(period) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/overview?period=${period}`);
        if (!response.ok) throw new Error('Error fetching overview');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function fetchConversionEvolution(period) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/conversions?period=${period}`);
        if (!response.ok) throw new Error('Error fetching conversions');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function fetchTopCampaigns(period) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/top-campaigns?period=${period}&limit=10`);
        if (!response.ok) throw new Error('Error fetching campaigns');
        const data = await response.json();
        return data.campaigns || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchAIInsights(period) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/ai-insights?period=${period}`);
        if (!response.ok) throw new Error('Error fetching insights');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function renderAnalyticsKPIs(data) {
    const container = document.getElementById('kpiGrid');
    if (!container) return; // view not active
    
    if (!data || !data.overview) {
        container.innerHTML = '<p>No hay datos disponibles</p>';
        return;
    }

    const overview = data.overview;
    
    container.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-icon green">
                <i class='bx bx-trending-up'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">Conversiones Totales</span>
                <h2 class="kpi-value">${formatNumber(overview.total_conversions)}</h2>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-icon blue">
                <i class='bx bx-envelope-open'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">Tasa de Apertura</span>
                <h2 class="kpi-value">${overview.open_rate}%</h2>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-icon purple">
                <i class='bx bx-pointer'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">CTR Promedio</span>
                <h2 class="kpi-value">${overview.ctr}%</h2>
            </div>
        </div>

        <div class="kpi-card">
            <div class="kpi-icon orange">
                <i class='bx bx-line-chart'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">ROI</span>
                <h2 class="kpi-value">${overview.roi}x</h2>
            </div>
        </div>
    `;
}

function renderConversionChart(data) {
    if (!data) return;

    const ctx = document.getElementById('conversionChart');
    if (!ctx) return;

    // Destroy previous chart
    if (analyticsChart) {
        analyticsChart.destroy();
    }

    analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [
                {
                    label: 'Conversiones',
                    data: data.conversions || [],
                    borderColor: APP_CONFIG.chartColors.primary,
                    backgroundColor: APP_CONFIG.chartColors.primary + '20',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                },
                {
                    label: 'Clicks',
                    data: data.clicks || [],
                    borderColor: APP_CONFIG.chartColors.info,
                    backgroundColor: APP_CONFIG.chartColors.info + '20',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Aperturas',
                    data: data.opens || [],
                    borderColor: APP_CONFIG.chartColors.success,
                    backgroundColor: APP_CONFIG.chartColors.success + '20',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function renderCampaignsTable(campaigns) {
    const container = document.getElementById('campaignsTableContainer');
    
    if (!campaigns || campaigns.length === 0) {
        container.innerHTML = '<p>No hay campañas disponibles</p>';
        return;
    }

    const tableHTML = `
        <table class="performance-table">
            <thead>
                <tr>
                    <th>Campaña</th>
                    <th>Canal</th>
                    <th>Enviados</th>
                    <th>Apertura</th>
                    <th>CTR</th>
                    <th>Conversión</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${campaigns.map((camp, index) => {
                    if (!camp) {
                        console.warn(`Datos de campaña en el índice ${index} son nulos o indefinidos.`);
                        return ''; // No renderizar nada si el objeto de campaña es nulo
                    }

                    const name = camp.name || 'N/A';
                    const channel = camp.channel || 'N/A';
                    const sent = camp.sent ?? 0;
                    const open_rate = camp.open_rate ?? 0;
                    const ctr = camp.ctr ?? 0;
                    const conversion_rate = camp.conversion_rate ?? 0;
                    const revenue = camp.revenue ?? 0;

                    if (!camp.name) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'name'.`);
                    if (!camp.channel) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'channel'.`);
                    if (camp.sent === undefined) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'sent'.`);
                    if (camp.open_rate === undefined) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'open_rate'.`);
                    if (camp.ctr === undefined) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'ctr'.`);
                    if (camp.conversion_rate === undefined) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'conversion_rate'.`);
                    if (camp.revenue === undefined) console.warn(`Campaña '${name}' en el índice ${index} no tiene 'revenue'.`);

                    return `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td><span class="channel-badge ${channel}">${channel}</span></td>
                            <td>${formatNumber(sent)}</td>
                            <td><span class="${getPerformanceClass(open_rate)}">${open_rate}%</span></td>
                            <td><span class="${getPerformanceClass(ctr)}">${ctr}%</span></td>
                            <td><span class="${getPerformanceClass(conversion_rate)}">${conversion_rate}%</span></td>
                            <td>$${formatNumber(revenue)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

function formatNumber(number) {
    if (typeof number !== 'number') {
        return number;
    }
    return new Intl.NumberFormat('es-ES').format(number);
}

function renderAnalyticsAIInsights(insights) {
    const container = document.getElementById('aiInsightsContainer');
    if (!container) return; // view not active
    
    if (!insights) {
        container.innerHTML = '<p>No se pudieron generar insights</p>';
        return;
    }

    const bestTime = insights.best_send_time || {};
    const topSegment = insights.top_segment || {};
    const churnAlert = insights.churn_alert || {};

    container.innerHTML = `
        <div class="insight-item">
            <i class='bx bx-time-five' style="color: #cfd14aff;"></i>
            <p><strong>Mejor momento de envío:</strong> ${bestTime.day || 'N/A'} a las ${bestTime.time || 'N/A'} (${bestTime.improvement || 'N/A'} apertura)</p>
        </div>
        <div class="insight-item">
            <i class='bx bx-target-lock' style="color: #10b981;"></i>
            <p><strong>Segmento más rentable:</strong> ${topSegment.name || 'N/A'} (CLV $${formatNumber(topSegment.clv || 0)})</p>
        </div>
        <div class="insight-item">
            <i class='bx bx-error-circle' style="color: #ef4444;"></i>
            <p><strong>Alerta:</strong> ${formatNumber(churnAlert.users || 0)} usuarios en riesgo de abandono</p>
        </div>
        ${insights.recommendations ? `
            <div class="recommendations-section">
                <h5><i class='bx bx-bulb'></i> Recomendaciones:</h5>
                ${insights.recommendations.slice(0, 3).map(rec => `
                    <div class="recommendation-item">
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                        <span class="impact-badge impact-${rec.impact}">${rec.impact}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

function renderSegments(segments) {
    const container = document.getElementById('segmentsContainer');
    
    if (!segments || segments.length === 0) {
        container.innerHTML = '<p>No hay datos de segmentos</p>';
        return;
    }

    container.innerHTML = `
        <div class="segments-grid-analytics">
            ${segments.map(seg => `
                <div class="segment-card-analytics">
                    <h4>${seg.segment}</h4>
                    <div class="segment-stats">
                        <div class="stat">
                            <span class="stat-label">Usuarios</span>
                            <span class="stat-value">${formatNumber(seg.users)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">CLV</span>
                            <span class="stat-value">$${formatNumber(seg.clv)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Conversión</span>
                            <span class="stat-value">${seg.conversion_rate}%</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getPerformanceClass(value) {
    if (value >= 15) return 'positive';
    if (value >= 8) return 'neutral';
    return 'negative';
}

async function exportData(format) {
    try {
        showNotification('Generando archivo...', 'info');
        
        const url = `${API_BASE_URL}/api/v1/analytics/export/${format}?period=${currentPeriod}`;
        
        // Open in new window to trigger download
        window.open(url, '_blank');
        
        setTimeout(() => {
            showNotification(`Archivo ${format.toUpperCase()} generado exitosamente`, 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error exporting:', error);
        showNotification('Error al generar el archivo', 'error');
    }
}

// Agregar estilos específicos para analytics
if (!document.getElementById('analytics-styles')) {
    const style = document.createElement('style');
    style.id = 'analytics-styles';
    style.textContent = `
        .analytics-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        @media (max-width: 968px) {
            .analytics-grid {
                grid-template-columns: 1fr;
            }
        }

        .chart-card.large {
            background: var(--card-bg);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .chart-card.large h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .chart-card canvas {
            height: 300px !important;
        }

        .analytics-insights {
            background: var(--primary);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            color: white; /* Base text color */
        }

        .analytics-insights h4 {
            margin-top: 0;
            color: white; /* Corrected color */
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .analytics-insights .insight-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.1); /* Better background for dark theme */
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }

        .insight-item i {
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .insight-item p {
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .recommendations-section {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .recommendations-section h5 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            color: var(--primary);
        }

        .recommendation-item {
            background: white;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border-left: 3px solid var(--primary);
        }

        .recommendation-item strong {
            display: block;
            margin-bottom: 0.25rem;
            color: var(--text-primary);
        }

        .recommendation-item p {
            margin: 0 0 0.5rem 0;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .impact-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .impact-badge.impact-alto {
            background: #dcfce7;
            color: #16a34a;
        }

        .impact-badge.impact-medio {
            background: #fef3c7;
            color: #d97706;
        }

        .impact-badge.impact-bajo {
            background: #fee2e2;
            color: #dc2626;
        }

        .campaign-performance, .segments-performance {
            background: var(--card-bg);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
        }

        .campaign-performance h3, .segments-performance h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .performance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .performance-table thead {
            background: var(--bg-secondary);
        }

        .performance-table th {
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: var(--text-primary);
            border-bottom: 2px solid var(--border-color);
        }

        .performance-table td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        .performance-table tbody tr:hover {
            background: var(--bg-secondary);
        }

        .channel-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: capitalize;
        }

        .channel-badge.email {
            background: #dbeafe;
            color: #1e40af;
        }

        .channel-badge.social {
            background: #fce7f3;
            color: #be185d;
        }

        .channel-badge.sms {
            background: #dcfce7;
            color: #15803d;
        }

        .positive {
            color: #16a34a;
            font-weight: 600;
        }

        .neutral {
            color: #d97706;
            font-weight: 600;
        }

        .negative {
            color: #dc2626;
            font-weight: 600;
        }

        .segments-grid-analytics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .segment-card-analytics {
            background: var(--bg-secondary);
            padding: 1.25rem;
            border-radius: 10px;
            border-left: 4px solid var(--primary);
        }

        .segment-card-analytics h4 {
            margin: 0 0 1rem 0;
            color: var(--primary);
            font-size: 1.1rem;
        }

        .segment-stats {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }

        .segment-stats .stat {
            flex: 1;
            text-align: center;
        }

        .segment-stats .stat-label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            font-weight: 500;
        }

        .segment-stats .stat-value {
            display: block;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .loading-spinner {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-style: italic;
        }

        .header-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }

        .date-selector {
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--card-bg);
            color: var(--text-primary);
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .date-selector:hover {
            border-color: var(--primary);
        }

        .date-selector:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: #5558e3;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }

        .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--card-bg);
            border-color: var(--primary);
            transform: translateY(-1px);
        }

        @media (max-width: 768px) {
            .header-actions {
                flex-wrap: wrap;
                width: 100%;
            }

            .date-selector {
                width: 100%;
            }

            .btn {
                flex: 1;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
}