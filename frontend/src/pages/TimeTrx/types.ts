/**
 * Type definitions for TimeTrx component
 */

import { Trx } from '../../services/trxService';

export type GroupedTrxGroup = {
    trxName: string;
    project: string;
    projectId: string;
    trxId: string;
    trxs: Trx[];
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
