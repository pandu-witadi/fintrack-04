import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { NumberInput } from '../../components/number-input';

interface AddBudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    projectId: string;
}

export function AddBudgetDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
    projectId,
}: AddBudgetDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        note: '',
        typ: 'expense' as 'income' | 'expense',
        amount: 0,
        dateEx: new Date().toISOString().split('T')[0],
        active: true,
        done: false,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            alert('Budget name is required');
            return;
        }

        if (formData.amount === undefined || formData.amount === null || formData.amount < 0) {
            alert('Budget amount cannot be negative');
            return;
        }

        if (!formData.dateEx) {
            alert('Execution date is required');
            return;
        }

        try {
            await onSubmit({
                name: formData.name.trim(),
                note: formData.note.trim(),
                typ: formData.typ,
                amount: Number(formData.amount),
                dateEx: new Date(formData.dateEx).toISOString(),
                active: formData.active,
                done: formData.done,
                projectId,
            });
            // Reset form
            setFormData({
                name: '',
                note: '',
                typ: 'expense',
                amount: 0,
                dateEx: new Date().toISOString().split('T')[0],
                active: true,
                done: false,
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAmountChange = (value: number | null | undefined) => {
        setFormData(prev => ({
            ...prev,
            amount: value || 0
        }));
    };

    const handleTypeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            typ: value as 'income' | 'expense'
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Budget</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Development Costs"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="typ">type *</Label>
                            <Select value={formData.typ} onValueChange={handleTypeChange} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">income</SelectItem>
                                    <SelectItem value="expense">expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateEx">date Ex *</Label>
                            <Input
                                id="dateEx"
                                name="dateEx"
                                type="date"
                                value={formData.dateEx}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <NumberInput
                            id="amount"
                            value={formData.amount}
                            onValueChange={handleAmountChange}
                            disabled={isSubmitting}
                            decimalScale={0}
                            fixedDecimalScale={true}
                            thousandSeparator=","
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Notes</Label>
                        <Textarea
                            id="note"
                            name="note"
                            placeholder="Additional notes about this budget..."
                            value={formData.note}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <span className="text-sm">Active</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="done"
                                checked={formData.done}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <span className="text-sm">Mark as Done</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Budget'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
