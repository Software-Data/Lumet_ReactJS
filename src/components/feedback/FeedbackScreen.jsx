import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/layout";
import { feedbackService, rolesService, usuariosService } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { UploadCloud, X, User as UserIcon, Calendar as CalendarIcon, Trash2, Image as ImageIcon } from "lucide-react";

const ALLOWED_ROLES_STORAGE_KEY = "feedbackAdminPanelAllowedRoles";

function FeedbackScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [comentario, setComentario] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Admin permissions state
  const [allowedRoleIds, setAllowedRoleIds] = useState(() => {
    try {
      const saved = localStorage.getItem(ALLOWED_ROLES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isAdmin = user?.id_rol === 1;
  const viewerRole = useMemo(() => roles.find(r => (r.nombre || "").toLowerCase() === "espectador"), [roles]);
  const isViewer = !!(viewerRole && user?.id_rol === viewerRole.id);

  const canSeeAdminPanel = useMemo(() => {
    if (isAdmin) return true;
    if (!user?.id_rol) return false;
    return allowedRoleIds.includes(user.id_rol);
  }, [isAdmin, user, allowedRoleIds]);

  const getUserName = (idUsuario) => {
    const u = usuarios.find((x) => x.id === idUsuario);
    return u ? u.nombre : `Usuario ${idUsuario}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("")
      try {
        const [fbRes, rolesRes, usersRes] = await Promise.all([
          feedbackService.getAll(),
          rolesService.getAll(),
          usuariosService.getAll(),
        ]);
        setFeedbacks(Array.isArray(fbRes.data) ? fbRes.data : []);
        setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
        setUsuarios(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (err) {
        setError(err?.message || "No se pudieron cargar los feedbacks");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreviewUrl(null);
  }, [imageFile]);

  const handleAllowedRoleToggle = (roleId) => {
    const next = allowedRoleIds.includes(roleId)
      ? allowedRoleIds.filter((id) => id !== roleId)
      : [...allowedRoleIds, roleId];
    setAllowedRoleIds(next);
    try {
      localStorage.setItem(ALLOWED_ROLES_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      return date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return String(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("comentario", comentario.trim());
      if (user?.id) formData.append("id_usuario", String(user.id));
      if (imageFile) formData.append("imagen", imageFile); // backend debe leer req.files.imagen (multer)

      await feedbackService.create(formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh list
      const fbRes = await feedbackService.getAll();
      setFeedbacks(Array.isArray(fbRes.data) ? fbRes.data : []);
      // Reset form
      setComentario("");
      setImageFile(null);
      setImagePreviewUrl(null);
    } catch (err) {
      setError(err?.message || "No se pudo crear el feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!confirm("¿Eliminar este feedback?")) return;
    try {
      await feedbackService.delete(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err?.message || "No se pudo eliminar");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Feedbacks</h1>
          </div>



          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-gray-300">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Form crear feedback */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Agregar feedback</h2>
                    <span className="text-xs text-gray-400">{isAdmin ? "Admin: puede ver todo" : null}</span>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Comentario</label>
                      <textarea
                        className="w-full rounded bg-gray-900 border border-gray-700 text-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        rows={3}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Escribe tu comentario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Imagen (opcional)</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 cursor-pointer border border-gray-600">
                          <UploadCloud className="h-4 w-4" />
                          <span>Seleccionar imagen</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        {imageFile && (
                          <div className="text-xs text-gray-300">
                            {imageFile.name} • {formatBytes(imageFile.size)}
                          </div>
                        )}
                        {imageFile && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-400"
                            onClick={() => setImageFile(null)}
                          >
                            <X className="h-3.5 w-3.5" /> Quitar
                          </button>
                        )}
                      </div>

                      {imagePreviewUrl && (
                        <div className="mt-3">
                          <div className="relative inline-block">
                            <img
                              src={imagePreviewUrl}
                              alt="preview"
                              className="max-h-48 rounded-lg border border-gray-700 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => setImageFile(null)}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow"
                              aria-label="Quitar imagen"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !comentario.trim()}
                        className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
                      >
                        {submitting ? "Guardando..." : "Publicar"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de feedbacks (solo admin) */}
                {isAdmin && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Todos los feedbacks</h2>
                      <span className="text-xs text-gray-400">{feedbacks.length} items</span>
                    </div>
                    <div className="space-y-3 max-h-[65vh] overflow-auto pr-1">
                      {feedbacks.length === 0 ? (
                        <div className="text-sm text-gray-400">No hay feedbacks aún</div>
                      ) : (
                        feedbacks.map((f) => (
                          <div key={f.id} className="rounded-lg border border-gray-700 bg-gray-900 overflow-hidden hover:border-emerald-600 transition-colors">
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                                    <UserIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-100 font-medium">{getUserName(f.id_usuario)}</div>
                                    <div className="text-xs text-gray-400">{formatDateTime(f.createdAt)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Status badge */}
                                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    f.status === 'Respondido' ? 'bg-green-900/30 text-green-300 border border-green-700' :
                                    f.status === 'Pendiente' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' :
                                    'bg-gray-900/30 text-gray-300 border border-gray-700'
                                  }`}>
                                    {f.status || 'Sin estado'}
                                  </div>
                                  {/* Ver feedback button */}
                                  <button
                                    onClick={() => navigate(`/feedbacks/ver/${f._id}`)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                                  >
                                    Ver
                                  </button>
                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleDelete(f.id)}
                                    className="text-red-300 hover:text-red-400 p-1"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Comentario preview */}
                              <div className="mb-3">
                                <p className="text-sm text-gray-200 line-clamp-2">
                                  {f.comentario?.length > 100 ? `${f.comentario.substring(0, 100)}...` : f.comentario}
                                </p>
                              </div>
                              
                              {/* Footer info */}
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-4">
                                  {f.imagen && (
                                    <span className="flex items-center gap-1">
                                      <ImageIcon className="h-3 w-3" />
                                      Con imagen
                                    </span>
                                  )}
                                  {f.id_imperfeccion && (
                                    <span>Imp. #{f.id_imperfeccion}</span>
                                  )}
                                </div>
                                {f.respuesta && (
                                  <span className="text-green-400">✓ Respondido</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Admin (solo admin) */}
              {isAdmin && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold text-white mb-3">Panel de administración</h2>
                    <p className="text-sm text-gray-300">Solo el administrador puede ver y gestionar los feedbacks.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default FeedbackScreen;


