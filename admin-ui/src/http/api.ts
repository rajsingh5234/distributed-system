import api from './client';

export const login = (credentials: { email: string; password: string }) =>
    api.post(`/auth/login`, credentials);

export const self = () => api.get('/auth/self');

export const logout = () => api.post('/auth/logout');
