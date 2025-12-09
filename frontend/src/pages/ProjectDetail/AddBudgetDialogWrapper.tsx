import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddBudgetDialog from './AddBudgetDialog';

interface AddBudgetDialogWrapperProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

export function AddBudgetDialogWrapper({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: AddBudgetDialogWrapperProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Budget</DialogTitle>
                </DialogHeader>
                <AddBudgetDialog
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}