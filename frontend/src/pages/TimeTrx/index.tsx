import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, Eye, LayoutGrid, Download } from 'lucide-react';
import { Trx } from '../../services/trxService';
import formatCurrency from '../../utils/formatCurrency';
import { IconDone } from '../../components/IconDone';
import { IconType } from '../../components/IconType';
import { useTrx } from '../../hooks/useTrx';
import { useNavigate } from 'react-router-dom';
import sortRow from '../../utils/sortRow';
import { ArrowRight } from 'lucide-react';


const formatYearMonth = (year: number, month: number): string => {
    return `${year}-${String(month).padStart(2, '0')}`;
};

const parseYearMonth = (ym: string): { year: number; month: number } => {
    const [year, month] = ym.split('-').map(Number);
    return { year, month };
};

const addMonths = (ym: string, months: number): string => {
    const { year, month } = parseYearMonth(ym);
    let newMonth = month + months;
    let newYear = year;
    while (newMonth > 12) {
        newMonth -= 12;
        newYear++;
    }
    while (newMonth < 1) {
        newMonth += 12;
        newYear--;
    }
    return formatYearMonth(newYear, newMonth);
};

export default function TimeTrx() {
    const navigate = useNavigate();
    const { getAllTrx, loading, error: hookError } = useTrx();
    const [trxs, setTrxs] = useState<Trx[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    
    // Calculate default date range: current month - 2 to current month + 2
    const getCurrentYearMonth = (): string => {
        const now = new Date();
        return formatYearMonth(now.getFullYear(), now.getMonth() + 1);
    };

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -2));
    const [enYm, setEnYm] = useState(addMonths(currentYm, 2));

    // Generate month headers
    const getMonthRange = (start: string, end: string): string[] => {
        const months: string[] = [];
        let current = start;
        while (current <= end) {
            months.push(current);
            current = addMonths(current, 1);
        }
        return months;
    };

    const monthRange = getMonthRange(stYm, enYm);

    // Fetch transactions using hook
    const fetchTrxs = async (startYm: string, endYm: string) => {
        try {
            setError(null);
            const allTrxs = await getAllTrx();
            // Filter transactions by date range
            const filtered = allTrxs.filter((trx: Trx) => {
                const trxYm = new Date(trx.dateEx).toISOString().substring(0, 7);
                return trxYm >= startYm && trxYm <= endYm;
            });
            setTrxs(sortRow(filtered));
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        }
    };

    useEffect(() => {
        fetchTrxs(stYm, enYm);
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
        setSelectedRows(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectAll = () => {
        const allSelected = Object.values(selectedRows).every(v => v);
        const newSelected: Record<string, boolean> = {};
        Object.keys(selectedRows).forEach(key => {
            newSelected[key] = !allSelected;
        });
        setSelectedRows(newSelected);
    };

    // Group transactions by project and name
    const groupedTrxs = trxs.reduce((acc: Record<string, { trxName: string; project: string; trxs: Trx[] }>, trx) => {
        const projectId = typeof trx.project === 'string' ? trx.project : (trx.project as any)?._id || 'Unknown';
        const projectName = typeof trx.project === 'string' ? trx.project : (trx.project as any)?.name || 'Unknown';
        const key = `${trx.name}-${projectId}`;
        if (!acc[key]) {
            acc[key] = {
                trxName: trx.name,
                project: projectName,
                trxs: []
            };
        }
        acc[key].trxs.push(trx);
        return acc;
    }, {});

    // Initialize selected rows when grouped transactions change
    useEffect(() => {
        const newSelectedRows: Record<string, boolean> = {};
        Object.keys(groupedTrxs).forEach((key: string) => {
            if (!(key in selectedRows)) {
                newSelectedRows[key] = true; // Default to selected
            } else {
                newSelectedRows[key] = selectedRows[key];
            }
        });
        setSelectedRows(newSelectedRows);
    }, [Object.keys(groupedTrxs).length]);

    // Extract month from dateEx and return amount info
    const getTrxsByMonth = (trxList: Trx[]): { [key: string]: { amount: number; done: boolean; typ: string } } => {
        const result: { [key: string]: { amount: number; done: boolean; typ: string } } = {};
        trxList.forEach((trx: Trx) => {
            if (trx.dateEx) {
                const trxYm = new Date(trx.dateEx).toISOString().substring(0, 7);
                if (monthRange.includes(trxYm)) {
                    result[trxYm] = {
                        amount: trx.amount || 0,
                        done: trx.done || false,
                        typ: trx.typ || 'expense'
                    };
                }
            }
        });
        return result;
    };

    // Calculate total amount for each month (only for selected rows)
    // Formula: total = total income - total expense
    const getMonthTotals = (): { [key: string]: number } => {
        const totals: { [key: string]: number } = {};
        monthRange.forEach((month: string) => {
            totals[month] = 0;
        });
        Object.entries(groupedTrxs).forEach(([key, group]: [string, { trxName: string; project: string; trxs: Trx[] }]) => {
            // Only include this group if selected
            if (selectedRows[key]) {
                const monthData = getTrxsByMonth(group.trxs);
                Object.entries(monthData).forEach(([month, data]: [string, { amount: number; done: boolean; typ: string }]) => {
                    if (data.typ === 'income') {
                        totals[month] += data.amount;
                    } else {
                        totals[month] -= data.amount;
                    }
                });
            }
        });
        return totals;
    };

    const monthTotals = getMonthTotals();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transaction Tracker</h1>
                    {/* <p className="text-gray-600 mt-2">Track the status of all project transactions across different months.</p> */}
                </div>
            </div>

            <Card>
                <CardContent>
                    {error || hookError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                            {error || hookError}
                        </div>
                    )}

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
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
                            onClick={handleNext}
                            className="flex items-center gap-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-600">Loading transactions...</div>
                    ) : Object.keys(groupedTrxs).length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No transactions found for this period</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Object.values(selectedRows).length > 0 && Object.values(selectedRows).every(v => v)}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 cursor-pointer"
                                                    title="Select all rows"
                                                />
                                                <span>Transaction Name</span>
                                            </div>
                                        </th>
                                        {monthRange.map(month => (
                                            <th
                                                key={month}
                                                className="text-right py-3 px-3 font-semibold text-gray-700 bg-gray-50 min-w-[120px]"
                                            >
                                                <div className="text-sm">{month}</div>
                                                <div className="text-xs text-gray-500 font-normal mt-1">{formatCurrency(monthTotals[month])}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedTrxs).map(([key, group]) => {
                                        const monthStatus = getTrxsByMonth(group.trxs);
                                        return (
                                            <tr key={key} className={`border-b border-gray-200 ${selectedRows[key] ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                                                <td className="py-2 px-3 font-medium text-gray-900 bg-white sticky left-0 z-10">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows[key] || false}
                                                            onChange={() => handleRowSelect(key)}
                                                            className="rounded border-gray-300 cursor-pointer"
                                                        />
                                                        <button onClick={() => navigate(`/finance/trx/${group.trxs[0]._id}`)} className="text-cyan-700 hover:text-blue-800 hover:underline cursor-pointer whitespace-nowrap" title={`View transaction: ${group.trxName}`}>{group.project} <ArrowRight className="h-3 w-3 inline" /> {group.trxName}</button>
                                                    </div>
                                                </td>
                                                {monthRange.map(month => {
                                                    const monthData = monthStatus[month];
                                                    return (
                                                        <td key={`${key}-${month}`} className="text-right py-2 px-2">
                                                            {monthData ? (
                                                                <div className="flex items-center justify-end gap-1 text-xs">
                                                                    <span className="font-semibold text-gray-800">{formatCurrency(monthData.amount)}</span>
                                                                    <div>{IconType(monthData.typ)}</div>
                                                                    <div>{IconDone(monthData.done)}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
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
        </div>
    );
}
