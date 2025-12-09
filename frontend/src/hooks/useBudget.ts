import { useState, useCallback } from 'react';
import {
    budgetService,
    Budget,
} from '../services/budgetService.ts';

export interface UseBudgetReturn {
    budgets: Budget[];
    loading: boolean;
    error: string | null;
    getAllBudget: () => Promise<Budget[]>;
    getAllBudgetByProjectId: (projectId: string) => Promise<Budget[]>;
    getBudgetById: (budgetId: string) => Promise<Budget>;
    createBudget: (projectId: string, budgetData: any) => Promise<Budget>;
    updateBudget: (budgetId: string, budgetData: Partial<any>) => Promise<Budget>;
    deleteBudget: (budgetId: string) => Promise<void>;
    setBudgets: (budgets: Budget[]) => void;
}

export const useBudget = (): UseBudgetReturn => {
    const [budgets, setBudgetsState] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllBudget = useCallback(async (): Promise<Budget[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await budgetService.getAllBudget();
            setBudgetsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budgets';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllBudgetByProjectId = useCallback(async (projectId: string): Promise<Budget[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await budgetService.getBudgetsByProject(projectId);
            setBudgetsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budgets';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getBudgetById = useCallback(async (budgetId: string): Promise<Budget> => {
        try {
            setError(null);
            const budget = await budgetService.getBudgetById(budgetId);
            return budget;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budget';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const createBudget = useCallback(async (projectId: string, budgetData: any): Promise<Budget> => {
        try {
            setError(null);
            const newBudget = await budgetService.createBudget(projectId, budgetData);
            setBudgetsState(prev => [newBudget, ...prev]);
            return newBudget;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create budget';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<any>): Promise<Budget> => {
        try {
            setError(null);
            const updatedBudget = await budgetService.updateBudget(budgetId, budgetData);
            setBudgetsState(prev => prev.map(budget => budget._id === budgetId ? updatedBudget : budget));
            return updatedBudget;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update budget';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const deleteBudget = useCallback(async (budgetId: string): Promise<void> => {
        try {
            setError(null);
            await budgetService.deleteBudget(budgetId);
            setBudgetsState(prev => prev.filter(budget => budget._id !== budgetId));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const setBudgets = useCallback((budgets: Budget[]) => {
        setBudgetsState(budgets);
    }, []);

    return {
        budgets,
        loading,
        error,
        getAllBudget,
        getAllBudgetByProjectId,
        getBudgetById,
        createBudget,
        updateBudget,
        deleteBudget,
        setBudgets,
    };
};
