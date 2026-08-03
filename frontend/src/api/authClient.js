import apiClient from './client';

export const fetchLocaisPublico = async () => {
  const response = await apiClient.get('/auth/locais');
  return response.data;
};

export const loginMaster = async (senha) => {
  const response = await apiClient.post('/auth/login/master', { senha });
  return response.data;
};

export const loginCorretor = async (localId, senha) => {
  const response = await apiClient.post('/auth/login/corretor', { local_id: localId, senha });
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};
