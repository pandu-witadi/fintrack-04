/**
 * Shared data processing utilities for financial items
 * Works with Budget, Actual, and Trx data with parameterization
 */

import { GroupedItems, ItemsByMonth, MonthTotals, GroupedItemGroup } from './types';
import { getYearMonthFromDate } from './dateUtils';

/**
 * Generic function to group items by project and name
 * @param items - Array of financial items (Budget, Actual, or Trx)
 * @param getProjectId - Function to extract project ID
 * @param getProjectName - Function to extract project name
 * @param getId - Function to extract item ID
 * @param getName - Function to extract item name
 * @returns Grouped items record
 */
export const groupItemsByProjectAndName = <T>(
    items: T[],
    getProjectId: (item: T) => string,
    getProjectName: (item: T) => string,
    getId: (item: T) => string,
    getName: (item: T) => string
): GroupedItems<T> => {
    return items.reduce((acc: GroupedItems<T>, item) => {
        const projectId = getProjectId(item);
        const projectName = getProjectName(item);
        const id = getId(item);
        const name = getName(item);
        const key = `${name}-${projectId}`;
        
        if (!acc[key]) {
            acc[key] = {
                name: name,
                project: projectName,
                projectId: projectId,
                id: id,
                items: []
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {});
};

/**
 * Get items by month
 * @param itemList - Array of items
 * @param monthRange - Array of month strings (yyyy-mm format)
 * @param getDateEx - Function to extract date from item
 * @param getAmount - Function to extract amount from item
 * @param getDone - Function to extract done status from item
 * @param getType - Function to extract type from item
 */
export const getItemsByMonth = <T>(
    itemList: T[],
    monthRange: string[],
    getDateEx: (item: T) => string,
    getAmount: (item: T) => number,
    getDone: (item: T) => boolean,
    getType: (item: T) => string
): ItemsByMonth => {
    const result: ItemsByMonth = {};
    if (!itemList || !Array.isArray(itemList)) {
        return result;
    }
    itemList.forEach((item: T) => {
        const dateEx = getDateEx(item);
        if (dateEx) {
            const itemYm = getYearMonthFromDate(dateEx);
            if (monthRange.includes(itemYm)) {
                result[itemYm] = {
                    amount: getAmount(item) || 0,
                    done: getDone(item) || false,
                    typ: getType(item) || 'expense'
                };
            }
        }
    });
    return result;
};

/**
 * Calculate selected month totals
 * @param groupedItems - Grouped items
 * @param selectedRows - Selected row keys
 * @param monthRange - Array of months
 * @param getItemsByMonthFn - Function to get items by month
 */
export const calculateMonthTotals = <T>(
    groupedItems: GroupedItems<T>,
    selectedRows: Record<string, boolean>,
    monthRange: string[],
    getItemsByMonthFn: (items: T[]) => ItemsByMonth
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedItems).forEach(([key, group]: [string, GroupedItemGroup<T>]) => {
        if (selectedRows[key]) {
            const monthData = getItemsByMonthFn(group.items);
            Object.entries(monthData).forEach(([month, data]) => {
                if (data.typ === 'income') {
                    totals[month] += data.amount;
                } else {
                    totals[month] -= data.amount;
                }
            });
        }
    });
    
    return totals;
};

/**
 * Calculate variable month totals (all items regardless of selection)
 * @param groupedItems - Grouped items
 * @param monthRange - Array of months
 * @param getItemsByMonthFn - Function to get items by month
 */
export const calculateVariableMonthTotals = <T>(
    groupedItems: GroupedItems<T>,
    monthRange: string[],
    getItemsByMonthFn: (items: T[]) => ItemsByMonth
): MonthTotals => {
    const totals: MonthTotals = {};
    monthRange.forEach((month: string) => {
        totals[month] = 0;
    });
    
    Object.entries(groupedItems).forEach(([_key, group]: [string, GroupedItemGroup<T>]) => {
        const monthData = getItemsByMonthFn(group.items);
        Object.entries(monthData).forEach(([month, data]) => {
            if (data.typ === 'income') {
                totals[month] += data.amount;
            } else {
                totals[month] -= data.amount;
            }
        });
    });
    
    return totals;
};

/**
 * Filter items by date range
 * @param items - Array of items
 * @param startYm - Start year-month (yyyy-mm)
 * @param endYm - End year-month (yyyy-mm)
 * @param getDateEx - Function to extract date from item
 */
export const filterItemsByDateRange = <T>(
    items: T[],
    startYm: string,
    endYm: string,
    getDateEx: (item: T) => string
): T[] => {
    return items.filter((item: T) => {
        const itemYm = getYearMonthFromDate(getDateEx(item));
        return itemYm >= startYm && itemYm <= endYm;
    });
};
