import axios from 'axios';
import { userService } from './userService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';

interface FinancialInfo {
    budget: number;
    actual: number;
}

interface ProjectInfo {
    income: FinancialInfo;
    expense: FinancialInfo;
    profit: FinancialInfo;
    note?: string;
}

interface ClientInfo {
    company?: string;
    sub?: string;
    contact?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface Project {
    _id: string;
    code?: string;
    name: string;
    note?: string;
    active: boolean;
    done: boolean;
    typ: 'project' | 'routine' | 'other';
    info: ProjectInfo;
    client?: ClientInfo;
    updatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    lBudget?: Array<{
        _id: string;
        name: string;
    }>;
    lActual?: Array<{
        _id: string;
        name: string;
    }>;
    lTrx?: Array<{
        _id: string;
        name: string;
    }>;
    year?: number;
    stDate?: string;
    enDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateProjectData {
    code?: string;
    name: string;
    note?: string;
    active?: boolean;
    typ?: 'project' | 'routine' | 'other';
    year?: number;
    stDate?: string;
    enDate?: string;
    client?: ClientInfo;
}

interface UpdateProjectData {
    code?: string;
    name?: string;
    note?: string;
    active?: boolean;
    typ?: 'project' | 'routine' | 'other';
    year?: number;
    stDate?: string;
    enDate?: string;
    client?: ClientInfo;
}

export const projectService = {

    async getAllProject(): Promise<Project[]> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/project/getAll`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch projects');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    async getProjectById(id: string): Promise<Project> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/project/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to fetch project');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            throw error;
        }
    },

    async createProject(projectData: CreateProjectData): Promise<Project> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/project/register`, projectData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.patch(`${API_BASE_URL}/project/${id}`, projectData, { headers: { Authorization: `Bearer ${token}` } });        
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    async deleteProject(id: string): Promise<void> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/project/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.data.success) {
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    async runFinance(id: string): Promise<Project> {
        const token = userService.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/project/runFinance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                return response.data.pyd;
            } else {
                throw new Error('Failed to calculate finance');
            }
        } catch (error) {
            console.error('Error calculating finance:', error);
          throw error;
        }
    }
};