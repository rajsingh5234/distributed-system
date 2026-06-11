import api from './client';

export const login = (credentials: { email: string; password: string }) =>
    api.post(`/auth/login`, credentials);
