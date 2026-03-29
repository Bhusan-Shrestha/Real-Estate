import api from './api';

export async function login(payload: { email: string; password: string }) {
    const response = await api.post('/auth/login', payload);
    return response.data;
}

export async function register(payload: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', payload);
    return response.data;
}
