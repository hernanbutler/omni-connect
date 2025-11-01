// WEBAPP/js/views/schedule-view.js

function setupScheduleModal() {
    const scheduleModal = document.getElementById('scheduleModal');
    const closeScheduleModalBtn = document.getElementById('closeScheduleModal');
    const acceptScheduleBtn = document.getElementById('acceptSchedule');
    const customizeScheduleBtn = document.getElementById('customizeSchedule');
    const openScheduleBubble = document.getElementById('openScheduleBubble');

    if (!scheduleModal || !openScheduleBubble) {
        console.error('Schedule modal or bubble button not found in the DOM.');
        return;
    }

    let resolveModalPromise = null;
    let companyName = 'Tu Empresa'; // Default value

    // Load company name from database
    async function loadCompanyName() {
        try {
            // Assuming you have a function to query the database
            // Replace this with your actual database query method
            const db = await window.openDatabase?.() || null;
            if (db) {
                const result = await db.query('SELECT name FROM company_data LIMIT 1');
                if (result && result[0]?.name) {
                    companyName = result[0].name;
                }
            }
        } catch (error) {
            console.error('Error loading company name:', error);
        }
    }

    const contentCalendar = [
        {
            week: 1,
            date: 0, // Days from today
            clientType: 'General y nuevos clientes',
            theme: 'Darnos a conocer',
            objective: 'Presentar la marca y despertar curiosidad',
            socialMedia: 'Facebook, Instagram, LinkedIn, TikTok, X',
            format: 'Imagen',
            copy: `Conectar con tus clientes no debería ser complicado. 💡
En ${companyName} te ayudamos a simplificar tu estrategia de marketing para que tus ideas lleguen más lejos. 🚀
Crea, automatiza y mide... todo desde un solo lugar.

#MarketingDigital #Estrategia #Negocios`
        },
        {
            week: 1,
            date: 3, // Friday (3 days from Tuesday)
            clientType: 'General y nuevos clientes',
            theme: 'Quiénes somos',
            objective: 'Mostrar propósito y equipo',
            socialMedia: 'Facebook, Instagram, LinkedIn, X',
            format: 'Carrusel',
            copy: `Somos un equipo que combina estrategia, creatividad y tecnología para que las marcas crezcan con propósito. 💬✨ 
En ${companyName}, creemos que cada interacción cuenta y que detrás de cada clic hay una historia. 
Conectamos personas, no solo datos. 

#ComunicacionDigital #Negocios #Estrategia`
        },
        {
            week: 2,
            date: 7,
            clientType: 'Nuevos clientes',
            theme: 'Nuevo cliente',
            objective: 'Bienvenido + CTA',
            socialMedia: 'Facebook, Instagram, LinkedIn, TikTok',
            format: 'Video explicativo',
            copy: `¡Bienvenido a ${companyName}! 🙌🏻
Si quieres impulsar tu marca y crear conexiones reales, este es tu lugar. 
Descubre cómo una estrategia integral puede cambiar tu forma de comunicar. 💡
Conecta con nosotros y empieza a crecer.               
                 
#Bienvenida #NuevoCliente #Marketing #Negocios`
        },
        {
            week: 2,
            date: 10,
            clientType: 'Cliente fiel',
            theme: 'Cliente fiel',
            objective: 'Agradecer y fidelizar',
            socialMedia: 'Facebook, Instagram, LinkedIn',
            format: 'Imagen',
            copy: `Gracias por seguir formando parte de esta comunidad 💙   
Tu confianza nos impulsa a seguir creando estrategias más humanas y efectivas.
En ${companyName}, crecer juntos es nuestro mejor resultado.    

#Fidelizacion #ClientesFelices #Negocios`
        },
        {
            week: 3,
            date: 14,
            clientType: 'Cliente inactivo',
            theme: 'Cliente inactivo',
            objective: 'Reactivar el vínculo',
            socialMedia: 'Facebook, Instagram, LinkedIn, TikTok',
            format: 'Imagen',
            copy: `💫 ¡Renovamos energía y queremos que vuelvas a ser parte!
En ${companyName} estamos lanzando nuevas herramientas para simplificar tu marketing.
Si hace un tiempo no pasabas por acá… este es el momento perfecto para redescubrirnos.
💬 Cuéntanos, ¿qué contenido te gustaría ver más seguido?

#MarketingDigital #Comunidad #Negocios`
        },
        {
            week: 3,
            date: 15,
            clientType: 'Cliente fiel y inactivo',
            theme: 'Ofertas',
            objective: 'Ofertas y Promoción',
            socialMedia: 'Facebook, Instagram, LinkedIn',
            format: 'Imagen',
            copy: `🚀 ¡Tu estrategia puede dar el salto que necesita! 
Este mes en ${companyName} accede a una asesoría gratuita de diagnóstico digital.
Descubre oportunidades, optimiza tu comunicación y empieza a crecer con una visión integral.         
Reserva tu lugar antes de fin de mes. 

#Promocion #MarketingDigital #Negocios`
        },
        {
            week: 3,
            date: 17,
            clientType: 'Nuevo cliente y general',
            theme: 'Educativo',
            objective: 'Aportar valor',
            socialMedia: 'Facebook, Instagram, LinkedIn, X',
            format: 'Carrusel',
            copy: `💡¿Qué es el marketing integrado?
Es la estrategia que integra todos tus canales (email, redes, blog) para ofrecer una experiencia coherente a tus clientes.                       
En ${companyName} te enseñamos cómo aplicarlo paso a paso. 🚀 

#Marketing #Aprendizaje #TipsDeMarketing`
        },
        {
            week: 4,
            date: 21,
            clientType: 'Cliente fiel',
            theme: 'Tips',
            objective: 'Compartir consejos rápidos',
            socialMedia: 'Facebook, Instagram, TikTok, X',
            format: 'Reels',
            copy: `✨ 3 tips para fidelizar a tus clientes:
1️⃣ Escucha lo que dicen (y lo que no dicen).
2️⃣ Recompensa su confianza.
3️⃣ Comunícate con coherencia.
En ${companyName}, te ayudamos a convertir clientes en embajadores de marca. 💬                            

#TipsDeMarketing #ClientesFelices #Negocios`
        },
        {
            week: 4,
            date: 24,
            clientType: 'Cliente fiel y general',
            theme: 'Comunidad',
            objective: 'Fomentar interacción',
            socialMedia: 'Facebook, Instagram, LinkedIn, TikTok, X',
            format: 'Reel',
            copy: `Tu opinión nos importa 💬
Queremos saber: ¿Cuál es el canal donde más conectas con tus clientes?
💡Comenta abajo 👇 y cuéntanos cómo creas comunidad desde tu marca.

#ComunidadDigital #Interaccion #Marketing`
        },
        {
            week: 4,
            date: 26,
            clientType: 'Cliente inactivo / fiel / general',
            theme: 'Encuesta',
            objective: 'Escuchar a la comunidad y recopilar información',
            socialMedia: 'Facebook, Instagram, TikTok, X',
            format: 'Historia',
            copy: `Queremos seguir mejorando 💬
Cuéntanos: ¿Qué tipo de contenido te resulta más útil?
🧠 Tips
💡Casos de éxito
📈 Estrategias
Tu opinión nos ayuda a crear contenido más valioso para ti. 🙌

#Encuesta #Comunidad #Feedback`
        }
    ];

    function formatDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('es-ES', options);
    }

    function populateSchedule(posts) {
        const scheduleContent = document.getElementById('scheduleContent');
        scheduleContent.innerHTML = `
            <div class="schedule-table">
                <div class="schedule-header">
                    <div class="col-semana">Semana</div>
                    <div class="col-fecha">Fecha</div>
                    <div class="col-tema">Tema</div>
                    <div class="col-objetivo">Objetivo</div>
                    <div class="col-formato">Formato</div>
                    <div class="col-accion">Acción</div>
                </div>
                <div class="schedule-body"></div>
            </div>
        `;

        const scheduleBody = scheduleContent.querySelector('.schedule-body');
        
        posts.forEach((post, index) => {
            const row = document.createElement('div');
            row.className = 'schedule-row';
            
            const isActive = index < 2; // Solo los dos primeros están activos
            
            row.innerHTML = `
                <div class="col-semana">${post.week}</div>
                <div class="col-fecha">${formatDate(post.date)}</div>
                <div class="col-tema">${post.theme}</div>
                <div class="col-objetivo">${post.objective}</div>
                <div class="col-formato">${post.format}</div>
                <div class="col-accion">
                    <button class="generate-post-btn ${isActive ? 'active' : 'inactive'}" 
                            data-index="${index}" 
                            ${!isActive ? 'disabled' : ''}>
                        ${isActive ? '✨ Generar' : '🔒 Próximamente'}
                    </button>
                </div>
            `;
            
            scheduleBody.appendChild(row);
        });

        // Add event listeners to active buttons
        document.querySelectorAll('.generate-post-btn.active').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                showPostPreview(posts[index]);
            });
        });
    }

    function showPostPreview(post) {
        // Create preview modal
        const previewModal = document.createElement('div');
        previewModal.className = 'modal post-preview-modal'; // Use global modal class
        previewModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class='bx bxs-magic-wand'></i> Vista Previa de Publicación</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="post-preview-image">
                        <img src="../img/test1.png" alt="Vista previa de la imagen generada" style="max-width: 100%; border-radius: 8px;"/>
                    </div>
                    <div class="post-preview-copy">
                        <h4>Texto de la publicación:</h4>
                        <p>${post.copy.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="post-preview-meta">
                        <p><strong>Formato:</strong> ${post.format}</p>
                        <p><strong>Redes sociales:</strong> ${post.socialMedia}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    
                    <button class="btn btn-primary">Publicar ahora</button>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);

        // Add event listeners to close buttons
        previewModal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                previewModal.remove();
            });
        });

        // Close on background click
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.remove();
            }
        });
    }

    function hideScheduleModal(decision) {
        scheduleModal.style.display = 'none';
        openScheduleBubble.style.display = 'block';
        if (resolveModalPromise) {
            resolveModalPromise(decision);
            resolveModalPromise = null;
        }
    }

    async function showScheduleModal() {
        await loadCompanyName();
        
        // Update company name in all posts
        const updatedPosts = contentCalendar.map(post => ({
            ...post,
            copy: post.copy.replace(/\${companyName}/g, companyName)
        }));
        
        populateSchedule(updatedPosts);
        scheduleModal.style.display = 'flex';
        openScheduleBubble.style.display = 'none';

        return new Promise(resolve => {
            resolveModalPromise = resolve;
        });
    }

    // Event Listeners
    closeScheduleModalBtn.addEventListener('click', () => hideScheduleModal('closed'));
    openScheduleBubble.addEventListener('click', () => showScheduleModal());

    acceptScheduleBtn.addEventListener('click', () => {
        hideScheduleModal('accepted');
    });

    customizeScheduleBtn.addEventListener('click', () => {
        alert('La personalización del cronograma estará disponible pronto.');
        hideScheduleModal('customizing');
    });

    scheduleModal.addEventListener('click', function(event) {
        if (event.target === scheduleModal) {
            hideScheduleModal('closed');
        }
    });

    window.showScheduleModal = showScheduleModal;
}

// Initialize the modal setup when the DOM is ready
// Call this from main.js or ensure this script is deferred.aho