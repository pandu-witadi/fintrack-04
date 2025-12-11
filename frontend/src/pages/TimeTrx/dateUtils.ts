/**
 * Date utility functions for Trx (Transaction) module
 */

export const getTrxYearMonth = (dateEx: string): string => {
    return new Date(dateEx).toISOString().substring(0, 7);
};
