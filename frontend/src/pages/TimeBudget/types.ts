/**
 * Type definitions for TimeBudget component
 */

import { Budget } from '../../services/budgetService';

export type GroupedBudgetGroup = {
    budgetName: string;
    project: string;
    projectId: string;
    budgetId: string;
    budgets: Budget[];
};

export type GroupedBudgets = Record<string, GroupedBudgetGroup>;

export type MonthData = {
    amount: number;
    done: boolean;
    typ: string;
};

export type BudgetsByMonth = Record<string, MonthData>;

export type MonthTotals = Record<string, number>;

export type SelectedRows = Record<string, boolean>;
