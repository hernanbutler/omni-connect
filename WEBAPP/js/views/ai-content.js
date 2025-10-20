// Lógica para la sección de Generador de Contenido con IA

let currentGeneratedContent = null;

// Esta es la función principal que se llama desde main.js
function loadAIContentGenerator_real() {
    loadAIContentGenerator();
}

async function loadAIContentGenerator() {
    const mainContent = document.getElementById('mainContent');
    
    // Renderizar la vista principal
    mainContent.innerHTML = `
        <header class="section-header">
            <div>
                <h1>Generador de Contenido con IA</h1>
                <p class="subtitle">Crea contenido de marketing de alta calidad impulsado por ChatGPT</p>
            </div>
            <button class="btn btn-secondary" onclick="showHistoryModal()">
                <i class='bx bx-history'></i>
                Historial
            </button>
        </header>

        <!-- Content Type Selector -->
        <div class="kpi-grid" style="margin-bottom: 2rem;">
            ${renderContentTypeCards()}
        </div>

        <!-- Generator Form -->
        <div class="campaign-performance">
            <h3><i class='bx bx-magic-wand'></i> Configuración del Contenido</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
                <!-- Left Column: Form -->
                <div>
                    <div class="form-group">
                        <label for="contentType">Tipo de Contenido *</label>
                        <select id="contentType" class="form-control" onchange="handleContentTypeChange()">
                            <option value="">-- Selecciona un tipo --</option>
                            <option value="email">📧 Email Marketing</option>
                            <option value="social_post">📱 Post para Redes Sociales</option>
                            <option value="blog_article">📝 Artículo de Blog</option>
                            <option value="ad_copy">💬 Copy Publicitario</option>
                            <option value="product_description">🛍️ Descripción de Producto</option>
                            <option value="landing_page">🎯 Landing Page</option>
                            <option value="video_script">🎥 Guion de Video</option>
                            <option value="hashtags">🏷️ Generador de Hashtags</option>
                        </select>
                    </div>

                    <div class="form-group" id="platformGroup" style="display: none;">
                        <label for="platform">Plataforma *</label>
                        <select id="platform" class="form-control">
                            <option value="">-- Selecciona plataforma --</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter / X</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="topic">Tema / Producto / Idea Principal *</label>
                        <input type="text" id="topic" class="form-control" placeholder="Ej: Lanzamiento de nuevo producto de café orgánico">
                    </div>

                    <div class="form-group">
                        <label for="tone">Tono del Contenido</label>
                        <select id="tone" class="form-control">
                            <option value="profesional">Profesional</option>
                            <option value="casual">Casual / Amigable</option>
                            <option value="persuasivo">Persuasivo / Ventas</option>
                            <option value="educativo">Educativo / Informativo</option>
                            <option value="inspirador">Inspirador / Motivacional</option>
                            <option value="humorístico">Humorístico / Divertido</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="segment">Audiencia Objetivo (Opcional)</label>
                        <input type="text" id="segment" class="form-control" placeholder="Ej: Millennials interesados en vida saludable">
                    </div>

                    <div class="form-group">
                        <label for="additionalContext">Contexto Adicional (Opcional)</label>
                        <textarea id="additionalContext" class="form-control" rows="3" placeholder="Agrega detalles adicionales, características clave, promociones, etc."></textarea>
                    </div>

                    <button class="btn btn-primary" onclick="generateContent()" style="width: 100%; margin-top: 1rem;">
                        <i class='bx bx-brain'></i>
                        Generar Contenido con IA
                    </button>
                </div>

                <!-- Right Column: Tips -->
                <div>
                    <div class="insights-card">
                        <h4><i class='bx bxs-bulb'></i> Tips para Mejores Resultados</h4>
                        <div id="dynamicTips">
                            <div class="insight-item">
                                <i class='bx bx-check-circle'></i>
                                <p><strong>Sé específico:</strong> Cuanto más detallado sea tu tema, mejor será el resultado.</p>
                            </div>
                            <div class="insight-item">
                                <i class='bx bx-target-lock'></i>
                                <p><strong>Define tu audiencia:</strong> Conocer a quién te diriges mejora la relevancia.</p>
                            </div>
                            <div class="insight-item">
                                <i class='bx bx-palette'></i>
                                <p><strong>Elige el tono correcto:</strong> El tono debe alinearse con tu marca.</p>
                            </div>
                        </div>
                    </div>

                    <div class="automation-card" style="margin-top: 1rem;">
                        <div class="automation-status">
                            <h4>✨ Funciones Adicionales</h4>
                        </div>
                        <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
                            <button class="btn btn-secondary" onclick="showImproveContentModal()">
                                <i class='bx bx-edit-alt'></i>
                                Mejorar Contenido Existente
                            </button>
                            <button class="btn btn-secondary" onclick="showTranslateModal()">
                                <i class='bx bx-world'></i>
                                Traducir Contenido
                            </button>
                            <button class="btn btn-secondary" onclick="showAnalyzeModal()">
                                <i class='bx bx-bar-chart-alt'></i>
                                Analizar Contenido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Generated Content Display -->
        <div id="generatedContentContainer" style="display: none; margin-top: 2rem;">
            <div class="campaign-performance">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3><i class='bx bx-check-circle' style="color: #10b981;"></i> Contenido Generado</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="copyGeneratedContent()">
                            <i class='bx bx-copy'></i>
                            Copiar
                        </button>
                        <button class="btn btn-secondary" onclick="downloadGeneratedContent()">
                            <i class='bx bx-download'></i>
                            Descargar
                        </button>
                        <button class="btn btn-primary" onclick="regenerateContent()">
                            <i class='bx bx-refresh'></i>
                            Regenerar
                        </button>
                    </div>
                </div>
                <div id="generatedContentDisplay"></div>
            </div>
        </div>

        <!-- Quick Examples -->
        <div class="activity-section" style="margin-top: 2rem;">
            <h3>⚡ Ejemplos Rápidos</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${renderQuickExamples()}
            </div>
        </div>
    `;
}

