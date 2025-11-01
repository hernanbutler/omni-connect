// Configuración global de la aplicación

// URL base de la API
const API_BASE_URL = 'http://localhost:8000';

// Configuración de la aplicación
const APP_CONFIG = {
    apiBaseUrl: API_BASE_URL,
    apiTimeout: 30000, // 30 segundos
    refreshInterval: 300000, // 5 minutos
    
    // Configuración de redes sociales
    socialPlatforms: {
        Instagram: {
            icon: 'bxl-instagram',
            color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
        },
        Facebook: {
            icon: 'bxl-facebook',
            color: '#1877f2'
        },
        Twitter: {
            icon: 'bxl-twitter',
            color: '#000000'
        },
        LinkedIn: {
            icon: 'bxl-linkedin',
            color: '#0a66c2'
        },
        TikTok: {
            icon: 'bxl-tiktok',
            color: '#000000'
        }
    },
    
    // Configuración de charts
    chartColors: {
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        purple: '#8b5cf6'
    },
    
    // Textos de la aplicación
    messages: {
        loadingData: 'Cargando datos...',
        errorLoading: 'Error al cargar datos',
        noData: 'No hay datos disponibles',
        success: 'Operación exitosa',
        error: 'Ha ocurrido un error'
    }
};

// Función helper para hacer requests a la API
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Función para formatear números
function formatNumber(num) {
    if (typeof num !== 'number') {
        num = parseFloat(num);
    }
    
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Función para formatear porcentajes
function formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
}

// Función para mostrar notificaciones (toast)
function showNotification(message, type = 'info') {
    // Implementación básica, puedes mejorarla con una librería de toast
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);