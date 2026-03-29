import api from './api';
import type { Property } from '../types';

interface GetPropertiesResponse {
    success: boolean;
    data: Property[];
}

export async function getProperties(): Promise<GetPropertiesResponse> {
    const response = await api.get('/properties');
    return response.data;
}

export async function createProperty(payload: FormData) {
    const response = await api.post('/properties', payload);
    return response.data;
}

export async function deleteProperty(propertyId: string) {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
}
