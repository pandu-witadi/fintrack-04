/**
 * Transaction table component for TimeTrx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';
import { IconDone } from '../../components/IconDone';
import { IconType } from '../../components/IconType';
import { GroupedTrxs, TrxsByMonth, MonthTotals, SelectedRows } from './types';

interface TrxTableProps {
    groupedTrxs: GroupedTrxs;
    monthRange: string[];
    monthTotals: MonthTotals;
    variableMonthTotals: MonthTotals;
    selectedRows: SelectedRows;
    getTrxsByMonth: (trxList: any[]) => TrxsByMonth;
    onRowSelect: (key: string) => void;
    onSelectAll: () => void;
    onNavigateToTrx: (trxId: string) => void;
}

export const TrxTable: React.FC<TrxTableProps> = ({
    groupedTrxs,
    monthRange,
    monthTotals,
    variableMonthTotals,
    selectedRows,
    getTrxsByMonth,
    onRowSelect,
    onSelectAll,
    onNavigateToTrx
}) => {
    const navigate = useNavigate();
    const isAllSelected = Object.values(selectedRows).length > 0 && Object.values(selectedRows).every(v => v);

    return (
        <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
            <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={onSelectAll}
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
                                <div className="text-xs text-cyan-700 font-normal mt-1">{formatCurrency(variableMonthTotals[month])}</div>
                                <div className="text-xs text-gray-500 font-normal">{formatCurrency(monthTotals[month])}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groupedTrxs).map(([key, group]) => {
                        const monthStatus = getTrxsByMonth(group.items);
                        return (
                            <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-2 px-3 font-medium text-gray-900 bg-white sticky left-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows[key] || false}
                                            onChange={() => onRowSelect(key)}
                                            className="rounded border-gray-300 cursor-pointer"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => navigate(`/finance/trx/${group.id}`)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-left font-medium"
                                                title={`Transaction: ${group.name}`}
                                            >
                                                {group.name}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/finance/project/${group.projectId}`)}
                                                className="text-gray-600 hover:text-gray-800 hover:underline text-left text-sm"
                                                title={`Project: ${group.project}`}
                                            >
                                                {group.project}
                                            </button>
                                        </div>
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
    );
};
