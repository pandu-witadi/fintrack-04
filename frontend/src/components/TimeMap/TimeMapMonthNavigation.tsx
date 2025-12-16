/**
 * Unified month navigation component for TimeMap-based pages
 * Used by TimeBudget, TimeActual, and TimeTrx
 */

import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeMapMonthNavigationProps {
    stYm: string;
    enYm: string;
    onPrevious: () => void;
    onNext: () => void;
    filterType?: 'view all' | 'income' | 'expense';
    onFilterChange?: (filterType: 'view all' | 'income' | 'expense') => void;
}

export const TimeMapMonthNavigation: React.FC<TimeMapMonthNavigationProps> = ({
    stYm,
    enYm,
    onPrevious,
    onNext,
    filterType = 'view all',
    onFilterChange
}) => {
    return (
        <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-1">
                <select
                    value={filterType}
                    onChange={(e) => onFilterChange?.(e.target.value as 'view all' | 'income' | 'expense')}
                    className="h-7 px-2 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:border-gray-400 cursor-pointer"
                >
                    <option value="view all">View All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="flex items-center gap-1 h-7 px-2"
                >
                    <ChevronLeft className="h-3 w-3" />
                </Button>
            </div>
            <span className="text-xs font-medium text-gray-700">
                {stYm} to {enYm}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                className="flex items-center gap-1 h-7 px-2"
            >
                <ChevronRight className="h-3 w-3" />
            </Button>
        </div>
    );
};
