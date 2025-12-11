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
