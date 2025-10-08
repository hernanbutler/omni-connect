import React, { useState } from 'react';
import { Download, Settings, Database, TrendingUp, Users, Mail, Instagram } from 'lucide-react';

const MarketingDataGenerator = () => {
  const [config, setConfig] = useState({
    users: 30000,
    segments: 15,
    campaigns: 50,
    emails: 100000,
    socialPosts: 200,
    automations: 12,
    months: 12,
    includeSeasonality: true,
    includeChurn: true,
    includeABTests: true
  });

  const [generatedData, setGeneratedData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Utilidades para generación de datos
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(randomBetween(min, max));
  const gaussianRandom = (mean, stdDev) => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Nombres y datos de ejemplo
  const nombres = ['Ana', 'Carlos', 'María', 'Juan', 'Laura', 'Diego', 'Sofía', 'Miguel', 'Carmen', 'Luis', 'Elena', 'Pedro', 'Isabel', 'Jorge', 'Patricia', 
    'Fernando', 'Marta', 'Alberto', 'Lucía', 'Raúl', 'Julia', 'Andrés', 'Sara', 'David', 'Nuria', 'Javier', 'Rosa', 'Manuel', 'Teresa', 'Óscar', 'Silvia',
    'Pablo', 'Clara', 'Iván', 'Beatriz', 'Sergio', 'Alicia', 'Rubén', 'Mónica', 'Víctor', 'Lorena', 'Javier', 'Natalia', 'Héctor', 'Gloria', 'Ramón', 'Elisa', 'Gonzalo', 'Celia', 'Francisco', 'Inés',
    'Óliver', 'Verónica', 'Adrián', 'Yolanda', 'Santiago', 'Miriam', 'Joaquín', 'Lidia', 'Gabriel', 'Eva'
  ];
  const apellidos = ['García', 'López', 'Martínez', 'Rodríguez', 'González', 'Fernández', 'Sánchez', 'Pérez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Jiménez', 'Vargas', 'Castillo',,
    'Rojas', 'Silva', 'Mendoza', 'Romero', 'Alvarez', 'Soto', 'Navarro', 'Domínguez', 'Cabrera', 'Vega', 'Ramos', 'Herrera', 'Castro', 'Suárez', 'Molina', 'Ponce', 'Delgado', 'Guerrero', 'Campos', 'Acosta',,
    'Cortés', 'León', 'Cano', 'Nieto', 'Figueroa', 'Salazar', 'Valdez', 'Arias', 'Paredes', 'Tapia', 'Orozco', 'Sáenz', 'Márquez', 'Castañeda', 'Palacios', 'Rincón',
    'Fuentes', 'Carrillo', 'Escobar', 'Vásquez', 'Cervantes', 'Méndez', 'Santiago', 'Aguilar', 'Paz', 'Cáceres', 'Benítez', 'Rueda', 'Montoya', 'Camacho', 'Ocampo', 'Salinas',
    'Valencia', 'Zamora', 'Mejía', 'Cifuentes', 'Tapia', 'Lara', 'Pimentel', 'Bravo', 'Salgado', 'Vidal', 'Crespo', 'Duarte', 'Espinoza', 'Ferrer', 'Galindo', 'Hernández'
  ];
  const ciudades = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Tacna', 'Ica', 'Puno', 'Ayacucho', 'Juliaca', 'Sullana', 'Chimbote', 'Tumbes', 'Huaraz', 'Moquegua', 'Cajamarca', 'Pucallpa',
    'Santiago de Surco', 'San Isidro', 'Miraflores', 'Barranco', 'La Molina', 'San Borja', 'Lince', 'Breña', 'Magdalena del Mar', 'Jesús María', 'Rímac', 'Callao', 'Bellavista', 'La Punta', 'Ventanilla', 'Mi Perú',
  ];
  const productos = ['Producto Premium A', 'Producto Estándar B', 'Servicio Premium', 'Pack Básico', 'Membresía Gold', 'Kit Starter', 'Bundle Completo', 'Servicio Express'];
  const emailSubjects = [
    '¡Oferta exclusiva solo para ti!',
    'Novedades que te encantarán',
    'Tu descuento especial te espera',
    'Últimas horas: aprovecha ahora',
    'Contenido exclusivo para suscriptores',
    'Te extrañamos, vuelve con beneficios',
    'Nuevo lanzamiento: sé el primero',
    'Tips para aprovechar al máximo'
  ];

  // Patrones de comportamiento por hora del día
  const getHourlyPattern = (hour) => {
    const patterns = {
      email: [0.3, 0.2, 0.1, 0.1, 0.15, 0.25, 0.5, 0.8, 1.0, 0.9, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.95, 0.85, 0.7, 0.6, 0.5, 0.4],
      social: [0.4, 0.3, 0.2, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.75, 0.7, 0.8, 0.9, 0.85, 0.8, 0.85, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6],
      purchase: [0.2, 0.15, 0.1, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.6, 0.5, 0.4, 0.3]
    };
    return patterns;
  };

  // Patrones estacionales por mes
  const getSeasonalPattern = (month) => {
    // 0 = Enero, 11 = Diciembre
    const seasonality = [
      0.85, // Enero (post-navidad)
      0.75, // Febrero
      0.8,  // Marzo
      0.85, // Abril
      0.9,  // Mayo (Día de la Madre)
      0.95, // Junio (Día del Padre)
      1.0,  // Julio (Fiestas Patrias Perú)
      0.9,  // Agosto
      0.85, // Septiembre
      0.9,  // Octubre
      1.0,  // Noviembre (Black Friday)
      1.0   // Diciembre (Navidad)
    ];
    return seasonality[month] || 0.85;
  };

  // Generar usuarios con perfiles realistas
  const generateUsers = (count) => {
    const users = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const registrationDate = new Date(now.getTime() - randomInt(1, 365 * 2) * 24 * 60 * 60 * 1000);
      const daysSinceRegistration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      
      // Determinar tipo de usuario basado en distribución realista
      const userTypeRand = Math.random();
      let userType, engagementLevel, purchaseFrequency, avgOrderValue;
      
      if (userTypeRand < 0.05) { // 5% VIP
        userType = 'vip';
        engagementLevel = gaussianRandom(85, 10);
        purchaseFrequency = randomInt(8, 20);
        avgOrderValue = gaussianRandom(500, 150);
      } else if (userTypeRand < 0.20) { // 15% Active
        userType = 'active';
        engagementLevel = gaussianRandom(65, 15);
        purchaseFrequency = randomInt(3, 8);
        avgOrderValue = gaussianRandom(250, 100);
      } else if (userTypeRand < 0.50) { // 30% Regular
        userType = 'regular';
        engagementLevel = gaussianRandom(45, 15);
        purchaseFrequency = randomInt(1, 3);
        avgOrderValue = gaussianRandom(150, 75);
      } else if (userTypeRand < 0.75) { // 25% Occasional
        userType = 'occasional';
        engagementLevel = gaussianRandom(25, 10);
        purchaseFrequency = randomInt(0, 1);
        avgOrderValue = gaussianRandom(100, 50);
      } else { // 25% Inactive
        userType = 'inactive';
        engagementLevel = gaussianRandom(5, 5);
        purchaseFrequency = 0;
        avgOrderValue = 0;
      }

      const user = {
        id: `USER_${String(i + 1).padStart(6, '0')}`,
        nombre: nombres[randomInt(0, nombres.length)],
        apellido: apellidos[randomInt(0, apellidos.length)],
        email: `usuario${i + 1}@example.com`,
        telefono: `+51 9${randomInt(10000000, 99999999)}`,
        ciudad: ciudades[randomInt(0, ciudades.length)],
        edad: randomInt(18, 65),
        genero: Math.random() > 0.5 ? 'F' : 'M',
        registrationDate: registrationDate.toISOString(),
        daysSinceRegistration,
        userType,
        engagementScore: Math.max(0, Math.min(100, engagementLevel)),
        purchaseFrequency,
        totalPurchases: purchaseFrequency,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        lifetimeValue: Math.round(purchaseFrequency * avgOrderValue * 100) / 100,
        lastActivity: new Date(now.getTime() - randomInt(0, Math.min(daysSinceRegistration, 90)) * 24 * 60 * 60 * 1000).toISOString(),
        emailSubscribed: Math.random() > 0.15,
        smsSubscribed: Math.random() > 0.70,
        preferredChannel: ['email', 'whatsapp', 'sms', 'social'][randomInt(0, 4)],
        interests: generateInterests(),
        churnRisk: calculateChurnRisk(daysSinceRegistration, engagementLevel, purchaseFrequency)
      };
      
      users.push(user);
    }
    
    return users;
  };

  const generateInterests = () => {
    const allInterests = ['tecnología', 'moda', 'deportes', 'hogar', 'belleza', 'viajes', 'gastronomía', 'salud', 'finanzas', 
                          'educación', 'entretenimiento', 'automóviles', 'jardinería', 'fotografía', 'música', 'arte', 'lectura', 'cine', 'videojuegos',
                          'fitness', 'yoga', 'cocina', 'animales', 'manualidades', 'negocios', 'marketing', 'emprendimiento',
                          'inversiones', 'criptomonedas', 'sostenibilidad', 'voluntariado', 'política', 'historia', 'ciencia'];
    const count = randomInt(1, 4);
    const selected = [];
    for (let i = 0; i < count; i++) {
      const interest = allInterests[randomInt(0, allInterests.length)];
      if (!selected.includes(interest)) selected.push(interest);
    }
    return selected;
  };

  const calculateChurnRisk = (days, engagement, purchases) => {
    let risk = 0;
    if (days > 180 && purchases === 0) risk += 40;
    if (engagement < 20) risk += 30;
    if (days > 60 && purchases === 0) risk += 20;
    if (engagement < 10) risk += 10;
    return Math.min(100, risk);
  };

  // Generar segmentos
  const generateSegments = (users, count) => {
    const segments = [
      {
        id: 'SEG_001',
        nombre: 'Compradores VIP',
        descripcion: 'Clientes con compras > $500 en últimos 3 meses',
        criterios: { lifetimeValue: { min: 500 }, userType: 'vip' },
        usuarios: users.filter(u => u.lifetimeValue > 500).length,
        clv: 1250,
        tasaApertura: gaussianRandom(58, 5),
        ctr: gaussianRandom(12.4, 2),
        conversionRate: gaussianRandom(28, 4)
      },
      {
        id: 'SEG_002',
        nombre: 'En Riesgo de Churn',
        descripcion: 'Sin actividad en últimos 45 días',
        criterios: { churnRisk: { min: 50 } },
        usuarios: users.filter(u => u.churnRisk > 50).length,
        clv: 320,
        tasaApertura: gaussianRandom(32, 5),
        ctr: gaussianRandom(4.2, 1),
        conversionRate: gaussianRandom(8, 2)
      },
      {
        id: 'SEG_003',
        nombre: 'Nuevos Suscriptores',
        descripcion: 'Registrados en últimos 30 días',
        criterios: { daysSinceRegistration: { max: 30 } },
        usuarios: users.filter(u => u.daysSinceRegistration <= 30).length,
        clv: 180,
        tasaApertura: gaussianRandom(67, 5),
        ctr: gaussianRandom(8.9, 2),
        conversionRate: gaussianRandom(15, 3)
      }
    ];

    return segments;
  };

  // Generar campañas de email
  const generateEmailCampaigns = (count, users, months) => {
    const campaigns = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const sentDate = new Date(now.getTime() - randomInt(1, months * 30) * 24 * 60 * 60 * 1000);
      const month = sentDate.getMonth();
      const hour = randomInt(8, 20);
      
      const seasonalMultiplier = config.includeSeasonality ? getSeasonalPattern(month) : 1;
      const hourlyMultiplier = getHourlyPattern(hour).email[hour];
      
      const recipients = randomInt(1000, 20000);
      const baseOpenRate = gaussianRandom(42, 8) * seasonalMultiplier * hourlyMultiplier;
      const openRate = Math.max(15, Math.min(75, baseOpenRate));
      const opens = Math.round(recipients * (openRate / 100));
      
      const baseCTR = gaussianRandom(6.5, 2) * (openRate / 42); // CTR correlacionado con apertura
      const ctr = Math.max(2, Math.min(15, baseCTR));
      const clicks = Math.round(opens * (ctr / 100));
      
      const conversionRate = gaussianRandom(12, 4) * (ctr / 6.5);
      const conversions = Math.round(clicks * (conversionRate / 100));
      
      const bounceRate = gaussianRandom(2.1, 0.8);
      const bounces = Math.round(recipients * (bounceRate / 100));
      
      const unsubscribeRate = gaussianRandom(0.3, 0.15);
      const unsubscribes = Math.round(recipients * (unsubscribeRate / 100));

      campaigns.push({
        id: `CAMP_EMAIL_${String(i + 1).padStart(4, '0')}`,
        nombre: `${emailSubjects[randomInt(0, emailSubjects.length)]} - ${sentDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`,
        tipo: 'email',
        estado: sentDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) ? 'activa' : 'completada',
        fechaEnvio: sentDate.toISOString(),
        hora: hour,
        destinatarios: recipients,
        enviados: recipients - bounces,
        aperturas: opens,
        tasaApertura: Math.round(openRate * 100) / 100,
        clicks: clicks,
        ctr: Math.round(ctr * 100) / 100,
        conversiones: conversions,
        tasaConversion: Math.round(conversionRate * 100) / 100,
        rebotes: bounces,
        tasaRebote: Math.round(bounceRate * 100) / 100,
        bajas: unsubscribes,
        tasaBaja: Math.round(unsubscribeRate * 100) / 100,
        revenue: Math.round(conversions * gaussianRandom(150, 50) * 100) / 100,
        segmento: ['Todos', 'VIP', 'Nuevos', 'Activos'][randomInt(0, 4)],
        asunto: emailSubjects[randomInt(0, emailSubjects.length)],
        generadoPorIA: Math.random() > 0.6
      });
    }
    
    return campaigns.sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
  };

  // Generar posts de redes sociales
  const generateSocialPosts = (count, months) => {
    const posts = [];
    const now = new Date();
    const platforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'];
    const contentTypes = ['imagen', 'video', 'carrusel', 'historia', 'reel'];
    
    for (let i = 0; i < count; i++) {
      const publishDate = new Date(now.getTime() - randomInt(1, months * 30) * 24 * 60 * 60 * 1000);
      const month = publishDate.getMonth();
      const hour = randomInt(8, 23);
      const platform = platforms[randomInt(0, platforms.length)];
      
      const seasonalMultiplier = config.includeSeasonality ? getSeasonalPattern(month) : 1;
      const hourlyMultiplier = getHourlyPattern(hour).social[hour];
      
      let baseReach, baseEngagement;
      
      // Diferentes métricas por plataforma
      switch(platform) {
        case 'Instagram':
          baseReach = gaussianRandom(8000, 2000);
          baseEngagement = gaussianRandom(5.5, 1.5);
          break;
        case 'Facebook':
          baseReach = gaussianRandom(6000, 1500);
          baseEngagement = gaussianRandom(3.2, 1);
          break;
        case 'Twitter':
          baseReach = gaussianRandom(5000, 1500);
          baseEngagement = gaussianRandom(2.8, 0.8);
          break;
        case 'LinkedIn':
          baseReach = gaussianRandom(3000, 800);
          baseEngagement = gaussianRandom(4.5, 1.2);
          break;
        case 'TikTok':
          baseReach = gaussianRandom(15000, 5000);
          baseEngagement = gaussianRandom(8.5, 2);
          break;
      }
      
      const reach = Math.round(baseReach * seasonalMultiplier * hourlyMultiplier);
      const engagementRate = Math.max(0.5, baseEngagement * seasonalMultiplier * hourlyMultiplier);
      const engagements = Math.round(reach * (engagementRate / 100));
      
      const likes = Math.round(engagements * gaussianRandom(0.70, 0.10));
      const comments = Math.round(engagements * gaussianRandom(0.15, 0.05));
      const shares = Math.round(engagements * gaussianRandom(0.15, 0.05));
      const saves = platform === 'Instagram' ? Math.round(engagements * gaussianRandom(0.10, 0.03)) : 0;

      posts.push({
        id: `POST_${platform.toUpperCase()}_${String(i + 1).padStart(4, '0')}`,
        plataforma: platform,
        fechaPublicacion: publishDate.toISOString(),
        hora: hour,
        tipo: contentTypes[randomInt(0, contentTypes.length)],
        contenido: `Post promocional sobre ${productos[randomInt(0, productos.length)]}`,
        alcance: reach,
        impresiones: Math.round(reach * gaussianRandom(1.8, 0.3)),
        engagement: engagements,
        tasaEngagement: Math.round(engagementRate * 100) / 100,
        likes: likes,
        comentarios: comments,
        compartidos: shares,
        guardados: saves,
        clicks: Math.round(engagements * gaussianRandom(0.25, 0.08)),
        videoViews: ['video', 'reel'].includes(contentTypes[randomInt(0, contentTypes.length)]) ? Math.round(reach * gaussianRandom(0.85, 0.15)) : 0,
        hashtags: generateHashtags(randomInt(3, 8)),
        mejorHorario: hour >= 18 && hour <= 21,
        generadoPorIA: Math.random() > 0.5
      });
    }
    
    return posts.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
  };

  const generateHashtags = (count) => {
    const hashtags = ['marketing', 'digital', 'emprendimiento', 'negocios', 'ventas', 'ecommerce', 'pymes', 'startup', 'innovacion', 'tecnologia'];
    const selected = [];
    for (let i = 0; i < count; i++) {
      const tag = hashtags[randomInt(0, hashtags.length)];
      if (!selected.includes(tag)) selected.push(tag);
    }
    return selected;
  };

  // Generar flujos de automatización
  const generateAutomations = (count) => {
    const automationTemplates = [
      { nombre: 'Bienvenida Nuevos Clientes', pasos: 5, duracion: 14, trigger: 'nuevo_registro' },
      { nombre: 'Recuperación de Carrito', pasos: 3, duracion: 3, trigger: 'carrito_abandonado' },
      { nombre: 'Reactivación de Inactivos', pasos: 4, duracion: 21, trigger: 'inactividad_45dias' },
      { nombre: 'Nurturing Educativo', pasos: 7, duracion: 30, trigger: 'descarga_lead_magnet' },
      { nombre: 'Post-Compra & Upsell', pasos: 6, duracion: 14, trigger: 'compra_realizada' },
      { nombre: 'Cumpleaños', pasos: 2, duracion: 1, trigger: 'cumpleaños' },
      { nombre: 'Programa de Referidos', pasos: 5, duracion: 60, trigger: 'primera_compra' },
      { nombre: 'Winback Campaign', pasos: 4, duracion: 30, trigger: 'churn_detectado' }
    ];

    const automations = [];
    
    for (let i = 0; i < Math.min(count, automationTemplates.length); i++) {
      const template = automationTemplates[i];
      const isActive = Math.random() > 0.2;
      const usuariosEnFlujo = isActive ? randomInt(100, 3000) : 0;
      
      const openRate = gaussianRandom(58, 8);
      const ctr = gaussianRandom(8.5, 2);
      const conversionRate = gaussianRandom(21, 5);

      automations.push({
        id: `AUTO_${String(i + 1).padStart(3, '0')}`,
        nombre: template.nombre,
        estado: isActive ? 'activo' : ['pausado', 'borrador'][randomInt(0, 2)],
        trigger: template.trigger,
        pasos: template.pasos,
        duracionDias: template.duracion,
        usuariosEnFlujo: usuariosEnFlujo,
        usuariosTotales: usuariosEnFlujo + randomInt(1000, 10000),
        tasaApertura: Math.round(openRate * 100) / 100,
        ctr: Math.round(ctr * 100) / 100,
        tasaConversion: Math.round(conversionRate * 100) / 100,
        revenueGenerado: Math.round(usuariosEnFlujo * conversionRate / 100 * gaussianRandom(200, 80)),
        optimizadoPorIA: Math.random() > 0.4,
        tiempoAhorrado: Math.round(template.pasos * usuariosEnFlujo * 0.05), // minutos
        fechaCreacion: new Date(Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return automations;
  };

  // Generar datos de A/B tests
  const generateABTests = (count) => {
    const tests = [];
    
    for (let i = 0; i < count; i++) {
      const variantA = {
        enviados: randomInt(1000, 5000),
        aperturas: 0,
        clicks: 0,
        conversiones: 0
      };
      
      variantA.aperturas = Math.round(variantA.enviados * gaussianRandom(0.42, 0.08));
      variantA.clicks = Math.round(variantA.aperturas * gaussianRandom(0.065, 0.02));
      variantA.conversiones = Math.round(variantA.clicks * gaussianRandom(0.12, 0.04));
      
      const variantB = {
        enviados: variantA.enviados,
        aperturas: 0,
        clicks: 0,
        conversiones: 0
      };
      
      // Variant B con diferencia del -10% a +25%
      const diff = gaussianRandom(1.08, 0.12);
      variantB.aperturas = Math.round(variantA.aperturas * diff);
      variantB.clicks = Math.round(variantA.clicks * diff * gaussianRandom(1.0, 0.1));
      variantB.conversiones = Math.round(variantA.conversiones * diff * gaussianRandom(1.0, 0.15));

      const winner = variantB.conversiones > variantA.conversiones ? 'B' : 'A';
      const improvement = Math.abs((variantB.conversiones - variantA.conversiones) / variantA.conversiones * 100);

      tests.push({
        id: `ABTEST_${String(i + 1).padStart(3, '0')}`,
        nombre: `Test: ${['Subject Line', 'CTA Button', 'Send Time', 'Design Layout'][randomInt(0, 4)]}`,
        fechaInicio: new Date(Date.now() - randomInt(7, 90) * 24 * 60 * 60 * 1000).toISOString(),
        estado: Math.random() > 0.3 ? 'completado' : 'en_curso',
        variantA: {
          ...variantA,
          tasaApertura: Math.round((variantA.aperturas / variantA.enviados * 100) * 100) / 100,
          ctr: Math.round((variantA.clicks / variantA.aperturas * 100) * 100) / 100,
          tasaConversion: Math.round((variantA.conversiones / variantA.clicks * 100) * 100) / 100
        },
        variantB: {
          ...variantB,
          tasaApertura: Math.round((variantB.aperturas / variantB.enviados * 100) * 100) / 100,
          ctr: Math.round((variantB.clicks / variantB.aperturas * 100) * 100) / 100,
          tasaConversion: Math.round((variantB.conversiones / variantB.clicks * 100) * 100) / 100
        },
        ganador: winner,
        mejora: Math.round(improvement * 100) / 100,
        significanciaEstadistica: improvement > 5 ? 'alta' : improvement > 2 ? 'media' : 'baja'
      });
    }
    
    return tests;
  };

  // Generar métricas agregadas por periodo
  const generateTimeSeriesMetrics = (months) => {
    const metrics = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const seasonalMultiplier = config.includeSeasonality ? getSeasonalPattern(month) : 1;
      
      const baseUsers = 25000;
      const growth = Math.pow(1.03, months - i); // 3% crecimiento mensual
      
      metrics.push({
        periodo: date.toISOString().slice(0, 7),
        mes: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        usuariosActivos: Math.round(baseUsers * growth * seasonalMultiplier),
        nuevosUsuarios: Math.round(1200 * growth * seasonalMultiplier * gaussianRandom(1, 0.2)),
        emailsEnviados: Math.round(45000 * growth * seasonalMultiplier),
        tasaAperturaPromedio: Math.round(gaussianRandom(42, 3) * seasonalMultiplier * 100) / 100,
        ctrPromedio: Math.round(gaussianRandom(6.5, 1) * seasonalMultiplier * 100) / 100,
        conversionesTotal: Math.round(2800 * growth * seasonalMultiplier),
        tasaConversionPromedio: Math.round(gaussianRandom(12, 2) * seasonalMultiplier * 100) / 100,
        revenueTotal: Math.round(145000 * growth * seasonalMultiplier),
        clvPromedio: Math.round(gaussianRandom(650, 100)),
        churnRate: Math.round(gaussianRandom(3.5, 1) * 100) / 100,
        postsRedes: Math.round(48 * seasonalMultiplier),
        engagementRedes: Math.round(gaussianRandom(5.2, 1) * seasonalMultiplier * 100) / 100,
        alcanceRedes: Math.round(85000 * growth * seasonalMultiplier)
      });
    }
    
    return metrics;
  };

  // Función principal de generación
  const generateAllData = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const users = generateUsers(config.users);
      const segments = generateSegments(users, config.segments);
      const emailCampaigns = generateEmailCampaigns(config.campaigns, users, config.months);
      const socialPosts = generateSocialPosts(config.socialPosts, config.months);
      const automations = generateAutomations(config.automations);
      const abTests = config.includeABTests ? generateABTests(20) : [];
      const timeSeriesMetrics = generateTimeSeriesMetrics(config.months);

      const data = {
        metadata: {
          generadoEn: new Date().toISOString(),
          configuracion: config,
          totales: {
            usuarios: users.length,
            segmentos: segments.length,
            campanasEmail: emailCampaigns.length,
            postsRedes: socialPosts.length,
            flujosAutomatizacion: automations.length,
            testAB: abTests.length
          }
        },
        usuarios: users,
        segmentos: segments,
        campanasEmail: emailCampaigns,
        postsRedes: socialPosts,
        flujosAutomatizacion: automations,
        testsAB: abTests,
        metricasTemporales: timeSeriesMetrics,
        // Métricas agregadas globales
        metricsGlobales: {
          tasaAperturaGlobal: Math.round(emailCampaigns.reduce((sum, c) => sum + c.tasaApertura, 0) / emailCampaigns.length * 100) / 100,
          ctrGlobal: Math.round(emailCampaigns.reduce((sum, c) => sum + c.ctr, 0) / emailCampaigns.length * 100) / 100,
          tasaConversionGlobal: Math.round(emailCampaigns.reduce((sum, c) => sum + c.tasaConversion, 0) / emailCampaigns.length * 100) / 100,
          revenueTotal: Math.round(emailCampaigns.reduce((sum, c) => sum + c.revenue, 0)),
          engagementRedesGlobal: Math.round(socialPosts.reduce((sum, p) => sum + p.tasaEngagement, 0) / socialPosts.length * 100) / 100,
          usuariosVIP: users.filter(u => u.userType === 'vip').length,
          usuariosEnRiesgo: users.filter(u => u.churnRisk > 50).length,
          clvPromedio: Math.round(users.reduce((sum, u) => sum + u.lifetimeValue, 0) / users.length * 100) / 100
        }
      };

      setGeneratedData(data);
      setIsGenerating(false);
    }, 1500);
  };

  // Descargar datos como JSON
  const downloadJSON = () => {
    if (!generatedData) return;
    
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketing_data_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Descargar datos como CSV (usuarios)
  const downloadCSV = (type) => {
    if (!generatedData) return;
    
    let csvContent = '';
    let filename = '';
    
    if (type === 'users') {
      const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Ciudad', 'Tipo Usuario', 'Engagement Score', 'Total Compras', 'CLV', 'Riesgo Churn'].join(',');
      const rows = generatedData.usuarios.map(u => [
        u.id, u.nombre, u.apellido, u.email, u.ciudad, u.userType, u.engagementScore, u.totalPurchases, u.lifetimeValue, u.churnRisk
      ].map(field => {
        // Escapar comillas y envolver en comillas si contiene coma o comilla o salto de línea
        const str = String(field ?? '');
        if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
        if (str.includes(',') || str.includes('\n')) return `"${str}"`;
        return str;
      }).join(','));
      csvContent = [headers, ...rows].join('\n');
      filename = 'usuarios.csv';
    } else if (type === 'campaigns') {
      const headers = ['ID', 'Nombre', 'Fecha Envío', 'Destinatarios', 'Tasa Apertura', 'CTR', 'Conversiones', 'Revenue'].join(',');
      const rows = generatedData.campanasEmail.map(c => [
        c.id, c.nombre, c.fechaEnvio.slice(0, 10), c.destinatarios, c.tasaApertura, c.ctr, c.conversiones, c.revenue
      ].map(field => {
        const str = String(field ?? '');
        if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
        if (str.includes(',') || str.includes('\n')) return `"${str}"`;
        return str;
      }).join(','));
      csvContent = [headers, ...rows].join('\n');
      filename = 'campanas_email.csv';
    } else if (type === 'social') {
      const headers = ['ID', 'Plataforma', 'Fecha', 'Alcance', 'Engagement', 'Tasa Engagement', 'Likes', 'Comentarios', 'Compartidos'].join(',');
      const rows = generatedData.postsRedes.map(p => [
        p.id, p.plataforma, p.fechaPublicacion.slice(0, 10), p.alcance, p.engagement, p.tasaEngagement, p.likes, p.comentarios, p.compartidos
      ].map(field => {
        const str = String(field ?? '');
        if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
        if (str.includes(',') || str.includes('\n')) return `"${str}"`;
        return str;
      }).join(','));
      csvContent = [headers, ...rows].join('\n');
      filename = 'posts_redes_sociales.csv';
    }
    
    // Prepend UTF-8 BOM so Excel/Windows muestre correctamente tildes y caracteres especiales
    const csvWithBOM = '\uFEFF' + csvContent;
    const dataBlob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Database size={40} color="#667eea" />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a202c' }}>Generador de Datos de Marketing Omnicanal</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#718096' }}>
                Crea datasets realistas con patrones de comportamiento, estacionalidad y análisis predictivo
              </p>
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings size={24} color="#667eea" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a202c' }}>Configuración del Dataset</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Número de Usuarios
              </label>
              <input
                type="number"
                value={config.users}
                onChange={(e) => setConfig({...config, users: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Segmentos
              </label>
              <input
                type="number"
                value={config.segments}
                onChange={(e) => setConfig({...config, segments: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Campañas Email
              </label>
              <input
                type="number"
                value={config.campaigns}
                onChange={(e) => setConfig({...config, campaigns: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Posts Redes Sociales
              </label>
              <input
                type="number"
                value={config.socialPosts}
                onChange={(e) => setConfig({...config, socialPosts: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Flujos de Automatización
              </label>
              <input
                type="number"
                value={config.automations}
                onChange={(e) => setConfig({...config, automations: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                Meses de Historia
              </label>
              <input
                type="number"
                value={config.months}
                onChange={(e) => setConfig({...config, months: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeSeasonality}
                onChange={(e) => setConfig({...config, includeSeasonality: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500', color: '#4a5568' }}>Incluir Estacionalidad</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeChurn}
                onChange={(e) => setConfig({...config, includeChurn: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500', color: '#4a5568' }}>Incluir Análisis de Churn</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeABTests}
                onChange={(e) => setConfig({...config, includeABTests: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500', color: '#4a5568' }}>Incluir Tests A/B</span>
            </label>
          </div>

          <button
            onClick={generateAllData}
            disabled={isGenerating}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '1rem 2rem',
              background: isGenerating ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s',
              transform: isGenerating ? 'scale(1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => !isGenerating && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <TrendingUp size={24} />
            {isGenerating ? 'Generando datos...' : 'Generar Dataset Completo'}
          </button>
        </div>

        {/* Resultados */}
        {generatedData && (
          <>
            {/* Métricas Globales */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1a202c' }}>📊 Resumen del Dataset Generado</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '0.75rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Users size={24} />
                    <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Usuarios</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{generatedData.usuarios.length.toLocaleString()}</div>
                </div>

                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '0.75rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Mail size={24} />
                    <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Campañas Email</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{generatedData.campanasEmail.length}</div>
                </div>

                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '0.75rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Instagram size={24} />
                    <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Posts Sociales</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{generatedData.postsRedes.length}</div>
                </div>

                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '0.75rem', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={24} />
                    <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Tasa Apertura</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{generatedData.metricsGlobales.tasaAperturaGlobal}%</div>
                </div>

                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '0.75rem', color: '#1a202c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>CTR Promedio</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{generatedData.metricsGlobales.ctrGlobal}%</div>
                </div>

                <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '0.75rem', color: '#1a202c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Revenue Total</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>${(generatedData.metricsGlobales.revenueTotal / 1000).toFixed(1)}K</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f7fafc', borderRadius: '0.75rem', borderLeft: '4px solid #667eea' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c', fontSize: '1.125rem' }}>🎯 Insights Clave</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8', color: '#4a5568' }}>
                  <li><strong>{generatedData.metricsGlobales.usuariosVIP}</strong> usuarios VIP identificados (alto valor)</li>
                  <li><strong>{generatedData.metricsGlobales.usuariosEnRiesgo}</strong> usuarios en riesgo de churn</li>
                  <li>CLV Promedio: <strong>${generatedData.metricsGlobales.clvPromedio}</strong></li>
                  <li>Engagement en Redes: <strong>{generatedData.metricsGlobales.engagementRedesGlobal}%</strong></li>
                  <li>Conversión Global: <strong>{generatedData.metricsGlobales.tasaConversionGlobal}%</strong></li>
                </ul>
              </div>
            </div>

            {/* Opciones de Descarga */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Download size={24} color="#667eea" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a202c' }}>Descargar Datos</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button
                  onClick={downloadJSON}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Download size={20} />
                  Dataset Completo (JSON)
                </button>

                <button
                  onClick={() => downloadCSV('users')}
                  style={{
                    padding: '1rem',
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Users size={20} />
                  Usuarios (CSV)
                </button>

                <button
                  onClick={() => downloadCSV('campaigns')}
                  style={{
                    padding: '1rem',
                    background: '#ed8936',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Mail size={20} />
                  Campañas (CSV)
                </button>

                <button
                  onClick={() => downloadCSV('social')}
                  style={{
                    padding: '1rem',
                    background: '#9f7aea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Instagram size={20} />
                  Redes Sociales (CSV)
                </button>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#edf2f7', borderRadius: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '0.875rem', fontWeight: '600' }}>📝 Estructura del Dataset</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', lineHeight: '1.8', color: '#4a5568' }}>
                  <li><strong>usuarios:</strong> Perfiles completos con comportamiento, CLV, segmentación</li>
                  <li><strong>segmentos:</strong> Grupos con métricas de rendimiento</li>
                  <li><strong>campanasEmail:</strong> Historial con tasas de apertura, CTR, conversiones</li>
                  <li><strong>postsRedes:</strong> Métricas de engagement por plataforma</li>
                  <li><strong>flujosAutomatizacion:</strong> Secuencias con rendimiento y optimización IA</li>
                  <li><strong>testsAB:</strong> Experimentos con variantes y ganadores</li>
                  <li><strong>metricasTemporales:</strong> Series de tiempo mensuales</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketingDataGenerator;