import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Budget } from '../../services/budgetService';
import { useBudget } from '../../hooks/useBudget';
import { useNavigate } from 'react-router-dom';
import sortRow from '../../utils/sortRow';
import { TimeMapHeader, TimeMapMonthNavigation } from '../../components/TimeMap';
import { BudgetTable } from './BudgetTable';
import {
    formatYearMonth,
    addMonths,
    getCurrentYearMonth,
    getMonthRange
} from '../../components/TimeMap';
import {
    groupBudgetsByProjectAndName,
    getBudgetsByMonth,
    calculateMonthTotals,
    calculateVariableMonthTotals,
    filterBudgetsByDateRange
} from './budgetUtils';
import {
    handleRowSelect as handleRowSelectUtil,
    handleSelectAll as handleSelectAllUtil,
    initializeSelectedRows
} from '../../components/TimeMap';

export default function TimeBudget() {
    const navigate = useNavigate();
    const { getAllBudget, loading, error: hookError } = useBudget();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [nRangeMonth, setNRangeMonth] = useState<number>(2);

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -nRangeMonth));
    const [enYm, setEnYm] = useState(addMonths(currentYm, nRangeMonth));
    const monthRange = getMonthRange(stYm, enYm);

    // Fetch budgets using hook
    const fetchBudgets = async (startYm: string, endYm: string) => {
        try {
            setError(null);
            const allBudgets = await getAllBudget();
            const filtered = filterBudgetsByDateRange(allBudgets, startYm, endYm);
            setBudgets(sortRow(filtered));
        } catch (err) {
            console.error('Error fetching budgets:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
        }
    };

    useEffect(() => {
        fetchBudgets(stYm, enYm);
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

    const groupedBudgets = groupBudgetsByProjectAndName(budgets);

    // Initialize selected rows when grouped budgets change
    useEffect(() => {
        setSelectedRows(initializeSelectedRows(Object.keys(groupedBudgets), selectedRows));
    }, [Object.keys(groupedBudgets).length]);

    // Handle month range change
    const handleRangeMonthChange = (newRange: number) => {
        setNRangeMonth(newRange);
        setStYm(addMonths(currentYm, -newRange));
        setEnYm(addMonths(currentYm, newRange));
    };

    // Create a wrapper for getBudgetsByMonth that uses monthRange from state
    const getBudgetsByMonthWrapper = (budgetList: Budget[]) => {
        return getBudgetsByMonth(budgetList, monthRange);
    };

    const monthTotals = calculateMonthTotals(groupedBudgets, selectedRows, monthRange);
    const variableMonthTotals = calculateVariableMonthTotals(groupedBudgets, monthRange);

    return (
        <div className="flex flex-col gap-2 p-6 h-screen">
            <TimeMapHeader title="Budget TimeMap" nRangeMonth={nRangeMonth} onRangeMonthChange={handleRangeMonthChange} />

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
                        <div className="text-center py-8 text-gray-600">Loading budgets...</div>
                    ) : Object.keys(groupedBudgets).length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No budgets found for this period</div>
                    ) : (
                        <BudgetTable
                            groupedBudgets={groupedBudgets}
                            monthRange={monthRange}
                            monthTotals={monthTotals}
                            variableMonthTotals={variableMonthTotals}
                            selectedRows={selectedRows}
                            getBudgetsByMonth={getBudgetsByMonthWrapper}
                            onRowSelect={handleRowSelect}
                            onSelectAll={handleSelectAll}
                            onNavigateToBudget={(budgetId: string) => navigate(`/finance/budget/${budgetId}`)}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
