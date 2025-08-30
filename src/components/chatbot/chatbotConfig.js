// Configuración del Chatbot para Lumet Bot (Gemini)
export const chatbotConfig = {
  // Configuración general
  general: {
    name: "Asistente IA Lumet Bot",
    version: "2.0.0",
    language: "es",
    timezone: "America/Mexico_City",
    aiProvider: "Google Gemini 2.0 Flash"
  },

  // Configuración de la interfaz
  ui: {
    // Colores del tema estándar de Lumet
    colors: {
      primary: "#10B981", // Emerald 500
      secondary: "#14B8A6", // Teal 500
      accent: "#34D399", // Emerald 400 (usado en navbar y sidebar)
      background: {
        main: "#111827", // Gray 900
        secondary: "#1F2937", // Gray 800
        tertiary: "#374151" // Gray 700
      },
      text: {
        primary: "#FFFFFF", // White
        secondary: "#FFFFFF", // Gray 300
        tertiary: "#FFFFFF", // Gray 400
        accent: "#34D399" // Emerald 400
      },
      border: {
        primary: "#374151", // Gray 700
        secondary: "#4B5563", // Gray 600
        accent: "#065F46" // Emerald 800
      },
      success: "#059669", // Emerald 700
      warning: "#D97706", // Amber 600
      error: "#DC2626", // Red 600
      info: "#3B82F6" // Blue 500
    },
    
    // Tamaños y espaciados
    sizes: {
      chatWidth: "24rem", // 384px
      chatHeight: "37.5rem", // 600px
      minimizedWidth: "20rem", // 320px
      minimizedHeight: "4rem", // 64px
      borderRadius: "1rem", // 16px
      spacing: "1rem" // 16px
    },

    // Animaciones
    animations: {
      duration: 300,
      easing: "ease-in-out",
      hoverScale: 1.05,
      transitionScale: 1.1
    }
  },

  // Configuración de mensajes
  messages: {
    // Mensajes de bienvenida
    welcome: [
      "¡Hola! Soy tu asistente de IA para Lumet Bot. ¿En qué puedo ayudarte hoy?",
      "Bienvenido al sistema de control de calidad. Soy tu asistente virtual, ¿qué necesitas?",
      "¡Hola! Estoy aquí para ayudarte con información del sistema. ¿Qué te gustaría saber?"
    ],

    // Mensajes de error específicos de Gemini
    errors: {
      network: "Error de conexión. Por favor, verifica tu internet e inténtalo de nuevo.",
      server: "Error del servidor. Por favor, inténtalo más tarde.",
      timeout: "La solicitud tardó demasiado. Por favor, inténtalo de nuevo.",
      unknown: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
      quota: "El servicio de IA está temporalmente sobrecargado. Espera unos minutos.",
      gemini: "Error en el servicio de IA. Contacta al soporte técnico si persiste."
    },

    // Mensajes de estado
    status: {
      typing: "Escribiendo...",
      loading: "Procesando tu solicitud con Gemini...",
      success: "¡Perfecto! Aquí tienes la información.",
      noResults: "No encontré información para tu consulta."
    }
  },

  // Configuración de sugerencias
  suggestions: {
    // Categorías de sugerencias
    categories: {
      system: {
        name: "Sistema",
        icon: "🔧",
        suggestions: [
          "¿Cuáles son las estadísticas del sistema?",
          "¿Cómo está funcionando el servidor?",
          "¿Hay algún problema técnico?"
        ]
      },
      reports: {
        name: "Reportes",
        icon: "📊",
        suggestions: [
          "Muéstrame los reportes recientes",
          "¿Cuántos reportes hay pendientes?",
          "¿Cuál es el estado de los reportes?"
        ]
      },
      users: {
        name: "Usuarios",
        icon: "👥",
        suggestions: [
          "¿Quiénes son los usuarios más activos?",
          "¿Cuántos usuarios hay en el sistema?",
          "¿Hay usuarios con problemas?"
        ]
      },
      quality: {
        name: "Calidad",
        icon: "✅",
        suggestions: [
          "¿Cuál es el nivel de calidad actual?",
          "¿Hay imperfecciones críticas?",
          "¿Cómo mejorar la calidad?"
        ]
      }
    },

    // Número máximo de sugerencias por categoría
    maxPerCategory: 3,
    
    // Rotación automática de sugerencias
    autoRotate: true,
    rotationInterval: 30000 // 30 segundos
  },

  // Configuración de respuestas de Gemini
  responses: {
    // Tiempo máximo de espera para respuesta
    maxWaitTime: 30000, // 30 segundos
    
    // Tiempo de escritura simulado
    typingDelay: {
      min: 1000, // 1 segundo
      max: 3000  // 3 segundos
    },

    // Formato de respuestas
    format: {
      useMarkdown: true,
      useEmojis: true,
      maxLength: 1000,
      structuredOutput: true // Gemini devuelve JSON estructurado
    },

    // Configuración específica de Gemini
    gemini: {
      model: "gemini-2.0-flash",
      temperature: 0.7,
      maxTokens: 1024,
      retryAttempts: 3,
      retryDelay: 5000 // 5 segundos entre reintentos
    }
  },

  // Configuración de permisos
  permissions: {
    // Funcionalidades que requieren permisos especiales
    features: {
      stats: {
        required: ["SYSTEM:VIEW"],
        fallback: "No tienes permisos para ver estadísticas del sistema."
      },
      userHistory: {
        required: ["USUARIOS:VIEW"],
        fallback: "No tienes permisos para ver historial de usuarios."
      },
      systemData: {
        required: ["SYSTEM:VIEW"],
        fallback: "No tienes permisos para acceder a datos del sistema."
      }
    }
  },

  // Configuración de caché
  cache: {
    enabled: true,
    duration: 300000, // 5 minutos
    maxSize: 50 // Máximo 50 elementos en caché
  },

  // Configuración de logs
  logging: {
    enabled: true,
    level: "info", // debug, info, warn, error
    includeUserInfo: false, // Por privacidad
    includeTimestamps: true,
    includeGeminiResponses: false // No logear respuestas completas de Gemini
  },

  // Configuración de accesibilidad
  accessibility: {
    // Navegación por teclado
    keyboardNavigation: true,
    
    // Lectores de pantalla
    screenReader: {
      enabled: true,
      announceTyping: true,
      announceMessages: true
    },

    // Alto contraste
    highContrast: false,
    
    // Tamaño de fuente
    fontSize: {
      min: 12,
      max: 20,
      default: 14
    }
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    types: {
      newMessage: true,
      error: true,
      success: true,
      warning: true,
      geminiError: true // Errores específicos de Gemini
    },
    
    // Posición de las notificaciones
    position: "bottom-right",
    
    // Duración de las notificaciones
    duration: 5000 // 5 segundos
  },

  // Configuración de exportación
  export: {
    enabled: true,
    formats: ["txt", "json"],
    includeMetadata: true,
    maxHistorySize: 100
  },

  // Configuración de manejo de errores de Gemini
  errorHandling: {
    // Reintentos automáticos
    autoRetry: true,
    maxRetries: 3,
    
    // Delays entre reintentos (en milisegundos)
    retryDelays: [1000, 5000, 15000],
    
    // Errores específicos de Gemini
    geminiErrors: {
      quota: {
        message: "Límite de solicitudes alcanzado",
        retryAfter: 60000, // 1 minuto
        userAction: "Esperar antes de reintentar"
      },
      rateLimit: {
        message: "Demasiadas solicitudes",
        retryAfter: 30000, // 30 segundos
        userAction: "Reducir frecuencia de consultas"
      },
      modelUnavailable: {
        message: "Modelo de IA no disponible",
        retryAfter: 120000, // 2 minutos
        userAction: "Contactar soporte técnico"
      }
    }
  }
};

