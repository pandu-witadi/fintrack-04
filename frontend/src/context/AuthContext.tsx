import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode
} from 'react';
import {
    User,
    UpdateProfileData
} from '../services/userService.ts';
import { useUser } from '../hooks/useUser';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { login: userLogin, getMe, logout: userLogout, setToken: setUserToken, getToken: getUserToken, updateUser: updateUserService } = useUser();

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = getUserToken();
            if (storedToken) {
                try {
                    const response = await getMe(storedToken);
                    if (response.success) {
                        setUser(response.pyd);
                        setToken(storedToken);
                    } else {
                        userLogout();
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    userLogout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [getMe, userLogout, getUserToken]);

    const login = async (email: string, password: string) => {
        try {
            const response = await userLogin({ email, password });
            if (response.success) {
                setUser(response.pyd);
                setToken(response.token);
                setUserToken(response.token);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        if (!user?._id)
            throw new Error('No user found');

        try {
            const response = await updateUserService(user._id, data);
            if (response.success) {
                setUser(response.pyd);
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        userLogout();
    };

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated,
                loading,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
