import { useState, useCallback } from 'react';
import { trxService, Trx, CreateTrxData } from '../services/trxService';

export interface UseTrxReturn {
    trxs: Trx[];
    loading: boolean;
    error: string | null;
    getAllTrx: () => Promise<Trx[]>;
    getAllTrxByProjectId: (projectId: string) => Promise<Trx[]>;
    getAllTrxByAssignee: (assigneeId: string) => Promise<Trx[]>;
    getTrxById: (trxId: string) => Promise<Trx>;
    createTrx: (trxData: CreateTrxData) => Promise<Trx>;
    updateTrx: (trxId: string, trxData: Partial<any>) => Promise<Trx>;
    deleteTrx: (trxId: string) => Promise<void>;
    setTrxs: (trxs: Trx[]) => void;
}

export const useTrx = (): UseTrxReturn => {
    const [trxs, setTrxsState] = useState<Trx[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllTrx = useCallback(async (): Promise<Trx[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await trxService.getAllTrx();
            setTrxsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllTrxByProjectId = useCallback(async (projectId: string): Promise<Trx[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await trxService.getAllTrxByProjectId(projectId);
            setTrxsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllTrxByAssignee = useCallback(async (assigneeId: string): Promise<Trx[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await trxService.getAllTrxByAssignee(assigneeId);
            setTrxsState(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
            setError(errorMessage);
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTrxById = useCallback(async (trxId: string): Promise<Trx> => {
        try {
            setError(null);
            const trx = await trxService.getTrxById(trxId);
            return trx;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);
    
    const createTrx = useCallback(async (trxData: CreateTrxData): Promise<Trx> => {
        try {
            setError(null);
            const newTrx = await trxService.registerTrx(trxData);
            setTrxsState(prev => [newTrx, ...prev]);
            return newTrx;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const updateTrx = useCallback(async (trxId: string, trxData: Partial<any>): Promise<Trx> => {
        try {
            setError(null);
            const updatedTrx = await trxService.updateTrx(trxId, trxData);
            setTrxsState(prev => prev.map(trx => trx._id === trxId ? updatedTrx : trx));
            return updatedTrx;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const deleteTrx = useCallback(async (trxId: string): Promise<void> => {
        try {
            setError(null);
            await trxService.deleteTrx(trxId);
            setTrxsState(prev => prev.filter(trx => trx._id !== trxId));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
            setError(errorMessage);
            console.error(err);
            throw err;
        }
    }, []);

    const setTrxs = useCallback((trxs: Trx[]) => {
        setTrxsState(trxs);
    }, []);

    return {
        trxs,
        loading,
        error,
        getAllTrx,
        getAllTrxByProjectId,
        getAllTrxByAssignee,
        getTrxById,
        createTrx,
        updateTrx,
        deleteTrx,
        setTrxs,
    };
};
