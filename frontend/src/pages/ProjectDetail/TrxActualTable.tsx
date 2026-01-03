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
    Link2,
    ArrowRightToLine,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Trx } from '@/services/trxService';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { IconActive } from '@/components/IconActive';
import { IconType } from '@/components/IconType';
import { IconDone } from '@/components/IconDone';
import sortRow from '@/utils/sortRow';
import { uploadService } from '@/services/uploadService';
interface TrxTableProps {
    trxs: Trx[];
    onDelete: (trx: Trx) => void;
    onAddTrx: () => void;
    onRegisterTrx: (selectedActuals: any[]) => void;
    onBatchAttachToActual?: (selectedTrxs: Trx[]) => void;
}

export default function TrxActualTable({ trxs, onDelete, onAddTrx, onRegisterTrx, onBatchAttachToActual }: TrxTableProps) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [trxToDelete, setTrxToDelete] = useState<Trx | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'dateEx' | 'assignee'; direction: 'asc' | 'desc' } | null>(null);

    const applySorting = (items: Trx[], config: typeof sortConfig) => {
        if (!config) return items;
        
        const sorted = [...items].sort((a, b) => {
            if (config.key === 'dateEx') {
                const dateA = new Date(a.dateEx).getTime();
                const dateB = new Date(b.dateEx).getTime();
                return config.direction === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (config.key === 'assignee') {
                const nameA = a.assignee?.name || '';
                const nameB = b.assignee?.name || '';
                const comparison = nameA.localeCompare(nameB);
                return config.direction === 'asc' ? comparison : -comparison;
            }
            return 0;
        });
        return sorted;
    };
    
    const sortedTrxs = applySorting(sortRow(trxs), sortConfig);

    const handleSort = (key: 'dateEx' | 'assignee') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIndicator = (columnKey: 'dateEx' | 'assignee') => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="h-4 w-4 ml-1 inline" />
            : <ArrowDown className="h-4 w-4 ml-1 inline" />;
    };

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

    const calculateSelectedSum = () => {
        const selectedTrxsList = Array.from(selectedIds)
            .map(id => trxs.find(t => t._id === id))
            .filter((t): t is Trx => t !== undefined);
        const incomeSum = selectedTrxsList
            .filter(t => t.typ === 'income')
            .reduce((sum, t) => sum + (t.actAmount || 0), 0);
        const expenseSum = selectedTrxsList
            .filter(t => t.typ === 'expense')
            .reduce((sum, t) => sum + (t.actAmount || 0), 0);
        return incomeSum - expenseSum;
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
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">{sortedTrxs.length}</span>
                    {selectedIds.size > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                            Sum: {formatCurrency(calculateSelectedSum())}
                        </span>
                    )}
                </h2>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && onBatchAttachToActual && (
                        <Button 
                            onClick={() => {
                                const selectedTrxsList = trxs.filter(t => selectedIds.has(t._id));
                                onBatchAttachToActual(selectedTrxsList);
                            }}
                            variant="secondary"
                            size="sm"
                        >
                            Attach to Actual
                        </Button>
                    )}
                    <Button onClick={onAddTrx} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>
            
            <div className="rounded-md border">
                <div className="text-sm text-muted-foreground">
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
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead><Power className="h-4 w-4 text-cyan-500" /></TableHead>
                                <TableHead className="text-right">name</TableHead>
                                <TableHead className="text-right">amount</TableHead>
                                <TableHead className="text-right">updtBy</TableHead>
                                <TableHead className="text-center w-36">
                                    <button 
                                        onClick={() => handleSort('dateEx')}
                                        className="flex items-center justify-center gap-1 hover:text-blue-600 cursor-pointer w-full"
                                    >
                                        dateEx
                                        {renderSortIndicator('dateEx')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-left">
                                    <button 
                                        onClick={() => handleSort('assignee')}
                                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                    >
                                        assignee
                                        {renderSortIndicator('assignee')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-center">linkActual</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTrxs.map((trx, index) => (
                                <TableRow 
                                    key={trx._id}
                                    className={selectedIds.has(trx._id) ? "bg-accent" : ""}
                                >
                                    <TableCell className="w-12">
                                        <Checkbox
                                            checked={selectedIds.has(trx._id)}
                                            onCheckedChange={() => handleSelectOne(trx._id)}
                                        />
                                    </TableCell>
                                    <TableCell className="w-12 text-center text-sm font-medium text-muted-foreground">{index + 1}</TableCell>
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
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-end gap-1 text-xs">
                                                {trx.actAmount && (
                                                    <span className="font-semibold">{formatCurrency(trx.actAmount)}</span>
                                                )}
                                                {trx.typ && IconType(trx.typ)}
                                                {IconDone(trx.done)}      
                                            </div>
                                            <div className="flex items-center justify-end gap-1 text-xs">
                                                {!trx.isEq && trx.amount && (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                                        <span className="font-semibold">{formatCurrency(trx.amount)}</span>
                                                    </div>
                                                )}
                                                {trx.img && (
                                                    <a
                                                        href={uploadService.viewImage(trx.img)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:text-blue-700 transition-colors inline-block"
                                                        title="View transaction image"
                                                    >
                                                        <Link2 className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
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
