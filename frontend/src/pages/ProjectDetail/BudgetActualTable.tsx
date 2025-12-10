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
import { Budget } from '@/services/budgetService';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { IconActive } from '@/components/IconActive';
import { IconType } from '@/components/IconType';
import { IconDone } from '@/components/IconDone';
import sortRow from '@/utils/sortRow';


interface BudgetTableProps {
    budgets: Budget[];
    onDelete: (budget: Budget) => void;
    onAddBudget: () => void;
    onSpawn?: (budgetIds: string[]) => void;
    onRegisterActual?: (selectedBudgets: Budget[]) => void;
}

export default function BudgetActualTable({ budgets, onDelete, onAddBudget, onSpawn, onRegisterActual }: BudgetTableProps) {
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSpawning, setIsSpawning] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
    

     // const sortedBudgets = sortRow(budgets);
    const sortedBudgets = sortRow(budgets);

    const handleSelectAll = () => {
        if (selectedIds.size === budgets.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(budgets.map(b => b._id)));
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

    const handleCloneFromBudgets = async () => {
        if (selectedIds.size === 0) return;
        
        try {
            setIsSpawning(true);
            const selectedBudgetIds = Array.from(selectedIds);
            if (onSpawn) {
                await onSpawn(selectedBudgetIds);
            }
            setSelectedIds(new Set());
        } finally {
            setIsSpawning(false);
        }
    };

    const handleRegisterActual = () => {
        if (selectedIds.size === 0) return;
        
        const selectedBudgetsList = budgets.filter(b => selectedIds.has(b._id));
        if (onRegisterActual) {
            onRegisterActual(selectedBudgetsList);
        }
    };
    if (sortedBudgets.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No events found for this project.</p>
                <Button onClick={onAddBudget} className="mt-4"> {/* Changed from handleAddTransaction to handleAddEvent */}
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Budget
                </Button>
            </div>
        );
    }

   

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-foreground font-semibold">Budget</span>
                    <ArrowRightToLine className="h-4 w-4" />
                    <span className="text-foreground font-semibold">Actual</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full ml-auto">{sortedBudgets.length}</span>
                </h2>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <Button 
                                onClick={handleRegisterActual}
                                disabled={isSpawning}
                                variant="secondary"
                                size="sm"
                            >
                                Register Actual
                            </Button>
                            <Button 
                                onClick={handleCloneFromBudgets}
                                disabled={isSpawning}
                                variant="secondary"
                                size="sm"
                            >
                                {isSpawning ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                        Cloning...
                                    </>
                                ) : (
                                    <>
                                        <Power className="h-4 w-4 mr-2" />
                                        Clone Actual ({selectedIds.size})
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                    <Button onClick={onAddBudget} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Budget
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
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === budgets.length && budgets.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4"
                                    />
                                </TableHead>
                                <TableHead><Power className="h-3 w-3 text-cyan-500" /></TableHead>
                                <TableHead className="text-right">name</TableHead>
                                <TableHead className="text-right">budget</TableHead>
                                <TableHead className="text-right">dateEx</TableHead>
                                <TableHead>updatedBy</TableHead>
                                <TableHead  className="text-center">linkActual</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedBudgets.map((budget) => (
                                <TableRow key={budget._id}>
                                    <TableCell className="w-12">
                                        <Checkbox
                                            checked={selectedIds.has(budget._id)}
                                            onCheckedChange={() => handleSelectOne(budget._id)}
                                        />
                                    </TableCell>
                                    <TableCell>{IconActive(budget.active)}</TableCell>
                                    <TableCell className="font-medium text-right">
                                        <button 
                                            onClick={() => navigate(`/finance/budget/${budget._id}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            title={`${budget.note}`}
                                        > 
                                            {budget.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-xs">
                                            <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                                            {budget.typ && IconType(budget.typ)}
                                            {IconDone(budget.done)}
                                        </div>
                                    </TableCell>
                                <TableCell className="text-right">{formatDate(budget.dateEx)}</TableCell>
                                <TableCell className="text-sm">
                                    {budget.updatedBy?.name && (
                                        <div>{budget.updatedBy.name}</div>
                                    )}
                                    {budget.updatedBy?.email && (
                                        <div className="text-xs text-muted-foreground">{budget.updatedBy.email}</div>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {budget.lActual && budget.lActual.length > 0 ? (
                                        <div className="space-y-2">
                                            {budget.lActual.map((
                                                actual: { 
                                                    _id: string; 
                                                    name: string; 
                                                    amount: number; 
                                                    typ?: string; 
                                                    done?: boolean,
                                                    assignee?: { _id: string; name: string; email: string }
                                                }
                                            ) => (
                                                <div key={actual._id} className="border-l-2 border-muted-foreground pl-2">
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <div>
                                                            <button
                                                                onClick={() => navigate(`/finance/actual/${actual._id}`)}
                                                                className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                            >
                                                                {actual.name}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 text-xs">
                                                            <span className="font-semibold">{formatCurrency(actual.amount)}</span>
                                                            {actual.typ && IconType(actual.typ)}
                                                            {IconDone(actual.done ?? false)}
                                                        </div>
                                                    </div>
                                                    {actual.assignee && (
                                                        <div className="text-xs text-muted-foreground mt-1">{actual.assignee.name} ({actual.assignee.email})</div>
                                                    )}
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
                                            setBudgetToDelete(budget);
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
                        <DialogTitle>Delete Budget</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this budget? This action cannot be undone.
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
                                if (budgetToDelete) {
                                    onDelete(budgetToDelete);
                                    setDeleteDialogOpen(false);
                                    setBudgetToDelete(null);
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