function renderContentTypeCards() {
    const contentTypes = [
        { type: 'email', icon: 'bx-envelope', label: 'Email', color: '#6366f1', description: 'Campañas de email marketing' },
        { type: 'social_post', icon: 'bxl-instagram', label: 'Redes Sociales', color: '#ec4899', description: 'Posts para Instagram, Facebook, etc.' },
        { type: 'blog_article', icon: 'bx-news', label: 'Blog', color: '#8b5cf6', description: 'Artículos y contenido largo' },
        { type: 'ad_copy', icon: 'bx-message-dots', label: 'Publicidad', color: '#f59e0b', description: 'Copys publicitarios' },
        { type: 'product_description', icon: 'bx-shopping-bag', label: 'Productos', color: '#10b981', description: 'Descripciones de productos' },
        { type: 'video_script', icon: 'bx-video', label: 'Video', color: '#ef4444', description: 'Guiones para videos' }
    ];

    return contentTypes.map(ct => `
        <div class="kpi-card" style="cursor: pointer; transition: transform 0.2s;" onclick="quickSelectContentType('${ct.type}')">
            <div class="kpi-icon" style="background: ${ct.color}; color: white;">
                <i class='bx ${ct.icon}'></i>
            </div>
            <div class="kpi-content">
                <span class="kpi-label">${ct.label}</span>
                <p style="font-size: 13px; color: #64748b; margin-top: 4px;">${ct.description}</p>
            </div>
        </div>
    `).join('');
}

function renderQuickExamples() {
    const examples = [
        { 
            title: '📧 Email Promocional', 
            type: 'email', 
            topic: 'Descuento 30% en productos de verano', 
            tone: 'persuasivo' 
        },
        { 
            title: '📱 Post Instagram', 
            type: 'social_post', 
            topic: 'Tips de productividad para emprendedores', 
            tone: 'inspirador',
            platform: 'Instagram'
        },
        { 
            title: '📝 Artículo Blog', 
            type: 'blog_article', 
            topic: 'Guía completa de marketing digital 2025', 
            tone: 'educativo' 
        },
        { 
            title: '🎯 Copy Publicitario', 
            type: 'ad_copy', 
            topic: 'Nuevo curso online de marketing', 
            tone: 'persuasivo' 
        }
    ];

    return examples.map(ex => `
        <div class="automation-card" style="cursor: pointer;" onclick='useQuickExample(${JSON.stringify(ex).replace(/'/g, "&#39;")})'>
            <h4 style="font-size: 14px; margin-bottom: 0.5rem;">${ex.title}</h4>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 0.75rem;">${ex.topic}</p>
            <span class="segment-badge" style="font-size: 12px;">${ex.tone}</span>
        </div>
    `).join('');
}

function quickSelectContentType(type) {
    document.getElementById('contentType').value = type;
    handleContentTypeChange();
    document.getElementById('topic').focus();
}

function handleContentTypeChange() {
    const contentType = document.getElementById('contentType').value;
    const platformGroup = document.getElementById('platformGroup');
    const dynamicTips = document.getElementById('dynamicTips');
    
    // Mostrar campo de plataforma para social posts, video y ads
    const needsPlatform = ['social_post', 'video_script', 'ad_copy'].includes(contentType);
    platformGroup.style.display = needsPlatform ? 'block' : 'none';
    
    // Actualizar tips dinámicos según tipo de contenido
    const tips = {
        'email': [
            { icon: 'bx-envelope-open', text: 'Usa líneas de asunto atractivas de menos de 60 caracteres' },
            { icon: 'bx-user-check', text: 'Personaliza el mensaje para tu segmento específico' },
            { icon: 'bx-link', text: 'Incluye un CTA claro y visible' }
        ],
        'social_post': [
            { icon: 'bx-image', text: 'El contenido visual aumenta el engagement hasta 3x' },
            { icon: 'bx-hash', text: 'Usa 5-7 hashtags relevantes para mayor alcance' },
            { icon: 'bx-time', text: 'Publica en horarios de mayor actividad' }
        ],
        'blog_article': [
            { icon: 'bx-search', text: 'Incluye palabras clave relevantes para SEO' },
            { icon: 'bx-paragraph', text: 'Divide el contenido con subtítulos y listas' },
            { icon: 'bx-link-external', text: 'Agrega enlaces internos y externos relevantes' }
        ],
        'ad_copy': [
            { icon: 'bx-target-lock', text: 'Enfócate en beneficios, no características' },
            { icon: 'bx-alarm', text: 'Crea urgencia con ofertas limitadas' },
            { icon: 'bx-check-double', text: 'Haz A/B testing con diferentes variaciones' }
        ],
        'product_description': [
            { icon: 'bx-shopping-bag', text: 'Destaca beneficios sobre características' },
            { icon: 'bx-star', text: 'Usa lenguaje sensorial y descriptivo' },
            { icon: 'bx-badge-check', text: 'Incluye prueba social y garantías' }
        ],
        'video_script': [
            { icon: 'bx-movie-play', text: 'Los primeros 3 segundos son cruciales' },
            { icon: 'bx-captions', text: 'Escribe para ser escuchado, no leído' },
            { icon: 'bx-trending-up', text: 'Incluye elementos visuales dinámicos' }
        ]
    };
    
    const selectedTips = tips[contentType] || tips['email'];
    dynamicTips.innerHTML = selectedTips.map(tip => `
        <div class="insight-item">
            <i class='bx ${tip.icon}'></i>
            <p>${tip.text}</p>
        </div>
    `).join('');
}

