import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Trx } from '../../services/trxService';
import { useTrx } from '../../hooks/useTrx';
import { useNavigate } from 'react-router-dom';
import sortRow from '../../utils/sortRow';
import { TimeMapHeader, TimeMapMonthNavigation } from '../../components/TimeMap';
import { TrxTable } from './TrxTable';
import AssigneeSelector from '../../components/AssigneeSelector';
import {
    formatYearMonth,
    addMonths,
    getCurrentYearMonth,
    getMonthRange
} from '../../components/TimeMap';
import {
    groupTrxsByProjectAndName,
    getTrxsByMonth,
    calculateMonthTotals,
    calculateVariableMonthTotals,
    calculateDoneMonthTotals,
    filterTrxsByDateRange
} from './trxUtils';
import {
    handleRowSelect as handleRowSelectUtil,
    handleSelectAll as handleSelectAllUtil,
    initializeSelectedRows
} from '../../components/TimeMap';

export default function TimeTrxByAssignee() {
    const navigate = useNavigate();
    const { getAllTrx, getAllTrxByAssignee, loading, error: hookError } = useTrx();
    const [trxs, setTrxs] = useState<Trx[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [nRangeMonth, setNRangeMonth] = useState<number>(1);
    const [filterType, setFilterType] = useState<'view all' | 'income' | 'expense'>('view all');
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -nRangeMonth));
    const [enYm, setEnYm] = useState(addMonths(currentYm, nRangeMonth));
    const monthRange = getMonthRange(stYm, enYm);

    // Fetch transactions using hook
    const fetchTrxs = async (assigneeId: string | null, startYm: string, endYm: string) => {
        try {
            setError(null);
            let allTrxs: Trx[];
            if (!assigneeId) {
                allTrxs = await getAllTrx();
            } else {
                allTrxs = await getAllTrxByAssignee(assigneeId);
            }
            const filtered = filterTrxsByDateRange(allTrxs, startYm, endYm);
            // setTrxs(sortRow(filtered));
            setTrxs(filtered);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        }
    };

    useEffect(() => {
        fetchTrxs(selectedAssigneeId, stYm, enYm);
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

    const groupedTrxs = groupTrxsByProjectAndName(trxs);

    // Initialize selected rows when grouped transactions change
    useEffect(() => {
        setSelectedRows(initializeSelectedRows(Object.keys(groupedTrxs), selectedRows));
    }, [Object.keys(groupedTrxs).length]);

    // Handle month range change
    const handleRangeMonthChange = (newRange: number) => {
        setNRangeMonth(newRange);
        setStYm(addMonths(currentYm, -newRange));
        setEnYm(addMonths(currentYm, newRange));
    };

    // Create memoized wrapper for getTrxsByMonth that uses monthRange from state
    const getTrxsByMonthWrapper = useCallback(
        (trxList: Trx[]) => getTrxsByMonth(trxList, monthRange),
        [monthRange]
    );

    const monthTotals = useMemo(
        () => calculateMonthTotals(groupedTrxs, selectedRows, monthRange),
        [groupedTrxs, selectedRows, monthRange]
    );

    const variableMonthTotals = useMemo(
        () => calculateVariableMonthTotals(groupedTrxs, monthRange),
        [groupedTrxs, monthRange]
    );

    const doneMonthTotals = useMemo(
        () => calculateDoneMonthTotals(groupedTrxs, monthRange),
        [groupedTrxs, monthRange]
    );

    return (
        <div className="flex flex-col gap-2 p-6 h-screen">
            <div className="flex flex-col gap-4">
                <TimeMapHeader title="Trx TimeMap By Assignee" nRangeMonth={nRangeMonth} onRangeMonthChange={handleRangeMonthChange} />
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
                        <div className="text-center py-8 text-gray-600">Loading transactions...</div>
                    ) : Object.keys(groupedTrxs).length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No transactions found for this period</div>
                    ) : (
                        <TrxTable
                            groupedTrxs={groupedTrxs}
                            monthRange={monthRange}
                            monthTotals={monthTotals}
                            variableMonthTotals={variableMonthTotals}
                            doneMonthTotals={doneMonthTotals}
                            selectedRows={selectedRows}
                            getTrxsByMonth={getTrxsByMonthWrapper}
                            onRowSelect={handleRowSelect}
                            onSelectAll={handleSelectAll}
                            onNavigateToTrx={(trxId: string) => navigate(`/finance/trx/${trxId}`)}
                            filterType={filterType}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
