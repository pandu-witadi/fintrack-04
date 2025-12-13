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
import { Actual } from '@/services/actualService';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { IconActive } from '@/components/IconActive';
import { IconType } from '@/components/IconType';
import { IconDone } from '@/components/IconDone';
import sortRow from '@/utils/sortRow';

interface ActualTableProps {
    actuals: Actual[];
    onDelete: (actual: Actual) => void;
    onAddActual: () => void;
    onBatchAttachToTrx?: (selectedActuals: Actual[]) => void;
    onRefreshTrx?: () => Promise<void>;
    onRefreshBudget?: () => Promise<void>;
}

export default function ActualTrxTable({ actuals, onDelete, onAddActual, onBatchAttachToTrx, onRefreshTrx, onRefreshBudget }: ActualTableProps) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actualToDelete, setActualToDelete] = useState<Actual | null>(null);
    
    const sortedActuals = sortRow(actuals);

    const handleSelectAll = () => {
        if (selectedIds.size === actuals.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(actuals.map(a => a._id)));
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

    if (sortedActuals.length === 0) {
        return (
            <div className="text-center py-8">
                {/* <p className="text-muted-foreground">No actual transactions found for this project.</p>
                <Button onClick={onAddActual} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Actual Transaction
                </Button> */}
            </div>
        );
    } else {
        return (
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-medium text-muted-foreground flex items-center gap-2">
                            <span className="text-foreground font-semibold">Actual</span>
                            <ArrowRightToLine className="h-4 w-4" />
                            <span className="text-foreground font-semibold">Trx</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{sortedActuals.length}</span>
                        </h2>
                        <div className="flex gap-2">
                            {selectedIds.size > 0 && (
                                <>
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            const selectedActuals = actuals.filter(a => selectedIds.has(a._id));
                                            onBatchAttachToTrx?.(selectedActuals);
                                        }}
                                    >
                                        Attach to Trx
                                    </Button>
                                    
                                </>
                            )}
                            {/* <Button onClick={onAddActual} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Actual
                            </Button> */}
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
                                                checked={selectedIds.size === actuals.length && actuals.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead><Power className="h-4 w-4 text-cyan-500" /></TableHead>
                                        <TableHead className="text-right">name</TableHead>
                                        <TableHead className="text-right">actual</TableHead>
                                        <TableHead className="text-right">updtBy</TableHead>
                                        <TableHead className="text-center w-36">dateEx</TableHead>
                                        <TableHead  className="text-left">assignee</TableHead>
                                        
                                        <TableHead className="text-center">linkTrx</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedActuals.map((actual) => (
                                        <TableRow 
                                            key={actual._id} 
                                            className={selectedIds.has(actual._id) ? "bg-accent" : ""}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(actual._id)}
                                                    onCheckedChange={() => handleSelectOne(actual._id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {IconActive(actual.active)}
                                            </TableCell>
                                            <TableCell className="font-medium text-right">
                                                <button
                                                    onClick={() => navigate(`/finance/actual/${actual._id}`)}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                >
                                                    {actual.name}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-xs">
                                                    <span className="font-semibold">{formatCurrency(actual.amount)}</span>
                                                    {actual.typ && IconType(actual.typ)}
                                                    {IconDone(actual.done)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {actual.updatedBy?.name && (
                                                    <div className="text-xs text-muted-foreground">{actual.updatedBy.name}</div>
                                                )}
                                                {/* {budget.updatedBy?.email && (
                                                    <div className="text-xs text-muted-foreground">{budget.updatedBy.email}</div>
                                                )} */}
                                            </TableCell>

                                            <TableCell className="text-center text=sm w-36">
                                                {formatDate(actual.dateEx)}
                                            </TableCell>
                                            <TableCell className="text-left text-sm">
                                                {actual.assignee ? (
                                                    <div>
                                                        <div className="font-text-xs text-muted-foreground">{actual.assignee.name}</div>
                                                        {/* <div className="text-xs text-muted-foreground">{actual.assignee.email}</div>     */}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        
                                            <TableCell className="text-sm min-w-fit">
                                                {actual.trx !== undefined && actual.trx !== null ? (
                                                    <div className="border-l-2 border-muted-foreground pl-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => actual.trx && navigate(`/finance/trx/${actual.trx._id}`)}
                                                                    className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate text-left"
                                                                    title={actual.trx.name}
                                                                >
                                                                    {actual.trx.name}
                                                                </button>
                                                                {actual.trx.projectName && (
                                                                    <button
                                                                        onClick={() => navigate(`/finance/project/${actual.project._id}`)}
                                                                        className="font-medium text-xs text-red-400 hover:text-blue-800 hover:underline cursor-pointer truncate text-left"
                                                                        title={actual.trx.projectName}
                                                                    >
                                                                        {actual.trx.projectName}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                                                                <span className="font-semibold">{formatCurrency(actual.trx.amount)}</span>
                                                                {actual.trx.typ && IconType(actual.trx.typ)}
                                                                {IconDone(actual.trx.done || false)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No trx</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                        setActualToDelete(actual);
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
                                <DialogTitle>Delete Actual Transaction</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this actual ? This action cannot be undone.
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
                                    onClick={async () => {
                                        if (actualToDelete) {
                                            onDelete(actualToDelete);
                                            setDeleteDialogOpen(false);
                                            setActualToDelete(null);
                                            // Refresh both TrxActualTable and BudgetActualTable after deletion
                                            if (onRefreshTrx) {
                                                await onRefreshTrx();
                                            }
                                            if (onRefreshBudget) {
                                                await onRefreshBudget();
                                            }
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
    }

   