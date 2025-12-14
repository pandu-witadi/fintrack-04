/**
 * Actual data processing utilities
 * Wraps generic TimeMap utilities with Actual-specific logic
 */

import { Actual } from '../../services/actualService';
import { GroupedActuals, GroupedActualGroup, ActualsByMonth, MonthTotals } from './types';
import {
    groupItemsByProjectAndName,
    getItemsByMonth as getItemsByMonthGeneric,
    calculateMonthTotals as calculateMonthTotalsGeneric,
    calculateVariableMonthTotals as calculateVariableMonthTotalsGeneric,
    filterItemsByDateRange
} from '../../components/TimeMap';

export const groupActualsByProjectAndName = (actuals: Actual[]): GroupedActuals => {
    return groupItemsByProjectAndName(
        actuals,
        (actual) => typeof actual.project === 'string' ? actual.project : (actual.project as any)?._id || 'Unknown',
        (actual) => typeof actual.project === 'string' ? actual.project : (actual.project as any)?.name || 'Unknown',
        (actual) => actual._id || 'Unknown',
        (actual) => actual.name
    ) as unknown as GroupedActuals;
};

export const getActualsByMonth = (
    actualList: Actual[],
    monthRange: string[]
): ActualsByMonth => {
    return getItemsByMonthGeneric(
        actualList,
        monthRange,
        (actual) => actual.dateEx,
        (actual) => actual.amount || 0,
        (actual) => actual.done || false,
        (actual) => actual.typ || 'expense'
    ) as unknown as ActualsByMonth;
};

export const calculateMonthTotals = (
    groupedActuals: GroupedActuals,
    selectedRows: Record<string, boolean>,
    monthRange: string[]
): MonthTotals => {
    return calculateMonthTotalsGeneric(
        groupedActuals as any,
        selectedRows,
        monthRange,
        (actuals: unknown[]) => getActualsByMonth(actuals as Actual[], monthRange)
    );
};

export const calculateVariableMonthTotals = (
    groupedActuals: GroupedActuals,
    monthRange: string[]
): MonthTotals => {
    return calculateVariableMonthTotalsGeneric(
        groupedActuals as any,
        monthRange,
        (actuals: unknown[]) => getActualsByMonth(actuals as Actual[], monthRange)
    );
};

export const filterActualsByDateRange = (
    actuals: Actual[],
    startYm: string,
    endYm: string
): Actual[] => {
    return filterItemsByDateRange(
        actuals,
        startYm,
        endYm,
        (actual) => actual.dateEx
    );
};
