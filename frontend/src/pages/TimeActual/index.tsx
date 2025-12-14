import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Actual } from '../../services/actualService';
import { useActual } from '../../hooks/useActual';
import { useNavigate } from 'react-router-dom';
import sortRow from '../../utils/sortRow';
import { TimeMapHeader, TimeMapMonthNavigation } from '../../components/TimeMap';
import { ActualTable } from './ActualTable';
import {
    formatYearMonth,
    addMonths,
    getCurrentYearMonth,
    getMonthRange
} from '../../components/TimeMap';
import {
    groupActualsByProjectAndName,
    getActualsByMonth,
    calculateMonthTotals,
    calculateVariableMonthTotals,
    filterActualsByDateRange
} from './actualUtils';
import {
    handleRowSelect as handleRowSelectUtil,
    handleSelectAll as handleSelectAllUtil,
    initializeSelectedRows
} from '../../components/TimeMap';

export default function TimeActual() {
    const navigate = useNavigate();
    const { getAllActual, loading, error: hookError } = useActual();
    const [actuals, setActuals] = useState<Actual[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [nRangeMonth, setNRangeMonth] = useState<number>(2);

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -nRangeMonth));
    const [enYm, setEnYm] = useState(addMonths(currentYm, nRangeMonth));
    const monthRange = getMonthRange(stYm, enYm);

    // Fetch actuals using hook
    const fetchActuals = async (startYm: string, endYm: string) => {
        try {
            setError(null);
            const allActuals = await getAllActual();
            const filtered = filterActualsByDateRange(allActuals, startYm, endYm);
            setActuals(sortRow(filtered));
        } catch (err) {
            console.error('Error fetching actuals:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch actuals');
        }
    };

    useEffect(() => {
        fetchActuals(stYm, enYm);
    }, [stYm, enYm]);

    const handlePrevious = () => {
        setStYm(addMonths(stYm, -1));
        setEnYm(addMonths(enYm, -1));
    };

    const handleNext = () => {
        setStYm(addMonths(stYm, 1));
        setEnYm(addMonths(enYm, 1));
    };

    const handleRowSelect = (key: string) => {
        setSelectedRows(handleRowSelectUtil(key, selectedRows));
    };

    const handleSelectAll = () => {
        setSelectedRows(handleSelectAllUtil(selectedRows));
    };

    const groupedActuals = groupActualsByProjectAndName(actuals);

    // Initialize selected rows when grouped actuals change
    useEffect(() => {
        setSelectedRows(initializeSelectedRows(Object.keys(groupedActuals), selectedRows));
    }, [Object.keys(groupedActuals).length]);

    // Handle month range change
    const handleRangeMonthChange = (newRange: number) => {
        setNRangeMonth(newRange);
        setStYm(addMonths(currentYm, -newRange));
        setEnYm(addMonths(currentYm, newRange));
    };

    // Create a wrapper for getActualsByMonth that uses monthRange from state
    const getActualsByMonthWrapper = (actualList: Actual[]) => {
        return getActualsByMonth(actualList, monthRange);
    };

    const monthTotals = calculateMonthTotals(groupedActuals, selectedRows, monthRange);
    const variableMonthTotals = calculateVariableMonthTotals(groupedActuals, monthRange);

    return (
        <div className="flex flex-col gap-2 p-6 h-screen">
            <TimeMapHeader title="Actual TimeMap" nRangeMonth={nRangeMonth} onRangeMonthChange={handleRangeMonthChange} />

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    {error || hookError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                            {error || hookError}
                        </div>
                    )}

                    <TimeMapMonthNavigation
                        stYm={stYm}
                        enYm={enYm}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />

                    {loading ? (
                        <div className="text-center py-8 text-gray-600">Loading actuals...</div>
                    ) : Object.keys(groupedActuals).length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No actuals found for this period</div>
                    ) : (
                        <ActualTable
                            groupedActuals={groupedActuals}
                            monthRange={monthRange}
                            monthTotals={monthTotals}
                            variableMonthTotals={variableMonthTotals}
                            selectedRows={selectedRows}
                            getActualsByMonth={getActualsByMonthWrapper}
                            onRowSelect={handleRowSelect}
                            onSelectAll={handleSelectAll}
                            onNavigateToActual={(actualId: string) => navigate(`/finance/actual/${actualId}`)}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
