import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('nexus_token', token);
        } else {
            localStorage.removeItem('nexus_token');
        }
    }, [token]);

    const login = useCallback((newToken: string) => setToken(newToken), []);
    const logout = useCallback(() => setToken(null), []);

    const value = useMemo(() => ({
        token,
        login,
        logout,
        isAuthenticated: !!token
    }), [token, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
