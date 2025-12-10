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
    onRegisterTrx?: (selectedActuals: any[]) => void;
}

export default function TrxActualTable({ trxs, onDelete, onAddTrx, onRegisterTrx }: TrxTableProps) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedTrxIds, setSelectedTrxIds] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [trxToDelete, setTrxToDelete] = useState<Trx | null>(null);
    
    const sortedTrxs = sortRow(trxs);

    const handleSelectAll = () => {
        if (selectedIds.size === trxs.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(trxs.map(t => t._id)));
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleRegisterTrx = () => {
        if (onRegisterTrx && selectedIds.size > 0) {
            const selectedTrxs = trxs.filter(t => selectedIds.has(t._id));
            onRegisterTrx(selectedTrxs);
            setSelectedIds(new Set());
        }
    };

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
                    {selectedIds.size > 0 && (
                        <>
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={handleRegisterTrx}
                            >
                                Register Selected
                            </Button>
                            <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} transaction(s)?`)) {
                                        // Handle bulk delete if needed
                                    }
                                }}
                            >
                                Delete Selected
                            </Button>
                        </>
                    )}
                    <Button onClick={onAddTrx} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>
            
            <div className="rounded-md border">
                 <div className="text-sm text-muted-foreground">
                    {/* Total rows: <span className="font-semibold">{budgets.length}</span> */}
                    {selectedIds.size > 0 && (
                        <span className="ml-3">Selected: <span className="font-semibold">{selectedIds.size}</span></span>
                    )}
                </div>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedIds.size === trxs.length && trxs.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead><Power className="h-4 w-4 text-cyan-500" /></TableHead>
                                <TableHead className="text-right">name</TableHead>
                                <TableHead className="text-right">amount</TableHead>
                                <TableHead className="text-right">assignee</TableHead>
                                <TableHead>dateEx</TableHead>
                                <TableHead className="text-center">linkActual</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTrxs.map((trx) => (
                                <TableRow 
                                    key={trx._id} 
                                    className={selectedIds.has(trx._id) ? "bg-accent" : ""}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(trx._id)}
                                            onCheckedChange={() => handleSelectOne(trx._id)}
                                        />
                                    </TableCell>
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
                                    <TableCell className="text-right">
                                        {trx.assignee ? (
                                            <div>
                                                <div className="font-medium">{trx.assignee.name}</div>
                                                <div className="text-xs text-muted-foreground">{trx.assignee.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(trx.dateEx)}
                                    </TableCell>
                                    <TableCell className="text-sm min-w-fit">
                                        {trx.lActual && trx.lActual.length > 0 ? (
                                            <div className="space-y-1">
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
                                                            <span className="font-semibold text-xs whitespace-nowrap">{formatCurrency(actual.amount)}</span>
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
