/**
 * Type definitions for TimeActual component
 */

import { Actual } from '../../services/actualService';

export type GroupedActualGroup = {
    actualName: string;
    project: string;
    projectId: string;
    actualId: string;
    actuals: Actual[];
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
