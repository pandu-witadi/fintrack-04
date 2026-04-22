/**
 * Type definitions for TimeTrxByAssignee component
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

export type Assignee = {
    _id: string;
    name: string;
    email: string;
};

export type MonthData = {
    amount: number;
    actAmount?: number;
    isEq?: boolean;
    done: boolean;
    typ: string;
    assignee?: Assignee;
    img?: string;
    trxId?: string;
};

export type TrxsByMonth = Record<string, MonthData[]>;

export type MonthTotals = Record<string, number>;

export type SelectedRows = Record<string, boolean>;
