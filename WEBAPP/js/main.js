// Script principal: Orquestación y Navegación

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Setup sidebar interactions
    setupSidebar();

    // Load dashboard content on page load
    loadDashboardContent();

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Load content based on section
            if (targetSection === 'dashboard') {
                loadDashboardContent();
            } else if (targetSection === 'segmentation') {
                loadSegmentationContent();
            } else if (targetSection === 'social') {
                loadSocialContent();
            } else if (targetSection === 'campaigns') {
                console.log('Loading campaigns content...');
                loadCampaignsContent();
            } else if (targetSection === 'automation') {
                invokeOrPlaceholder('loadAutomationContent', 'automation');
            } else if (targetSection === 'ai-content') {
                // Llamar a la función del generador de IA
                if (typeof loadAIContentGenerator_real === 'function') {
                    loadAIContentGenerator_real();
                } else if (typeof loadAIContentGenerator === 'function') {
                    loadAIContentGenerator();
                } else {
                    loadPlaceholderContent('ai-content');
                }
            } else if (targetSection === 'analytics') {
                invokeOrPlaceholder('loadAnalyticsContent', 'analytics');
            } else {
                loadPlaceholderContent(targetSection);
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // AI Content Generator
    setupAIGenerator();
});

// Safe invoker: si la función real existe la llama, si no muestra placeholder
function invokeOrPlaceholder(fnName, section) {
    try {
        const fn = window[fnName];
        if (typeof fn === 'function') {
            fn();
        } else {
            loadPlaceholderContent(section);
        }
    } catch (err) {
        console.error(`Error invoking ${fnName}:`, err);
        loadPlaceholderContent(section);
    }
}

// Load placeholder content for other sections
function loadPlaceholderContent(section) {
    const mainContent = document.getElementById('mainContent');
    
    const sectionTitles = {
        'campaigns': 'Campañas Email',
        'social': 'Redes Sociales',
        'automation': 'Automatización',
        'ai-content': 'Generador IA',
        'analytics': 'Análisis & Reportes'
    };

    mainContent.innerHTML = `
        <div style="text-align: center; padding: 64px 24px;">
            <i class='bx bx-cog' style='font-size: 64px; color: #6366f1;'></i>
            <h2 style="margin-top: 24px; color: #0f172a;">${sectionTitles[section]}</h2>
            <p style="color: #64748b; margin-top: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
                Esta sección está en desarrollo. Pronto podrás acceder a todas las funcionalidades.
            </p>
            <button onclick="loadDashboardContent(); document.querySelector('[data-section=dashboard]').click();" 
                    class="btn btn-primary" style="margin-top: 24px;">
                <i class='bx bx-home'></i> Volver al Dashboard
            </button>
        </div>
    `;
}

// AI Content Generator
function setupAIGenerator() {
    // This would be implemented when the AI content section is loaded
    console.log('AI Generator setup ready');
}