// Función para obtener configuración específica
export const getConfig = (path) => {
  const keys = path.split('.');
  let value = chatbotConfig;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Función para actualizar configuración
export const updateConfig = (path, newValue) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = chatbotConfig;
  
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = newValue;
  return chatbotConfig;
};

// Función para manejar errores específicos de Gemini
export const handleGeminiError = (error) => {
  const errorConfig = chatbotConfig.errorHandling.geminiErrors;
  
  if (error.message.includes('quota') || error.message.includes('Too Many Requests')) {
    return {
      type: 'warning',
      message: errorConfig.quota.message,
      retryAfter: errorConfig.quota.retryAfter,
      userAction: errorConfig.quota.userAction
    };
  }
  
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return {
      type: 'warning',
      message: errorConfig.rateLimit.message,
      retryAfter: errorConfig.rateLimit.retryAfter,
      userAction: errorConfig.rateLimit.userAction
    };
  }
  
  if (error.message.includes('model') || error.message.includes('unavailable')) {
    return {
      type: 'error',
      message: errorConfig.modelUnavailable.message,
      retryAfter: errorConfig.modelUnavailable.retryAfter,
      userAction: errorConfig.modelUnavailable.userAction
    };
  }
  
  // Error genérico
  return {
    type: 'error',
    message: 'Error en el servicio de IA',
    retryAfter: 30000,
    userAction: 'Intentar nuevamente más tarde'
  };
};

export default chatbotConfig;
