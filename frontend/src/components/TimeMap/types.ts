/**
 * Shared type definitions for TimeMap-related components
 * Used across TimeBudget, TimeActual, TimeTrx, and TimeMap
 */

export type MonthData = {
    amount: number;
    done: boolean;
    typ: string;
};

export type MonthTotals = Record<string, number>;
export type SelectedRows = Record<string, boolean>;

// Generic group type for financial items
export type GroupedItemGroup<T> = {
    name: string;
    project: string;
    projectId: string;
    id: string;
    items: T[];
};

export type GroupedItems<T> = Record<string, GroupedItemGroup<T>>;
export type ItemsByMonth = Record<string, MonthData>;
