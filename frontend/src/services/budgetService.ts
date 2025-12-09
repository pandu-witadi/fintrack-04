import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export interface DetailedAmount {
    currency: string;
    value: number;
    exRate: number;
}

export interface Budget {
    _id: string;
    name: string;
    note?: string;
    active: boolean;
    typ: 'income' | 'expense' | 'other';
    done: boolean;
    amount: number;
    detailedAmount: DetailedAmount;
    amountActual: number;
    project: string;
    updatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    lActual?: Array<{
        _id: string;
        name: string;
        amount: number;
        type?: 'income' | 'expense' | 'other';
        done?: boolean;
    }>;
    dateEx: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBudgetData {
    name: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense' | 'other';
    done?: boolean;
    amount: number;
    detailedAmount?: DetailedAmount;
    dateEx: string;
}

export interface UpdateBudgetData {
    name?: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense' | 'other';
    done?: boolean;
    amount?: number;
    detailedAmount?: DetailedAmount;
    dateEx?: string;
}

export interface BudgetResponse {
    success: boolean;
    pyd: Budget;
    message?: string;
}

export interface BudgetListResponse {
    success: boolean;
    pyd: Budget[];
    message?: string;
}

export const budgetService = {
    async getAllBudget(): Promise<Budget[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/budget/getAll`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch budgets');
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
            throw error;
        }
    },

    async getBudgetsByProject(projectId: string): Promise<Budget[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/budget/project/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch budgets');
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
            throw error;
        }
    },

    async getBudgetById(id: string): Promise<Budget> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/budget/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch budget');
            }
        } catch (error) {
            console.error('Error fetching budget:', error);
            throw error;
        }
    },

    async createBudget(projectId: string, budgetData: CreateBudgetData): Promise<Budget> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/budget/register`,
                {
                    ...budgetData,
                    projectId: projectId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to create budget');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
            throw error;
        }
    },

    async updateBudget(id: string, budgetData: UpdateBudgetData): Promise<Budget> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/budget/${id}`,
                budgetData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to update budget');
            }
        } catch (error) {
            console.error('Error updating budget:', error);
            throw error;
        }
    },

    async deleteBudget(id: string): Promise<void> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/budget/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                throw new Error('Failed to delete budget');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            throw error;
        }
    },

    async cloneFromBudget(budgetId: string, actualData: any): Promise<any> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/actual/cloneFromBudget`,
                {
                    ...actualData,
                    budgetId: budgetId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to clone actual from budget');
            }
        } catch (error) {
            console.error('Error cloning actual from budget:', error);
            throw error;
        }
    },


    async registerActual(budgetId: string, actualData: any): Promise<any> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/actual/register`,
                {
                    ...actualData,
                    budgetId: budgetId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to register actual');
            }
        } catch (error) {
            console.error('Error registering actual:', error);
            throw error;
        }
    }
};
