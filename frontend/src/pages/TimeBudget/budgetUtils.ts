/**
 * Budget data processing utilities
 * Wraps generic TimeMap utilities with Budget-specific logic
 */

import { Budget } from '../../services/budgetService';
import { GroupedBudgets, GroupedBudgetGroup, BudgetsByMonth, MonthTotals } from './types';
import {
    filterItemsByDateRange,
    getYearMonthFromDate
} from '../../components/TimeMap';

export const groupBudgetsByProjectAndName = (budgets: Budget[]): GroupedBudgets => {
    return budgets.reduce((acc: GroupedBudgets, budget) => {
        const projectId = typeof budget.project === 'string' ? budget.project : (budget.project as any)?._id || 'Unknown';
        const projectName = typeof budget.project === 'string' ? budget.project : (budget.project as any)?.name || 'Unknown';
        const id = budget._id || 'Unknown';
        const name = budget.name;
        // Use budget ID as key to ensure each budget gets its own row, even with same name
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
        acc[key].items.push(budget);
        return acc;
    }, {});
};

export const getBudgetsByMonth = (
    budgetList: Budget[],
    monthRange: string[]
): BudgetsByMonth => {
    const result: BudgetsByMonth = {};
    if (!budgetList || !Array.isArray(budgetList)) {
        return result;
    }
    budgetList.forEach((budget: Budget) => {
        const dateEx = budget.dateEx;
        if (dateEx) {
            const itemYm = getYearMonthFromDate(dateEx);
            if (monthRange.includes(itemYm)) {
                if (!result[itemYm]) {
                    result[itemYm] = [];
                }
                result[itemYm].push({
                    amount: budget.amount || 0,
                    done: budget.done || false,
                    typ: budget.typ || 'expense'
                });
            }
        }
    });
    return result;
};

export const calculateMonthTotals = (
    groupedBudgets: GroupedBudgets,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedBudgets).forEach(([key, group]: [string, GroupedBudgetGroup]) => {
        if (selectedRows[key]) {
            const monthData = getBudgetsByMonth(group.items, monthRange);
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
    groupedBudgets: GroupedBudgets,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedBudgets).forEach(([_key, group]: [string, GroupedBudgetGroup]) => {
        const monthData = getBudgetsByMonth(group.items, monthRange);
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

export const filterBudgetsByDateRange = (
    budgets: Budget[],
    startYm: string,
    endYm: string
): Budget[] => {
    return filterItemsByDateRange(
        budgets,
        startYm,
        endYm,
        (budget) => budget.dateEx
    );
};

export const getSortedGroupedBudgets = (groupedBudgets: GroupedBudgets): Array<[string, GroupedBudgetGroup]> => {
    return Object.entries(groupedBudgets).sort(([, groupA], [, groupB]) => {
        // Get project stDate from the first item's project reference
        const getProjectStDate = (group: GroupedBudgetGroup): number => {
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
