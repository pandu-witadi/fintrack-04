/**
 * Actual data processing utilities
 */

import { Actual } from '../../services/actualService';
import { GroupedActuals, GroupedActualGroup, ActualsByMonth, MonthTotals } from './types';
import { getYearMonthFromDate } from '../../components/TimeMap';

export const groupActualsByProjectAndName = (actuals: Actual[]): GroupedActuals => {
    return actuals.reduce((acc: GroupedActuals, actual) => {
        const projectId = typeof actual.project === 'string' ? actual.project : (actual.project as any)?._id || 'Unknown';
        const projectName = typeof actual.project === 'string' ? actual.project : (actual.project as any)?.name || 'Unknown';
        const actualId = actual._id || 'Unknown';
        const key = `${actual.name}-${projectId}`;
        if (!acc[key]) {
            acc[key] = {
                actualName: actual.name,
                project: projectName,
                projectId: projectId,
                actualId: actualId,
                actuals: []
            };
        }
        acc[key].actuals.push(actual);
        return acc;
    }, {});
};

export const getActualsByMonth = (
    actualList: Actual[],
    monthRange: string[]
): ActualsByMonth => {
    const result: ActualsByMonth = {};
    actualList.forEach((actual: Actual) => {
        if (actual.dateEx) {
            const actualYm = getYearMonthFromDate(actual.dateEx);
            if (monthRange.includes(actualYm)) {
                result[actualYm] = {
                    amount: actual.amount || 0,
                    done: actual.done || false,
                    typ: actual.typ || 'expense'
                };
            }
        }
    });
    return result;
};

export const calculateMonthTotals = (
    groupedActuals: GroupedActuals,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedActuals).forEach(([key, group]: [string, GroupedActualGroup]) => {
        // Only include this group if selected
        if (selectedRows[key]) {
            const monthData = getActualsByMonth(group.actuals, monthRange);
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
    groupedActuals: GroupedActuals,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedActuals).forEach(([_key, group]: [string, GroupedActualGroup]) => {
        // Include all groups regardless of selection
        const monthData = getActualsByMonth(group.actuals, monthRange);
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

export const filterActualsByDateRange = (
    actuals: Actual[],
    startYm: string,
    endYm: string
): Actual[] => {
    return actuals.filter((actual: Actual) => {
        const actualYm = getYearMonthFromDate(actual.dateEx);
        return actualYm >= startYm && actualYm <= endYm;
    });
};
