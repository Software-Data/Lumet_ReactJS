import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: `${API_URL}`,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); 
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  instance.interceptors.response.use(
    (response) => response, 
    (error) => {
      if (error.response && error.response.status === 401) {
        Cookies.remove('token');
        Cookies.remove('user');
      
        window.location.href = '/Login';
      }
      return Promise.reject(error); 
    }
  );

  export const usuariosService = {
    getAll: () => instance.get("/usuarios"),
    getById: (id) => instance.get(`/usuarios/${id}`),
    create: (data) => instance.post("/usuarios", data),
    update: (id, data) => instance.put(`/usuarios/${id}`, data),
    delete: (id) => instance.delete(`/usuarios/${id}`),
  }
  
  export const rolesService = {
    getAll: () => instance.get("/roles"),
    getById: (id) => instance.get(`/roles/${id}`),
    create: (data) => instance.post("/roles", data),
    update: (id, data) => instance.put(`/roles/${id}`, data),
    delete: (id) => instance.delete(`/roles/${id}`),
  }
  
  
  export const imagesService = {
    getAll: () => instance.get("/imagenes"),
    getById: (id) => instance.get(`/imagenes/${id}`),
  }
  
  export const imagenResultado = {
    getImage: (id) => instance.get(`/imagenes/analizadas/imagen/${id}`),
  }


  export const feedbackService = {
    getAll: () => instance.get("/feedbacks"),
    getById: (id) => instance.get(`/feedbacks/${id}`),
    create: (data, config) => instance.post("/feedbacks", data, config),
    update: (id, data, config) => instance.put(`/feedbacks/${id}`, data, config),
    delete: (id) => instance.delete(`/feedbacks/${id}`),
  }

  export const reportesService = {
    getAll: () => instance.get("/reportes"),
    getById: (id) => instance.get(`/reportes/${id}`),
    create: (data) => instance.post("/reportes", data),
    update: (id, data) => instance.put(`/reportes/${id}`, data),
    delete: (id) => instance.delete(`/reportes/${id}`),
    uploadImage: (id, formData) =>
      instance.post(`/reportes/${id}/imagen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    regenerarReporte: (carroceriaId, data) => instance.post(`/carrocerias/${carroceriaId}/generar-reporte`, data),
  }
  
  export const severidadesService = {
    getAll: () => instance.get("/severidades"),
    getById: (id) => instance.get(`/severidades/${id}`),
    create: (data) => instance.post("/severidades", data),
    update: (id, data) => instance.put(`/severidades/${id}`, data),
    delete: (id) => instance.delete(`/severidades/${id}`),
  }
  
  export const carroceriasService = {
    getAll: () => instance.get("/carrocerias"),
    getFolio: () => instance.get("/carrocerias/folio"),
    getById: (id) => instance.get(`/carrocerias/${id}`),
    create: (data) => instance.post("/carrocerias", data),
    update: (id, data) => instance.put(`/carrocerias/${id}`, data),
    delete: (id) => instance.delete(`/carrocerias/${id}`),
  }
  
  export const prioridadesService = {
    getAll: () => instance.get("/prioridades"),
    getById: (id) => instance.get(`/prioridades/${id}`),
    create: (data) => instance.post("/prioridades", data),
    update: (id, data) => instance.put(`/prioridades/${id}`, data),
    delete: (id) => instance.delete(`/prioridades/${id}`),
  }
  
  export const imperfeccionesService = {
    getAll: () => instance.get("/imperfecciones"),
    getById: (id) => instance.get(`/imperfecciones/${id}`),
    create: (data) => instance.post("/imperfecciones", data),
    update: (id, data) => instance.put(`/imperfecciones/${id}`, data),
    delete: (id) => instance.delete(`/imperfecciones/${id}`),
  }
  

export default instance;
