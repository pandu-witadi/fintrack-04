/**
 * Transaction data processing utilities
 * Wraps generic TimeMap utilities with Trx-specific logic
 */

import { Trx } from '../../services/trxService';
import { GroupedTrxs, GroupedTrxGroup, TrxsByMonth, MonthTotals } from './types';
import {
    filterItemsByDateRange,
    getYearMonthFromDate
} from '../../components/TimeMap';

export const groupTrxsByProjectAndName = (trxs: Trx[]): GroupedTrxs => {
    return trxs.reduce((acc: GroupedTrxs, trx) => {
        const projectId = typeof trx.project === 'string' ? trx.project : (trx.project as any)?._id || 'Unknown';
        const projectName = typeof trx.project === 'string' ? trx.project : (trx.project as any)?.name || 'Unknown';
        const id = trx._id || 'Unknown';
        const name = trx.name;
        // Use trx ID as key to ensure each trx gets its own row, even with same name
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
        acc[key].items.push(trx);
        return acc;
    }, {});
};

export const getTrxsByMonth = (
    trxList: Trx[],
    monthRange: string[]
): TrxsByMonth => {
    const result: TrxsByMonth = {};
    if (!trxList || !Array.isArray(trxList)) {
        return result;
    }
    trxList.forEach((trx: Trx) => {
        const dateEx = trx.dateEx;
        if (dateEx) {
            const itemYm = getYearMonthFromDate(dateEx);
            if (monthRange.includes(itemYm)) {
                if (!result[itemYm]) {
                    result[itemYm] = [];
                }
                result[itemYm].push({
                    amount: trx.amount || 0,
                    done: trx.done || false,
                    typ: trx.typ || 'expense',
                    assignee: trx.assignee ? {
                        _id: trx.assignee._id,
                        name: trx.assignee.name,
                        email: trx.assignee.email
                    } : undefined
                });
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
        if (selectedRows[key]) {
            const monthData = getTrxsByMonth(group.items, monthRange);
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
    groupedTrxs: GroupedTrxs,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedTrxs).forEach(([_key, group]: [string, GroupedTrxGroup]) => {
        const monthData = getTrxsByMonth(group.items, monthRange);
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

export const filterTrxsByDateRange = (
    trxs: Trx[],
    startYm: string,
    endYm: string
): Trx[] => {
    return filterItemsByDateRange(
        trxs,
        startYm,
        endYm,
        (trx) => trx.dateEx
    );
};

export const getSortedGroupedTrxs = (groupedTrxs: GroupedTrxs): Array<[string, GroupedTrxGroup]> => {
    return Object.entries(groupedTrxs).sort(([, groupA], [, groupB]) => {
        // Get project stDate from the first item's project reference
        const getProjectStDate = (group: GroupedTrxGroup): number => {
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
