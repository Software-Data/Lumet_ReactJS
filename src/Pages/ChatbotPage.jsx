import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotService } from '../api/chatbotService';
import Layout from '../components/layout/layout.jsx';
import { Bot, Send, RefreshCw, BarChart3, History, Zap, MessageSquare, Users, FileText, Car, AlertTriangle, Clock } from 'lucide-react';
import { ColorRing } from 'react-loader-spinner';

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [retryTimer, setRetryTimer] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (messages.length === 0) {
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
  }, [user?.nombre]);

  // Limpiar timer de reintento cuando se desmonte
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  // Cargar estadísticas automáticamente cuando se cambie al tab
  useEffect(() => {
    if (activeTab === 'stats' && !stats && !isLoadingStats) {
      console.log('🔄 Cambio a tab de estadísticas, cargando automáticamente...');
      handleGetStats();
    }
  }, [activeTab, stats, isLoadingStats]);

  // Cargar historial automáticamente cuando se cambie al tab
  useEffect(() => {
    if (activeTab === 'history' && !userHistory && !isLoadingHistory) {
      console.log('🔄 Cambio a tab de historial, cargando automáticamente...');
      handleGetUserHistory();
    }
  }, [activeTab, userHistory, isLoadingHistory]);

  // Debug: mostrar estado actual en consola
  useEffect(() => {
    console.log('📊 Estado actual:', {
      activeTab,
      stats: stats ? 'Cargadas' : 'No cargadas',
      userHistory: userHistory ? 'Cargado' : 'No cargado',
      isLoadingStats,
      isLoadingHistory
    });
  }, [activeTab, stats, userHistory, isLoadingStats, isLoadingHistory]);

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
      console.log('🔄 Obteniendo estadísticas...');
      console.log('👤 User ID:', user.id);
      console.log('🎭 Role ID:', user.id_rol);
      
      setIsLoadingStats(true);
      setError(null);
      
      setActiveTab('stats');
      const response = await chatbotService.getStats(user.id, user.id_rol);
      
      console.log('📊 Respuesta de estadísticas recibida:', response);
      console.log('📊 Tipo de respuesta:', typeof response);
      console.log('📊 Contenido de response.data:', response?.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response && response.success && response.data) {
        console.log('✅ Estadísticas válidas, actualizando estado');
        setStats(response.data);
      } else if (response && response.data) {
        // Si no tiene success pero sí data, usar directamente
        console.log('⚠️ Respuesta sin success, usando data directamente');
        setStats(response.data);
      } else {
        console.log('❌ Respuesta inválida:', response);
        setError('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('❌ Error al obtener estadísticas:', err);
      setError('Error al obtener estadísticas: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGetUserHistory = async () => {
    try {
      console.log('🔄 Obteniendo historial del usuario...');
      console.log('👤 User ID:', user.id);
      console.log('🎭 Role ID:', user.id_rol);
      
      setIsLoadingHistory(true);
      setError(null);
      
      setActiveTab('history');
      const response = await chatbotService.getUserHistory(user.id, user.id, user.id_rol);
      
      console.log('📚 Respuesta de historial recibida:', response);
      console.log('📚 Tipo de respuesta:', typeof response);
      console.log('📚 Contenido de response.data:', response?.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response && response.success && response.data) {
        console.log('✅ Historial válido, actualizando estado');
        setUserHistory(response.data);
      } else if (response && response.data) {
        // Si no tiene success pero sí data, usar directamente
        console.log('⚠️ Respuesta sin success, usando data directamente');
        setUserHistory(response.data);
      } else {
        console.log('❌ Respuesta inválida:', response);
        setError('Formato de respuesta inválido para historial');
      }
    } catch (err) {
      console.error('❌ Error al obtener historial:', err);
      setError('Error al obtener historial del usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: `¡Hola ${user?.nombre || 'Usuario'}! Soy tu asistente de IA para Lumet Bot. Puedo ayudarte con información sobre reportes, carrocerías, usuarios y más. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
        isWelcome: true
      }
    ]);
    setError(null);
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
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
          className="prose prose-sm max-w-none text-gray-300"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      );
    }
    
    // Si no es HTML o no hay contenido, mostrar como texto plano
    console.log('⚠️ Mostrando mensaje como texto plano');
    return (
      <div className="text-gray-300">
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
    <div className="text-red-300">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p>{message.content}</p>
          {message.retryAfter && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-400">
              <Clock className="w-4 h-4" />
              <span>Puedes intentar nuevamente en {Math.ceil(message.retryAfter / 1000)} segundos</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
      <Layout>
          <div className="w-full h-full bg-gray-900 text-white">
      {/* Header */}


      <div className="flex h-[calc(100vh)]">
        {/* Área principal del chat */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}

<header className="bg-gray-800 border-b-2 border-b-emerald-800 shadow-lg">
  <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
    {/* Título a la izquierda */}
    <div className="flex items-center">
      <h1 className="text-xl font-bold text-white">Asistente IA</h1>
    </div>

    {/* Pestañas de Navegación en el centro/derecha */}
    <nav className="flex h-full items-center space-x-4">
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex h-full items-center gap-x-2 border-b-4 px-4 text-sm font-medium transition-all duration-300 ease-in-out
          ${
            activeTab === 'chat'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white'
          }`}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
      </button>


    </nav>
  </div>
</header>

          {/* Contenido de los tabs */}
          <div className="flex-1 overflow-hidden">
            {/* Tab Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[70%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-teal-500 text-white'
                        }`}>
                          {message.type === 'user' ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </div>
                        <div className={`rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-emerald-500 text-white'
                            : message.isError
                            ? 'bg-red-900 border border-red-700'
                            : 'bg-gray-800 border border-gray-700 shadow-sm'
                        }`}>
                          {message.type === 'user' 
                            ? renderUserMessage(message)
                            : message.isError
                            ? renderErrorMessage(message)
                            : renderBotMessage(message)
                          }
                          <div className={`text-xs mt-3 ${
                            message.type === 'user' ? 'text-emerald-100' : 'text-gray-400'
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
                      <div className="flex items-start space-x-3 max-w-[70%]">
                        <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-700 bg-gray-800">
                  <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Escribe tu mensaje o pregunta..."
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <ColorRing
                            visible={true}
                            height="20"
                            width="20"
                            ariaLabel="loading"
                            colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
                          />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Enviar</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab Estadísticas */}
            {activeTab === 'stats' && (
              <div className="p-6 bg-gray-900">
                {/* Header con botón de recarga */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Estadísticas del Sistema</h2>
                  <button
                    onClick={handleGetStats}
                    disabled={isLoadingStats}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                    <span>{isLoadingStats ? 'Cargando...' : 'Recargar'}</span>
                  </button>
                </div>

                {isLoadingStats ? (
                  <div className="text-center py-12">
                    <ColorRing
                      visible={true}
                      height="60"
                      width="60"
                      ariaLabel="loading"
                      colors={['#10b981', '#10b981', '#10b981', '#10b981', '#10b981']}
                    />
                    <p className="mt-4 text-gray-400">Cargando estadísticas...</p>
                  </div>
                ) : stats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-emerald-900 rounded-lg">
                            <Car className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Carrocerías</p>
                            <p className="text-2xl font-bold text-white">{stats.totalCarrocerias}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-teal-900 rounded-lg">
                            <FileText className="w-6 h-6 text-teal-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Reportes</p>
                            <p className="text-2xl font-bold text-white">{stats.totalReportes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-amber-900 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Pendientes</p>
                            <p className="text-2xl font-bold text-white">{stats.reportesPendientes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-indigo-900 rounded-lg">
                            <Zap className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Completados</p>
                            <p className="text-2xl font-bold text-white">{stats.reportesCompletados}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-purple-900 rounded-lg">
                            <Users className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Usuarios</p>
                            <p className="text-2xl font-bold text-white">{stats.totalUsuarios}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-red-900 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Imperfecciones</p>
                            <p className="text-2xl font-bold text-white">{stats.totalImperfecciones}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-900 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">% Completado</p>
                            <p className="text-2xl font-bold text-white">{stats.porcentajeCompletado?.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de actividad del mes */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                      <h3 className="text-lg font-semibold text-emerald-400 mb-4">Actividad del Mes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{stats.carroceriasDelMes}</p>
                          <p className="text-emerald-300">Carrocerías</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-teal-400">{stats.reportesDelMes}</p>
                          <p className="text-teal-300">Reportes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-400">{stats.actividadMes}</p>
                          <p className="text-indigo-300">Total Actividad</p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp de última actualización */}
                    {stats.ultimaActualizacion && (
                      <div className="text-center text-sm text-gray-500">
                        Última actualización: {stats.ultimaActualizacion}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No hay estadísticas disponibles</p>
                    <button
                      onClick={handleGetStats}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Cargar Estadísticas
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab Historial */}
            {activeTab === 'history' && (
              <div className="p-6 bg-gray-900">
                {/* Header con botón de recarga */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Historial del Usuario</h2>
                  <button
                    onClick={handleGetUserHistory}
                    disabled={isLoadingHistory}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    <span>{isLoadingHistory ? 'Cargando...' : 'Recargar'}</span>
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div className="text-center py-12">
                    <ColorRing
                      visible={true}
                      height="60"
                      width="60"
                      ariaLabel="loading"
                      colors={['#10b981', '#10b981', '#10b981', '#10b981', '#10b981']}
                    />
                    <p className="mt-4 text-gray-400">Cargando historial...</p>
                  </div>
                ) : userHistory ? (
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                      <h3 className="text-lg font-semibold text-emerald-400 mb-4">Información del Usuario</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Nombre</p>
                          <p className="text-lg font-semibold text-white">{userHistory.usuario?.nombre}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">Rol</p>
                          <p className="text-lg font-semibold text-white">{userHistory.usuario?.rol}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">Estado</p>
                          <p className="text-lg font-semibold text-white">{userHistory.usuario?.estado}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">Fecha de Registro</p>
                          <p className="text-lg font-semibold text-white">{new Date(userHistory.usuario?.fechaRegistro).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                      <h3 className="text-lg font-semibold text-teal-400 mb-4">Resumen de Actividad</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{userHistory.resumenActividad?.totalReportes || 0}</p>
                          <p className="text-emerald-300">Reportes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-teal-400">{userHistory.resumenActividad?.totalCarrocerias || 0}</p>
                          <p className="text-teal-300">Carrocerías</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-400">{userHistory.resumenActividad?.totalImperfecciones || 0}</p>
                          <p className="text-indigo-300">Imperfecciones</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No hay historial disponible</p>
                    <button
                      onClick={handleGetUserHistory}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Cargar Historial
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
      </Layout>
  );
};

export default ChatbotPage;
