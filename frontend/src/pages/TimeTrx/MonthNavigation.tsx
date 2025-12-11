/**
 * Month navigation component for TimeTrx
 */

import React from 'react';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigationProps {
    stYm: string;
    enYm: string;
    onPrevious: () => void;
    onNext: () => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
    stYm,
    enYm,
    onPrevious,
    onNext
}) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex items-center gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700">
                {stYm} to {enYm}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                className="flex items-center gap-2"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
