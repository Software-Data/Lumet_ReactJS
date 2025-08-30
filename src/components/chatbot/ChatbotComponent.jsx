import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatbotService } from '../../api/chatbotService';
import { Send, Bot, User, RefreshCw, Settings, BarChart3, History, Zap, X, Minimize2, Maximize2, AlertTriangle, Clock } from 'lucide-react';
import { ColorRing } from 'react-loader-spinner';

const ChatbotComponent = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [userHistory, setUserHistory] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [retryTimer, setRetryTimer] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: `¡Hola ${user?.nombre || 'Usuario'}! Soy tu asistente de IA para Lumet Bot. Puedo ayudarte con información sobre reportes, carrocerías, usuarios y más. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date(),
          isWelcome: true
        }
      ]);
    }
  }, [isOpen, messages.length, user?.nombre]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Limpiar timer de reintento cuando se desmonte
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setIsTyping(true);

    try {
      console.log('🔄 Enviando mensaje al chatbot...');
      
      const response = await chatbotService.sendMessage(
        inputMessage.trim(),
        user.id,
        user.id_rol
      );

      console.log('📥 Respuesta recibida del chatbot:', response);
      console.log('📄 Tipo de respuesta:', typeof response);
      console.log('📄 Longitud de respuesta:', response?.length || 'N/A');

      // Crear mensaje del bot con la respuesta HTML de Gemini
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        isHTML: true
      };

      console.log('🤖 Mensaje del bot creado:', botMessage);
      setMessages(prev => [...prev, botMessage]);
      
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err);
      
      // Manejar errores específicos de Gemini
      const geminiError = chatbotService.handleGeminiError(err);
      setError(geminiError.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Lo siento, ha ocurrido un error: ${geminiError.message}`,
        timestamp: new Date(),
        isError: true,
        errorType: geminiError.type,
        retryAfter: geminiError.retryAfter
      };

      setMessages(prev => [...prev, errorMessage]);

      // Configurar timer de reintento si es necesario
      if (geminiError.retryAfter) {
        const timer = setTimeout(() => {
          setError(null);
          setRetryTimer(null);
        }, geminiError.retryAfter);
        setRetryTimer(timer);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleGetStats = async () => {
    try {
      setShowStats(true);
      const response = await chatbotService.getStats(user.id, user.id_rol);
      setStats(response);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('Error al obtener estadísticas');
    }
  };

  const handleGetUserHistory = async () => {
    try {
      setShowStats(true);
      const response = await chatbotService.getUserHistory(user.id, user.id, user.id_rol);
      setUserHistory(response);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setError('Error al obtener historial del usuario');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  // Renderizar mensaje del bot con HTML
  const renderBotMessage = (message) => {
    console.log('🎨 Renderizando mensaje del bot:', message);
    console.log('📄 Contenido del mensaje:', message.content);
    console.log('🔧 Es HTML:', message.isHTML);
    
    if (message.isHTML && message.content) {
      console.log('✅ Renderizando HTML del mensaje');
      return (
        <div 
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      );
    }
    
    // Si no es HTML o no hay contenido, mostrar como texto plano
    console.log('⚠️ Mostrando mensaje como texto plano');
    return (
      <div className="text-gray-800">
        {message.content || 'No hay contenido para mostrar'}
      </div>
    );
  };

  // Renderizar mensaje del usuario
  const renderUserMessage = (message) => (
    <div className="text-white">
      {message.content}
    </div>
  );

  // Renderizar mensaje de error con información de reintento
  const renderErrorMessage = (message) => (
    <div className="text-red-800">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p>{message.content}</p>
          {message.retryAfter && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
              <Clock className="w-4 h-4" />
              <span>Puedes intentar nuevamente en {Math.ceil(message.retryAfter / 1000)} segundos</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggleOpen}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="Abrir Asistente IA"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Asistente IA</h3>
              <p className="text-xs text-emerald-100">Lumet Bot</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleMinimize}
              className="p-1 hover:bg-emerald-500 rounded transition-colors"
              title={isMinimized ? "Expandir" : "Minimizar"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleOpen}
              className="p-1 hover:bg-emerald-500 rounded transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Toolbar */}
            <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGetStats}
                  className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Estadísticas"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGetUserHistory}
                  className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Historial"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Limpiar chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {user?.nombre || 'Usuario'}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-teal-500 text-white'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-emerald-500 text-white'
                        : message.isError
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-white border border-gray-200'
                    }`}>
                      {message.type === 'user' 
                        ? renderUserMessage(message)
                        : message.isError
                        ? renderErrorMessage(message)
                        : renderBotMessage(message)
                      }
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de escritura */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <ColorRing
                      visible={true}
                      height="20"
                      width="20"
                      ariaLabel="loading"
                      colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Modal de Estadísticas */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Estadísticas del Sistema</h3>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-sm text-emerald-600">Carrocerías</p>
                    <p className="text-2xl font-bold text-emerald-800">{stats.totalCarrocerias}</p>
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-sm text-teal-600">Reportes</p>
                    <p className="text-2xl font-bold text-teal-800">{stats.totalReportes}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm text-amber-600">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-800">{stats.reportesPendientes}</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-sm text-indigo-600">Completados</p>
                    <p className="text-2xl font-bold text-indigo-800">{stats.reportesCompletados}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ColorRing
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="loading"
                  colors={['#10b981', '#10b981', '#10b981', '#10b981', '#10b981']}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Historial */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Historial del Usuario</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {userHistory ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">Información del Usuario</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-600">Nombre:</p>
                      <p className="font-medium">{userHistory.usuario?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Rol:</p>
                      <p className="font-medium">{userHistory.usuario?.rol}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Estado:</p>
                      <p className="font-medium">{userHistory.usuario?.estado}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Fecha de Registro:</p>
                      <p className="font-medium">{new Date(userHistory.usuario?.fechaRegistro).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-teal-800 mb-2">Resumen de Actividad</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">{userHistory.resumenActividad?.totalReportes || 0}</p>
                      <p className="text-teal-700">Reportes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">{userHistory.resumenActividad?.totalCarrocerias || 0}</p>
                      <p className="text-teal-700">Carrocerías</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal-600">{userHistory.resumenActividad?.totalImperfecciones || 0}</p>
                      <p className="text-teal-700">Imperfecciones</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ColorRing
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="loading"
                  colors={['#10b981', '#10b981', '#10b981', '#10b981', '#10b981']}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-1 text-white hover:text-red-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;
