import { useState, useCallback } from 'react';
import { actualService, Actual, CreateActualData } from '../services/actualService';

export interface UseActualReturn {
    actuals: Actual[];
    loading: boolean;
    error: string | null;
    getAllActualByProjectId: (projectId: string) => Promise<Actual[]>;
    getActualById: (actualId: string) => Promise<Actual>;
    createActual: (actualData: CreateActualData) => Promise<Actual>;
    updateActual: (actualId: string, actualData: Partial<any>) => Promise<Actual>;
    deleteActual: (actualId: string) => Promise<void>;
    setActuals: (actuals: Actual[]) => void;
}

export const useActual = (): UseActualReturn => {
    const [actuals, setActualsState] = useState<Actual[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllActualByProjectId = useCallback(async (projectId: string): Promise<Actual[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await actualService.getAllActualByProjectId(projectId);
            setActualsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actuals';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getActualById = useCallback(async (actualId: string): Promise<Actual> => {
        try {
            setError(null);
            const actual = await actualService.getActualById(actualId);
            return actual;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actual';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);
    
    const createActual = useCallback(async (actualData: CreateActualData): Promise<Actual> => {
        try {
            setError(null);
            const newActual = await actualService.registerActual(actualData);
            setActualsState(prev => [newActual, ...prev]);
            return newActual;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create actual';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const updateActual = useCallback(async (actualId: string, actualData: Partial<any>): Promise<Actual> => {
        try {
            setError(null);
            const updatedActual = await actualService.updateActual(actualId, actualData);
            setActualsState(prev => prev.map(actual => actual._id === actualId ? updatedActual : actual));
            return updatedActual;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update actual';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const deleteActual = useCallback(async (actualId: string): Promise<void> => {
        try {
            setError(null);
            await actualService.deleteActual(actualId);
            setActualsState(prev => prev.filter(actual => actual._id !== actualId));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete actual';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const setActuals = useCallback((actuals: Actual[]) => {
        setActualsState(actuals);
    }, []);

    return {
        actuals,
        loading,
        error,
        getAllActualByProjectId,
        getActualById,
        createActual,
        updateActual,
        deleteActual,
        setActuals,
    };
};