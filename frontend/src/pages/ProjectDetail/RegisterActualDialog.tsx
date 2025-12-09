import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget } from '@/services/budgetService.ts';

interface RegisterActualDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBudgets: Budget[];
    onSubmit: (budgetId: string, actualData: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function RegisterActualDialog({
    open,
    onOpenChange,
    selectedBudgets,
    onSubmit,
    isSubmitting,
}: RegisterActualDialogProps) {
    const [currentBudgetIndex, setCurrentBudgetIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const currentBudget = selectedBudgets[currentBudgetIndex];
    const budgetFormData = formData[currentBudget?._id] || {
        name: currentBudget?.name ? `${currentBudget.name} - Actual` : '',
        amount: currentBudget?.amount || '',
        dateEx: new Date().toISOString().split('T')[0],
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [currentBudget._id]: {
                ...budgetFormData,
                [field]: value,
            },
        }));
    };

    const isFormValid = () => {
        return (
            budgetFormData.name &&
            budgetFormData.amount &&
            budgetFormData.dateEx &&
            budgetFormData.amount > 0
        );
    };

    const handleNext = () => {
        if (currentBudgetIndex < selectedBudgets.length - 1) {
            setCurrentBudgetIndex(currentBudgetIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentBudgetIndex > 0) {
            setCurrentBudgetIndex(currentBudgetIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        try {
            // Submit all forms
            for (const budgetId of Object.keys(formData)) {
                const data = formData[budgetId];
                await onSubmit(budgetId, {
                    name: data.name,
                    amount: data.amount,
                    dateEx: new Date(data.dateEx).toISOString(),
                });
            }
            onOpenChange(false);
            setCurrentBudgetIndex(0);
            setFormData({});
        } catch (error) {
            console.error('Error submitting actual:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Register Actual</DialogTitle>
                </DialogHeader>

                {selectedBudgets.length > 0 && currentBudget && (
                    <div className="space-y-4 py-4">
                        <div className="text-sm text-muted-foreground">
                            Budget {currentBudgetIndex + 1} of {selectedBudgets.length}
                        </div>

                        <div className="bg-muted p-3 rounded">
                            <div className="text-sm font-medium">
                                From Budget: {currentBudget.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Budget Amount: {currentBudget.amount}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Actual Name</Label>
                            <Input
                                id="name"
                                value={budgetFormData.name}
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                                placeholder="Enter actual name"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={budgetFormData.amount}
                                onChange={(e) =>
                                    handleInputChange('amount', parseFloat(e.target.value) || '')
                                }
                                placeholder="Enter amount"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateEx">Date of Execution</Label>
                            <Input
                                id="dateEx"
                                type="date"
                                value={budgetFormData.dateEx}
                                onChange={(e) =>
                                    handleInputChange('dateEx', e.target.value)
                                }
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={
                                currentBudgetIndex === 0 || isSubmitting
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={
                                currentBudgetIndex ===
                                    selectedBudgets.length - 1 || isSubmitting
                            }
                        >
                            Next
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isFormValid() || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Register All'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
