import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Actual } from '../../services/actualService';
import { useActual } from '../../hooks/useActual';
import { useNavigate } from 'react-router-dom';
import sortRow from '../../utils/sortRow';
import { TimeMapHeader, TimeMapMonthNavigation } from '../../components/TimeMap';
import { ActualTable } from './ActualTable';
import AssigneeSelector from '../../components/AssigneeSelector';
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
    calculateDoneMonthTotals,
    filterActualsByDateRange
} from './actualUtils';
import {
    handleRowSelect as handleRowSelectUtil,
    handleSelectAll as handleSelectAllUtil,
    initializeSelectedRows
} from '../../components/TimeMap';

export default function TimeActualByAssignee() {
    const navigate = useNavigate();
    const { getAllActual, getAllActualByAssignee, loading, error: hookError } = useActual();
    const [actuals, setActuals] = useState<Actual[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [nRangeMonth, setNRangeMonth] = useState<number>(1);
    const [filterType, setFilterType] = useState<'view all' | 'income' | 'expense'>('view all');
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -nRangeMonth));
    const [enYm, setEnYm] = useState(addMonths(currentYm, nRangeMonth));
    const monthRange = getMonthRange(stYm, enYm);

    // Fetch actuals using hook
    const fetchActuals = async (assigneeId: string | null, startYm: string, endYm: string) => {
        try {
            setError(null);
            let allActuals: Actual[];
            if (!assigneeId) {
                allActuals = await getAllActual();
            } else {
                allActuals = await getAllActualByAssignee(assigneeId);
            }
            const filtered = filterActualsByDateRange(allActuals, startYm, endYm);
            // setActuals(sortRow(filtered));
            setActuals(filtered);
        } catch (err) {
            console.error('Error fetching actuals:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch actuals');
        }
    };

    useEffect(() => {
        fetchActuals(selectedAssigneeId, stYm, enYm);
    }, [selectedAssigneeId, stYm, enYm]);

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

    // Create memoized wrapper for getActualsByMonth that uses monthRange from state
    const getActualsByMonthWrapper = useCallback(
        (actualList: Actual[]) => getActualsByMonth(actualList, monthRange),
        [monthRange]
    );

    const monthTotals = useMemo(
        () => calculateMonthTotals(groupedActuals, selectedRows, monthRange),
        [groupedActuals, selectedRows, monthRange]
    );

    const variableMonthTotals = useMemo(
        () => calculateVariableMonthTotals(groupedActuals, monthRange),
        [groupedActuals, monthRange]
    );

    const doneMonthTotals = useMemo(
        () => calculateDoneMonthTotals(groupedActuals, monthRange),
        [groupedActuals, monthRange]
    );

    return (
        <div className="flex flex-col gap-2 p-6 h-screen">
            <div className="flex flex-col gap-4">
                <TimeMapHeader title="Actual TimeMap By Assignee" nRangeMonth={nRangeMonth} onRangeMonthChange={handleRangeMonthChange} />
                <div className="w-full max-w-md">
                    <AssigneeSelector 
                        selectedAssignee={selectedAssigneeId} 
                        onAssigneeChange={setSelectedAssigneeId} 
                        isEditing={true} 
                    />
                </div>
            </div>

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
                        filterType={filterType}
                        onFilterChange={setFilterType}
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
                            doneMonthTotals={doneMonthTotals}
                            selectedRows={selectedRows}
                            getActualsByMonth={getActualsByMonthWrapper}
                            onRowSelect={handleRowSelect}
                            onSelectAll={handleSelectAll}
                            onNavigateToActual={(actualId: string) => navigate(`/finance/actual/${actualId}`)}
                            filterType={filterType}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
