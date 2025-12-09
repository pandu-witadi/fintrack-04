import { useState, useCallback } from 'react';
import {
    userService,
    User,
    LoginCredentials,
    RegisterUserData,
    LoginResponse,
    RegisterUserResponse,
    UpdateProfileResponse
} from '../services/userService.ts';

interface UseUserReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    getAllUser: () => Promise<void>;
    getUserById: (userId: string) => Promise<User>;
    registerUser: (token: string, userData: RegisterUserData) => Promise<RegisterUserResponse>;
    updateUser: (userId: string, userData: Partial<RegisterUserData>) => Promise<UpdateProfileResponse>;
    deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    getMe: (token: string) => Promise<{ success: boolean; pyd: User }>;
    logout: () => void;
    setToken: (token: string) => void;
    getToken: () => string | null;
    isAuthenticated: () => boolean;
}

export const useUser = (): UseUserReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserById = useCallback(async (userId: string): Promise<User> => {
        try {
            setError(null);
            const user = await userService.getUserById(userId);
            return user;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const registerUser = useCallback(
        async (token: string, userData: RegisterUserData): Promise<RegisterUserResponse> => {
            try {
                setError(null);
                const response = await userService.registerUser(token, userData);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to register user';
                setError(errorMessage);
                console.error(err);
                throw err;
            }
        },
        []
    );

    const updateUser = useCallback(
        async (userId: string, userData: Partial<RegisterUserData>): Promise<UpdateProfileResponse> => {
            try {
                setError(null);
                const response = await userService.updateUser(userId, userData);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
                setError(errorMessage);
                console.error(err);
                throw err;
            }
        },
        []
    );

    const deleteUser = useCallback(
        async (userId: string): Promise<{ success: boolean; message: string }> => {
            try {
                setError(null);
                const response = await userService.deleteUser(userId);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
                setError(errorMessage);
                console.error(err);
                throw err;
            }
        },
        []
    );

    const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            setError(null);
            const response = await userService.login(credentials);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to login';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const getMe = useCallback(async (token: string) => {
        try {
            setError(null);
            const response = await userService.getMe(token);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const logout = useCallback(() => {
        setError(null);
        setUsers([]);
        userService.logout();
    }, []);

    const setToken = useCallback((token: string) => {
        userService.setToken(token);
    }, []);

    const getToken = useCallback(() => {
        return userService.getToken();
    }, []);

    const isAuthenticated = useCallback(() => {
        return userService.isAuthenticated();
    }, []);

    return {
        users,
        loading,
        error,
        getAllUser,
        getUserById,
        registerUser,
        updateUser,
        deleteUser,
        login,
        getMe,
        logout,
        setToken,
        getToken,
        isAuthenticated
    };
};
