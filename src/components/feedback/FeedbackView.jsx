import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { feedbackService, usuariosService } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import Layout from "../layout/layout";
import { 
  ArrowLeft, 
  MessageCircle, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Send,
  Edit3,
  Trash2,
  Image as ImageIcon
} from "lucide-react";

function FeedbackView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondiendo, setRespondiendo] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [editando, setEditando] = useState(false);
  const [editComentario, setEditComentario] = useState("");

  const isAdmin = user?.id_rol === 1;
  const canView = isAdmin || (feedback && feedback.id_usuario === user?.id);
  const canEdit = isAdmin || (feedback && feedback.id_usuario === user?.id);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [fbRes, usersRes] = await Promise.all([
          feedbackService.getById(id),
          usuariosService.getAll(),
        ]);
        
        const feedbackData = fbRes.data;
        setFeedback(feedbackData);
        
        // Buscar usuario que creó el feedback
        const usuarios = usersRes.data;
        const creador = usuarios.find(u => u.id === feedbackData.id_usuario);
        setUsuario(creador);
        
        setEditComentario(feedbackData.comentario || "");
      } catch (err) {
        setError(err?.message || "No se pudo cargar el feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return { icon: <Clock className="h-5 w-5" />, color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-200' };
      case 'respondido':
        return { icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-200' };
      case 'resuelto':
        return { icon: <CheckCircle className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'cerrado':
        return { icon: <XCircle className="h-5 w-5" />, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
      default:
        return { icon: <AlertCircle className="h-5 w-5" />, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleResponder = async () => {
    if (!respuesta.trim()) return;
    setRespondiendo(true);
    try {
      await feedbackService.update(id, {
        respuesta: respuesta.trim(),
        status: 'Respondido'
      });
      
      // Actualizar el feedback local
      setFeedback(prev => ({
        ...prev,
        respuesta: respuesta.trim(),
        status: 'Respondido',
        updatedAt: new Date().toISOString()
      }));
      
      setRespuesta("");
      setRespondiendo(false);
    } catch (err) {
      alert('Error al responder: ' + err.message);
      setRespondiendo(false);
    }
  };

  const handleEditar = async () => {
    if (!editComentario.trim()) return;
    setEditando(true);
    try {
      await feedbackService.update(id, {
        comentario: editComentario.trim()
      });
      
      setFeedback(prev => ({
        ...prev,
        comentario: editComentario.trim(),
        updatedAt: new Date().toISOString()
      }));
      
      setEditando(false);
    } catch (err) {
      alert('Error al editar: ' + err.message);
      setEditando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar este feedback?')) return;
    try {
      await feedbackService.delete(id);
      navigate('/feedbacks');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !feedback) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-xl">{error || "No se pudo cargar el feedback"}</p>
            <button 
              onClick={() => navigate('/feedbacks')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Volver a Feedbacks
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!canView) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-xl">No tienes permiso para ver este feedback</p>
            <button 
              onClick={() => navigate('/feedbacks')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Volver a Feedbacks
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusInfo(feedback.status);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 sticky top-0 z-10 shadow-sm border-b-2 border-emerald-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/feedbacks')}
                  className="flex items-center text-gray-100 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver a Feedbacks
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-white">Feedback #{feedback._id?.slice(-8) || id}</h1>
              </div>
              <div className="flex items-center space-x-3">
                {canEdit && (
                  <button
                    onClick={() => setEditando(!editando)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleEliminar}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-300 hover:text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}>
              <span className={statusInfo.color}>{statusInfo.icon}</span>
              <span className={`ml-2 text-sm font-medium capitalize ${statusInfo.color.replace('text-', 'text-')}`}>
                {feedback.status || 'Sin estado'}
              </span>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Feedback Card */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {usuario?.nombre || `Usuario ${feedback.id_usuario}`}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDateTime(feedback.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario */}
                {editando ? (
                  <div className="mb-4">
                    <textarea
                      value={editComentario}
                      onChange={(e) => setEditComentario(e.target.value)}
                      rows={4}
                      className="w-full rounded bg-gray-900 border border-gray-700 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setEditando(false)}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleEditar}
                        className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-100 text-lg leading-relaxed whitespace-pre-line">
                      {feedback.comentario}
                    </p>
                  </div>
                )}

                {/* Imagen */}
                {feedback.imagenBase64 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Imagen adjunta</span>
                    </div>
                    <img
                      src={feedback.imagenBase64}
                      alt="Feedback"
                      className="max-h-96 rounded-lg border border-gray-700 shadow-lg"
                    />
                  </div>
                )}

                {/* Información adicional */}
                {feedback.id_imperfeccion && (
                  <div className="text-sm text-gray-400">
                    <span className="font-medium">Imperfección relacionada:</span> #{feedback.id_imperfeccion}
                  </div>
                )}
              </div>

              {/* Respuesta del Admin */}
              {feedback.respuesta && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-700 text-white flex items-center justify-center">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Respuesta del Administrador</h4>
                      <p className="text-sm text-gray-400">
                        {formatDateTime(feedback.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-100 leading-relaxed whitespace-pre-line">
                    {feedback.respuesta}
                  </p>
                </div>
              )}

              {/* Formulario de respuesta (solo admin) */}
              {isAdmin && !feedback.respuesta && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Responder Feedback</h4>
                  <div className="space-y-4">
                    <textarea
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      rows={4}
                      className="w-full rounded bg-gray-900 border border-gray-700 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleResponder}
                        disabled={respondiendo || !respuesta.trim()}
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {respondiendo ? "Enviando..." : "Responder"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Información del Feedback */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Información del Feedback</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">ID</label>
                    <p className="text-sm text-gray-300 font-mono">{feedback._id?.slice(-8) || id}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Estado</label>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${statusInfo.bg} ${statusInfo.border}`}>
                      <span className={statusInfo.color}>{statusInfo.icon}</span>
                      <span className={`ml-1 capitalize ${statusInfo.color.replace('text-', 'text-')}`}>
                        {feedback.status || 'Sin estado'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Creado</label>
                    <p className="text-sm text-gray-300">{formatDateTime(feedback.createdAt)}</p>
                  </div>
                  {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Actualizado</label>
                      <p className="text-sm text-gray-300">{formatDateTime(feedback.updatedAt)}</p>
                    </div>
                  )}
                  {feedback.id_imperfeccion && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Imperfección</label>
                      <p className="text-sm text-gray-300">#{feedback.id_imperfeccion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones rápidas */}
              {isAdmin && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setEditando(!editando)}
                      className="w-full flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </button>
                    <button
                      onClick={handleEliminar}
                      className="w-full flex items-center justify-center px-3 py-2 border border-red-600 text-sm font-medium rounded text-red-300 hover:text-white hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FeedbackView;
