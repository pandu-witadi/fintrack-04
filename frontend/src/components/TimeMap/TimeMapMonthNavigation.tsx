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
}

export const TimeMapMonthNavigation: React.FC<TimeMapMonthNavigationProps> = ({
    stYm,
    enYm,
    onPrevious,
    onNext
}) => {
    return (
        <div className="flex items-center justify-between mb-3">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex items-center gap-1 h-7 px-2"
            >
                <ChevronLeft className="h-3 w-3" />
            </Button>
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
