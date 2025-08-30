import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración base de axios
const chatbotApi = axios.create({
  baseURL: `${API_URL}/chatbot`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
chatbotApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
chatbotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const chatbotService = {
  // Enviar mensaje al chatbot (ahora compatible con Gemini)
  async sendMessage(message, userId, roleId) {
    try {
      console.log('🚀 Enviando mensaje al chatbot:', { message, userId, roleId });
      
      const response = await chatbotApi.post('/chat', {
        mensaje: message,
        id: userId,
        id_rol: roleId
      });
      
      console.log('📥 Respuesta del backend:', response);
      console.log('📄 Tipo de respuesta:', typeof response.data);
      console.log('📄 Contenido de respuesta:', response.data);
      
      // Gemini devuelve HTML estructurado, necesitamos procesarlo correctamente
      let processedResponse = response.data;
      
      // Si la respuesta es un string (HTML), devolverla directamente
      if (typeof processedResponse === 'string') {
        console.log('✅ Respuesta HTML recibida, longitud:', processedResponse.length);
        return processedResponse;
      }
      
      // Si la respuesta es un objeto, buscar el HTML
      if (typeof processedResponse === 'object' && processedResponse !== null) {
        // Buscar en diferentes propiedades donde podría estar el HTML
        if (processedResponse.html) {
          console.log('✅ HTML encontrado en propiedad .html');
          return processedResponse.html;
        }
        if (processedResponse.data) {
          console.log('✅ HTML encontrado en propiedad .data');
          return processedResponse.data;
        }
        if (processedResponse.content) {
          console.log('✅ HTML encontrado en propiedad .content');
          return processedResponse.content;
        }
        if (processedResponse.response) {
          console.log('✅ HTML encontrado en propiedad .response');
          return processedResponse.response;
        }
        
        // Si no encontramos HTML, convertir el objeto a string para debugging
        console.warn('⚠️ No se encontró HTML en la respuesta, convirtiendo objeto a string');
        return JSON.stringify(processedResponse, null, 2);
      }
      
      // Fallback: devolver la respuesta tal como está
      console.log('✅ Devolviendo respuesta tal como está');
      return processedResponse;
      
    } catch (error) {
      console.error('❌ Error al enviar mensaje al chatbot:', error);
      
      // Manejo específico de errores de Gemini
      if (error.response?.status === 429) {
        throw new Error('El servicio de IA está temporalmente sobrecargado. Por favor, espera unos minutos antes de intentar nuevamente.');
      } else if (error.response?.status === 500) {
        // Si hay un error del servidor, mostrar el mensaje personalizado
        const errorHtml = error.response.data;
        if (typeof errorHtml === 'string' && errorHtml.includes('Error del Asistente')) {
          console.log('✅ Devolviendo HTML de error personalizado');
          return errorHtml; // Devolver el HTML de error personalizado
        }
        throw new Error('Error interno del servidor. Por favor, inténtalo más tarde.');
      }
      
      throw error;
    }
  },

  // Obtener estadísticas del chatbot
  async getStats(userId, roleId) {
    try {
      const response = await chatbotApi.post('/stats', {
        id: userId,
        id_rol: roleId
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del chatbot:', error);
      throw error;
    }
  },

  // Obtener historial de un usuario específico
  async getUserHistory(targetUserId, requestingUserId, requestingUserRoleId) {
    try {
      const response = await chatbotApi.post('/user-history', {
        targetUserId,
        id: requestingUserId,
        id_rol: requestingUserRoleId
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial del usuario:', error);
      throw error;
    }
  },

  // Probar relaciones del chatbot
  async testRelations(userId, roleId) {
    try {
      const response = await chatbotApi.post('/test-relations', {
        id: userId,
        id_rol: roleId
      });
      return response.data;
    } catch (error) {
      console.error('Error al probar relaciones del chatbot:', error);
      throw error;
    }
  },

  // Verificar estado de salud del chatbot
  async healthCheck(userId) {
    try {
      const response = await chatbotApi.post('/health', {
        id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error en health check del chatbot:', error);
      throw error;
    }
  },

  // Función helper para procesar respuestas de Gemini
  processGeminiResponse(response) {
    console.log('🔧 Procesando respuesta de Gemini:', response);
    
    // Gemini ya devuelve HTML estructurado, solo necesitamos limpiarlo si es necesario
    if (typeof response === 'string') {
      // Remover espacios en blanco extra y normalizar
      const cleanedResponse = response.trim();
      console.log('✅ Respuesta HTML procesada, longitud:', cleanedResponse.length);
      return cleanedResponse;
    }
    
    console.log('⚠️ Respuesta no es string, devolviendo tal como está');
    return response;
  },

  // Función para manejar errores específicos de Gemini
  handleGeminiError(error) {
    if (error.message.includes('sobrecargado') || error.message.includes('cuota')) {
      return {
        type: 'warning',
        title: 'Servicio Temporalmente No Disponible',
        message: 'El servicio de IA está experimentando alta demanda. Por favor, inténtalo en unos minutos.',
        retryAfter: 30000 // 30 segundos
      };
    }
    
    if (error.message.includes('Error del Asistente')) {
      return {
        type: 'error',
        title: 'Error del Asistente',
        message: 'Ha ocurrido un error en el servicio de IA. Por favor, contacta al soporte técnico.',
        retryAfter: 60000 // 1 minuto
      };
    }
    
    return {
      type: 'error',
      title: 'Error de Conexión',
      message: 'No se pudo conectar con el servicio de IA. Verifica tu conexión e inténtalo de nuevo.',
      retryAfter: 10000 // 10 segundos
    };
  }
};

export default chatbotService;
