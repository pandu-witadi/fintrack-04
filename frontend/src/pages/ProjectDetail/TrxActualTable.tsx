import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { 
    Power, 
    MoreHorizontal, 
    Plus, 
    Trash2,
    Eye,
        ArrowRightToLine
} from 'lucide-react';
import { Trx } from '@/services/trxService';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { IconActive } from '@/components/IconActive';
import { IconType } from '@/components/IconType';
import { IconDone } from '@/components/IconDone';
import sortRow from '@/utils/sortRow';

interface TrxTableProps {
    trxs: Trx[];
    onDelete: (trx: Trx) => void;
    onAddTrx: () => void;
    onRegisterTrx: (selectedActuals: any[]) => void;
}

export default function TrxActualTable({ trxs, onDelete, onAddTrx, onRegisterTrx }: TrxTableProps) {
    const navigate = useNavigate();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [trxToDelete, setTrxToDelete] = useState<Trx | null>(null);
    
    const sortedTrxs = sortRow(trxs);

    if (sortedTrxs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found for this project.</p>
                <Button onClick={onAddTrx} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Transaction
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-foreground font-semibold">Trx</span>
                    <ArrowRightToLine className="h-4 w-4" />
                    <span className="text-foreground font-semibold">Actual</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{sortedTrxs.length}</span>
                </h2>
                <div className="flex gap-2">
                    <Button onClick={onAddTrx} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>
            
            <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Power className="h-4 w-4 text-cyan-500" /></TableHead>
                                <TableHead className="text-right">name</TableHead>
                                <TableHead className="text-right">amount</TableHead>
                                <TableHead className="text-right">updtBy</TableHead>
                                <TableHead className="text-center w-36">dateEx</TableHead>
                                <TableHead  className="text-left">assignee</TableHead>
                                <TableHead className="text-center">linkActual</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTrxs.map((trx) => (
                                <TableRow 
                                    key={trx._id}
                                >
                                    <TableCell>
                                        {IconActive(trx.active)}
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                        <button
                                            onClick={() => navigate(`/finance/trx/${trx._id}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                        >
                                            {trx.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-xs">
                                            <span className="font-semibold">{formatCurrency(trx.amount)}</span>
                                            {trx.typ && IconType(trx.typ)}
                                            {IconDone(trx.done)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {trx.updatedBy && trx.updatedBy.name ? (
                                            <div className="text-xs">{trx.updatedBy.name}</div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text=sm w-36">
                                        {formatDate(trx.dateEx)}
                                    </TableCell>
                                    <TableCell className="text-left text-sm">
                                        {trx.assignee ? (
                                            <div>
                                                <div className="font-text-xs text-muted-foreground">{trx.assignee.name}</div>
                                                {/* <div className="text-xs text-muted-foreground">{trx.assignee.email}</div> */}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    
                                    <TableCell className="text-sm min-w-fit">
                                        {trx.lActual && trx.lActual.length > 0 ? (
                                            <div className="space-y-4">
                                                {trx.lActual.map((actual: { _id: string; name: string; amount: number; typ?: string; done?: boolean; projectId?: string; projectName?: string }) => (
                                                    <div key={actual._id} className="border-l-2 border-muted-foreground pl-2 py-0.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => navigate(`/finance/actual/${actual._id}`)}
                                                                    className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate text-left"
                                                                    title={actual.name}
                                                                >
                                                                    {actual.name}
                                                                </button>
                                                                {actual.projectName && (
                                                                    <button
                                                                        onClick={() => navigate(`/finance/project/${actual.projectId}`)}
                                                                        className="font-medium text-xs text-red-400 hover:text-blue-800 hover:underline cursor-pointer truncate text-left"
                                                                        title={actual.projectName}
                                                                    >
                                                                        {actual.projectName}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-end gap-1 text-xs">
                                                                <span className="font-semibold">{formatCurrency(actual.amount)}</span>
                                                                {actual.typ && IconType(actual.typ)}
                                                                {IconDone(actual.done ?? false)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No actuals</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setTrxToDelete(trx);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
            </div>
            
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (trxToDelete) {
                                    onDelete(trxToDelete);
                                    setDeleteDialogOpen(false);
                                    setTrxToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
