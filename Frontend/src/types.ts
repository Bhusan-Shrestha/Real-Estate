export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  image_url: string;
  location: string;
  price: number | string;
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number;
}

export interface Favourite {
  id: number;
  user_id: string;
  property_id: string;
  created_at: string;
  title: string;
  image_url: string;
  location: string;
  price: number | string;
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number;
}

export interface AuthData {
  token: string;
  user: User;
}
