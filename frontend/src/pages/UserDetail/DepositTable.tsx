import { Plus, Wallet, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DepositTrx } from '@/services/userService';
import { format } from 'date-fns';
import formatCurrency from '@/utils/formatCurrency';

interface DepositTableProps {
    deposits?: DepositTrx[];
    total?: number;
    depositSort: { key: 'date' | 'amount'; direction: 'asc' | 'desc' } | null;
    onSort: (key: 'date' | 'amount') => void;
    onAdd: () => void;
    onEdit: (trx: DepositTrx) => void;
    onDelete: (trx: DepositTrx) => void;
}

export default function DepositTable({
    deposits,
    total,
    depositSort,
    onSort,
    onAdd,
    onEdit,
    onDelete,
}: DepositTableProps) {
    const getSortedDeposits = (deposits: DepositTrx[]): DepositTrx[] => {
        if (!depositSort) return deposits;
        const sorted = [...deposits];
        sorted.sort((a, b) => {
            if (depositSort.key === 'date') {
                const aDate = a.date ? new Date(a.date).getTime() : 0;
                const bDate = b.date ? new Date(b.date).getTime() : 0;
                return depositSort.direction === 'asc' ? aDate - bDate : bDate - aDate;
            }
            if (depositSort.key === 'amount') {
                return depositSort.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            return 0;
        });
        return sorted;
    };

    const displayTotal = total || (deposits || []).reduce((sum, d) => sum + d.amount, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Deposit
                        </CardTitle>
                        <CardDescription>Deposit information for this user</CardDescription>
                    </div>
                    <Button onClick={onAdd} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deposit
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Total */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="text-sm text-muted-foreground">Total Deposit</div>
                        <div className="text-xl font-bold">
                            {formatCurrency(displayTotal)}
                        </div>
                    </div>

                    {/* Detail Table */}
                    {(deposits?.length || 0) > 0 ? (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">No.</th>
                                        <th
                                            className="h-10 px-4 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                                            onClick={() => onSort('date')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Date
                                                {depositSort?.key === 'date' && (
                                                    depositSort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="h-10 px-4 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                                            onClick={() => onSort('amount')}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                Amount
                                                {depositSort?.key === 'amount' && (
                                                    depositSort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Note</th>
                                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getSortedDeposits(deposits || []).map((trx: DepositTrx, index: number) => (
                                        <tr key={trx._id || index} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                            <td className="px-4 py-3">{trx.date ? format(new Date(trx.date), 'yyyy-MM-dd') : 'N/A'}</td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(trx.amount)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{trx.note || '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => onEdit(trx)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => onDelete(trx)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No deposit transactions yet
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
