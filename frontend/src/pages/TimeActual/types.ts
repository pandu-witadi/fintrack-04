/**
 * Type definitions for TimeActual component
 */

import { Actual } from '../../services/actualService';

export type GroupedActualGroup = {
    name: string;  // Actual name
    project: string;
    projectId: string;
    id: string;  // Actual ID
    items: Actual[];  // Array of actuals
};

export type GroupedActuals = Record<string, GroupedActualGroup>;

export type MonthData = {
    amount: number;
    done: boolean;
    typ: string;
};

export type ActualsByMonth = Record<string, MonthData>;

export type MonthTotals = Record<string, number>;

export type SelectedRows = Record<string, boolean>;
