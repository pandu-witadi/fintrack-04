/**
 * Transaction data processing utilities
 * Wraps generic TimeMap utilities with Trx-specific logic
 */

import { Trx } from '../../services/trxService';
import { GroupedTrxs, GroupedTrxGroup, TrxsByMonth, MonthTotals } from './types';
import {
    groupItemsByProjectAndName,
    getItemsByMonth as getItemsByMonthGeneric,
    calculateMonthTotals as calculateMonthTotalsGeneric,
    calculateVariableMonthTotals as calculateVariableMonthTotalsGeneric,
    filterItemsByDateRange
} from '../../components/TimeMap';

export const groupTrxsByProjectAndName = (trxs: Trx[]): GroupedTrxs => {
    return groupItemsByProjectAndName(
        trxs,
        (trx) => typeof trx.project === 'string' ? trx.project : (trx.project as any)?._id || 'Unknown',
        (trx) => typeof trx.project === 'string' ? trx.project : (trx.project as any)?.name || 'Unknown',
        (trx) => trx._id || 'Unknown',
        (trx) => trx.name
    ) as unknown as GroupedTrxs;
};

export const getTrxsByMonth = (
    trxList: Trx[],
    monthRange: string[]
): TrxsByMonth => {
    return getItemsByMonthGeneric(
        trxList,
        monthRange,
        (trx) => trx.dateEx,
        (trx) => trx.amount || 0,
        (trx) => trx.done || false,
        (trx) => trx.typ || 'expense'
    ) as unknown as TrxsByMonth;
};

export const calculateMonthTotals = (
    groupedTrxs: GroupedTrxs,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    return calculateMonthTotalsGeneric(
        groupedTrxs as any,
        selectedRows,
        monthRange,
        (trxs: unknown[]) => getTrxsByMonth(trxs as Trx[], monthRange)
    );
};

export const calculateVariableMonthTotals = (
    groupedTrxs: GroupedTrxs,
    monthRange: string[]
): MonthTotals => {
    return calculateVariableMonthTotalsGeneric(
        groupedTrxs as any,
        monthRange,
        (trxs: unknown[]) => getTrxsByMonth(trxs as Trx[], monthRange)
    );
};

export const filterTrxsByDateRange = (
    trxs: Trx[],
    startYm: string,
    endYm: string
): Trx[] => {
    return filterItemsByDateRange(
        trxs,
        startYm,
        endYm,
        (trx) => trx.dateEx
    );
};
