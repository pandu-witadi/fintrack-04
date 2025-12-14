/**
 * Type definitions for TimeTrx component
 */

import { Trx } from '../../services/trxService';

export type GroupedTrxGroup = {
    name: string;  // Trx name
    project: string;
    projectId: string;
    id: string;  // Trx ID
    items: Trx[];  // Array of trxs
};

export type GroupedTrxs = Record<string, GroupedTrxGroup>;

export type MonthData = {
    amount: number;
    done: boolean;
    typ: string;
};

export type TrxsByMonth = Record<string, MonthData>;

export type MonthTotals = Record<string, number>;

export type SelectedRows = Record<string, boolean>;
