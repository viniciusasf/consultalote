import axios from 'axios';

// Em desenvolvimento, o proxy do Vite (/api) redireciona para http://127.0.0.1:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const fetchLotes = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  if (filters.gleba) params.append('gleba', filters.gleba);
  if (filters.quadra) params.append('quadra', filters.quadra);
  if (filters.area_min) params.append('area_min', filters.area_min);
  if (filters.area_max) params.append('area_max', filters.area_max);
  if (filters.preco_min) params.append('preco_min', filters.preco_min);
  if (filters.preco_max) params.append('preco_max', filters.preco_max);
  if (filters.tamanho_categoria) params.append('tamanho_categoria', filters.tamanho_categoria);
  if (filters.order_by) params.append('order_by', filters.order_by);

  const response = await apiClient.get('/lotes', { params });
  return response.data;
};

export const fetchLoteById = async (id_lote) => {
  const response = await apiClient.get(`/lotes/${id_lote}`);
  return response.data;
};

export default apiClient;
