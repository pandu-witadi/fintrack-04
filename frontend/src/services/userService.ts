import axios from 'axios';
import { bankInfoPopulate } from './constant';

// Set up axios defaults
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    lastAccess?: string;
    phone?: string;
    bankInfo?: bankInfoPopulate;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
    bankInfo?: bankInfoPopulate;
}

export interface RegisterUserData {
    name: string;
    email: string;
    password: string;
    role?: string;
    active?: boolean;
    phone?: string;
    bankInfo?: bankInfoPopulate;
}

export interface RegisterUserResponse {
    success: boolean;
    pyd: User;
}

export interface GetAllUsersResponse {
    success: boolean;
    pyd: User[];
}

export interface LoginResponse {
    success: boolean;
    pyd: User;
    token: string;
}

interface MeResponse {
    success: boolean;
    pyd: User;
}

export interface UpdateProfileResponse {
  success: boolean;
  pyd: User;
  message: string;
}

export const userService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/user/login`,
            credentials
        );
        return response.data;
    },

    async getMe(token: string): Promise<MeResponse> {
        const response = await axios.get<MeResponse>(
            `${API_BASE_URL}/user/me`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },



    logout(): void {
        // Clear token from localStorage
        localStorage.removeItem('token');
        // Clear any other auth-related data
    },

    setToken(token: string): void {
        localStorage.setItem('token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token;
    },

    async getAllUsers(): Promise<User[]> {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get<GetAllUsersResponse>(
                `${API_BASE_URL}/user/getAll`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async getUserById(userId: string): Promise<User> {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get<RegisterUserResponse>(
                `${API_BASE_URL}/user/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch user');
            }
        } catch (error) {
              console.error('Error fetching user:', error);
              throw error;
        }
    },

    async registerUser(token: string, userData: RegisterUserData): Promise<RegisterUserResponse> {
        try {
            const response = await axios.post<RegisterUserResponse>(
                `${API_BASE_URL}/user/register`,
                userData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    },

    async updateUser(userId: string, userData: Partial<RegisterUserData>): Promise<UpdateProfileResponse> {
        const token = this.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        try {
            const response = await axios.patch<UpdateProfileResponse>(
                `${API_BASE_URL}/user/${userId}`,
                userData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.delete<{ success: boolean; message: string }>(
                `${API_BASE_URL}/user/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};