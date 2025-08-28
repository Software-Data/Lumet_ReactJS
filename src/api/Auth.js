import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginRequest = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, user);
    return response;
  } catch (error) {
    console.error('Error en loginRequest:', error);
    throw error;
  }
}

export const obtenerUsuarios = user => axios.get(`/usuarios`, user)

// Reportes
export const fetchReports = async () => {
    try {
        const response = await axios.get(`/reports`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los reportes:", error);
        return [];
    }
};