async function generateContent() {
    const contentType = document.getElementById('contentType').value;
    const topic = document.getElementById('topic').value.trim();
    const tone = document.getElementById('tone').value;
    const segment = document.getElementById('segment').value.trim();
    const platform = document.getElementById('platform').value;
    const additionalContext = document.getElementById('additionalContext').value.trim();
    
    // Validación
    if (!contentType) {
        showNotification('Por favor selecciona un tipo de contenido', 'warning');
        return;
    }
    
    if (!topic) {
        showNotification('Por favor ingresa un tema', 'warning');
        return;
    }
    
    if (['social_post', 'video_script'].includes(contentType) && !platform) {
        showNotification('Por favor selecciona una plataforma', 'warning');
        return;
    }
    
    // Mostrar loading
    const container = document.getElementById('generatedContentContainer');
    const display = document.getElementById('generatedContentDisplay');
    
    container.style.display = 'block';
    display.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class='bx bx-brain bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 1rem; color: #64748b; font-weight: 500;">Generando contenido con IA...</p>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 0.5rem;">Esto puede tomar unos segundos</p>
        </div>
    `;
    
    // Scroll al contenedor
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ai-content/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content_type: contentType,
                tone: tone,
                topic: topic,
                segment: segment || null,
                platform: platform || null,
                additional_context: additionalContext || null
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            currentGeneratedContent = result.data;
            displayGeneratedContent(result.data);
            showNotification('¡Contenido generado exitosamente!', 'success');
        } else {
            throw new Error(result.detail || 'Error al generar contenido');
        }
    } catch (error) {
        console.error('Error:', error);
        display.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: #ef4444;'></i>
                <p style="margin-top: 1rem; color: #64748b;">Error al generar contenido</p>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 0.5rem;">${error.message}</p>
                <button class="btn btn-primary" onclick="generateContent()" style="margin-top: 1rem;">
                    <i class='bx bx-refresh'></i> Reintentar
                </button>
            </div>
        `;
        showNotification('Error al generar contenido. Por favor intenta de nuevo.', 'error');
    }
}

function displayGeneratedContent(data) {
    const display = document.getElementById('generatedContentDisplay');
    let html = '';
    
    // Mostrar warning si existe
    if (data.warning) {
        html += `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px;">
                <i class='bx bx-info-circle' style="color: #f59e0b;"></i>
                <span style="margin-left: 0.5rem; color: #92400e;">${data.warning}</span>
            </div>
        `;
    }
    
    // Renderizar según tipo de contenido
    switch(data.type) {
        case 'email':
            html += renderEmailContent(data);
            break;
        case 'social_post':
            html += renderSocialPostContent(data);
            break;
        case 'blog_article':
            html += renderBlogArticleContent(data);
            break;
        case 'ad_copy':
            html += renderAdCopyContent(data);
            break;
        case 'product_description':
            html += renderProductDescriptionContent(data);
            break;
        case 'landing_page':
            html += renderLandingPageContent(data);
            break;
        case 'video_script':
            html += renderVideoScriptContent(data);
            break;
        case 'hashtags':
            html += renderHashtagsContent(data);
            break;
        default:
            html += renderGenericContent(data);
    }
    
    display.innerHTML = html;
}

// Funciones de renderizado para cada tipo de contenido

function renderEmailContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-envelope'></i> Email Marketing</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #475569; font-size: 13px;">LÍNEA DE ASUNTO</label>
                    <div style="background: white; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; border-left: 3px solid #6366f1;">
                        ${data.subject_line || 'N/A'}
                    </div>
                </div>
                
                ${data.preview_text ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #475569; font-size: 13px;">TEXTO DE PREVIEW</label>
                    <div style="background: white; padding: 1rem; border-radius: 4px; margin-top: 0.5rem;">
                        ${data.preview_text}
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #475569; font-size: 13px;">CUERPO DEL EMAIL</label>
                    <div style="background: white; padding: 1.5rem; border-radius: 4px; margin-top: 0.5rem; line-height: 1.6;">
                        ${data.body || data.content || 'N/A'}
                    </div>
                </div>
                
                ${data.cta ? `
                <div>
                    <label style="font-weight: 600; color: #475569; font-size: 13px;">CALL TO ACTION</label>
                    <div style="background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 4px; margin-top: 0.5rem; display: inline-block; font-weight: 600;">
                        ${data.cta}
                    </div>
                </div>
                ` : ''}
            </div>
            
            ${data.tips && data.tips.length > 0 ? `
            <div style="margin-top: 1.5rem;">
                <h5 style="color: #475569; margin-bottom: 0.75rem;">💡 Tips de Optimización</h5>
                <ul style="list-style: none; padding: 0;">
                    ${data.tips.map(tip => `<li style="padding: 0.5rem 0; color: #64748b;"><i class='bx bx-check' style="color: #10b981;"></i> ${tip}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
}

function renderSocialPostContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bxl-instagram'></i> Post para ${data.platform || 'Redes Sociales'}</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                ${data.hook ? `
                <div style="background: #fef3c7; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #92400e; font-size: 13px;">🎯 HOOK INICIAL</label>
                    <div style="margin-top: 0.5rem; color: #78350f; font-weight: 500;">
                        ${data.hook}
                    </div>
                </div>
                ` : ''}
                
                <div style="background: white; padding: 1.5rem; border-radius: 4px; line-height: 1.8; white-space: pre-wrap;">
                    ${data.content}
                </div>
                
                ${data.hashtags && data.hashtags.length > 0 ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    ${data.hashtags.map(tag => `<span style="background: #e0e7ff; color: #4f46e5; padding: 0.25rem 0.75rem; border-radius: 12px; margin-right: 0.5rem; font-size: 13px; display: inline-block; margin-bottom: 0.5rem; cursor: pointer;" onclick="copyToClipboard('${tag}')">${tag}</span>`).join('')}
                </div>
                ` : ''}
                
                ${data.cta || data.best_time || data.image_suggestion ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                    ${data.cta ? `
                    <div style="background: #f1f5f9; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 0.25rem;">CTA</div>
                        <div style="font-weight: 600; color: #334155;">${data.cta}</div>
                    </div>
                    ` : ''}
                    ${data.best_time ? `
                    <div style="background: #f1f5f9; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 0.25rem;">⏰ MEJOR HORARIO</div>
                        <div style="font-weight: 600; color: #334155;">${data.best_time}</div>
                    </div>
                    ` : ''}
                    ${data.image_suggestion ? `
                    <div style="background: #f1f5f9; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 0.25rem;">🖼️ IMAGEN SUGERIDA</div>
                        <div style="font-weight: 500; color: #334155; font-size: 13px;">${data.image_suggestion}</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            
            ${data.alternatives && data.alternatives.length > 0 ? `
            <div style="margin-top: 1.5rem;">
                <h5 style="color: #475569; margin-bottom: 0.75rem;">🔄 Variantes Alternativas</h5>
                ${data.alternatives.map((alt, i) => `
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 4px; margin-bottom: 0.5rem; border-left: 3px solid #8b5cf6;">
                        <strong style="color: #6b21a8;">Variante ${i + 1}:</strong>
                        <div style="margin-top: 0.5rem; color: #475569;">${alt}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `;
}

function renderBlogArticleContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-news'></i> Artículo de Blog</h4>
            
            <div style="background: #f8fafc; padding: 2rem; border-radius: 8px; margin-top: 1rem;">
                <h2 style="color: #0f172a; margin-bottom: 0.5rem;">${data.title || 'Título del Artículo'}</h2>
                
                ${data.meta_description ? `
                <div style="color: #64748b; font-size: 14px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <strong>Meta descripción:</strong> ${data.meta_description}
                </div>
                ` : ''}
                
                ${data.estimated_read_time ? `
                <div style="color: #64748b; font-size: 13px; margin-bottom: 1.5rem;">
                    <i class='bx bx-time-five'></i> Tiempo de lectura: ${data.estimated_read_time}
                </div>
                ` : ''}
                
                ${data.introduction ? `
                <div style="background: white; padding: 1.5rem; border-radius: 4px; margin-bottom: 1.5rem; line-height: 1.8;">
                    ${data.introduction}
                </div>
                ` : ''}
                
                ${data.main_points && data.main_points.length > 0 ? `
                <div style="margin-top: 1.5rem;">
                    ${data.main_points.map((point, i) => `
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: #1e293b; margin-bottom: 1rem; padding-left: 1rem; border-left: 4px solid #6366f1;">
                                ${point.heading || `Punto ${i + 1}`}
                            </h3>
                            <div style="background: white; padding: 1.5rem; border-radius: 4px; line-height: 1.8; color: #475569;">
                                ${point.content}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.conclusion ? `
                <div style="background: #e0f2fe; padding: 1.5rem; border-radius: 4px; margin-top: 2rem; border-left: 4px solid #0284c7;">
                    <h4 style="color: #0c4a6e; margin-bottom: 0.75rem;">Conclusión</h4>
                    <div style="color: #075985; line-height: 1.8;">${data.conclusion}</div>
                </div>
                ` : ''}
                
                ${data.keywords && data.keywords.length > 0 ? `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    <strong style="color: #475569; font-size: 13px;">🔍 Keywords SEO:</strong>
                    <div style="margin-top: 0.5rem;">
                        ${data.keywords.map(kw => `<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; margin-right: 0.5rem; font-size: 13px; display: inline-block; margin-bottom: 0.5rem;">${kw}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderAdCopyContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-bullhorn'></i> Copy Publicitario</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h2 style="font-size: 24px; margin-bottom: 0.5rem;">${data.headline || 'Headline'}</h2>
                    ${data.subheadline ? `<p style="font-size: 16px; opacity: 0.9;">${data.subheadline}</p>` : ''}
                </div>
                
                <div style="background: white; padding: 1.5rem; border-radius: 4px; line-height: 1.8; margin-bottom: 1rem;">
                    ${data.body || data.content}
                </div>
                
                ${data.cta ? `
                <div style="text-align: center; margin: 1.5rem 0;">
                    <button style="background: #f59e0b; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                        ${data.cta}
                    </button>
                </div>
                ` : ''}
                
                ${data.variations && data.variations.length > 0 ? `
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e2e8f0;">
                    <h5 style="color: #475569; margin-bottom: 1rem;">🔄 Variaciones para A/B Testing</h5>
                    ${data.variations.map((variation, i) => `
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 4px; margin-bottom: 0.75rem;">
                            <strong style="color: #334155;">Variación ${i + 1}:</strong>
                            <div style="margin-top: 0.5rem;">
                                <div style="font-weight: 600; color: #0f172a;">${variation.headline}</div>
                                <div style="color: #64748b; margin-top: 0.5rem; font-size: 14px;">${variation.body}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                    ${data.target_audience ? `
                    <div style="background: #fef3c7; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 12px; color: #92400e; margin-bottom: 0.5rem;">🎯 AUDIENCIA OBJETIVO</div>
                        <div style="color: #78350f; font-size: 14px;">${data.target_audience}</div>
                    </div>
                    ` : ''}
                    ${data.emotional_trigger ? `
                    <div style="background: #fce7f3; padding: 1rem; border-radius: 4px;">
                        <div style="font-size: 12px; color: #9f1239; margin-bottom: 0.5rem;">💖 TRIGGER EMOCIONAL</div>
                        <div style="color: #be123c; font-size: 14px;">${data.emotional_trigger}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderProductDescriptionContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-shopping-bag'></i> Descripción de Producto</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                ${data.tagline ? `
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-size: 18px; font-weight: 600;">
                    ${data.tagline}
                </div>
                ` : ''}
                
                ${data.short_description ? `
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #6366f1;">
                    <strong style="color: #3730a3;">Descripción Breve:</strong>
                    <div style="color: #4338ca; margin-top: 0.5rem;">${data.short_description}</div>
                </div>
                ` : ''}
                
                ${data.long_description ? `
                <div style="background: white; padding: 1.5rem; border-radius: 4px; line-height: 1.8; margin-bottom: 1rem;">
                    <h5 style="color: #1e293b; margin-bottom: 0.75rem;">Descripción Completa</h5>
                    ${data.long_description}
                </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    ${data.key_features && data.key_features.length > 0 ? `
                    <div style="background: white; padding: 1.5rem; border-radius: 4px;">
                        <h5 style="color: #1e293b; margin-bottom: 1rem;">✨ Características Clave</h5>
                        <ul style="list-style: none; padding: 0;">
                            ${data.key_features.map(feature => `
                                <li style="padding: 0.5rem 0; color: #475569; display: flex; align-items: start;">
                                    <i class='bx bx-check-circle' style="color: #10b981; margin-right: 0.5rem; margin-top: 0.25rem;"></i>
                                    <span>${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${data.benefits && data.benefits.length > 0 ? `
                    <div style="background: white; padding: 1.5rem; border-radius: 4px;">
                        <h5 style="color: #1e293b; margin-bottom: 1rem;">💎 Beneficios</h5>
                        <ul style="list-style: none; padding: 0;">
                            ${data.benefits.map(benefit => `
                                <li style="padding: 0.5rem 0; color: #475569; display: flex; align-items: start;">
                                    <i class='bx bx-star' style="color: #f59e0b; margin-right: 0.5rem; margin-top: 0.25rem;"></i>
                                    <span>${benefit}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                ${data.technical_specs && Object.keys(data.technical_specs).length > 0 ? `
                <div style="background: white; padding: 1.5rem; border-radius: 4px; margin-top: 1rem;">
                    <h5 style="color: #1e293b; margin-bottom: 1rem;">⚙️ Especificaciones Técnicas</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
                        ${Object.entries(data.technical_specs).map(([key, value]) => `
                            <div style="padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                                <span style="color: #64748b; font-size: 13px;">${key}:</span>
                                <span style="color: #0f172a; font-weight: 500; margin-left: 0.5rem;">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderLandingPageContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-world'></i> Estructura de Landing Page</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                ${data.hero ? `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 2rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center;">
                    <h1 style="font-size: 32px; margin-bottom: 1rem;">${data.hero.headline}</h1>
                    ${data.hero.subheadline ? `<p style="font-size: 18px; opacity: 0.9; margin-bottom: 1.5rem;">${data.hero.subheadline}</p>` : ''}
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        ${data.hero.cta_primary ? `<button style="background: white; color: #764ba2; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; font-size: 16px;">${data.hero.cta_primary}</button>` : ''}
                        ${data.hero.cta_secondary ? `<button style="background: transparent; color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; font-size: 16px;">${data.hero.cta_secondary}</button>` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${data.value_proposition ? `
                <div style="background: #e0f2fe; padding: 1.5rem; border-radius: 4px; margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="color: #0c4a6e; margin-bottom: 0.5rem;">Propuesta de Valor</h3>
                    <p style="color: #075985; font-size: 16px;">${data.value_proposition}</p>
                </div>
                ` : ''}
                
                ${data.benefits && data.benefits.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: #1e293b; margin-bottom: 1rem; text-align: center;">Beneficios</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        ${data.benefits.map(benefit => `
                            <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <h4 style="color: #6366f1; margin-bottom: 0.75rem;">${benefit.title}</h4>
                                <p style="color: #64748b; line-height: 1.6;">${benefit.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.social_proof ? `
                <div style="background: #fef3c7; padding: 1.5rem; border-radius: 4px; margin-bottom: 1.5rem;">
                    <h4 style="color: #92400e; margin-bottom: 0.75rem;">💬 Social Proof</h4>
                    <p style="color: #78350f;">${data.social_proof}</p>
                </div>
                ` : ''}
                
                ${data.faq && data.faq.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: #1e293b; margin-bottom: 1rem;">Preguntas Frecuentes</h3>
                    ${data.faq.map(faq => `
                        <div style="background: white; padding: 1rem; border-radius: 4px; margin-bottom: 0.75rem; border-left: 3px solid #8b5cf6;">
                            <strong style="color: #1e293b;">${faq.question}</strong>
                            <p style="color: #64748b; margin-top: 0.5rem; line-height: 1.6;">${faq.answer}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.closing_cta ? `
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 2rem; border-radius: 8px; text-align: center;">
                    <h3 style="margin-bottom: 1rem;">¿Listo para empezar?</h3>
                    <button style="background: white; color: #c026d3; border: none; padding: 1rem 2.5rem; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${data.closing_cta}
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderVideoScriptContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-video'></i> Guion de Video</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                ${data.hook ? `
                <div style="background: #fef3c7; padding: 1.5rem; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
                    <h5 style="color: #92400e; margin-bottom: 0.5rem;">⚡ HOOK (Primeros 3 segundos)</h5>
                    <p style="color: #78350f; font-weight: 500; font-size: 16px;">${data.hook}</p>
                </div>
                ` : ''}
                
                ${data.introduction ? `
                <div style="background: white; padding: 1.5rem; border-radius: 4px; margin-bottom: 1rem;">
                    <h5 style="color: #1e293b; margin-bottom: 0.75rem;">Introducción</h5>
                    <p style="color: #475569; line-height: 1.8;">${data.introduction}</p>
                </div>
                ` : ''}
                
                ${data.main_content && data.main_content.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="color: #1e293b; margin-bottom: 1rem;">🎬 Contenido Principal</h5>
                    ${data.main_content.map((scene, i) => `
                        <div style="background: white; padding: 1.5rem; border-radius: 4px; margin-bottom: 1rem; border-left: 3px solid #6366f1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="background: #6366f1; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 13px; font-weight: 600;">
                                    ${scene.timestamp || `Escena ${i + 1}`}
                                </span>
                            </div>
                            ${scene.scene ? `<div style="color: #64748b; margin-bottom: 0.5rem; font-style: italic;">🎥 ${scene.scene}</div>` : ''}
                            <div style="color: #0f172a; line-height: 1.8;">${scene.dialogue || scene.narration || ''}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.call_to_action ? `
                <div style="background: #dcfce7; padding: 1.5rem; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #10b981;">
                    <h5 style="color: #065f46; margin-bottom: 0.5rem;">🎯 CALL TO ACTION</h5>
                    <p style="color: #047857; font-weight: 500; font-size: 16px;">${data.call_to_action}</p>
                </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    ${data.visual_notes && data.visual_notes.length > 0 ? `
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <h5 style="color: #475569; margin-bottom: 0.75rem;">🎨 Notas Visuales</h5>
                        <ul style="list-style: none; padding: 0;">
                            ${data.visual_notes.map(note => `
                                <li style="padding: 0.25rem 0; color: #64748b; font-size: 14px;">
                                    <i class='bx bx-right-arrow-alt' style="color: #6366f1;"></i> ${note}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${data.music_suggestion ? `
                    <div style="background: white; padding: 1rem; border-radius: 4px;">
                        <h5 style="color: #475569; margin-bottom: 0.75rem;">🎵 Música Sugerida</h5>
                        <p style="color: #64748b; font-size: 14px;">${data.music_suggestion}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderHashtagsContent(data) {
    const renderHashtagGroup = (title, hashtags, color) => {
        if (!hashtags || hashtags.length === 0) return '';
        return `
            <div style="margin-bottom: 1.5rem;">
                <h5 style="color: #475569; margin-bottom: 0.75rem;">${title}</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${hashtags.map(tag => `
                        <span style="background: ${color}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer;" onclick="copyToClipboard('${tag}')">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    };
    
    return `
        <div class="content-section">
            <h4><i class='bx bx-hash'></i> Hashtags Estratégicos</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                ${renderHashtagGroup('🔥 Trending', data.trending, '#ef4444')}
                ${renderHashtagGroup('🎯 Nicho', data.niche, '#8b5cf6')}
                ${renderHashtagGroup('🏷️ Branded', data.branded, '#6366f1')}
                ${renderHashtagGroup('⭐ Mix Recomendado', data.recommended_mix, '#10b981')}
                
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <i class='bx bx-info-circle' style="color: #4338ca;"></i>
                    <span style="margin-left: 0.5rem; color: #4338ca; font-size: 14px;">
                        Click en cualquier hashtag para copiarlo al portapapeles
                    </span>
                </div>
            </div>
        </div>
    `;
}

function renderGenericContent(data) {
    return `
        <div class="content-section">
            <h4><i class='bx bx-file-blank'></i> Contenido Generado</h4>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <div style="background: white; padding: 1.5rem; border-radius: 4px; line-height: 1.8; white-space: pre-wrap;">
                    ${data.content || JSON.stringify(data, null, 2)}
                </div>
            </div>
        </div>
    `;
}

// Funciones de utilidad

function copyGeneratedContent() {
    if (!currentGeneratedContent) return;
    
    let textToCopy = '';
    
    // Extraer texto según tipo de contenido
    if (currentGeneratedContent.type === 'email') {
        textToCopy = `Asunto: ${currentGeneratedContent.subject_line}\n\n${currentGeneratedContent.body}`;
    } else if (currentGeneratedContent.type === 'social_post') {
        textToCopy = currentGeneratedContent.content;
        if (currentGeneratedContent.hashtags) {
            textToCopy += '\n\n' + currentGeneratedContent.hashtags.join(' ');
        }
    } else {
        textToCopy = currentGeneratedContent.content || JSON.stringify(currentGeneratedContent, null, 2);
    }
    
    copyToClipboard(textToCopy);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Copiado al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar', 'error');
    });
}

function downloadGeneratedContent() {
    if (!currentGeneratedContent) return;
    
    const content = JSON.stringify(currentGeneratedContent, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contenido-ai-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Contenido descargado', 'success');
}

function regenerateContent() {
    generateContent();
}

function useQuickExample(example) {
    document.getElementById('contentType').value = example.type;
    document.getElementById('topic').value = example.topic;
    document.getElementById('tone').value = example.tone;
    
    if (example.platform) {
        document.getElementById('platform').value = example.platform;
    }
    
    handleContentTypeChange();
    
    // Scroll al formulario
    document.querySelector('.campaign-performance').scrollIntoView({ behavior: 'smooth' });
    showNotification('📝 Ejemplo cargado. Presiona "Generar" para crear el contenido.', 'info');
}

// Modales para funciones adicionales

function showImproveContentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class='bx bx-edit-alt'></i> Mejorar Contenido Existente</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Contenido Original *</label>
                    <textarea id="originalContent" class="form-control" rows="6" placeholder="Pega aquí el contenido que deseas mejorar..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Tipo de Mejora</label>
                    <select id="improvementType" class="form-control">
                        <option value="engagement">Aumentar Engagement</option>
                        <option value="grammar">Corregir Gramática</option>
                        <option value="seo">Optimizar para SEO</option>
                        <option value="shorter">Acortar</option>
                        <option value="longer">Expandir</option>
                        <option value="clarity">Mejorar Claridad</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="improveContent()">
                        <i class='bx bx-brain'></i> Mejorar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showTranslateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class='bx bx-world'></i> Traducir Contenido</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Contenido a Traducir *</label>
                    <textarea id="contentToTranslate" class="form-control" rows="6" placeholder="Pega aquí el contenido..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Idioma Destino</label>
                    <select id="targetLanguage" class="form-control">
                        <option value="inglés">Inglés</option>
                        <option value="francés">Francés</option>
                        <option value="alemán">Alemán</option>
                        <option value="portugués">Portugués</option>
                        <option value="italiano">Italiano</option>
                        <option value="japonés">Japonés</option>
                        <option value="chino">Chino</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="translateContent()">
                        <i class='bx bx-world'></i> Traducir
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showAnalyzeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class='bx bx-bar-chart-alt'></i> Analizar Contenido</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Contenido a Analizar *</label>
                    <textarea id="contentToAnalyze" class="form-control" rows="8" placeholder="Pega aquí el contenido para analizar..."></textarea>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="analyzeContent()">
                        <i class='bx bx-bar-chart-alt'></i> Analizar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showHistoryModal() {
    showNotification('🕐 Historial de contenido - Función en desarrollo', 'info');
}

// Funciones adicionales (Mejorar, Traducir, Analizar)

async function improveContent() {
    const original = document.getElementById('originalContent').value.trim();
    const improvementType = document.getElementById('improvementType').value;
    
    if (!original) {
        showNotification('Por favor ingresa el contenido a mejorar', 'warning');
        return;
    }
    
    // Cerrar modal
    document.querySelector('.modal-overlay').remove();
    
    // Mostrar loading
    const container = document.getElementById('generatedContentContainer');
    const display = document.getElementById('generatedContentDisplay');
    
    container.style.display = 'block';
    display.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class='bx bx-brain bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 1rem; color: #64748b; font-weight: 500;">Mejorando contenido con IA...</p>
        </div>
    `;
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ai-content/improve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                original_content: original,
                improvement_type: improvementType,
                tone: document.getElementById('tone').value
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            displayImprovedContent(result.data);
            showNotification('✨ ¡Contenido mejorado exitosamente!', 'success');
        } else {
            throw new Error(result.detail || 'Error al mejorar contenido');
        }
    } catch (error) {
        console.error('Error:', error);
        display.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: #ef4444;'></i>
                <p style="margin-top: 1rem; color: #64748b;">Error al mejorar contenido</p>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
        showNotification('❌ Error al mejorar contenido', 'error');
    }
}

function displayImprovedContent(data) {
    const display = document.getElementById('generatedContentDisplay');
    
    display.innerHTML = `
        <div class="content-section">
            <h4><i class='bx bx-edit-alt'></i> Contenido Mejorado</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
                <div>
                    <h5 style="color: #64748b; margin-bottom: 0.75rem;">📄 Original</h5>
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; line-height: 1.8; border-left: 3px solid #94a3b8;">
                        ${data.original}
                    </div>
                </div>
                
                <div>
                    <h5 style="color: #10b981; margin-bottom: 0.75rem;">✨ Mejorado</h5>
                    <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; line-height: 1.8; border-left: 3px solid #10b981;">
                        ${data.improved}
                    </div>
                </div>
            </div>
            
            ${data.improvements && data.improvements.length > 0 ? `
            <div style="margin-top: 1.5rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <h5 style="color: #475569; margin-bottom: 1rem;">✨ Mejoras Aplicadas</h5>
                <ul style="list-style: none; padding: 0;">
                    ${data.improvements.map(improvement => `
                        <li style="padding: 0.5rem 0; color: #64748b;">
                            <i class='bx bx-check-circle' style="color: #10b981;"></i> ${improvement}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${data.metrics ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${data.metrics.readability ? `
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 4px;">
                    <div style="font-size: 12px; color: #4338ca; margin-bottom: 0.25rem;">LEGIBILIDAD</div>
                    <div style="font-size: 24px; font-weight: 600; color: #3730a3;">${data.metrics.readability}</div>
                </div>
                ` : ''}
                ${data.metrics.engagement_potential ? `
                <div style="background: #dcfce7; padding: 1rem; border-radius: 4px;">
                    <div style="font-size: 12px; color: #15803d; margin-bottom: 0.25rem;">ENGAGEMENT</div>
                    <div style="font-size: 24px; font-weight: 600; color: #166534;">${data.metrics.engagement_potential}</div>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    currentGeneratedContent = data;
}

async function translateContent() {
    const content = document.getElementById('contentToTranslate').value.trim();
    const targetLang = document.getElementById('targetLanguage').value;
    
    if (!content) {
        showNotification('Por favor ingresa el contenido a traducir', 'warning');
        return;
    }
    
    // Cerrar modal
    document.querySelector('.modal-overlay').remove();
    
    // Mostrar loading
    const container = document.getElementById('generatedContentContainer');
    const display = document.getElementById('generatedContentDisplay');
    
    container.style.display = 'block';
    display.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class='bx bx-world bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 1rem; color: #64748b; font-weight: 500;">Traduciendo a ${targetLang}...</p>
        </div>
    `;
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ai-content/translate?content=${encodeURIComponent(content)}&target_language=${targetLang}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            displayTranslatedContent(result.data);
            showNotification('🌍 ¡Traducción completada!', 'success');
        } else {
            throw new Error(result.detail || 'Error al traducir');
        }
    } catch (error) {
        console.error('Error:', error);
        display.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: #ef4444;'></i>
                <p style="margin-top: 1rem; color: #64748b;">Error al traducir contenido</p>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
        showNotification('❌ Error al traducir contenido', 'error');
    }
}

function displayTranslatedContent(data) {
    const display = document.getElementById('generatedContentDisplay');
    
    display.innerHTML = `
        <div class="content-section">
            <h4><i class='bx bx-world'></i> Contenido Traducido</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
                <div>
                    <h5 style="color: #64748b; margin-bottom: 0.75rem;">🌐 Original (${data.original_language})</h5>
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; line-height: 1.8;">
                        ${data.original}
                    </div>
                </div>
                
                <div>
                    <h5 style="color: #6366f1; margin-bottom: 0.75rem;">✨ Traducción (${data.target_language})</h5>
                    <div style="background: #e0e7ff; padding: 1.5rem; border-radius: 8px; line-height: 1.8;">
                        ${data.translated}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    currentGeneratedContent = data;
}

async function analyzeContent() {
    const content = document.getElementById('contentToAnalyze').value.trim();
    
    if (!content) {
        showNotification('Por favor ingresa el contenido a analizar', 'warning');
        return;
    }
    
    // Cerrar modal
    document.querySelector('.modal-overlay').remove();
    
    // Mostrar loading
    const container = document.getElementById('generatedContentContainer');
    const display = document.getElementById('generatedContentDisplay');
    
    container.style.display = 'block';
    display.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class='bx bx-bar-chart-alt bx-spin' style='font-size: 48px; color: #6366f1;'></i>
            <p style="margin-top: 1rem; color: #64748b; font-weight: 500;">Analizando contenido con IA...</p>
        </div>
    `;
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ai-content/analyze?content=${encodeURIComponent(content)}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            displayContentAnalysis(result.data);
            showNotification('📊 ¡Análisis completado!', 'success');
        } else {
            throw new Error(result.detail || 'Error al analizar');
        }
    } catch (error) {
        console.error('Error:', error);
        display.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class='bx bx-error-circle' style='font-size: 48px; color: #ef4444;'></i>
                <p style="margin-top: 1rem; color: #64748b;">Error al analizar contenido</p>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
        showNotification('❌ Error al analizar contenido', 'error');
    }
}

function displayContentAnalysis(data) {
    const display = document.getElementById('generatedContentDisplay');
    
    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };
    
    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bueno';
        if (score >= 40) return 'Regular';
        return 'Necesita mejora';
    };
    
    display.innerHTML = `
        <div class="content-section">
            <h4><i class='bx bx-bar-chart-alt'></i> Análisis de Contenido</h4>
            
            ${data.content_preview ? `
            <div style="background: #f8fafc; padding: 1rem; border-radius: 4px; margin-top: 1rem; margin-bottom: 1.5rem;">
                <strong style="color: #64748b; font-size: 13px;">📄 CONTENIDO ANALIZADO:</strong>
                <div style="color: #475569; margin-top: 0.5rem; font-style: italic;">${data.content_preview}</div>
            </div>
            ` : ''}
            
            ${data.metrics ? `
            <div style="margin-top: 1.5rem;">
                <h5 style="color: #1e293b; margin-bottom: 1rem;">📊 Métricas de Rendimiento</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    ${data.metrics.readability_score ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${getScoreColor(data.metrics.readability_score)};">
                            ${data.metrics.readability_score}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 0.25rem;">LEGIBILIDAD</div>
                        <div style="font-size: 11px; color: ${getScoreColor(data.metrics.readability_score)}; margin-top: 0.25rem; font-weight: 600;">
                            ${getScoreLabel(data.metrics.readability_score)}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.engagement_score ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${getScoreColor(data.metrics.engagement_score)};">
                            ${data.metrics.engagement_score}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 0.25rem;">ENGAGEMENT</div>
                        <div style="font-size: 11px; color: ${getScoreColor(data.metrics.engagement_score)}; margin-top: 0.25rem; font-weight: 600;">
                            ${getScoreLabel(data.metrics.engagement_score)}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.persuasion_score ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${getScoreColor(data.metrics.persuasion_score)};">
                            ${data.metrics.persuasion_score}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 0.25rem;">PERSUASIÓN</div>
                        <div style="font-size: 11px; color: ${getScoreColor(data.metrics.persuasion_score)}; margin-top: 0.25rem; font-weight: 600;">
                            ${getScoreLabel(data.metrics.persuasion_score)}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.clarity_score ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${getScoreColor(data.metrics.clarity_score)};">
                            ${data.metrics.clarity_score}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 0.25rem;">CLARIDAD</div>
                        <div style="font-size: 11px; color: ${getScoreColor(data.metrics.clarity_score)}; margin-top: 0.25rem; font-weight: 600;">
                            ${getScoreLabel(data.metrics.clarity_score)}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    ${data.metrics.word_count ? `
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 4px;">
                        <div style="font-size: 11px; color: #64748b;">PALABRAS</div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">${data.metrics.word_count}</div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.character_count ? `
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 4px;">
                        <div style="font-size: 11px; color: #64748b;">CARACTERES</div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">${data.metrics.character_count}</div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.estimated_read_time ? `
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 4px;">
                        <div style="font-size: 11px; color: #64748b;">TIEMPO LECTURA</div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">${data.metrics.estimated_read_time}</div>
                    </div>
                    ` : ''}
                    
                    ${data.metrics.sentiment ? `
                    <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 4px;">
                        <div style="font-size: 11px; color: #64748b;">SENTIMIENTO</div>
                        <div style="font-size: 16px; font-weight: 600; color: #334155; text-transform: capitalize;">${data.metrics.sentiment}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                ${data.strengths && data.strengths.length > 0 ? `
                <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h5 style="color: #065f46; margin-bottom: 1rem;">✅ Fortalezas</h5>
                    <ul style="list-style: none; padding: 0;">
                        ${data.strengths.map(strength => `
                            <li style="padding: 0.5rem 0; color: #047857; display: flex; align-items: start;">
                                <i class='bx bx-check-circle' style="color: #10b981; margin-right: 0.5rem; margin-top: 0.25rem;"></i>
                                <span>${strength}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${data.weaknesses && data.weaknesses.length > 0 ? `
                <div style="background: #fef2f2; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <h5 style="color: #991b1b; margin-bottom: 1rem;">⚠️ Áreas de Mejora</h5>
                    <ul style="list-style: none; padding: 0;">
                        ${data.weaknesses.map(weakness => `
                            <li style="padding: 0.5rem 0; color: #b91c1c; display: flex; align-items: start;">
                                <i class='bx bx-error-circle' style="color: #ef4444; margin-right: 0.5rem; margin-top: 0.25rem;"></i>
                                <span>${weakness}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            
            ${data.suggestions && data.suggestions.length > 0 ? `
            <div style="background: #fffbeb; padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #f59e0b;">
                <h5 style="color: #92400e; margin-bottom: 1rem;">💡 Sugerencias de Optimización</h5>
                <ul style="list-style: none; padding: 0;">
                    ${data.suggestions.map(suggestion => `
                        <li style="padding: 0.5rem 0; color: #78350f; display: flex; align-items: start;">
                            <i class='bx bx-bulb' style="color: #f59e0b; margin-right: 0.5rem; margin-top: 0.25rem;"></i>
                            <span>${suggestion}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${data.tone_analysis || data.target_audience || data.cta_effectiveness ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                ${data.tone_analysis ? `
                <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h5 style="color: #475569; margin-bottom: 0.5rem; font-size: 14px;">🎭 Análisis de Tono</h5>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.6;">${data.tone_analysis}</p>
                </div>
                ` : ''}
                
                ${data.target_audience ? `
                <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h5 style="color: #475569; margin-bottom: 0.5rem; font-size: 14px;">🎯 Audiencia Detectada</h5>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.6;">${data.target_audience}</p>
                </div>
                ` : ''}
                
                ${data.cta_effectiveness ? `
                <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h5 style="color: #475569; margin-bottom: 0.5rem; font-size: 14px;">📣 Efectividad del CTA</h5>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.6;">${data.cta_effectiveness}</p>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    currentGeneratedContent = data;
}

