import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface DepositDialogsProps {
    userName?: string;
    isAddOpen: boolean;
    onAddOpenChange: (open: boolean) => void;
    isEditOpen: boolean;
    onEditOpenChange: (open: boolean) => void;
    isDeleteOpen: boolean;
    onDeleteOpenChange: (open: boolean) => void;
    newDeposit: { amount: number; date: string; note: string };
    onNewDepositChange: (value: { amount: number; date: string; note: string }) => void;
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isSubmitting: boolean;
}

export default function DepositDialogs({
    userName,
    isAddOpen,
    onAddOpenChange,
    isEditOpen,
    onEditOpenChange,
    isDeleteOpen,
    onDeleteOpenChange,
    newDeposit,
    onNewDepositChange,
    onAdd,
    onEdit,
    onDelete,
    isSubmitting,
}: DepositDialogsProps) {
    return (
        <>
            {/* Add Deposit Dialog */}
            <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Deposit</DialogTitle>
                        <DialogDescription>
                            Add a new deposit transaction for {userName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="depositAmount">Amount</Label>
                            <Input
                                id="depositAmount"
                                type="number"
                                value={newDeposit.amount || ''}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, amount: Number(e.target.value) })}
                                placeholder="Enter deposit amount"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depositDate">Date</Label>
                            <Input
                                id="depositDate"
                                type="date"
                                value={newDeposit.date}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depositNote">Note</Label>
                            <Textarea
                                id="depositNote"
                                value={newDeposit.note}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, note: e.target.value })}
                                placeholder="Optional note for this deposit"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onAddOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={onAdd} disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Deposit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Deposit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Deposit</DialogTitle>
                        <DialogDescription>
                            Update deposit transaction for {userName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editDepositAmount">Amount</Label>
                            <Input
                                id="editDepositAmount"
                                type="number"
                                value={newDeposit.amount || ''}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, amount: Number(e.target.value) })}
                                placeholder="Enter deposit amount"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDepositDate">Date</Label>
                            <Input
                                id="editDepositDate"
                                type="date"
                                value={newDeposit.date}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDepositNote">Note</Label>
                            <Textarea
                                id="editDepositNote"
                                value={newDeposit.note}
                                onChange={(e) => onNewDepositChange({ ...newDeposit, note: e.target.value })}
                                placeholder="Optional note for this deposit"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onEditOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={onEdit} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Deposit Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this deposit transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onDeleteOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onDelete} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
