/**
 * Shared selection and row handling utilities
 * Used across TimeBudget, TimeActual, TimeTrx, and TimeMap components
 */

import { SelectedRows } from './types';

export const handleRowSelect = (key: string, selectedRows: SelectedRows): SelectedRows => {
    return {
        ...selectedRows,
        [key]: !selectedRows[key]
    };
};

export const handleSelectAll = (selectedRows: SelectedRows): SelectedRows => {
    const allSelected = Object.values(selectedRows).every(v => v);
    const newSelected: SelectedRows = {};
    Object.keys(selectedRows).forEach(key => {
        newSelected[key] = !allSelected;
    });
    return newSelected;
};

export const initializeSelectedRows = (
    keys: string[],
    previousSelectedRows: SelectedRows
): SelectedRows => {
    const newSelectedRows: SelectedRows = {};
    keys.forEach((key: string) => {
        if (!(key in previousSelectedRows)) {
            newSelectedRows[key] = false; // Default to not selected
        } else {
            newSelectedRows[key] = previousSelectedRows[key];
        }
    });
    return newSelectedRows;
};

export const isAllRowsSelected = (selectedRows: SelectedRows): boolean => {
    return Object.values(selectedRows).length > 0 && Object.values(selectedRows).every(v => v);
};
