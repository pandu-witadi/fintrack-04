/**
 * Shared date utility functions for year-month operations
 * Used across TimeBudget, TimeActual, TimeTrx, and TimeMap components
 */

export const formatYearMonth = (year: number, month: number): string => {
    return `${year}-${String(month).padStart(2, '0')}`;
};

export const parseYearMonth = (ym: string): { year: number; month: number } => {
    const [year, month] = ym.split('-').map(Number);
    return { year, month };
};

export const addMonths = (ym: string, months: number): string => {
    const { year, month } = parseYearMonth(ym);
    let newMonth = month + months;
    let newYear = year;
    while (newMonth > 12) {
        newMonth -= 12;
        newYear++;
    }
    while (newMonth < 1) {
        newMonth += 12;
        newYear--;
    }
    return formatYearMonth(newYear, newMonth);
};

export const getCurrentYearMonth = (): string => {
    const now = new Date();
    return formatYearMonth(now.getFullYear(), now.getMonth() + 1);
};

export const getMonthRange = (start: string, end: string): string[] => {
    const months: string[] = [];
    let current = start;
    while (current <= end) {
        months.push(current);
        current = addMonths(current, 1);
    }
    return months;
};

export const getYearMonthFromDate = (dateEx: string): string => {
    return new Date(dateEx).toISOString().substring(0, 7);
};
