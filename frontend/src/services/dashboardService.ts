import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export interface DashboardSummary {
    users: number;
    projects: number;
    events: number;
    transactions: number;
}

export const dashboardService = {
    async getSummary(): Promise<DashboardSummary> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/summary`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        
        if (response.data.success) {
            return response.data.pyd;
        } else {
            throw new Error('Failed to fetch dashboard summary');
        }
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    }
};