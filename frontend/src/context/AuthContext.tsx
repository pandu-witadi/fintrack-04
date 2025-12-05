import
    React, {
        createContext,
        useState,
        useEffect,
        useContext,
        ReactNode
    } from 'react';
import {
    userService,
    User,
    UpdateProfileData
} from '../services/userService';

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

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = userService.getToken();
            if (storedToken) {
                try {
                    const response = await userService.getMe(storedToken);
                    if (response.success) {
                        setUser(response.pyd);
                        setToken(storedToken);
                    } else {
                        userService.logout();
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    userService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await userService.login({ email, password });
            if (response.success) {
                setUser(response.pyd);
                setToken(response.token);
                userService.setToken(response.token);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        if (!token)
            throw new Error('No authentication token found');

        try {
            const response = await userService.updateUser(token, data);
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
        userService.logout();
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
