import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export interface DetailedAmount {
    currency: string;
    value: number;
    exRate: number;
}

export interface Actual {
    _id: string;
    name: string;
    note?: string;
    active: boolean;
    typ: 'income' | 'expense' | 'other';
    done: boolean;
    amount: number;
    detailedAmount: DetailedAmount;
    project: {
        _id: string;
        name: string;
        code?: string;
    };
    updatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    assignee?: {
        _id: string;
        name: string;
        email: string;
    };
    budget?: {
        _id: string;
        name: string;
        amount: number;
    };
    trx?: {
        _id: string;
        name: string;
        amount: number;
        typ?: 'income' | 'expense';
        done?: boolean;
        projectName?: string;
    };
    dateEx: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateActualData {
    name?: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense' | 'other';
    done?: boolean;
    amount?: number;
    detailedAmount?: DetailedAmount;
    assignee?: string | null;
    budget?: string;
    trx?: string;
    dateEx?: string;
}

export interface CreateActualData {
    name: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense' | 'other';
    done?: boolean;
    amount: number;
    detailedAmount?: DetailedAmount;
    assignee?: string;
    budget?: string;
    trx?: string;
    dateEx: string;
    projectId: string;
}

export const actualService = {
    async getAllActual(): Promise<Actual[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/actual/getAll`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch actuals');
            }
        } catch (error) {
            console.error('Error fetching actuals:', error);
            throw error;
        }
    },

    async getActualById(id: string): Promise<Actual> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/actual/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch actual');
            }
        } catch (error) {
            console.error('Error fetching actual:', error);
            throw error;
        }
    },

    async getAllActualByProjectId(projectId: string): Promise<Actual[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/actual/project/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch actuals');
            }
        } catch (error) {
            console.error('Error fetching actuals:', error);
            throw error;
        }
    },

    async getAllActualByAssignee(assigneeId: string): Promise<Actual[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/actual/assignee/${assigneeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch actuals');
            }
        } catch (error) {
            console.error('Error fetching actuals:', error);
            throw error;
        }
    },

    async registerActual(actualData: CreateActualData): Promise<Actual> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/actual/register`,
                actualData,
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
    },

    async updateActual(id: string, actualData: UpdateActualData): Promise<Actual> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/actual/${id}`,
                actualData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to update actual');
            }
        } catch (error) {
            console.error('Error updating actual:', error);
            throw error;
        }
    },

    async deleteActual(id: string): Promise<void> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/actual/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                throw new Error('Failed to delete actual');
            }
        } catch (error) {
            console.error('Error deleting actual:', error);
            throw error;
        }
    },

    async attachToTrx(allActualId: string[], trxId: string): Promise<Actual[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/actual/attachToTrx`,
                { allActualId, trxId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to attach actuals to transaction');
            }
        } catch (error) {
            console.error('Error attaching actuals to transaction:', error);
            throw error;
        }
    }
};