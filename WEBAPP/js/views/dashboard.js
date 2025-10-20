// Lógica para el Dashboard

// Global chart instances for dashboard
let channelChart = null;
let socialChart = null;

// Load Dashboard Content
async function loadDashboardContent() {
    const mainContent = document.getElementById('mainContent');
    
    // Show loading state
    mainContent.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 400px;">
            <div style="text-align: center;">
                <i class='bx bx-loader bx-spin' style='font-size: 48px; color: #6366f1;'></i>
                <p style="margin-top: 16px; color: #64748b;">Cargando datos...</p>
            </div>
        </div>
    `;

    try {
        // Fetch data from API
        const response = await fetch(`${API_BASE_URL}/api/v1/dashboard`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(data.error);
        }

        // Render dashboard with real data
        renderDashboard(data);
        
        // Initialize charts with real data
        setTimeout(() => initializeCharts(data), 100);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 48px;">
                <i class='bx bx-error-circle' style='font-size: 64px; color: #ef4444;'></i>
                <h2 style="margin-top: 16px; color: #0f172a;">Error al cargar datos</h2>
                <p style="color: #64748b; margin-top: 8px;">${error.message}</p>
                <p style="color: #64748b; margin-top: 4px;">Verifica que el backend esté corriendo en ${API_BASE_URL}</p>
                <button onclick="loadDashboardContent()" class="btn btn-primary" style="margin-top: 24px;">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Render Dashboard HTML
function renderDashboard(data) {
    const kpis = data.kpis;
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <section id="dashboard" class="content-section active">
            <header class="section-header">
                <div>
                    <h1>Dashboard General</h1>
                    <p class="subtitle">Visión integral de tu marketing omnicanal</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary">
                        <i class='bx bx-download'></i>
                        Exportar Reporte
                    </button>
                    <button class="btn btn-primary">
                        <i class='bx bx-plus'></i>
                        Nueva Campaña
                    </button>
                </div>
            </header>

            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon blue">
                        <i class='bx bx-envelope-open'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Tasa de Apertura</span>
                        <h2 class="kpi-value">${kpis.open_rate}%</h2>
                        <span class="kpi-trend positive">
                            <i class='bx bx-trending-up'></i> +5.2%
                        </span>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon green">
                        <i class='bx bx-target-lock'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Conversiones</span>
                        <h2 class="kpi-value">${kpis.conversion_rate}%</h2>
                        <span class="kpi-trend positive">
                            <i class='bx bx-trending-up'></i> +3.1%
                        </span>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon orange">
                        <i class='bx bx-user-check'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">Retención</span>
                        <h2 class="kpi-value">${kpis.retention_rate}%</h2>
                        <span class="kpi-trend positive">
                            <i class='bx bx-trending-up'></i> +2.0%
                        </span>
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon purple">
                        <i class='bx bx-mouse-alt'></i>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-label">CTR General</span>
                        <h2 class="kpi-value">${kpis.ctr_general}%</h2>
                        <span class="kpi-trend positive">
                            <i class='bx bx-trending-up'></i> +1.8%
                        </span>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Rendimiento de Canales (Revenue por Mes)</h3>
                    <canvas id="channelChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Engagement por Red Social</h3>
                    <canvas id="socialChart"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <h3>Actividad Reciente</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class='bx bx-check-circle'></i>
                        <div>
                            <strong>Campaña "Lanzamiento Verano"</strong> enviada exitosamente
                            <span class="time">Hace 2 horas</span>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class='bx bx-bot'></i>
                        <div>
                            <strong>IA generó 15 variaciones</strong> de copy para A/B testing
                            <span class="time">Hace 4 horas</span>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class='bx bx-group'></i>
                        <div>
                            <strong>Nueva segmentación creada:</strong> "Compradores frecuentes"
                            <span class="time">Hace 1 día</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // Animate cards
    animateElements();
}

// Initialize Charts with real data
function initializeCharts(data) {
    // Destroy previous charts if they exist
    if (channelChart) channelChart.destroy();
    if (socialChart) socialChart.destroy();

    const channelData = data.charts.channel_performance;
    const socialData = data.charts.social_engagement;

    // Channel Performance Chart
    const channelCtx = document.getElementById('channelChart');
    if (channelCtx && channelData && channelData.length > 0) {
        const labels = channelData.map(item => item.month);
        const revenues = channelData.map(item => item.revenue);

        channelChart = new Chart(channelCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: revenues,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b'
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

    // Social Media Engagement Chart
    const socialCtx = document.getElementById('socialChart');
    if (socialCtx && socialData && socialData.length > 0) {
        const platforms = socialData.map(item => item.platform);
        const engagements = socialData.map(item => item.engagement);
        
        const colors = ['#f59e0b', '#6366f1', '#0dcaf0', '#64748b', '#10b981'];

        socialChart = new Chart(socialCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: platforms,
                datasets: [{
                    data: engagements,
                    backgroundColor: colors.slice(0, platforms.length),
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
                                return context.label + ': ' + context.parsed.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}
