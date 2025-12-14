/**
 * Budget data processing utilities
 * Wraps generic TimeMap utilities with Budget-specific logic
 */

import { Budget } from '../../services/budgetService';
import { GroupedBudgets, GroupedBudgetGroup, BudgetsByMonth, MonthTotals } from './types';
import {
    groupItemsByProjectAndName,
    getItemsByMonth as getItemsByMonthGeneric,
    calculateMonthTotals as calculateMonthTotalsGeneric,
    calculateVariableMonthTotals as calculateVariableMonthTotalsGeneric,
    filterItemsByDateRange
} from '../../components/TimeMap';

export const groupBudgetsByProjectAndName = (budgets: Budget[]): GroupedBudgets => {
    return groupItemsByProjectAndName(
        budgets,
        (budget) => typeof budget.project === 'string' ? budget.project : (budget.project as any)?._id || 'Unknown',
        (budget) => typeof budget.project === 'string' ? budget.project : (budget.project as any)?.name || 'Unknown',
        (budget) => budget._id || 'Unknown',
        (budget) => budget.name
    ) as unknown as GroupedBudgets;
};

export const getBudgetsByMonth = (
    budgetList: Budget[],
    monthRange: string[]
): BudgetsByMonth => {
    return getItemsByMonthGeneric(
        budgetList,
        monthRange,
        (budget) => budget.dateEx,
        (budget) => budget.amount || 0,
        (budget) => budget.done || false,
        (budget) => budget.typ || 'expense'
    ) as unknown as BudgetsByMonth;
};

export const calculateMonthTotals = (
    groupedBudgets: GroupedBudgets,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    return calculateMonthTotalsGeneric(
        groupedBudgets as any,
        selectedRows,
        monthRange,
        (budgets: unknown[]) => getBudgetsByMonth(budgets as Budget[], monthRange)
    );
};

export const calculateVariableMonthTotals = (
    groupedBudgets: GroupedBudgets,
    monthRange: string[]
): MonthTotals => {
    return calculateVariableMonthTotalsGeneric(
        groupedBudgets as any,
        monthRange,
        (budgets: unknown[]) => getBudgetsByMonth(budgets as Budget[], monthRange)
    );
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
