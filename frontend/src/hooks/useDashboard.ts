import { useState, useEffect } from 'react';
import { dashboardService, DashboardSummary } from '../services/dashboardService';

export const useDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getSummary();
            setSummary(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    return {
        summary,
        loading,
        error,
        refresh: fetchSummary
    };
};