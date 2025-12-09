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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Actual } from '@/services/actualService.ts';

interface RegisterTrxDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedActuals: Actual[];
    onSubmit: (actualId: string, trxData: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function RegisterTrxDialog({
    open,
    onOpenChange,
    selectedActuals,
    onSubmit,
    isSubmitting,
}: RegisterTrxDialogProps) {
    const [currentActualIndex, setCurrentActualIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});

    const currentActual = selectedActuals[currentActualIndex];
    const actualFormData = formData[currentActual?._id] || {
        name: currentActual?.name ? `${currentActual.name} - Trx` : '',
        amount: currentActual?.amount || '',
        typ: currentActual?.typ || 'income',
        dateEx: new Date().toISOString().split('T')[0],
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [currentActual._id]: {
                ...actualFormData,
                [field]: value,
            },
        }));
    };

    const isFormValid = () => {
        return (
            actualFormData.name &&
            actualFormData.amount &&
            actualFormData.dateEx &&
            actualFormData.amount > 0 &&
            actualFormData.typ
        );
    };

    const handleNext = () => {
        if (currentActualIndex < selectedActuals.length - 1) {
            setCurrentActualIndex(currentActualIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentActualIndex > 0) {
            setCurrentActualIndex(currentActualIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        try {
            // Submit all forms
            for (const actualId of Object.keys(formData)) {
                const data = formData[actualId];
                await onSubmit(actualId, {
                    name: data.name,
                    amount: data.amount,
                    typ: data.typ,
                    dateEx: new Date(data.dateEx).toISOString(),
                });
            }
            onOpenChange(false);
            setCurrentActualIndex(0);
            setFormData({});
        } catch (error) {
            console.error('Error submitting transaction:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Register Transaction from Actual</DialogTitle>
                </DialogHeader>

                {selectedActuals.length > 0 && currentActual && (
                    <div className="space-y-4 py-4">
                        <div className="text-sm text-muted-foreground">
                            Actual {currentActualIndex + 1} of {selectedActuals.length}
                        </div>

                        <div className="bg-muted p-3 rounded">
                            <div className="text-sm font-medium">
                                From Actual: {currentActual.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Amount: {currentActual.amount}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Transaction Name</Label>
                            <Input
                                id="name"
                                value={actualFormData.name}
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                                placeholder="Enter transaction name"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={actualFormData.amount}
                                onChange={(e) =>
                                    handleInputChange('amount', parseFloat(e.target.value) || '')
                                }
                                placeholder="Enter amount"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="typ">Type</Label>
                            <Select
                                value={actualFormData.typ}
                                onValueChange={(value) =>
                                    handleInputChange('typ', value)
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="typ">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateEx">Date of Execution</Label>
                            <Input
                                id="dateEx"
                                type="date"
                                value={actualFormData.dateEx}
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
                                currentActualIndex === 0 || isSubmitting
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={
                                currentActualIndex ===
                                    selectedActuals.length - 1 || isSubmitting
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
