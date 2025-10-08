
// Navigation and Sidebar Toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    // Sidebar Toggle
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Initialize Charts
    initializeCharts();

    // AI Content Generator
    setupAIGenerator();
});

// Initialize Charts
function initializeCharts() {
    // Channel Performance Chart
    const channelCtx = document.getElementById('channelChart');
    if (channelCtx) {
        new Chart(channelCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Email',
                        data: [450, 520, 580, 650, 720, 800],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Redes Sociales',
                        data: [320, 380, 420, 480, 540, 620],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'SMS',
                        data: [180, 220, 260, 290, 320, 380],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
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
    if (socialCtx) {
        new Chart(socialCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'],
                datasets: [{
                    data: [35, 30, 20, 15],
                    backgroundColor: [
                        '#f59e0b',
                        '#6366f1',
                        '#0dcaf0',
                        '#64748b'
                    ],
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
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Conversion Evolution Chart
    const conversionCtx = document.getElementById('conversionChart');
    if (conversionCtx) {
        new Chart(conversionCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                datasets: [
                    {
                        label: 'Conversiones',
                        data: [120, 150, 180, 220],
                        backgroundColor: '#6366f1',
                        borderRadius: 8
                    },
                    {
                        label: 'Objetivo',
                        data: [150, 150, 150, 150],
                        backgroundColor: '#e2e8f0',
                        borderRadius: 8
                    }
                ]
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0f172a',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12
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
}

// AI Content Generator
function setupAIGenerator() {
    const generateBtn = document.getElementById('generateBtn');
    const generateVariantsBtn = document.getElementById('generateVariants');
    const aiOutput = document.getElementById('aiOutput');

    const sampleContent = {
        'Email Marketing': {
            'Profesional': '¡Hola [Nombre]!\n\nNos complace presentarte nuestra última innovación: el Kit de Marketing Omnicanal, diseñado específicamente para empresas como la tuya que buscan optimizar sus estrategias digitales.\n\nCon nuestro kit podrás:\n✓ Automatizar campañas multicanal\n✓ Segmentar audiencias de forma inteligente\n✓ Generar contenido con IA\n✓ Medir resultados en tiempo real\n\nReserva tu demo personalizada hoy y descubre cómo podemos impulsar tu crecimiento.\n\nSaludos cordiales,\nEl equipo de OmniMark',
            
            'Casual y cercano': '¡Hey [Nombre]! 👋\n\n¿Cansado de perder tiempo gestionando mil herramientas diferentes?\n\nTe entendemos perfectamente. Por eso creamos OmniMark: todo tu marketing en un solo lugar.\n\nImagina poder:\n🚀 Crear campañas en minutos (no horas)\n🎯 Llegar a las personas correctas automáticamente\n✨ Generar textos increíbles con IA\n📊 Ver qué funciona (y qué no) de un vistazo\n\nPruébalo gratis por 14 días. Sin trucos, sin tarjeta de crédito.\n\n¡Nos vemos dentro!\nTu equipo en OmniMark 💙'
        },
        'Post Instagram': {
            'Inspiracional': '✨ El marketing del futuro es humano, inteligente y omnicanal.\n\n¿Sabías que las empresas que integran sus canales de comunicación obtienen un 30% más de engagement?\n\nCon OmniMark, no solo automatizas tareas. Creas experiencias memorables para tus clientes.\n\nUn solo kit. Todos tus canales. Infinitas posibilidades.\n\n#MarketingDigital #Automatización #InteligenciaArtificial #OmniMark',
            
            'Educativo': '📚 Marketing Omnicanal 101:\n\n¿Qué es? Una estrategia que integra TODOS tus canales (email, redes, SMS, web) para crear una experiencia consistente.\n\n¿Por qué importa? Porque tus clientes esperan coherencia. Si les hablas diferente en cada canal, pierdes su confianza.\n\n¿Cómo empezar? Con herramientas como OmniMark que hacen el trabajo pesado por ti.\n\nGuarda este post si quieres aprender más 🔖\n\n#TipsDeMarketing #CrecimientoDigital'
        },
        'Tweet': {
            'Promocional': '🎉 OFERTA ESPECIAL\n\n50% OFF en tu primer mes de OmniMark\n\n✅ Automatización IA\n✅ Dashboard avanzado\n✅ Soporte premium\n\nCódigo: OMNI50\nVálido hasta fin de mes\n\n👉 Empieza ahora: [link]\n\n#Marketing #Oferta',
            
            'Profesional': 'El 80% de las empresas reconoce falta de integración entre sus canales.\n\nOmniMark resuelve este problema con:\n• Automatización inteligente\n• Segmentación avanzada\n• Generación de contenido IA\n\nDescubre más: [link]\n\n#MarketingDigital #SaaS'
        }
    };

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const contentType = document.getElementById('contentType').value;
            const toneVoice = document.getElementById('toneVoice').value;
            
            // Simulate AI generation
            generateBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando...';
            generateBtn.disabled = true;
            
            setTimeout(() => {
                const content = sampleContent[contentType]?.[toneVoice] || 
                               'Contenido generado para: ' + contentType + ' con tono ' + toneVoice;
                
                aiOutput.innerHTML = '<p style="white-space: pre-line;">' + content + '</p>';
                generateBtn.innerHTML = '<i class="bx bxs-magic-wand"></i> Generar Contenido con IA';
                generateBtn.disabled = false;
            }, 1500);
        });
    }

    if (generateVariantsBtn) {
        generateVariantsBtn.addEventListener('click', () => {
            const currentContent = aiOutput.textContent;
            if (currentContent && !currentContent.includes('Configura')) {
                alert('✨ Se generaron 3 variantes adicionales para test A/B.\n\nEn la versión completa, verías aquí las variantes optimizadas por IA.');
            } else {
                alert('⚠️ Primero genera contenido base antes de crear variantes.');
            }
        });
    }
}

// Add smooth animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.kpi-card, .chart-card, .segment-card, .automation-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});