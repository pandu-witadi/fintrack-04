/**
 * Legend component for TimeBudget
 */

import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { IconDone } from '../../components/IconDone';

export const TimeBudgetLegend: React.FC = () => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        {IconDone(true)}
                        <span className="text-sm text-gray-700">Done</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {IconDone(false)}
                        <span className="text-sm text-gray-700">On Going</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
