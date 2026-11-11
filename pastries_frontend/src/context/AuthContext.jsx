import React, {createContext, useContext, useState, useEffect} from 'react'
import { apiClient, getErrorMessage} from '../api/client'

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            const savedToken = localStorage.getItem('token');
            if (!savedToken) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                await apiClient.get('/api/sensors');
                setIsAuthenticated(true);
            } catch (err) {
                localStorage.removeItem('token');
                setToken(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, []);

    const login = async (username, password) => {
        setAuthError(null);
        try {
            const response = await apiClient.post('/api/auth/login', {username, password});
            const receivedToken = response.data.accessToken;
            if (!receivedToken) {
                throw new Error("Server did not return authentication token");
            }
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);
            setIsAuthenticated(true);
            return {success: true};
        } catch (err) {
            const msg = getErrorMessage(err);
            setAuthError(msg);
            return {success: false, error: msg};
        }
    };

    const logout = async () => {
        let result = {success: true};
        try {
            await apiClient.post('/api/auth/logout');
        } catch (err) {
            result = {success: false, error: getErrorMessage(err)};
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
        }
        return result;
    };
    const changePassword = async (oldPassword, newPassword) => {
        try {
            await apiClient.put('/api/auth/password', {
                currentPassword: oldPassword,
                newPassword,
            });
            return {success: true};
        } catch (err) {
            return {success: false, error: getErrorMessage(err) };
        }
    };
    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated,
                loading,
                authError,
                login,
                logout,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}