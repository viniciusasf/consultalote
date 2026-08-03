import apiClient from './client';

const crud = (resource) => ({
  list: async () => (await apiClient.get(`/${resource}`)).data,
  create: async (data) => (await apiClient.post(`/${resource}`, data)).data,
  update: async (id, data) => (await apiClient.put(`/${resource}/${id}`, data)).data,
  remove: async (id) => (await apiClient.delete(`/${resource}/${id}`)).data,
});

export const locaisAdmin = crud('locais');
export const perfisAdmin = crud('perfis');
export const usuariosAdmin = crud('usuarios');
