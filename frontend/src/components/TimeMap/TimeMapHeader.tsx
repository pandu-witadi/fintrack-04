/**
 * Unified header component for TimeMap-based pages
 * Used by TimeBudget, TimeActual, and TimeTrx
 */

import React from 'react';

interface TimeMapHeaderProps {
    title: string;
    nRangeMonth: number;
    onRangeMonthChange: (newRange: number) => void;
}

export const TimeMapHeader: React.FC<TimeMapHeaderProps> = ({
    title,
    nRangeMonth,
    onRangeMonthChange
}) => {
    return (
        <div className="flex justify-between items-center gap-2">
            <div>
                <h1 className="text-lg font-bold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-700">Month Range:</span>
                    <select
                        value={nRangeMonth}
                        onChange={(e) => onRangeMonthChange(Number(e.target.value))}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
