/**
 * Transaction data processing utilities
 */

import { Trx } from '../../services/trxService';
import { GroupedTrxs, GroupedTrxGroup, TrxsByMonth, MonthTotals } from './types';
import { getTrxYearMonth } from './dateUtils';

export const groupTrxsByProjectAndName = (trxs: Trx[]): GroupedTrxs => {
    return trxs.reduce((acc: GroupedTrxs, trx) => {
        const projectId = typeof trx.project === 'string' ? trx.project : (trx.project as any)?._id || 'Unknown';
        const projectName = typeof trx.project === 'string' ? trx.project : (trx.project as any)?.name || 'Unknown';
        const trxId = trx._id || 'Unknown';
        const key = `${trx.name}-${projectId}`;
        if (!acc[key]) {
            acc[key] = {
                trxName: trx.name,
                project: projectName,
                projectId: projectId,
                trxId: trxId,
                trxs: []
            };
        }
        acc[key].trxs.push(trx);
        return acc;
    }, {});
};

export const getTrxsByMonth = (
    trxList: Trx[],
    monthRange: string[]
): TrxsByMonth => {
    const result: TrxsByMonth = {};
    trxList.forEach((trx: Trx) => {
        if (trx.dateEx) {
            const trxYm = getTrxYearMonth(trx.dateEx);
            if (monthRange.includes(trxYm)) {
                result[trxYm] = {
                    amount: trx.amount || 0,
                    done: trx.done || false,
                    typ: trx.typ || 'expense'
                };
            }
        }
    });
    return result;
};

export const calculateMonthTotals = (
    groupedTrxs: GroupedTrxs,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedTrxs).forEach(([key, group]: [string, GroupedTrxGroup]) => {
        // Only include this group if selected
        if (selectedRows[key]) {
            const monthData = getTrxsByMonth(group.trxs, monthRange);
            Object.entries(monthData).forEach(([month, data]) => {
                if (data.typ === 'income') {
                    totals[month] += data.amount;
                } else {
                    totals[month] -= data.amount;
                }
            });
        }
    });
    
    return totals;
};

export const calculateVariableMonthTotals = (
    groupedTrxs: GroupedTrxs,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedTrxs).forEach(([_key, group]: [string, GroupedTrxGroup]) => {
        // Include all groups regardless of selection
        const monthData = getTrxsByMonth(group.trxs, monthRange);
        Object.entries(monthData).forEach(([month, data]) => {
            if (data.typ === 'income') {
                totals[month] += data.amount;
            } else {
                totals[month] -= data.amount;
            }
        });
    });
    
    return totals;
};

export const filterTrxsByDateRange = (
    trxs: Trx[],
    startYm: string,
    endYm: string
): Trx[] => {
    return trxs.filter((trx: Trx) => {
        const trxYm = getTrxYearMonth(trx.dateEx);
        return trxYm >= startYm && trxYm <= endYm;
    });
};
