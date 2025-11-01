// Script principal: Orquestación y Navegación
 
function navigateToSection(section) {
    const navItems = document.querySelectorAll('.nav-item');
    const item = document.querySelector(`.nav-item[data-section="${section}"]`);

    if (!item) {
        console.warn(`Sección de navegación no encontrada: ${section}`);
        return;
    }

    // Update active nav item
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // Load content based on section
    if (section === 'home') {
        loadHomeContent();
    } else if (section === 'dashboard') {
        loadDashboardContent();
    } else if (section === 'segmentation') {
        loadSegmentationContent();
    } else if (section === 'social') {
        loadSocialContent();
    } else if (section === 'campaigns') {
        console.log('Loading campaigns content...');
        loadCampaignsContent();
    } else if (section === 'automation') {
        invokeOrPlaceholder('loadAutomationContent', 'automation');
    } else if (section === 'ai-content') {
        if (typeof loadAIContentGenerator_real === 'function') {
            loadAIContentGenerator_real();
        } else if (typeof loadAIContentGenerator === 'function') {
            loadAIContentGenerator();
        } else {
            loadPlaceholderContent('ai-content');
        }
    } else if (section === 'analytics') {
        invokeOrPlaceholder('loadAnalyticsContent', 'analytics');
    } else {
        loadPlaceholderContent(section);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}




document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Setup sidebar interactions
    setupSidebar();

    // Setup modals
    setupScheduleModal();

    // Load home content on page load
    navigateToSection('home');

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;
            navigateToSection(targetSection);
        });
    });

    // Expose navigation function to global scope
    window.navigateToSection = navigateToSection;

    // AI Content Generator
    setupAIGenerator();
});

// Welcome Modal Logic
const welcomeModal = document.getElementById('welcomeModal');
const gettingStartedModal = document.getElementById('gettingStartedModal');
const companyProfileForm = document.getElementById('companyProfileForm');
const saveProfileBtn = document.getElementById('saveCompanyProfileBtn');

saveProfileBtn.addEventListener('click', async function() {
    const formData = new FormData(companyProfileForm);
    const data = Object.fromEntries(formData.entries());

    // Basic validation
    if (!data.name || !data.industry) {
        alert('Por favor, completa el nombre y la industria de la empresa.');
        return;
    }

    try {
        // company router is mounted at /api/company/profile (no v1 prefix)
        const response = await fetch(`${API_BASE_URL}/api/company/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Error al guardar los datos.');
        }
        const savedData = await response.json();
        console.log('Perfil de empresa guardado:', savedData);
        
        await updateViewState('profile_complete', 'true'); // Update view state
        
        // Trigger the central onboarding orchestrator
        if (window.orchestrateOnboardingFlow) {
            window.orchestrateOnboardingFlow();
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al guardar la información. Por favor, inténtalo de nuevo.');
    }
});

// Getting Started Modal Logic
const closeGettingStartedModalBtn = document.getElementById('closeGettingStartedModal');
const gettingStartedActionButtons = document.querySelectorAll('.getting-started-action');

const handleGettingStartedChoice = async (choice = 'closed') => {
    await updateViewState('getting_started_shown', 'true');
    await updateViewState('getting_started_choice', choice);
    
    // Trigger the central onboarding orchestrator
    if (window.orchestrateOnboardingFlow) {
        window.orchestrateOnboardingFlow();
    }
};

closeGettingStartedModalBtn.addEventListener('click', () => handleGettingStartedChoice('closed'));
gettingStartedModal.addEventListener('click', (e) => {
    if (e.target === gettingStartedModal) {
        handleGettingStartedChoice('closed');
    }
});

gettingStartedActionButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const section = button.dataset.section;
        await handleGettingStartedChoice(section);
    });
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
            <button onclick="navigateToSection('dashboard');" 
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