/**
 * Budget data processing utilities
 */

import { Budget } from '../../services/budgetService';
import { GroupedBudgets, GroupedBudgetGroup, BudgetsByMonth, MonthTotals } from './types';
import { getYearMonthFromDate } from '../../components/TimeMap';

export const groupBudgetsByProjectAndName = (budgets: Budget[]): GroupedBudgets => {
    return budgets.reduce((acc: GroupedBudgets, budget) => {
        const projectId = typeof budget.project === 'string' ? budget.project : (budget.project as any)?._id || 'Unknown';
        const projectName = typeof budget.project === 'string' ? budget.project : (budget.project as any)?.name || 'Unknown';
        const budgetId = budget._id || 'Unknown';
        const key = `${budget.name}-${projectId}`;
        if (!acc[key]) {
            acc[key] = {
                budgetName: budget.name,
                project: projectName,
                projectId: projectId,
                budgetId: budgetId,
                budgets: []
            };
        }
        acc[key].budgets.push(budget);
        return acc;
    }, {});
};

export const getBudgetsByMonth = (
    budgetList: Budget[],
    monthRange: string[]
): BudgetsByMonth => {
    const result: BudgetsByMonth = {};
    budgetList.forEach((budget: Budget) => {
        if (budget.dateEx) {
            const budgetYm = getYearMonthFromDate(budget.dateEx);
            if (monthRange.includes(budgetYm)) {
                result[budgetYm] = {
                    amount: budget.amount || 0,
                    done: budget.done || false,
                    typ: budget.typ || 'expense'
                };
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
        // Only include this group if selected
        if (selectedRows[key]) {
            const monthData = getBudgetsByMonth(group.budgets, monthRange);
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
    groupedBudgets: GroupedBudgets,
    monthRange: string[]
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedBudgets).forEach(([_key, group]: [string, GroupedBudgetGroup]) => {
        // Include all groups regardless of selection
        const monthData = getBudgetsByMonth(group.budgets, monthRange);
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

export const filterBudgetsByDateRange = (
    budgets: Budget[],
    startYm: string,
    endYm: string
): Budget[] => {
    return budgets.filter((budget: Budget) => {
        const budgetYm = getYearMonthFromDate(budget.dateEx);
        return budgetYm >= startYm && budgetYm <= endYm;
    });
};
