/**
 * Header component for TimeTrx
 */

import React from 'react';

interface TimeTrxHeaderProps {
    nRangeMonth: number;
    onRangeMonthChange: (newRange: number) => void;
}

export const TimeTrxHeader: React.FC<TimeTrxHeaderProps> = ({
    nRangeMonth,
    onRangeMonthChange
}) => {
    return (
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Transaction Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Month Range:</span>
                    <select
                        value={nRangeMonth}
                        onChange={(e) => onRangeMonthChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={1}>±1 Month</option>
                        <option value={2}>±2 Months</option>
                        <option value={3}>±3 Months</option>
                        <option value={6}>±6 Months</option>
                        <option value={12}>±12 Months</option>
                    </select>
                </label>
            </div>
        </div>
    );
};
