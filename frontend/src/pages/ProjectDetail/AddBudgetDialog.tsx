import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AddBudgetDialogProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function AddBudgetDialog({
    onSubmit,
    onCancel,
    isSubmitting,
}: AddBudgetDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        note: '',
        typ: 'expense' as 'income' | 'expense' | 'other',
        amount: 0,
        dateEx: '',
        active: true,
        done: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (name === 'amount') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? 0 : parseFloat(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleTypeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            typ: value as 'income' | 'expense' | 'other'
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

        // Submit form with proper types
        onSubmit({
            name: formData.name.trim(),
            note: formData.note.trim(),
            typ: formData.typ,
            amount: Number(formData.amount),
            dateEx: new Date(formData.dateEx).toISOString(),
            active: formData.active,
            done: formData.done,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Budget Name *</Label>
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
                    <Label htmlFor="typ">Type *</Label>
                    <Select value={formData.typ} onValueChange={handleTypeChange} disabled={isSubmitting}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount">Amount </Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="0"
                        value={formData.amount || 0}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        step="0.01"
                        min="0"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dateEx">Execution Date *</Label>
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
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Budget'}
                </Button>
            </div>
        </form>
    );
}
