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
    Trash2,
    ArrowRightToLine
} from 'lucide-react';
import { Actual } from '@/services/actualService';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';
import { IconType } from '@/components/IconType';
import sortRow from '@/utils/sortRow';

interface ActualTableProps {
    actuals: Actual[];
    onDelete: (actual: Actual) => void;
}

export default function ActualTable({ actuals, onDelete }: ActualTableProps) {
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
                <p className="text-muted-foreground">No actuals linked to this transaction.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-foreground font-semibold">Linked Actuals</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">{actuals.length}</span>
                </h2>
                {selectedIds.size > 0 && (
                    <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${selectedIds.size} actual(s)?`)) {
                                // Handle bulk delete if needed
                            }
                        }}
                    >
                        Delete Selected
                    </Button>
                )}
            </div>
            
            <div className="rounded-md border">
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
                            <TableHead className="text-right">project</TableHead>
                            <TableHead className="text-right">amount</TableHead>
                            <TableHead>dateEx</TableHead>
                            <TableHead>assignee</TableHead>
                            
                            {/* <TableHead className="text-center">linkTrx</TableHead> */}
                            {/* <TableHead className="text-right">Actions</TableHead> */}
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
                                 <TableCell className="font-medium text-right">
                                    <button
                                        onClick={() => navigate(`/finance/project/${actual.projectId}`)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    >
                                        {actual.projectName}
                                    </button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-xs">
                                        <span className="font-semibold">{formatCurrency(actual.amount)}</span>
                                        {IconType(actual.typ)}
                                        {IconDone(actual.done)}
                                    </div>
                                </TableCell>
                                 <TableCell>
                                    {formatDate(actual.dateEx)}
                                </TableCell>
                                <TableCell>
                                    {actual.assigneeId ? (
                                        <div>
                                            <div className="text-xs text-muted-foreground">{actual.assigneeName}</div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                               
                                {/*
                                <TableCell className="text-sm min-w-fit">
                                    {actual.trx ? (
                                        <div className="space-y-1">
                                            <div className="border-l-2 border-muted-foreground pl-2 py-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        onClick={() => navigate(`/finance/trx/${(actual.trx as any)._id}`)}
                                                        className="font-medium text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate"
                                                        title={(actual.trx as any).name}
                                                    >
                                                        {(actual.trx as any).name}
                                                    </button>
                                                    <span className="font-semibold text-xs whitespace-nowrap">{formatCurrency((actual.trx as any).amount)}</span>
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
                                        onClick={() => {
                                            setActualToDelete(actual);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell> 
                                */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Actual</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this actual? This action cannot be undone.
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
                                if (actualToDelete) {
                                    onDelete(actualToDelete);
                                    setDeleteDialogOpen(false);
                                    setActualToDelete(null);
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
