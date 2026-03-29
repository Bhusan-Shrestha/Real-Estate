import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthData, User } from "../types";

interface AuthState {
    token: string | null;
    user: User | null;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (data: AuthData) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    let parsedUser: User | null = null;
    if (savedUser) {
        try {
            parsedUser = JSON.parse(savedUser) as User;
        } catch {
            parsedUser = null;
        }
    }

    const [auth, setAuth] = useState<AuthState>({
        token: savedToken,
        user: parsedUser,
    });

    const value: AuthContextValue = {
        user: auth.user,
        token: auth.token,
        isAuthenticated: Boolean(auth.token),
        login: (data: AuthData) => {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            setAuth({ token: data.token, user: data.user });
        },
        logout: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setAuth({ token: null, user: null });
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

};

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}