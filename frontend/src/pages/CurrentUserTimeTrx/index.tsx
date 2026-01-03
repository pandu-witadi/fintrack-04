import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Trx } from '../../services/trxService';
import formatCurrency from '../../utils/formatCurrency';
import { IconDone } from '../../components/IconDone';
import { IconType } from '../../components/IconType';
import { useTrx } from '../../hooks/useTrx';
import { useAuth } from '../../context/AuthContext';
import sortRow from '../../utils/sortRow';
import { Link2 } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { TimeMapHeader, TimeMapMonthNavigation } from '../../components/TimeMap';
import {
    addMonths,
    getCurrentYearMonth,
    getMonthRange,
    getYearMonthFromDate
} from '../../components/TimeMap';
import {
    handleRowSelect as handleRowSelectUtil,
    handleSelectAll as handleSelectAllUtil,
    initializeSelectedRows,
    isAllRowsSelected
} from '../../components/TimeMap';


export default function CurrentUserTimeTrx() {
    const { user } = useAuth();
    const { getAllTrxByAssignee, loading, error: hookError } = useTrx();
    const [trxs, setTrxs] = useState<Trx[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const [nRangeMonth, setNRangeMonth] = useState<number>(2);

    const currentYm = getCurrentYearMonth();
    const [stYm, setStYm] = useState(addMonths(currentYm, -nRangeMonth));
    const [enYm, setEnYm] = useState(addMonths(currentYm, nRangeMonth));
    const monthRange = getMonthRange(stYm, enYm);

    // Fetch trxs for current user using hook
    const fetchTrxs = async (startYm: string, endYm: string) => {
        try {
            setError(null);
            if (!user?._id) {
                setError('User not authenticated');
                return;
            }
            const allTrxs = await getAllTrxByAssignee(user._id);
            // Filter trxs by date range
            const filtered = allTrxs.filter((trx: Trx) => {
                const trxYm = getYearMonthFromDate(trx.dateEx);
                return trxYm >= startYm && trxYm <= endYm;
            });
            setTrxs(sortRow(filtered));
        } catch (err) {
            console.error('Error fetching trxs:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch trxs');
        }
    };

    useEffect(() => {
        fetchTrxs(stYm, enYm);
    }, [stYm, enYm, user?._id]);

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

    // Handle month range change
    const handleRangeMonthChange = (newRange: number) => {
        setNRangeMonth(newRange);
        setStYm(addMonths(currentYm, -newRange));
        setEnYm(addMonths(currentYm, newRange));
    };

    // Group trxs by project and name
    const groupedTrxs = trxs.reduce((acc: Record<string, { trxName: string; project: string; projectId: string; trxs: Trx[] }>, trx) => {
        const projectId = typeof trx.project === 'string' ? trx.project : (trx.project as any)?._id || 'Unknown';
        const projectName = typeof trx.project === 'string' ? trx.project : (trx.project as any)?.name || 'Unknown';
        const key = `${trx.name}-${projectId}`;
        if (!acc[key]) {
            acc[key] = {
                trxName: trx.name,
                project: projectName,
                projectId: projectId,
                trxs: []
            };
        }
        acc[key].trxs.push(trx);
        return acc;
    }, {});

    // Initialize selected rows when grouped trxs change
    useEffect(() => {
        setSelectedRows(initializeSelectedRows(Object.keys(groupedTrxs), selectedRows));
    }, [Object.keys(groupedTrxs).length]);

    // Calculate month metrics (total, done, selectable amounts)
    const getMonthMetrics = (month: string) => {
        let totalAmount = 0;
        let doneAmount = 0;
        let selectableAmount = 0;

        Object.entries(groupedTrxs).forEach(([key, group]) => {
            group.trxs.forEach((trx: Trx) => {
                if (trx.dateEx) {
                    const trxYm = getYearMonthFromDate(trx.dateEx);
                    if (trxYm === month) {
                        const amount = trx.amount || 0;
                        totalAmount += amount;
                        if (trx.done) {
                            doneAmount += amount;
                        }
                        if (selectedRows[key]) {
                            selectableAmount += amount;
                        }
                    }
                }
            });
        });

        return { totalAmount, doneAmount, selectableAmount };
    };

    // Extract month from dateEx and return amount info
    // Aggregates all trxs in the same month (sums amounts, checks done status)
    const getTrxsByMonth = (trxList: Trx[]): { [key: string]: { amount: number; done: boolean; typ: string } } => {
        const result: { [key: string]: { amount: number; done: boolean; typ: string } } = {};
        trxList.forEach((trx: Trx) => {
            if (trx.dateEx) {
                const trxYm = getYearMonthFromDate(trx.dateEx);
                if (monthRange.includes(trxYm)) {
                    if (!result[trxYm]) {
                        result[trxYm] = {
                            amount: 0,
                            done: false,
                            typ: trx.typ || 'expense'
                        };
                    }
                    // Sum amounts
                    result[trxYm].amount += trx.amount || 0;
                    // Mark as done if ANY trx in this month is done
                    if (trx.done) {
                        result[trxYm].done = true;
                    }
                }
            }
        });
        return result;
    };

    return (
        <div className="flex flex-col gap-2 p-6 h-screen">
            <TimeMapHeader title="My Assigned Transactions" nRangeMonth={nRangeMonth} onRangeMonthChange={handleRangeMonthChange} />

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

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-600">Loading transactions...</div>
                    ) : Object.keys(groupedTrxs).length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No transactions assigned to you for this period</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllRowsSelected(selectedRows)}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 cursor-pointer"
                                                    title="Select all rows"
                                                />
                                                <span>Transaction</span>
                                            </div>
                                        </th>
                                        {monthRange.map(month => {
                                            const metrics = getMonthMetrics(month);
                                            return (
                                                <th
                                                    key={month}
                                                    className="text-right py-3 px-3 font-semibold text-gray-700 bg-gray-50 min-w-[140px]"
                                                >
                                                    <div className="text-sm font-semibold">{month}</div>
                                                    <div className="text-xs text-gray-800 font-semibold mt-1">{formatCurrency(metrics.totalAmount)}</div>
                                                    <div className="text-xs text-green-600 font-normal">{formatCurrency(metrics.doneAmount)}</div>
                                                    <div className="text-xs text-blue-600 font-normal">{formatCurrency(metrics.selectableAmount)}</div>
                                                </th>
                                            );
                                        })}
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
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-blue-600 hover:text-blue-800 hover:underline text-left font-medium">{group.trxName}</div>
                                                            <div className="text-gray-600 hover:text-gray-800 hover:underline text-left text-sm">{group.project}</div>
                                                            
                                                        </div>
                                                    </div>
                                                </td>
                                                {monthRange.map(month => {
                                                    const monthData = monthStatus[month];
                                                    return (
                                                        <td key={`${key}-${month}`} className="text-right py-2 px-2">
                                                            {monthData ? (
                                                                <div className="flex flex-col gap-1 text-right text-xs">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <span>{formatCurrency(monthData.amount)}</span>
                                                                        <div>{IconType(monthData.typ)}</div>
                                                                        <div>{IconDone(monthData.done)}</div>
                                                                    </div>
                                                                    {group.trxs[0]?.img && (
                                                                        <div className="flex items-center justify-end">
                                                                            <a
                                                                                href={uploadService.viewImage(group.trxs[0].img)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-500 hover:text-blue-700 transition-colors inline-block"
                                                                                title="View transaction image"
                                                                            >
                                                                                <Link2 className="h-3 w-3" />
                                                                            </a>
                                                                        </div>
                                                                    )}
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
        </div>
    );
}
