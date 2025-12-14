/**
 * Actual data processing utilities
 * Wraps generic TimeMap utilities with Actual-specific logic
 */

import { Actual } from '../../services/actualService';
import { GroupedActuals, GroupedActualGroup, ActualsByMonth, MonthTotals } from './types';
import {
    groupItemsByProjectAndName,
    filterItemsByDateRange,
    getYearMonthFromDate
} from '../../components/TimeMap';

export const groupActualsByProjectAndName = (actuals: Actual[]): GroupedActuals => {
    return actuals.reduce((acc: GroupedActuals, actual) => {
        const projectId = typeof actual.project === 'string' ? actual.project : (actual.project as any)?._id || 'Unknown';
        const projectName = typeof actual.project === 'string' ? actual.project : (actual.project as any)?.name || 'Unknown';
        const id = actual._id || 'Unknown';
        const name = actual.name;
        // Use actual ID as key to ensure each actual gets its own row, even with same name
        const key = id;
        
        if (!acc[key]) {
            acc[key] = {
                name: name,
                project: projectName,
                projectId: projectId,
                id: id,
                items: []
            };
        }
        acc[key].items.push(actual);
        return acc;
    }, {});
};

export const getActualsByMonth = (
    actualList: Actual[],
    monthRange: string[]
): ActualsByMonth => {
    const result: ActualsByMonth = {};
    if (!actualList || !Array.isArray(actualList)) {
        return result;
    }
    actualList.forEach((actual: Actual) => {
        const dateEx = actual.dateEx;
        if (dateEx) {
            const itemYm = getYearMonthFromDate(dateEx);
            if (monthRange.includes(itemYm)) {
                if (!result[itemYm]) {
                    result[itemYm] = [];
                }
                result[itemYm].push({
                    amount: actual.amount || 0,
                    done: actual.done || false,
                    typ: actual.typ || 'expense',
                    assignee: actual.assignee ? {
                        _id: actual.assignee._id,
                        name: actual.assignee.name,
                        email: actual.assignee.email
                    } : undefined
                });
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
        if (selectedRows[key]) {
            const monthData = getActualsByMonth(group.items, monthRange);
            Object.entries(monthData).forEach(([month, dataList]) => {
                dataList.forEach((data) => {
                    if (data.typ === 'income') {
                        totals[month] += data.amount;
                    } else {
                        totals[month] -= data.amount;
                    }
                });
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
        const monthData = getActualsByMonth(group.items, monthRange);
        Object.entries(monthData).forEach(([month, dataList]) => {
            dataList.forEach((data) => {
                if (data.typ === 'income') {
                    totals[month] += data.amount;
                } else {
                    totals[month] -= data.amount;
                }
            });
        });
    });
    
    return totals;
};

export const filterActualsByDateRange = (
    actuals: Actual[],
    startYm: string,
    endYm: string
): Actual[] => {
    return filterItemsByDateRange(
        actuals,
        startYm,
        endYm,
        (actual) => actual.dateEx
    );
};

export const getSortedGroupedActuals = (groupedActuals: GroupedActuals): Array<[string, GroupedActualGroup]> => {
    return Object.entries(groupedActuals).sort(([, groupA], [, groupB]) => {
        // Get project stDate from the first item's project reference
        const getProjectStDate = (group: GroupedActualGroup): number => {
            if (group.items && group.items.length > 0) {
                const project = group.items[0].project;
                if (typeof project === 'object' && project && 'stDate' in project) {
                    return new Date((project as any).stDate).getTime();
                }
            }
            return 0;
        };

        const dateA = getProjectStDate(groupA);
        const dateB = getProjectStDate(groupB);

        // First, sort by project.stDate descending
        if (dateA !== dateB) {
            return dateB - dateA; // descending
        }

        // If same project stDate, sort by typ: income first, then expense
        const typeOrder: Record<string, number> = { 'income': 0, 'expense': 1 };
        const typA = typeOrder[groupA.items[0]?.typ] ?? 2;
        const typB = typeOrder[groupB.items[0]?.typ] ?? 2;
        return typA - typB;
    });
};
