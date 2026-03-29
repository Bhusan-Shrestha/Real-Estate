import api from './api';

export async function getFavourites() {
    const response = await api.get('/favourites');
    return response.data;
}

export async function addFavourite(propertyId: string) {
    const response = await api.post(`/favourites/${propertyId}`, { propertyId });
    return response.data;
}

export async function removeFavourite(propertyId: string) {
    const response = await api.delete(`/favourites/${propertyId}`);
    return response.data;
}
