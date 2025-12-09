import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

export interface DetailedAmount {
    currency: string;
    value: number;
    exRate: number;
}

export interface BankInfo {
    bankName: string;
    accNo: string;
    accName: string;
}

export interface Trx {
    _id: string;
    name: string;
    note?: string;
    active: boolean;
    typ: 'income' | 'expense';
    done: boolean;
    amount: number;
    detailedAmount: DetailedAmount;
    project: {
        _id: string;
        name: string;
        code: string;
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
    lActual?: Array<{
        _id: string;
        name: string;
        amount: number;
        typ?: 'income' | 'expense';
        done?: boolean;
    }>;
    dateEx: string;
    sndr?: BankInfo;
    recv?: BankInfo;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateTrxData {
    name?: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense';
    done?: boolean;
    amount?: number;
    detailedAmount?: DetailedAmount;
    assignee?: string;
    dateEx?: string;
    sndr?: BankInfo;
    recv?: BankInfo;
}

export interface CreateTrxData {
    name: string;
    note?: string;
    active?: boolean;
    typ?: 'income' | 'expense';
    done?: boolean;
    amount: number;
    detailedAmount?: DetailedAmount;
    assignee?: string;
    dateEx: string;
    sndr?: BankInfo;
    recv?: BankInfo;
    projectId: string;
}

export interface AttachToTrxData {
    actualIds: string[];
}

export interface CloneTrxFromActualData {
    name: string;
    actualId: string;
    amount: number;
    dateEx: string;
}

export const trxService = {
    async getAllTrx(): Promise<Trx[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/trx/getAll`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    async getTrxById(id: string): Promise<Trx> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/trx/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch transaction');
            }
        } catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    },

    async getAllTrxByProjectId(projectId: string): Promise<Trx[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/trx/project/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    async registerTrx(trxData: CreateTrxData): Promise<Trx> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/trx/register`,
                trxData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to register transaction');
            }
        } catch (error) {
            console.error('Error registering transaction:', error);
            throw error;
        }
    },

    async cloneFromActual(cloneData: CloneTrxFromActualData): Promise<Trx> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/trx/cloneFromActual`,
                cloneData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to clone transaction from actual');
            }
        } catch (error) {
            console.error('Error cloning transaction:', error);
            throw error;
        }
    },

    async updateTrx(id: string, trxData: UpdateTrxData): Promise<Trx> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/trx/${id}`,
                trxData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to update transaction');
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    async deleteTrx(id: string): Promise<void> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/trx/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                throw new Error('Failed to delete transaction');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }
};